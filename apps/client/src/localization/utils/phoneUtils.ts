import { TAIWAN_PHONE_FORMATS } from '../constants/taiwanFormats';

/**
 * Validate Taiwan phone number
 * @param phone - Phone number to validate
 * @returns True if valid Taiwan phone number
 */
export function isValidTaiwanPhone(phone: string): boolean {
  if (!phone) return false;
  
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check mobile number
  if (TAIWAN_PHONE_FORMATS.mobile.pattern.test(cleaned)) {
    return true;
  }
  
  // Check landline numbers
  const landlinePatterns = [
    TAIWAN_PHONE_FORMATS.landline.taipei.pattern,
    TAIWAN_PHONE_FORMATS.landline.kaohsiung.pattern,
    TAIWAN_PHONE_FORMATS.landline.taichung.pattern,
    TAIWAN_PHONE_FORMATS.landline.other.pattern,
  ];
  
  for (const pattern of landlinePatterns) {
    if (pattern.test(cleaned)) {
      return true;
    }
  }
  
  // Check toll-free number
  if (TAIWAN_PHONE_FORMATS.tollFree.pattern.test(cleaned)) {
    return true;
  }
  
  return false;
}

/**
 * Format Taiwan phone number
 * @param phone - Phone number to format
 * @param international - Whether to include international prefix
 * @returns Formatted phone number
 */
export function formatTaiwanPhone(phone: string, international: boolean = false): string {
  if (!phone) return '';
  
  // Remove all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Remove country code if present
  if (cleaned.startsWith('+886')) {
    cleaned = '0' + cleaned.substring(4);
  } else if (cleaned.startsWith('886')) {
    cleaned = '0' + cleaned.substring(3);
  }
  
  // Mobile number (09XX-XXX-XXX)
  if (cleaned.match(/^09\d{8}$/)) {
    const formatted = cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3');
    return international ? `+886-${formatted.substring(1)}` : formatted;
  }
  
  // Taipei landline (02-XXXX-XXXX)
  if (cleaned.match(/^02\d{8}$/)) {
    const formatted = cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    return international ? `+886-${formatted.substring(1)}` : formatted;
  }
  
  // Kaohsiung landline (07-XXX-XXXX)
  if (cleaned.match(/^07\d{7}$/)) {
    const formatted = cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    return international ? `+886-${formatted.substring(1)}` : formatted;
  }
  
  // Taichung landline (04-XXXX-XXXX)
  if (cleaned.match(/^04\d{8}$/)) {
    const formatted = cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    return international ? `+886-${formatted.substring(1)}` : formatted;
  }
  
  // Other area codes (03, 05, 06, 08, 09) - 7 or 8 digits after area code
  if (cleaned.match(/^0[3568]\d{7,8}$/)) {
    const areaCode = cleaned.substring(0, 2);
    const number = cleaned.substring(2);
    
    if (number.length === 7) {
      const formatted = `${areaCode}-${number.substring(0, 3)}-${number.substring(3)}`;
      return international ? `+886-${formatted.substring(1)}` : formatted;
    } else {
      const formatted = `${areaCode}-${number.substring(0, 4)}-${number.substring(4)}`;
      return international ? `+886-${formatted.substring(1)}` : formatted;
    }
  }
  
  // Toll-free number (0800-XXX-XXX)
  if (cleaned.match(/^0800\d{6}$/)) {
    const formatted = cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3');
    return international ? `+886-${formatted.substring(1)}` : formatted;
  }
  
  // Return original if no pattern matches
  return phone;
}

/**
 * Parse phone number to extract components
 * @param phone - Phone number to parse
 * @returns Parsed components or null if invalid
 */
