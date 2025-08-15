import { NUMBER_FORMATS } from '../constants/taiwanFormats';

/**
 * Format number with Traditional Chinese conventions
 * @param value - Number to format
 * @param options - Formatting options
 * @returns Formatted number string
 */
export function formatChineseNumber(
  value: number,
  options: {
    decimals?: number;
    useChineseUnits?: boolean;
    compact?: boolean;
  } = {}
): string {
  const {
    decimals = 0,
    useChineseUnits = false,
    compact = false,
  } = options;

  // Handle Chinese units for large numbers
  if (useChineseUnits || compact) {
    if (value >= 100000000) {
      const yi = (value / 100000000).toFixed(decimals || 1);
      return `${parseFloat(yi)}億`;
    } else if (value >= 10000) {
      const wan = (value / 10000).toFixed(decimals || 1);
      return `${parseFloat(wan)}萬`;
    } else if (value >= 1000) {
      const qian = (value / 1000).toFixed(decimals || 1);
      return `${parseFloat(qian)}千`;
    }
  }

  // Standard number formatting
  return value.toLocaleString('zh-TW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Convert number to Traditional Chinese numerals
 * @param value - Number to convert (0-9999)
 * @returns Chinese numeral string
 */
export function toChineseNumeral(value: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const units = ['', '十', '百', '千'];
  
  if (value === 0) return digits[0];
  if (value < 0 || value > 9999) {
    throw new Error('Value must be between 0 and 9999');
  }
  
  const numStr = value.toString();
  let result = '';
  let prevZero = false;
  
  for (let i = 0; i < numStr.length; i++) {
    const digit = parseInt(numStr[i]);
    const unitIndex = numStr.length - 1 - i;
    
    if (digit === 0) {
      // Handle consecutive zeros
      if (!prevZero && i < numStr.length - 1) {
        result += digits[0];
        prevZero = true;
      }
    } else {
      prevZero = false;
      
      // Special case for 10-19
      if (unitIndex === 1 && digit === 1 && i === 0) {
        result += units[1]; // Just '十' for 10-19
      } else {
        result += digits[digit];
        if (unitIndex > 0) {
          result += units[unitIndex];
        }
      }
    }
  }
  
  return result;
}

/**
 * Format ordinal number in Traditional Chinese
 * @param value - Number to format as ordinal
 * @returns Ordinal string
 */
export function formatOrdinal(value: number): string {
  return `第${value}`;
}

/**
 * Format percentage with Chinese conventions
 * @param value - Value to format (0-1 for ratio, or direct percentage)
 * @param isRatio - Whether value is a ratio (0-1) or percentage (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  isRatio: boolean = true,
  decimals: number = 0
): string {
  const percentage = isRatio ? value * 100 : value;
  const formatted = percentage.toFixed(decimals);
  return `${formatted}%`;
}

/**
 * Format ratio in Traditional Chinese
 * @param numerator - Numerator
 * @param denominator - Denominator
 * @returns Formatted ratio string
 */
export function formatRatio(numerator: number, denominator: number): string {
  if (denominator === 0) return '—';
  
  // Check for common ratios
  const ratio = numerator / denominator;
  
  // Common fractions in Chinese
  const commonFractions: Record<number, string> = {
    0.5: '一半',
    0.25: '四分之一',
    0.75: '四分之三',
    0.333: '三分之一',
    0.667: '三分之二',
  };
  
  for (const [value, label] of Object.entries(commonFractions)) {
    if (Math.abs(ratio - parseFloat(value)) < 0.01) {
      return label;
    }
  }
  
  // Format as fraction
  return `${numerator}/${denominator}`;
}

/**
 * Format count with appropriate unit
 * @param value - Count value
 * @param singular - Singular unit name
 * @param plural - Plural unit name (optional for Chinese)
 * @returns Formatted count string
 */
export function formatCount(
  value: number,
  singular: string,
  plural?: string
): string {
  // Chinese doesn't typically use plural forms
  return `${formatChineseNumber(value)} ${singular}`;
}

/**
 * Parse Chinese number string to number
 * @param str - Chinese number string
 * @returns Parsed number or null
 */
export function parseChineseNumber(str: string): number | null {
  if (!str) return null;
  
  // Remove spaces and commas
  let cleaned = str.replace(/[\s,]/g, '');
  
  // Handle Chinese units
  const units: Array<[RegExp, number]> = [
    [/(\d+(?:\.\d+)?)億/g, 100000000],
    [/(\d+(?:\.\d+)?)千萬/g, 10000000],
    [/(\d+(?:\.\d+)?)百萬/g, 1000000],
    [/(\d+(?:\.\d+)?)十萬/g, 100000],
    [/(\d+(?:\.\d+)?)萬/g, 10000],
    [/(\d+(?:\.\d+)?)千/g, 1000],
    [/(\d+(?:\.\d+)?)百/g, 100],
    [/(\d+(?:\.\d+)?)十/g, 10],
  ];
  
  let total = 0;
  let hasUnit = false;
  
  for (const [pattern, multiplier] of units) {
    const matches = cleaned.matchAll(pattern);
    for (const match of matches) {
      total += parseFloat(match[1]) * multiplier;
      hasUnit = true;
    }
    cleaned = cleaned.replace(pattern, '');
  }
  
  // If no units were found, try parsing as regular number
  if (!hasUnit) {
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  
  // Add any remaining digits
  if (cleaned && !isNaN(parseFloat(cleaned))) {
    total += parseFloat(cleaned);
  }
  
  return total;
}

/**
 * Format file size with appropriate units
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  const formatted = size.toFixed(unitIndex === 0 ? 0 : 1);
  return `${formatted} ${units[unitIndex]}`;
}

/**
 * Format distance with appropriate units
 * @param meters - Distance in meters
 * @returns Formatted distance string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} 公尺`;
  } else {
    const km = (meters / 1000).toFixed(1);
    return `${parseFloat(km)} 公里`;
  }
}

/**
 * Format score or rating
 * @param score - Score value
 * @param maxScore - Maximum score
 * @param showMax - Whether to show max score
 * @returns Formatted score string
 */
export function formatScore(
  score: number,
  maxScore: number = 5,
  showMax: boolean = true
): string {
  const formatted = score.toFixed(1);
  return showMax ? `${formatted}/${maxScore}` : formatted;
}

/**
 * Generate Chinese sequence numbers
 * @param start - Start number
 * @param end - End number
 * @returns Array of Chinese ordinal numbers
 */
export function generateChineseSequence(start: number, end: number): string[] {
  const sequence: string[] = [];
  for (let i = start; i <= end; i++) {
    sequence.push(formatOrdinal(i));
  }
  return sequence;
}

// Export all functions
export default {
  formatChineseNumber,
  toChineseNumeral,
  formatOrdinal,
  formatPercentage,
  formatRatio,
  formatCount,
  parseChineseNumber,
  formatFileSize,
  formatDistance,
  formatScore,
  generateChineseSequence,
};