// src/context/KoraIDVProvider.tsx
import { createContext, useContext, useMemo } from "react";
import { KoraIDV } from "@koraidv/core";
import { jsx } from "react/jsx-runtime";
var KoraIDVContext = createContext(null);
function KoraIDVProvider({
  apiKey,
  tenantId,
  config = {},
  children
}) {
  const sdk = useMemo(() => {
    return new KoraIDV({
      apiKey,
      tenantId,
      ...config
    });
  }, [apiKey, tenantId, config]);
  const value = useMemo(
    () => ({
      sdk,
      isConfigured: true
    }),
    [sdk]
  );
  return /* @__PURE__ */ jsx(KoraIDVContext.Provider, { value, children });
}
function useKoraIDVContext() {
  const context = useContext(KoraIDVContext);
  if (!context) {
    throw new Error("useKoraIDV must be used within a KoraIDVProvider");
  }
  return context;
}

// src/hooks/useKoraIDV.ts
import { useState, useCallback } from "react";
import {
  KoraError
} from "@koraidv/core";
function useKoraIDV() {
  const { sdk } = useKoraIDVContext();
  const [state, setState] = useState({
    step: "consent",
    verification: null,
    livenessSession: null,
    currentChallenge: null,
    completedChallenges: 0,
    isLoading: false,
    error: null
  });
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [documentFrontCaptured, setDocumentFrontCaptured] = useState(false);
  const startVerification = useCallback(
    async (externalId, tier = "standard") => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        await sdk.startVerification(
          { externalId, tier },
          {
            onStepChange: (step) => {
              setState((prev) => ({ ...prev, step }));
            },
            onComplete: (verification) => {
              setState((prev) => ({
                ...prev,
                verification,
                step: "complete",
                isLoading: false
              }));
            },
            onError: (error) => {
              setState((prev) => ({ ...prev, error, isLoading: false }));
            }
          }
        );
        setState((prev) => ({
          ...prev,
          verification: sdk.getCurrentVerification(),
          isLoading: false
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error,
          isLoading: false
        }));
      }
    },
    [sdk]
  );
  const resumeVerification = useCallback(
    async (verificationId) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        await sdk.resumeVerification(verificationId, {
          onStepChange: (step) => {
            setState((prev) => ({ ...prev, step }));
          },
          onComplete: (verification) => {
            setState((prev) => ({
              ...prev,
              verification,
              step: "complete",
              isLoading: false
            }));
          },
          onError: (error) => {
            setState((prev) => ({ ...prev, error, isLoading: false }));
          }
        });
        setState((prev) => ({
          ...prev,
          verification: sdk.getCurrentVerification(),
          isLoading: false
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error,
          isLoading: false
        }));
      }
    },
    [sdk]
  );
  const acceptConsent = useCallback(() => {
    setState((prev) => ({ ...prev, step: "document_selection" }));
  }, []);
  const selectDocumentType = useCallback((type) => {
    setSelectedDocumentType(type);
    setDocumentFrontCaptured(false);
    setState((prev) => ({ ...prev, step: "document_front" }));
  }, []);
  const checkDocumentQuality = useCallback(
    async (imageData) => {
      if (!selectedDocumentType) {
        return { success: false, qualityScore: 0, qualityIssues: ["No document type selected"], details: { textReadability: 0, faceQuality: 0, imageClarity: 0 } };
      }
      return sdk.checkDocumentQuality(imageData, selectedDocumentType);
    },
    [sdk, selectedDocumentType]
  );
  const uploadDocument = useCallback(
    async (imageData, side) => {
      if (!selectedDocumentType) return false;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await sdk.uploadDocument(imageData, side, selectedDocumentType);
        if (result.success) {
          if (side === "front") {
            setDocumentFrontCaptured(true);
            const typeInfo = await import("@koraidv/core").then(
              (m) => m.getDocumentTypeInfo(selectedDocumentType)
            );
            if (typeInfo.requiresBack) {
              setState((prev) => ({ ...prev, step: "document_back", isLoading: false }));
            } else {
              setState((prev) => ({ ...prev, step: "selfie", isLoading: false }));
            }
          } else {
            setState((prev) => ({ ...prev, step: "selfie", isLoading: false }));
          }
          return true;
        } else {
          setState((prev) => ({
            ...prev,
            error: new KoraError("QUALITY_VALIDATION_FAILED", result.qualityIssues),
            isLoading: false
          }));
          return false;
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error,
          isLoading: false
        }));
        return false;
      }
    },
    [sdk, selectedDocumentType]
  );
  const uploadSelfie = useCallback(
    async (imageData) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await sdk.uploadSelfie(imageData);
        if (result.success) {
          setState((prev) => ({ ...prev, step: "liveness", isLoading: false }));
          return true;
        } else {
          setState((prev) => ({
            ...prev,
            error: new KoraError("QUALITY_VALIDATION_FAILED", result.qualityIssues),
            isLoading: false
          }));
          return false;
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error,
          isLoading: false
        }));
        return false;
      }
    },
    [sdk]
  );
  const startLiveness = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const session = await sdk.startLivenessSession();
      setState((prev) => ({
        ...prev,
        livenessSession: session,
        currentChallenge: session.challenges[0] || null,
        completedChallenges: 0,
        isLoading: false
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error,
        isLoading: false
      }));
    }
  }, [sdk]);
  const submitChallenge = useCallback(
    async (imageData) => {
      const { currentChallenge, livenessSession } = state;
      if (!currentChallenge || !livenessSession) return false;
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const result = await sdk.submitLivenessChallenge(currentChallenge, imageData);
        if (result.passed) {
          const nextIndex = state.completedChallenges + 1;
          const nextChallenge = livenessSession.challenges[nextIndex] || null;
          setState((prev) => ({
            ...prev,
            completedChallenges: nextIndex,
            currentChallenge: nextChallenge,
            isLoading: false
          }));
          if (!nextChallenge) {
            setState((prev) => ({ ...prev, step: "processing" }));
          }
          return true;
        }
        setState((prev) => ({ ...prev, isLoading: false }));
        return false;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error,
          isLoading: false
        }));
        return false;
      }
    },
    [sdk, state]
  );
  const complete = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const verification = await sdk.completeVerification();
      setState((prev) => ({
        ...prev,
        verification,
        step: "complete",
        isLoading: false
      }));
      return verification;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error,
        isLoading: false
      }));
      return null;
    }
  }, [sdk]);
  const cancel = useCallback(() => {
    sdk.reset();
    setState({
      step: "consent",
      verification: null,
      livenessSession: null,
      currentChallenge: null,
      completedChallenges: 0,
      isLoading: false,
      error: null
    });
  }, [sdk]);
  const retry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      isLoading: false
    }));
  }, []);
  return {
    state,
    startVerification,
    resumeVerification,
    acceptConsent,
    selectDocumentType,
    checkDocumentQuality,
    uploadDocument,
    uploadSelfie,
    startLiveness,
    submitChallenge,
    complete,
    cancel,
    retry,
    sdk
  };
}

// src/components/VerificationFlow.tsx
import { useEffect as useEffect7, useState as useState6 } from "react";
import { KoraError as KoraError2, KoraErrorCode } from "@koraidv/core";

