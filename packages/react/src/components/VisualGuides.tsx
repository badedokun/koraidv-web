import React, { useEffect } from 'react';
import { colors, injectKeyframes } from './styles';

/**
 * Visual Guide illustrations for capture + liveness screens.
 *
 * Web port of iOS's VisualGuides.swift (655 lines of SwiftUI Canvas
 * drawings, shipped iOS v1.7.0). Android has the same set since
 * v1.3.0 via Compose Canvas. Web shipped without any visual guides
 * until v1.8.0 — text-only prompts.
 *
 * The illustrations don't try to be pixel-perfect ports of the iOS
 * Canvas drawings; they're stylistic equivalents conveying the same
 * action signal (a card outline for a document, an arrow for "turn
 * left", a curved mouth for "smile"). Static guides render as plain
 * SVG; motion guides use CSS keyframe animations on transform-origin
 * to suggest the gesture. Lightweight — no canvas, no images, no
 * external assets, ships entirely within the bundle.
 *
 * Behind `showVisualGuides` prop on VerificationFlow (default true).
 * Customers who want a plain text-only flow pass `false` and these
 * components don't render.
 */
export type VisualGuideKind =
  | 'docFront'
  | 'docBack'
  | 'selfie'
  | 'nfcScan'
  | 'livenessTurnRight'
  | 'livenessTurnLeft'
  | 'livenessLookUp'
  | 'livenessLookDown'
  | 'livenessSmile'
  | 'livenessBlink';

/**
 * Map a backend liveness challenge type string to the matching
 * VisualGuideKind. Used by LivenessScreen to pick the right guide for
 * the current challenge. Mirrors iOS's `livenessChallengeKind(for:)`.
 */
export function visualGuideForChallenge(challengeType: string): VisualGuideKind | null {
  switch (challengeType) {
    case 'turn_left':
      return 'livenessTurnLeft';
    case 'turn_right':
      return 'livenessTurnRight';
    case 'nod_up':
      return 'livenessLookUp';
    case 'nod_down':
      return 'livenessLookDown';
    case 'smile':
      return 'livenessSmile';
    case 'blink':
      return 'livenessBlink';
    default:
      return null;
  }
}

interface VisualGuideProps {
  kind: VisualGuideKind;
  /** Square render size in CSS pixels. Default 96. */
  size?: number;
}

export function VisualGuide({ kind, size = 96 }: VisualGuideProps) {
  // Inject the keyframes the motion guides reference. Cheap (idempotent
  // by id inside injectKeyframes) so calling on every mount is fine.
  useEffect(() => {
    injectKeyframes();
  }, []);

  const common = { width: size, height: size, viewBox: '0 0 100 100' };
  const fg = colors.teal;
  const dim = 'rgba(255,255,255,0.3)';

  switch (kind) {
    case 'docFront':
      return <DocFront {...common} fg={fg} dim={dim} />;
    case 'docBack':
      return <DocBack {...common} fg={fg} dim={dim} />;
    case 'selfie':
      return <Selfie {...common} fg={fg} dim={dim} />;
    case 'nfcScan':
      return <NfcScan {...common} fg={fg} dim={dim} />;
    case 'livenessTurnLeft':
      return <HeadTurn {...common} fg={fg} dim={dim} right={false} />;
    case 'livenessTurnRight':
      return <HeadTurn {...common} fg={fg} dim={dim} right={true} />;
    case 'livenessLookUp':
      return <HeadTilt {...common} fg={fg} dim={dim} up={true} />;
    case 'livenessLookDown':
      return <HeadTilt {...common} fg={fg} dim={dim} up={false} />;
    case 'livenessSmile':
      return <Smile {...common} fg={fg} dim={dim} />;
    case 'livenessBlink':
      return <Blink {...common} fg={fg} dim={dim} />;
  }
}

// ─── Static illustrations ─────────────────────────────────────────────────

