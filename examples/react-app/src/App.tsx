/**
 * Kora IDV — bare React + Vite integration example.
 *
 * Demonstrates the minimum wiring needed to consume @koraidv/react in a
 * stock Vite SPA:
 *   1. Wrap your tree in <KoraIDVProvider apiKey tenantId>
 *   2. Render <VerificationFlow externalId tier ... /> on demand
 *   3. Handle onComplete / onError / onCancel callbacks
 *
 * For build and run steps see ./SETUP.md.
 */

import { useState } from 'react';
import { KoraIDVProvider, VerificationFlow } from '@koraidv/react';
import type { Verification, KoraError } from '@koraidv/core';
import './App.css';

const SANDBOX_API_KEY = import.meta.env.VITE_KORAIDV_SANDBOX_API_KEY ?? '';
const SANDBOX_TENANT_ID = import.meta.env.VITE_KORAIDV_SANDBOX_TENANT_ID ?? '';

type FlowState =
  | { kind: 'idle' }
  | { kind: 'running'; externalId: string }
  | { kind: 'completed'; verification: Verification }
  | { kind: 'failed'; error: KoraError }
  | { kind: 'cancelled' };

function App() {
  const [flow, setFlow] = useState<FlowState>({ kind: 'idle' });

  const credentialsMissing = !SANDBOX_API_KEY || !SANDBOX_TENANT_ID;

  if (credentialsMissing) {
    return (
      <main className="container">
        <h1>Kora IDV — Web Example</h1>
        <p className="muted">
          Set <code>VITE_KORAIDV_SANDBOX_API_KEY</code> and{' '}
          <code>VITE_KORAIDV_SANDBOX_TENANT_ID</code> in a <code>.env.local</code>{' '}
          file (or via the shell) before running <code>npm run dev</code>.
        </p>
        <p className="muted">
          Sign up at{' '}
          <a href="https://sandbox.korastratum.com" target="_blank" rel="noreferrer">
            sandbox.korastratum.com
          </a>{' '}
          for credentials.
        </p>
      </main>
    );
  }

  return (
    <KoraIDVProvider
      apiKey={SANDBOX_API_KEY}
      tenantId={SANDBOX_TENANT_ID}
      config={{ environment: 'sandbox' }}
    >
      <main className="container">
        <header>
          <h1>Kora IDV — Web Example</h1>
          <p className="muted">
            Bare Vite + React 19 integration of <code>@koraidv/react</code>.
          </p>
        </header>

        <section className="card">
          <h2>Status</h2>
          {flow.kind === 'completed' ? (
            <div>
              <p className="mono">
                ✓ Verification {String(flow.verification.status)} — {flow.verification.id}
              </p>
              {/* The raw response is for developer inspection only. A production
                  app should read `verification.status` (+ any scores it needs)
                  and render its own result UI — never dump the response to the
                  user. Note: fraud/risk detail belongs on your server webhook,
                  not the browser. */}
              <details>
                <summary style={{ cursor: 'pointer' }}>View raw response (debug)</summary>
                <pre className="mono">{JSON.stringify(flow.verification, null, 2)}</pre>
              </details>
            </div>
          ) : flow.kind === 'failed' ? (
            <p className="mono">✗ {flow.error.message}</p>
          ) : (
            <pre className="mono">{JSON.stringify(flow, null, 2)}</pre>
          )}
        </section>

        {flow.kind === 'idle' && (
          <button
            type="button"
            onClick={() =>
              setFlow({ kind: 'running', externalId: `web-${Date.now()}` })
            }
          >
            Start verification
          </button>
        )}

        {flow.kind === 'running' && (
          <section className="card">
            <h2>Verification</h2>
            <VerificationFlow
              externalId={flow.externalId}
              tier="standard"
              onComplete={(v) => setFlow({ kind: 'completed', verification: v })}
              onError={(e) => setFlow({ kind: 'failed', error: e })}
              onCancel={() => setFlow({ kind: 'cancelled' })}
            />
          </section>
        )}

        {flow.kind !== 'idle' && flow.kind !== 'running' && (
          <button type="button" onClick={() => setFlow({ kind: 'idle' })}>
            Start again
          </button>
        )}
      </main>
    </KoraIDVProvider>
  );
}

export default App;