// src/components/styles.ts
var colors = {
  teal: "#0D9488",
  tealDark: "#0F766E",
  tealLight: "#F0FDFA",
  cyan: "#06B6D4",
  success: "#10B981",
  successBg: "#DCFCE7",
  error: "#DC2626",
  errorBg: "#FEF2F2",
  warning: "#D97706",
  warningBg: "#FFFBEB",
  info: "#0284C7",
  infoBg: "#EFF6FF",
  purple: "#7C3AED",
  white: "#FFFFFF",
  black: "#000000",
  darkBg: "#111111",
  surface: "#F9FAFB",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  textPrimary: "#111111",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  textWhite: "#FFFFFF"
};
var keyframesInjected = false;
function injectKeyframes() {
  if (keyframesInjected || typeof document === "undefined") return;
  keyframesInjected = true;
  const style = document.createElement("style");
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
var styles = {
  // ─── Container ─────────────────────────────────────────────────────────
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: colors.white
  },
  darkContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: colors.darkBg
  },
  // ─── Header ────────────────────────────────────────────────────────────
  header: {
    padding: "32px 24px",
    textAlign: "center"
  },
  iconContainer: {
    marginBottom: "20px"
  },
  title: {
    fontSize: "24px",
    fontWeight: 700,
    color: colors.textPrimary,
    margin: 0
  },
  subtitle: {
    fontSize: "15px",
    color: colors.textSecondary,
    margin: "8px 0 0 0",
    lineHeight: 1.5
  },
  // ─── Content ───────────────────────────────────────────────────────────
  content: {
    flex: 1,
    padding: "0 24px",
    overflowY: "auto"
  },
  scrollContent: {
    flex: 1,
    padding: "0 24px",
    overflowY: "auto"
  },
  section: {
    marginBottom: "24px"
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: colors.textPrimary,
    margin: "0 0 12px 0"
  },
  // ─── Checklist ─────────────────────────────────────────────────────────
  checkList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  checklistItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px"
  },
  checklistIconBox: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "20px"
  },
  checklistTextWrapper: {
    display: "flex",
    flexDirection: "column",
    paddingTop: "2px"
  },
  checklistTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: colors.textPrimary
  },
  checklistDescription: {
    fontSize: "13px",
    color: colors.textSecondary,
    marginTop: "2px"
  },
  // ─── Body text ─────────────────────────────────────────────────────────
  bodyText: {
    fontSize: "14px",
    color: colors.textSecondary,
    lineHeight: 1.6,
    margin: 0
  },
  // ─── Footer ────────────────────────────────────────────────────────────
  footer: {
    padding: "16px 24px 32px",
    backgroundColor: colors.white
  },
  darkFooter: {
    padding: "16px 24px 32px",
    backgroundColor: colors.darkBg
  },
  // ─── Buttons ───────────────────────────────────────────────────────────
  primaryButton: {
    width: "100%",
    padding: "16px",
    fontSize: "17px",
    fontWeight: 600,
    color: colors.white,
    background: `linear-gradient(135deg, ${colors.teal}, ${colors.tealDark})`,
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "opacity 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  secondaryButton: {
    width: "100%",
    padding: "16px",
    fontSize: "17px",
    fontWeight: 600,
    color: colors.textPrimary,
    backgroundColor: "transparent",
    border: `2px solid ${colors.border}`,
    borderRadius: "16px",
    cursor: "pointer",
    transition: "border-color 0.2s"
  },
  darkOutlineButton: {
    width: "100%",
    padding: "16px",
    fontSize: "17px",
    fontWeight: 600,
    color: colors.white,
    backgroundColor: "transparent",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "16px",
    cursor: "pointer"
  },
  textButton: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    color: colors.textSecondary,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer"
  },
  // ─── Screen header ─────────────────────────────────────────────────────
  screenHeader: {
    display: "flex",
    alignItems: "center",
    padding: "16px 24px",
    gap: "12px"
  },
  screenTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: colors.textPrimary,
    margin: 0,
    flex: 1
  },
  backButton: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    color: colors.textPrimary,
    backgroundColor: colors.borderLight,
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    flexShrink: 0
  },
  closeButton: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    color: colors.textSecondary,
    backgroundColor: colors.borderLight,
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    flexShrink: 0
  },
  // ─── Dark header ──────────────────────────────────────────────────────
  darkScreenHeader: {
    display: "flex",
    alignItems: "center",
    padding: "12px 24px",
    gap: "12px"
  },
  darkScreenTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: colors.white,
    margin: 0,
    flex: 1,
    textAlign: "center"
  },
  darkScreenSubtitle: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.6)",
    margin: "4px 0 0 0",
    textAlign: "center"
  },
  glassCloseButton: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    color: colors.white,
    backgroundColor: "rgba(255,255,255,0.15)",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    flexShrink: 0,
    backdropFilter: "blur(8px)"
  },
  // ─── Search bar ────────────────────────────────────────────────────────
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    backgroundColor: colors.surface,
    borderRadius: "14px",
    border: `2px solid transparent`,
    margin: "0 0 16px 0"
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontSize: "15px",
    color: colors.textPrimary
  },
  // ─── Country selection ─────────────────────────────────────────────────
  countryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },
  countryCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px",
    backgroundColor: colors.white,
    border: `2px solid ${colors.border}`,
    borderRadius: "14px",
    cursor: "pointer",
    textAlign: "left",
    transition: "border-color 0.15s"
  },
  countryCardSelected: {
    borderColor: colors.teal,
    backgroundColor: colors.tealLight
  },
  countryFlag: {
    fontSize: "24px",
    flexShrink: 0
  },
  countryName: {
    fontSize: "14px",
    fontWeight: 500,
    color: colors.textPrimary,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  countryCheck: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: colors.teal,
    color: colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 700,
    flexShrink: 0
  },
  // ─── Document selection ────────────────────────────────────────────────
  documentCard: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "16px",
    marginBottom: "10px",
    backgroundColor: colors.white,
    border: `2px solid ${colors.border}`,
    borderRadius: "16px",
    cursor: "pointer",
    textAlign: "left",
    transition: "border-color 0.15s, background-color 0.15s"
  },
  documentCardSelected: {
    borderColor: colors.teal,
    backgroundColor: colors.tealLight
  },
  documentIconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "14px",
    flexShrink: 0,
    fontSize: "24px"
  },
  documentInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  documentName: {
    fontSize: "15px",
    fontWeight: 600,
    color: colors.textPrimary
  },
  documentSubtext: {
    fontSize: "13px",
    color: colors.textSecondary,
    marginTop: "2px"
  },
  documentChevron: {
    fontSize: "18px",
    color: colors.textTertiary,
    flexShrink: 0
  },
  // ─── Capture screens ──────────────────────────────────────────────────
  captureContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: colors.darkBg,
    position: "relative"
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden"
  },
  cameraVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  // ─── Document viewfinder ──────────────────────────────────────────────
  documentOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  documentFrame: {
    width: "85%",
    maxWidth: "342px",
    aspectRatio: "1.586",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "20px",
    position: "relative",
    backgroundColor: "transparent"
  },
  corner: {
    position: "absolute",
    width: "28px",
    height: "28px",
    borderColor: colors.teal,
    borderStyle: "solid",
    borderWidth: "3px 0 0 3px"
  },
  scanLine: {
    position: "absolute",
    left: "10px",
    right: "10px",
    height: "2px",
    background: `linear-gradient(90deg, transparent, ${colors.teal}80, transparent)`,
    animation: "kora-scan 2.5s ease-in-out infinite"
  },
  // ─── Selfie viewfinder ────────────────────────────────────────────────
  selfieOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  faceGuide: {
    width: "240px",
    height: "300px",
    border: "3px solid rgba(255,255,255,0.2)",
    borderRadius: "50%",
    backgroundColor: "transparent",
    position: "relative"
  },
  rotatingRing: {
    position: "absolute",
    top: "-6px",
    left: "-6px",
    right: "-6px",
    bottom: "-6px",
    borderRadius: "50%",
    border: "3px solid transparent",
    borderTopColor: colors.teal,
    borderRightColor: colors.cyan,
    animation: "kora-rotate-ring 3s linear infinite"
  },
  // ─── Step pills ────────────────────────────────────────────────────────
  stepPillsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    padding: "8px 0"
  },
  stepPill: {
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
    border: "none",
    cursor: "default"
  },
  // ─── Guidance pill ─────────────────────────────────────────────────────
  guidancePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    borderRadius: "24px",
    fontSize: "14px",
    fontWeight: 500
  },
  pulsingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    animation: "kora-pulse 1.5s ease-in-out infinite"
  },
  // ─── Review screen ────────────────────────────────────────────────────
  reviewCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "20px",
    padding: "20px",
    margin: "0 24px"
  },
  reviewBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "20px",
    backgroundColor: "rgba(16,185,129,0.15)",
    color: colors.success,
    fontSize: "13px",
    fontWeight: 600
  },
  qualityChecks: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "16px"
  },
  qualityCheck: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px"
  },
  qualityCheckIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "rgba(16,185,129,0.15)",
    color: colors.success,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px"
  },
  qualityCheckLabel: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.6)"
  },
  // ─── Review buttons ───────────────────────────────────────────────────
  reviewButtonsRow: {
    display: "flex",
    gap: "12px",
    padding: "24px"
  },
  // ─── Liveness ──────────────────────────────────────────────────────────
  challengeTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: colors.white,
    textAlign: "center",
    margin: "0 32px"
  },
  challengeSubtitle: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    margin: "8px 32px 0"
  },
  countdownBadge: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: colors.error,
    color: colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: 700,
    position: "absolute",
    top: "-20px",
    left: "50%",
    transform: "translateX(-50%)"
  },
  progressDots: {
    display: "flex",
    justifyContent: "center",
    gap: "8px"
  },
  progressDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    transition: "background-color 0.3s"
  },
  progressText: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    margin: "8px 0 0 0"
  },
  // ─── Progress bar ──────────────────────────────────────────────────────
  progressBar: {
    display: "flex",
    gap: "4px",
    padding: "12px 24px"
  },
  progressSegment: {
    flex: 1,
    height: "4px",
    borderRadius: "2px",
    transition: "background-color 0.3s"
  },
  // ─── Processing screen ─────────────────────────────────────────────────
  processingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: colors.darkBg,
    padding: "24px"
  },
  spinnerContainer: {
    position: "relative",
    width: "120px",
    height: "120px",
    marginBottom: "48px"
  },
  spinnerRing: {
    position: "absolute",
    borderRadius: "50%",
    border: "2px solid transparent"
  },
  processingSteps: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
    maxWidth: "280px"
  },
  processingStep: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "15px"
  },
  processingStepIcon: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    flexShrink: 0
  },
  // ─── Result screens ────────────────────────────────────────────────────
  resultContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: colors.white
  },
  resultContent: {
    flex: 1,
    padding: "32px 24px",
    textAlign: "center"
  },
  resultIconCircle: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    fontSize: "32px"
  },
  resultIconOuterRing: {
    width: "88px",
    height: "88px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px"
  },
  resultTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: colors.textPrimary,
    margin: "0 0 8px 0"
  },
  resultSubtitle: {
    fontSize: "15px",
    color: colors.textSecondary,
    margin: "0 0 24px 0",
    lineHeight: 1.5
  },
  // ─── Score card ────────────────────────────────────────────────────────
  scoreCard: {
    borderRadius: "20px",
    padding: "24px",
    margin: "0 0 24px 0",
    textAlign: "center",
    color: colors.white
  },
  scoreValue: {
    fontSize: "48px",
    fontWeight: 700,
    lineHeight: 1
  },
  scoreBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    margin: "8px 0 16px",
    backgroundColor: "rgba(255,255,255,0.2)"
  },
  scoreProgressBg: {
    height: "6px",
    borderRadius: "3px",
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden"
  },
  scoreProgressFill: {
    height: "100%",
    borderRadius: "3px",
    backgroundColor: colors.white,
    transition: "width 0.8s ease-out"
  },
  // ─── Metric rows ──────────────────────────────────────────────────────
  metricRow: {
    display: "flex",
    alignItems: "center",
    padding: "14px 16px",
    borderRadius: "14px",
    marginBottom: "8px",
    gap: "12px"
  },
  metricIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0
  },
  metricInfo: {
    flex: 1
  },
  metricLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: colors.textPrimary
  },
  metricMessage: {
    fontSize: "12px",
    marginTop: "2px"
  },
  metricScore: {
    fontSize: "15px",
    fontWeight: 700
  },
  metricBadge: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "8px",
    marginLeft: "8px"
  },
  // ─── Expired document ──────────────────────────────────────────────────
  expiryCard: {
    backgroundColor: colors.surface,
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "24px",
    textAlign: "left"
  },
  expiryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px"
  },
  expiryLabel: {
    fontSize: "13px",
    color: colors.textSecondary
  },
  expiryValue: {
    fontSize: "14px",
    fontWeight: 600,
    color: colors.textPrimary
  },
  expiryBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: 600,
    backgroundColor: colors.errorBg,
    color: colors.error
  },
  guidanceTip: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px"
  },
  guidanceTipNumber: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: colors.tealLight,
    color: colors.teal,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 700,
    flexShrink: 0
  },
  guidanceTipText: {
    fontSize: "14px",
    color: colors.textSecondary,
    lineHeight: 1.5,
    paddingTop: "4px"
  },
  // ─── Info card ─────────────────────────────────────────────────────────
  infoCard: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: "16px",
    overflow: "hidden",
    marginBottom: "24px"
  },
  infoCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px",
    borderBottom: `1px solid ${colors.border}`
  },
  infoCardIcon: {
    fontSize: "20px"
  },
  infoCardTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: colors.textPrimary
  },
  infoCardBody: {
    padding: "16px"
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px"
  },
  infoLabel: {
    fontSize: "13px",
    color: colors.textSecondary
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: 500,
    color: colors.textPrimary
  },
  // ─── Loading ───────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "24px"
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(13,148,136,0.15)",
    borderTopColor: colors.teal,
    borderRadius: "50%",
    animation: "kora-spin 1s linear infinite"
  },
  loadingText: {
    fontSize: "15px",
    color: colors.textSecondary
  },
  // ─── Error ─────────────────────────────────────────────────────────────
  errorContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    textAlign: "center"
  },
  errorText: {
    fontSize: "16px",
    color: colors.error,
    marginBottom: "24px"
  },
  // ─── Capture footer ───────────────────────────────────────────────────
  captureFooter: {
    padding: "24px",
    display: "flex",
    justifyContent: "center"
  },
  captureButton: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    border: "4px solid #FFFFFF",
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px"
  },
  captureButtonInner: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: "#FFFFFF"
  },
  // ─── Capture instructions ─────────────────────────────────────────────
  captureInstructions: {
    textAlign: "center",
    padding: "16px 24px"
  },
  instructionText: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.8)",
    margin: 0
  }
};

