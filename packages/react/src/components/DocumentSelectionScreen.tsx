import React, { useState } from 'react';
import { DocumentType, getDocumentTypeInfo } from '@koraidv/core';
import { styles } from './styles';

interface DocumentSelectionScreenProps {
  documentTypes?: DocumentType[];
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
  onSelect,
  onCancel,
}: DocumentSelectionScreenProps) {
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);

  const groupedTypes = groupByCategory(documentTypes);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.screenHeader}>
        <button style={styles.closeButton} onClick={onCancel}>
          ✕
        </button>
        <h1 style={styles.screenTitle}>Select Document Type</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* Content */}
      <div style={styles.scrollContent}>
        <p style={styles.subtitle}>Choose the type of ID you'll use for verification</p>

        {Object.entries(groupedTypes).map(([category, types]) => (
          <div key={category} style={styles.categorySection}>
            <h3 style={styles.categoryTitle}>{category}</h3>
            {types.map((type) => {
              const info = getDocumentTypeInfo(type);
              return (
                <DocumentTypeCard
                  key={type}
                  type={type}
                  displayName={info.displayName}
                  requiresBack={info.requiresBack}
                  isSelected={selectedType === type}
                  onClick={() => setSelectedType(type)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button
          style={{
            ...styles.primaryButton,
            opacity: selectedType ? 1 : 0.5,
            cursor: selectedType ? 'pointer' : 'not-allowed',
          }}
          onClick={() => selectedType && onSelect(selectedType)}
          disabled={!selectedType}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function DocumentTypeCard({
  type,
  displayName,
  requiresBack,
  isSelected,
  onClick,
}: {
  type: DocumentType;
  displayName: string;
  requiresBack: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      style={{
        ...styles.documentCard,
        borderColor: isSelected ? '#2563EB' : '#E2E8F0',
        backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
      }}
      onClick={onClick}
    >
      <span style={styles.documentIcon}>{getIcon(type)}</span>
      <div style={styles.documentInfo}>
        <span style={styles.documentName}>{displayName}</span>
        {requiresBack && (
          <span style={styles.documentSubtext}>Front and back required</span>
        )}
      </div>
      <div
        style={{
          ...styles.radioButton,
          borderColor: isSelected ? '#2563EB' : '#CBD5E1',
          backgroundColor: isSelected ? '#2563EB' : 'transparent',
        }}
      >
        {isSelected && <div style={styles.radioButtonInner} />}
      </div>
    </button>
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

function groupByCategory(types: DocumentType[]): Record<string, DocumentType[]> {
  const groups: Record<string, DocumentType[]> = {};

  for (const type of types) {
    const category = getCategory(type);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(type);
  }

  return groups;
}

function getCategory(type: DocumentType): string {
  switch (type) {
    case DocumentType.US_PASSPORT:
    case DocumentType.US_DRIVERS_LICENSE:
    case DocumentType.US_STATE_ID:
      return 'United States';
    case DocumentType.INTERNATIONAL_PASSPORT:
      return 'International';
    case DocumentType.UK_PASSPORT:
      return 'United Kingdom';
    case DocumentType.EU_ID_GERMANY:
    case DocumentType.EU_ID_FRANCE:
    case DocumentType.EU_ID_SPAIN:
    case DocumentType.EU_ID_ITALY:
      return 'European Union';
    case DocumentType.GHANA_CARD:
    case DocumentType.NIGERIA_NIN:
    case DocumentType.KENYA_ID:
    case DocumentType.SOUTH_AFRICA_ID:
      return 'Africa';
    default:
      return 'Other';
  }
}
