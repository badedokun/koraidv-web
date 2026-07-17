# KoraIDV Web SDK — Working Sample (React)

A minimal, runnable Vite + React app wired to `@koraidv/react` (v1.10.4).
It renders the full KoraIDV verification flow — document capture, selfie,
and liveness — entirely in the browser. Use it to see the SDK working
before you integrate it into your own app.

This folder contains three docs:

| File | What it is |
|---|---|
| `README.md` (this file) | Get the sample running in ~5 minutes. |
| `INTEGRATION_GUIDE.md` | The full guide: security model, API, theming, webhooks. Read this to integrate into your own app. |
| `SETUP.md` | Deeper reference: verified toolchain, architecture notes, troubleshooting. |

---

## Prerequisites

- **Node.js 18 or newer** (20 LTS recommended) and **npm**. Check with
  `node --version`. If you don't have Node, install it from
  [nodejs.org](https://nodejs.org) or via `nvm`.
- A **modern browser with a camera** (Chrome, Firefox, Safari, or Edge).
  The verification flow uses the webcam via WebRTC.
- **KoraIDV sandbox credentials** — an API key (`sk_sandbox_…`) and your
  tenant ID. See step 3.

---

## 1. Unzip and open the folder

```bash
unzip koraidv-web-sdk-sample.zip
cd koraidv-web-sdk-sample
```

## 2. Install dependencies

This pulls `@koraidv/core` and `@koraidv/react` (plus React/Vite) from
npm:

```bash
npm install
```

## 3. Add your sandbox credentials

Copy the template and fill in your key and tenant ID:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```bash
VITE_KORAIDV_SANDBOX_API_KEY=sk_sandbox_your_key_here
VITE_KORAIDV_SANDBOX_TENANT_ID=00000000-0000-0000-0000-000000000000
```

- If you already have a KoraIDV sandbox account (e.g. from a mobile
  integration), reuse that **tenant ID** and an **`sk_sandbox_…` API key**.
- Otherwise, sign up at
  [sandbox.korastratum.com](https://sandbox.korastratum.com) and generate
  a key under **Settings**.

> Without these, the app renders a "set your credentials" screen instead
> of starting — a quick check that your config is wired correctly.
>
> **Sandbox only.** This sample puts the key in the browser to keep the
> quick-start to one command. In **production, never ship a long-lived
> key to the browser** — mint a short-lived, per-session config on your
> server and pass only that to the SDK. See §2 of `INTEGRATION_GUIDE.md`.

## 4. Run it

```bash
npm run dev
```

Open the printed URL (**http://localhost:5173**) and click
**"Start verification"**. You'll walk through:

> Consent → Country / document type → Document capture → Selfie →
> Liveness → Result

The browser will ask for camera permission the first time — allow it.
When the flow finishes, the on-page **Status** panel shows the returned
`Verification` object (status + scores).

> **Camera needs a secure context.** `http://localhost` works in every
> browser. A plain `http://192.168.x.x` LAN address will **not** — the
> browser blocks camera access. To test on a phone, serve over HTTPS
> (see `SETUP.md`).

## 5. Production build (optional)

Type-check and produce an optimized bundle:

```bash
npm run build      # outputs ./dist
npm run preview    # serves the built bundle locally
```

---

## Next steps

- **Integrate into your own app** → follow `INTEGRATION_GUIDE.md`
  (installation, the server-mint security pattern, `<VerificationFlow>`
  props, result/webhook handling, theming).
- **Questions / a hosted no-code option** → contact your KoraIDV
  representative.
