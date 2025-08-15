/**
 * Chinese measure words (量詞) for proper Traditional Chinese grammar
 */

// Common measure words for different categories
export const MEASURE_WORDS = {
  // Events and activities
  events: {
    word: '場',
    usage: '一場活動',
    english: 'event',
  },
  workshops: {
    word: '堂',
    usage: '一堂工作坊',
    english: 'workshop/class',
  },
  concerts: {
    word: '場',
    usage: '一場演唱會',
    english: 'concert',
  },
  exhibitions: {
    word: '個',
    usage: '一個展覽',
    english: 'exhibition',
  },
  performances: {
    word: '場',
    usage: '一場表演',
    english: 'performance',
  },
  
  // Tickets and registrations
  tickets: {
    word: '張',
    usage: '一張票券',
    english: 'ticket',
  },
  registrations: {
    word: '筆',
    usage: '一筆報名',
    english: 'registration',
  },
  orders: {
    word: '筆',
    usage: '一筆訂單',
    english: 'order',
  },
  
  // People
  people: {
    word: '位',
    usage: '一位參與者',
    english: 'person (polite)',
  },
  attendees: {
    word: '名',
    usage: '一名參加者',
    english: 'attendee',
  },
  organizers: {
    word: '位',
    usage: '一位主辦方',
    english: 'organizer',
  },
  speakers: {
    word: '位',
    usage: '一位講者',
    english: 'speaker',
  },
  
  // Time periods
  days: {
    word: '天',
    usage: '三天',
    english: 'day',
  },
  hours: {
    word: '小時',
    usage: '兩小時',
    english: 'hour',
  },
  minutes: {
    word: '分鐘',
    usage: '十分鐘',
    english: 'minute',
  },
  sessions: {
    word: '場',
    usage: '一場會議',
    english: 'session',
  },
  
  // Items and objects
  items: {
    word: '個',
    usage: '一個項目',
    english: 'item',
  },
  documents: {
    word: '份',
    usage: '一份文件',
    english: 'document',
  },
  emails: {
    word: '封',
    usage: '一封電子郵件',
    english: 'email',
  },
  messages: {
    word: '則',
    usage: '一則訊息',
    english: 'message',
  },
  notifications: {
    word: '則',
    usage: '一則通知',
    english: 'notification',
  },
  
  // Financial
  payments: {
    word: '筆',
    usage: '一筆付款',
    english: 'payment',
  },
  refunds: {
    word: '筆',
    usage: '一筆退款',
    english: 'refund',
  },
  transactions: {
    word: '筆',
    usage: '一筆交易',
    english: 'transaction',
  },
  invoices: {
    word: '張',
    usage: '一張發票',
    english: 'invoice',
  },
  
  // Generic counters
  times: {
    word: '次',
    usage: '一次',
    english: 'time/occurrence',
  },
  types: {
    word: '種',
    usage: '一種類型',
    english: 'type/kind',
  },
  sets: {
    word: '組',
    usage: '一組',
    english: 'set/group',
  },
  batches: {
    word: '批',
    usage: '一批',
    english: 'batch',
  },
} as const;

/**
 * Helper function to format count with measure word
 * @param count - The number
 * @param item - The item being counted
 * @param measureWord - The appropriate measure word
 * @returns Formatted string with measure word
 */
export function formatWithMeasureWord(
  count: number,
  item: string,
  measureWord: string
): string {
  return `${count}${measureWord}${item}`;
}

/**
 * Get the appropriate measure word for a given item type
 * @param itemType - The type of item
 * @returns The measure word or default '個'
 */
export function getMeasureWord(itemType: keyof typeof MEASURE_WORDS): string {
  return MEASURE_WORDS[itemType]?.word || '個';
}

/**
 * Format event count with proper measure word
 * @param count - Number of events
 * @returns Formatted string
 */
export function formatEventCount(count: number): string {
  return formatWithMeasureWord(count, '活動', MEASURE_WORDS.events.word);
}

/**
 * Format ticket count with proper measure word
 * @param count - Number of tickets
 * @returns Formatted string
 */
export function formatTicketCount(count: number): string {
  return formatWithMeasureWord(count, '票券', MEASURE_WORDS.tickets.word);
}

/**
 * Format people count with proper measure word
 * @param count - Number of people
 * @param polite - Use polite form (位) or standard (名)
 * @returns Formatted string
 */
export function formatPeopleCount(count: number, polite: boolean = true): string {
  const measureWord = polite ? MEASURE_WORDS.people.word : MEASURE_WORDS.attendees.word;
  return formatWithMeasureWord(count, '', measureWord);
}

/**
 * Format time duration with proper measure words
 * @param days - Number of days
 * @param hours - Number of hours
 * @param minutes - Number of minutes
 * @returns Formatted string
 */
export function formatDuration(
  days?: number,
  hours?: number,
  minutes?: number
): string {
  const parts: string[] = [];
  
  if (days && days > 0) {
    parts.push(`${days}${MEASURE_WORDS.days.word}`);
  }
  if (hours && hours > 0) {
    parts.push(`${hours}${MEASURE_WORDS.hours.word}`);
  }
  if (minutes && minutes > 0) {
    parts.push(`${minutes}${MEASURE_WORDS.minutes.word}`);
  }
  
  return parts.join('');
}

// Common phrases with measure words
export const MEASURE_WORD_PHRASES = {
  oneEvent: '一場活動',
  twoTickets: '兩張票券',
  threePeople: '三位參與者',
  firstTime: '第一次',
  manyTypes: '多種類型',
  severalDays: '數天',
  fewHours: '幾小時',
  singleItem: '單一項目',
  multipleOrders: '多筆訂單',
  allAttendees: '所有參加者',
} as const;

export default {
  MEASURE_WORDS,
  formatWithMeasureWord,
  getMeasureWord,
  formatEventCount,
  formatTicketCount,
  formatPeopleCount,
  formatDuration,
  MEASURE_WORD_PHRASES,
};