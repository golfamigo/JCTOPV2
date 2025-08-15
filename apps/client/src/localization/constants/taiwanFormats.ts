/**
 * Taiwan-specific format constants
 * 台灣格式常數
 */

// Date formatting patterns for Taiwan
export const TAIWAN_DATE_FORMATS = {
  short: 'YYYY/MM/DD',           // 2025/01/14
  medium: 'YYYY年MM月DD日',        // 2025年01月14日  
  long: 'YYYY年MM月DD日 dddd',     // 2025年01月14日 星期二
  time: 'HH:mm',                 // 15:30 (24-hour preferred)
  datetime: 'YYYY年MM月DD日 HH:mm', // 2025年01月14日 15:30
  monthDay: 'MM月DD日',            // 01月14日
  yearMonth: 'YYYY年MM月',         // 2025年01月
  weekday: 'dddd',               // 星期二
} as const;

// Taiwan currency formatting
export const TAIWAN_CURRENCY_FORMATS = {
  symbol: 'NT$',
  code: 'TWD',
  name: '新台幣',
  decimalSeparator: '.',
  thousandsSeparator: ',',
  format: 'NT$ #,##0',           // NT$ 1,500
  formatWithDecimals: 'NT$ #,##0.00', // NT$ 1,500.00
  largeNumbers: {
    wan: { value: 10000, label: '萬' },       // 10,000 = 1萬
    shiwan: { value: 100000, label: '十萬' },  // 100,000 = 10萬
    baiwan: { value: 1000000, label: '百萬' }, // 1,000,000 = 100萬
    qianwan: { value: 10000000, label: '千萬' }, // 10,000,000 = 1千萬
    yi: { value: 100000000, label: '億' },    // 100,000,000 = 1億
  }
} as const;

// Taiwan phone number patterns
export const TAIWAN_PHONE_FORMATS = {
  countryCode: '+886',
  mobile: {
    pattern: /^09\d{8}$/,
    format: '09XX-XXX-XXX',
    example: '0912-345-678',
  },
  landline: {
    taipei: {
      pattern: /^02\d{8}$/,
      format: '02-XXXX-XXXX',
      example: '02-2345-6789',
    },
    kaohsiung: {
      pattern: /^07\d{7}$/,
      format: '07-XXX-XXXX',
      example: '07-123-4567',
    },
    taichung: {
      pattern: /^04\d{8}$/,
      format: '04-XXXX-XXXX',
      example: '04-2345-6789',
    },
    other: {
      pattern: /^0[3-9]\d{7,8}$/,
      format: '0X-XXX-XXXX',
      example: '03-123-4567',
    }
  },
  tollFree: {
    pattern: /^0800\d{6}$/,
    format: '0800-XXX-XXX',
    example: '0800-123-456',
  }
} as const;

// Week days in Traditional Chinese
export const WEEKDAYS = {
  long: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  short: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
  narrow: ['日', '一', '二', '三', '四', '五', '六'],
} as const;

// Months in Traditional Chinese
export const MONTHS = {
  long: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  short: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  narrow: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
} as const;

// Relative time units
export const RELATIVE_TIME_UNITS = {
  future: '%s後',
  past: '%s前',
  s: '幾秒',
  m: '1分鐘',
  mm: '%d分鐘',
  h: '1小時',
  hh: '%d小時',
  d: '1天',
  dd: '%d天',
  w: '1週',
  ww: '%d週',
  M: '1個月',
  MM: '%d個月',
  y: '1年',
  yy: '%d年'
} as const;

// Taiwan public holidays (2025)
export const TAIWAN_HOLIDAYS_2025 = [
  { date: '2025-01-01', name: '元旦' },
  { date: '2025-01-25', name: '農曆除夕' },
  { date: '2025-01-26', name: '春節' },
  { date: '2025-01-27', name: '春節' },
  { date: '2025-01-28', name: '春節' },
  { date: '2025-01-29', name: '春節' },
  { date: '2025-01-30', name: '春節' },
  { date: '2025-01-31', name: '春節' },
  { date: '2025-02-01', name: '春節' },
  { date: '2025-02-02', name: '春節' },
  { date: '2025-02-28', name: '和平紀念日' },
  { date: '2025-04-04', name: '兒童節' },
  { date: '2025-04-05', name: '清明節' },
  { date: '2025-05-01', name: '勞動節' },
  { date: '2025-05-31', name: '端午節' },
  { date: '2025-10-06', name: '中秋節' },
  { date: '2025-10-10', name: '國慶日' },
] as const;

// Number formatting
export const NUMBER_FORMATS = {
  decimal: '.',
  thousands: ',',
  precision: 2,
  grouping: [3],
} as const;

export default {
  TAIWAN_DATE_FORMATS,
  TAIWAN_CURRENCY_FORMATS,
  TAIWAN_PHONE_FORMATS,
  WEEKDAYS,
  MONTHS,
  RELATIVE_TIME_UNITS,
  TAIWAN_HOLIDAYS_2025,
  NUMBER_FORMATS,
};