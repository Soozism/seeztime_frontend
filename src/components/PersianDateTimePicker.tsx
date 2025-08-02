import React from 'react';
import PersianDatePicker from './PersianDatePicker';
import type { Dayjs } from 'dayjs';

interface PersianDateTimePickerProps {
  value?: string | Date | Dayjs | null;
  onChange?: (date: string | null, dateString: string) => void;
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  size?: 'large' | 'middle' | 'small';
  style?: React.CSSProperties;
  className?: string;
}

// A convenience wrapper around PersianDatePicker that always enables `showTime`
// so that users can pick both date and time in one step.
const PersianDateTimePicker: React.FC<PersianDateTimePickerProps> = (props) => {
  return <PersianDatePicker {...props} showTime />;
};

export default PersianDateTimePicker; 