export function parseTaiwanPhone(phone: string): {
  type: 'mobile' | 'landline' | 'tollFree';
  areaCode?: string;
  number: string;
  formatted: string;
  international: string;
} | null {
  if (!isValidTaiwanPhone(phone)) {
    return null;
  }
  
  // Clean the phone number
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Remove country code if present
  if (cleaned.startsWith('+886')) {
    cleaned = '0' + cleaned.substring(4);
  } else if (cleaned.startsWith('886')) {
    cleaned = '0' + cleaned.substring(3);
  }
  
  // Mobile number
  if (cleaned.match(/^09\d{8}$/)) {
    return {
      type: 'mobile',
      areaCode: cleaned.substring(0, 4),
      number: cleaned,
      formatted: formatTaiwanPhone(cleaned),
      international: formatTaiwanPhone(cleaned, true),
    };
  }
  
  // Landline number
  if (cleaned.match(/^0[2-8]\d{7,8}$/)) {
    const areaCode = cleaned.substring(0, 2);
    return {
      type: 'landline',
      areaCode,
      number: cleaned,
      formatted: formatTaiwanPhone(cleaned),
      international: formatTaiwanPhone(cleaned, true),
    };
  }
  
  // Toll-free number
  if (cleaned.match(/^0800\d{6}$/)) {
    return {
      type: 'tollFree',
      areaCode: '0800',
      number: cleaned,
      formatted: formatTaiwanPhone(cleaned),
      international: formatTaiwanPhone(cleaned, true),
    };
  }
  
  return null;
}

/**
 * Get phone type label in Traditional Chinese
 * @param phone - Phone number
 * @returns Phone type label
 */
export function getPhoneTypeLabel(phone: string): string {
  const parsed = parseTaiwanPhone(phone);
  if (!parsed) return '未知';
  
  switch (parsed.type) {
    case 'mobile':
      return '手機';
    case 'landline':
      return '市話';
    case 'tollFree':
      return '免費電話';
    default:
      return '電話';
  }
}

/**
 * Get area name from area code
 * @param areaCode - Area code (with or without leading 0)
 * @returns Area name in Traditional Chinese
 */
export function getAreaName(areaCode: string): string {
  const code = areaCode.startsWith('0') ? areaCode : '0' + areaCode;
  
  const areaMap: Record<string, string> = {
    '02': '台北',
    '03': '桃園/新竹/宜蘭',
    '04': '台中',
    '05': '嘉義/雲林',
    '06': '台南',
    '07': '高雄',
    '08': '屏東',
    '09': '手機',
    '0800': '免費電話',
  };
  
  return areaMap[code] || '未知地區';
}

/**
 * Create phone input mask for Taiwan numbers
 * @param type - Phone type
 * @returns Input mask pattern
 */
export function getPhoneInputMask(type: 'mobile' | 'landline' | 'any' = 'any'): string {
  switch (type) {
    case 'mobile':
      return '09##-###-###';
    case 'landline':
      return '0#-####-####';
    case 'any':
    default:
      return '0###-###-###';
  }
}

/**
 * Normalize phone number for storage
 * @param phone - Phone number to normalize
 * @returns Normalized phone number (digits only)
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');
  
  // Handle international prefix
  if (normalized.startsWith('886')) {
    normalized = '0' + normalized.substring(3);
  }
  
  return normalized;
}

/**
 * Compare two phone numbers
 * @param phone1 - First phone number
 * @param phone2 - Second phone number
 * @returns True if numbers are the same
 */
export function comparePhones(phone1: string, phone2: string): boolean {
  const normalized1 = normalizePhone(phone1);
  const normalized2 = normalizePhone(phone2);
  
  return normalized1 === normalized2;
}

/**
 * Generate example phone numbers for UI
 * @returns Array of example phone numbers
 */
export function getExamplePhones(): Array<{ type: string; example: string; formatted: string }> {
  return [
    {
      type: '手機',
      example: '0912345678',
      formatted: formatTaiwanPhone('0912345678'),
    },
    {
      type: '台北市話',
      example: '0223456789',
      formatted: formatTaiwanPhone('0223456789'),
    },
    {
      type: '免費電話',
      example: '0800123456',
      formatted: formatTaiwanPhone('0800123456'),
    },
  ];
}

// Export all functions
export default {
  isValidTaiwanPhone,
  formatTaiwanPhone,
  parseTaiwanPhone,
  getPhoneTypeLabel,
  getAreaName,
  getPhoneInputMask,
  normalizePhone,
  comparePhones,
  getExamplePhones,
};