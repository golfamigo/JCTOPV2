import { format, formatDistance, formatRelative, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { TAIWAN_DATE_FORMATS, WEEKDAYS, MONTHS, RELATIVE_TIME_UNITS, TAIWAN_HOLIDAYS_2025 } from '../constants/taiwanFormats';

/**
 * Format date according to Taiwan conventions
 * @param date - Date to format
 * @param formatType - Format type (short, medium, long, datetime)
 * @returns Formatted date string
 */
export function formatTaiwanDate(
  date: Date | string,
  formatType: keyof typeof TAIWAN_DATE_FORMATS = 'medium'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const formatPattern = TAIWAN_DATE_FORMATS[formatType];
  
  // Use date-fns with Taiwan locale
  return format(dateObj, formatPattern, { locale: zhTW });
}

/**
 * Format time in Taiwan format (24-hour)
 * @param date - Date with time
 * @returns Formatted time string
 */
export function formatTaiwanTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm', { locale: zhTW });
}

/**
 * Format relative time in Traditional Chinese
 * @param date - Date to format
 * @param baseDate - Base date for comparison (default: now)
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string, baseDate: Date = new Date()): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  // Check for today/yesterday/tomorrow
  if (isToday(dateObj)) {
    return '今天';
  }
  if (isYesterday(dateObj)) {
    return '昨天';
  }
  if (isTomorrow(dateObj)) {
    return '明天';
  }
  
  // Use formatDistance for other relative times
  return formatDistance(dateObj, baseDate, {
    locale: zhTW,
    addSuffix: true,
  });
}

/**
 * Get Traditional Chinese weekday name
 * @param date - Date
 * @param type - Type of weekday name (long, short, narrow)
 * @returns Weekday name
 */
export function getChineseWeekday(
  date: Date | string,
  type: 'long' | 'short' | 'narrow' = 'long'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const dayIndex = dateObj.getDay();
  return WEEKDAYS[type][dayIndex];
}

/**
 * Get Traditional Chinese month name
 * @param date - Date or month number (1-12)
 * @param type - Type of month name (long, short, narrow)
 * @returns Month name
 */
export function getChineseMonth(
  date: Date | string | number,
  type: 'long' | 'short' | 'narrow' = 'long'
): string {
  let monthIndex: number;
  
  if (typeof date === 'number') {
    monthIndex = date - 1; // Convert 1-12 to 0-11
  } else {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    monthIndex = dateObj.getMonth();
  }
  
  return MONTHS[type][monthIndex];
}

/**
 * Format date range in Traditional Chinese
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  const startMonth = start.getMonth();
  const endMonth = end.getMonth();
  const startDay = start.getDate();
  const endDay = end.getDate();
  
  // Same day
  if (startYear === endYear && startMonth === endMonth && startDay === endDay) {
    return formatTaiwanDate(start, 'medium');
  }
  
  // Same month and year
  if (startYear === endYear && startMonth === endMonth) {
    return `${startYear}年${startMonth + 1}月${startDay}日 - ${endDay}日`;
  }
  
  // Same year
  if (startYear === endYear) {
    return `${startYear}年${startMonth + 1}月${startDay}日 - ${endMonth + 1}月${endDay}日`;
  }
  
  // Different years
  return `${formatTaiwanDate(start, 'medium')} - ${formatTaiwanDate(end, 'medium')}`;
}

/**
 * Format duration in Traditional Chinese
 * @param startDate - Start date/time
 * @param endDate - End date/time
 * @returns Duration string
 */
export function formatEventDuration(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  const parts: string[] = [];
  
  if (diffDays > 0) {
    parts.push(`${diffDays}天`);
  }
  if (diffHours > 0) {
    parts.push(`${diffHours}小時`);
  }
  if (diffMinutes > 0 && diffDays === 0) { // Only show minutes if less than a day
    parts.push(`${diffMinutes}分鐘`);
  }
  
  return parts.join('') || '少於1分鐘';
}

/**
 * Check if a date is a Taiwan public holiday
 * @param date - Date to check
 * @returns Holiday name if it's a holiday, null otherwise
 */
export function getTaiwanHoliday(date: Date | string): string | null {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const dateStr = format(dateObj, 'yyyy-MM-dd');
  
  const holiday = TAIWAN_HOLIDAYS_2025.find(h => h.date === dateStr);
  return holiday ? holiday.name : null;
}

/**
 * Format date with Traditional Chinese era (民國年)
 * @param date - Date to format
 * @returns Date string with ROC era
 */
export function formatROCDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const year = dateObj.getFullYear();
  const rocYear = year - 1911; // Convert to ROC calendar
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  
  return `民國${rocYear}年${month}月${day}日`;
}

/**
 * Parse Taiwan date format input
 * @param dateStr - Date string in Taiwan format
 * @returns Date object
 */
export function parseTaiwanDate(dateStr: string): Date | null {
  // Try various Taiwan date formats
  const patterns = [
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, // YYYY/MM/DD
    /^(\d{4})年(\d{1,2})月(\d{1,2})日$/, // YYYY年MM月DD日
    /^民國(\d{2,3})年(\d{1,2})月(\d{1,2})日$/, // 民國YYY年MM月DD日
  ];
  
  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      let year: number;
      let month: number;
      let day: number;
      
      if (dateStr.startsWith('民國')) {
        // ROC calendar
        year = parseInt(match[1]) + 1911;
        month = parseInt(match[2]) - 1; // JS months are 0-indexed
        day = parseInt(match[3]);
      } else {
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      }
      
      return new Date(year, month, day);
    }
  }
  
  return null;
}

// Export all functions
export default {
  formatTaiwanDate,
  formatTaiwanTime,
  formatRelativeTime,
  getChineseWeekday,
  getChineseMonth,
  formatDateRange,
  formatEventDuration,
  getTaiwanHoliday,
  formatROCDate,
  parseTaiwanDate,
};