import React, { useState, useMemo } from 'react';
import { styles, colors } from './styles';
import { StepProgressBar } from './DesignSystem';

export interface CountryInfo {
  id: string;
  name: string;
  flagEmoji: string;
  documentTypes: string[];
}

interface CountrySelectionScreenProps {
  countries?: CountryInfo[];
  onSelect: (country: CountryInfo) => void;
  onCancel: () => void;
}

export function CountrySelectionScreen({ countries, onSelect, onCancel }: CountrySelectionScreenProps) {
  const [selected, setSelected] = useState<CountryInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    const countryList = countries || [];
    if (!searchQuery.trim()) return countryList;
    const q = searchQuery.toLowerCase();
    return countryList.filter((c) => c.name.toLowerCase().includes(q));
  }, [searchQuery, countries]);

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
