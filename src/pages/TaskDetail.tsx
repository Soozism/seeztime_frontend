import React, { useState, useEffect, useCallback } from 'react';
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
  Timeline,
  List,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Task, TaskStatus, TaskPriority, TimeLog, TimeLogCreate, Comment as TaskComment } from '../types';
import TaskService from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import 'dayjs/locale/fa';

dayjs.locale('fa');

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface TaskDetailProps {}

const TaskDetail: React.FC<TaskDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, canCreateTasks } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLogModalVisible, setTimeLogModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [timeLogForm] = Form.useForm();
  const [commentForm] = Form.useForm();

  const createMockUser = () => ({
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    first_name: 'ادمین',
    last_name: 'سیستم',
    role: 'admin' as any,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const fetchTaskDetail = useCallback(async (taskId: number) => {
    try {
      setLoading(true);
      const taskData = await TaskService.getTask(taskId);
      setTask(taskData);
      
      // Fetch time logs and comments with mock data
      try {
        // This would be a real API call - for now using mock data
        const mockTimeLogs: TimeLog[] = [
          {
            id: 1,
            user: user || createMockUser(),
            user_id: user?.id || 1,
            task_id: parseInt(id!),
            hours: 2.5,
            description: 'کار روی طراحی اولیه',
            date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            task: {} as Task,
          },
          {
            id: 2,
            user: user || createMockUser(),
            user_id: user?.id || 1,
            task_id: parseInt(id!),
            hours: 1.0,
            description: 'بررسی و تست',
            date: new Date(Date.now() - 86400000).toISOString(),
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
            task: {} as Task,
          },
        ];
        setTimeLogs(mockTimeLogs);
        
        const mockComments: TaskComment[] = [
          {
            id: 1,
            task_id: taskId,
            user_id: user?.id || 1,
            user: user || createMockUser(),
            content: 'این وظیفه نیاز به بررسی بیشتر دارد',
            created_at: new Date().toISOString(),
          },
        ];
        setComments(mockComments);
      } catch (error) {
        console.error('Error fetching time logs/comments:', error);
      }
    } catch (error) {
      console.error('Error fetching task detail:', error);
      notification.error({
        message: 'خطا',
        description: 'خطا در بارگذاری اطلاعات وظیفه',
      });
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    if (id) {
      fetchTaskDetail(parseInt(id));
    }
  }, [id, fetchTaskDetail]);

  const handleAddTimeLog = async (values: any) => {
    try {
      const timeLogData: TimeLogCreate = {
        task_id: parseInt(id!),
        hours: values.hours,
        description: values.description,
        date: values.date.format('YYYY-MM-DD'),
      };

      // This would be a real API call
      const newTimeLog: TimeLog = {
        id: timeLogs.length + 1,
        description: timeLogData.description,
        hours: timeLogData.hours,
        date: timeLogData.date,
        user: user || createMockUser(),
        user_id: user?.id || 1,
        task_id: parseInt(id!),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        task: {} as Task,
      };

      setTimeLogs([...timeLogs, newTimeLog]);
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

  const handleAddComment = async (values: any) => {
    try {
      const newComment: TaskComment = {
        id: comments.length + 1,
        task_id: parseInt(id!),
        user_id: user?.id || 1,
        user: user || createMockUser(),
        content: values.content,
        created_at: new Date().toISOString(),
      };

      setComments([newComment, ...comments]);
      setCommentModalVisible(false);
      commentForm.resetFields();
      notification.success({
        message: 'موفقیت',
        description: 'نظر با موفقیت اضافه شد',
      });
    } catch (error) {
      notification.error({
        message: 'خطا',
        description: 'خطا در اضافه کردن نظر',
      });
    }
  };

    const getStatusTag = (status: TaskStatus) => {
      const statusConfig = {
        [TaskStatus.TODO]: { color: 'default', text: 'انجام نشده' },
        [TaskStatus.IN_PROGRESS]: { color: 'processing', text: 'در حال انجام' },
        [TaskStatus.REVIEW]: { color: 'warning', text: 'در حال بررسی' },
        [TaskStatus.BLOCKED]: { color: 'error', text: 'مسدود شده' },
        [TaskStatus.DONE]: { color: 'success', text: 'انجام شده' },
      };
      const config = statusConfig[status] || { color: 'default', text: 'نامشخص' };
      return <Tag color={config.color}>{config.text}</Tag>;
    };  const getPriorityColor = (priority: TaskPriority) => {
    const priorityConfig = {
      [TaskPriority.LOW]: { color: 'green', text: 'کم' },
      [TaskPriority.MEDIUM]: { color: 'orange', text: 'متوسط' },
      [TaskPriority.HIGH]: { color: 'red', text: 'بالا' },
      [TaskPriority.URGENT]: { color: 'magenta', text: 'فوری' },
    };
    return priorityConfig[priority] || { color: 'default', text: priority };
  };

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
      render: (user: any) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {user.first_name} {user.last_name}
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
    },
    {
      title: 'تاریخ ثبت',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY/MM/DD HH:mm'),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!task) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text>وظیفه یافت نشد</Text>
        </div>
      </Card>
    );
  }

  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);
  const progressPercentage = task.hours_estimated ? Math.round((totalHours / task.hours_estimated) * 100) : 0;

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space style={{ marginBottom: '16px' }}>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/tasks')}
              >
                بازگشت به لیست وظایف
              </Button>
              {canCreateTasks() && (
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
            
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col span={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="پروژه">
                    {task.project?.name || 'تعیین نشده'}
                  </Descriptions.Item>
                  <Descriptions.Item label="مسئول">
                    {task.assignee ? (
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} />
                        {task.assignee.first_name} {task.assignee.last_name}
                      </Space>
                    ) : (
                      'تعیین نشده'
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="وضعیت">
                    {getStatusTag(task.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="اولویت">
                    <Tag color={getPriorityColor(task.priority).color}>
                      {getPriorityColor(task.priority).text}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="امتیاز">
                    {task.story_points || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="ساعت برآوردی">
                    {task.hours_estimated ? `${task.hours_estimated} ساعت` : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="ساعت واقعی">
                    {task.hours_actual ? `${task.hours_actual} ساعت` : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="پیشرفت">
                    <Progress 
                      percent={progressPercentage} 
                      size="small"
                      status={progressPercentage > 100 ? 'exception' : 'active'}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {totalHours} از {task.hours_estimated || 0} ساعت
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            {task.description && (
              <Card size="small" title="توضیحات" style={{ marginBottom: '24px' }}>
                <Paragraph>{task.description}</Paragraph>
              </Card>
            )}

            <Tabs defaultActiveKey="timeLogs">
              <TabPane 
                tab={
                  <span>
                    <ClockCircleOutlined />
                    لاگ زمانی ({timeLogs.length})
                  </span>
                } 
                key="timeLogs"
              >
                <Row justify="space-between" style={{ marginBottom: '16px' }}>
                  <Col>
                    <Space>
                      <Text strong>مجموع ساعات: {totalHours}</Text>
                      {task.hours_estimated && (
                        <Text type="secondary">
                          از {task.hours_estimated} ساعت برآوردی
                        </Text>
                      )}
                    </Space>
                  </Col>
                  <Col>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setTimeLogModalVisible(true)}
                    >
                      افزودن لاگ زمانی
                    </Button>
                  </Col>
                </Row>
                
                <Table
                  dataSource={timeLogs}
                  columns={timeLogColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <FileTextOutlined />
                    نظرات ({comments.length})
                  </span>
                } 
                key="comments"
              >
                <Row justify="end" style={{ marginBottom: '16px' }}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setCommentModalVisible(true)}
                  >
                    افزودن نظر
                  </Button>
                </Row>

                <List
                  dataSource={comments}
                  renderItem={(comment) => (
                    <List.Item key={comment.id}>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={`${comment.user.first_name} ${comment.user.last_name}`}
                        description={
                          <div>
                            <div style={{ marginBottom: '8px' }}>
                              {comment.content}
                            </div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {dayjs(comment.created_at).format('YYYY/MM/DD HH:mm')}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
                {comments.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Text type="secondary">هیچ نظری ثبت نشده است</Text>
                  </div>
                )}
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <CalendarOutlined />
                    تاریخچه
                  </span>
                } 
                key="history"
              >
                <Timeline>
                  <Timeline.Item color="green">
                    <Text strong>ایجاد وظیفه</Text>
                    <br />
                    <Text type="secondary">
                      {dayjs(task.created_at).format('YYYY/MM/DD HH:mm')}
                    </Text>
                  </Timeline.Item>
                  {task.updated_at && task.updated_at !== task.created_at && (
                    <Timeline.Item color="blue">
                      <Text strong>آخرین بروزرسانی</Text>
                      <br />
                      <Text type="secondary">
                        {dayjs(task.updated_at).format('YYYY/MM/DD HH:mm')}
                      </Text>
                    </Timeline.Item>
                  )}
                </Timeline>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Time Log Modal */}
      <Modal
        title="افزودن لاگ زمانی"
        visible={timeLogModalVisible}
        onCancel={() => {
          setTimeLogModalVisible(false);
          timeLogForm.resetFields();
        }}
        footer={null}
        width={600}
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
            label="ساعت کار"
            name="hours"
            rules={[
              { required: true, message: 'لطفاً ساعت کار را وارد کنید' },
              { type: 'number', min: 0.1, message: 'ساعت کار باید بیشتر از صفر باشد' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="مثال: 2.5"
              step={0.5}
              min={0.1}
            />
          </Form.Item>

          <Form.Item
            label="تاریخ"
            name="date"
            rules={[{ required: true, message: 'لطفاً تاریخ را انتخاب کنید' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="توضیحات"
            name="description"
            rules={[{ required: true, message: 'لطفاً توضیحات را وارد کنید' }]}
          >
            <TextArea rows={4} placeholder="توضیح مختصری از کار انجام شده" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button onClick={() => {
                setTimeLogModalVisible(false);
                timeLogForm.resetFields();
              }}>
                انصراف
              </Button>
              <Button type="primary" htmlType="submit">
                افزودن
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Comment Modal */}
      <Modal
        title="افزودن نظر"
        visible={commentModalVisible}
        onCancel={() => {
          setCommentModalVisible(false);
          commentForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={commentForm}
          layout="vertical"
          onFinish={handleAddComment}
        >
          <Form.Item
            label="نظر"
            name="content"
            rules={[{ required: true, message: 'لطفاً نظر خود را وارد کنید' }]}
          >
            <TextArea rows={6} placeholder="نظر خود را اینجا بنویسید..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button onClick={() => {
                setCommentModalVisible(false);
                commentForm.resetFields();
              }}>
                انصراف
              </Button>
              <Button type="primary" htmlType="submit">
                افزودن
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskDetail;
