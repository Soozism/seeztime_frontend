import React, { useState } from 'react';
import { Input, Popover } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import DatePicker, { DayValue, DayRange } from '@hassanmojab/react-modern-calendar-datepicker';
import '@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css';
import { dateUtils } from '../utils/dateConfig';
import type { Dayjs } from 'dayjs';

interface PersianRangePickerProps {
  value?: [string | null, string | null] | null;
  onChange?: (dates: [string | null, string | null] | null, dateStrings: [string, string]) => void;
  showTime?: boolean;
  format?: string;
  placeholder?: [string, string];
  disabled?: boolean;
  allowClear?: boolean;
  size?: 'large' | 'middle' | 'small';
  style?: React.CSSProperties;
  className?: string;
}

// Convert Gregorian date to Persian date object
const gregorianToPersian = (date: Date): DayValue => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Simple conversion (approximate)
  const persianYear = year - 621;
  const persianMonth = month;
  const persianDay = day;
  
  return {
    year: persianYear,
    month: persianMonth,
    day: persianDay,
  };
};

// Convert Persian date object to Gregorian date
const persianToGregorian = (persianDate: DayValue | null): Date | null => {
  if (!persianDate) return null;
  
  const year = persianDate.year + 621;
  const month = persianDate.month - 1; // JavaScript months are 0-based
  const day = persianDate.day;
  
  return new Date(year, month, day);
};

const PersianRangePicker: React.FC<PersianRangePickerProps> = ({
  value,
  onChange,
  showTime = false,
  format,
  placeholder = ['تاریخ شروع', 'تاریخ پایان'],
  disabled = false,
  allowClear = true,
  size = 'middle',
  style,
  className,
}) => {
  // Convert value to Persian date objects for the date picker
  const [selectedDayRange, setSelectedDayRange] = useState<DayRange | undefined>(() => {
    if (!value || !value[0] || !value[1]) return undefined;
    
    const fromDate = new Date(value[0]);
    const toDate = new Date(value[1]);
    
    return {
      from: gregorianToPersian(fromDate),
      to: gregorianToPersian(toDate),
    };
  });

  // Convert Persian date objects to display strings
  const displayValue = selectedDayRange 
    ? [
        selectedDayRange.from 
          ? `${selectedDayRange.from.year}/${selectedDayRange.from.month.toString().padStart(2, '0')}/${selectedDayRange.from.day.toString().padStart(2, '0')}`
          : '',
        selectedDayRange.to 
          ? `${selectedDayRange.to.year}/${selectedDayRange.to.month.toString().padStart(2, '0')}/${selectedDayRange.to.day.toString().padStart(2, '0')}`
          : ''
      ]
    : ['', ''];

  const handleDateChange = (dayRange: DayRange | undefined) => {
    setSelectedDayRange(dayRange);
    
    if (onChange) {
      if (dayRange && dayRange.from && dayRange.to) {
        const fromGregorian = persianToGregorian(dayRange.from);
        const toGregorian = persianToGregorian(dayRange.to);
        
        const fromString = fromGregorian?.toISOString() || null; // Full ISO format
        const toString = toGregorian?.toISOString() || null; // Full ISO format
        
        const persianFromString = `${dayRange.from.year}/${dayRange.from.month.toString().padStart(2, '0')}/${dayRange.from.day.toString().padStart(2, '0')}`;
        const persianToString = `${dayRange.to.year}/${dayRange.to.month.toString().padStart(2, '0')}/${dayRange.to.day.toString().padStart(2, '0')}`;
        
        onChange([fromString, toString], [persianFromString, persianToString]);
      } else {
        onChange(null, ['', '']);
      }
    }
  };

  const datePickerContent = (
    <div style={{ padding: '8px' }}>
      <DatePicker
        value={selectedDayRange || { from: null, to: null }}
        onChange={handleDateChange}
        locale="fa"
        shouldHighlightWeekends
        colorPrimary="#006D77"
        colorPrimaryLight="rgba(0, 109, 119, 0.1)"
        inputPlaceholder="انتخاب بازه زمانی"
      />
    </div>
  );

  return (
    <Popover
      content={datePickerContent}
      trigger="click"
      placement="bottomLeft"
      overlayStyle={{ zIndex: 1000 }}
    >
      <div style={{ display: 'flex', gap: '8px', ...style }} className={className}>
        <Input
          value={displayValue[0]}
          placeholder={placeholder[0]}
          disabled={disabled}
          size={size}
          suffix={<CalendarOutlined />}
          readOnly
          style={{ flex: 1 }}
        />
        <span style={{ alignSelf: 'center', color: '#999' }}>تا</span>
        <Input
          value={displayValue[1]}
          placeholder={placeholder[1]}
          disabled={disabled}
          size={size}
          suffix={<CalendarOutlined />}
          readOnly
          style={{ flex: 1 }}
        />
      </div>
    </Popover>
  );
};

export default PersianRangePicker; 