// src/components/DesignSystem.tsx
import { useEffect } from "react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function StepProgressBar({ total, current, isDark = false }) {
  return /* @__PURE__ */ jsx2("div", { style: styles.progressBar, children: Array.from({ length: total }).map((_, i) => /* @__PURE__ */ jsx2(
    "div",
    {
      style: {
        ...styles.progressSegment,
        backgroundColor: i < current ? colors.teal : isDark ? "rgba(255,255,255,0.15)" : colors.border
      }
    },
    i
  )) });
}
function ScoreCard({ score, badge, gradient }) {
  return /* @__PURE__ */ jsxs("div", { style: { ...styles.scoreCard, background: gradient }, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.scoreValue, children: [
      score,
      "%"
    ] }),
    /* @__PURE__ */ jsx2("div", { style: styles.scoreBadge, children: badge }),
    /* @__PURE__ */ jsx2("div", { style: styles.scoreProgressBg, children: /* @__PURE__ */ jsx2("div", { style: { ...styles.scoreProgressFill, width: `${score}%` } }) })
  ] });
}
function ScoreMetricRow({ label, score, icon, status, message }) {
  const bgColor = status === "pass" ? colors.successBg : status === "fail" ? colors.errorBg : colors.warningBg;
  const borderColor = status === "pass" ? colors.success : status === "fail" ? colors.error : colors.warning;
  const textColor = borderColor;
  const badgeText = status === "pass" ? "PASS" : status === "fail" ? "FAIL" : "REVIEW";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        ...styles.metricRow,
        backgroundColor: bgColor,
        borderLeft: `3px solid ${borderColor}`
      },
      children: [
        /* @__PURE__ */ jsx2(
          "div",
          {
            style: {
              ...styles.metricIcon,
              backgroundColor: `${borderColor}15`
            },
            children: icon
          }
        ),
        /* @__PURE__ */ jsxs("div", { style: styles.metricInfo, children: [
          /* @__PURE__ */ jsx2("div", { style: styles.metricLabel, children: label }),
          message && /* @__PURE__ */ jsx2("div", { style: { ...styles.metricMessage, color: textColor }, children: message })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxs("span", { style: { ...styles.metricScore, color: textColor }, children: [
            score,
            "%"
          ] }),
          /* @__PURE__ */ jsx2(
            "span",
            {
              style: {
                ...styles.metricBadge,
                backgroundColor: `${borderColor}15`,
                color: textColor
              },
              children: badgeText
            }
          )
        ] })
      ]
    }
  );
}
function ProcessingScreen({ steps }) {
  useEffect(() => {
    injectKeyframes();
  }, []);
  return /* @__PURE__ */ jsxs("div", { style: styles.processingContainer, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.spinnerContainer, children: [
      /* @__PURE__ */ jsx2(
        "div",
        {
          style: {
            ...styles.spinnerRing,
            inset: "0",
            borderTopColor: `${colors.teal}40`,
            animation: "kora-ring1 3s linear infinite"
          }
        }
      ),
      /* @__PURE__ */ jsx2(
        "div",
        {
          style: {
            ...styles.spinnerRing,
            inset: "15px",
            borderRightColor: `${colors.cyan}40`,
            animation: "kora-ring2 2s linear infinite"
          }
        }
      ),
      /* @__PURE__ */ jsx2(
        "div",
        {
          style: {
            ...styles.spinnerRing,
            inset: "30px",
            borderBottomColor: `${colors.teal}40`,
            animation: "kora-ring3 1.5s linear infinite"
          }
        }
      ),
      /* @__PURE__ */ jsx2(
        "div",
        {
          style: {
            position: "absolute",
            inset: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px"
          },
          children: "\u{1F6E1}\uFE0F"
        }
      )
    ] }),
    /* @__PURE__ */ jsx2("div", { style: styles.processingSteps, children: steps.map((step, i) => /* @__PURE__ */ jsxs("div", { style: styles.processingStep, children: [
      /* @__PURE__ */ jsx2(
        "div",
        {
          style: {
            ...styles.processingStepIcon,
            backgroundColor: step.status === "done" ? colors.success : step.status === "active" ? colors.teal : "rgba(255,255,255,0.1)",
            color: step.status === "pending" ? "rgba(255,255,255,0.3)" : colors.white
          },
          children: step.status === "done" ? "\u2713" : step.status === "active" ? "\u2026" : "\xB7"
        }
      ),
      /* @__PURE__ */ jsx2(
        "span",
        {
          style: {
            color: step.status === "pending" ? "rgba(255,255,255,0.3)" : colors.white
          },
          children: step.label
        }
      )
    ] }, i)) })
  ] });
}
function computeScoreBreakdown(verification) {
  const liveness = verification.livenessVerification?.livenessScore ?? 0;
  const livenessPercent = Math.round(liveness * 100);
  const docQuality = verification.documentVerification?.authenticityScore ?? 0;
  const docPercent = Math.round(docQuality * 100);
  const nameMatch = verification.documentVerification?.firstName && verification.documentVerification?.lastName ? 100 : 0;
  const selfieMatch = verification.faceVerification?.matchScore ?? 0;
  const selfiePercent = Math.round(selfieMatch * 100);
  function getStatus(score) {
    if (score >= 75) return "pass";
    if (score >= 50) return "borderline";
    return "fail";
  }
  function getMessage(status) {
    if (status === "fail") return "Below threshold";
    if (status === "borderline") return "Requires review";
    return void 0;
  }
  const metrics = [
    {
      label: "Liveness",
      score: livenessPercent,
      icon: "\u{1F441}\uFE0F",
      status: getStatus(livenessPercent),
      message: getMessage(getStatus(livenessPercent))
    },
    {
      label: "Name Match",
      score: nameMatch,
      icon: "\u{1F4DD}",
      status: getStatus(nameMatch),
      message: getMessage(getStatus(nameMatch))
    },
    {
      label: "Document Quality",
      score: docPercent,
      icon: "\u{1F4C4}",
      status: getStatus(docPercent),
      message: getMessage(getStatus(docPercent))
    },
    {
      label: "Selfie Match",
      score: selfiePercent,
      icon: "\u{1F933}",
      status: getStatus(selfiePercent),
      message: getMessage(getStatus(selfiePercent))
    }
  ];
  return metrics;
}