interface SvgProps {
  width: number;
  height: number;
  viewBox: string;
  fg: string;
  dim: string;
}

function DocFront({ width, height, viewBox, fg, dim }: SvgProps) {
  // ID-card outline (1.586 aspect) with portrait area + text lines.
  return (
    <svg width={width} height={height} viewBox={viewBox} fill="none">
      <rect x="8" y="26" width="84" height="48" rx="5" stroke={fg} strokeWidth="2.5" />
      <rect x="14" y="34" width="22" height="28" rx="2" fill={dim} />
      <rect x="42" y="36" width="44" height="3" rx="1.5" fill={fg} />
      <rect x="42" y="44" width="36" height="2.5" rx="1.25" fill={dim} />
      <rect x="42" y="50" width="40" height="2.5" rx="1.25" fill={dim} />
      <rect x="42" y="56" width="30" height="2.5" rx="1.25" fill={dim} />
    </svg>
  );
}

function DocBack({ width, height, viewBox, fg, dim }: SvgProps) {
  // ID-card outline with barcode + signature strip.
  return (
    <svg width={width} height={height} viewBox={viewBox} fill="none">
      <rect x="8" y="26" width="84" height="48" rx="5" stroke={fg} strokeWidth="2.5" />
      {/* Barcode stripes */}
      {[16, 19, 22, 26, 28, 32, 35, 39, 42, 46, 49, 53, 56, 60].map((x, i) => (
        <rect
          key={i}
          x={x}
          y="34"
          width={i % 3 === 0 ? 2 : 1.2}
          height="20"
          fill={fg}
        />
      ))}
      {/* Signature line */}
      <line x1="14" y1="64" x2="58" y2="64" stroke={dim} strokeWidth="1.5" />
      {/* Magnetic stripe placeholder on right */}
      <rect x="66" y="34" width="20" height="20" rx="1" fill={dim} />
    </svg>
  );
}

function Selfie({ width, height, viewBox, fg, dim }: SvgProps) {
  // Oval face guide with eyes + smile + shoulders.
  return (
    <svg width={width} height={height} viewBox={viewBox} fill="none">
      <ellipse cx="50" cy="42" rx="22" ry="28" stroke={fg} strokeWidth="2.5" />
      {/* Eyes */}
      <circle cx="42" cy="38" r="2.5" fill={fg} />
      <circle cx="58" cy="38" r="2.5" fill={fg} />
      {/* Smile */}
      <path d="M 40 50 Q 50 56 60 50" stroke={fg} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Shoulders */}
      <path d="M 18 92 Q 18 76 36 70 L 64 70 Q 82 76 82 92" stroke={dim} strokeWidth="2" fill="none" />
    </svg>
  );
}

function NfcScan({ width, height, viewBox, fg, dim }: SvgProps) {
  // Phone holding near a passport with NFC waves.
  return (
    <svg width={width} height={height} viewBox={viewBox} fill="none">
      {/* Passport */}
      <rect x="14" y="40" width="40" height="50" rx="3" stroke={dim} strokeWidth="2" />
      <circle cx="34" cy="60" r="6" stroke={dim} strokeWidth="1.5" />
      {/* Phone */}
      <rect x="62" y="22" width="26" height="52" rx="4" stroke={fg} strokeWidth="2.5" />
      <rect x="66" y="26" width="18" height="38" rx="1.5" fill={dim} opacity="0.5" />
      {/* NFC waves */}
      <path d="M 58 48 Q 52 48 50 56" stroke={fg} strokeWidth="2" fill="none" style={{ animation: 'kora-nfc-wave 1.6s ease-out infinite' }} />
      <path d="M 58 44 Q 50 44 46 56" stroke={fg} strokeWidth="2" fill="none" opacity="0.7" style={{ animation: 'kora-nfc-wave 1.6s ease-out infinite 0.3s' }} />
    </svg>
  );
}

// ─── Motion guides ────────────────────────────────────────────────────────

