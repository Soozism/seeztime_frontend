import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Space,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Tabs,
  Descriptions,
  Avatar,
  Spin,
  notification,
  Progress,
  Statistic,
  Alert,
  message,
  Select,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  UserOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  DeleteOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TimeLog,
  TimeLogCreate,
  TimeLogUpdate,
  User,
} from '../types';
import TaskService from '../services/taskService';
import TimeLogService from '../services/timeLogService';
import UserService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import 'dayjs/locale/fa';

dayjs.extend(duration);
dayjs.locale('fa');

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Extend Task type to include subtasks for this page
type TaskWithSubtasks = Task & { subtasks?: Task[] };

interface TimeTracker {
  isRunning: boolean;
  startTime: Date | null;
  elapsedTime: number; // in seconds
  sessionDescription: string;
}

interface TaskDetailEnhancedProps {}

const TaskDetailEnhanced: React.FC<TaskDetailEnhancedProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<TaskWithSubtasks | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // حذف state و منطق تایمر دستی
  // اضافه کردن state برای activeTimer و elapsedSeconds
  const [activeTimer, setActiveTimer] = useState<any>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [timerDescription, setTimerDescription] = useState('');
  
  // Modal states
  const [timeLogModalVisible, setTimeLogModalVisible] = useState(false);
  const [editTimeLogModalVisible, setEditTimeLogModalVisible] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);
  const [addSubtaskModalVisible, setAddSubtaskModalVisible] = useState(false);
  const [editSubtaskModalVisible, setEditSubtaskModalVisible] = useState(false);
  
  // Forms
  const [timeLogForm] = Form.useForm();
  const [editTimeLogForm] = Form.useForm();
  const [addSubtaskForm] = Form.useForm();
  const [editSubtaskForm] = Form.useForm();
  const [userOptions, setUserOptions] = useState<{ label: string; value: number }[]>([]);
  const [editingSubtask, setEditingSubtask] = useState<any>(null);
  
  useEffect(() => {
    if (addSubtaskModalVisible) {
      UserService.getUsers().then(users => {
        setUserOptions(users.map((u: any) => ({ label: u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.username, value: u.id })));
      });
    }
  }, [addSubtaskModalVisible]);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // تابع برای گرفتن تایمر فعال
  const fetchActiveTimer = useCallback(async () => {
    try {
      const timer = await TimeLogService.getActiveTimer();
      setActiveTimer(timer);
      setElapsedSeconds(timer?.elapsed_seconds || 0);
    } catch {
      setActiveTimer(null);
      setElapsedSeconds(0);
    }
  }, []);

  // useEffect برای بروزرسانی زمان سپری‌شده هر ثانیه اگر تایمر فعال است
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTimer && activeTimer.is_active) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  // useEffect برای گرفتن تایمر فعال هنگام mount و تغییر id
  useEffect(() => {
    fetchActiveTimer();
  }, [id, fetchActiveTimer]);

  // تابع شروع تایمر
  const handleStartTimer = async () => {
    try {
      await TimeLogService.startTimer(parseInt(id!));
      await fetchActiveTimer();
      notification.success({ message: 'تایمر شروع شد' });
    } catch (error: any) {
      notification.error({ message: 'خطا', description: error?.response?.data?.message || 'خطا در شروع تایمر' });
    }
  };

  // تابع پایان تایمر
  const handleStopTimer = async () => {
    try {
      await TimeLogService.stopTimer({ timer_id: activeTimer.id, description: timerDescription });
      setTimerDescription('');
      await fetchActiveTimer();
      await fetchTimeLogs();
      notification.success({ message: 'تایمر متوقف شد و زمان ثبت شد' });
    } catch (error: any) {
      notification.error({ message: 'خطا', description: error?.response?.data?.message || 'خطا در توقف تایمر' });
    }
  };

  // تابع فرمت زمان سپری‌شده
  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const fetchTaskDetail = useCallback(async (taskId: number) => {
    try {
      setLoading(true);
      const taskData = await TaskService.getTask(taskId);
      setTask(taskData);
    } catch (error) {
      console.error('Error fetching task detail:', error);
      notification.error({
        message: 'خطا',
        description: 'خطا در بارگذاری اطلاعات وظیفه',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTimeLogs = useCallback(async () => {
    if (!id) return;
    try {
      const timeLogsData = await TimeLogService.getTimeLogsByTask(parseInt(id));
      setTimeLogs(timeLogsData);
    } catch (error) {
      console.error('Error fetching time logs:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTaskDetail(parseInt(id));
      fetchTimeLogs();
    }
  }, [id, fetchTaskDetail, fetchTimeLogs]);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleAddTimeLog = async (values: any) => {
    try {
      await TimeLogService.logTime({
        task_id: parseInt(id!),
        duration_minutes: Math.round(values.hours * 60),
        description: values.description,
        is_manual: true,
        log_date: values.date.toISOString(),
      });
      await fetchTimeLogs();
      setTimeLogModalVisible(false);
      timeLogForm.resetFields();
      notification.success({
        message: 'موفقیت',
        description: 'لاگ زمانی با موفقیت اضافه شد',
      });
    } catch (error) {
      notification.error({
        message: 'خطا',
        description: 'خطا در اضافه کردن لاگ زمانی',
      });
    }
  };

  const handleEditTimeLog = async (values: any) => {
    if (!selectedTimeLog) return;
    try {
      await TimeLogService.updateTimeLog(selectedTimeLog.id, {
        hours: values.hours,
        description: values.description,
        date: values.date.toISOString(),
      });
      await fetchTimeLogs();
      setEditTimeLogModalVisible(false);
      setSelectedTimeLog(null);
      editTimeLogForm.resetFields();
      notification.success({
        message: 'موفقیت',
        description: 'لاگ زمانی با موفقیت ویرایش شد',
      });
    } catch (error) {
      notification.error({
        message: 'خطا',
        description: 'خطا در ویرایش لاگ زمانی',
      });
    }
  };

  const handleDeleteTimeLog = async (timeLogId: number) => {
    try {
      await TimeLogService.deleteTimeLog(timeLogId);
      await fetchTimeLogs();
      notification.success({
        message: 'موفقیت',
        description: 'لاگ زمانی حذف شد',
      });
    } catch (error) {
      notification.error({
        message: 'خطا',
        description: 'خطا در حذف لاگ زمانی',
      });
    }
  };

  const openEditTimeLogModal = (timeLog: TimeLog) => {
    setSelectedTimeLog(timeLog);
    editTimeLogForm.setFieldsValue({
      hours: timeLog.hours,
      description: timeLog.description,
      date: dayjs(timeLog.date),
    });
    setEditTimeLogModalVisible(true);
  };

  // Add subtask handler
  const handleAddSubtask = async (values: any) => {
    if (!task) return;
    try {
      await TaskService.createTask({
        ...values,
        status: 'todo',
        priority: values.priority,
        story_points: values.story_points || 0,
        estimated_hours: values.estimated_hours || 0,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        is_subtask: true,
        project_id: task.project_id,
        sprint_id: task.sprint_id,
        parent_task_id: task.id,
      });
      setAddSubtaskModalVisible(false);
      addSubtaskForm.resetFields();
      await fetchTaskDetail(task.id);
      notification.success({ message: 'زیر وظیفه با موفقیت اضافه شد' });
    } catch (error) {
      notification.error({ message: 'خطا', description: 'خطا در افزودن زیر وظیفه' });
    }
  };

  // Edit subtask handler
  const handleEditSubtask = (subtask: any) => {
    setEditingSubtask(subtask);
    editSubtaskForm.setFieldsValue({
      title: subtask.title,
      description: subtask.description,
      priority: subtask.priority,
      story_points: subtask.story_points,
      estimated_hours: subtask.estimated_hours,
      due_date: subtask.due_date ? dayjs(subtask.due_date) : null,
      assignee_id: subtask.assignee_id,
    });
    setEditSubtaskModalVisible(true);
  };

  const handleUpdateSubtask = async (values: any) => {
    if (!editingSubtask) return;
    try {
      await TaskService.updateTask(editingSubtask.id, {
        ...editingSubtask,
        ...values,
        due_date: values.due_date ? values.due_date.toISOString() : null,
      });
      setEditSubtaskModalVisible(false);
      setEditingSubtask(null);
      if (task) {
        await fetchTaskDetail(task.id);
      }
      notification.success({ message: 'زیر وظیفه با موفقیت ویرایش شد' });
    } catch (error) {
      notification.error({ message: 'خطا', description: 'خطا در ویرایش زیر وظیفه' });
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'green';
      case TaskPriority.MEDIUM:
        return 'orange';
      case TaskPriority.HIGH:
        return 'red';
      case TaskPriority.URGENT:
        return 'purple';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'default';
      case TaskStatus.IN_PROGRESS:
        return 'processing';
      case TaskStatus.REVIEW:
        return 'warning';
      case TaskStatus.DONE:
        return 'success';
      case TaskStatus.BLOCKED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityText = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'کم';
      case TaskPriority.MEDIUM:
        return 'متوسط';
      case TaskPriority.HIGH:
        return 'زیاد';
      case TaskPriority.URGENT:
        return 'فوری';
      default:
        return 'نامشخص';
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'انجام نشده';
      case TaskStatus.IN_PROGRESS:
        return 'در حال انجام';
      case TaskStatus.REVIEW:
        return 'در حال بررسی';
      case TaskStatus.DONE:
        return 'انجام شده';
      case TaskStatus.BLOCKED:
        return 'مسدود';
      default:
        return 'نامشخص';
    }
  };

  const totalLoggedHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);
  const progressPercentage = task ? Math.min((totalLoggedHours / task.estimated_hours) * 100, 100) : 0;

  const timeLogColumns = [
    {
      title: 'تاریخ',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY/MM/DD'),
    },
    {
      title: 'کاربر',
      dataIndex: 'user',
      key: 'user',
      render: (user: User) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {user?.first_name && user?.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user?.username}
        </Space>
      ),
    },
    {
      title: 'ساعت',
      dataIndex: 'hours',
      key: 'hours',
      render: (hours: number) => `${hours} ساعت`,
    },
    {
      title: 'توضیحات',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_text: any, record: TimeLog) => (
        <Space>
          {(user?.role === 'admin' || user?.role === 'project_manager') && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditTimeLogModal(record)}
            />
          )}
          {(user?.role === 'admin' || user?.role === 'project_manager') && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'حذف لاگ زمانی',
                  content: 'آیا مطمئن هستید که می‌خواهید این لاگ زمانی را حذف کنید؟',
                  okText: 'حذف',
                  cancelText: 'انصراف',
                  onOk: () => handleDeleteTimeLog(record.id),
                });
              }}
            />
          )}
        </Space>
      ),
    },
  ];

  const subtaskColumns = [
    {
      title: 'عنوان',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'اولویت',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: TaskPriority) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      ),
    },
    {
      title: 'مسئول',
      dataIndex: 'assignee_name',
      key: 'assignee_name',
    },
    {
      title: 'ساعت ثبت شده',
      dataIndex: 'actual_hours',
      key: 'actual_hours',
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {(user?.role === 'admin' || user?.role === 'project_manager' || (user?.role === 'developer' && record.created_by === user.id)) && (
            <Button icon={<EditOutlined />} size="small" onClick={() => handleEditSubtask(record)} />
          )}
          <Button icon={<InfoCircleOutlined />} size="small" onClick={() => navigate(`/tasks/${record.id}`)}>جزئیات</Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={4}>وظیفه یافت نشد</Title>
      </div>
    );
  }

  // Role-based logic
  const isAdminOrPM = user?.role === 'admin' || user?.role === 'project_manager';
  const isDeveloper = user?.role === 'developer';
  const isTaskCreator = task?.created_by_username === user?.username;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card>
            <Space style={{ marginBottom: '16px' }}>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
              >
                بازگشت
              </Button>
              {(isAdminOrPM || isTaskCreator) && (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/tasks/${id}/edit`)}
                >
                  ویرایش وظیفه
                </Button>
              )}
            </Space>
            
            <Title level={2}>{task.title}</Title>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="وضعیت">
                    <Tag color={getStatusColor(task.status)}>
                      {getStatusText(task.status)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="اولویت">
                    <Tag color={getPriorityColor(task.priority)}>
                      {getPriorityText(task.priority)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="امتیاز استوری">
                    {task.story_points}
                  </Descriptions.Item>
                  <Descriptions.Item label="تاریخ انتشار">
                    {task.due_date ? dayjs(task.due_date).format('YYYY/MM/DD') : 'تعیین نشده'}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              
              <Col xs={24} md={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="پروژه">
                    {task.project_name || 'نامشخص'}
                  </Descriptions.Item>
                  <Descriptions.Item label="مسئول">
                    {task.assignee_name || 'تعیین نشده'}
                  </Descriptions.Item>
                  <Descriptions.Item label="ایجاد کننده">
                    {task.created_by_name || 'نامشخص'}
                  </Descriptions.Item>
                  <Descriptions.Item label="اسپرینت">
                    {task.sprint_name || 'تعیین نشده'}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Subtasks Box */}
      {task && !task.is_subtask && !task.parent_task_id && task.subtasks && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card title="زیر وظایف"
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddSubtaskModalVisible(true)}>
                  افزودن زیر وظیفه
                </Button>
              }
            >
              <Table
                dataSource={task.subtasks}
                rowKey="id"
                pagination={false}
                columns={[
                  { title: 'عنوان', dataIndex: 'title', key: 'title' },
                  { title: 'وضعیت', dataIndex: 'status', key: 'status', render: (status) => (<Tag>{status}</Tag>) },
                  { title: 'اولویت', dataIndex: 'priority', key: 'priority' },
                  { title: 'مسئول', dataIndex: 'assignee_name', key: 'assignee_name' },
                  { title: 'ساعت ثبت شده', dataIndex: 'actual_hours', key: 'actual_hours' },
                  { title: 'عملیات', key: 'actions', render: (_: any, record: any) => (
                      <Space>
                        {(user?.role === 'admin' || user?.role === 'project_manager' || (user?.role === 'developer' && record.created_by === user.id)) && (
                          <Button icon={<EditOutlined />} size="small" onClick={() => handleEditSubtask(record)} />
                        )}
                        <Button icon={<InfoCircleOutlined />} size="small" onClick={() => navigate(`/tasks/${record.id}`)}>جزئیات</Button>
                      </Space>
                    ) },
                ]}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Time Tracking Card */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="ردیابی زمان خودکار">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={2} style={{ margin: 0, fontFamily: 'monospace' }}>
                    {formatElapsed(elapsedSeconds)}
                  </Title>
                  <Text type="secondary">زمان سپری‌شده</Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <Input
                  placeholder="توضیحات جلسه (اختیاری)"
                  value={timerDescription}
                  onChange={e => setTimerDescription(e.target.value)}
                  disabled={!activeTimer || !activeTimer.is_active}
                />
              </Col>
              <Col xs={24} md={8}>
                <Space>
                  {!activeTimer || !activeTimer.is_active ? (
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={handleStartTimer}
                      size="large"
                    >
                      شروع زمان
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      danger
                      icon={<StopOutlined />}
                      onClick={handleStopTimer}
                      size="large"
                    >
                      پایان زمان
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Progress and Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="ساعت برآورد شده"
              value={task.estimated_hours}
              suffix="ساعت"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="ساعت ثبت شده"
              value={totalLoggedHours}
              suffix="ساعت"
              prefix={<HistoryOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>پیشرفت کار</Text>
            </div>
            <Progress 
              percent={Math.round(progressPercentage)} 
              status={progressPercentage > 100 ? 'exception' : 'active'}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs for Details */}
      <Card>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="جزئیات وظیفه" key="1">
            <Paragraph>{task.description}</Paragraph>
          </Tabs.TabPane>
          
          <Tabs.TabPane 
            tab={
              <span>
                <ClockCircleOutlined />
                لاگ زمانی ({timeLogs.length})
              </span>
            } 
            key="2"
          >
            <Space style={{ marginBottom: '16px' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setTimeLogModalVisible(true)}
              >
                افزودن لاگ زمانی
              </Button>
            </Space>
            
            {progressPercentage > 100 && (
              <Alert
                message="هشدار"
                description="ساعت ثبت شده بیش از برآورد اولیه است"
                type="warning"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}
            
            <Table
              columns={timeLogColumns}
              dataSource={timeLogs}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              summary={(pageData) => {
                const totalHours = pageData.reduce((sum, record) => sum + record.hours, 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <strong>مجموع</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <strong>{totalHours} ساعت</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} colSpan={2} />
                  </Table.Summary.Row>
                );
              }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* Add Time Log Modal */}
      <Modal
        title="افزودن لاگ زمانی"
        open={timeLogModalVisible}
        onCancel={() => {
          setTimeLogModalVisible(false);
          timeLogForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={timeLogForm}
          layout="vertical"
          onFinish={handleAddTimeLog}
          initialValues={{
            date: dayjs(),
          }}
        >
          <Form.Item
            name="hours"
            label="ساعت"
            rules={[
              { required: true, message: 'ساعت الزامی است' },
              { type: 'number', min: 0.1, max: 24, message: 'ساعت باید بین 0.1 تا 24 باشد' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="مثال: 2.5"
              step={0.1}
              min={0.1}
              max={24}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="توضیحات"
            rules={[{ required: true, message: 'توضیحات الزامی است' }]}
          >
            <TextArea rows={3} placeholder="توضیحات کار انجام شده..." />
          </Form.Item>

          <Form.Item
            name="date"
            label="تاریخ"
            rules={[{ required: true, message: 'تاریخ الزامی است' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setTimeLogModalVisible(false);
                timeLogForm.resetFields();
              }}>
                انصراف
              </Button>
              <Button type="primary" htmlType="submit">
                ثبت
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Time Log Modal */}
      <Modal
        title="ویرایش لاگ زمانی"
        open={editTimeLogModalVisible}
        onCancel={() => {
          setEditTimeLogModalVisible(false);
          setSelectedTimeLog(null);
          editTimeLogForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={editTimeLogForm}
          layout="vertical"
          onFinish={handleEditTimeLog}
        >
          <Form.Item
            name="hours"
            label="ساعت"
            rules={[
              { required: true, message: 'ساعت الزامی است' },
              { type: 'number', min: 0.1, max: 24, message: 'ساعت باید بین 0.1 تا 24 باشد' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="مثال: 2.5"
              step={0.1}
              min={0.1}
              max={24}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="توضیحات"
            rules={[{ required: true, message: 'توضیحات الزامی است' }]}
          >
            <TextArea rows={3} placeholder="توضیحات کار انجام شده..." />
          </Form.Item>

          <Form.Item
            name="date"
            label="تاریخ"
            rules={[{ required: true, message: 'تاریخ الزامی است' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setEditTimeLogModalVisible(false);
                setSelectedTimeLog(null);
                editTimeLogForm.resetFields();
              }}>
                انصراف
              </Button>
              <Button type="primary" htmlType="submit">
                ذخیره تغییرات
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Subtask Modal */}
      <Modal
        title="افزودن زیر وظیفه"
        open={addSubtaskModalVisible}
        onCancel={() => {
          setAddSubtaskModalVisible(false);
          addSubtaskForm.resetFields();
        }}
        footer={null}
        bodyStyle={{ paddingBottom: 0 }}
      >
        <Form
          form={addSubtaskForm}
          layout="vertical"
          onFinish={handleAddSubtask}
        >
          {/* Make sure title is a top-level Form.Item for validation */}
          <Form.Item name="title" label="عنوان" rules={[{ required: true, message: 'عنوان الزامی است' }]}> 
            <Input placeholder="عنوان زیر وظیفه" />
          </Form.Item>
          <Form.Item name="description" label="توضیحات"> <Input.TextArea rows={2} placeholder="توضیحات..." /> </Form.Item>
          <Form.Item label="جزئیات" style={{ marginBottom: 0 }}>
            <Input.Group compact>
              <Form.Item name="priority" noStyle rules={[{ required: true, message: 'اولویت الزامی است' }]}> 
                <Select placeholder="اولویت" style={{ width: 120 }}>
                  <Select.Option value={1}>کم</Select.Option>
                  <Select.Option value={2}>متوسط</Select.Option>
                  <Select.Option value={3}>زیاد</Select.Option>
                  <Select.Option value={4}>فوری</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="story_points" noStyle> <InputNumber min={0} placeholder="امتیاز استوری" style={{ width: 120, marginLeft: 8 }} /> </Form.Item>
              <Form.Item name="estimated_hours" noStyle> <InputNumber min={0} placeholder="ساعت برآورد" style={{ width: 120, marginLeft: 8 }} /> </Form.Item>
            </Input.Group>
          </Form.Item>
          <Form.Item name="due_date" label="تاریخ سررسید"> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="assignee_id" label="مسئول" rules={[{ required: true, message: 'انتخاب مسئول الزامی است' }]}> 
            <Select
              showSearch
              placeholder="انتخاب مسئول"
              options={userOptions}
              optionFilterProp="label"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setAddSubtaskModalVisible(false); addSubtaskForm.resetFields(); }}>انصراف</Button>
              <Button type="primary" htmlType="submit">ثبت</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Subtask Modal */}
      <Modal
        title="ویرایش زیر وظیفه"
        open={editSubtaskModalVisible}
        onCancel={() => {
          setEditSubtaskModalVisible(false);
          setEditingSubtask(null);
          editSubtaskForm.resetFields();
        }}
        footer={null}
        bodyStyle={{ paddingBottom: 0 }}
      >
        <Form
          form={editSubtaskForm}
          layout="vertical"
          onFinish={handleUpdateSubtask}
        >
          <Form.Item name="title" label="عنوان" rules={[{ required: true, message: 'عنوان الزامی است' }]}> <Input placeholder="عنوان زیر وظیفه" /> </Form.Item>
          <Form.Item name="description" label="توضیحات"> <Input.TextArea rows={2} placeholder="توضیحات..." /> </Form.Item>
          <Form.Item label="جزئیات" style={{ marginBottom: 0 }}>
            <Input.Group compact>
              <Form.Item name="priority" noStyle rules={[{ required: true, message: 'اولویت الزامی است' }]}> 
                <Select placeholder="اولویت" style={{ width: 120 }}>
                  <Select.Option value={1}>کم</Select.Option>
                  <Select.Option value={2}>متوسط</Select.Option>
                  <Select.Option value={3}>زیاد</Select.Option>
                  <Select.Option value={4}>فوری</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="story_points" noStyle> <InputNumber min={0} placeholder="امتیاز استوری" style={{ width: 120, marginLeft: 8 }} /> </Form.Item>
              <Form.Item name="estimated_hours" noStyle> <InputNumber min={0} placeholder="ساعت برآورد" style={{ width: 120, marginLeft: 8 }} /> </Form.Item>
            </Input.Group>
          </Form.Item>
          <Form.Item name="due_date" label="تاریخ سررسید"> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="assignee_id" label="مسئول" rules={[{ required: true, message: 'انتخاب مسئول الزامی است' }]}> 
            <Select
              showSearch
              placeholder="انتخاب مسئول"
              options={userOptions}
              optionFilterProp="label"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setEditSubtaskModalVisible(false); setEditingSubtask(null); editSubtaskForm.resetFields(); }}>انصراف</Button>
              <Button type="primary" htmlType="submit">ذخیره تغییرات</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskDetailEnhanced;
