declare module 'jalali-dayjs' {
  import { Dayjs } from 'dayjs';

  interface JalaliDayjs extends Dayjs {
    locale(locale: string): JalaliDayjs;
  }

  const jalaliDayjs: {
    (date?: string | Date | Dayjs | null | undefined): JalaliDayjs;
    locale(locale: string): JalaliDayjs;
    extend(plugin: any): void;
  };

  export = jalaliDayjs;
}

declare module 'dayjs-jalali' {
  import { PluginFunc } from 'dayjs';
  const jalali: PluginFunc;
  export = jalali;
}

// Extend Dayjs interface with jalali methods
declare module 'dayjs' {
  interface Dayjs {
    jYear(): number;
    jMonth(): number;
    jDate(): number;
    jDay(): number;
    jWeek(): number;
    jWeekYear(): number;
    jQuarter(): number;
    jIsLeapYear(): boolean;
    jDaysInMonth(): number;
  }
} 