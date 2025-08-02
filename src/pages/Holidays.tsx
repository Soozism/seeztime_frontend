import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, message, Space, Popconfirm, InputNumber } from 'antd';
import * as dayjsLib from 'dayjs';
import holidaysService from '../services/holidaysService';
import { HolidayCreate, HolidayResponse } from '../types';

const { Option } = Select;

const Holidays: React.FC = () => {
  const [data, setData] = useState<HolidayResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<HolidayResponse | null>(null);
  const [yearFilter, setYearFilter] = useState<number | undefined>(new Date().getFullYear());
  const [form] = Form.useForm<HolidayCreate>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await holidaysService.listHolidays({ expand: true, year: yearFilter });
      setData(res);
    } catch {
      message.error('خطا در دریافت تعطیلات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [yearFilter]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const formatValue = (v: any, fmt: string) => (v && typeof v.format === 'function') ? v.format(fmt) : v;
      const payload: HolidayCreate = {
        ...values,
        date: formatValue(values.date, 'YYYY-MM-DD'),
      };
      if (editing) {
        await holidaysService.updateHoliday(editing.id, payload);
        message.success('به‌روزرسانی شد');
      } else {
        await holidaysService.createHoliday(payload);
        message.success('تعطیلی ایجاد شد');
      }
      setModalVisible(false);
      setEditing(null);
      form.resetFields();
      fetchData();
    } catch {}
  };

  const columns = [
    { title: 'شناسه', dataIndex: 'id', key: 'id' },
    { title: 'نام', dataIndex: 'name', key: 'name' },
    { title: 'تاریخ', dataIndex: 'date', key: 'date' },
    { title: 'نوع', dataIndex: 'calendar_type', key: 'calendar_type' },
    { title: 'عملیات', key: 'action', render: (_: any, record: HolidayResponse) => (
      <Space>
        <Button type="link" onClick={() => { const _d:any = (dayjsLib as any).default || dayjsLib; setEditing(record); setModalVisible(true); form.setFieldsValue({ ...record, date: _d(record.date) }); }}>ویرایش</Button>
        <Popconfirm title="حذف تعطیلی؟" onConfirm={async () => { await holidaysService.deleteHoliday(record.id); message.success('حذف شد'); fetchData(); }}>
          <Button danger type="link">حذف</Button>
        </Popconfirm>
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button type="primary" onClick={() => { setEditing(null); form.resetFields(); setModalVisible(true); }}>افزودن تعطیلی</Button>
        <Button onClick={fetchData}>بازخوانی</Button>
        <InputNumber placeholder="سال" value={yearFilter} onChange={v => setYearFilter(v || undefined)} />
        <Button onClick={() => holidaysService.createIranianHolidays(yearFilter || new Date().getFullYear()).then(()=>{message.success('تعطیلات ایران ایجاد شد'); fetchData();})}>ایجاد تعطیلات ایران</Button>
      </Space>
      <Table rowKey="id" dataSource={data} columns={columns} loading={loading} bordered />

      <Modal title={editing ? 'ویرایش تعطیلی' : 'افزودن تعطیلی'} open={modalVisible} onOk={handleCreate} onCancel={() => { setModalVisible(false); setEditing(null); }} okText="ثبت" cancelText="انصراف">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="نام" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="date" label="تاریخ" rules={[{ required: true }]}> <DatePicker /> </Form.Item>
          <Form.Item name="calendar_type" label="نوع" initialValue="national">
            <Select>
              <Option value="national">ملی</Option>
              <Option value="religious">مذهبی</Option>
              <Option value="company">سازمانی</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Holidays; 