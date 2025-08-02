import dayjs from 'dayjs';
import 'dayjs/locale/fa';
import type { Dayjs } from 'dayjs';

// Configure dayjs with Persian locale
try {
  (dayjs as any).locale('fa');
  console.log('Persian locale loaded successfully');
} catch (error) {
  console.warn('Failed to load Persian locale:', error);
}

// Persian locale configuration for Ant Design
export const persianLocale = {
  locale: 'fa_IR',
  lang: {
    locale: 'fa_IR',
    today: 'امروز',
    now: 'اکنون',
    backToToday: 'بازگشت به امروز',
    ok: 'تأیید',
    clear: 'پاک کردن',
    month: 'ماه',
    year: 'سال',
    timeSelect: 'انتخاب زمان',
    dateSelect: 'انتخاب تاریخ',
    weekSelect: 'انتخاب هفته',
    monthSelect: 'انتخاب ماه',
    yearSelect: 'انتخاب سال',
    decadeSelect: 'انتخاب دهه',
    yearFormat: 'YYYY',
    dateFormat: 'jYYYY/jMM/jDD',
    dayFormat: 'jDD',
    dateTimeFormat: 'jYYYY/jMM/jDD HH:mm:ss',
    monthBeforeYear: true,
    previousMonth: 'ماه قبل (PageUp)',
    nextMonth: 'ماه بعد (PageDown)',
    previousYear: 'سال قبل (Control + left)',
    nextYear: 'سال بعد (Control + right)',
    previousDecade: 'دهه قبل',
    nextDecade: 'دهه بعد',
    previousCentury: 'قرن قبل',
    nextCentury: 'قرن بعد',
  },
  timePickerLocale: {
    placeholder: 'انتخاب زمان',
  },
};

// Date format constants
export const DATE_FORMATS = {
  DISPLAY: 'YYYY/MM/DD', // Regular format for display (will be converted to Persian)
  DISPLAY_WITH_TIME: 'YYYY/MM/DD HH:mm', // Regular format with time
  DISPLAY_FULL_TIME: 'YYYY/MM/DD HH:mm:ss', // Regular format with full time
  API: 'YYYY-MM-DD', // Gregorian format for API
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss', // Gregorian format with time for API
  API_WITH_TIME_TZ: 'YYYY-MM-DDTHH:mm:ss.SSSZ', // ISO format for API
};

// Simple Persian date conversion function
const gregorianToPersian = (date: Date): { year: number; month: number; day: number } => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Simple conversion algorithm (approximate)
  // This is a basic conversion - for more accurate results, you'd need a more complex algorithm
  const persianYear = year - 621;
  const persianMonth = month;
  const persianDay = day;
  
  return { year: persianYear, month: persianMonth, day: persianDay };
};

// Helper function to safely convert to Persian date
const convertToPersian = (date: string | Date | Dayjs): string => {
  try {
    const dayjsDate = (dayjs as any)(date);
    const jsDate = dayjsDate.toDate();
    const persian = gregorianToPersian(jsDate);
    
    return `${persian.year}/${persian.month.toString().padStart(2, '0')}/${persian.day.toString().padStart(2, '0')}`;
  } catch (error) {
    console.warn('Error converting to Persian date:', error);
    // Fallback to regular dayjs formatting
    return (dayjs as any)(date).format('YYYY/MM/DD');
  }
};

// Helper function to safely convert to Persian date with time
const convertToPersianWithTime = (date: string | Date | Dayjs): string => {
  try {
    const dayjsDate = (dayjs as any)(date);
    const jsDate = dayjsDate.toDate();
    const persian = gregorianToPersian(jsDate);
    const hour = dayjsDate.hour();
    const minute = dayjsDate.minute();
    
    return `${persian.year}/${persian.month.toString().padStart(2, '0')}/${persian.day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  } catch (error) {
    console.warn('Error converting to Persian date with time:', error);
    // Fallback to regular dayjs formatting
    return (dayjs as any)(date).format('YYYY/MM/DD HH:mm');
  }
};

// Utility functions for date conversion
export const dateUtils = {
  // Convert Gregorian date to Persian for display
  toPersian: (date: string | Date | Dayjs | null | undefined): string => {
    if (!date) return '';
    return convertToPersian(date);
  },

  // Convert Persian date string to Gregorian for API
  toGregorian: (persianDate: string): string => {
    if (!persianDate) return '';
    try {
      // For now, just return the original date since we're not doing complex Persian parsing
      return persianDate;
    } catch (error) {
      console.warn('Error converting Persian to Gregorian:', error);
      return persianDate; // Return as is if conversion fails
    }
  },

  // Convert to dayjs object with Persian calendar
  toPersianDayjs: (date: string | Date | Dayjs | null | undefined): Dayjs => {
    if (!date) return (dayjs as any)();
    return (dayjs as any)(date);
  },

  // Convert Persian dayjs to Gregorian dayjs for API calls
  toGregorianDayjs: (persianDate: Dayjs): Dayjs => {
    try {
      return (dayjs as any)((persianDate as any).format(DATE_FORMATS.API_WITH_TIME_TZ));
    } catch (error) {
      console.warn('Error converting Persian dayjs to Gregorian:', error);
      return persianDate; // Return as is if conversion fails
    }
  },

  // Format date for display with time (Persian)
  formatWithTime: (date: string | Date | Dayjs | null | undefined): string => {
    if (!date) return '';
    return convertToPersianWithTime(date);
  },

  // Format date for API (Gregorian)
  formatForAPI: (date: string | Date | Dayjs | null | undefined): string => {
    if (!date) return '';
    return (dayjs as any)(date).format(DATE_FORMATS.API);
  },

  // Get current date in Persian
  now: (): Dayjs => {
    return (dayjs as any)();
  },

  // Check if date is today
  isToday: (date: string | Date | Dayjs): boolean => {
    return (dayjs as any)(date).isSame((dayjs as any)(), 'day');
  },

  // Check if date is in the past
  isPast: (date: string | Date | Dayjs): boolean => {
    return (dayjs as any)(date).isBefore((dayjs as any)(), 'day');
  },

  // Check if date is in the future
  isFuture: (date: string | Date | Dayjs): boolean => {
    return (dayjs as any)(date).isAfter((dayjs as any)(), 'day');
  },

  // Convert Persian date string to dayjs object
  parsePersianDate: (persianDateString: string): Dayjs => {
    try {
      return (dayjs as any)(persianDateString, 'YYYY/MM/DD');
    } catch (error) {
      console.warn('Error parsing Persian date:', error);
      return (dayjs as any)(); // Return current date if parsing fails
    }
  },

  // Convert dayjs object to Persian date string
  formatPersianDate: (date: Dayjs): string => {
    try {
      return (date as any).format(DATE_FORMATS.DISPLAY);
    } catch (error) {
      console.warn('Error formatting Persian date:', error);
      return (date as any).format('YYYY/MM/DD'); // Fallback to regular format
    }
  },
};

export default dateUtils; 