// src/components/ConsentScreen.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function ConsentScreen({ onAccept, onDecline }) {
  return /* @__PURE__ */ jsxs2("div", { style: styles.container, children: [
    /* @__PURE__ */ jsx3(StepProgressBar, { total: 5, current: 1 }),
    /* @__PURE__ */ jsxs2("div", { style: styles.header, children: [
      /* @__PURE__ */ jsx3("div", { style: styles.iconContainer, children: /* @__PURE__ */ jsx3(
        "div",
        {
          style: {
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            background: `linear-gradient(135deg, ${colors.teal}, ${colors.cyan})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            fontSize: "32px"
          },
          children: "\u{1F6E1}\uFE0F"
        }
      ) }),
      /* @__PURE__ */ jsx3("h1", { style: styles.title, children: "Verify your identity" }),
      /* @__PURE__ */ jsx3("p", { style: styles.subtitle, children: "We need to confirm your identity to continue" })
    ] }),
    /* @__PURE__ */ jsxs2("div", { style: styles.content, children: [
      /* @__PURE__ */ jsxs2("div", { style: styles.checkList, children: [
        /* @__PURE__ */ jsx3(
          ConsentItem,
          {
            icon: "\u{1FAAA}",
            bgColor: colors.infoBg,
            title: "Government-issued ID",
            description: "Photo of your passport or front & back of your ID"
          }
        ),
        /* @__PURE__ */ jsx3(
          ConsentItem,
          {
            icon: "\u{1F4F8}",
            bgColor: colors.successBg,
            title: "Selfie photo",
            description: "A quick photo to match your face to your document"
          }
        ),
        /* @__PURE__ */ jsx3(
          ConsentItem,
          {
            icon: "\u2728",
            bgColor: "#F3E8FF",
            title: "Liveness check",
            description: "Follow simple prompts to confirm you're a real person"
          }
        )
      ] }),
      /* @__PURE__ */ jsx3("div", { style: { marginTop: "24px" }, children: /* @__PURE__ */ jsxs2("p", { style: styles.bodyText, children: [
        "Your data is encrypted and stored securely. We only use your information for identity verification purposes and in accordance with our",
        " ",
        /* @__PURE__ */ jsx3("span", { style: { color: colors.teal, cursor: "pointer" }, children: "privacy policy" }),
        "."
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs2("div", { style: styles.footer, children: [
      /* @__PURE__ */ jsxs2("button", { style: styles.primaryButton, onClick: onAccept, children: [
        "Get started ",
        /* @__PURE__ */ jsx3("span", { style: { fontSize: "18px" }, children: "\u2192" })
      ] }),
      /* @__PURE__ */ jsx3("button", { style: styles.textButton, onClick: onDecline, children: "Decline" })
    ] })
  ] });
}
function ConsentItem({
  icon,
  bgColor,
  title,
  description
}) {
  return /* @__PURE__ */ jsxs2("div", { style: styles.checklistItem, children: [
    /* @__PURE__ */ jsx3("div", { style: { ...styles.checklistIconBox, backgroundColor: bgColor }, children: icon }),
    /* @__PURE__ */ jsxs2("div", { style: styles.checklistTextWrapper, children: [
      /* @__PURE__ */ jsx3("span", { style: styles.checklistTitle, children: title }),
      /* @__PURE__ */ jsx3("span", { style: styles.checklistDescription, children: description })
    ] })
  ] });
}

// src/components/CountrySelectionScreen.tsx
import { useState as useState2, useMemo as useMemo2 } from "react";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function CountrySelectionScreen({ countries, onSelect, onCancel }) {
  const [selected, setSelected] = useState2(null);
  const [searchQuery, setSearchQuery] = useState2("");
  const filteredCountries = useMemo2(() => {
    const countryList = countries || [];
    if (!searchQuery.trim()) return countryList;
    const q = searchQuery.toLowerCase();
    return countryList.filter((c) => c.name.toLowerCase().includes(q));
  }, [searchQuery, countries]);
  return /* @__PURE__ */ jsxs3("div", { style: styles.container, children: [
    /* @__PURE__ */ jsx4(StepProgressBar, { total: 5, current: 2 }),
    /* @__PURE__ */ jsxs3("div", { style: styles.screenHeader, children: [
      /* @__PURE__ */ jsx4("button", { style: styles.backButton, onClick: onCancel, children: "\u2190" }),
      /* @__PURE__ */ jsx4("h1", { style: styles.screenTitle, children: "Select your country" })
    ] }),
    selected && /* @__PURE__ */ jsx4("div", { style: { padding: "0 24px 12px" }, children: /* @__PURE__ */ jsxs3(
      "div",
      {
        style: {
          ...styles.countryCard,
          ...styles.countryCardSelected,
          gridColumn: "1 / -1"
        },
        children: [
          /* @__PURE__ */ jsx4("span", { style: styles.countryFlag, children: selected.flagEmoji }),
          /* @__PURE__ */ jsx4("span", { style: styles.countryName, children: selected.name }),
          /* @__PURE__ */ jsx4("span", { style: styles.countryCheck, children: "\u2713" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx4("div", { style: { padding: "0 24px" }, children: /* @__PURE__ */ jsxs3("div", { style: styles.searchBar, children: [
      /* @__PURE__ */ jsx4("span", { style: { color: colors.textTertiary, fontSize: "16px" }, children: "\u{1F50D}" }),
      /* @__PURE__ */ jsx4(
        "input",
        {
          style: styles.searchInput,
          placeholder: "Search countries...",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value)
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx4("div", { style: { ...styles.scrollContent, flex: 1 }, children: /* @__PURE__ */ jsx4("div", { style: styles.countryGrid, children: filteredCountries.filter((c) => c.id !== selected?.id).map((country) => /* @__PURE__ */ jsxs3(
      "button",
      {
        style: styles.countryCard,
        onClick: () => setSelected(country),
        children: [
          /* @__PURE__ */ jsx4("span", { style: styles.countryFlag, children: country.flagEmoji }),
          /* @__PURE__ */ jsx4("span", { style: styles.countryName, children: country.name })
        ]
      },
      country.id
    )) }) }),
    /* @__PURE__ */ jsx4("div", { style: styles.footer, children: /* @__PURE__ */ jsx4(
      "button",
      {
        style: {
          ...styles.primaryButton,
          opacity: selected ? 1 : 0.5,
          cursor: selected ? "pointer" : "not-allowed"
        },
        onClick: () => selected && onSelect(selected),
        disabled: !selected,
        children: "Continue"
      }
    ) })
  ] });
}

// src/components/DocumentSelectionScreen.tsx
import { DocumentType as DocumentType2, getDocumentTypeInfo } from "@koraidv/core";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
var defaultDocumentTypes = [
  DocumentType2.INTERNATIONAL_PASSPORT,
  DocumentType2.US_DRIVERS_LICENSE
];
function DocumentSelectionScreen({
  documentTypes = defaultDocumentTypes,
  selectedCountry,
  onSelect,
  onCancel
}) {
  const countryDocTypes = selectedCountry?.documentTypes ? selectedCountry.documentTypes : null;
  const availableTypes = countryDocTypes || documentTypes;
  const typesToShow = availableTypes.length > 0 ? availableTypes : documentTypes;
  return /* @__PURE__ */ jsxs4("div", { style: styles.container, children: [
    /* @__PURE__ */ jsx5(StepProgressBar, { total: 5, current: 2 }),
    /* @__PURE__ */ jsxs4("div", { style: styles.screenHeader, children: [
      /* @__PURE__ */ jsx5("button", { style: styles.backButton, onClick: onCancel, children: "\u2190" }),
      /* @__PURE__ */ jsx5("h1", { style: styles.screenTitle, children: "Choose your document" })
    ] }),
    selectedCountry && /* @__PURE__ */ jsx5("div", { style: { padding: "0 24px 16px" }, children: /* @__PURE__ */ jsxs4(
      "div",
      {
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "20px",
          backgroundColor: colors.surface,
          fontSize: "13px",
          color: colors.textSecondary
        },
        children: [
          /* @__PURE__ */ jsx5("span", { children: selectedCountry.flagEmoji }),
          /* @__PURE__ */ jsx5("span", { children: selectedCountry.name })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx5("div", { style: styles.scrollContent, children: typesToShow.map((type) => {
      const info = getDocumentTypeInfo(type);
      return /* @__PURE__ */ jsxs4(
        "button",
        {
          style: styles.documentCard,
          onClick: () => onSelect(type),
          children: [
            /* @__PURE__ */ jsx5(
              "div",
              {
                style: {
                  ...styles.documentIconBox,
                  backgroundColor: colors.surface
                },
                children: getIcon(type)
              }
            ),
            /* @__PURE__ */ jsxs4("div", { style: styles.documentInfo, children: [
              /* @__PURE__ */ jsx5("span", { style: styles.documentName, children: info.displayName }),
              info.requiresBack && /* @__PURE__ */ jsx5("span", { style: styles.documentSubtext, children: "Front and back required" })
            ] }),
            /* @__PURE__ */ jsx5("span", { style: styles.documentChevron, children: "\u203A" })
          ]
        },
        type
      );
    }) })
  ] });
}
function getIcon(type) {
  if (type === DocumentType2.INTERNATIONAL_PASSPORT) {
    return "\u{1F4D5}";
  }
  if (type === DocumentType2.US_DRIVERS_LICENSE) {
    return "\u{1F697}";
  }
  return "\u{1FAAA}";
}

// src/components/DocumentCaptureScreen.tsx
import { useRef, useEffect as useEffect2, useState as useState3, useCallback as useCallback2 } from "react";
import { Fragment, jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
var qualityIssueMessages = {
  face_blurred: "Photo on document is blurry. Retake in better lighting.",
  low_resolution: "Image quality too low. Move closer to document.",
  multiple_faces: "Multiple faces detected. Only document should be in frame.",
  no_face_detected: "No photo detected on document. Ensure front is visible.",
  low_image_clarity: "Image not clear enough. Hold steady with good lighting.",
  insufficient_text: "Document not fully in frame. Ensure it's well-lit.",
  low_ocr_confidence: "Text hard to read. Try better lighting.",
  face_not_frontal: "Document appears tilted. Place on flat surface."
};
function DocumentCaptureScreen({
  side,
  documentType,
  requiresBack = true,
  onQualityCheck,
  onCapture,
  onCancel
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState3(null);
  const [isCapturing, setIsCapturing] = useState3(false);
  const [error, setError] = useState3(null);
  const [capturedImage, setCapturedImage] = useState3(null);
  const [capturedBlob, setCapturedBlob] = useState3(null);
  const [qualityResult, setQualityResult] = useState3(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState3(false);
  const [retakeCount, setRetakeCount] = useState3(0);
  useEffect2(() => {
    injectKeyframes();
  }, []);
  useEffect2(() => {
    let mounted = true;
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch {
        if (mounted) setError("Camera access denied. Please enable camera permissions.");
      }
    }
    if (!capturedImage) startCamera();
    return () => {
      mounted = false;
    };
  }, [capturedImage]);
  useEffect2(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);
  const handleCapture = useCallback2(() => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsCapturing(false);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedImage(dataUrl);
          setCapturedBlob(blob);
          stream?.getTracks().forEach((t) => t.stop());
        }
        setIsCapturing(false);
      },
      "image/jpeg",
      0.85
    );
  }, [isCapturing, stream]);
  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setQualityResult(null);
    setRetakeCount((c) => c + 1);
  };
  const handleAccept = async () => {
    if (!capturedBlob) return;
    if (onQualityCheck && !qualityResult) {
      setIsCheckingQuality(true);
      try {
        const result = await onQualityCheck(capturedBlob);
        setQualityResult(result);
        setIsCheckingQuality(false);
        if (result.qualityScore >= 60) {
          await onCapture(capturedBlob);
        }
      } catch {
        setIsCheckingQuality(false);
        await onCapture(capturedBlob);
      }
      return;
    }
    await onCapture(capturedBlob);
  };
  const handleContinueAnyway = async () => {
    if (capturedBlob) {
      await onCapture(capturedBlob);
    }
  };
  if (error) {
    return /* @__PURE__ */ jsx6("div", { style: styles.container, children: /* @__PURE__ */ jsxs5("div", { style: styles.errorContainer, children: [
      /* @__PURE__ */ jsx6("p", { style: styles.errorText, children: error }),
      /* @__PURE__ */ jsx6("button", { style: styles.primaryButton, onClick: onCancel, children: "Go Back" })
    ] }) });
  }
  if (capturedImage) {
    const qualityPassed = qualityResult && qualityResult.qualityScore >= 60;
    const qualityFailed = qualityResult && qualityResult.qualityScore < 60;
    const canContinueAnyway = qualityFailed && retakeCount >= 2;
    return /* @__PURE__ */ jsxs5("div", { style: styles.darkContainer, children: [
      /* @__PURE__ */ jsx6(StepProgressBar, { total: 5, current: 3, isDark: true }),
      /* @__PURE__ */ jsxs5("div", { style: styles.darkScreenHeader, children: [
        /* @__PURE__ */ jsx6("div", { style: { width: 40 } }),
        /* @__PURE__ */ jsx6("h1", { style: styles.darkScreenTitle, children: "Review your photo" }),
        /* @__PURE__ */ jsx6("button", { style: styles.glassCloseButton, onClick: onCancel, children: "\u2715" })
      ] }),
      /* @__PURE__ */ jsx6("div", { style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }, children: /* @__PURE__ */ jsxs5("div", { style: styles.reviewCard, children: [
        /* @__PURE__ */ jsx6(
          "img",
          {
            src: capturedImage,
            alt: "Captured document",
            style: { width: "100%", maxWidth: "300px", borderRadius: "16px", display: "block", margin: "0 auto" }
          }
        ),
        isCheckingQuality && /* @__PURE__ */ jsx6("div", { style: { textAlign: "center", marginTop: "16px" }, children: /* @__PURE__ */ jsx6("span", { style: { ...styles.reviewBadge, backgroundColor: "rgba(255,255,255,0.1)" }, children: "Checking quality..." }) }),
        qualityPassed && /* @__PURE__ */ jsxs5(Fragment, { children: [
          /* @__PURE__ */ jsx6("div", { style: { textAlign: "center", marginTop: "16px" }, children: /* @__PURE__ */ jsxs5("span", { style: styles.reviewBadge, children: [
            "\u2713 Quality score: ",
            Math.round(qualityResult.qualityScore),
            "%"
          ] }) }),
          /* @__PURE__ */ jsxs5("div", { style: styles.qualityChecks, children: [
            /* @__PURE__ */ jsx6(QualityCheck, { label: "Sharp" }),
            /* @__PURE__ */ jsx6(QualityCheck, { label: "Well-lit" }),
            /* @__PURE__ */ jsx6(QualityCheck, { label: "Readable" })
          ] })
        ] }),
        qualityFailed && /* @__PURE__ */ jsxs5(Fragment, { children: [
          /* @__PURE__ */ jsx6("div", { style: { textAlign: "center", marginTop: "16px" }, children: /* @__PURE__ */ jsxs5("span", { style: { ...styles.reviewBadge, backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444" }, children: [
            "\u26A0 Quality score: ",
            Math.round(qualityResult.qualityScore),
            "%"
          ] }) }),
          /* @__PURE__ */ jsx6("div", { style: { padding: "12px 0" }, children: qualityResult.qualityIssues.map((issue, i) => /* @__PURE__ */ jsx6("p", { style: { color: "rgba(255,255,255,0.7)", fontSize: "13px", margin: "4px 0", textAlign: "center" }, children: qualityIssueMessages[issue] || issue }, i)) })
        ] }),
        !qualityResult && !isCheckingQuality && /* @__PURE__ */ jsxs5(Fragment, { children: [
          /* @__PURE__ */ jsx6("div", { style: { textAlign: "center", marginTop: "16px" }, children: /* @__PURE__ */ jsx6("span", { style: styles.reviewBadge, children: "\u2713 Good quality" }) }),
          /* @__PURE__ */ jsxs5("div", { style: styles.qualityChecks, children: [
            /* @__PURE__ */ jsx6(QualityCheck, { label: "Sharp" }),
            /* @__PURE__ */ jsx6(QualityCheck, { label: "Well-lit" }),
            /* @__PURE__ */ jsx6(QualityCheck, { label: "No glare" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx6("div", { style: styles.reviewButtonsRow, children: qualityFailed ? /* @__PURE__ */ jsxs5(Fragment, { children: [
        /* @__PURE__ */ jsx6("button", { style: { ...styles.darkOutlineButton, flex: 1 }, onClick: handleRetake, children: "Retake" }),
        canContinueAnyway && /* @__PURE__ */ jsx6("button", { style: { ...styles.primaryButton, flex: 1 }, onClick: handleContinueAnyway, children: "Continue anyway" })
      ] }) : /* @__PURE__ */ jsxs5(Fragment, { children: [
        /* @__PURE__ */ jsx6("button", { style: { ...styles.darkOutlineButton, flex: 1 }, onClick: handleRetake, children: "Retake" }),
        /* @__PURE__ */ jsx6(
          "button",
          {
            style: { ...styles.primaryButton, flex: 1, opacity: isCheckingQuality ? 0.5 : 1 },
            onClick: handleAccept,
            disabled: isCheckingQuality,
            children: "Looks good"
          }
        )
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs5("div", { style: styles.captureContainer, children: [
    /* @__PURE__ */ jsx6(StepProgressBar, { total: 5, current: 3, isDark: true }),
    /* @__PURE__ */ jsxs5("div", { style: styles.darkScreenHeader, children: [
      /* @__PURE__ */ jsx6("div", { style: { width: 40 } }),
      /* @__PURE__ */ jsxs5("div", { style: { flex: 1, textAlign: "center" }, children: [
        /* @__PURE__ */ jsx6("h1", { style: { ...styles.darkScreenTitle, margin: 0 }, children: side === "front" ? "Front of ID" : "Back of ID" }),
        documentType && /* @__PURE__ */ jsx6("p", { style: styles.darkScreenSubtitle, children: documentType })
      ] }),
      /* @__PURE__ */ jsx6("button", { style: styles.glassCloseButton, onClick: onCancel, children: "\u2715" })
    ] }),
    /* @__PURE__ */ jsxs5("div", { style: styles.cameraContainer, children: [
      /* @__PURE__ */ jsx6("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, style: styles.cameraVideo }),
      /* @__PURE__ */ jsx6("div", { style: styles.documentOverlay, children: /* @__PURE__ */ jsxs5("div", { style: styles.documentFrame, children: [
        /* @__PURE__ */ jsx6("div", { style: { ...styles.corner, top: 0, left: 0 } }),
        /* @__PURE__ */ jsx6("div", { style: { ...styles.corner, top: 0, right: 0, transform: "rotate(90deg)" } }),
        /* @__PURE__ */ jsx6("div", { style: { ...styles.corner, bottom: 0, right: 0, transform: "rotate(180deg)" } }),
        /* @__PURE__ */ jsx6("div", { style: { ...styles.corner, bottom: 0, left: 0, transform: "rotate(270deg)" } }),
        /* @__PURE__ */ jsx6("div", { style: styles.scanLine })
      ] }) }),
      /* @__PURE__ */ jsx6("canvas", { ref: canvasRef, style: { display: "none" } })
    ] }),
    /* @__PURE__ */ jsxs5("div", { style: styles.stepPillsRow, children: [
      /* @__PURE__ */ jsx6(
        "span",
        {
          style: {
            ...styles.stepPill,
            backgroundColor: side === "front" ? colors.teal : "rgba(255,255,255,0.15)",
            color: side === "front" ? colors.white : "rgba(255,255,255,0.5)"
          },
          children: "Front"
        }
      ),
      requiresBack && /* @__PURE__ */ jsx6(
        "span",
        {
          style: {
            ...styles.stepPill,
            backgroundColor: side === "back" ? colors.teal : "rgba(255,255,255,0.15)",
            color: side === "back" ? colors.white : "rgba(255,255,255,0.5)"
          },
          children: "Back"
        }
      )
    ] }),
    /* @__PURE__ */ jsx6("div", { style: { textAlign: "center", padding: "8px 0" }, children: /* @__PURE__ */ jsxs5(
      "span",
      {
        style: {
          ...styles.guidancePill,
          backgroundColor: "rgba(13,148,136,0.15)",
          color: colors.teal
        },
        children: [
          /* @__PURE__ */ jsx6("span", { style: { ...styles.pulsingDot, backgroundColor: colors.teal } }),
          "Scanning document..."
        ]
      }
    ) }),
    /* @__PURE__ */ jsx6("div", { style: styles.captureFooter, children: /* @__PURE__ */ jsx6(
      "button",
      {
        style: { ...styles.captureButton, opacity: isCapturing ? 0.5 : 1 },
        onClick: handleCapture,
        disabled: isCapturing,
        children: /* @__PURE__ */ jsx6("div", { style: styles.captureButtonInner })
      }
    ) })
  ] });
}
function QualityCheck({ label }) {
  return /* @__PURE__ */ jsxs5("div", { style: styles.qualityCheck, children: [
    /* @__PURE__ */ jsx6("div", { style: styles.qualityCheckIcon, children: "\u2713" }),
    /* @__PURE__ */ jsx6("span", { style: styles.qualityCheckLabel, children: label })
  ] });
}

// src/components/FlipDocumentScreen.tsx
import { useEffect as useEffect3 } from "react";
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
function FlipDocumentScreen({ onContinue, onCancel }) {
  useEffect3(() => {
    injectKeyframes();
  }, []);
  return /* @__PURE__ */ jsxs6("div", { style: styles.darkContainer, children: [
    /* @__PURE__ */ jsx7(StepProgressBar, { total: 5, current: 3, isDark: true }),
    /* @__PURE__ */ jsxs6("div", { style: styles.darkScreenHeader, children: [
      /* @__PURE__ */ jsx7("div", { style: { width: 40 } }),
      /* @__PURE__ */ jsx7("h1", { style: styles.darkScreenTitle, children: "Flip your document" }),
      /* @__PURE__ */ jsx7("button", { style: styles.glassCloseButton, onClick: onCancel, children: "\u2715" })
    ] }),
    /* @__PURE__ */ jsxs6("div", { style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      gap: "32px"
    }, children: [
      /* @__PURE__ */ jsx7("div", { style: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        backgroundColor: "rgba(13,148,136,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }, children: /* @__PURE__ */ jsxs6("svg", { width: "56", height: "56", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
        /* @__PURE__ */ jsx7("path", { d: "M9 3L5 6.99H8V14H10V6.99H13L9 3Z", fill: colors.teal }),
        /* @__PURE__ */ jsx7("path", { d: "M16 17.01V10H14V17.01H11L15 21L19 17.01H16Z", fill: colors.teal })
      ] }) }),
      /* @__PURE__ */ jsxs6("div", { style: { textAlign: "center" }, children: [
        /* @__PURE__ */ jsx7("h2", { style: {
          fontSize: "22px",
          fontWeight: 700,
          color: colors.white,
          margin: "0 0 12px 0"
        }, children: "Now capture the back" }),
        /* @__PURE__ */ jsx7("p", { style: {
          fontSize: "15px",
          color: "rgba(255,255,255,0.6)",
          margin: 0,
          lineHeight: 1.6,
          maxWidth: "280px"
        }, children: "Turn your document over to the back side, then tap continue to take a photo." })
      ] }),
      /* @__PURE__ */ jsxs6("div", { style: styles.stepPillsRow, children: [
        /* @__PURE__ */ jsx7("span", { style: {
          ...styles.stepPill,
          backgroundColor: "rgba(16,185,129,0.15)",
          color: colors.success
        }, children: "\u2713 Front" }),
        /* @__PURE__ */ jsx7("span", { style: {
          ...styles.stepPill,
          backgroundColor: colors.teal,
          color: colors.white
        }, children: "Back" })
      ] })
    ] }),
    /* @__PURE__ */ jsx7("div", { style: { padding: "24px" }, children: /* @__PURE__ */ jsx7("button", { style: styles.primaryButton, onClick: onContinue, children: "Continue" }) })
  ] });
}

// src/components/SelfieCaptureScreen.tsx
import { useRef as useRef2, useEffect as useEffect4, useState as useState4, useCallback as useCallback3 } from "react";
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
function SelfieCaptureScreen({ onCapture, onCancel }) {
  const videoRef = useRef2(null);
  const canvasRef = useRef2(null);
  const [stream, setStream] = useState4(null);
  const [isCapturing, setIsCapturing] = useState4(false);
  const [error, setError] = useState4(null);
  const [capturedImage, setCapturedImage] = useState4(null);
  const [capturedBlob, setCapturedBlob] = useState4(null);
  useEffect4(() => {
    injectKeyframes();
  }, []);
  useEffect4(() => {
    let mounted = true;
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch {
        if (mounted) setError("Camera access denied. Please enable camera permissions.");
      }
    }
    if (!capturedImage) startCamera();
    return () => {
      mounted = false;
    };
  }, [capturedImage]);
  useEffect4(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);
  const handleCapture = useCallback3(() => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsCapturing(false);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedImage(dataUrl);
          setCapturedBlob(blob);
          stream?.getTracks().forEach((t) => t.stop());
        }
        setIsCapturing(false);
      },
      "image/jpeg",
      0.85
    );
  }, [isCapturing, stream]);
  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
  };
  const handleAccept = async () => {
    if (capturedBlob) {
      await onCapture(capturedBlob);
    }
  };
  if (error) {
    return /* @__PURE__ */ jsx8("div", { style: styles.container, children: /* @__PURE__ */ jsxs7("div", { style: styles.errorContainer, children: [
      /* @__PURE__ */ jsx8("p", { style: styles.errorText, children: error }),
      /* @__PURE__ */ jsx8("button", { style: styles.primaryButton, onClick: onCancel, children: "Go Back" })
    ] }) });
  }
  if (capturedImage) {
    return /* @__PURE__ */ jsxs7("div", { style: styles.darkContainer, children: [
      /* @__PURE__ */ jsx8(StepProgressBar, { total: 5, current: 4, isDark: true }),
      /* @__PURE__ */ jsxs7("div", { style: styles.darkScreenHeader, children: [
        /* @__PURE__ */ jsx8("div", { style: { width: 40 } }),
        /* @__PURE__ */ jsx8("h1", { style: styles.darkScreenTitle, children: "Does this look like you?" }),
        /* @__PURE__ */ jsx8("button", { style: styles.glassCloseButton, onClick: onCancel, children: "\u2715" })
      ] }),
      /* @__PURE__ */ jsx8("p", { style: styles.darkScreenSubtitle, children: "Check clarity and lighting" }),
      /* @__PURE__ */ jsx8("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }, children: /* @__PURE__ */ jsxs7("div", { style: { position: "relative" }, children: [
        /* @__PURE__ */ jsx8("div", { style: { width: "240px", height: "300px", borderRadius: "50%", overflow: "hidden", border: `3px solid ${colors.teal}` }, children: /* @__PURE__ */ jsx8(
          "img",
          {
            src: capturedImage,
            alt: "Selfie",
            style: { width: "100%", height: "100%", objectFit: "cover" }
          }
        ) }),
        /* @__PURE__ */ jsx8("div", { style: { textAlign: "center", marginTop: "16px" }, children: /* @__PURE__ */ jsx8("span", { style: styles.reviewBadge, children: "\u2713 Face detected" }) }),
        /* @__PURE__ */ jsxs7("div", { style: styles.qualityChecks, children: [
          /* @__PURE__ */ jsx8(QualityCheck2, { label: "Clear" }),
          /* @__PURE__ */ jsx8(QualityCheck2, { label: "Centered" }),
          /* @__PURE__ */ jsx8(QualityCheck2, { label: "Well-lit" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs7("div", { style: styles.reviewButtonsRow, children: [
        /* @__PURE__ */ jsx8("button", { style: { ...styles.darkOutlineButton, flex: 1 }, onClick: handleRetake, children: "Retake" }),
        /* @__PURE__ */ jsx8("button", { style: { ...styles.primaryButton, flex: 1 }, onClick: handleAccept, children: "Use this" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs7("div", { style: styles.captureContainer, children: [
    /* @__PURE__ */ jsx8(StepProgressBar, { total: 5, current: 4, isDark: true }),
    /* @__PURE__ */ jsxs7("div", { style: styles.darkScreenHeader, children: [
      /* @__PURE__ */ jsx8("div", { style: { width: 40 } }),
      /* @__PURE__ */ jsxs7("div", { style: { flex: 1, textAlign: "center" }, children: [
        /* @__PURE__ */ jsx8("h1", { style: { ...styles.darkScreenTitle, margin: 0, fontSize: "24px", fontWeight: 700 }, children: "Face the camera" }),
        /* @__PURE__ */ jsx8("p", { style: styles.darkScreenSubtitle, children: "Keep a neutral expression" })
      ] }),
      /* @__PURE__ */ jsx8("button", { style: styles.glassCloseButton, onClick: onCancel, children: "\u2715" })
    ] }),
    /* @__PURE__ */ jsxs7("div", { style: styles.cameraContainer, children: [
      /* @__PURE__ */ jsx8(
        "video",
        {
          ref: videoRef,
          autoPlay: true,
          playsInline: true,
          muted: true,
          style: { ...styles.cameraVideo, transform: "scaleX(-1)" }
        }
      ),
      /* @__PURE__ */ jsx8("div", { style: styles.selfieOverlay, children: /* @__PURE__ */ jsx8("div", { style: styles.faceGuide, children: /* @__PURE__ */ jsx8("div", { style: styles.rotatingRing }) }) }),
      /* @__PURE__ */ jsx8("canvas", { ref: canvasRef, style: { display: "none" } })
    ] }),
    /* @__PURE__ */ jsx8("div", { style: { textAlign: "center", padding: "8px 0" }, children: /* @__PURE__ */ jsxs7(
      "span",
      {
        style: {
          ...styles.guidancePill,
          backgroundColor: "rgba(13,148,136,0.15)",
          color: colors.teal
        },
        children: [
          /* @__PURE__ */ jsx8("span", { style: { ...styles.pulsingDot, backgroundColor: colors.teal } }),
          "Position your face in the oval"
        ]
      }
    ) }),
    /* @__PURE__ */ jsx8("div", { style: styles.captureFooter, children: /* @__PURE__ */ jsx8(
      "button",
      {
        style: { ...styles.captureButton, opacity: isCapturing ? 0.5 : 1 },
        onClick: handleCapture,
        disabled: isCapturing,
        children: /* @__PURE__ */ jsx8("div", { style: styles.captureButtonInner })
      }
    ) })
  ] });
}
function QualityCheck2({ label }) {
  return /* @__PURE__ */ jsxs7("div", { style: styles.qualityCheck, children: [
    /* @__PURE__ */ jsx8("div", { style: styles.qualityCheckIcon, children: "\u2713" }),
    /* @__PURE__ */ jsx8("span", { style: styles.qualityCheckLabel, children: label })
  ] });
}

// src/components/LivenessScreen.tsx
import { useEffect as useEffect5, useState as useState5 } from "react";
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
function LivenessScreen({
  session,
  currentChallenge,
  completedChallenges,
  onChallengeComplete,
  onStart,
  onComplete,
  onCancel
}) {
  const [countdown, setCountdown] = useState5(3);
  useEffect5(() => {
    injectKeyframes();
  }, []);
  useEffect5(() => {
    if (!session) onStart();
  }, [session, onStart]);
  useEffect5(() => {
    if (session && !currentChallenge && completedChallenges > 0) {
      onComplete();
    }
  }, [session, currentChallenge, completedChallenges, onComplete]);
  useEffect5(() => {
    if (!currentChallenge) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1e3);
    return () => clearInterval(interval);
  }, [currentChallenge?.id]);
  if (!session) {
    return /* @__PURE__ */ jsx9("div", { style: styles.darkContainer, children: /* @__PURE__ */ jsxs8("div", { style: styles.loadingContainer, children: [
      /* @__PURE__ */ jsx9("div", { style: styles.spinner }),
      /* @__PURE__ */ jsx9("p", { style: { ...styles.loadingText, color: "rgba(255,255,255,0.6)" }, children: "Starting liveness check..." })
    ] }) });
  }
  const totalChallenges = session.challenges.length;
  return /* @__PURE__ */ jsxs8("div", { style: styles.captureContainer, children: [
    /* @__PURE__ */ jsx9(StepProgressBar, { total: 5, current: 5, isDark: true }),
    /* @__PURE__ */ jsxs8("div", { style: styles.darkScreenHeader, children: [
      /* @__PURE__ */ jsx9("div", { style: { width: 40 } }),
      /* @__PURE__ */ jsx9("h1", { style: styles.darkScreenTitle, children: "Liveness Check" }),
      /* @__PURE__ */ jsx9("button", { style: styles.glassCloseButton, onClick: onCancel, children: "\u2715" })
    ] }),
    currentChallenge && /* @__PURE__ */ jsx9("div", { style: { padding: "16px 0" }, children: /* @__PURE__ */ jsx9("h2", { style: styles.challengeTitle, children: currentChallenge.instruction }) }),
    /* @__PURE__ */ jsx9("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxs8("div", { style: { position: "relative" }, children: [
      /* @__PURE__ */ jsx9("div", { style: styles.faceGuide, children: /* @__PURE__ */ jsx9(
        "svg",
        {
          style: { position: "absolute", top: "-8px", left: "-8px" },
          width: "256",
          height: "316",
          viewBox: "0 0 256 316",
          children: /* @__PURE__ */ jsx9(
            "ellipse",
            {
              cx: "128",
              cy: "158",
              rx: "124",
              ry: "154",
              fill: "none",
              stroke: colors.teal,
              strokeWidth: "5",
              strokeDasharray: `${completedChallenges / totalChallenges * 880} 880`,
              transform: "rotate(-90 128 158)",
              strokeLinecap: "round"
            }
          )
        }
      ) }),
      countdown > 0 && /* @__PURE__ */ jsx9("div", { style: styles.countdownBadge, children: countdown })
    ] }) }),
    /* @__PURE__ */ jsxs8("div", { style: { padding: "16px 0" }, children: [
      /* @__PURE__ */ jsx9("div", { style: styles.progressDots, children: session.challenges.map((_, index) => /* @__PURE__ */ jsx9(
        "div",
        {
          style: {
            ...styles.progressDot,
            backgroundColor: index < completedChallenges ? colors.success : index === completedChallenges ? colors.teal : "rgba(255,255,255,0.15)"
          }
        },
        index
      )) }),
      /* @__PURE__ */ jsxs8("p", { style: styles.progressText, children: [
        "Challenge ",
        completedChallenges + 1,
        " of ",
        totalChallenges
      ] })
    ] }),
    /* @__PURE__ */ jsx9("div", { style: { padding: "16px 24px 32px" }, children: /* @__PURE__ */ jsx9(
      "button",
      {
        style: styles.primaryButton,
        onClick: async () => {
          const canvas = document.createElement("canvas");
          canvas.width = 100;
          canvas.height = 100;
          canvas.toBlob(async (blob) => {
            if (blob) await onChallengeComplete(blob);
          });
        },
        children: "Complete Challenge"
      }
    ) })
  ] });
}

// src/components/ResultScreen.tsx
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
function ResultScreen({ verification, onDone, onRetry, resultPageMode, simplified, customMessages }) {
  const { status } = verification;
  const effectiveMode = resultPageMode ?? (simplified ? "simplified" : "detailed");
  if (effectiveMode === "simplified") {
    switch (status) {
      case "approved":
        return /* @__PURE__ */ jsx10(SimplifiedSuccess, { onDone, customMessages });
      case "rejected":
        return /* @__PURE__ */ jsx10(SimplifiedFailed, { onRetry: onRetry || onDone, customMessages });
      case "review_required":
        return /* @__PURE__ */ jsx10(SimplifiedReview, { verification, onDone, customMessages });
      case "expired":
        return /* @__PURE__ */ jsx10(SimplifiedFailed, { onRetry: onRetry || onDone, customMessages: { failedTitle: "Document Expired", failedMessage: "The document you submitted has expired. Please use a valid document." } });
      default:
        return /* @__PURE__ */ jsx10(SimplifiedSuccess, { onDone, customMessages });
    }
  }
  switch (status) {
    case "approved":
      return /* @__PURE__ */ jsx10(SuccessResult, { verification, onDone });
    case "rejected":
      return /* @__PURE__ */ jsx10(RejectedResult, { verification, onRetry: onRetry || onDone });
    case "expired":
      return /* @__PURE__ */ jsx10(ExpiredResult, { verification, onRetry: onRetry || onDone });
    case "review_required":
      return /* @__PURE__ */ jsx10(ManualReviewResult, { verification, onDone });
    default:
      return /* @__PURE__ */ jsx10(SuccessResult, { verification, onDone });
  }
}
function SuccessResult({ verification, onDone }) {
  const score = verification.riskScore ?? 84;
  const metrics = computeScoreBreakdown(verification);
  return /* @__PURE__ */ jsxs9("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs9("div", { style: styles.resultContent, children: [
      /* @__PURE__ */ jsx10(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.success}15`
          },
          children: /* @__PURE__ */ jsx10(
            "div",
            {
              style: {
                ...styles.resultIconCircle,
                background: `linear-gradient(135deg, ${colors.success}, #059669)`,
                color: colors.white,
                margin: 0
              },
              children: "\u2713"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx10("h1", { style: styles.resultTitle, children: "Verification approved" }),
      /* @__PURE__ */ jsx10("p", { style: styles.resultSubtitle, children: "Your identity has been successfully verified." }),
      /* @__PURE__ */ jsx10(
        ScoreCard,
        {
          score,
          badge: "PASSED",
          gradient: `linear-gradient(135deg, ${colors.teal}, ${colors.tealDark})`
        }
      ),
      metrics.map((m, i) => /* @__PURE__ */ jsx10(ScoreMetricRow, { ...m }, i))
    ] }),
    /* @__PURE__ */ jsx10("div", { style: styles.footer, children: /* @__PURE__ */ jsx10("button", { style: styles.primaryButton, onClick: onDone, children: "Done" }) })
  ] });
}
function RejectedResult({ verification, onRetry }) {
  const score = verification.riskScore ?? 42;
  const metrics = computeScoreBreakdown(verification);
  return /* @__PURE__ */ jsxs9("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs9("div", { style: styles.resultContent, children: [
      /* @__PURE__ */ jsx10(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.error}15`
          },
          children: /* @__PURE__ */ jsx10(
            "div",
            {
              style: {
                ...styles.resultIconCircle,
                background: `linear-gradient(135deg, ${colors.error}, #B91C1C)`,
                color: colors.white,
                margin: 0
              },
              children: "\u2715"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx10("h1", { style: styles.resultTitle, children: "Verification rejected" }),
      /* @__PURE__ */ jsx10("p", { style: styles.resultSubtitle, children: "We could not verify your identity. Please try again with a valid document." }),
      /* @__PURE__ */ jsx10(
        ScoreCard,
        {
          score,
          badge: "REJECTED",
          gradient: `linear-gradient(135deg, ${colors.error}, #B91C1C)`
        }
      ),
      metrics.map((m, i) => /* @__PURE__ */ jsx10(ScoreMetricRow, { ...m }, i))
    ] }),
    /* @__PURE__ */ jsx10("div", { style: styles.footer, children: /* @__PURE__ */ jsx10("button", { style: styles.primaryButton, onClick: onRetry, children: "Try again" }) })
  ] });
}
function ExpiredResult({ verification, onRetry }) {
  return /* @__PURE__ */ jsxs9("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs9("div", { style: styles.resultContent, children: [
      /* @__PURE__ */ jsx10(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.warning}15`,
            border: `2px solid ${colors.warning}30`
          },
          children: /* @__PURE__ */ jsx10(
            "div",
            {
              style: {
                ...styles.resultIconCircle,
                background: `linear-gradient(135deg, ${colors.warning}, #B45309)`,
                color: colors.white,
                margin: 0
              },
              children: "\u26A0"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx10("h1", { style: styles.resultTitle, children: "Document expired" }),
      /* @__PURE__ */ jsx10("p", { style: styles.resultSubtitle, children: "The document you submitted has expired. Please use a valid, non-expired document." }),
      verification.documentVerification && /* @__PURE__ */ jsxs9("div", { style: styles.expiryCard, children: [
        /* @__PURE__ */ jsxs9("div", { style: styles.expiryRow, children: [
          /* @__PURE__ */ jsx10("span", { style: styles.expiryLabel, children: "Document type" }),
          /* @__PURE__ */ jsx10("span", { style: styles.expiryValue, children: verification.documentVerification.documentType || "ID Card" })
        ] }),
        verification.documentVerification.issuingCountry && /* @__PURE__ */ jsxs9("div", { style: styles.expiryRow, children: [
          /* @__PURE__ */ jsx10("span", { style: styles.expiryLabel, children: "Country" }),
          /* @__PURE__ */ jsx10("span", { style: styles.expiryValue, children: verification.documentVerification.issuingCountry })
        ] }),
        verification.documentVerification.expirationDate && /* @__PURE__ */ jsxs9("div", { style: styles.expiryRow, children: [
          /* @__PURE__ */ jsx10("span", { style: styles.expiryLabel, children: "Expired on" }),
          /* @__PURE__ */ jsx10("span", { style: styles.expiryBadge, children: verification.documentVerification.expirationDate })
        ] })
      ] }),
      /* @__PURE__ */ jsxs9("div", { style: { textAlign: "left" }, children: [
        /* @__PURE__ */ jsx10(GuidanceTip, { number: 1, text: "Check the expiration date on your document" }),
        /* @__PURE__ */ jsx10(GuidanceTip, { number: 2, text: "Use a different document that is currently valid" }),
        /* @__PURE__ */ jsx10(GuidanceTip, { number: 3, text: "Ensure the document details are clearly visible" })
      ] })
    ] }),
    /* @__PURE__ */ jsx10("div", { style: styles.footer, children: /* @__PURE__ */ jsx10("button", { style: styles.primaryButton, onClick: onRetry, children: "Try with a valid document" }) })
  ] });
}
function ManualReviewResult({ verification, onDone }) {
  const score = verification.riskScore ?? 68;
  const metrics = computeScoreBreakdown(verification);
  return /* @__PURE__ */ jsxs9("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs9("div", { style: styles.resultContent, children: [
      /* @__PURE__ */ jsx10(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.info}15`,
            border: `2px solid ${colors.info}30`
          },
          children: /* @__PURE__ */ jsx10(
            "div",
            {
              style: {
                ...styles.resultIconCircle,
                background: `linear-gradient(135deg, ${colors.info}, #0369A1)`,
                color: colors.white,
                margin: 0
              },
              children: "\u{1F550}"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx10("h1", { style: styles.resultTitle, children: "Under review" }),
      /* @__PURE__ */ jsx10("p", { style: styles.resultSubtitle, children: "Your verification requires manual review. We'll notify you of the result." }),
      /* @__PURE__ */ jsx10(
        ScoreCard,
        {
          score,
          badge: "REVIEW",
          gradient: `linear-gradient(135deg, ${colors.info}, #0369A1)`
        }
      ),
      metrics.map((m, i) => /* @__PURE__ */ jsx10(ScoreMetricRow, { ...m }, i))
    ] }),
    /* @__PURE__ */ jsx10("div", { style: styles.footer, children: /* @__PURE__ */ jsx10("button", { style: styles.primaryButton, onClick: onDone, children: "Got it" }) })
  ] });
}
function GuidanceTip({ number, text }) {
  return /* @__PURE__ */ jsxs9("div", { style: styles.guidanceTip, children: [
    /* @__PURE__ */ jsx10("div", { style: styles.guidanceTipNumber, children: number }),
    /* @__PURE__ */ jsx10("span", { style: styles.guidanceTipText, children: text })
  ] });
}
function SimplifiedSuccess({ onDone, customMessages }) {
  return /* @__PURE__ */ jsxs9("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs9("div", { style: { ...styles.resultContent, textAlign: "center" }, children: [
      /* @__PURE__ */ jsx10(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.success}15`,
            width: 96,
            height: 96
          },
          children: /* @__PURE__ */ jsx10(
            "div",
            {
              style: {
                ...styles.resultIconCircle,
                background: `linear-gradient(135deg, ${colors.success}, #059669)`,
                color: colors.white,
                margin: 0,
                width: 64,
                height: 64,
                fontSize: 28
              },
              children: "\u2713"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx10("h1", { style: { ...styles.resultTitle, fontSize: 24, marginTop: 16 }, children: customMessages?.successTitle || "Verification Successful" }),
      /* @__PURE__ */ jsx10("p", { style: { ...styles.resultSubtitle, fontSize: 16, maxWidth: 320, margin: "8px auto 0" }, children: customMessages?.successMessage || "Your identity has been successfully verified. You can now proceed." })
    ] }),
    /* @__PURE__ */ jsx10("div", { style: styles.footer, children: /* @__PURE__ */ jsx10("button", { style: styles.primaryButton, onClick: onDone, children: "Continue" }) })
  ] });
}
function SimplifiedFailed({ onRetry, customMessages }) {
  return /* @__PURE__ */ jsxs9("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs9("div", { style: { ...styles.resultContent, textAlign: "center" }, children: [
      /* @__PURE__ */ jsx10(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.error}15`,
            width: 96,
            height: 96
          },
          children: /* @__PURE__ */ jsx10(
            "div",
            {
              style: {
                ...styles.resultIconCircle,
                background: `linear-gradient(135deg, ${colors.error}, #B91C1C)`,
                color: colors.white,
                margin: 0,
                width: 64,
                height: 64,
                fontSize: 28
              },
              children: "\u2715"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx10("h1", { style: { ...styles.resultTitle, fontSize: 24, marginTop: 16 }, children: customMessages?.failedTitle || "Verification Failed" }),
      /* @__PURE__ */ jsx10("p", { style: { ...styles.resultSubtitle, fontSize: 16, maxWidth: 320, margin: "8px auto 0" }, children: customMessages?.failedMessage || "We could not verify your identity. Please try again with a valid document." })
    ] }),
    /* @__PURE__ */ jsx10("div", { style: styles.footer, children: /* @__PURE__ */ jsx10("button", { style: styles.primaryButton, onClick: onRetry, children: "Try Again" }) })
  ] });
}
function SimplifiedReview({ verification, onDone, customMessages }) {
  return /* @__PURE__ */ jsxs9("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs9("div", { style: { ...styles.resultContent, textAlign: "center" }, children: [
      /* @__PURE__ */ jsx10(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.warning}15`,
            width: 96,
            height: 96
          },
          children: /* @__PURE__ */ jsx10(
            "div",
            {
              style: {
                ...styles.resultIconCircle,
                background: `linear-gradient(135deg, ${colors.warning}, #B45309)`,
                color: colors.white,
                margin: 0,
                width: 64,
                height: 64,
                fontSize: 28
              },
              children: "\u{1F550}"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx10("h1", { style: { ...styles.resultTitle, fontSize: 24, marginTop: 16 }, children: customMessages?.reviewTitle || "Verification Under Review" }),
      /* @__PURE__ */ jsx10("p", { style: { ...styles.resultSubtitle, fontSize: 16, maxWidth: 320, margin: "8px auto 0" }, children: customMessages?.reviewMessage || "Your verification requires additional review. We will notify you of the result." }),
      /* @__PURE__ */ jsxs9("div", { style: {
        marginTop: 24,
        padding: "12px 24px",
        backgroundColor: `${colors.info}10`,
        borderRadius: 8,
        border: `1px solid ${colors.info}30`,
        display: "inline-block"
      }, children: [
        /* @__PURE__ */ jsx10("span", { style: { fontSize: 12, color: colors.textSecondary }, children: "Reference: " }),
        /* @__PURE__ */ jsx10("span", { style: { fontSize: 14, fontWeight: 600, fontFamily: "monospace" }, children: verification.id.slice(0, 8) })
      ] })
    ] }),
    /* @__PURE__ */ jsx10("div", { style: styles.footer, children: /* @__PURE__ */ jsx10("button", { style: styles.primaryButton, onClick: onDone, children: "Got It" }) })
  ] });
}