interface HeadTurnProps extends SvgProps {
  right: boolean;
}

function HeadTurn({ width, height, viewBox, fg, dim, right }: HeadTurnProps) {
  // Head silhouette that rotates side-to-side via CSS animation on the
  // transform on the inner <g>. Arrow above the head indicates direction.
  const arrowPath = right ? 'M 30 12 L 70 12 L 64 6 M 70 12 L 64 18' : 'M 70 12 L 30 12 L 36 6 M 30 12 L 36 18';
  return (
    <svg width={width} height={height} viewBox={viewBox} fill="none">
      {/* Direction arrow */}
      <path d={arrowPath} stroke={fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <g
        style={{
          transformOrigin: '50px 56px',
          animation: right
            ? 'kora-head-turn-right 2s ease-in-out infinite'
            : 'kora-head-turn-left 2s ease-in-out infinite',
        }}
      >
        {/* Head */}
        <ellipse cx="50" cy="55" rx="20" ry="26" stroke={fg} strokeWidth="2.5" />
        {/* Eyes */}
        <circle cx="42" cy="50" r="2" fill={fg} />
        <circle cx="58" cy="50" r="2" fill={fg} />
        {/* Nose hint */}
        <path d="M 50 54 L 50 62" stroke={dim} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

interface HeadTiltProps extends SvgProps {
  up: boolean;
}

function HeadTilt({ width, height, viewBox, fg, dim, up }: HeadTiltProps) {
  const arrowPath = up
    ? 'M 50 92 L 50 14 M 44 22 L 50 14 L 56 22'
    : 'M 50 14 L 50 92 M 44 84 L 50 92 L 56 84';
  return (
    <svg width={width} height={height} viewBox={viewBox} fill="none">
      <path d={arrowPath} stroke={fg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" fill="none" />
      <g
        style={{
          transformOrigin: '50px 56px',
          animation: up
            ? 'kora-head-tilt-up 2s ease-in-out infinite'
            : 'kora-head-tilt-down 2s ease-in-out infinite',
        }}
      >
        <ellipse cx="50" cy="55" rx="20" ry="26" stroke={fg} strokeWidth="2.5" />
        <circle cx="42" cy="50" r="2" fill={fg} />
        <circle cx="58" cy="50" r="2" fill={fg} />
        <path d="M 50 54 L 50 62" stroke={dim} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Smile({ width, height, viewBox, fg, dim }: SvgProps) {
  // Head with mouth that animates from neutral to wide smile.
  return (
    <svg width={width} height={height} viewBox={viewBox} fill="none">
      <ellipse cx="50" cy="50" rx="24" ry="30" stroke={fg} strokeWidth="2.5" />
      <circle cx="40" cy="44" r="2.5" fill={fg} />
      <circle cx="60" cy="44" r="2.5" fill={fg} />
      <path
        d="M 38 60 Q 50 68 62 60"
        stroke={fg}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        style={{ animation: 'kora-smile 2s ease-in-out infinite', transformOrigin: '50px 60px' }}
      />
      {/* dim guide line at neutral */}
      <line x1="40" y1="60" x2="60" y2="60" stroke={dim} strokeWidth="1.5" opacity="0.3" />
    </svg>
  );
}

function Blink({ width, height, viewBox, fg, dim }: SvgProps) {
  // Head with eyes that animate from open to closed.
  return (
    <svg width={width} height={height} viewBox={viewBox} fill="none">
      <ellipse cx="50" cy="50" rx="24" ry="30" stroke={fg} strokeWidth="2.5" />
      {/* Eyes: animate between circle (open) and line (closed) via SMIL */}
      <g style={{ animation: 'kora-blink 1.6s ease-in-out infinite' }}>
        <circle cx="40" cy="44" r="3" fill={fg} />
        <circle cx="60" cy="44" r="3" fill={fg} />
      </g>
      {/* Smile/mouth */}
      <path d="M 42 60 Q 50 64 58 60" stroke={dim} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
