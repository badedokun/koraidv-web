# koraidv-react-example — Step-by-step integration

A working Vite + React 19 integration of `@koraidv/react`. This is the
reference we use to validate the web SDK end-to-end and keep the hosted
docs honest. Every step below was run on macOS with the toolchain
recorded under **Verified environment** and produced a clean dev server
plus a clean production bundle.

If you're integrating the SDK into your own web app and hit issues, diff
your `package.json`, `vite.config.ts`, and `src/App.tsx` against this
example first.

---

## Verified environment

| Tool | Version |
|---|---|
| Node | 20.19.4 |
| npm | 10.8.2 |
| Vite | 8.0.13 |
| React | 19.2.6 |
| TypeScript | 6.0.2 |
| `@koraidv/core` | 1.5.2 |
| `@koraidv/react` | 1.5.2 |

Tested in Chrome 130+ on macOS. The SDK supports any browser with
WebRTC — Chrome, Firefox, Safari, Edge.

---

## 1. Create the app

```bash
npm create vite@latest koraidv-react-example -- --template react-ts --yes
cd koraidv-react-example
```

The default Vite React-TS template is sufficient. No additional plugins
needed.

## 2. Install the SDK

```bash
npm install @koraidv/react @koraidv/core
npm install --no-audit --no-fund
```

For this in-repo example the SDK packages resolve via the `koraidv-web`
workspace, so `node_modules/@koraidv/{core,react}` are symlinks to
`../../packages/{core,react}`. Downstream consumers (e.g. BanffPay) get
the published 1.5.2 from npm without workspace involvement — the
generated `package.json` already declares the right semver range.

## 3. Wire `KoraIDVProvider` + `VerificationFlow`

`src/App.tsx`:

```tsx
import { useState } from 'react';
import { KoraIDVProvider, VerificationFlow } from '@koraidv/react';
import type { Verification, KoraError } from '@koraidv/core';

const API_KEY = import.meta.env.VITE_KORAIDV_SANDBOX_API_KEY!;
const TENANT_ID = import.meta.env.VITE_KORAIDV_SANDBOX_TENANT_ID!;

function App() {
  const [externalId, setExternalId] = useState<string | null>(null);

  return (
    <KoraIDVProvider apiKey={API_KEY} tenantId={TENANT_ID} config={{ environment: 'sandbox' }}>
      {externalId === null ? (
        <button onClick={() => setExternalId(`web-${Date.now()}`)}>
          Start verification
        </button>
      ) : (
        <VerificationFlow
          externalId={externalId}
          tier="standard"
          onComplete={(v: Verification) => console.log('done', v)}
          onError={(e: KoraError) => console.error(e)}
          onCancel={() => setExternalId(null)}
        />
      )}
    </KoraIDVProvider>
  );
}

export default App;
```

See the full `src/App.tsx` in this repo for state-tracking + an error
surface.

## 4. Sandbox credentials

The example reads two Vite env vars at runtime:

```bash
# .env.local (gitignored)
VITE_KORAIDV_SANDBOX_API_KEY=sk_sandbox_...
VITE_KORAIDV_SANDBOX_TENANT_ID=00000000-0000-0000-0000-000000000000
```

Sign up at https://sandbox.korastratum.com to get a key + tenant ID.
Without these the app renders a setup-required screen instead of
booting the provider — useful for catching missing config early.

## 5. Camera access

WebRTC `getUserMedia` is the only camera path on the web. The SDK calls
it from inside `<VerificationFlow>` when the user reaches the document
or selfie capture screens.

**Requires a secure context:**

- `https://` works everywhere
- `http://localhost` works in all browsers (treated as secure)
- `http://192.168.x.x` or other LAN/non-localhost HTTP origins **will
  not work** — the browser denies camera access

For mobile testing (e.g. handing off via QR or testing the responsive
layout), serve via HTTPS:

```bash
# Use Vite's experimental HTTPS:
npm run dev -- --host --https
```

…or front the dev server with a reverse proxy that terminates TLS.

## 6. Build + run

```bash
# Development (hot reload)
npm run dev          # http://localhost:5173

# Type-check + production bundle
npm run build        # writes ./dist (≈ 215 KB JS, 67 KB gzipped)

# Preview the production bundle
npm run preview
```

Expected dev server boot:

```
  VITE v8.0.13  ready in 129 ms
  ➜  Local:   http://localhost:5173/
```

Expected production build:

```
✓ 24 modules transformed.
dist/index.html                   0.47 kB │ gzip:  0.31 kB
dist/assets/index-…  .css         2.77 kB │ gzip:  1.13 kB
dist/assets/index-…  .js        211.97 kB │ gzip: 67.21 kB
✓ built in ~400ms
```

## 7. What the user actually sees

1. **Provider configures** — `<KoraIDVProvider>` instantiates a `KoraIDV`
   SDK client on mount; no network call until verification starts.
2. **User clicks Start** — `<VerificationFlow>` opens a server-side
   verification session, then walks through screens:
   *Consent → Country / document type → Document capture (front, then
   back if applicable) → Selfie → Liveness → Processing → Complete.*
3. **Each capture screen** uses `navigator.mediaDevices.getUserMedia()`
   to access the camera and uploads frames to the identity service.
4. **ML happens server-side** — face matching, liveness scoring, MRZ
   parsing, anti-spoof. (Unlike the mobile SDKs which run ML
   on-device.)
5. **Result** — `onComplete` fires with a `Verification` object whose
   `status` is `passed | review | failed`.

## 8. Architectural notes vs the mobile SDKs

| | Mobile (iOS / Android / RN) | Web |
|---|---|---|
| Camera | Native (CameraX, AVFoundation) | WebRTC `getUserMedia` |
| Document detection / quality | On-device (Vision, ML Kit) | Server-side |
| Liveness scoring | On-device + server | Server-side |
| MRZ parsing | On-device | Client `MrzParser` + server confirm |
| Face match | On-device + server | Server-side |
| NFC passport reading | Supported | Not available (no browser API) |
| Anti-spoof signals | Rich (gyro, accelerometer, native frame timing) | Limited to browser-exposed signals |

For high-stakes verifications from a desktop browser, consider the
**QR handoff** screen (`<QrHandoffScreen>` in
`@koraidv/react`) — display a QR, user finishes capture on phone with
on-device ML, desktop session resumes when capture completes.

---

## Troubleshooting cheat-sheet

| Symptom | Cause | Fix |
|---|---|---|
| App renders "Set VITE_KORAIDV_SANDBOX_API_KEY…" placeholder | Env vars not picked up | Restart `npm run dev` after editing `.env.local`. Vite only reads env at startup. |
| Browser console: `NotAllowedError: Permission denied` on camera | User declined the permission prompt, or origin not HTTPS / `localhost` | Reset site permissions in browser settings; serve from `localhost` or `https://`. |
| Browser console: `NotFoundError: Requested device not found` | No webcam attached | Use a device with a camera, or hand off to mobile via the QR screen. |
| Vite build fails with `dynamic import will not move module into another chunk` warning on `@koraidv/core` | Packaging quirk in `@koraidv/react@1.5.x`; non-fatal | Safe to ignore. Tracked for fix in the next SDK release. |
| `useKoraIDV` hook throws `Must be used inside KoraIDVProvider` | Component is outside the provider tree | Move the call inside `<KoraIDVProvider>` children, or check for accidental remounts. |
| `cors` or `network error` after Start verification | Sandbox API key was issued for a different environment | Confirm the key prefix matches: `sk_sandbox_*` against `environment: 'sandbox'`. |
