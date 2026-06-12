# Kora IDV — Web (React) integration example

A bare Vite + React 19 app pre-wired against `@koraidv/react` v1.5.2.
Builds and dev-serves clean out of the box.

**→ Start with [`SETUP.md`](./SETUP.md)** for the step-by-step
integration guide: package installation, sandbox credentials, camera
permission requirements, and a troubleshooting cheat-sheet.

## Quick start

```bash
npm install

# Set sandbox credentials (sign up at https://sandbox.korastratum.com)
cat > .env.local <<EOF
VITE_KORAIDV_SANDBOX_API_KEY=sk_sandbox_...
VITE_KORAIDV_SANDBOX_TENANT_ID=00000000-0000-0000-0000-000000000000
EOF

# Dev server (Vite HMR)
npm run dev          # http://localhost:5173

# Type-check + production bundle
npm run build
```

WebRTC `getUserMedia` is the only camera path on the web — the dev
server must be reached over `http://localhost` or `https://` for the
verification flow to work. LAN IP origins over plain HTTP will be
blocked by the browser.
