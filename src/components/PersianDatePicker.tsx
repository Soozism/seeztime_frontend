import React, { useState } from 'react';
import { Input, Popover, Space } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import AnalogueTimePicker from './AnalogueTimePicker';
import { DayValue, Calendar } from '@hassanmojab/react-modern-calendar-datepicker';
import '@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css';
import { dateUtils } from '../utils/dateConfig';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import moment from 'moment-jalaali';
import '../styles/persianDatePicker.css';
// Configure moment-jalaali for Persian calendar once
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

interface PersianDatePickerProps {
  value?: string | Date | Dayjs | null;
  onChange?: (date: string | null, dateString: string) => void;
  showTime?: boolean;
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  size?: 'large' | 'middle' | 'small';
  style?: React.CSSProperties;
  className?: string;
}

// Convert Gregorian date to Persian date object
const gregorianToPersian = (date: Date): DayValue => {
  try {
    // Use moment-jalaali for proper conversion
    const persianDate = moment(date).format('jYYYY/jMM/jDD').split('/');
    const year = parseInt(persianDate[0]);
    const month = parseInt(persianDate[1]);
    const day = parseInt(persianDate[2]);
    
    // Ensure year is within valid range (1400-1450 for Persian calendar)
    const validYear = Math.max(1400, Math.min(1450, year));
    
    return {
      year: validYear,
      month: month,
      day: day,
    };
  } catch (error) {
    console.error('Error converting to Persian date:', error);
    // Fallback to current Persian date
    const now = moment();
    return {
      year: 1403,
      month: 1,
      day: 1,
    };
  }
};

// Convert Persian date object to Gregorian date
const persianToGregorian = (persianDate: DayValue | null): Date | null => {
  if (!persianDate) return null;
  
  try {
    // Use moment-jalaali for proper conversion
    const persianString = `${persianDate.year}/${persianDate.month.toString().padStart(2, '0')}/${persianDate.day.toString().padStart(2, '0')}`;
    const gregorianDate = moment(persianString, 'jYYYY/jMM/jDD').toDate();
    
    // Ensure valid date
    if (isNaN(gregorianDate.getTime())) {
      console.error('Invalid Persian date:', persianDate);
      return new Date();
    }
    
    return gregorianDate;
  } catch (error) {
    console.error('Error converting Persian to Gregorian:', error);
    return new Date();
  }
};

