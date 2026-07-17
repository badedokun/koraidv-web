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
import { useState, useCallback, useEffect, useRef } from "react";
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
    error: null,
    lastChallengeError: null
  });
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [documentFrontCaptured, setDocumentFrontCaptured] = useState(false);
  const lastStartArgsRef = useRef(null);
  const startVerification = useCallback(
    async (externalId, tier = "standard", expectedFirstName, expectedLastName) => {
      lastStartArgsRef.current = { externalId, tier, expectedFirstName, expectedLastName };
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        await sdk.startVerification(
          {
            externalId,
            tier,
            expectedFirstName,
            expectedLastName
          },
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
    async (imageData, side, country) => {
      if (!selectedDocumentType) return false;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await sdk.uploadDocument(imageData, side, selectedDocumentType, country);
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
            isLoading: false,
            // Clear any prior retake message — the user just succeeded.
            lastChallengeError: null
          }));
          if (!nextChallenge) {
            setState((prev) => ({ ...prev, step: "processing" }));
          }
          return true;
        }
        setState((prev) => ({
          ...prev,
          isLoading: false,
          lastChallengeError: retakeMessageForChallenge(currentChallenge.type)
        }));
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
  const completionFiredRef = useRef(false);
  useEffect(() => {
    if (state.step === "processing" && !completionFiredRef.current) {
      completionFiredRef.current = true;
      complete();
    } else if (state.step !== "processing" && state.step !== "complete") {
      completionFiredRef.current = false;
    }
  }, [state.step, complete]);
  const cancel = useCallback(() => {
    sdk.reset();
    setState({
      step: "consent",
      verification: null,
      livenessSession: null,
      currentChallenge: null,
      completedChallenges: 0,
      isLoading: false,
      error: null,
      lastChallengeError: null
    });
    setSelectedDocumentType(null);
    setDocumentFrontCaptured(false);
  }, [sdk]);
  const retry = useCallback(() => {
    const args = lastStartArgsRef.current;
    sdk.reset();
    setState({
      step: "consent",
      verification: null,
      livenessSession: null,
      currentChallenge: null,
      completedChallenges: 0,
      isLoading: false,
      error: null,
      lastChallengeError: null
    });
    setSelectedDocumentType(null);
    setDocumentFrontCaptured(false);
    if (args) {
      startVerification(args.externalId, args.tier, args.expectedFirstName, args.expectedLastName);
    }
  }, [sdk, startVerification]);
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
function retakeMessageForChallenge(type) {
  switch (type) {
    case "blink":
      return "We didn't catch the blink \u2014 close both eyes briefly and try again.";
    case "smile":
      return "We didn't catch the smile \u2014 show your teeth and try again.";
    case "turn_left":
      return "Turn your head a bit further to the left and try again.";
    case "turn_right":
      return "Turn your head a bit further to the right and try again.";
    case "nod_up":
      return "Tilt your head a bit higher and try again.";
    case "nod_down":
      return "Tilt your head a bit lower and try again.";
    default:
      return "That attempt didn't pass \u2014 follow the prompt and try again.";
  }
}