// src/components/ErrorScreen.tsx
import { jsx as jsx11, jsxs as jsxs10 } from "react/jsx-runtime";
function ErrorScreen({ error, onRetry, onCancel }) {
  return /* @__PURE__ */ jsxs10("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs10("div", { style: styles.resultContent, children: [
      /* @__PURE__ */ jsx11(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: colors.errorBg
          },
          children: /* @__PURE__ */ jsx11(
            "div",
            {
              style: {
                ...styles.resultIconCircle,
                background: `linear-gradient(135deg, ${colors.error}, #B91C1C)`,
                color: colors.white,
                margin: 0
              },
              children: "!"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx11("h1", { style: styles.resultTitle, children: "Something went wrong" }),
      /* @__PURE__ */ jsx11("p", { style: styles.resultSubtitle, children: error.message }),
      error.recoverySuggestion && /* @__PURE__ */ jsx11("p", { style: { ...styles.bodyText, marginTop: "12px" }, children: error.recoverySuggestion })
    ] }),
    /* @__PURE__ */ jsxs10("div", { style: styles.footer, children: [
      error.isRetryable && /* @__PURE__ */ jsx11("button", { style: styles.primaryButton, onClick: onRetry, children: "Try Again" }),
      /* @__PURE__ */ jsx11("button", { style: styles.textButton, onClick: onCancel, children: "Cancel" })
    ] })
  ] });
}

