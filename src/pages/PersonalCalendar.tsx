import React, { useEffect, useState } from 'react';
import { Calendar as AntCalendar, Badge, Spin, message, Button, Space, Tooltip } from 'antd';
import dayjs from 'dayjs';
import workingHoursService from '../services/workingHoursService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DayInfo {
  date: string;
  is_working_day: boolean;
  is_holiday: boolean;
  is_time_off: boolean;
  holiday_name?: string | null;
  time_off_id?: number | null;
}

const statusColor = (info: DayInfo) => {
  if (info.is_holiday) return 'red';
  if (info.is_time_off) return 'gray';
  if (info.is_working_day) return 'green';
  return 'default';
};

const PersonalCalendar: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DayInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchMonth = async (monthDate: any) => {
    if (!user) return;
    setLoading(true);
    try {
      const _d: any = (dayjs as any).default ? (dayjs as any).default : dayjs;
      const start = _d(monthDate).startOf('month').format('YYYY-MM-DD');
      const end = _d(monthDate).endOf('month').format('YYYY-MM-DD');
      const res = await workingHoursService.getDailySchedule({ user_id: user.id, start_date: start, end_date: end });
      setData(res);
    } catch {
      message.error('خطا در دریافت تقویم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonth(new Date());
  }, [user]);

  const dateCellRender = (value: any) => {
    const dateStr = value.format('YYYY-MM-DD');
    const info = data.find(d => d.date === dateStr);
    if (!info) return null;
    const color = statusColor(info);
    let text = '';
    if (info.is_holiday) text = info.holiday_name || 'تعطیل';
    else if (info.is_time_off) text = 'مرخصی';
    else if (info.is_working_day) text = 'کاری';

    return (
      <Tooltip title={text}>
        <Badge status="default" color={color} />
      </Tooltip>
    );
  };

  const onPanelChange = (value: any) => {
    fetchMonth(value);
  };

  if (loading) return <Spin />;

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => navigate('/time-off')}>درخواست مرخصی</Button>
      </Space>
      <AntCalendar dateCellRender={dateCellRender} onPanelChange={(_val, mode)=>{ if(mode==='month') onPanelChange(_val); }} />
    </div>
  );
};

export default PersonalCalendar; 