// src/components/VerificationFlow.tsx
import { useEffect as useEffect11, useState as useState9 } from "react";
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
    /* \u2500\u2500\u2500 VisualGuides motion (v1.8.0) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    @keyframes kora-head-turn-right {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(22deg); }
    }
    @keyframes kora-head-turn-left {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-22deg); }
    }
    @keyframes kora-head-tilt-up {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px) rotate(-6deg); }
    }
    @keyframes kora-head-tilt-down {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(6px) rotate(6deg); }
    }
    @keyframes kora-smile {
      0%, 100% { transform: scaleY(0.5); }
      50% { transform: scaleY(1.2); }
    }
    @keyframes kora-blink {
      0%, 80%, 100% { transform: scaleY(1); }
      88% { transform: scaleY(0.05); }
    }
    @keyframes kora-nfc-wave {
      0% { opacity: 0; transform: translateX(-4px); }
      40% { opacity: 1; }
      100% { opacity: 0; transform: translateX(6px); }
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
import { useEffect as useEffect2, useState as useState2 } from "react";
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
var DEFAULT_AUTO_STEPS = [
  "Document analyzed",
  "Checking face match",
  "Finalizing results"
];
function ProcessingScreen({ steps, autoAdvance = true }) {
  useEffect2(() => {
    injectKeyframes();
  }, []);
  const [autoIndex, setAutoIndex] = useState2(0);
  useEffect2(() => {
    if (steps || !autoAdvance) return;
    if (autoIndex >= DEFAULT_AUTO_STEPS.length - 1) return;
    const t = setTimeout(() => setAutoIndex((i) => i + 1), 1400);
    return () => clearTimeout(t);
  }, [autoIndex, steps, autoAdvance]);
  const renderedSteps = steps ? steps : DEFAULT_AUTO_STEPS.map((label, i) => ({
    label,
    status: i < autoIndex ? "done" : i === autoIndex ? "active" : "pending"
  }));
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
    /* @__PURE__ */ jsx2("div", { style: styles.processingSteps, children: renderedSteps.map((step, i) => /* @__PURE__ */ jsxs("div", { style: styles.processingStep, children: [
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
  const source = verification.metadata?.source ?? "";
  const livenessPercent = Math.round(
    verification.scores?.liveness ?? verification.livenessVerification?.livenessScore ?? 0
  );
  const docPercent = Math.round(
    verification.scores?.documentAuth ?? (verification.documentVerification?.authenticityScore ?? 0) * 100
  );
  const nameMatch = Math.round(
    verification.scores?.nameMatch ?? (verification.documentVerification?.firstName && verification.documentVerification?.lastName ? 100 : 0)
  );
  const selfiePercent = Math.round(
    verification.scores?.faceMatch ?? verification.faceVerification?.matchScore ?? 0
  );
  const isWeb = source === "web";
  const passFloor = isWeb ? 65 : 75;
  const borderlineFloor = isWeb ? 40 : 50;
  function getStatus(score) {
    if (score >= passFloor) return "pass";
    if (score >= borderlineFloor) return "borderline";
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
import { useState as useState3, useMemo as useMemo2 } from "react";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function CountrySelectionScreen({ countries, onSelect, onCancel }) {
  const [selected, setSelected] = useState3(null);
  const [searchQuery, setSearchQuery] = useState3("");
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
import { useRef as useRef3, useEffect as useEffect5, useState as useState5, useCallback as useCallback2 } from "react";

// src/components/VisualGuides.tsx
import { useEffect as useEffect3 } from "react";
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
function visualGuideForChallenge(challengeType) {
  switch (challengeType) {
    case "turn_left":
      return "livenessTurnLeft";
    case "turn_right":
      return "livenessTurnRight";
    case "nod_up":
      return "livenessLookUp";
    case "nod_down":
      return "livenessLookDown";
    case "smile":
      return "livenessSmile";
    case "blink":
      return "livenessBlink";
    default:
      return null;
  }
}
function VisualGuide({ kind, size = 96 }) {
  useEffect3(() => {
    injectKeyframes();
  }, []);
  const common = { width: size, height: size, viewBox: "0 0 100 100" };
  const fg = colors.teal;
  const dim = "rgba(255,255,255,0.3)";
  switch (kind) {
    case "docFront":
      return /* @__PURE__ */ jsx6(DocFront, { ...common, fg, dim });
    case "docBack":
      return /* @__PURE__ */ jsx6(DocBack, { ...common, fg, dim });
    case "selfie":
      return /* @__PURE__ */ jsx6(Selfie, { ...common, fg, dim });
    case "nfcScan":
      return /* @__PURE__ */ jsx6(NfcScan, { ...common, fg, dim });
    case "livenessTurnLeft":
      return /* @__PURE__ */ jsx6(HeadTurn, { ...common, fg, dim, right: false });
    case "livenessTurnRight":
      return /* @__PURE__ */ jsx6(HeadTurn, { ...common, fg, dim, right: true });
    case "livenessLookUp":
      return /* @__PURE__ */ jsx6(HeadTilt, { ...common, fg, dim, up: true });
    case "livenessLookDown":
      return /* @__PURE__ */ jsx6(HeadTilt, { ...common, fg, dim, up: false });
    case "livenessSmile":
      return /* @__PURE__ */ jsx6(Smile, { ...common, fg, dim });
    case "livenessBlink":
      return /* @__PURE__ */ jsx6(Blink, { ...common, fg, dim });
  }
}
function DocFront({ width, height, viewBox, fg, dim }) {
  return /* @__PURE__ */ jsxs5("svg", { width, height, viewBox, fill: "none", children: [
    /* @__PURE__ */ jsx6("rect", { x: "8", y: "26", width: "84", height: "48", rx: "5", stroke: fg, strokeWidth: "2.5" }),
    /* @__PURE__ */ jsx6("rect", { x: "14", y: "34", width: "22", height: "28", rx: "2", fill: dim }),
    /* @__PURE__ */ jsx6("rect", { x: "42", y: "36", width: "44", height: "3", rx: "1.5", fill: fg }),
    /* @__PURE__ */ jsx6("rect", { x: "42", y: "44", width: "36", height: "2.5", rx: "1.25", fill: dim }),
    /* @__PURE__ */ jsx6("rect", { x: "42", y: "50", width: "40", height: "2.5", rx: "1.25", fill: dim }),
    /* @__PURE__ */ jsx6("rect", { x: "42", y: "56", width: "30", height: "2.5", rx: "1.25", fill: dim })
  ] });
}
function DocBack({ width, height, viewBox, fg, dim }) {
  return /* @__PURE__ */ jsxs5("svg", { width, height, viewBox, fill: "none", children: [
    /* @__PURE__ */ jsx6("rect", { x: "8", y: "26", width: "84", height: "48", rx: "5", stroke: fg, strokeWidth: "2.5" }),
    [16, 19, 22, 26, 28, 32, 35, 39, 42, 46, 49, 53, 56, 60].map((x, i) => /* @__PURE__ */ jsx6(
      "rect",
      {
        x,
        y: "34",
        width: i % 3 === 0 ? 2 : 1.2,
        height: "20",
        fill: fg
      },
      i
    )),
    /* @__PURE__ */ jsx6("line", { x1: "14", y1: "64", x2: "58", y2: "64", stroke: dim, strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx6("rect", { x: "66", y: "34", width: "20", height: "20", rx: "1", fill: dim })
  ] });
}
function Selfie({ width, height, viewBox, fg, dim }) {
  return /* @__PURE__ */ jsxs5("svg", { width, height, viewBox, fill: "none", children: [
    /* @__PURE__ */ jsx6("ellipse", { cx: "50", cy: "42", rx: "22", ry: "28", stroke: fg, strokeWidth: "2.5" }),
    /* @__PURE__ */ jsx6("circle", { cx: "42", cy: "38", r: "2.5", fill: fg }),
    /* @__PURE__ */ jsx6("circle", { cx: "58", cy: "38", r: "2.5", fill: fg }),
    /* @__PURE__ */ jsx6("path", { d: "M 40 50 Q 50 56 60 50", stroke: fg, strokeWidth: "2", strokeLinecap: "round", fill: "none" }),
    /* @__PURE__ */ jsx6("path", { d: "M 18 92 Q 18 76 36 70 L 64 70 Q 82 76 82 92", stroke: dim, strokeWidth: "2", fill: "none" })
  ] });
}
function NfcScan({ width, height, viewBox, fg, dim }) {
  return /* @__PURE__ */ jsxs5("svg", { width, height, viewBox, fill: "none", children: [
    /* @__PURE__ */ jsx6("rect", { x: "14", y: "40", width: "40", height: "50", rx: "3", stroke: dim, strokeWidth: "2" }),
    /* @__PURE__ */ jsx6("circle", { cx: "34", cy: "60", r: "6", stroke: dim, strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx6("rect", { x: "62", y: "22", width: "26", height: "52", rx: "4", stroke: fg, strokeWidth: "2.5" }),
    /* @__PURE__ */ jsx6("rect", { x: "66", y: "26", width: "18", height: "38", rx: "1.5", fill: dim, opacity: "0.5" }),
    /* @__PURE__ */ jsx6("path", { d: "M 58 48 Q 52 48 50 56", stroke: fg, strokeWidth: "2", fill: "none", style: { animation: "kora-nfc-wave 1.6s ease-out infinite" } }),
    /* @__PURE__ */ jsx6("path", { d: "M 58 44 Q 50 44 46 56", stroke: fg, strokeWidth: "2", fill: "none", opacity: "0.7", style: { animation: "kora-nfc-wave 1.6s ease-out infinite 0.3s" } })
  ] });
}
function HeadTurn({ width, height, viewBox, fg, dim, right }) {
  const arrowPath = right ? "M 30 12 L 70 12 L 64 6 M 70 12 L 64 18" : "M 70 12 L 30 12 L 36 6 M 30 12 L 36 18";
  return /* @__PURE__ */ jsxs5("svg", { width, height, viewBox, fill: "none", children: [
    /* @__PURE__ */ jsx6("path", { d: arrowPath, stroke: fg, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", fill: "none" }),
    /* @__PURE__ */ jsxs5(
      "g",
      {
        style: {
          transformOrigin: "50px 56px",
          animation: right ? "kora-head-turn-right 2s ease-in-out infinite" : "kora-head-turn-left 2s ease-in-out infinite"
        },
        children: [
          /* @__PURE__ */ jsx6("ellipse", { cx: "50", cy: "55", rx: "20", ry: "26", stroke: fg, strokeWidth: "2.5" }),
          /* @__PURE__ */ jsx6("circle", { cx: "42", cy: "50", r: "2", fill: fg }),
          /* @__PURE__ */ jsx6("circle", { cx: "58", cy: "50", r: "2", fill: fg }),
          /* @__PURE__ */ jsx6("path", { d: "M 50 54 L 50 62", stroke: dim, strokeWidth: "1.5", strokeLinecap: "round" })
        ]
      }
    )
  ] });
}
function HeadTilt({ width, height, viewBox, fg, dim, up }) {
  const arrowPath = up ? "M 50 92 L 50 14 M 44 22 L 50 14 L 56 22" : "M 50 14 L 50 92 M 44 84 L 50 92 L 56 84";
  return /* @__PURE__ */ jsxs5("svg", { width, height, viewBox, fill: "none", children: [
    /* @__PURE__ */ jsx6("path", { d: arrowPath, stroke: fg, strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", opacity: "0.4", fill: "none" }),
    /* @__PURE__ */ jsxs5(
      "g",
      {
        style: {
          transformOrigin: "50px 56px",
          animation: up ? "kora-head-tilt-up 2s ease-in-out infinite" : "kora-head-tilt-down 2s ease-in-out infinite"
        },
        children: [
          /* @__PURE__ */ jsx6("ellipse", { cx: "50", cy: "55", rx: "20", ry: "26", stroke: fg, strokeWidth: "2.5" }),
          /* @__PURE__ */ jsx6("circle", { cx: "42", cy: "50", r: "2", fill: fg }),
          /* @__PURE__ */ jsx6("circle", { cx: "58", cy: "50", r: "2", fill: fg }),
          /* @__PURE__ */ jsx6("path", { d: "M 50 54 L 50 62", stroke: dim, strokeWidth: "1.5", strokeLinecap: "round" })
        ]
      }
    )
  ] });
}
function Smile({ width, height, viewBox, fg, dim }) {
  return /* @__PURE__ */ jsxs5("svg", { width, height, viewBox, fill: "none", children: [
    /* @__PURE__ */ jsx6("ellipse", { cx: "50", cy: "50", rx: "24", ry: "30", stroke: fg, strokeWidth: "2.5" }),
    /* @__PURE__ */ jsx6("circle", { cx: "40", cy: "44", r: "2.5", fill: fg }),
    /* @__PURE__ */ jsx6("circle", { cx: "60", cy: "44", r: "2.5", fill: fg }),
    /* @__PURE__ */ jsx6(
      "path",
      {
        d: "M 38 60 Q 50 68 62 60",
        stroke: fg,
        strokeWidth: "2.5",
        strokeLinecap: "round",
        fill: "none",
        style: { animation: "kora-smile 2s ease-in-out infinite", transformOrigin: "50px 60px" }
      }
    ),
    /* @__PURE__ */ jsx6("line", { x1: "40", y1: "60", x2: "60", y2: "60", stroke: dim, strokeWidth: "1.5", opacity: "0.3" })
  ] });
}
function Blink({ width, height, viewBox, fg, dim }) {
  return /* @__PURE__ */ jsxs5("svg", { width, height, viewBox, fill: "none", children: [
    /* @__PURE__ */ jsx6("ellipse", { cx: "50", cy: "50", rx: "24", ry: "30", stroke: fg, strokeWidth: "2.5" }),
    /* @__PURE__ */ jsxs5("g", { style: { animation: "kora-blink 1.6s ease-in-out infinite" }, children: [
      /* @__PURE__ */ jsx6("circle", { cx: "40", cy: "44", r: "3", fill: fg }),
      /* @__PURE__ */ jsx6("circle", { cx: "60", cy: "44", r: "3", fill: fg })
    ] }),
    /* @__PURE__ */ jsx6("path", { d: "M 42 60 Q 50 64 58 60", stroke: dim, strokeWidth: "2", strokeLinecap: "round", fill: "none" })
  ] });
}

// src/hooks/useDocumentDetection.ts
import { useEffect as useEffect4, useRef as useRef2, useState as useState4 } from "react";
var FRAME_INTERVAL_MS = 300;
function useDocumentDetection(videoRef, side) {
  const [signals, setSignals] = useState4({
    documentDetected: false,
    detectorActive: false
  });
  const detectorRef = useRef2(null);
  const intervalRef = useRef2(null);
  useEffect4(() => {
    let cancelled = false;
    async function setup() {
      const win = typeof window !== "undefined" ? window : null;
      if (!win) return;
      let DetectorCtor = null;
      if (side === "front" && "FaceDetector" in win) {
        DetectorCtor = win["FaceDetector"];
      } else if (side === "back" && "BarcodeDetector" in win) {
        DetectorCtor = win["BarcodeDetector"];
      }
      if (!DetectorCtor) {
        return;
      }
      try {
        const detector = new DetectorCtor(
          side === "front" ? { fastMode: true, maxDetectedFaces: 1 } : { formats: ["pdf417", "qr_code", "data_matrix", "code_128"] }
        );
        if (cancelled) return;
        detectorRef.current = detector;
        setSignals((prev) => ({ ...prev, detectorActive: true }));
      } catch {
        return;
      }
      intervalRef.current = setInterval(async () => {
        const detector = detectorRef.current;
        const video = videoRef.current;
        if (!detector || !video || video.readyState < 2) return;
        try {
          const results = await detector.detect(video);
          if (cancelled) return;
          setSignals((prev) => {
            const next = results.length > 0;
            if (prev.documentDetected === next) return prev;
            return { ...prev, documentDetected: next };
          });
        } catch {
        }
      }, FRAME_INTERVAL_MS);
    }
    setup();
    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      detectorRef.current = null;
    };
  }, [videoRef, side]);
  return signals;
}

// src/components/DocumentCaptureScreen.tsx
import { Fragment, jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
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
  onCancel,
  showVisualGuides = true
}) {
  const videoRef = useRef3(null);
  const canvasRef = useRef3(null);
  const guideRef = useRef3(null);
  const [stream, setStream] = useState5(null);
  const documentSignals = useDocumentDetection(videoRef, side);
  const [isCapturing, setIsCapturing] = useState5(false);
  const [error, setError] = useState5(null);
  const [capturedImage, setCapturedImage] = useState5(null);
  const [capturedBlob, setCapturedBlob] = useState5(null);
  const [qualityResult, setQualityResult] = useState5(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState5(false);
  const [retakeCount, setRetakeCount] = useState5(0);
  useEffect5(() => {
    injectKeyframes();
  }, []);
  useEffect5(() => {
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
  useEffect5(() => {
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
    const guideRect = guideRef.current?.getBoundingClientRect();
    const videoRect = video.getBoundingClientRect();
    let cropX = 0;
    let cropY = 0;
    let cropW = video.videoWidth;
    let cropH = video.videoHeight;
    if (guideRect && videoRect.width > 0 && videoRect.height > 0 && video.videoWidth > 0 && video.videoHeight > 0) {
      const scale = Math.max(
        videoRect.width / video.videoWidth,
        videoRect.height / video.videoHeight
      );
      const visibleSourceW = videoRect.width / scale;
      const visibleSourceH = videoRect.height / scale;
      const sourceLeftOffset = (video.videoWidth - visibleSourceW) / 2;
      const sourceTopOffset = (video.videoHeight - visibleSourceH) / 2;
      const guideOffsetX = guideRect.left - videoRect.left;
      const guideOffsetY = guideRect.top - videoRect.top;
      const sx = sourceLeftOffset + guideOffsetX / scale;
      const sy = sourceTopOffset + guideOffsetY / scale;
      const sw = guideRect.width / scale;
      const sh = guideRect.height / scale;
      cropX = Math.max(0, Math.min(Math.round(sx), video.videoWidth - 1));
      cropY = Math.max(0, Math.min(Math.round(sy), video.videoHeight - 1));
      cropW = Math.max(1, Math.min(Math.round(sw), video.videoWidth - cropX));
      cropH = Math.max(1, Math.min(Math.round(sh), video.videoHeight - cropY));
    }
    const TARGET_MIN_WIDTH = 1600;
    const upscale = cropW < TARGET_MIN_WIDTH ? TARGET_MIN_WIDTH / cropW : 1;
    const outW = Math.round(cropW * upscale);
    const outH = Math.round(cropH * upscale);
    canvas.width = outW;
    canvas.height = outH;
    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
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
    return /* @__PURE__ */ jsx7("div", { style: styles.container, children: /* @__PURE__ */ jsxs6("div", { style: styles.errorContainer, children: [
      /* @__PURE__ */ jsx7("p", { style: styles.errorText, children: error }),
      /* @__PURE__ */ jsx7("button", { style: styles.primaryButton, onClick: onCancel, children: "Go Back" })
    ] }) });
  }
  if (capturedImage) {
    const qualityPassed = qualityResult && qualityResult.qualityScore >= 60;
    const qualityFailed = qualityResult && qualityResult.qualityScore < 60;
    const canContinueAnyway = qualityFailed && retakeCount >= 2;
    return /* @__PURE__ */ jsxs6("div", { style: styles.darkContainer, children: [
      /* @__PURE__ */ jsx7(StepProgressBar, { total: 5, current: 3, isDark: true }),
      /* @__PURE__ */ jsxs6("div", { style: styles.darkScreenHeader, children: [
        /* @__PURE__ */ jsx7("div", { style: { width: 40 } }),
        /* @__PURE__ */ jsx7("h1", { style: styles.darkScreenTitle, children: "Review your photo" }),
        /* @__PURE__ */ jsx7("button", { style: styles.glassCloseButton, onClick: onCancel, children: "\u2715" })
      ] }),
      /* @__PURE__ */ jsx7("div", { style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }, children: /* @__PURE__ */ jsxs6("div", { style: styles.reviewCard, children: [
        /* @__PURE__ */ jsx7(
          "img",
          {
            src: capturedImage,
            alt: "Captured document",
            style: { width: "100%", maxWidth: "300px", borderRadius: "16px", display: "block", margin: "0 auto" }
          }
        ),
        isCheckingQuality && /* @__PURE__ */ jsx7("div", { style: { textAlign: "center", marginTop: "16px" }, children: /* @__PURE__ */ jsx7("span", { style: { ...styles.reviewBadge, backgroundColor: "rgba(255,255,255,0.1)" }, children: "Checking quality..." }) }),
        qualityPassed && /* @__PURE__ */ jsxs6(Fragment, { children: [
          /* @__PURE__ */ jsx7("div", { style: { textAlign: "center", marginTop: "16px" }, children: /* @__PURE__ */ jsxs6("span", { style: styles.reviewBadge, children: [
            "\u2713 Quality score: ",
            Math.round(qualityResult.qualityScore),
            "%"
          ] }) }),
          /* @__PURE__ */ jsxs6("div", { style: styles.qualityChecks, children: [
            /* @__PURE__ */ jsx7(QualityCheck, { label: "Sharp" }),
            /* @__PURE__ */ jsx7(QualityCheck, { label: "Well-lit" }),
            /* @__PURE__ */ jsx7(QualityCheck, { label: "Readable" })
          ] })
        ] }),
        qualityFailed && /* @__PURE__ */ jsxs6(Fragment, { children: [
          /* @__PURE__ */ jsx7("div", { style: { textAlign: "center", marginTop: "16px" }, children: /* @__PURE__ */ jsxs6("span", { style: { ...styles.reviewBadge, backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444" }, children: [
            "\u26A0 Quality score: ",
            Math.round(qualityResult.qualityScore),
            "%"
          ] }) }),
          /* @__PURE__ */ jsx7("div", { style: { padding: "12px 0" }, children: qualityResult.qualityIssues.map((issue, i) => /* @__PURE__ */ jsx7("p", { style: { color: "rgba(255,255,255,0.7)", fontSize: "13px", margin: "4px 0", textAlign: "center" }, children: qualityIssueMessages[issue] || issue }, i)) })
        ] }),
        !qualityResult && !isCheckingQuality && /* @__PURE__ */ jsxs6(Fragment, { children: [
          /* @__PURE__ */ jsx7("div", { style: { textAlign: "center", marginTop: "16px" }, children: /* @__PURE__ */ jsx7("span", { style: styles.reviewBadge, children: "\u2713 Good quality" }) }),
          /* @__PURE__ */ jsxs6("div", { style: styles.qualityChecks, children: [
            /* @__PURE__ */ jsx7(QualityCheck, { label: "Sharp" }),
            /* @__PURE__ */ jsx7(QualityCheck, { label: "Well-lit" }),
            /* @__PURE__ */ jsx7(QualityCheck, { label: "No glare" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx7("div", { style: styles.reviewButtonsRow, children: qualityFailed ? /* @__PURE__ */ jsxs6(Fragment, { children: [
        /* @__PURE__ */ jsx7("button", { style: { ...styles.darkOutlineButton, flex: 1 }, onClick: handleRetake, children: "Retake" }),
        canContinueAnyway && /* @__PURE__ */ jsx7("button", { style: { ...styles.primaryButton, flex: 1 }, onClick: handleContinueAnyway, children: "Continue anyway" })
      ] }) : /* @__PURE__ */ jsxs6(Fragment, { children: [
        /* @__PURE__ */ jsx7("button", { style: { ...styles.darkOutlineButton, flex: 1 }, onClick: handleRetake, children: "Retake" }),
        /* @__PURE__ */ jsx7(
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
  return /* @__PURE__ */ jsxs6("div", { style: styles.captureContainer, children: [
    /* @__PURE__ */ jsx7(StepProgressBar, { total: 5, current: 3, isDark: true }),
    /* @__PURE__ */ jsxs6("div", { style: styles.darkScreenHeader, children: [
      /* @__PURE__ */ jsx7("div", { style: { width: 40 } }),
      /* @__PURE__ */ jsxs6("div", { style: { flex: 1, textAlign: "center" }, children: [
        /* @__PURE__ */ jsx7("h1", { style: { ...styles.darkScreenTitle, margin: 0 }, children: side === "front" ? "Front of ID" : "Back of ID" }),
        documentType && /* @__PURE__ */ jsx7("p", { style: styles.darkScreenSubtitle, children: documentType })
      ] }),
      /* @__PURE__ */ jsx7("button", { style: styles.glassCloseButton, onClick: onCancel, children: "\u2715" })
    ] }),
    showVisualGuides && /* @__PURE__ */ jsx7("div", { style: { display: "flex", justifyContent: "center", padding: "6px 0 0" }, children: /* @__PURE__ */ jsx7(VisualGuide, { kind: side === "front" ? "docFront" : "docBack", size: 56 }) }),
    /* @__PURE__ */ jsxs6("div", { style: styles.cameraContainer, children: [
      /* @__PURE__ */ jsx7("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, style: styles.cameraVideo }),
      /* @__PURE__ */ jsxs6("div", { style: styles.documentOverlay, children: [
        /* @__PURE__ */ jsxs6("div", { ref: guideRef, style: styles.documentFrame, children: [
          /* @__PURE__ */ jsx7("div", { style: { ...styles.corner, top: 0, left: 0 } }),
          /* @__PURE__ */ jsx7("div", { style: { ...styles.corner, top: 0, right: 0, transform: "rotate(90deg)" } }),
          /* @__PURE__ */ jsx7("div", { style: { ...styles.corner, bottom: 0, right: 0, transform: "rotate(180deg)" } }),
          /* @__PURE__ */ jsx7("div", { style: { ...styles.corner, bottom: 0, left: 0, transform: "rotate(270deg)" } }),
          /* @__PURE__ */ jsx7("div", { style: styles.scanLine })
        ] }),
        documentSignals.detectorActive && /* @__PURE__ */ jsx7(
          "div",
          {
            style: {
              position: "absolute",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 600,
              color: documentSignals.documentDetected ? colors.success : "rgba(255,255,255,0.55)",
              backgroundColor: documentSignals.documentDetected ? "rgba(16,185,129,0.15)" : "rgba(0,0,0,0.35)",
              border: documentSignals.documentDetected ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.12)",
              transition: "all 200ms",
              pointerEvents: "none",
              whiteSpace: "nowrap"
            },
            children: documentSignals.documentDetected ? "\u2713 Document detected \u2014 fill the frame" : "Position your ID inside the guide"
          }
        )
      ] }),
      /* @__PURE__ */ jsx7("canvas", { ref: canvasRef, style: { display: "none" } })
    ] }),
    /* @__PURE__ */ jsxs6("div", { style: styles.stepPillsRow, children: [
      /* @__PURE__ */ jsx7(
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
      requiresBack && /* @__PURE__ */ jsx7(
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
    /* @__PURE__ */ jsx7("div", { style: { textAlign: "center", padding: "8px 0" }, children: /* @__PURE__ */ jsxs6(
      "span",
      {
        style: {
          ...styles.guidancePill,
          backgroundColor: "rgba(13,148,136,0.15)",
          color: colors.teal
        },
        children: [
          /* @__PURE__ */ jsx7("span", { style: { ...styles.pulsingDot, backgroundColor: colors.teal } }),
          "Scanning document..."
        ]
      }
    ) }),
    /* @__PURE__ */ jsx7("div", { style: styles.captureFooter, children: /* @__PURE__ */ jsx7(
      "button",
      {
        style: { ...styles.captureButton, opacity: isCapturing ? 0.5 : 1 },
        onClick: handleCapture,
        disabled: isCapturing,
        children: /* @__PURE__ */ jsx7("div", { style: styles.captureButtonInner })
      }
    ) })
  ] });
}
function QualityCheck({ label }) {
  return /* @__PURE__ */ jsxs6("div", { style: styles.qualityCheck, children: [
    /* @__PURE__ */ jsx7("div", { style: styles.qualityCheckIcon, children: "\u2713" }),
    /* @__PURE__ */ jsx7("span", { style: styles.qualityCheckLabel, children: label })
  ] });
}

// src/components/FlipDocumentScreen.tsx
import { useEffect as useEffect6 } from "react";
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
function FlipDocumentScreen({ onContinue, onCancel }) {
  useEffect6(() => {
    injectKeyframes();
  }, []);
  return /* @__PURE__ */ jsxs7("div", { style: styles.darkContainer, children: [
    /* @__PURE__ */ jsx8(StepProgressBar, { total: 5, current: 3, isDark: true }),
    /* @__PURE__ */ jsxs7("div", { style: styles.darkScreenHeader, children: [
      /* @__PURE__ */ jsx8("div", { style: { width: 40 } }),
      /* @__PURE__ */ jsx8("h1", { style: styles.darkScreenTitle, children: "Flip your document" }),
      /* @__PURE__ */ jsx8("button", { style: styles.glassCloseButton, onClick: onCancel, children: "\u2715" })
    ] }),
    /* @__PURE__ */ jsxs7("div", { style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      gap: "32px"
    }, children: [
      /* @__PURE__ */ jsx8("div", { style: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        backgroundColor: "rgba(13,148,136,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }, children: /* @__PURE__ */ jsxs7("svg", { width: "56", height: "56", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
        /* @__PURE__ */ jsx8("path", { d: "M9 3L5 6.99H8V14H10V6.99H13L9 3Z", fill: colors.teal }),
        /* @__PURE__ */ jsx8("path", { d: "M16 17.01V10H14V17.01H11L15 21L19 17.01H16Z", fill: colors.teal })
      ] }) }),
      /* @__PURE__ */ jsxs7("div", { style: { textAlign: "center" }, children: [
        /* @__PURE__ */ jsx8("h2", { style: {
          fontSize: "22px",
          fontWeight: 700,
          color: colors.white,
          margin: "0 0 12px 0"
        }, children: "Now capture the back" }),
        /* @__PURE__ */ jsx8("p", { style: {
          fontSize: "15px",
          color: "rgba(255,255,255,0.6)",
          margin: 0,
          lineHeight: 1.6,
          maxWidth: "280px"
        }, children: "Turn your document over to the back side, then tap continue to take a photo." })
      ] }),
      /* @__PURE__ */ jsxs7("div", { style: styles.stepPillsRow, children: [
        /* @__PURE__ */ jsx8("span", { style: {
          ...styles.stepPill,
          backgroundColor: "rgba(16,185,129,0.15)",
          color: colors.success
        }, children: "\u2713 Front" }),
        /* @__PURE__ */ jsx8("span", { style: {
          ...styles.stepPill,
          backgroundColor: colors.teal,
          color: colors.white
        }, children: "Back" })
      ] })
    ] }),
    /* @__PURE__ */ jsx8("div", { style: { padding: "24px" }, children: /* @__PURE__ */ jsx8("button", { style: styles.primaryButton, onClick: onContinue, children: "Continue" }) })
  ] });
}

// src/components/SelfieCaptureScreen.tsx
import { useRef as useRef4, useEffect as useEffect7, useState as useState6, useCallback as useCallback3 } from "react";
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
function SelfieCaptureScreen({ onCapture, onCancel, showVisualGuides = true }) {
  const videoRef = useRef4(null);
  const canvasRef = useRef4(null);
  const [stream, setStream] = useState6(null);
  const [isCapturing, setIsCapturing] = useState6(false);
  const [error, setError] = useState6(null);
  const [capturedImage, setCapturedImage] = useState6(null);
  const [capturedBlob, setCapturedBlob] = useState6(null);
  useEffect7(() => {
    injectKeyframes();
  }, []);
  useEffect7(() => {
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
  useEffect7(() => {
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
    return /* @__PURE__ */ jsx9("div", { style: styles.container, children: /* @__PURE__ */ jsxs8("div", { style: styles.errorContainer, children: [
      /* @__PURE__ */ jsx9("p", { style: styles.errorText, children: error }),
      /* @__PURE__ */ jsx9("button", { style: styles.primaryButton, onClick: onCancel, children: "Go Back" })
    ] }) });
  }
  if (capturedImage) {
    return /* @__PURE__ */ jsxs8("div", { style: styles.darkContainer, children: [
      /* @__PURE__ */ jsx9(StepProgressBar, { total: 5, current: 4, isDark: true }),
      /* @__PURE__ */ jsxs8("div", { style: styles.darkScreenHeader, children: [
        /* @__PURE__ */ jsx9("div", { style: { width: 40 } }),
        /* @__PURE__ */ jsx9("h1", { style: styles.darkScreenTitle, children: "Does this look like you?" }),
        /* @__PURE__ */ jsx9("button", { style: styles.glassCloseButton, onClick: onCancel, children: "\u2715" })
      ] }),
      /* @__PURE__ */ jsx9("p", { style: styles.darkScreenSubtitle, children: "Check clarity and lighting" }),
      /* @__PURE__ */ jsx9("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }, children: /* @__PURE__ */ jsxs8("div", { style: { position: "relative" }, children: [
        /* @__PURE__ */ jsx9("div", { style: { width: "240px", height: "300px", borderRadius: "50%", overflow: "hidden", border: `3px solid ${colors.teal}` }, children: /* @__PURE__ */ jsx9(
          "img",
          {
            src: capturedImage,
            alt: "Selfie",
            style: { width: "100%", height: "100%", objectFit: "cover" }
          }
        ) }),
        /* @__PURE__ */ jsx9("div", { style: { textAlign: "center", marginTop: "16px" }, children: /* @__PURE__ */ jsx9("span", { style: styles.reviewBadge, children: "\u2713 Face detected" }) }),
        /* @__PURE__ */ jsxs8("div", { style: styles.qualityChecks, children: [
          /* @__PURE__ */ jsx9(QualityCheck2, { label: "Clear" }),
          /* @__PURE__ */ jsx9(QualityCheck2, { label: "Centered" }),
          /* @__PURE__ */ jsx9(QualityCheck2, { label: "Well-lit" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs8("div", { style: styles.reviewButtonsRow, children: [
        /* @__PURE__ */ jsx9("button", { style: { ...styles.darkOutlineButton, flex: 1 }, onClick: handleRetake, children: "Retake" }),
        /* @__PURE__ */ jsx9("button", { style: { ...styles.primaryButton, flex: 1 }, onClick: handleAccept, children: "Use this" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs8("div", { style: styles.captureContainer, children: [
    /* @__PURE__ */ jsx9(StepProgressBar, { total: 5, current: 4, isDark: true }),
    /* @__PURE__ */ jsxs8("div", { style: styles.darkScreenHeader, children: [
      /* @__PURE__ */ jsx9("div", { style: { width: 40 } }),
      /* @__PURE__ */ jsxs8("div", { style: { flex: 1, textAlign: "center" }, children: [
        /* @__PURE__ */ jsx9("h1", { style: { ...styles.darkScreenTitle, margin: 0, fontSize: "24px", fontWeight: 700 }, children: "Face the camera" }),
        /* @__PURE__ */ jsx9("p", { style: styles.darkScreenSubtitle, children: "Keep a neutral expression" })
      ] }),
      /* @__PURE__ */ jsx9("button", { style: styles.glassCloseButton, onClick: onCancel, children: "\u2715" })
    ] }),
    showVisualGuides && /* @__PURE__ */ jsx9("div", { style: { display: "flex", justifyContent: "center", padding: "6px 0 0" }, children: /* @__PURE__ */ jsx9(VisualGuide, { kind: "selfie", size: 56 }) }),
    /* @__PURE__ */ jsxs8("div", { style: styles.cameraContainer, children: [
      /* @__PURE__ */ jsx9(
        "video",
        {
          ref: videoRef,
          autoPlay: true,
          playsInline: true,
          muted: true,
          style: { ...styles.cameraVideo, transform: "scaleX(-1)" }
        }
      ),
      /* @__PURE__ */ jsx9("div", { style: styles.selfieOverlay, children: /* @__PURE__ */ jsx9("div", { style: styles.faceGuide, children: /* @__PURE__ */ jsx9("div", { style: styles.rotatingRing }) }) }),
      /* @__PURE__ */ jsx9("canvas", { ref: canvasRef, style: { display: "none" } })
    ] }),
    /* @__PURE__ */ jsx9("div", { style: { textAlign: "center", padding: "8px 0" }, children: /* @__PURE__ */ jsxs8(
      "span",
      {
        style: {
          ...styles.guidancePill,
          backgroundColor: "rgba(13,148,136,0.15)",
          color: colors.teal
        },
        children: [
          /* @__PURE__ */ jsx9("span", { style: { ...styles.pulsingDot, backgroundColor: colors.teal } }),
          "Position your face in the oval"
        ]
      }
    ) }),
    /* @__PURE__ */ jsx9("div", { style: styles.captureFooter, children: /* @__PURE__ */ jsx9(
      "button",
      {
        style: { ...styles.captureButton, opacity: isCapturing ? 0.5 : 1 },
        onClick: handleCapture,
        disabled: isCapturing,
        children: /* @__PURE__ */ jsx9("div", { style: styles.captureButtonInner })
      }
    ) })
  ] });
}
function QualityCheck2({ label }) {
  return /* @__PURE__ */ jsxs8("div", { style: styles.qualityCheck, children: [
    /* @__PURE__ */ jsx9("div", { style: styles.qualityCheckIcon, children: "\u2713" }),
    /* @__PURE__ */ jsx9("span", { style: styles.qualityCheckLabel, children: label })
  ] });
}

// src/components/LivenessScreen.tsx
import { useEffect as useEffect9, useRef as useRef6, useState as useState8, useCallback as useCallback4 } from "react";

// src/hooks/useLivenessSignals.ts
import { useEffect as useEffect8, useRef as useRef5, useState as useState7 } from "react";
var FRAME_INTERVAL_MS2 = 250;
function useLivenessSignals(videoRef) {
  const [signals, setSignals] = useState7({
    faceDetected: false,
    detectorActive: false
  });
  const detectorRef = useRef5(null);
  const intervalRef = useRef5(null);
  useEffect8(() => {
    let cancelled = false;
    async function setupDetector() {
      const NativeFaceDetector = typeof window !== "undefined" && "FaceDetector" in window ? window.FaceDetector : null;
      if (!NativeFaceDetector) {
        return;
      }
      try {
        const detector = new NativeFaceDetector({ fastMode: true, maxDetectedFaces: 1 });
        if (cancelled) return;
        detectorRef.current = detector;
        setSignals((prev) => ({ ...prev, detectorActive: true }));
      } catch {
        return;
      }
      intervalRef.current = setInterval(async () => {
        const detector = detectorRef.current;
        const video = videoRef.current;
        if (!detector || !video || video.readyState < 2) return;
        try {
          const faces = await detector.detect(video);
          if (cancelled) return;
          setSignals((prev) => {
            const next = faces.length > 0;
            if (prev.faceDetected === next) return prev;
            return { ...prev, faceDetected: next };
          });
        } catch {
        }
      }, FRAME_INTERVAL_MS2);
    }
    setupDetector();
    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      detectorRef.current = null;
    };
  }, [videoRef]);
  return signals;
}

// src/components/LivenessScreen.tsx
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
function LivenessScreen({
  session,
  currentChallenge,
  completedChallenges,
  onChallengeComplete,
  onStart,
  onComplete,
  onCancel,
  lastChallengeError,
  showVisualGuides = true
}) {
  const videoRef = useRef6(null);
  const canvasRef = useRef6(null);
  const [stream, setStream] = useState8(null);
  const livenessSignals = useLivenessSignals(videoRef);
  const [cameraError, setCameraError] = useState8(null);
  const [phase, setPhase] = useState8("preparing");
  const [countdown, setCountdown] = useState8(3);
  const [capturing, setCapturing] = useState8(false);
  useEffect9(() => {
    injectKeyframes();
  }, []);
  useEffect9(() => {
    if (!session) onStart();
  }, [session, onStart]);
  useEffect9(() => {
    let mounted = true;
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 720 },
            height: { ideal: 720 }
          }
        });
        if (!mounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch {
        if (mounted) {
          setCameraError(
            "Camera access denied. Please enable camera permissions and try again."
          );
        }
      }
    }
    startCamera();
    return () => {
      mounted = false;
    };
  }, []);
  useEffect9(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);
  useEffect9(() => {
    if (!currentChallenge) return;
    setPhase("preparing");
    setCountdown(3);
  }, [currentChallenge?.id]);
  const captureFrame = useCallback4(async () => {
    if (!currentChallenge || !videoRef.current || !canvasRef.current || capturing) {
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;
    setCapturing(true);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      async (blob) => {
        if (blob) {
          await onChallengeComplete(blob);
        }
        setCapturing(false);
      },
      "image/jpeg",
      0.85
    );
  }, [currentChallenge, capturing, onChallengeComplete]);
  useEffect9(() => {
    if (!currentChallenge || capturing) return;
    if (countdown === 0) {
      if (phase === "preparing") {
        setPhase("capturing");
        setCountdown(3);
      } else {
        captureFrame();
      }
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1e3);
    return () => clearTimeout(t);
  }, [countdown, currentChallenge?.id, capturing, captureFrame, phase]);
  useEffect9(() => {
    if (session && !currentChallenge && completedChallenges > 0) {
      onComplete();
    }
  }, [session, currentChallenge, completedChallenges, onComplete]);
  if (cameraError) {
    return /* @__PURE__ */ jsx10("div", { style: styles.darkContainer, children: /* @__PURE__ */ jsxs9("div", { style: styles.errorContainer, children: [
      /* @__PURE__ */ jsx10("p", { style: styles.errorText, children: cameraError }),
      /* @__PURE__ */ jsx10("button", { style: styles.primaryButton, onClick: onCancel, children: "Go back" })
    ] }) });
  }
  if (!session) {
    return /* @__PURE__ */ jsx10("div", { style: styles.darkContainer, children: /* @__PURE__ */ jsxs9("div", { style: styles.loadingContainer, children: [
      /* @__PURE__ */ jsx10("div", { style: styles.spinner }),
      /* @__PURE__ */ jsx10("p", { style: { ...styles.loadingText, color: "rgba(255,255,255,0.6)" }, children: "Starting liveness check..." })
    ] }) });
  }
  const totalChallenges = session.challenges.length;
  return /* @__PURE__ */ jsxs9("div", { style: styles.captureContainer, children: [
    /* @__PURE__ */ jsx10(StepProgressBar, { total: 5, current: 5, isDark: true }),
    /* @__PURE__ */ jsxs9("div", { style: styles.darkScreenHeader, children: [
      /* @__PURE__ */ jsx10("div", { style: { width: 40 } }),
      /* @__PURE__ */ jsx10("h1", { style: styles.darkScreenTitle, children: "Liveness Check" }),
      /* @__PURE__ */ jsx10("button", { style: styles.glassCloseButton, onClick: onCancel, children: "\u2715" })
    ] }),
    /* @__PURE__ */ jsxs9(
      "div",
      {
        style: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          padding: "16px 0"
        },
        children: [
          /* @__PURE__ */ jsxs9("div", { style: { position: "relative" }, children: [
            /* @__PURE__ */ jsx10(
              "div",
              {
                style: {
                  width: "240px",
                  height: "300px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor: "#000",
                  border: "3px solid rgba(255,255,255,0.2)"
                },
                children: /* @__PURE__ */ jsx10(
                  "video",
                  {
                    ref: videoRef,
                    autoPlay: true,
                    playsInline: true,
                    muted: true,
                    style: {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: "scaleX(-1)"
                    }
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx10(
              "svg",
              {
                style: {
                  position: "absolute",
                  top: "-8px",
                  left: "-8px",
                  pointerEvents: "none"
                },
                width: "256",
                height: "316",
                viewBox: "0 0 256 316",
                children: /* @__PURE__ */ jsx10(
                  "ellipse",
                  {
                    cx: "128",
                    cy: "158",
                    rx: "124",
                    ry: "154",
                    fill: "none",
                    stroke: phase === "capturing" ? colors.teal : "rgba(13,148,136,0.4)",
                    strokeWidth: "5",
                    strokeDasharray: `${completedChallenges / totalChallenges * 880} 880`,
                    transform: "rotate(-90 128 158)",
                    strokeLinecap: "round"
                  }
                )
              }
            ),
            livenessSignals.detectorActive && /* @__PURE__ */ jsx10(
              "div",
              {
                style: {
                  position: "absolute",
                  bottom: "-32px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: livenessSignals.faceDetected ? colors.success : "rgba(255,255,255,0.55)",
                  backgroundColor: livenessSignals.faceDetected ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
                  border: livenessSignals.faceDetected ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.12)",
                  transition: "all 200ms",
                  whiteSpace: "nowrap"
                },
                children: livenessSignals.faceDetected ? "\u2713 Face detected" : "Position your face in the oval"
              }
            )
          ] }),
          currentChallenge && /* @__PURE__ */ jsxs9(
            "div",
            {
              style: {
                textAlign: "center",
                padding: "20px 24px",
                borderRadius: "16px",
                backgroundColor: phase === "capturing" ? "rgba(13,148,136,0.18)" : "rgba(255,255,255,0.06)",
                border: phase === "capturing" ? `1px solid ${colors.teal}` : "1px solid rgba(255,255,255,0.08)",
                minWidth: "260px",
                transition: "background-color 200ms, border-color 200ms"
              },
              children: [
                showVisualGuides && visualGuideForChallenge(currentChallenge.type) && /* @__PURE__ */ jsx10("div", { style: { display: "flex", justifyContent: "center", marginBottom: "12px" }, children: /* @__PURE__ */ jsx10(
                  VisualGuide,
                  {
                    kind: visualGuideForChallenge(currentChallenge.type),
                    size: 64
                  }
                ) }),
                /* @__PURE__ */ jsx10(
                  "p",
                  {
                    style: {
                      margin: 0,
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: phase === "capturing" ? colors.teal : "rgba(255,255,255,0.5)"
                    },
                    children: capturing ? "Checking..." : phase === "preparing" ? "Get ready" : "Now \u2014 hold the pose"
                  }
                ),
                /* @__PURE__ */ jsx10(
                  "h2",
                  {
                    style: {
                      ...styles.challengeTitle,
                      margin: "8px 0 0",
                      fontSize: "26px"
                    },
                    children: currentChallenge.instruction
                  }
                ),
                !capturing && /* @__PURE__ */ jsx10(
                  "p",
                  {
                    style: {
                      margin: "12px 0 0",
                      fontSize: "32px",
                      fontWeight: 700,
                      color: phase === "capturing" ? colors.teal : "rgba(255,255,255,0.75)",
                      lineHeight: 1
                    },
                    children: countdown
                  }
                ),
                lastChallengeError && phase === "preparing" && !capturing && /* @__PURE__ */ jsx10(
                  "p",
                  {
                    style: {
                      margin: "14px 0 0",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#fca5a5",
                      backgroundColor: "rgba(239,68,68,0.10)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      lineHeight: 1.35
                    },
                    children: lastChallengeError
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx10("canvas", { ref: canvasRef, style: { display: "none" } })
        ]
      }
    ),
    /* @__PURE__ */ jsxs9("div", { style: { padding: "16px 0" }, children: [
      /* @__PURE__ */ jsx10("div", { style: styles.progressDots, children: session.challenges.map((_, index) => /* @__PURE__ */ jsx10(
        "div",
        {
          style: {
            ...styles.progressDot,
            backgroundColor: index < completedChallenges ? colors.success : index === completedChallenges ? colors.teal : "rgba(255,255,255,0.15)"
          }
        },
        index
      )) }),
      /* @__PURE__ */ jsxs9("p", { style: styles.progressText, children: [
        "Challenge ",
        Math.min(completedChallenges + 1, totalChallenges),
        " of",
        " ",
        totalChallenges
      ] })
    ] }),
    /* @__PURE__ */ jsx10("div", { style: { padding: "0 24px 24px", textAlign: "center" }, children: /* @__PURE__ */ jsx10(
      "p",
      {
        style: {
          color: "rgba(255,255,255,0.5)",
          fontSize: "13px",
          margin: 0
        },
        children: phase === "preparing" ? "Position your face inside the oval. Get ready for the next prompt." : "Hold the pose until the capture completes."
      }
    ) })
  ] });
}

// src/components/ResultScreen.tsx
import { jsx as jsx11, jsxs as jsxs10 } from "react/jsx-runtime";
function ResultScreen({ verification, onDone, onRetry, resultPageMode, simplified, customMessages }) {
  const { status } = verification;
  const effectiveMode = resultPageMode ?? (simplified ? "simplified" : "detailed");
  if (effectiveMode === "simplified") {
    switch (status) {
      case "approved":
        return /* @__PURE__ */ jsx11(SimplifiedSuccess, { onDone, customMessages });
      case "rejected":
        return /* @__PURE__ */ jsx11(
          SimplifiedFailed,
          {
            verification,
            onRetry: onRetry || onDone,
            customMessages
          }
        );
      case "review_required":
        return /* @__PURE__ */ jsx11(SimplifiedReview, { verification, onDone, customMessages });
      case "expired":
        return /* @__PURE__ */ jsx11(
          SimplifiedFailed,
          {
            verification,
            onRetry: onRetry || onDone,
            customMessages: {
              failedTitle: "Document Expired",
              failedMessage: "The document you submitted has expired. Please use a valid document."
            }
          }
        );
      default:
        return /* @__PURE__ */ jsx11(SimplifiedSuccess, { onDone, customMessages });
    }
  }
  switch (status) {
    case "approved":
      return /* @__PURE__ */ jsx11(SuccessResult, { verification, onDone });
    case "rejected":
      return /* @__PURE__ */ jsx11(RejectedResult, { verification, onRetry: onRetry || onDone });
    case "expired":
      return /* @__PURE__ */ jsx11(ExpiredResult, { verification, onRetry: onRetry || onDone });
    case "review_required":
      return /* @__PURE__ */ jsx11(ManualReviewResult, { verification, onDone });
    default:
      return /* @__PURE__ */ jsx11(SuccessResult, { verification, onDone });
  }
}
function SuccessResult({ verification, onDone }) {
  const score = Math.round(
    verification.scores?.overall ?? 100 - (verification.riskScore ?? 16)
  );
  const metrics = computeScoreBreakdown(verification);
  return /* @__PURE__ */ jsxs10("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs10("div", { style: styles.resultContent, children: [
      /* @__PURE__ */ jsx11(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.success}15`
          },
          children: /* @__PURE__ */ jsx11(
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
      /* @__PURE__ */ jsx11("h1", { style: styles.resultTitle, children: "Verification approved" }),
      /* @__PURE__ */ jsx11("p", { style: styles.resultSubtitle, children: "Your identity has been successfully verified." }),
      /* @__PURE__ */ jsx11(
        ScoreCard,
        {
          score,
          badge: "PASSED",
          gradient: `linear-gradient(135deg, ${colors.teal}, ${colors.tealDark})`
        }
      ),
      metrics.map((m, i) => /* @__PURE__ */ jsx11(ScoreMetricRow, { ...m }, i))
    ] }),
    /* @__PURE__ */ jsx11("div", { style: styles.footer, children: /* @__PURE__ */ jsx11("button", { style: styles.primaryButton, onClick: onDone, children: "Done" }) })
  ] });
}
function RejectedResult({ verification, onRetry }) {
  const metrics = computeScoreBreakdown(verification);
  return /* @__PURE__ */ jsxs10("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs10("div", { style: styles.resultContent, children: [
      /* @__PURE__ */ jsx11(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.error}15`
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
              children: "\u2715"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx11("h1", { style: styles.resultTitle, children: "Verification rejected" }),
      /* @__PURE__ */ jsxs10(
        "div",
        {
          style: {
            margin: "16px 0",
            padding: "16px 20px",
            borderRadius: "12px",
            backgroundColor: `${colors.error}10`,
            border: `1px solid ${colors.error}40`
          },
          children: [
            /* @__PURE__ */ jsx11(
              "p",
              {
                style: {
                  margin: 0,
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: colors.error,
                  marginBottom: 6
                },
                children: "Reason for rejection"
              }
            ),
            /* @__PURE__ */ jsx11(
              "p",
              {
                style: {
                  margin: 0,
                  fontSize: "15px",
                  lineHeight: 1.45,
                  color: colors.textPrimary
                },
                children: verification.decisionReason || verification.rejectionReason || "We could not verify your identity. Please try again with a valid document."
              }
            )
          ]
        }
      ),
      metrics.map((m, i) => /* @__PURE__ */ jsx11(ScoreMetricRow, { ...m }, i))
    ] }),
    /* @__PURE__ */ jsx11("div", { style: styles.footer, children: /* @__PURE__ */ jsx11("button", { style: styles.primaryButton, onClick: onRetry, children: "Try again" }) })
  ] });
}
function ExpiredResult({ verification, onRetry }) {
  return /* @__PURE__ */ jsxs10("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs10("div", { style: styles.resultContent, children: [
      /* @__PURE__ */ jsx11(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.warning}15`,
            border: `2px solid ${colors.warning}30`
          },
          children: /* @__PURE__ */ jsx11(
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
      /* @__PURE__ */ jsx11("h1", { style: styles.resultTitle, children: "Document expired" }),
      /* @__PURE__ */ jsx11("p", { style: styles.resultSubtitle, children: verification.decisionReason || verification.rejectionReason || "The document you submitted has expired. Please use a valid, non-expired document." }),
      verification.documentVerification && /* @__PURE__ */ jsxs10("div", { style: styles.expiryCard, children: [
        /* @__PURE__ */ jsxs10("div", { style: styles.expiryRow, children: [
          /* @__PURE__ */ jsx11("span", { style: styles.expiryLabel, children: "Document type" }),
          /* @__PURE__ */ jsx11("span", { style: styles.expiryValue, children: verification.documentVerification.documentType || "ID Card" })
        ] }),
        verification.documentVerification.issuingCountry && /* @__PURE__ */ jsxs10("div", { style: styles.expiryRow, children: [
          /* @__PURE__ */ jsx11("span", { style: styles.expiryLabel, children: "Country" }),
          /* @__PURE__ */ jsx11("span", { style: styles.expiryValue, children: verification.documentVerification.issuingCountry })
        ] }),
        verification.documentVerification.expirationDate && /* @__PURE__ */ jsxs10("div", { style: styles.expiryRow, children: [
          /* @__PURE__ */ jsx11("span", { style: styles.expiryLabel, children: "Expired on" }),
          /* @__PURE__ */ jsx11("span", { style: styles.expiryBadge, children: verification.documentVerification.expirationDate })
        ] })
      ] }),
      /* @__PURE__ */ jsxs10("div", { style: { textAlign: "left" }, children: [
        /* @__PURE__ */ jsx11(GuidanceTip, { number: 1, text: "Check the expiration date on your document" }),
        /* @__PURE__ */ jsx11(GuidanceTip, { number: 2, text: "Use a different document that is currently valid" }),
        /* @__PURE__ */ jsx11(GuidanceTip, { number: 3, text: "Ensure the document details are clearly visible" })
      ] })
    ] }),
    /* @__PURE__ */ jsx11("div", { style: styles.footer, children: /* @__PURE__ */ jsx11("button", { style: styles.primaryButton, onClick: onRetry, children: "Try with a valid document" }) })
  ] });
}
function ManualReviewResult({ verification, onDone }) {
  const score = Math.round(
    verification.scores?.overall ?? 100 - (verification.riskScore ?? 32)
  );
  const metrics = computeScoreBreakdown(verification);
  return /* @__PURE__ */ jsxs10("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs10("div", { style: styles.resultContent, children: [
      /* @__PURE__ */ jsx11(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.info}15`,
            border: `2px solid ${colors.info}30`
          },
          children: /* @__PURE__ */ jsx11(
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
      /* @__PURE__ */ jsx11("h1", { style: styles.resultTitle, children: "Under review" }),
      /* @__PURE__ */ jsx11("p", { style: styles.resultSubtitle, children: "Your verification requires manual review. We'll notify you of the result." }),
      /* @__PURE__ */ jsx11(
        ScoreCard,
        {
          score,
          badge: "REVIEW",
          gradient: `linear-gradient(135deg, ${colors.info}, #0369A1)`
        }
      ),
      metrics.map((m, i) => /* @__PURE__ */ jsx11(ScoreMetricRow, { ...m }, i))
    ] }),
    /* @__PURE__ */ jsx11("div", { style: styles.footer, children: /* @__PURE__ */ jsx11("button", { style: styles.primaryButton, onClick: onDone, children: "Got it" }) })
  ] });
}
function GuidanceTip({ number, text }) {
  return /* @__PURE__ */ jsxs10("div", { style: styles.guidanceTip, children: [
    /* @__PURE__ */ jsx11("div", { style: styles.guidanceTipNumber, children: number }),
    /* @__PURE__ */ jsx11("span", { style: styles.guidanceTipText, children: text })
  ] });
}
function SimplifiedSuccess({ onDone, customMessages }) {
  return /* @__PURE__ */ jsxs10("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs10("div", { style: { ...styles.resultContent, textAlign: "center" }, children: [
      /* @__PURE__ */ jsx11(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.success}15`,
            width: 96,
            height: 96
          },
          children: /* @__PURE__ */ jsx11(
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
      /* @__PURE__ */ jsx11("h1", { style: { ...styles.resultTitle, fontSize: 24, marginTop: 16 }, children: customMessages?.successTitle || "Verification Successful" }),
      /* @__PURE__ */ jsx11("p", { style: { ...styles.resultSubtitle, fontSize: 16, maxWidth: 320, margin: "8px auto 0" }, children: customMessages?.successMessage || "Your identity has been successfully verified. You can now proceed." })
    ] }),
    /* @__PURE__ */ jsx11("div", { style: styles.footer, children: /* @__PURE__ */ jsx11("button", { style: styles.primaryButton, onClick: onDone, children: "Continue" }) })
  ] });
}
function SimplifiedFailed({
  verification,
  onRetry,
  customMessages
}) {
  const backendReason = verification?.decisionReason || verification?.rejectionReason || "";
  const message = customMessages?.failedMessage || backendReason || "We could not verify your identity. Please try again with a valid document.";
  return /* @__PURE__ */ jsxs10("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs10("div", { style: { ...styles.resultContent, textAlign: "center" }, children: [
      /* @__PURE__ */ jsx11(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.error}15`,
            width: 96,
            height: 96
          },
          children: /* @__PURE__ */ jsx11(
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
      /* @__PURE__ */ jsx11("h1", { style: { ...styles.resultTitle, fontSize: 24, marginTop: 16 }, children: customMessages?.failedTitle || "Verification Failed" }),
      /* @__PURE__ */ jsx11(
        "p",
        {
          style: {
            ...styles.resultSubtitle,
            fontSize: 16,
            maxWidth: 380,
            margin: "8px auto 0",
            lineHeight: 1.45
          },
          children: message
        }
      )
    ] }),
    /* @__PURE__ */ jsx11("div", { style: styles.footer, children: /* @__PURE__ */ jsx11("button", { style: styles.primaryButton, onClick: onRetry, children: "Try Again" }) })
  ] });
}
function SimplifiedReview({ verification, onDone, customMessages }) {
  return /* @__PURE__ */ jsxs10("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs10("div", { style: { ...styles.resultContent, textAlign: "center" }, children: [
      /* @__PURE__ */ jsx11(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.warning}15`,
            width: 96,
            height: 96
          },
          children: /* @__PURE__ */ jsx11(
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
      /* @__PURE__ */ jsx11("h1", { style: { ...styles.resultTitle, fontSize: 24, marginTop: 16 }, children: customMessages?.reviewTitle || "Verification Under Review" }),
      /* @__PURE__ */ jsx11("p", { style: { ...styles.resultSubtitle, fontSize: 16, maxWidth: 320, margin: "8px auto 0" }, children: customMessages?.reviewMessage || "Your verification requires additional review. We will notify you of the result." }),
      /* @__PURE__ */ jsxs10("div", { style: {
        marginTop: 24,
        padding: "12px 24px",
        backgroundColor: `${colors.info}10`,
        borderRadius: 8,
        border: `1px solid ${colors.info}30`,
        display: "inline-block"
      }, children: [
        /* @__PURE__ */ jsx11("span", { style: { fontSize: 12, color: colors.textSecondary }, children: "Reference: " }),
        /* @__PURE__ */ jsx11("span", { style: { fontSize: 14, fontWeight: 600, fontFamily: "monospace" }, children: verification.id.slice(0, 8) })
      ] })
    ] }),
    /* @__PURE__ */ jsx11("div", { style: styles.footer, children: /* @__PURE__ */ jsx11("button", { style: styles.primaryButton, onClick: onDone, children: "Got It" }) })
  ] });
}

// src/components/ErrorScreen.tsx
import { jsx as jsx12, jsxs as jsxs11 } from "react/jsx-runtime";
function ErrorScreen({ error, onRetry, onCancel }) {
  return /* @__PURE__ */ jsxs11("div", { style: styles.resultContainer, children: [
    /* @__PURE__ */ jsxs11("div", { style: styles.resultContent, children: [
      /* @__PURE__ */ jsx12(
        "div",
        {
          style: {
            ...styles.resultIconOuterRing,
            backgroundColor: colors.errorBg
          },
          children: /* @__PURE__ */ jsx12(
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
      /* @__PURE__ */ jsx12("h1", { style: styles.resultTitle, children: "Something went wrong" }),
      /* @__PURE__ */ jsx12("p", { style: styles.resultSubtitle, children: error.message }),
      error.recoverySuggestion && /* @__PURE__ */ jsx12("p", { style: { ...styles.bodyText, marginTop: "12px" }, children: error.recoverySuggestion })
    ] }),
    /* @__PURE__ */ jsxs11("div", { style: styles.footer, children: [
      error.isRetryable && /* @__PURE__ */ jsx12("button", { style: styles.primaryButton, onClick: onRetry, children: "Try Again" }),
      /* @__PURE__ */ jsx12("button", { style: styles.textButton, onClick: onCancel, children: "Cancel" })
    ] })
  ] });
}

// src/components/LoadingScreen.tsx
import { useEffect as useEffect10 } from "react";
import { jsx as jsx13, jsxs as jsxs12 } from "react/jsx-runtime";
function LoadingScreen({ message = "Loading..." }) {
  useEffect10(() => {
    injectKeyframes();
  }, []);
  return /* @__PURE__ */ jsx13("div", { style: styles.container, children: /* @__PURE__ */ jsxs12("div", { style: styles.loadingContainer, children: [
    /* @__PURE__ */ jsx13(
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
    /* @__PURE__ */ jsx13("p", { style: styles.loadingText, children: message })
  ] }) });
}

// src/components/VerificationFlow.tsx
import { jsx as jsx14, jsxs as jsxs13 } from "react/jsx-runtime";
function VerificationFlow({
  externalId,
  tier = "standard",
  documentTypes,
  expectedFirstName,
  expectedLastName,
  showVisualGuides = true,
  verificationId,
  onComplete,
  onError,
  onCancel,
  className,
  style
}) {
  const {
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
  } = useKoraIDV();
  const [selectedCountry, setSelectedCountry] = useState9(null);
  const [flowStep, setFlowStep] = useState9("consent");
  const [showFlipInstruction, setShowFlipInstruction] = useState9(true);
  const [supportedCountries, setSupportedCountries] = useState9([]);
  const [countriesLoading, setCountriesLoading] = useState9(false);
  useEffect11(() => {
    if (state.step === "document_front") {
      setShowFlipInstruction(true);
    }
  }, [state.step]);
  useEffect11(() => {
    if (verificationId) {
      resumeVerification(verificationId);
    } else {
      startVerification(externalId, tier, expectedFirstName, expectedLastName);
    }
  }, [verificationId, externalId, tier, expectedFirstName, expectedLastName, startVerification, resumeVerification]);
  useEffect11(() => {
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
    return /* @__PURE__ */ jsx14("div", { className, style: containerStyle, children: /* @__PURE__ */ jsx14(ErrorScreen, { error: state.error, onRetry: retry, onCancel: handleCancel }) });
  }
  if (state.isLoading && state.step !== "processing") {
    return /* @__PURE__ */ jsx14("div", { className, style: containerStyle, children: /* @__PURE__ */ jsx14(LoadingScreen, {}) });
  }
  if (flowStep === "consent" && state.step === "consent") {
    return /* @__PURE__ */ jsx14("div", { className, style: containerStyle, children: /* @__PURE__ */ jsx14(ConsentScreen, { onAccept: handleAcceptConsent, onDecline: handleCancel }) });
  }
  if (flowStep === "country_selection") {
    if (countriesLoading) {
      return /* @__PURE__ */ jsx14("div", { className, style: containerStyle, children: /* @__PURE__ */ jsx14(LoadingScreen, {}) });
    }
    return /* @__PURE__ */ jsx14("div", { className, style: containerStyle, children: /* @__PURE__ */ jsx14(
      CountrySelectionScreen,
      {
        countries: supportedCountries,
        onSelect: handleCountrySelect,
        onCancel: handleCancel
      }
    ) });
  }
  return /* @__PURE__ */ jsxs13("div", { className, style: containerStyle, children: [
    state.step === "document_selection" && /* @__PURE__ */ jsx14(
      DocumentSelectionScreen,
      {
        documentTypes,
        selectedCountry,
        onSelect: selectDocumentType,
        onCancel: handleCancel
      }
    ),
    state.step === "document_front" && /* @__PURE__ */ jsx14(
      DocumentCaptureScreen,
      {
        side: "front",
        onQualityCheck: (blob) => checkDocumentQuality(blob),
        onCapture: (imageData) => uploadDocument(imageData, "front", selectedCountry?.id),
        onCancel: handleCancel,
        showVisualGuides
      }
    ),
    state.step === "document_back" && showFlipInstruction && /* @__PURE__ */ jsx14(
      FlipDocumentScreen,
      {
        onContinue: () => setShowFlipInstruction(false),
        onCancel: handleCancel
      }
    ),
    state.step === "document_back" && !showFlipInstruction && /* @__PURE__ */ jsx14(
      DocumentCaptureScreen,
      {
        side: "back",
        onCapture: (imageData) => uploadDocument(imageData, "back", selectedCountry?.id),
        onCancel: handleCancel,
        showVisualGuides
      }
    ),
    state.step === "selfie" && /* @__PURE__ */ jsx14(
      SelfieCaptureScreen,
      {
        onCapture: uploadSelfie,
        onCancel: handleCancel,
        showVisualGuides
      }
    ),
    state.step === "liveness" && /* @__PURE__ */ jsx14(
      LivenessScreen,
      {
        session: state.livenessSession,
        currentChallenge: state.currentChallenge,
        completedChallenges: state.completedChallenges,
        onChallengeComplete: submitChallenge,
        onStart: startLiveness,
        onComplete: complete,
        onCancel: handleCancel,
        lastChallengeError: state.lastChallengeError,
        showVisualGuides
      }
    ),
    state.step === "processing" && /* @__PURE__ */ jsx14(ProcessingScreen, {}),
    state.step === "complete" && state.verification && /* @__PURE__ */ jsx14(
      ResultScreen,
      {
        verification: state.verification,
        onDone: () => onComplete?.(state.verification),
        onRetry: () => {
          setFlowStep("consent");
          setSelectedCountry(null);
          setShowFlipInstruction(true);
          retry();
        }
      }
    )
  ] });
}
export {
  ConsentScreen,
  CountrySelectionScreen,
  DocumentCaptureScreen,
  DocumentSelectionScreen,
  ErrorScreen,
  KoraIDVProvider,
  LivenessScreen,
  ProcessingScreen,
  ResultScreen,
  ScoreCard,
  ScoreMetricRow,
  SelfieCaptureScreen,
  StepProgressBar,
  VerificationFlow,
  useKoraIDV
};
