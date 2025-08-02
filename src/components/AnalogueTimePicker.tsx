import React, { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import '../styles/analogueTimePicker.css';
// @ts-ignore – the library has its own types but default export names
import { timePicker } from 'analogue-time-picker';

interface AnalogueTimePickerProps {
  value?: Dayjs | string | Date | null;
  onChange?: (time: Dayjs | null) => void;
  width?: string;
  className?: string;
}

// Wrapper around "analogue-time-picker" (material style clock)
// Renders an inline clock inside a div. Emits Dayjs object on changes.
const AnalogueTimePicker: React.FC<AnalogueTimePickerProps> = ({ value, onChange, width = '260px', className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // keep picker instance
  const pickerRef = useRef<any>(null);

  // initialisation
  useEffect(() => {
    if (containerRef.current && !pickerRef.current) {
      const initial = value ? (dayjs as any)(value) : (dayjs as any)();
      pickerRef.current = timePicker({
        element: containerRef.current,
        mode: 24,
        width,
        time: { hour: initial.hour(), minute: initial.minute() },
      });
      pickerRef.current.onTimeChanged((h: number, m: number) => {
        const t = (dayjs as any)().hour(h).minute(m).second(0);
        onChange?.(t);
      });
    }
  }, [containerRef]);

  // update when value prop changes
  useEffect(() => {
    if (pickerRef.current && value) {
      const t = (dayjs as any)(value);
      pickerRef.current.setTime(t.hour(), t.minute(), true);
    }
  }, [value]);

  return <div ref={containerRef} className={className} />;
};

export default AnalogueTimePicker; 