/**
 * Supported document types
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

  // Africa (Priority 2)
  GHANA_CARD = 'ghana_card',
  NIGERIA_NIN = 'ng_nin',
  KENYA_ID = 'ke_id',
  SOUTH_AFRICA_ID = 'za_id',
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
  };

  return info[type];
}
