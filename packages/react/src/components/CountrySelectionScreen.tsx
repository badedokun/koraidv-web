import React, { useState, useMemo } from 'react';
import { DocumentType } from '@koraidv/core';
import { styles, colors } from './styles';
import { StepProgressBar } from './DesignSystem';

export interface CountryInfo {
  id: string;
  name: string;
  flagEmoji: string;
  documentTypes: DocumentType[];
}

const defaultCountries: CountryInfo[] = [
  { id: 'US', name: 'United States', flagEmoji: '🇺🇸', documentTypes: [DocumentType.US_PASSPORT, DocumentType.US_DRIVERS_LICENSE, DocumentType.US_STATE_ID] },
  { id: 'GB', name: 'United Kingdom', flagEmoji: '🇬🇧', documentTypes: [DocumentType.UK_PASSPORT] },
  { id: 'DE', name: 'Germany', flagEmoji: '🇩🇪', documentTypes: [DocumentType.EU_ID_GERMANY, DocumentType.INTERNATIONAL_PASSPORT] },
  { id: 'FR', name: 'France', flagEmoji: '🇫🇷', documentTypes: [DocumentType.EU_ID_FRANCE, DocumentType.INTERNATIONAL_PASSPORT] },
  { id: 'ES', name: 'Spain', flagEmoji: '🇪🇸', documentTypes: [DocumentType.EU_ID_SPAIN, DocumentType.INTERNATIONAL_PASSPORT] },
  { id: 'IT', name: 'Italy', flagEmoji: '🇮🇹', documentTypes: [DocumentType.EU_ID_ITALY, DocumentType.INTERNATIONAL_PASSPORT] },
  { id: 'GH', name: 'Ghana', flagEmoji: '🇬🇭', documentTypes: [DocumentType.GHANA_CARD, DocumentType.INTERNATIONAL_PASSPORT] },
  { id: 'NG', name: 'Nigeria', flagEmoji: '🇳🇬', documentTypes: [DocumentType.NIGERIA_NIN, DocumentType.INTERNATIONAL_PASSPORT] },
  { id: 'KE', name: 'Kenya', flagEmoji: '🇰🇪', documentTypes: [DocumentType.KENYA_ID, DocumentType.INTERNATIONAL_PASSPORT] },
  { id: 'ZA', name: 'South Africa', flagEmoji: '🇿🇦', documentTypes: [DocumentType.SOUTH_AFRICA_ID, DocumentType.INTERNATIONAL_PASSPORT] },
];

interface CountrySelectionScreenProps {
  onSelect: (country: CountryInfo) => void;
  onCancel: () => void;
}

export function CountrySelectionScreen({ onSelect, onCancel }: CountrySelectionScreenProps) {
  const [selected, setSelected] = useState<CountryInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return defaultCountries;
    const q = searchQuery.toLowerCase();
    return defaultCountries.filter((c) => c.name.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div style={styles.container}>
      {/* Progress bar */}
      <StepProgressBar total={5} current={2} />

      {/* Header */}
      <div style={styles.screenHeader}>
        <button style={styles.backButton} onClick={onCancel}>
          ←
        </button>
        <h1 style={styles.screenTitle}>Select your country</h1>
      </div>

      {/* Selected country */}
      {selected && (
        <div style={{ padding: '0 24px 12px' }}>
          <div
            style={{
              ...styles.countryCard,
              ...styles.countryCardSelected,
              gridColumn: '1 / -1',
            }}
          >
            <span style={styles.countryFlag}>{selected.flagEmoji}</span>
            <span style={styles.countryName}>{selected.name}</span>
            <span style={styles.countryCheck}>✓</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ padding: '0 24px' }}>
        <div style={styles.searchBar}>
          <span style={{ color: colors.textTertiary, fontSize: '16px' }}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Country grid */}
      <div style={{ ...styles.scrollContent, flex: 1 }}>
        <div style={styles.countryGrid}>
          {filteredCountries
            .filter((c) => c.id !== selected?.id)
            .map((country) => (
              <button
                key={country.id}
                style={styles.countryCard}
                onClick={() => setSelected(country)}
              >
                <span style={styles.countryFlag}>{country.flagEmoji}</span>
                <span style={styles.countryName}>{country.name}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button
          style={{
            ...styles.primaryButton,
            opacity: selected ? 1 : 0.5,
            cursor: selected ? 'pointer' : 'not-allowed',
          }}
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
