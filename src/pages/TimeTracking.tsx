import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Space, 
  Typography, 
  Tag, 
  Statistic, 
  Row, 
  Col, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Alert
} from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ClockCircleOutlined,
  PlusOutlined,
  DownloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import timeLogService from '../services/timeLogService';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import advancedQueriesService from '../services/advancedQueriesService';
import { useAuth } from '../contexts/AuthContext';
import NotificationService from '../utils/notifications';
import { TimeLog as ImportedTimeLog } from '../types';
import PersianDatePicker from '../components/PersianDatePicker';
import PersianRangePicker from '../components/PersianRangePicker';
import { dateUtils } from '../utils/dateConfig';

const { Title, Text } = Typography;
const { Option } = Select;

interface ActiveTimer {
  id: number;
  task_id: number;
  user_id: number;
  start_time: string;
  is_active: boolean;
  task_title: string;
  project_name: string;
  elapsed_seconds: number;
}

interface TimeLog {
  id: number;
  description: string;
  hours: number;
  date: string;
  task_id: number;
  user_id: number;
  created_at: string;
  task_title?: string;
  project_name?: string;
}

const TimeTracking: React.FC = () => {
  const { user } = useAuth();
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timerLoading, setTimerLoading] = useState(false);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [form] = Form.useForm();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    project_id: undefined,
    task_id: undefined
  });

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && activeTimer.is_active) {
      interval = setInterval(() => {
        const now = (dayjs as any)();
        const start = (dayjs as any)(activeTimer.start_time);
        setElapsedTime(now.diff(start, 'second'));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  // Load initial data
  useEffect(() => {
    loadActiveTimer();
    loadTimeLogs();
    loadTasks();
    loadProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadActiveTimer = async () => {
    try {
      const timer = await timeLogService.getActiveTimer();
      if (timer && timer.is_active) {
        setActiveTimer(timer);
        const now = (dayjs as any)();
        const start = (dayjs as any)(timer.start_time);
        setElapsedTime(now.diff(start, 'second'));
      }
    } catch (error) {
      // No active timer or error - this is fine
    }
  };

  const loadTimeLogs = useCallback(async () => {
    setLoading(true);
    try {
      const logs = await timeLogService.getTimeLogs({
        user_id: user?.id,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        task_id: filters.task_id || undefined,
        limit: 100
      });
      setTimeLogs(logs as any);
    } catch (error) {
      NotificationService.error('خطا در بارگذاری', 'امکان دریافت لاگ‌های زمانی وجود ندارد');
    }
    setLoading(false);
  }, [user?.id, filters.start_date, filters.end_date, filters.task_id]);

  const loadTasks = useCallback(async () => {
    try {
      const taskList = await taskService.getTasks({ 
        assignee_id: user?.id
      });
      setTasks(taskList);
    } catch (error) {
      NotificationService.error('خطا در بارگذاری', 'امکان دریافت تسک‌ها وجود ندارد');
    }
  }, [user?.id]);

  const loadProjects = async () => {
    try {
      const projectList = await projectService.getProjects({ 
        expand: false,
        limit: 50
      });
      setProjects(projectList);
    } catch (error) {
      NotificationService.error('خطا در بارگذاری', 'امکان دریافت پروژه‌ها وجود ندارد');
    }
  };

  const startTimer = async (taskId: number) => {
    setTimerLoading(true);
    try {
      await timeLogService.startTimer(taskId);
      await loadActiveTimer();
      NotificationService.success('تایمر آغاز شد', 'تایمر با موفقیت شروع شد');
    } catch (error) {
      NotificationService.error('خطا', 'امکان شروع تایمر وجود ندارد');
    }
    setTimerLoading(false);
  };

  const stopTimer = async (description?: string) => {
    setTimerLoading(true);
    try {
      await timeLogService.stopTimer({ description });
      setActiveTimer(null);
      setElapsedTime(0);
      await loadTimeLogs();
      NotificationService.success('تایمر متوقف شد', 'زمان با موفقیت ثبت شد');
    } catch (error) {
      NotificationService.error('خطا', 'امکان توقف تایمر وجود ندارد');
    }
    setTimerLoading(false);
  };

  const showStopTimerModal = () => {
    Modal.confirm({
      title: 'توقف تایمر',
      content: (
        <Form>
          <Form.Item label="توضیحات">
            <Input.TextArea 
              placeholder="توضیحات کار انجام شده..."
              onChange={(e) => setSelectedTask(e.target.value)}
            />
          </Form.Item>
        </Form>
      ),
      onOk: () => stopTimer(selectedTask),
      okText: 'ثبت و توقف',
      cancelText: 'انصراف',
    });
  };

  const handleManualLog = async (values: any) => {
    try {
      await timeLogService.createTimeLog({
        description: values.description,
        hours: values.hours,
        date: values.date.format('YYYY-MM-DD'),
        task_id: values.task_id
      });
      
      setLogModalVisible(false);
      form.resetFields();
      await loadTimeLogs();
      NotificationService.success('ثبت شد', 'لاگ زمانی با موفقیت ثبت شد');
    } catch (error) {
      NotificationService.error('خطا', 'امکان ثبت لاگ زمانی وجود ندارد');
    }
  };

  const exportTimeLogs = async () => {
    try {
      const blob = await advancedQueriesService.exportTimeLogs({
        user_id: user?.id,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        format: 'csv'
      });
      
      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `time-logs-${dateUtils.toPersian(dateUtils.now())}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      NotificationService.success('خروجی آماده شد', 'فایل با موفقیت دانلود شد');
    } catch (error) {
      NotificationService.error('خطا', 'امکان دانلود فایل وجود ندارد');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const columns = [
    {
      title: 'تاریخ',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dateUtils.toPersian(date)
    },
    {
      title: 'تسک',
      dataIndex: 'task_title',
      key: 'task_title',
      render: (title: string, record: TimeLog) => (
        <div>
          <div>{title}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.project_name}
          </Text>
        </div>
      )
    },
    {
      title: 'توضیحات',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'مدت زمان',
      dataIndex: 'hours',
      key: 'hours',
      render: (hours: number) => `${hours} ساعت`
    },
    {
      title: 'زمان ثبت',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at: string) => dateUtils.formatWithTime(created_at)
    }
  ];

  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);
  const todayHours = timeLogs
    .filter(log => dateUtils.isToday(log.date))
    .reduce((sum, log) => sum + log.hours, 0);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2}>
            <ClockCircleOutlined /> ردیابی زمان
          </Title>
        </Col>

        {/* Active Timer Card */}
        {activeTimer && (
          <Col span={24}>
            <Alert
              message={
                <Row align="middle" justify="space-between">
                  <Col>
                    <Space>
                      <ClockCircleOutlined spin />
                      <span>
                        تایمر فعال: {activeTimer.task_title} - {formatTime(elapsedTime)}
                      </span>
                    </Space>
                  </Col>
                  <Col>
                    <Button 
                      type="primary" 
                      danger 
                      icon={<PauseCircleOutlined />}
                      onClick={showStopTimerModal}
                      loading={timerLoading}
                    >
                      توقف تایمر
                    </Button>
                  </Col>
                </Row>
              }
              type="info"
              showIcon={false}
            />
          </Col>
        )}

        {/* Statistics Cards */}
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="مجموع ساعت‌ها" 
              value={totalHours} 
              suffix="ساعت"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="ساعت‌های امروز" 
              value={todayHours} 
              suffix="ساعت"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="تعداد لاگ‌ها" 
              value={timeLogs.length}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col span={24}>
          <Card title="اقدامات سریع">
            <Space wrap>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setLogModalVisible(true)}
              >
                ثبت دستی زمان
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                onClick={exportTimeLogs}
              >
                خروجی CSV
              </Button>
              <Button 
                icon={<FilterOutlined />}
                onClick={loadTimeLogs}
              >
                بروزرسانی
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Filters */}
        <Col span={24}>
          <Card title="فیلترها">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <PersianRangePicker
                  placeholder={['از تاریخ', 'تا تاریخ']}
                  style={{ width: '100%' }}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setFilters({
                        ...filters,
                        start_date: dateUtils.formatForAPI(dates[0]) || '',
                        end_date: dateUtils.formatForAPI(dates[1]) || ''
                      });
                    } else {
                      setFilters({
                        ...filters,
                        start_date: '',
                        end_date: ''
                      });
                    }
                  }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Select
                  placeholder="انتخاب پروژه"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={(value) => setFilters({ ...filters, project_id: value })}
                >
                  {projects.map(project => (
                    <Option key={project.id} value={project.id}>
                      {project.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={8}>
                <Button type="primary" onClick={loadTimeLogs}>
                  اعمال فیلتر
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Start Timer for Tasks */}
        {!activeTimer && (
          <Col span={24}>
            <Card title="شروع تایمر برای تسک">
              <Row gutter={[16, 16]}>
                {tasks.slice(0, 6).map(task => (
                  <Col xs={24} sm={12} md={8} key={task.id}>
                    <Card 
                      size="small"
                      title={task.title}
                      extra={
                        <Button 
                          type="primary" 
                          size="small"
                          icon={<PlayCircleOutlined />}
                          onClick={() => startTimer(task.id)}
                          loading={timerLoading}
                        >
                          شروع
                        </Button>
                      }
                    >
                      <Text type="secondary">{task.project?.name}</Text>
                      <br />
                      <Tag color={
                        task.status === 'todo' ? 'default' :
                        task.status === 'in_progress' ? 'processing' :
                        task.status === 'review' ? 'warning' :
                        task.status === 'done' ? 'success' : 'error'
                      }>
                        {task.status}
                      </Tag>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        )}

        {/* Time Logs Table */}
        <Col span={24}>
          <Card title="لاگ‌های زمانی">
            <Table
              columns={columns}
              dataSource={timeLogs}
              rowKey="id"
              loading={loading}
              pagination={{
                total: timeLogs.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} از ${total} مورد`
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Manual Log Modal */}
      <Modal
        title="ثبت دستی زمان"
        open={logModalVisible}
        onCancel={() => {
          setLogModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleManualLog}
        >
          <Form.Item
            name="task_id"
            label="تسک"
            rules={[{ required: true, message: 'لطفاً تسک را انتخاب کنید' }]}
          >
            <Select placeholder="انتخاب تسک">
              {tasks.map(task => (
                <Option key={task.id} value={task.id}>
                  {task.title} - {task.project?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="توضیحات"
            rules={[{ required: true, message: 'لطفاً توضیحات را وارد کنید' }]}
          >
            <Input.TextArea 
              rows={3}
              placeholder="توضیحات کار انجام شده..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="hours"
                label="مدت زمان (ساعت)"
                rules={[{ required: true, message: 'لطفاً مدت زمان را وارد کنید' }]}
              >
                <Input type="number" step="0.5" min="0" placeholder="2.5" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="تاریخ"
                rules={[{ required: true, message: 'لطفاً تاریخ را انتخاب کنید' }]}
                initialValue={dateUtils.now()}
              >
                <PersianDatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                ثبت زمان
              </Button>
              <Button onClick={() => {
                setLogModalVisible(false);
                form.resetFields();
              }}>
                انصراف
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TimeTracking;
