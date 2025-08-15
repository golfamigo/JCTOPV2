import { useMemo } from 'react';
import { 
  formatTaiwanDate, 
  formatTaiwanTime, 
  formatRelativeTime,
  formatDateRange,
  formatEventDuration,
  formatROCDate,
} from '../utils/dateUtils';
import { 
  formatTWD, 
  formatPriceRange, 
  formatDiscount,
  formatInvoiceAmount,
  toChineseNumerals,
} from '../utils/currencyUtils';
import { 
  formatTaiwanPhone,
  getPhoneTypeLabel,
  getAreaName,
} from '../utils/phoneUtils';
import { 
  formatChineseNumber,
  formatPercentage,
  formatOrdinal,
  formatFileSize,
  formatDistance,
  formatScore,
} from '../utils/numberUtils';

/**
 * Formatting presets for common use cases
 */
const FORMATTING_PRESETS = {
  // Date presets
  eventDate: (date: Date | string) => formatTaiwanDate(date, 'long'),
  eventTime: (date: Date | string) => formatTaiwanTime(date),
  registrationDate: (date: Date | string) => formatTaiwanDate(date, 'medium'),
  
  // Currency presets
  ticketPrice: (amount: number) => formatTWD(amount, { compact: true }),
  invoiceAmount: (amount: number) => formatTWD(amount, { decimals: true }),
  discountAmount: (original: number, discounted: number) => formatDiscount(original, discounted),
  
  // Number presets
  attendeeCount: (count: number) => formatChineseNumber(count, { useChineseUnits: true }),
  percentageValue: (value: number) => formatPercentage(value, true, 1),
  rankingPosition: (position: number) => formatOrdinal(position),
} as const;

/**
 * Hook for Taiwan-specific formatting utilities
 */
export function useFormatting() {
  // Memoized formatters
  const formatters = useMemo(() => ({
    // Date formatters
    date: {
      short: (date: Date | string) => formatTaiwanDate(date, 'short'),
      medium: (date: Date | string) => formatTaiwanDate(date, 'medium'),
      long: (date: Date | string) => formatTaiwanDate(date, 'long'),
      datetime: (date: Date | string) => formatTaiwanDate(date, 'datetime'),
      time: (date: Date | string) => formatTaiwanTime(date),
      relative: (date: Date | string) => formatRelativeTime(date),
      range: (start: Date | string, end: Date | string) => formatDateRange(start, end),
      duration: (start: Date | string, end: Date | string) => formatEventDuration(start, end),
      roc: (date: Date | string) => formatROCDate(date),
    },
    
    // Currency formatters
    currency: {
      twd: (amount: number) => formatTWD(amount),
      compact: (amount: number) => formatTWD(amount, { compact: true }),
      detailed: (amount: number) => formatTWD(amount, { decimals: true }),
      range: (min: number, max?: number) => formatPriceRange(min, max),
      discount: (original: number, discounted: number) => formatDiscount(original, discounted),
      invoice: (subtotal: number, taxRate?: number) => formatInvoiceAmount(subtotal, taxRate),
      formal: (amount: number) => toChineseNumerals(amount),
    },
    
    // Phone formatters
    phone: {
      local: (phone: string) => formatTaiwanPhone(phone, false),
      international: (phone: string) => formatTaiwanPhone(phone, true),
      type: (phone: string) => getPhoneTypeLabel(phone),
      area: (areaCode: string) => getAreaName(areaCode),
    },
    
    // Number formatters
    number: {
      standard: (value: number) => formatChineseNumber(value),
      compact: (value: number) => formatChineseNumber(value, { compact: true }),
      chinese: (value: number) => formatChineseNumber(value, { useChineseUnits: true }),
      ordinal: (value: number) => formatOrdinal(value),
      percentage: (value: number, isRatio?: boolean) => formatPercentage(value, isRatio),
      fileSize: (bytes: number) => formatFileSize(bytes),
      distance: (meters: number) => formatDistance(meters),
      score: (score: number, max?: number) => formatScore(score, max),
    },
  }), []);

  // Preset formatters
  const presets = useMemo(() => FORMATTING_PRESETS, []);

  // Validation utilities
  const validators = useMemo(() => ({
    isValidPhone: (phone: string) => {
      const phonePattern = /^09\d{8}$|^0[2-8]\d{7,8}$|^0800\d{6}$/;
      return phonePattern.test(phone.replace(/[\s\-]/g, ''));
    },
    isValidTaxNumber: (taxNumber: string) => {
      return /^\d{8}$/.test(taxNumber);
    },
    isValidCurrency: (amount: string) => {
      return /^\d+(\.\d{0,2})?$/.test(amount.replace(/[,\s]/g, ''));
    },
  }), []);

  // Format helpers for forms
  const formHelpers = useMemo(() => ({
    // Format input as user types
    formatPhoneInput: (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.startsWith('09') && cleaned.length <= 10) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3').substr(0, 12);
      }
      return cleaned;
    },
    
    // Format currency input
    formatCurrencyInput: (value: string) => {
      const cleaned = value.replace(/[^\d.]/g, '');
      const parts = cleaned.split('.');
      if (parts.length > 2) return parts[0] + '.' + parts[1];
      if (parts[1]?.length > 2) parts[1] = parts[1].substr(0, 2);
      return parts.join('.');
    },
    
    // Format date input
    formatDateInput: (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 8) {
        return cleaned
          .replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3')
          .replace(/\/$/, '');
      }
      return cleaned.substr(0, 8);
    },
  }), []);

  return {
    formatters,
    presets,
    validators,
    formHelpers,
  };
}

export default useFormatting;