/**
 * MRZ (Machine Readable Zone) Parser
 * Supports TD1, TD2, and TD3 formats
 */

/**
 * Parsed MRZ data
 */
export interface MrzData {
  /** Document format (TD1, TD2, TD3) */
  format: MrzFormat;
  /** Document type (P=Passport, I=ID, etc.) */
  documentType: string;
  /** Issuing country code (3-letter) */
  issuingCountry: string;
  /** Last name (surname) */
  lastName: string;
  /** First name(s) */
  firstName: string;
  /** Document number */
  documentNumber: string;
  /** Nationality (3-letter country code) */
  nationality: string;
  /** Date of birth (YYMMDD) */
  dateOfBirth: string;
  /** Sex (M/F/<) */
  sex: string;
  /** Expiration date (YYMMDD) */
  expirationDate: string;
  /** Optional data field 1 */
  optionalData1?: string;
  /** Optional data field 2 */
  optionalData2?: string;
  /** Whether all check digits are valid */
  isValid: boolean;
  /** Validation errors */
  validationErrors: string[];
}

/**
 * MRZ format type
 */
export type MrzFormat = 'TD1' | 'TD2' | 'TD3';

/**
 * MRZ Parser class
 */
export class MrzParser {
  /**
   * Parse MRZ text
   */
  parse(mrzText: string): MrzData | null {
    // Clean and normalize the text
    const lines = this.cleanMrzText(mrzText);

    if (!lines) {
      return null;
    }

    // Detect format
    const format = this.detectFormat(lines);

    if (!format) {
      return null;
    }

    switch (format) {
      case 'TD1':
        return this.parseTD1(lines);
      case 'TD2':
        return this.parseTD2(lines);
      case 'TD3':
        return this.parseTD3(lines);
      default:
        return null;
    }
  }

  /**
   * Clean and normalize MRZ text
   */
  private cleanMrzText(text: string): string[] | null {
    // Replace common OCR errors
    let cleaned = text
      .toUpperCase()
      .replace(/O/g, '0')
      .replace(/\s+/g, '')
      .replace(/[^A-Z0-9<]/g, '');

    // Split into lines (MRZ lines are 30, 36, or 44 characters)
    const lines: string[] = [];
    const lineLength = this.detectLineLength(cleaned);

    if (!lineLength) {
      return null;
    }

    for (let i = 0; i < cleaned.length; i += lineLength) {
      lines.push(cleaned.substring(i, i + lineLength));
    }

    return lines;
  }

  /**
   * Detect MRZ line length
   */
  private detectLineLength(text: string): number | null {
    const length = text.length;

    // TD1: 3 lines × 30 chars = 90
    if (length >= 88 && length <= 92) return 30;

    // TD2: 2 lines × 36 chars = 72
    if (length >= 70 && length <= 74) return 36;

    // TD3: 2 lines × 44 chars = 88
    if (length >= 86 && length <= 90) return 44;

    return null;
  }

  /**
   * Detect MRZ format
   */
  private detectFormat(lines: string[]): MrzFormat | null {
    if (lines.length === 3 && lines[0].length === 30) return 'TD1';
    if (lines.length === 2 && lines[0].length === 36) return 'TD2';
    if (lines.length === 2 && lines[0].length === 44) return 'TD3';
    return null;
  }

  /**
   * Parse TD1 format (ID cards - 3 lines × 30 chars)
   */
  private parseTD1(lines: string[]): MrzData {
    const validationErrors: string[] = [];

    // Line 1
    const documentType = lines[0].substring(0, 2).replace(/</g, '');
    const issuingCountry = lines[0].substring(2, 5);
    const documentNumber = lines[0].substring(5, 14).replace(/</g, '');
    const documentNumberCheck = lines[0].charAt(14);
    const optionalData1 = lines[0].substring(15, 30).replace(/</g, '') || undefined;

    // Line 2
    const dateOfBirth = lines[1].substring(0, 6);
    const dobCheck = lines[1].charAt(6);
    const sex = lines[1].charAt(7);
    const expirationDate = lines[1].substring(8, 14);
    const expirationCheck = lines[1].charAt(14);
    const nationality = lines[1].substring(15, 18);
    const optionalData2 = lines[1].substring(18, 29).replace(/</g, '') || undefined;
    const overallCheck = lines[1].charAt(29);

    // Line 3
    const nameParts = this.parseName(lines[2]);

    // Validate check digits
    if (!this.validateCheckDigit(documentNumber, documentNumberCheck)) {
      validationErrors.push('Invalid document number check digit');
    }
    if (!this.validateCheckDigit(dateOfBirth, dobCheck)) {
      validationErrors.push('Invalid date of birth check digit');
    }
    if (!this.validateCheckDigit(expirationDate, expirationCheck)) {
      validationErrors.push('Invalid expiration date check digit');
    }

    return {
      format: 'TD1',
      documentType,
      issuingCountry,
      lastName: nameParts.lastName,
      firstName: nameParts.firstName,
      documentNumber,
      nationality,
      dateOfBirth,
      sex,
      expirationDate,
      optionalData1,
      optionalData2,
      isValid: validationErrors.length === 0,
      validationErrors,
    };
  }

