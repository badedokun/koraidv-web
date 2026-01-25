import { CSSProperties } from 'react';

/**
 * Shared styles for React components
 */
export const styles: Record<string, CSSProperties> = {
  // Container
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    padding: '32px 16px',
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
  },

  iconContainer: {
    marginBottom: '16px',
  },

  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1E293B',
    margin: 0,
  },

  subtitle: {
    fontSize: '16px',
    color: '#64748B',
    margin: '8px 0 0 0',
  },

  // Content
  content: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
  },

  scrollContent: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
  },

  section: {
    marginBottom: '24px',
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1E293B',
    margin: '0 0 12px 0',
  },

  // Checklist
  checkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  checklistIcon: {
    fontSize: '24px',
  },

  checklistText: {
    fontSize: '16px',
    color: '#1E293B',
  },

  // Bullet list
  bulletList: {
    margin: 0,
    paddingLeft: '20px',
  },

  bulletItem: {
    fontSize: '16px',
    color: '#64748B',
    marginBottom: '8px',
  },

  bodyText: {
    fontSize: '16px',
    color: '#64748B',
    lineHeight: 1.5,
    margin: 0,
  },

  // Footer
  footer: {
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E2E8F0',
  },

  // Buttons
  primaryButton: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#FFFFFF',
    backgroundColor: '#2563EB',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },

  textButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    color: '#64748B',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },

  // Screen header
  screenHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #E2E8F0',
  },

  screenTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1E293B',
    margin: 0,
  },

  closeButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: '#64748B',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
  },

  closeButtonLight: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
  },

  // Document selection
  categorySection: {
    marginBottom: '24px',
  },

  categoryTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 12px 0',
  },

  documentCard: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '16px',
    marginBottom: '8px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #E2E8F0',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
  },

  documentIcon: {
    fontSize: '28px',
    marginRight: '16px',
  },

  documentInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },

  documentName: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#1E293B',
  },

  documentSubtext: {
    fontSize: '14px',
    color: '#64748B',
  },

  radioButton: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid #CBD5E1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioButtonInner: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
  },

  // Capture screens
  captureContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#000000',
  },

  captureHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  captureTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#FFFFFF',
    margin: 0,
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

  documentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  documentFrame: {
    width: '85%',
    aspectRatio: '1.586',
    border: '3px solid #FFFFFF',
    borderRadius: '12px',
    position: 'relative',
    backgroundColor: 'transparent',
  },

  corner: {
    position: 'absolute',
    width: '30px',
    height: '30px',
    borderColor: '#FFFFFF',
    borderStyle: 'solid',
    borderWidth: '4px 0 0 4px',
  },

  selfieOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  faceGuide: {
    width: '250px',
    height: '325px',
    border: '4px solid #FFFFFF',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
  },

  captureInstructions: {
    padding: '16px',
    textAlign: 'center',
    background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
    position: 'absolute',
    bottom: '120px',
    left: 0,
    right: 0,
  },

  instructionText: {
    fontSize: '16px',
    color: '#FFFFFF',
    margin: 0,
    padding: '8px 16px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '8px',
    display: 'inline-block',
  },

  captureFooter: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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

  // Liveness
  livenessPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },

  challengeIcon: {
    fontSize: '80px',
  },

  livenessInstructions: {
    padding: '24px',
    textAlign: 'center',
    position: 'absolute',
    bottom: '100px',
    left: 0,
    right: 0,
  },

  challengeText: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#FFFFFF',
    margin: '0 0 16px 0',
  },

  progressDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px',
  },

  progressDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#E2E8F0',
  },

  progressText: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
  },

  // Result screen
  resultContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    textAlign: 'center',
  },

  resultIcon: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },

  resultTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1E293B',
    margin: '0 0 8px 0',
  },

  resultSubtitle: {
    fontSize: '16px',
    color: '#64748B',
    margin: 0,
    maxWidth: '300px',
  },

  recoverySuggestion: {
    fontSize: '14px',
    color: '#64748B',
    margin: '12px 0 0 0',
    maxWidth: '300px',
  },

  // Info card
  infoCard: {
    width: '100%',
    maxWidth: '320px',
    marginTop: '32px',
    backgroundColor: '#F8FAFC',
    borderRadius: '12px',
    overflow: 'hidden',
  },

  infoCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    borderBottom: '1px solid #E2E8F0',
  },

  infoCardIcon: {
    fontSize: '20px',
  },

  infoCardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1E293B',
  },

  infoCardBody: {
    padding: '16px',
  },

  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },

  infoLabel: {
    fontSize: '14px',
    color: '#64748B',
  },

  infoValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1E293B',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },

  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E2E8F0',
    borderTopColor: '#2563EB',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  loadingText: {
    fontSize: '16px',
    color: '#64748B',
  },

  // Error
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
    color: '#DC2626',
    marginBottom: '24px',
  },
};
