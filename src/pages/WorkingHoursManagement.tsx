import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, TimePicker, DatePicker, InputNumber, Space, message, Popconfirm } from 'antd';
import workingHoursService from '../services/workingHoursService';
import { WorkingHoursResponse, WorkingHoursCreate } from '../types';

const WorkingHoursManagement: React.FC = () => {
  const [data, setData] = useState<WorkingHoursResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm<WorkingHoursCreate>();
  const [editingRecord, setEditingRecord] = useState<WorkingHoursResponse | null>(null);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await workingHoursService.listWorkingHours({ expand: true, active_only: false });
      setData(res);
    } catch (e) {
      message.error('خطا در دریافت اطلاعات ساعات کاری');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formatValue = (v: any, fmt: string) => {
        if (v && typeof (v as any).format === 'function') {
          return (v as any).format(fmt);
        }
        return v;
      };

      const payload: WorkingHoursCreate = {
        ...values,
        start_time: formatValue(values.start_time, 'HH:mm:ss'),
        end_time: formatValue(values.end_time, 'HH:mm:ss'),
        effective_from: formatValue(values.effective_from, 'YYYY-MM-DD'),
      };
      if (editingRecord) {
        await workingHoursService.updateWorkingHours(editingRecord.id, payload);
        message.success('ساعات کاری بروزرسانی شد');
      } else {
        await workingHoursService.createWorkingHours(payload);
        message.success('ساعات کاری با موفقیت ایجاد شد');
      }
      setModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
      fetchSchedules();
    } catch (e) {
      // Validation errors handled by form
    }
  };

  const columns = [
    { title: 'شناسه', dataIndex: 'id', key: 'id' },
    { title: 'کاربر', dataIndex: 'user_full_name', key: 'user_full_name' },
    { title: 'ساعت شروع', dataIndex: 'start_time', key: 'start_time' },
    { title: 'ساعت پایان', dataIndex: 'end_time', key: 'end_time' },
    { title: 'از تاریخ', dataIndex: 'effective_from', key: 'effective_from' },
    { title: 'تا تاریخ', dataIndex: 'effective_to', key: 'effective_to' },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_: any, record: WorkingHoursResponse) => (
        <Space>
          <Button type="link" onClick={() => {
            setEditingRecord(record);
            setModalVisible(true);
            form.setFieldsValue({
              ...record,
              start_time: record.start_time,
              end_time: record.end_time,
              effective_from: record.effective_from,
            });
          }}>ویرایش</Button>
          <Popconfirm title="حذف برنامه؟" onConfirm={async () => { await workingHoursService.deleteWorkingHours(record.id); message.success('حذف شد'); fetchSchedules(); }}>
            <Button danger type="link">حذف</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => { setEditingRecord(null); form.resetFields(); setModalVisible(true); }}>
          افزودن برنامه جدید
        </Button>
        <Button onClick={fetchSchedules}>بازخوانی</Button>
      </Space>

      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        bordered
        size="middle"
      />

      <Modal
        title="افزودن ساعات کاری"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText="ثبت"
        cancelText="انصراف"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="شناسه کاربر" name="user_id" rules={[{ required: true, message: 'وارد کردن شناسه کاربر الزامی است' }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="ساعت شروع" name="start_time" rules={[{ required: true, message: 'ساعت شروع را وارد کنید' }]}>
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="ساعت پایان" name="end_time" rules={[{ required: true, message: 'ساعت پایان را وارد کنید' }]}>
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="تاریخ شروع اعتبار" name="effective_from" rules={[{ required: true, message: 'تاریخ اعتبار را وارد کنید' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="ساعات کار در روز" name="work_hours_per_day">
            <InputNumber min={1} max={24} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkingHoursManagement; 