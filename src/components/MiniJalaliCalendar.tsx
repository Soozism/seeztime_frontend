import React, { useMemo } from 'react';
import { Calendar, DayValue } from '@hassanmojab/react-modern-calendar-datepicker';
import '@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css';
import '../styles/miniCalendar.css';

interface MiniJalaliCalendarProps {
  events: { start_time: string; event_type?: string }[];
}

// Simple list of Iranian official holidays (Jalali YYYY/MM/DD)
const IRAN_HOLIDAYS: string[] = [
  '1404/01/01', // نوروز نمونه
  '1404/01/02',
  // ... add more as needed
];

const MiniJalaliCalendar: React.FC<MiniJalaliCalendarProps> = ({ events }) => {
  // Convert event dates to Jalali y/m/d strings
  const eventDays = useMemo(() => {
    return events.map((e) => {
      // If date stored Gregorian, convert via moment-jalaali
      const moment = require('moment-jalaali');
      const m = moment(e.start_time);
      return m.format('jYYYY/jMM/jDD');
    });
  }, [events]);

  const customClassNames = useMemo(() => {
    const classes: { year: number; month: number; day: number; className: string }[] = [];
    events.forEach((ev) => {
      const moment = require('moment-jalaali');
      const d = moment(ev.start_time).format('jYYYY/jMM/jDD');
      const [y, m, day] = d.split('/').map((n: string) => parseInt(n));
      const colorClass = `event-dot-${ev.event_type ?? 'default'}`;
      classes.push({ year: y, month: m, day, className: colorClass });
    });
    IRAN_HOLIDAYS.forEach((d) => {
      const [y, m, day] = d.split('/').map((n: string) => parseInt(n));
      classes.push({ year: y, month: m, day, className: 'mini-calendar-holiday' });
    });
    return classes;
  }, [eventDays]);

  return (
    <Calendar
      value={null as unknown as DayValue}
      onChange={()=>{}}
      locale="fa"
      shouldHighlightWeekends
      {...({ displayMode: 'calendar' } as any)}
      customDaysClassName={customClassNames as any}
      colorPrimary="var(--color-primary)"
      calendarClassName="mini-jalali-calendar"
    />
  );
};

export default MiniJalaliCalendar; 