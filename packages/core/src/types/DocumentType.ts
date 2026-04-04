/**
 * Supported document types.
 *
 * Note: This enum is maintained for backward compatibility. The SDK now fetches
 * the full list of supported countries and document types dynamically from the API.
 */
export enum DocumentType {
  // US Documents
  US_DRIVERS_LICENSE = 'us_drivers_license',
  US_STATE_ID = 'us_state_id',
  US_GREEN_CARD = 'us_green_card',

  // Passport (covers all 197 ICAO-compliant countries)
  INTERNATIONAL_PASSPORT = 'international_passport',

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

  // Nigeria (additional)
  NIGERIA_VOTERS_CARD = 'ng_voters_card',

  // Liberia
  LIBERIA_ID = 'lr_id',
  LIBERIA_DRIVERS_LICENSE = 'lr_drivers_license',
  LIBERIA_VOTERS_CARD = 'lr_voters_card',

  // Sierra Leone
  SIERRA_LEONE_ID = 'sl_id',
  SIERRA_LEONE_DRIVERS_LICENSE = 'sl_drivers_license',
  SIERRA_LEONE_VOTERS_CARD = 'sl_voters_card',

  // Gambia
  GAMBIA_ID = 'gm_id',
  GAMBIA_DRIVERS_LICENSE = 'gm_drivers_license',

  // UK (additional)
  UK_BRP = 'uk_brp',

  // Canada
  CANADA_DRIVERS_LICENSE = 'ca_drivers_license',
  CANADA_PR_CARD = 'ca_pr_card',
  CANADA_NATIONAL_ID = 'ca_national_id',

  // India
  INDIA_DRIVERS_LICENSE = 'in_drivers_license',

  // EU Residence Permits
  GERMANY_RP = 'de_rp',
  FRANCE_RP = 'fr_rp',
  ITALY_RP = 'it_rp',
  SPAIN_RP = 'es_rp',
  IRELAND_RP = 'ie_rp',
  PORTUGAL_RP = 'pt_rp',
  SWEDEN_RP = 'se_rp',
  DENMARK_RP = 'dk_rp',
  NORWAY_RP = 'no_rp',
  FINLAND_RP = 'fi_rp',
  POLAND_RP = 'pl_rp',
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
    [DocumentType.US_GREEN_CARD]: {
      code: DocumentType.US_GREEN_CARD,
      displayName: 'US Permanent Resident Card',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.INTERNATIONAL_PASSPORT]: {
      code: DocumentType.INTERNATIONAL_PASSPORT,
      displayName: 'International Passport',
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
    [DocumentType.CANADA_PR_CARD]: {
      code: DocumentType.CANADA_PR_CARD,
      displayName: 'Canadian Permanent Resident Card',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.CANADA_NATIONAL_ID]: {
      code: DocumentType.CANADA_NATIONAL_ID,
      displayName: 'Canadian National Identity Card',
      hasMRZ: true,
      requiresBack: false,
    },
    [DocumentType.INDIA_DRIVERS_LICENSE]: {
      code: DocumentType.INDIA_DRIVERS_LICENSE,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.NIGERIA_VOTERS_CARD]: {
      code: DocumentType.NIGERIA_VOTERS_CARD,
      displayName: "Voter's Card",
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.LIBERIA_ID]: {
      code: DocumentType.LIBERIA_ID,
      displayName: 'Liberia ID',
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.LIBERIA_DRIVERS_LICENSE]: {
      code: DocumentType.LIBERIA_DRIVERS_LICENSE,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.LIBERIA_VOTERS_CARD]: {
      code: DocumentType.LIBERIA_VOTERS_CARD,
      displayName: "Voter's Card",
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.SIERRA_LEONE_ID]: {
      code: DocumentType.SIERRA_LEONE_ID,
      displayName: 'Sierra Leone ID',
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.SIERRA_LEONE_DRIVERS_LICENSE]: {
      code: DocumentType.SIERRA_LEONE_DRIVERS_LICENSE,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.SIERRA_LEONE_VOTERS_CARD]: {
      code: DocumentType.SIERRA_LEONE_VOTERS_CARD,
      displayName: "Voter's Card",
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.GAMBIA_ID]: {
      code: DocumentType.GAMBIA_ID,
      displayName: 'Gambia ID',
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.GAMBIA_DRIVERS_LICENSE]: {
      code: DocumentType.GAMBIA_DRIVERS_LICENSE,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true,
    },
    [DocumentType.UK_BRP]: {
      code: DocumentType.UK_BRP,
      displayName: 'UK Biometric Residence Permit',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.GERMANY_RP]: {
      code: DocumentType.GERMANY_RP,
      displayName: 'Germany Residence Permit',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.FRANCE_RP]: {
      code: DocumentType.FRANCE_RP,
      displayName: 'France Residence Permit',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.ITALY_RP]: {
      code: DocumentType.ITALY_RP,
      displayName: 'Italy Residence Permit',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.SPAIN_RP]: {
      code: DocumentType.SPAIN_RP,
      displayName: 'Spain Residence Permit',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.IRELAND_RP]: {
      code: DocumentType.IRELAND_RP,
      displayName: 'Ireland Residence Permit',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.PORTUGAL_RP]: {
      code: DocumentType.PORTUGAL_RP,
      displayName: 'Portugal Residence Permit',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.SWEDEN_RP]: {
      code: DocumentType.SWEDEN_RP,
      displayName: 'Sweden Residence Permit',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.DENMARK_RP]: {
      code: DocumentType.DENMARK_RP,
      displayName: 'Denmark Residence Permit',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.NORWAY_RP]: {
      code: DocumentType.NORWAY_RP,
      displayName: 'Norway Residence Permit',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.FINLAND_RP]: {
      code: DocumentType.FINLAND_RP,
      displayName: 'Finland Residence Permit',
      hasMRZ: true,
      requiresBack: true,
    },
    [DocumentType.POLAND_RP]: {
      code: DocumentType.POLAND_RP,
      displayName: 'Poland Residence Permit',
      hasMRZ: true,
      requiresBack: true,
    },
  };

  return info[type];
}
