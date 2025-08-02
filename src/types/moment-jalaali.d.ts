declare module 'moment-jalaali' {
  import moment from 'moment';
  
  interface MomentJalaali extends moment.Moment {
    jYear(): number;
    jMonth(): number;
    jDate(): number;
    jDayOfYear(): number;
    jWeek(): number;
    jWeekYear(): number;
    jQuarter(): number;
    
    jYear(year: number): MomentJalaali;
    jMonth(month: number): MomentJalaali;
    jDate(date: number): MomentJalaali;
    jDayOfYear(dayOfYear: number): MomentJalaali;
    jWeek(week: number): MomentJalaali;
    jWeekYear(weekYear: number): MomentJalaali;
    jQuarter(quarter: number): MomentJalaali;
    
    startOf(units: 'jYear' | 'jMonth' | 'jWeek' | 'jQuarter'): MomentJalaali;
    endOf(units: 'jYear' | 'jMonth' | 'jWeek' | 'jQuarter'): MomentJalaali;
    
    jDaysInMonth(): number;
    jIsLeapYear(): boolean;
    
    format(format: string): string;
  }
  
  interface MomentJalaaliStatic extends moment.MomentStatic {
    (input?: moment.MomentInput, format?: moment.MomentFormatSpecification, strict?: boolean): MomentJalaali;
    (input?: moment.MomentInput, format?: moment.MomentFormatSpecification, language?: string, strict?: boolean): MomentJalaali;
    
    loadPersian(options?: { dialect?: string; usePersianDigits?: boolean }): void;
    
    jMoment(input?: moment.MomentInput, format?: moment.MomentFormatSpecification, strict?: boolean): MomentJalaali;
    jMoment(input?: moment.MomentInput, format?: moment.MomentFormatSpecification, language?: string, strict?: boolean): MomentJalaali;
  }
  
  const momentJalaali: MomentJalaaliStatic;
  export = momentJalaali;
} 