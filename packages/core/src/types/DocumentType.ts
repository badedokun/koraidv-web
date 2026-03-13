/**
 * Supported document types.
 *
 * Note: This enum is maintained for backward compatibility. The SDK now fetches
 * the full list of supported countries and document types dynamically from the API.
 */
export enum DocumentType {
  // US Documents
  US_PASSPORT = 'us_passport',
  US_DRIVERS_LICENSE = 'us_drivers_license',
  US_STATE_ID = 'us_state_id',

  // International
  INTERNATIONAL_PASSPORT = 'international_passport',
  UK_PASSPORT = 'uk_passport',

  // EU ID Cards
  EU_ID_GERMANY = 'eu_id_de',
  EU_ID_FRANCE = 'eu_id_fr',
  EU_ID_SPAIN = 'eu_id_es',
  EU_ID_ITALY = 'eu_id_it',

  // Africa
  GHANA_CARD = 'ghana_card',
  NIGERIA_NIN = 'ng_nin',
  NIGERIA_DRIVERS_LICENSE = 'ng_drivers_license',
  GHANA_DRIVERS_LICENSE = 'gh_drivers_license',
  KENYA_ID = 'ke_id',
  KENYA_DRIVERS_LICENSE = 'ke_drivers_license',
  SOUTH_AFRICA_ID = 'za_id',
  SOUTH_AFRICA_DRIVERS_LICENSE = 'za_drivers_license',

  // UK
  UK_DRIVERS_LICENSE = 'uk_drivers_license',

  // Canada
  CANADA_DRIVERS_LICENSE = 'ca_drivers_license',

  // India
  INDIA_DRIVERS_LICENSE = 'in_drivers_license',
}

/**
 * Document type metadata
 */
export interface DocumentTypeInfo {
  code: DocumentType;
  displayName: string;
  hasMRZ: boolean;
  requiresBack: boolean;
}

/**
 * Get document type info
 */
export function getDocumentTypeInfo(type: DocumentType): DocumentTypeInfo {
  const info: Record<DocumentType, DocumentTypeInfo> = {
    [DocumentType.US_PASSPORT]: {
      code: DocumentType.US_PASSPORT,
      displayName: 'US Passport',
      hasMRZ: true,
      requiresBack: false,
    },
    [DocumentType.US_DRIVERS_LICENSE]: {
      code: DocumentType.US_DRIVERS_LICENSE,
      displayName: "US Driver's License",
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.US_STATE_ID]: {
      code: DocumentType.US_STATE_ID,
      displayName: 'US State ID',
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.INTERNATIONAL_PASSPORT]: {
      code: DocumentType.INTERNATIONAL_PASSPORT,
      displayName: 'International Passport',
      hasMRZ: true,
      requiresBack: false,
    },
    [DocumentType.UK_PASSPORT]: {
      code: DocumentType.UK_PASSPORT,
      displayName: 'UK Passport',
      hasMRZ: true,
      requiresBack: false,
    },
    [DocumentType.EU_ID_GERMANY]: {
      code: DocumentType.EU_ID_GERMANY,
      displayName: 'German ID Card',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.EU_ID_FRANCE]: {
      code: DocumentType.EU_ID_FRANCE,
      displayName: 'French ID Card',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.EU_ID_SPAIN]: {
      code: DocumentType.EU_ID_SPAIN,
      displayName: 'Spanish ID Card',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.EU_ID_ITALY]: {
      code: DocumentType.EU_ID_ITALY,
      displayName: 'Italian ID Card',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.GHANA_CARD]: {
      code: DocumentType.GHANA_CARD,
      displayName: 'Ghana Card',
      hasMRZ: false,
      requiresBack: false,
    },
    [DocumentType.NIGERIA_NIN]: {
      code: DocumentType.NIGERIA_NIN,
      displayName: 'Nigeria NIN',
      hasMRZ: false,
      requiresBack: false,
    },
    [DocumentType.KENYA_ID]: {
      code: DocumentType.KENYA_ID,
      displayName: 'Kenya ID',
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.SOUTH_AFRICA_ID]: {
      code: DocumentType.SOUTH_AFRICA_ID,
      displayName: 'South Africa ID',
      hasMRZ: false,
      requiresBack: false,
    },
    [DocumentType.NIGERIA_DRIVERS_LICENSE]: {
      code: DocumentType.NIGERIA_DRIVERS_LICENSE,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.GHANA_DRIVERS_LICENSE]: {
      code: DocumentType.GHANA_DRIVERS_LICENSE,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.KENYA_DRIVERS_LICENSE]: {
      code: DocumentType.KENYA_DRIVERS_LICENSE,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.SOUTH_AFRICA_DRIVERS_LICENSE]: {
      code: DocumentType.SOUTH_AFRICA_DRIVERS_LICENSE,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.UK_DRIVERS_LICENSE]: {
      code: DocumentType.UK_DRIVERS_LICENSE,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.CANADA_DRIVERS_LICENSE]: {
      code: DocumentType.CANADA_DRIVERS_LICENSE,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.INDIA_DRIVERS_LICENSE]: {
      code: DocumentType.INDIA_DRIVERS_LICENSE,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true,
    },
  };

  return info[type];
}
