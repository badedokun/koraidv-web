# Kora IDV Web SDK

Web SDK for identity verification with document capture, selfie capture, and liveness detection.

## Packages

| Package | Description |
|---------|-------------|
| `@koraidv/core` | Core SDK with API client and utilities |
| `@koraidv/react` | React components and hooks |

## Requirements

- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- HTTPS required for camera access

## Installation

```bash
# Core package
npm install @koraidv/core

# React components (includes core)
npm install @koraidv/react
```

## Quick Start (React)

### 1. Wrap Your App with Provider

```tsx
import { KoraIDVProvider } from '@koraidv/react';

function App() {
  return (
    <KoraIDVProvider
      apiKey="ck_live_your_api_key"
      tenantId="your-tenant-uuid"
      environment="production"
    >
      <YourApp />
    </KoraIDVProvider>
  );
}
```

### 2. Use the Verification Flow Component

```tsx
import { VerificationFlow } from '@koraidv/react';

function VerifyPage() {
  return (
    <VerificationFlow
      externalId="user-123"
      tier="standard"
      onComplete={(verification) => {
        console.log('Verification ID:', verification.id);
        console.log('Status:', verification.status);
      }}
      onError={(error) => {
        console.error('Error:', error.message);
      }}
      onCancel={() => {
        console.log('User cancelled');
      }}
    />
  );
}
```

### 3. Or Use the Hook for Custom UI

```tsx
import { useKoraIDV } from '@koraidv/react';

function CustomVerification() {
  const {
    verification,
    step,
    isLoading,
    error,
    startVerification,
    submitDocument,
    submitSelfie,
    startLiveness,
    completeLivenessChallenge,
  } = useKoraIDV();

  // Build your custom UI
}
```

## Core SDK Usage (Vanilla JS)

```typescript
import { KoraIDV } from '@koraidv/core';

const koraIdv = new KoraIDV({
  apiKey: 'ck_live_your_api_key',
  tenantId: 'your-tenant-uuid',
  environment: 'production',
});

// Start verification
const verification = await koraIdv.createVerification({
  externalId: 'user-123',
  tier: 'standard',
});

// Submit document
await koraIdv.submitDocument(verification.id, documentBlob, {
  type: 'us_passport',
  side: 'front',
});

// Submit selfie
await koraIdv.submitSelfie(verification.id, selfieBlob);

// Start liveness
const livenessSession = await koraIdv.startLiveness(verification.id);

// Complete challenges
for (const challenge of livenessSession.challenges) {
  await koraIdv.completeLivenessChallenge(
    verification.id,
    challenge.id,
    challengeImageBlob
  );
}

// Complete verification
const result = await koraIdv.completeVerification(verification.id);
```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `apiKey` | string | Your Kora IDV API key (required) |
| `tenantId` | string | Your tenant UUID (required) |
| `environment` | 'production' \| 'sandbox' | API environment |
| `documentTypes` | DocumentType[] | Allowed document types |
| `livenessMode` | 'passive' \| 'active' | Liveness check mode |
| `theme` | KoraTheme | UI customization |
| `timeout` | number | Session timeout in seconds |

## Supported Documents

### Priority 1 (v1.0)
- US Passport
- US Driver's License
- US State ID
- International Passport
- UK Passport
- EU ID Cards

### Priority 2 (v1.1)
- Ghana Card
- Nigeria NIN
- Kenya ID
- South Africa ID

## Theme Customization

```tsx
<KoraIDVProvider
  apiKey="..."
  tenantId="..."
  theme={{
    primaryColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    textColor: '#1E293B',
    secondaryTextColor: '#64748B',
    borderColor: '#E2E8F0',
    successColor: '#16A34A',
    errorColor: '#DC2626',
    warningColor: '#F59E0B',
    cornerRadius: 12,
  }}
>
```

## Error Handling

```tsx
import { KoraError, KoraErrorCode } from '@koraidv/core';

function handleError(error: KoraError) {
  switch (error.code) {
    case KoraErrorCode.NETWORK_ERROR:
      // Handle network issues
      break;
    case KoraErrorCode.CAMERA_PERMISSION_DENIED:
      // Prompt user to enable camera
      break;
    case KoraErrorCode.SESSION_EXPIRED:
      // Session timed out, restart verification
      break;
    default:
      // Show generic error
  }

  // Show recovery suggestion if available
  if (error.recoverySuggestion) {
    showMessage(error.recoverySuggestion);
  }

  // Retry if possible
  if (error.isRetryable) {
    showRetryOption();
  }
}
```

## Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 60+ |
| Firefox | 55+ |
| Safari | 11+ |
| Edge | 79+ |

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  Configuration,
  Verification,
  VerificationStatus,
  DocumentType,
  KoraError,
  LivenessSession,
  LivenessChallenge,
} from '@koraidv/core';
```

## License

Copyright 2025 Kora IDV. All rights reserved.
