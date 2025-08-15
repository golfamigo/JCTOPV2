import { TAIWAN_CURRENCY_FORMATS } from '../constants/taiwanFormats';

/**
 * Format amount as Taiwan currency (TWD/NT$)
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatTWD(
  amount: number,
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    decimals?: boolean;
    compact?: boolean;
  } = {}
): string {
  const {
    showSymbol = true,
    showCode = false,
    decimals = false,
    compact = true,
  } = options;

  // Handle compact formatting with Chinese units
  if (compact && amount >= 10000) {
    const { largeNumbers } = TAIWAN_CURRENCY_FORMATS;
    
    if (amount >= largeNumbers.yi.value) {
      const yiValue = (amount / largeNumbers.yi.value).toFixed(1);
      const formatted = parseFloat(yiValue).toString(); // Remove trailing .0
      return `${showSymbol ? 'NT$ ' : ''}${formatted}億`;
    } else if (amount >= largeNumbers.qianwan.value) {
      const qianwanValue = (amount / largeNumbers.qianwan.value).toFixed(1);
      const formatted = parseFloat(qianwanValue).toString();
      return `${showSymbol ? 'NT$ ' : ''}${formatted}千萬`;
    } else if (amount >= largeNumbers.baiwan.value) {
      const baiwanValue = (amount / largeNumbers.baiwan.value).toFixed(1);
      const formatted = parseFloat(baiwanValue).toString();
      return `${showSymbol ? 'NT$ ' : ''}${formatted}百萬`;
    } else if (amount >= largeNumbers.shiwan.value) {
      const shiwanValue = (amount / largeNumbers.shiwan.value).toFixed(1);
      const formatted = parseFloat(shiwanValue).toString();
      return `${showSymbol ? 'NT$ ' : ''}${formatted}十萬`;
    } else if (amount >= largeNumbers.wan.value) {
      const wanValue = (amount / largeNumbers.wan.value).toFixed(1);
      const formatted = parseFloat(wanValue).toString();
      return `${showSymbol ? 'NT$ ' : ''}${formatted}萬`;
    }
  }

  // Standard formatting with thousands separator
  const formattedNumber = decimals
    ? amount.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toLocaleString('zh-TW');

  // Build the final string
  let result = '';
  if (showSymbol) {
    result = `NT$ ${formattedNumber}`;
  } else if (showCode) {
    result = `${formattedNumber} TWD`;
  } else {
    result = formattedNumber;
  }

  return result;
}

/**
 * Parse Taiwan currency string to number
 * @param currencyStr - Currency string to parse
 * @returns Parsed amount or null if invalid
 */
export function parseTWD(currencyStr: string): number | null {
  if (!currencyStr) return null;

  // Remove currency symbols and spaces
  let cleanStr = currencyStr
    .replace(/NT\$?\s*/gi, '')
    .replace(/TWD\s*/gi, '')
    .replace(/新台幣\s*/gi, '')
    .replace(/元\s*/gi, '')
    .replace(/,/g, '') // Remove thousands separators
    .trim();

  // Handle Chinese large number units
  const largeNumberPatterns = [
    { pattern: /(\d+(?:\.\d+)?)億/, multiplier: 100000000 },
    { pattern: /(\d+(?:\.\d+)?)千萬/, multiplier: 10000000 },
    { pattern: /(\d+(?:\.\d+)?)百萬/, multiplier: 1000000 },
    { pattern: /(\d+(?:\.\d+)?)十萬/, multiplier: 100000 },
    { pattern: /(\d+(?:\.\d+)?)萬/, multiplier: 10000 },
  ];

  for (const { pattern, multiplier } of largeNumberPatterns) {
    const match = cleanStr.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      return value * multiplier;
    }
  }

  // Try to parse as regular number
  const amount = parseFloat(cleanStr);
  return isNaN(amount) ? null : amount;
}

