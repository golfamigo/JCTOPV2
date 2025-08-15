import i18n from '../localization/index';
import { isValidTaiwanPhone } from '../localization/utils/phoneUtils';
import { parseTWD } from '../localization/utils/currencyUtils';

/**
 * Service for localization validation and quality checks
 */
class LocalizationService {
  private static instance: LocalizationService;

  private constructor() {}

  public static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  /**
   * Check if all translation keys exist
   * @param keys - Array of translation keys to check
   * @returns Object with missing keys
   */
  public checkTranslationCompleteness(keys: string[]): {
    complete: boolean;
    missing: string[];
  } {
    const missing: string[] = [];
    
    for (const key of keys) {
      if (!i18n.exists(key)) {
        missing.push(key);
      }
    }
    
    return {
      complete: missing.length === 0,
      missing,
    };
  }

  /**
   * Validate Taiwan-specific formats
   */
  public validateFormats = {
    phone: (value: string): { valid: boolean; formatted?: string; error?: string } => {
      if (!value) {
        return { valid: false, error: '請輸入電話號碼' };
      }
      
      const valid = isValidTaiwanPhone(value);
      if (valid) {
        const { formatTaiwanPhone } = require('../localization/utils/phoneUtils');
        return { valid: true, formatted: formatTaiwanPhone(value) };
      }
      
      return { valid: false, error: '請輸入有效的台灣電話號碼' };
    },
    
    currency: (value: string): { valid: boolean; amount?: number; error?: string } => {
      if (!value) {
        return { valid: false, error: '請輸入金額' };
      }
      
      const amount = parseTWD(value);
      if (amount !== null && amount >= 0) {
        return { valid: true, amount };
      }
      
      return { valid: false, error: '請輸入有效的金額' };
    },
    
    taxNumber: (value: string): { valid: boolean; error?: string } => {
      if (!value) {
        return { valid: false, error: '請輸入統一編號' };
      }
      
      if (/^\d{8}$/.test(value)) {
        // Additional checksum validation for Taiwan tax number
        const weights = [1, 2, 1, 2, 1, 2, 4, 1];
        let sum = 0;
        
        for (let i = 0; i < 8; i++) {
          const product = parseInt(value[i]) * weights[i];
          sum += Math.floor(product / 10) + (product % 10);
        }
        
        const valid = sum % 10 === 0 || (sum % 10 === 9 && value[6] === '7');
        
        if (valid) {
          return { valid: true };
        }
        
        return { valid: false, error: '統一編號檢查碼錯誤' };
      }
      
      return { valid: false, error: '統一編號必須是8位數字' };
    },
    
    idNumber: (value: string): { valid: boolean; error?: string } => {
      if (!value) {
        return { valid: false, error: '請輸入身分證字號' };
      }
      
      // Taiwan ID number validation
      const pattern = /^[A-Z][12]\d{8}$/;
      if (!pattern.test(value)) {
        return { valid: false, error: '身分證字號格式錯誤' };
      }
      
      // Checksum validation
      const letterValues: Record<string, number> = {
        A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18,
        K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27,
        U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33,
      };
      
      const firstLetter = value[0];
      const letterValue = letterValues[firstLetter];
      
      let sum = Math.floor(letterValue / 10) + (letterValue % 10) * 9;
      
      for (let i = 1; i < 9; i++) {
        sum += parseInt(value[i]) * (9 - i);
      }
      
      sum += parseInt(value[9]);
      
      const valid = sum % 10 === 0;
      
      if (valid) {
        return { valid: true };
      }
      
      return { valid: false, error: '身分證字號檢查碼錯誤' };
    },
  };

  /**
   * Check grammar and tone consistency
   * @param text - Text to check
   * @returns Analysis results
   */
  public analyzeTextQuality(text: string): {
    hasFormalTone: boolean;
    hasInformalTone: boolean;
    hasSimplifiedCharacters: boolean;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    
    // Check for formal pronouns
    const hasFormalTone = text.includes('您');
    const hasInformalTone = text.includes('你') && !text.includes('您');
    
    // Check for simplified Chinese characters (common ones)
    const simplifiedChars = ['个', '们', '号', '开', '关', '门', '马', '车'];
    const hasSimplifiedCharacters = simplifiedChars.some(char => text.includes(char));
    
    if (hasFormalTone && hasInformalTone) {
      suggestions.push('文本同時包含正式（您）和非正式（你）用語，建議統一語調');
    }
    
    if (hasSimplifiedCharacters) {
      suggestions.push('文本可能包含簡體字，請使用繁體字');
    }
    
    // Check for common translation issues
    if (text.includes('用户')) {
      suggestions.push('建議將「用户」改為「使用者」');
    }
    
    if (text.includes('账')) {
      suggestions.push('建議將「账」改為「帳」');
    }
    
    if (text.includes('软件')) {
      suggestions.push('建議將「软件」改為「軟體」');
    }
    
    return {
      hasFormalTone,
      hasInformalTone,
      hasSimplifiedCharacters,
      suggestions,
    };
  }

  /**
   * Get localization statistics
   * @returns Statistics object
   */
  public getLocalizationStats(): {
    language: string;
    totalKeys: number;
    characterCount: number;
  } {
    const resources = i18n.getResourceBundle('zh-TW', 'translation');
    
    const countKeys = (obj: any): number => {
      let count = 0;
      for (const key in obj) {
        if (typeof obj[key] === 'object') {
          count += countKeys(obj[key]);
        } else {
          count++;
        }
      }
      return count;
    };
    
    const countCharacters = (obj: any): number => {
      let count = 0;
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          count += obj[key].length;
        } else if (typeof obj[key] === 'object') {
          count += countCharacters(obj[key]);
        }
      }
      return count;
    };
    
    return {
      language: i18n.language,
      totalKeys: countKeys(resources),
      characterCount: countCharacters(resources),
    };
  }

  /**
   * Export translations for review
   * @returns Flattened translations object
   */
  public exportTranslations(): Record<string, string> {
    const resources = i18n.getResourceBundle('zh-TW', 'translation');
    const flattened: Record<string, string> = {};
    
    const flatten = (obj: any, prefix: string = '') => {
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'string') {
          flattened[fullKey] = obj[key];
        } else if (typeof obj[key] === 'object') {
          flatten(obj[key], fullKey);
        }
      }
    };
    
    flatten(resources);
    return flattened;
  }

  /**
   * Find untranslated or placeholder text
   * @returns Array of keys with potential issues
   */
  public findUntranslatedText(): string[] {
    const translations = this.exportTranslations();
    const issues: string[] = [];
    
    for (const [key, value] of Object.entries(translations)) {
      // Check for common placeholder patterns
      if (
        value.includes('TODO') ||
        value.includes('FIXME') ||
        value.includes('...') ||
        value === '' ||
        /^[A-Z_]+$/.test(value) || // All caps likely placeholder
        /^\[.*\]$/.test(value) // Bracketed text likely placeholder
      ) {
        issues.push(key);
      }
    }
    
    return issues;
  }
}

export const localizationService = LocalizationService.getInstance();
export default localizationService;