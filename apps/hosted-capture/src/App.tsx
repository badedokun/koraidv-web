import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { KoraIDVProvider, VerificationFlow } from '@koraidv/react';
import type { Verification, KoraError } from '@koraidv/core';

/**
 * KoraIDV Hosted Verification page.
 *
 * A standalone, tenant-branded page served at capture.korastratum.com. The
 * tenant mints a link via POST /verification-links and presents the URL to the
 * end user (SMS / email / redirect / WebView) — no front-end code on the tenant
 * side. This page:
 *
 *   1. reads ?token= from the URL,
 *   2. GET /verification-links/:token → resolves the link into a verification
 *      the backend pre-created and bound to the link (carrying source=web +
 *      link_id), returning { verificationId, tenantId, tier, branding, ... },
 *   3. mounts the Web SDK (branded) and RESUMES that verification, and
 *   4. redirects to the link's redirectUrl on completion.
 *
 * The browser never receives a tenant credential — see
 * docs/HOSTED_VERIFICATION_URL_DESIGN.md §6.
 */

// Identity API base(s) for the resolve call. The link token is a plain random
// string with no environment marker, so a single hosted page (capture.korastratum.com)
// serves BOTH prod and sandbox by trying each identity backend in turn: prod first,
// then sandbox. A token only exists in one environment's DB — the other returns 410,
// which we treat as "not here, try the next base". Once resolved, the SDK re-derives
// its own base from the returned `environment`, so uploads go to the right backend.
//   VITE_KORAIDV_API_BASE_PROD    — prod identity (koraidv-identity) /api/v1
//   VITE_KORAIDV_API_BASE         — sandbox identity /api/v1 (legacy var name kept)
// Stable, non-secret identity resolve bases baked as defaults so the page works
// regardless of build-arg wiring; env vars override per deployment if set.
const PROD_IDENTITY_BASE = 'https://koraidv-identity-kendyplisq-uc.a.run.app/api/v1';
const SANDBOX_IDENTITY_BASE = 'https://koraidv-identity-sandbox-626704085312.us-central1.run.app/api/v1';
const RESOLVE_BASES = [
  (import.meta.env.VITE_KORAIDV_API_BASE_PROD as string | undefined) || PROD_IDENTITY_BASE,
  (import.meta.env.VITE_KORAIDV_API_BASE as string | undefined) || SANDBOX_IDENTITY_BASE,
].filter((b): b is string => !!b);

interface Branding {
  logoUrl?: string;
  primaryColor?: string;
  appName?: string;
}

interface ResolvedLink {
  verificationId: string;
  tenantId: string;
  tier?: string;
  expectedFirstName?: string;
  expectedLastName?: string;
  branding?: Branding;
  redirectUrl?: string;
  environment?: 'production' | 'sandbox';
  sessionKey?: string;
}

type Phase = 'loading' | 'ready' | 'gone' | 'error' | 'complete';

