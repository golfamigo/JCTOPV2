import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { formatTaiwanDate, formatTaiwanTime, formatRelativeTime } from '../utils/dateUtils';
import { formatTWD, formatPriceRange, formatDiscount } from '../utils/currencyUtils';
import { formatTaiwanPhone, isValidTaiwanPhone } from '../utils/phoneUtils';
import { formatChineseNumber, formatPercentage, formatOrdinal } from '../utils/numberUtils';
import { formatWithMeasureWord, formatEventCount, formatTicketCount, formatPeopleCount } from '../constants/measurements';

/**
 * Enhanced localization hook with Taiwan-specific formatting
 */
export function useLocalization() {
  const { t, i18n } = useTranslation();

  // Date formatting functions
  const formatDate = useCallback((date: Date | string, format?: 'short' | 'medium' | 'long' | 'datetime') => {
    return formatTaiwanDate(date, format);
  }, []);

  const formatTime = useCallback((date: Date | string) => {
    return formatTaiwanTime(date);
  }, []);

  const formatRelative = useCallback((date: Date | string) => {
    return formatRelativeTime(date);
  }, []);

  // Currency formatting functions
  const formatCurrency = useCallback((amount: number, options?: Parameters<typeof formatTWD>[1]) => {
    return formatTWD(amount, options);
  }, []);

  const formatPrice = useCallback((min: number, max?: number) => {
    return formatPriceRange(min, max);
  }, []);

  const formatSavings = useCallback((original: number, discounted: number) => {
    return formatDiscount(original, discounted);
  }, []);

  // Phone formatting functions
  const formatPhone = useCallback((phone: string, international?: boolean) => {
    return formatTaiwanPhone(phone, international);
  }, []);

  const validatePhone = useCallback((phone: string) => {
    return isValidTaiwanPhone(phone);
  }, []);

  // Number formatting functions
  const formatNumber = useCallback((value: number, options?: Parameters<typeof formatChineseNumber>[1]) => {
    return formatChineseNumber(value, options);
  }, []);

  const formatPercent = useCallback((value: number, isRatio?: boolean, decimals?: number) => {
    return formatPercentage(value, isRatio, decimals);
  }, []);

  const formatOrd = useCallback((value: number) => {
    return formatOrdinal(value);
  }, []);

  // Measure word formatting
  const formatEvents = useCallback((count: number) => {
    return formatEventCount(count);
  }, []);

  const formatTickets = useCallback((count: number) => {
    return formatTicketCount(count);
  }, []);

  const formatPeople = useCallback((count: number, polite?: boolean) => {
    return formatPeopleCount(count, polite);
  }, []);

  const formatMeasure = useCallback((count: number, item: string, measureWord: string) => {
    return formatWithMeasureWord(count, item, measureWord);
  }, []);

  // Language utilities
  const changeLanguage = useCallback((lng: string) => {
    return i18n.changeLanguage(lng);
  }, [i18n]);

  const isTraditionalChinese = useCallback(() => {
    return i18n.language === 'zh-TW';
  }, [i18n.language]);

  // Get formatted message with interpolation
  const getMessage = useCallback((key: string, options?: any) => {
    return t(key, options);
  }, [t]);

  // Plural handling (Chinese doesn't have plurals, but keep for compatibility)
  const getPlural = useCallback((key: string, count: number) => {
    return t(key, { count });
  }, [t]);

  return {
    // Translation functions
    t,
    getMessage,
    getPlural,
    
    // Date formatting
    formatDate,
    formatTime,
    formatRelative,
    
    // Currency formatting
    formatCurrency,
    formatPrice,
    formatSavings,
    
    // Phone formatting
    formatPhone,
    validatePhone,
    
    // Number formatting
    formatNumber,
    formatPercent,
    formatOrd,
    
    // Measure words
    formatEvents,
    formatTickets,
    formatPeople,
    formatMeasure,
    
    // Language utilities
    language: i18n.language,
    changeLanguage,
    isTraditionalChinese,
    
    // Raw i18n instance for advanced usage
    i18n,
  };
}

export default useLocalization;