// src/components/LoadingScreen.tsx
import { useEffect as useEffect6 } from "react";
import { jsx as jsx12, jsxs as jsxs11 } from "react/jsx-runtime";
function LoadingScreen({ message = "Loading..." }) {
  useEffect6(() => {
    injectKeyframes();
  }, []);
  return /* @__PURE__ */ jsx12("div", { style: styles.container, children: /* @__PURE__ */ jsxs11("div", { style: styles.loadingContainer, children: [
    /* @__PURE__ */ jsx12(
      "div",
      {
        style: {
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${colors.teal}, ${colors.tealDark})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          animation: "kora-pulse 2s ease-in-out infinite"
        },
        children: "\u{1F6E1}\uFE0F"
      }
    ),
    /* @__PURE__ */ jsx12("p", { style: styles.loadingText, children: message })
  ] }) });
}

// src/components/VerificationFlow.tsx
import { jsx as jsx13, jsxs as jsxs12 } from "react/jsx-runtime";
function VerificationFlow({
  externalId,
  tier = "standard",
  documentTypes,
  onComplete,
  onError,
  onCancel,
  className,
  style
}) {
  const {
    state,
    startVerification,
    acceptConsent,
    selectDocumentType,
    checkDocumentQuality,
    uploadDocument,
    uploadSelfie,
    startLiveness,
    submitChallenge,
    complete,
    cancel,
    retry,
    sdk
  } = useKoraIDV();
  const [selectedCountry, setSelectedCountry] = useState6(null);
  const [flowStep, setFlowStep] = useState6("consent");
  const [showFlipInstruction, setShowFlipInstruction] = useState6(true);
  const [supportedCountries, setSupportedCountries] = useState6([]);
  const [countriesLoading, setCountriesLoading] = useState6(false);
  useEffect7(() => {
    if (state.step === "document_front") {
      setShowFlipInstruction(true);
    }
  }, [state.step]);
  useEffect7(() => {
    startVerification(externalId, tier);
  }, [externalId, tier, startVerification]);
  useEffect7(() => {
    if (state.step === "complete" && state.verification && onComplete) {
      onComplete(state.verification);
    }
  }, [state.step, state.verification, onComplete]);
  useEffect7(() => {
    if (state.error && onError) {
      onError(state.error);
    }
  }, [state.error, onError]);
  const fetchCountries = async () => {
    setCountriesLoading(true);
    try {
      const countries = await sdk.getSupportedCountries();
      setSupportedCountries(
        countries.map((c) => ({
          id: c.id,
          name: c.name,
          flagEmoji: c.flagEmoji,
          documentTypes: c.documentTypes
        }))
      );
    } catch (error) {
      onError?.(
        error instanceof KoraError2 ? error : new KoraError2(KoraErrorCode.NETWORK_ERROR, "Failed to load supported countries")
      );
    } finally {
      setCountriesLoading(false);
    }
  };
  const handleCancel = () => {
    cancel();
    onCancel?.();
  };
  const handleAcceptConsent = () => {
    fetchCountries();
    setFlowStep("country_selection");
  };
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setFlowStep("flow");
    acceptConsent();
  };
  const containerStyle = {
    width: "100%",
    maxWidth: "480px",
    margin: "0 auto",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    ...style
  };
  if (state.error) {
    return /* @__PURE__ */ jsx13("div", { className, style: containerStyle, children: /* @__PURE__ */ jsx13(ErrorScreen, { error: state.error, onRetry: retry, onCancel: handleCancel }) });
  }
  if (state.isLoading && state.step !== "processing") {
    return /* @__PURE__ */ jsx13("div", { className, style: containerStyle, children: /* @__PURE__ */ jsx13(LoadingScreen, {}) });
  }
  if (flowStep === "consent" && state.step === "consent") {
    return /* @__PURE__ */ jsx13("div", { className, style: containerStyle, children: /* @__PURE__ */ jsx13(ConsentScreen, { onAccept: handleAcceptConsent, onDecline: handleCancel }) });
  }
  if (flowStep === "country_selection") {
    if (countriesLoading) {
      return /* @__PURE__ */ jsx13("div", { className, style: containerStyle, children: /* @__PURE__ */ jsx13(LoadingScreen, {}) });
    }
    return /* @__PURE__ */ jsx13("div", { className, style: containerStyle, children: /* @__PURE__ */ jsx13(
      CountrySelectionScreen,
      {
        countries: supportedCountries,
        onSelect: handleCountrySelect,
        onCancel: handleCancel
      }
    ) });
  }
  return /* @__PURE__ */ jsxs12("div", { className, style: containerStyle, children: [
    state.step === "document_selection" && /* @__PURE__ */ jsx13(
      DocumentSelectionScreen,
      {
        documentTypes,
        selectedCountry,
        onSelect: selectDocumentType,
        onCancel: handleCancel
      }
    ),
    state.step === "document_front" && /* @__PURE__ */ jsx13(
      DocumentCaptureScreen,
      {
        side: "front",
        onQualityCheck: (blob) => checkDocumentQuality(blob),
        onCapture: (imageData) => uploadDocument(imageData, "front"),
        onCancel: handleCancel
      }
    ),
    state.step === "document_back" && showFlipInstruction && /* @__PURE__ */ jsx13(
      FlipDocumentScreen,
      {
        onContinue: () => setShowFlipInstruction(false),
        onCancel: handleCancel
      }
    ),
    state.step === "document_back" && !showFlipInstruction && /* @__PURE__ */ jsx13(
      DocumentCaptureScreen,
      {
        side: "back",
        onCapture: (imageData) => uploadDocument(imageData, "back"),
        onCancel: handleCancel
      }
    ),
    state.step === "selfie" && /* @__PURE__ */ jsx13(SelfieCaptureScreen, { onCapture: uploadSelfie, onCancel: handleCancel }),
    state.step === "liveness" && /* @__PURE__ */ jsx13(
      LivenessScreen,
      {
        session: state.livenessSession,
        currentChallenge: state.currentChallenge,
        completedChallenges: state.completedChallenges,
        onChallengeComplete: submitChallenge,
        onStart: startLiveness,
        onComplete: complete,
        onCancel: handleCancel
      }
    ),
    state.step === "processing" && /* @__PURE__ */ jsx13(
      ProcessingScreen,
      {
        steps: [
          { label: "Document analyzed", status: "done" },
          { label: "Checking face match", status: "active" },
          { label: "Finalizing results", status: "pending" }
        ]
      }
    ),
    state.step === "complete" && state.verification && /* @__PURE__ */ jsx13(
      ResultScreen,
      {
        verification: state.verification,
        onDone: () => onComplete?.(state.verification),
        onRetry: retry
      }
    )
  ] });
}