/**
 * Format price range in TWD
 * @param min - Minimum price
 * @param max - Maximum price (optional)
 * @returns Formatted price range
 */
export function formatPriceRange(min: number, max?: number): string {
  if (!max || min === max) {
    return formatTWD(min);
  }
  return `${formatTWD(min)} - ${formatTWD(max)}`;
}

/**
 * Calculate and format discount amount
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Formatted discount string
 */
export function formatDiscount(originalPrice: number, discountedPrice: number): string {
  const discountAmount = originalPrice - discountedPrice;
  const discountPercent = Math.round((discountAmount / originalPrice) * 100);
  
  return `省 ${formatTWD(discountAmount)} (${discountPercent}% off)`;
}

/**
 * Format payment amount with description
 * @param amount - Payment amount
 * @param description - Payment description
 * @returns Formatted payment string
 */
export function formatPaymentAmount(amount: number, description?: string): string {
  const formattedAmount = formatTWD(amount, { decimals: true });
  return description ? `${formattedAmount} - ${description}` : formattedAmount;
}

/**
 * Validate if a string is a valid TWD amount
 * @param amount - Amount string to validate
 * @returns True if valid, false otherwise
 */
export function isValidTWDAmount(amount: string): boolean {
  const parsed = parseTWD(amount);
  return parsed !== null && parsed >= 0;
}

/**
 * Format invoice amount with tax
 * @param subtotal - Subtotal amount
 * @param taxRate - Tax rate (default 5% for Taiwan)
 * @returns Object with formatted amounts
 */
export function formatInvoiceAmount(
  subtotal: number,
  taxRate: number = 0.05
): {
  subtotal: string;
  tax: string;
  total: string;
} {
  const taxAmount = Math.round(subtotal * taxRate);
  const total = subtotal + taxAmount;

  return {
    subtotal: formatTWD(subtotal, { decimals: true }),
    tax: formatTWD(taxAmount, { decimals: true }),
    total: formatTWD(total, { decimals: true }),
  };
}

/**
 * Convert amount to Chinese numerals (for formal documents)
 * @param amount - Amount to convert
 * @returns Chinese numeral string
 */
export function toChineseNumerals(amount: number): string {
  const digits = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟', '萬', '拾', '佰', '仟', '億'];
  
  if (amount === 0) return '零元整';
  
  const amountStr = Math.floor(amount).toString();
  let result = '';
  
  for (let i = 0; i < amountStr.length; i++) {
    const digit = parseInt(amountStr[i]);
    const unitIndex = amountStr.length - 1 - i;
    
    if (digit !== 0) {
      result += digits[digit];
      if (unitIndex > 0) {
        result += units[unitIndex % 9];
      }
    } else if (unitIndex === 4) {
      // Add 萬 even if digit is 0
      result += '萬';
    }
  }
  
  // Handle decimal part
  if (amount % 1 !== 0) {
    const decimalPart = Math.round((amount % 1) * 100);
    const jiao = Math.floor(decimalPart / 10);
    const fen = decimalPart % 10;
    
    result += '元';
    if (jiao > 0) {
      result += digits[jiao] + '角';
    }
    if (fen > 0) {
      result += digits[fen] + '分';
    }
  } else {
    result += '元整';
  }
  
  return result;
}

// Currency comparison utilities
export function isGreaterThan(amount1: number, amount2: number): boolean {
  return amount1 > amount2;
}

export function isLessThan(amount1: number, amount2: number): boolean {
  return amount1 < amount2;
}

export function isEqual(amount1: number, amount2: number): boolean {
  return Math.abs(amount1 - amount2) < 0.01; // Handle floating point comparison
}

// Export all functions
export default {
  formatTWD,
  parseTWD,
  formatPriceRange,
  formatDiscount,
  formatPaymentAmount,
  isValidTWDAmount,
  formatInvoiceAmount,
  toChineseNumerals,
  isGreaterThan,
  isLessThan,
  isEqual,
};