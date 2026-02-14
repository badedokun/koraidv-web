import { CSSProperties } from 'react';

// ─── Color Tokens ────────────────────────────────────────────────────────────

export const colors = {
  teal: '#0D9488',
  tealDark: '#0F766E',
  tealLight: '#F0FDFA',
  cyan: '#06B6D4',
  success: '#10B981',
  successBg: '#DCFCE7',
  error: '#DC2626',
  errorBg: '#FEF2F2',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  info: '#0284C7',
  infoBg: '#EFF6FF',
  purple: '#7C3AED',

  white: '#FFFFFF',
  black: '#000000',
  darkBg: '#111111',
  surface: '#F9FAFB',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  textPrimary: '#111111',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textWhite: '#FFFFFF',
};

// ─── CSS Keyframes (injected once) ───────────────────────────────────────────

let keyframesInjected = false;

export function injectKeyframes() {
  if (keyframesInjected || typeof document === 'undefined') return;
  keyframesInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes kora-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes kora-scan {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(100%); }
    }
    @keyframes kora-rotate-ring {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes kora-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    @keyframes kora-ring1 {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes kora-ring2 {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }
    @keyframes kora-ring3 {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes kora-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// ─── Shared Styles ───────────────────────────────────────────────────────────

export const styles: Record<string, CSSProperties> = {
  // ─── Container ─────────────────────────────────────────────────────────
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: colors.white,
  },

  darkContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: colors.darkBg,
  },

  // ─── Header ────────────────────────────────────────────────────────────
  header: {
    padding: '32px 24px',
    textAlign: 'center',
  },

  iconContainer: {
    marginBottom: '20px',
  },

  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: colors.textPrimary,
    margin: 0,
  },

  subtitle: {
    fontSize: '15px',
    color: colors.textSecondary,
    margin: '8px 0 0 0',
    lineHeight: 1.5,
  },

  // ─── Content ───────────────────────────────────────────────────────────
  content: {
    flex: 1,
    padding: '0 24px',
    overflowY: 'auto',
  },

  scrollContent: {
    flex: 1,
    padding: '0 24px',
    overflowY: 'auto',
  },

  section: {
    marginBottom: '24px',
  },

  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: colors.textPrimary,
    margin: '0 0 12px 0',
  },

  // ─── Checklist ─────────────────────────────────────────────────────────
  checkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  checklistItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
  },

  checklistIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '20px',
  },

  checklistTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '2px',
  },

  checklistTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: colors.textPrimary,
  },

  checklistDescription: {
    fontSize: '13px',
    color: colors.textSecondary,
    marginTop: '2px',
  },

  // ─── Body text ─────────────────────────────────────────────────────────
  bodyText: {
    fontSize: '14px',
    color: colors.textSecondary,
    lineHeight: 1.6,
    margin: 0,
  },

  // ─── Footer ────────────────────────────────────────────────────────────
  footer: {
    padding: '16px 24px 32px',
    backgroundColor: colors.white,
  },

  darkFooter: {
    padding: '16px 24px 32px',
    backgroundColor: colors.darkBg,
  },

  // ─── Buttons ───────────────────────────────────────────────────────────
  primaryButton: {
    width: '100%',
    padding: '16px',
    fontSize: '17px',
    fontWeight: 600,
    color: colors.white,
    background: `linear-gradient(135deg, ${colors.teal}, ${colors.tealDark})`,
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },

  secondaryButton: {
    width: '100%',
    padding: '16px',
    fontSize: '17px',
    fontWeight: 600,
    color: colors.textPrimary,
    backgroundColor: 'transparent',
    border: `2px solid ${colors.border}`,
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },

  darkOutlineButton: {
    width: '100%',
    padding: '16px',
    fontSize: '17px',
    fontWeight: 600,
    color: colors.white,
    backgroundColor: 'transparent',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '16px',
    cursor: 'pointer',
  },

  textButton: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    color: colors.textSecondary,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },

  // ─── Screen header ─────────────────────────────────────────────────────
  screenHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    gap: '12px',
  },

  screenTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: colors.textPrimary,
    margin: 0,
    flex: 1,
  },

  backButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: colors.textPrimary,
    backgroundColor: colors.borderLight,
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    flexShrink: 0,
  },

  closeButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: colors.textSecondary,
    backgroundColor: colors.borderLight,
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    flexShrink: 0,
  },

  // ─── Dark header ──────────────────────────────────────────────────────
  darkScreenHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    gap: '12px',
  },

  darkScreenTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: colors.white,
    margin: 0,
    flex: 1,
    textAlign: 'center',
  },

  darkScreenSubtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    margin: '4px 0 0 0',
    textAlign: 'center',
  },

  glassCloseButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: colors.white,
    backgroundColor: 'rgba(255,255,255,0.15)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    flexShrink: 0,
    backdropFilter: 'blur(8px)',
  },

  // ─── Search bar ────────────────────────────────────────────────────────
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: colors.surface,
    borderRadius: '14px',
    border: `2px solid transparent`,
    margin: '0 0 16px 0',
  },

  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '15px',
    color: colors.textPrimary,
  },

  // ─── Country selection ─────────────────────────────────────────────────
  countryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },

  countryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px',
    backgroundColor: colors.white,
    border: `2px solid ${colors.border}`,
    borderRadius: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s',
  },

  countryCardSelected: {
    borderColor: colors.teal,
    backgroundColor: colors.tealLight,
  },

  countryFlag: {
    fontSize: '24px',
    flexShrink: 0,
  },

  countryName: {
    fontSize: '14px',
    fontWeight: 500,
    color: colors.textPrimary,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  countryCheck: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: colors.teal,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    flexShrink: 0,
  },

  // ─── Document selection ────────────────────────────────────────────────
  documentCard: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '16px',
    marginBottom: '10px',
    backgroundColor: colors.white,
    border: `2px solid ${colors.border}`,
    borderRadius: '16px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s, background-color 0.15s',
  },

  documentCardSelected: {
    borderColor: colors.teal,
    backgroundColor: colors.tealLight,
  },

  documentIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '14px',
    flexShrink: 0,
    fontSize: '24px',
  },

  documentInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },

  documentName: {
    fontSize: '15px',
    fontWeight: 600,
    color: colors.textPrimary,
  },

  documentSubtext: {
    fontSize: '13px',
    color: colors.textSecondary,
    marginTop: '2px',
  },

  documentChevron: {
    fontSize: '18px',
    color: colors.textTertiary,
    flexShrink: 0,
  },

  // ─── Capture screens ──────────────────────────────────────────────────
  captureContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: colors.darkBg,
    position: 'relative',
  },

  cameraContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },

  cameraVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  // ─── Document viewfinder ──────────────────────────────────────────────
  documentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  documentFrame: {
    width: '85%',
    maxWidth: '342px',
    aspectRatio: '1.586',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '20px',
    position: 'relative',
    backgroundColor: 'transparent',
  },

  corner: {
    position: 'absolute',
    width: '28px',
    height: '28px',
    borderColor: colors.teal,
    borderStyle: 'solid',
    borderWidth: '3px 0 0 3px',
  },

  scanLine: {
    position: 'absolute',
    left: '10px',
    right: '10px',
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${colors.teal}80, transparent)`,
    animation: 'kora-scan 2.5s ease-in-out infinite',
  },

  // ─── Selfie viewfinder ────────────────────────────────────────────────
  selfieOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  faceGuide: {
    width: '240px',
    height: '300px',
    border: '3px solid rgba(255,255,255,0.2)',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    position: 'relative',
  },

  rotatingRing: {
    position: 'absolute',
    top: '-6px',
    left: '-6px',
    right: '-6px',
    bottom: '-6px',
    borderRadius: '50%',
    border: '3px solid transparent',
    borderTopColor: colors.teal,
    borderRightColor: colors.cyan,
    animation: 'kora-rotate-ring 3s linear infinite',
  },

  // ─── Step pills ────────────────────────────────────────────────────────
  stepPillsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px 0',
  },

  stepPill: {
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600,
    border: 'none',
    cursor: 'default',
  },

  // ─── Guidance pill ─────────────────────────────────────────────────────
  guidancePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: 500,
  },

  pulsingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    animation: 'kora-pulse 1.5s ease-in-out infinite',
  },

  // ─── Review screen ────────────────────────────────────────────────────
  reviewCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '20px',
    margin: '0 24px',
  },

  reviewBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '20px',
    backgroundColor: 'rgba(16,185,129,0.15)',
    color: colors.success,
    fontSize: '13px',
    fontWeight: 600,
  },

  qualityChecks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '16px',
  },

  qualityCheck: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },

  qualityCheckIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'rgba(16,185,129,0.15)',
    color: colors.success,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },

  qualityCheckLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
  },

  // ─── Review buttons ───────────────────────────────────────────────────
  reviewButtonsRow: {
    display: 'flex',
    gap: '12px',
    padding: '24px',
  },

  // ─── Liveness ──────────────────────────────────────────────────────────
  challengeTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: colors.white,
    textAlign: 'center',
    margin: '0 32px',
  },

  challengeSubtitle: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    margin: '8px 32px 0',
  },

  countdownBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: colors.error,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 700,
    position: 'absolute',
    top: '-20px',
    left: '50%',
    transform: 'translateX(-50%)',
  },

  progressDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },

  progressDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transition: 'background-color 0.3s',
  },

  progressText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    margin: '8px 0 0 0',
  },

  // ─── Progress bar ──────────────────────────────────────────────────────
  progressBar: {
    display: 'flex',
    gap: '4px',
    padding: '12px 24px',
  },

  progressSegment: {
    flex: 1,
    height: '4px',
    borderRadius: '2px',
    transition: 'background-color 0.3s',
  },

  // ─── Processing screen ─────────────────────────────────────────────────
  processingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: colors.darkBg,
    padding: '24px',
  },

  spinnerContainer: {
    position: 'relative',
    width: '120px',
    height: '120px',
    marginBottom: '48px',
  },

  spinnerRing: {
    position: 'absolute',
    borderRadius: '50%',
    border: '2px solid transparent',
  },

  processingSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    maxWidth: '280px',
  },

  processingStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px',
  },

  processingStepIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    flexShrink: 0,
  },

  // ─── Result screens ────────────────────────────────────────────────────
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: colors.white,
  },

  resultContent: {
    flex: 1,
    padding: '32px 24px',
    textAlign: 'center',
  },

  resultIconCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: '32px',
  },

  resultIconOuterRing: {
    width: '88px',
    height: '88px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },

  resultTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: colors.textPrimary,
    margin: '0 0 8px 0',
  },

  resultSubtitle: {
    fontSize: '15px',
    color: colors.textSecondary,
    margin: '0 0 24px 0',
    lineHeight: 1.5,
  },

  // ─── Score card ────────────────────────────────────────────────────────
  scoreCard: {
    borderRadius: '20px',
    padding: '24px',
    margin: '0 0 24px 0',
    textAlign: 'center',
    color: colors.white,
  },

  scoreValue: {
    fontSize: '48px',
    fontWeight: 700,
    lineHeight: 1,
  },

  scoreBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    margin: '8px 0 16px',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  scoreProgressBg: {
    height: '6px',
    borderRadius: '3px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },

  scoreProgressFill: {
    height: '100%',
    borderRadius: '3px',
    backgroundColor: colors.white,
    transition: 'width 0.8s ease-out',
  },

  // ─── Metric rows ──────────────────────────────────────────────────────
  metricRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 16px',
    borderRadius: '14px',
    marginBottom: '8px',
    gap: '12px',
  },

  metricIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },

  metricInfo: {
    flex: 1,
  },

  metricLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: colors.textPrimary,
  },

  metricMessage: {
    fontSize: '12px',
    marginTop: '2px',
  },

  metricScore: {
    fontSize: '15px',
    fontWeight: 700,
  },

  metricBadge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '8px',
    marginLeft: '8px',
  },

  // ─── Expired document ──────────────────────────────────────────────────
  expiryCard: {
    backgroundColor: colors.surface,
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '24px',
    textAlign: 'left',
  },

  expiryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },

  expiryLabel: {
    fontSize: '13px',
    color: colors.textSecondary,
  },

  expiryValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: colors.textPrimary,
  },

  expiryBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: colors.errorBg,
    color: colors.error,
  },

  guidanceTip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px',
  },

  guidanceTipNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: colors.tealLight,
    color: colors.teal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    flexShrink: 0,
  },

  guidanceTipText: {
    fontSize: '14px',
    color: colors.textSecondary,
    lineHeight: 1.5,
    paddingTop: '4px',
  },

  // ─── Info card ─────────────────────────────────────────────────────────
  infoCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '24px',
  },

  infoCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px',
    borderBottom: `1px solid ${colors.border}`,
  },

  infoCardIcon: {
    fontSize: '20px',
  },

  infoCardTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: colors.textPrimary,
  },

  infoCardBody: {
    padding: '16px',
  },

  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },

  infoLabel: {
    fontSize: '13px',
    color: colors.textSecondary,
  },

  infoValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: colors.textPrimary,
  },

  // ─── Loading ───────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '24px',
  },

  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(13,148,136,0.15)',
    borderTopColor: colors.teal,
    borderRadius: '50%',
    animation: 'kora-spin 1s linear infinite',
  },

  loadingText: {
    fontSize: '15px',
    color: colors.textSecondary,
  },

  // ─── Error ─────────────────────────────────────────────────────────────
  errorContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    textAlign: 'center',
  },

  errorText: {
    fontSize: '16px',
    color: colors.error,
    marginBottom: '24px',
  },

  // ─── Capture footer ───────────────────────────────────────────────────
  captureFooter: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'center',
  },

  captureButton: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    border: '4px solid #FFFFFF',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
  },

  captureButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
  },

  // ─── Capture instructions ─────────────────────────────────────────────
  captureInstructions: {
    textAlign: 'center',
    padding: '16px 24px',
  },

  instructionText: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
  },
};