const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  value,
  onChange,
  showTime = false,
  format,
  placeholder = 'انتخاب تاریخ',
  disabled = false,
  allowClear = true,
  size = 'middle',
  style,
  className,
}) => {
  // Convert value to Persian date object for the date picker
  const [selectedDay, setSelectedDay] = useState<DayValue | null>(() => {
    if (!value) return null;
    
    try {
      let date: Date;
      if (value instanceof Date) {
        date = value;
      } else if (typeof value === 'string') {
        // Handle Persian date strings
        if (value.includes('/') && value.match(/^\d{4}\/\d{2}\/\d{2}/)) {
          // It's already a Persian date string
          const parts = value.split(' ')[0].split('/');
          return {
            year: parseInt(parts[0]),
            month: parseInt(parts[1]),
            day: parseInt(parts[2]),
          };
        } else {
          // It's a Gregorian date string
          date = new Date(value);
        }
      } else {
        // Handle Dayjs object
        const dayjsValue = value as any;
        date = dayjsValue.toDate ? dayjsValue.toDate() : new Date(dayjsValue.toString());
      }
      
      return gregorianToPersian(date);
    } catch (error) {
      console.error('Error parsing value:', value, error);
      return null;
    }
  });

  // Time state for time picker
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(() => {
    if (!value) return null;
    
    try {
      let date: Date;
      if (value instanceof Date) {
        date = value;
      } else if (typeof value === 'string') {
        // Handle Persian date strings with time
        if (value.includes('/') && value.includes(':')) {
          const [datePart, timePart] = value.split(' ');
          if (timePart) {
            const [hours, minutes] = timePart.split(':');
            const now = new Date();
            now.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return (dayjs as any)(now);
          }
        }
        date = new Date(value);
      } else {
        // Handle Dayjs object
        const dayjsValue = value as any;
        date = dayjsValue.toDate ? dayjsValue.toDate() : new Date(dayjsValue.toString());
      }
      
      return (dayjs as any)(date);
    } catch (error) {
      console.error('Error parsing time value:', value, error);
      return null;
    }
  });

  // Convert Persian date object to display string
  const getDisplayValue = () => {
    if (!selectedDay) return '';
    
    let displayValue = `${selectedDay.year}/${selectedDay.month.toString().padStart(2, '0')}/${selectedDay.day.toString().padStart(2, '0')}`;
    
    if (showTime && selectedTime) {
      const hours = (selectedTime as any).hour().toString().padStart(2, '0');
      const minutes = (selectedTime as any).minute().toString().padStart(2, '0');
      displayValue += ` ${hours}:${minutes}`;
    }
    
    return displayValue;
  };

  const handleDateChange = (day: DayValue | null) => {
    setSelectedDay(day);
    updateValue(day, selectedTime);
  };

  const handleTimeChange = (time: any) => {
    if (!time) {
      setSelectedTime(null);
      updateValue(selectedDay, null);
      return;
    }

    let newTime: Dayjs;
    if (typeof time === 'string') {
      const [hours, minutes] = time.split(':');
      newTime = (dayjs as any)()
        .hour(parseInt(hours, 10))
        .minute(parseInt(minutes, 10))
        .second(0);
    } else {
      // assume Dayjs
      newTime = (dayjs as any)(time);
    }

    setSelectedTime(newTime);
    updateValue(selectedDay, newTime);
  };

  const updateValue = (day: DayValue | null, time: Dayjs | null) => {
    if (onChange) {
      if (day) {
        const gregorianDate = persianToGregorian(day);
        if (gregorianDate) {
          let finalDate = gregorianDate;
          
          // Add time if time picker is enabled and time is selected
          if (showTime && time) {
            try {
              finalDate = new Date(
                gregorianDate.getFullYear(),
                gregorianDate.getMonth(),
                gregorianDate.getDate(),
                (time as any).hour(),
                (time as any).minute(),
                (time as any).second()
              );
            } catch (error) {
              console.error('Error setting time:', error);
              finalDate = gregorianDate;
            }
          }
          
          const gregorianString = finalDate.toISOString();
          const persianString = getDisplayValue();
          console.log('Updating value:', { day, time, gregorianString, persianString });
          onChange(gregorianString, persianString);
        } else {
          onChange(null, '');
        }
      } else {
        onChange(null, '');
      }
    }
  };

  // Update internal state when external value changes
  React.useEffect(() => {
    if (value) {
      try {
        let date: Date;
        if (value instanceof Date) {
          date = value;
        } else if (typeof value === 'string') {
          // Handle Persian date strings
          if (value.includes('/') && value.match(/^\d{4}\/\d{2}\/\d{2}/)) {
            // It's already a Persian date string
            const parts = value.split(' ')[0].split('/');
            const newDay = {
              year: parseInt(parts[0]),
              month: parseInt(parts[1]),
              day: parseInt(parts[2]),
            };
            setSelectedDay(newDay);
            
            // Handle time if present
            if (showTime && value.includes(':')) {
              const timePart = value.split(' ')[1];
              if (timePart) {
                const [hours, minutes] = timePart.split(':');
                const now = new Date();
                now.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                setSelectedTime((dayjs as any)(now));
              }
            }
            return;
          } else {
            // It's a Gregorian date string
            date = new Date(value);
          }
        } else {
          // Handle Dayjs object
          const dayjsValue = value as any;
          date = dayjsValue.toDate ? dayjsValue.toDate() : new Date(dayjsValue.toString());
        }
        
        const newDay = gregorianToPersian(date);
        setSelectedDay(newDay);
        setSelectedTime((dayjs as any)(date));
      } catch (error) {
        console.error('Error updating from external value:', value, error);
      }
    } else {
      setSelectedDay(null);
      setSelectedTime(null);
    }
  }, [value, showTime]);

  const combinedClassName = `custom-persian-date-picker${className ? ` ${className}` : ''}`;

  return (
    <div className={combinedClassName} style={style} aria-label="Persian date picker">
      <Popover
        trigger="click"
        content={
          <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
            <Calendar
              value={selectedDay as any}
              onChange={handleDateChange}
              locale="fa"
              shouldHighlightWeekends
              colorPrimary="#006D77"
            />
            {showTime && (
              <div style={{ direction: 'ltr' }}>
                <AnalogueTimePicker
                  value={selectedTime}
                  onChange={(t) => handleTimeChange(t)}
                />
              </div>
            )}
          </div>
        }
      >
        <Input
          prefix={<CalendarOutlined />}
          suffix={showTime ? <ClockCircleOutlined /> : null}
          value={getDisplayValue()}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          allowClear={allowClear}
          size={size}
        />
      </Popover>
    </div>
  );
};

export default PersianDatePicker; 