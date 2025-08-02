import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, DatePicker, Input, Space, message, Popconfirm } from 'antd';
import type { TableColumnsType } from 'antd';
import timeOffService from '../services/timeOffService';
import { TimeOffCreate, TimeOffResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';

const TimeOffRequests: React.FC = () => {
  const [data, setData] = useState<TimeOffResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm<TimeOffCreate>();

  const { hasRole } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await timeOffService.listTimeOff({ expand: true });
      setData(res);
    } catch {
      message.error('خطا در دریافت درخواست‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const formatValue = (v: any, fmt: string) => (v && typeof v.format === 'function') ? v.format(fmt) : v;
      const payload: TimeOffCreate = {
        ...values,
        start_date: formatValue(values.start_date, 'YYYY-MM-DD'),
        end_date: formatValue(values.end_date, 'YYYY-MM-DD'),
      };
      await timeOffService.createTimeOff(payload);
      message.success('درخواست مرخصی ثبت شد');
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch {}
  };

  const columns: TableColumnsType<TimeOffResponse> = [
    { title: 'شناسه', dataIndex: 'id', key: 'id' },
    { title: 'کاربر', dataIndex: 'user_name', key: 'user_name' },
    { title: 'از تاریخ', dataIndex: 'start_date', key: 'start_date' },
    { title: 'تا تاریخ', dataIndex: 'end_date', key: 'end_date' },
    { title: 'وضعیت', dataIndex: 'status', key: 'status' },
    hasRole(['admin', 'project_manager']) ? {
      title: 'اقدامات',
      key: 'actions',
      render: (_: any, record: TimeOffResponse) => {
        if (record.status !== 'pending') return null;
        return (
          <Space>
            <Popconfirm title="تایید مرخصی؟" onConfirm={async () => { await timeOffService.approveTimeOff(record.id); message.success('تایید شد'); fetchData(); }}>
              <Button type="primary">تایید</Button>
            </Popconfirm>
            <Popconfirm title="رد مرخصی؟" onConfirm={async () => { await timeOffService.rejectTimeOff(record.id, 'رد توسط مدیر'); message.success('رد شد'); fetchData(); }}>
              <Button danger>رد</Button>
            </Popconfirm>
          </Space>
        );
      }
    } : null,
  ].filter(Boolean) as TableColumnsType<TimeOffResponse>;

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setModalVisible(true)}>درخواست مرخصی</Button>
        <Button onClick={fetchData}>بازخوانی</Button>
      </Space>
      <Table rowKey="id" dataSource={data} columns={columns} loading={loading} bordered />

      <Modal title="درخواست مرخصی" open={modalVisible} onOk={handleCreate} onCancel={() => setModalVisible(false)} okText="ثبت" cancelText="انصراف">
        <Form form={form} layout="vertical">
          <Form.Item name="start_date" label="از تاریخ" rules={[{ required: true }]}> <DatePicker /> </Form.Item>
          <Form.Item name="end_date" label="تا تاریخ" rules={[{ required: true }]}> <DatePicker /> </Form.Item>
          <Form.Item name="reason" label="دلیل"> <Input /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TimeOffRequests; 