export default function App() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [link, setLink] = useState<ResolvedLink | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [finalStatus, setFinalStatus] = useState<string | null>(null);
  // The direct identity base that resolved the token. Passed to the SDK as
  // baseUrl so ALL verification calls (upload/liveness) hit the SAME backend
  // directly with the sessionKey — instead of the SDK re-deriving a gateway
  // URL from `environment` (prod's gateway rejects the identity-issued
  // sessionKey; sandbox happened to work only because its env URL IS direct).
  const [resolvedBase, setResolvedBase] = useState<string | null>(null);

  const token = useMemo(() => new URLSearchParams(window.location.search).get('token'), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setPhase('error');
        setMessage('This verification link is missing its token.');
        return;
      }
      try {
        // Try each identity backend in order; 410 means "not in this environment",
        // so fall through to the next base. Keep the last 410 body for the final
        // "link no longer valid" message if no backend recognises the token.
        let resolved: ResolvedLink | null = null;
        let matchedBase: string | null = null;
        let goneBody: { error?: string } | null = null;
        for (const base of RESOLVE_BASES) {
          const res = await fetch(`${base}/verification-links/${encodeURIComponent(token)}`);
          if (res.status === 410) {
            goneBody = await res.json().catch(() => ({}));
            continue;
          }
          if (!res.ok) throw new Error(`resolve failed (${res.status})`);
          resolved = await res.json();
          matchedBase = base; // the identity backend that owns this token
          break;
        }
        if (!cancelled) {
          if (resolved) {
            setLink(resolved);
            setResolvedBase(matchedBase);
            document.title = brandTitle(resolved.branding);
            setPhase('ready');
          } else {
            setPhase('gone');
            setMessage(goneBody?.error ?? 'This verification link is no longer valid.');
          }
        }
      } catch {
        if (!cancelled) {
          setPhase('error');
          setMessage('We could not start your verification. Please try again in a moment.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const primary = link?.branding?.primaryColor ?? '#2563EB';

  // Full theme (the SDK's Theme type requires every field); only primaryColor
  // is tenant-driven, the rest are neutral defaults.
  const theme = {
    primaryColor: primary,
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F8FAFC',
    textColor: '#1E293B',
    secondaryTextColor: '#64748B',
    errorColor: '#DC2626',
    successColor: '#16A34A',
    borderRadius: 12,
  };

  const handleComplete = (verification: Verification) => {
    setFinalStatus(String(verification.status));
    setPhase('complete');
    // Give the user a moment to see the result, then return to the tenant app.
    if (link?.redirectUrl) {
      const url = appendStatus(link.redirectUrl, verification.id, String(verification.status));
      window.setTimeout(() => {
        window.location.href = url;
      }, 2500);
    }
  };

  const handleError = (err: KoraError) => {
    setPhase('error');
    setMessage(err.message || 'Verification could not be completed.');
  };

  if (phase === 'loading') {
    return <Centered brand={link?.branding} primary={primary}>Preparing your verification…</Centered>;
  }
  if (phase === 'gone') {
    return (
      <Centered brand={link?.branding} primary={primary} title="Link no longer valid">
        {message ?? 'Please request a new verification link.'}
      </Centered>
    );
  }
  if (phase === 'error') {
    return (
      <Centered brand={link?.branding} primary={primary} title="Something went wrong">
        {message ?? 'Please try again.'}
      </Centered>
    );
  }
  if (phase === 'complete') {
    return (
      <Centered brand={link?.branding} primary={primary} title={completeTitle(finalStatus)}>
        {completeBody(finalStatus, Boolean(link?.redirectUrl))}
      </Centered>
    );
  }

  // phase === 'ready'
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px' }}>
      <BrandHeader brand={link!.branding} primary={primary} />
      <KoraIDVProvider
        apiKey={link!.sessionKey ?? ''}
        tenantId={link!.tenantId}
        config={{
          environment: link!.environment ?? 'sandbox',
          ...(resolvedBase ? { baseUrl: resolvedBase } : {}),
          theme,
        }}
      >
        <VerificationFlow
          verificationId={link!.verificationId}
          externalId="hosted"
          onComplete={handleComplete}
          onError={handleError}
          onCancel={() => setPhase('complete')}
        />
      </KoraIDVProvider>
    </div>
  );
}

function appendStatus(url: string, id: string, status: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set('verificationId', id);
    u.searchParams.set('status', status);
    return u.toString();
  } catch {
    return url;
  }
}

function completeTitle(status: string | null): string {
  switch (status) {
    case 'approved':
    case 'verified':
      return 'Identity verified';
    case 'rejected':
      return "We couldn't verify your identity";
    case 'review_required':
    case 'manual_review':
      return 'Submission under review';
    case 'expired':
      return 'Document expired';
    default:
      return 'Submission received';
  }
}

function completeBody(status: string | null, willRedirect: boolean): string {
  const tail = willRedirect ? ' Returning you to the app…' : '';
  switch (status) {
    case 'approved':
    case 'verified':
      return 'Thank you — your identity has been verified.' + tail;
    case 'rejected':
      return 'The verification did not pass. You can try again with a clearer government ID.';
    case 'review_required':
    case 'manual_review':
      return "We're reviewing your submission — usually within one business day." + tail;
    default:
      return 'Your verification has been received.' + tail;
  }
}

// brandTitle renders the tenant-branded page heading. A tenant's appName is
// usually just its company name ("BanffPay"), so we append "Identity
// Verification" to form "BanffPay Identity Verification" — unless the tenant
// already spelled out a verification-style name, in which case we use it as-is.
function brandTitle(brand?: Branding): string {
  const name = brand?.appName?.trim();
  if (!name) return 'Identity Verification';
  return /verif/i.test(name) ? name : `${name} Identity Verification`;
}

function BrandHeader({ brand, primary }: { brand?: Branding; primary: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
      {brand?.logoUrl ? (
        <img src={brand.logoUrl} alt={brand.appName ?? 'Verify'} style={{ height: 40, objectFit: 'contain' }} />
      ) : (
        <div style={{ fontSize: 20, fontWeight: 700, color: primary }}>{brandTitle(brand)}</div>
      )}
    </div>
  );
}

function Centered({
  children,
  brand,
  primary,
  title,
}: {
  children: ReactNode;
  brand?: Branding;
  primary: string;
  title?: string;
}) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        gap: 12,
      }}
    >
      <BrandHeader brand={brand} primary={primary} />
      {title && <h1 style={{ fontSize: 22, margin: 0 }}>{title}</h1>}
      <p style={{ color: '#475569', maxWidth: 420, margin: 0 }}>{children}</p>
    </div>
  );
}
