import React from 'react';
import { DocumentType, getDocumentTypeInfo } from '@koraidv/core';
import { styles, colors } from './styles';
import { StepProgressBar } from './DesignSystem';
import { CountryInfo } from './CountrySelectionScreen';

interface DocumentSelectionScreenProps {
  documentTypes?: DocumentType[];
  selectedCountry?: CountryInfo | null;
  onSelect: (type: DocumentType) => void;
  onCancel: () => void;
}

const defaultDocumentTypes = [
  DocumentType.US_PASSPORT,
  DocumentType.US_DRIVERS_LICENSE,
  DocumentType.INTERNATIONAL_PASSPORT,
  DocumentType.UK_PASSPORT,
];

export function DocumentSelectionScreen({
  documentTypes = defaultDocumentTypes,
  selectedCountry,
  onSelect,
  onCancel,
}: DocumentSelectionScreenProps) {
  // Filter by country if available
  const availableTypes = selectedCountry
    ? documentTypes.filter((t) => selectedCountry.documentTypes.includes(t))
    : documentTypes;

  const typesToShow = availableTypes.length > 0 ? availableTypes : documentTypes;

  return (
    <div style={styles.container}>
      {/* Progress bar */}
      <StepProgressBar total={5} current={2} />

      {/* Header */}
      <div style={styles.screenHeader}>
        <button style={styles.backButton} onClick={onCancel}>
          ←
        </button>
        <h1 style={styles.screenTitle}>Choose your document</h1>
      </div>

      {/* Country indicator */}
      {selectedCountry && (
        <div style={{ padding: '0 24px 16px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: colors.surface,
              fontSize: '13px',
              color: colors.textSecondary,
            }}
          >
            <span>{selectedCountry.flagEmoji}</span>
            <span>{selectedCountry.name}</span>
          </div>
        </div>
      )}

      {/* Document cards */}
      <div style={styles.scrollContent}>
        {typesToShow.map((type) => {
          const info = getDocumentTypeInfo(type);
          return (
            <button
              key={type}
              style={styles.documentCard}
              onClick={() => onSelect(type)}
            >
              <div
                style={{
                  ...styles.documentIconBox,
                  backgroundColor: colors.surface,
                }}
              >
                {getIcon(type)}
              </div>
              <div style={styles.documentInfo}>
                <span style={styles.documentName}>{info.displayName}</span>
                {info.requiresBack && (
                  <span style={styles.documentSubtext}>Front and back required</span>
                )}
              </div>
              <span style={styles.documentChevron}>›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getIcon(type: DocumentType): string {
  if (
    type === DocumentType.US_PASSPORT ||
    type === DocumentType.INTERNATIONAL_PASSPORT ||
    type === DocumentType.UK_PASSPORT
  ) {
    return '📕';
  }
  if (type === DocumentType.US_DRIVERS_LICENSE) {
    return '🚗';
  }
  return '🪪';
}