  /**
   * Parse TD2 format (Some ID cards - 2 lines × 36 chars)
   */
  private parseTD2(lines: string[]): MrzData {
    const validationErrors: string[] = [];

    // Line 1
    const documentType = lines[0].substring(0, 2).replace(/</g, '');
    const issuingCountry = lines[0].substring(2, 5);
    const nameParts = this.parseName(lines[0].substring(5, 36));

    // Line 2
    const documentNumber = lines[1].substring(0, 9).replace(/</g, '');
    const documentNumberCheck = lines[1].charAt(9);
    const nationality = lines[1].substring(10, 13);
    const dateOfBirth = lines[1].substring(13, 19);
    const dobCheck = lines[1].charAt(19);
    const sex = lines[1].charAt(20);
    const expirationDate = lines[1].substring(21, 27);
    const expirationCheck = lines[1].charAt(27);
    const optionalData1 = lines[1].substring(28, 35).replace(/</g, '') || undefined;
    const overallCheck = lines[1].charAt(35);

    // Validate check digits
    if (!this.validateCheckDigit(documentNumber, documentNumberCheck)) {
      validationErrors.push('Invalid document number check digit');
    }
    if (!this.validateCheckDigit(dateOfBirth, dobCheck)) {
      validationErrors.push('Invalid date of birth check digit');
    }
    if (!this.validateCheckDigit(expirationDate, expirationCheck)) {
      validationErrors.push('Invalid expiration date check digit');
    }

    return {
      format: 'TD2',
      documentType,
      issuingCountry,
      lastName: nameParts.lastName,
      firstName: nameParts.firstName,
      documentNumber,
      nationality,
      dateOfBirth,
      sex,
      expirationDate,
      optionalData1,
      isValid: validationErrors.length === 0,
      validationErrors,
    };
  }

  /**
   * Parse TD3 format (Passports - 2 lines × 44 chars)
   */
  private parseTD3(lines: string[]): MrzData {
    const validationErrors: string[] = [];

    // Line 1
    const documentType = lines[0].substring(0, 2).replace(/</g, '');
    const issuingCountry = lines[0].substring(2, 5);
    const nameParts = this.parseName(lines[0].substring(5, 44));

    // Line 2
    const documentNumber = lines[1].substring(0, 9).replace(/</g, '');
    const documentNumberCheck = lines[1].charAt(9);
    const nationality = lines[1].substring(10, 13);
    const dateOfBirth = lines[1].substring(13, 19);
    const dobCheck = lines[1].charAt(19);
    const sex = lines[1].charAt(20);
    const expirationDate = lines[1].substring(21, 27);
    const expirationCheck = lines[1].charAt(27);
    const optionalData1 = lines[1].substring(28, 42).replace(/</g, '') || undefined;
    const optionalCheck = lines[1].charAt(42);
    const overallCheck = lines[1].charAt(43);

    // Validate check digits
    if (!this.validateCheckDigit(documentNumber, documentNumberCheck)) {
      validationErrors.push('Invalid document number check digit');
    }
    if (!this.validateCheckDigit(dateOfBirth, dobCheck)) {
      validationErrors.push('Invalid date of birth check digit');
    }
    if (!this.validateCheckDigit(expirationDate, expirationCheck)) {
      validationErrors.push('Invalid expiration date check digit');
    }

    return {
      format: 'TD3',
      documentType,
      issuingCountry,
      lastName: nameParts.lastName,
      firstName: nameParts.firstName,
      documentNumber,
      nationality,
      dateOfBirth,
      sex,
      expirationDate,
      optionalData1,
      isValid: validationErrors.length === 0,
      validationErrors,
    };
  }

  /**
   * Parse name field
   */
  private parseName(nameField: string): { lastName: string; firstName: string } {
    const parts = nameField.split('<<');
    const lastName = parts[0]?.replace(/</g, ' ').trim() || '';
    const firstName = parts[1]?.replace(/</g, ' ').trim() || '';
    return { lastName, firstName };
  }

  /**
   * Validate MRZ check digit
   */
  private validateCheckDigit(data: string, checkDigit: string): boolean {
    const weights = [7, 3, 1];
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
      const char = data.charAt(i);
      let value: number;

      if (char >= '0' && char <= '9') {
        value = parseInt(char, 10);
      } else if (char >= 'A' && char <= 'Z') {
        value = char.charCodeAt(0) - 55; // A=10, B=11, etc.
      } else if (char === '<') {
        value = 0;
      } else {
        return false;
      }

      sum += value * weights[i % 3];
    }

    const expected = sum % 10;
    const actual = checkDigit === '<' ? 0 : parseInt(checkDigit, 10);

    return expected === actual;
  }

  /**
   * Format date from YYMMDD to human readable
   */
  static formatDate(yymmdd: string): string {
    if (yymmdd.length !== 6) return yymmdd;

    const yy = parseInt(yymmdd.substring(0, 2), 10);
    const mm = yymmdd.substring(2, 4);
    const dd = yymmdd.substring(4, 6);

    // Determine century (assume 00-30 is 2000s, 31-99 is 1900s)
    const year = yy <= 30 ? 2000 + yy : 1900 + yy;

    return `${year}-${mm}-${dd}`;
  }
}