// src/components/QrHandoffScreen.tsx
import { useEffect as useEffect8, useState as useState7, useRef as useRef3 } from "react";
import { jsx as jsx14, jsxs as jsxs13 } from "react/jsx-runtime";
function QrHandoffScreen({
  session,
  onMobileCaptureComplete,
  onContinueOnDevice,
  onExpired,
  onRefresh,
  eventSource
}) {
  const [timeLeft, setTimeLeft] = useState7(session.expiresIn);
  const [scanned, setScanned] = useState7(false);
  const [expired, setExpired] = useState7(false);
  const timerRef = useRef3();
  useEffect8(() => {
    setTimeLeft(session.expiresIn);
    setExpired(false);
    setScanned(false);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setExpired(true);
          onExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1e3);
    return () => clearInterval(timerRef.current);
  }, [session.token]);
  useEffect8(() => {
    if (!eventSource) return;
    const handleStatus = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === "document_required" || data.status === "selfie_required") {
          setScanned(true);
        }
      } catch {
      }
    };
    const handleComplete = () => {
      clearInterval(timerRef.current);
      onMobileCaptureComplete();
    };
    eventSource.addEventListener("status", handleStatus);
    eventSource.addEventListener("complete", handleComplete);
    return () => {
      eventSource.removeEventListener("status", handleStatus);
      eventSource.removeEventListener("complete", handleComplete);
    };
  }, [eventSource, onMobileCaptureComplete]);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const qrSize = 200;
  if (expired) {
    return /* @__PURE__ */ jsx14("div", { style: qrStyles.container, children: /* @__PURE__ */ jsxs13("div", { style: qrStyles.content, children: [
      /* @__PURE__ */ jsx14("div", { style: qrStyles.expiredIcon, children: "\u23F1" }),
      /* @__PURE__ */ jsx14("h2", { style: qrStyles.title, children: "QR Code Expired" }),
      /* @__PURE__ */ jsx14("p", { style: qrStyles.subtitle, children: "The QR code has expired. Generate a new one to continue." }),
      /* @__PURE__ */ jsx14("button", { style: qrStyles.primaryButton, onClick: onRefresh, children: "Generate New QR Code" }),
      /* @__PURE__ */ jsx14("button", { style: qrStyles.secondaryButton, onClick: onContinueOnDevice, children: "Continue on this device instead" })
    ] }) });
  }
  if (scanned) {
    return /* @__PURE__ */ jsx14("div", { style: qrStyles.container, children: /* @__PURE__ */ jsxs13("div", { style: qrStyles.content, children: [
      /* @__PURE__ */ jsx14("div", { style: qrStyles.spinnerContainer, children: /* @__PURE__ */ jsx14("div", { style: qrStyles.spinner }) }),
      /* @__PURE__ */ jsx14("h2", { style: qrStyles.title, children: "Capturing on your phone..." }),
      /* @__PURE__ */ jsx14("p", { style: qrStyles.subtitle, children: "Complete the document scan and selfie on your mobile device. This page will update automatically when done." }),
      /* @__PURE__ */ jsxs13("div", { style: qrStyles.statusBadge, children: [
        /* @__PURE__ */ jsx14("span", { style: qrStyles.statusDot }),
        "Connected \u2014 waiting for capture"
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsx14("div", { style: qrStyles.container, children: /* @__PURE__ */ jsxs13("div", { style: qrStyles.content, children: [
    /* @__PURE__ */ jsx14("h2", { style: qrStyles.title, children: "Scan with your phone" }),
    /* @__PURE__ */ jsx14("p", { style: qrStyles.subtitle, children: "Use your phone's camera for a better capture experience. Scan the QR code below to continue on your mobile device." }),
    /* @__PURE__ */ jsxs13("div", { style: qrStyles.qrContainer, children: [
      /* @__PURE__ */ jsx14("div", { style: {
        ...qrStyles.qrBox,
        width: qrSize,
        height: qrSize
      }, children: /* @__PURE__ */ jsx14(
        "img",
        {
          src: `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(session.captureUrl)}&margin=8`,
          alt: "QR Code",
          width: qrSize,
          height: qrSize,
          style: { borderRadius: 12 }
        }
      ) }),
      /* @__PURE__ */ jsxs13("div", { style: qrStyles.timer, children: [
        minutes,
        ":",
        seconds.toString().padStart(2, "0"),
        " remaining"
      ] })
    ] }),
    /* @__PURE__ */ jsxs13("div", { style: qrStyles.steps, children: [
      /* @__PURE__ */ jsx14(Step, { number: 1, text: "Open your phone's camera" }),
      /* @__PURE__ */ jsx14(Step, { number: 2, text: "Point at the QR code" }),
      /* @__PURE__ */ jsx14(Step, { number: 3, text: "Complete the capture on your phone" })
    ] }),
    /* @__PURE__ */ jsx14("div", { style: qrStyles.divider, children: /* @__PURE__ */ jsx14("span", { style: qrStyles.dividerText, children: "or" }) }),
    /* @__PURE__ */ jsx14("button", { style: qrStyles.secondaryButton, onClick: onContinueOnDevice, children: "Continue on this device" })
  ] }) });
}
function Step({ number, text }) {
  return /* @__PURE__ */ jsxs13("div", { style: qrStyles.step, children: [
    /* @__PURE__ */ jsx14("div", { style: qrStyles.stepNumber, children: number }),
    /* @__PURE__ */ jsx14("span", { style: qrStyles.stepText, children: text })
  ] });
}
var qrStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100%",
    padding: 24,
    fontFamily: "Inter, system-ui, sans-serif"
  },
  content: {
    textAlign: "center",
    maxWidth: 400,
    width: "100%"
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: "1.5",
    marginBottom: 24
  },
  qrContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    marginBottom: 24
  },
  qrBox: {
    padding: 16,
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb"
  },
  timer: {
    fontSize: 13,
    color: "#9ca3af",
    fontVariantNumeric: "tabular-nums"
  },
  steps: {
    textAlign: "left",
    marginBottom: 24
  },
  step: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    background: `${colors.teal}15`,
    color: colors.teal,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0
  },
  stepText: {
    fontSize: 14,
    color: "#374151"
  },
  divider: {
    position: "relative",
    textAlign: "center",
    margin: "16px 0",
    borderTop: "1px solid #e5e7eb"
  },
  dividerText: {
    position: "relative",
    top: -10,
    background: "#f9fafb",
    padding: "0 12px",
    fontSize: 13,
    color: "#9ca3af"
  },
  primaryButton: {
    width: "100%",
    padding: "12px 24px",
    fontSize: 15,
    fontWeight: 600,
    color: "#ffffff",
    background: colors.teal,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    marginBottom: 12
  },
  secondaryButton: {
    width: "100%",
    padding: "12px 24px",
    fontSize: 14,
    fontWeight: 500,
    color: "#6b7280",
    background: "transparent",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    cursor: "pointer"
  },
  expiredIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  spinnerContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 16
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: `3px solid ${colors.teal}30`,
    borderTopColor: colors.teal,
    animation: "spin 1s linear infinite"
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    background: `${colors.teal}10`,
    borderRadius: 20,
    fontSize: 13,
    color: colors.teal,
    fontWeight: 500,
    marginTop: 16
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    background: colors.teal
  }
};
export {
  ConsentScreen,
  CountrySelectionScreen,
  DocumentCaptureScreen,
  DocumentSelectionScreen,
  ErrorScreen,
  KoraIDVProvider,
  LivenessScreen,
  ProcessingScreen,
  QrHandoffScreen,
  ResultScreen,
  ScoreCard,
  ScoreMetricRow,
  SelfieCaptureScreen,
  StepProgressBar,
  VerificationFlow,
  useKoraIDV
};
