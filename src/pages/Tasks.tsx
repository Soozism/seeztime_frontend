import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Form,
  Input,
  Select,
  DatePicker,
  Modal,
  Badge,
  Tooltip,
  Popconfirm,
  message,
  Avatar,
  Collapse,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ProjectOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { 
  Task, 
  TaskCreate, 
  TaskUpdate,
  TaskStatus, 
  TaskPriority, 
  Project, 
  User, 
  Sprint,
  UserRole,
} from '../types';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import userService from '../services/userService';
import sprintService from '../services/sprintService';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

// Simple interfaces for local use
interface TaskFilters {
  searchText?: string;
  showCompleted?: boolean;
  projectId?: number;
  assigneeId?: number;
  priority?: TaskPriority;
  status?: TaskStatus;
}

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
}

// Extended interface that matches the API response - using same structure as Task
interface TaskWithDetails extends Omit<Task, 'actual_hours'> {
  actual_hours?: number; // Make it optional to avoid conflicts
  time_logs?: any;
  active_timer?: any;
}

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrPM = user?.role === 'admin' || user?.role === 'project_manager' || user?.role === UserRole.TEAM_LEADER;
  const isDeveloper = user?.role === 'developer';

  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
  });
  
  const [filters, setFilters] = useState<TaskFilters>({
    showCompleted: false,
    searchText: '',
  });

  const [form] = Form.useForm();


  // Calculate stats from tasks
  const calculateStats = useCallback((taskList: TaskWithDetails[]) => {
    const total = taskList.length;
    const completed = taskList.filter(t => t.status === 'done').length;
    const inProgress = taskList.filter(t => t.status === 'in_progress').length;
    const pending = taskList.filter(t => t.status === 'todo').length;
    const overdue = taskList.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
    ).length;

    setStats({ total, completed, inProgress, pending, overdue });
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const tasksData = await taskService.getTasks({});
      setTasks(tasksData);
      calculateStats(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      message.error('خطا در بارگذاری وظایف');
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  // Load supporting data
  const loadSupportingData = useCallback(async () => {
    // Load each resource independently to avoid blocking others on error
    try {
      const projectsDataRaw = await projectService.getProjects();
      let projectsData: Project[] = [];
      if (Array.isArray(projectsDataRaw)) {
        projectsData = projectsDataRaw;
      } else if (projectsDataRaw && typeof projectsDataRaw === 'object' && 'results' in projectsDataRaw && Array.isArray((projectsDataRaw as any).results)) {
        projectsData = (projectsDataRaw as any).results;
      }
      setProjects(projectsData);
    } catch (error) {
      setProjects([]);
      console.error('Error loading projects:', error);
    }
    try {
      const usersData = await userService.getUsers();
      setUsers(usersData);
    } catch (error) {
      setUsers([]);
      console.error('Error loading users:', error);
    }
    try {
      const sprintsData = await sprintService.getSprints();
      setSprints(sprintsData);
    } catch (error) {
      setSprints([]);
      console.error('Error loading sprints:', error);
    }
  }, []);

  useEffect(() => {
    loadSupportingData();
  }, [loadSupportingData]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Task management functions
  const handleCreate = () => {
    setEditingTask(null);
    form.resetFields();
    // Set default values for required fields
    form.setFieldsValue({
      status: 'todo',
      priority: 2,
      story_points: 0,
      estimated_hours: 0,
      actual_hours: 0,
      assignee_id: isDeveloper ? user?.id : 0,
      sprint_id: 0,
      is_subtask: false,
      parent_task_id: 0,
      description: '',
    });
    setModalVisible(true);
  };

  const handleEdit = (task: TaskWithDetails) => {
    // Convert TaskWithDetails to Task for editing
    const taskForEdit: Task = {
      ...task,
      actual_hours: task.actual_hours || 0, // Ensure it's a number
    };
    setEditingTask(taskForEdit);
    form.setFieldsValue({
      ...taskForEdit,
      due_date: taskForEdit.due_date ? dayjs(taskForEdit.due_date) : null,
      assignee_id: isDeveloper ? user?.id : taskForEdit.assignee_id,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await taskService.deleteTask(id);
      message.success('وظیفه با موفقیت حذف شد');
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      message.error('خطا در حذف وظیفه');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingTask) {
        const taskData: TaskUpdate = {
          title: values.title,
          description: values.description ? values.description : '',
          status: values.status || 'todo',
          priority: values.priority || 1,
          story_points: values.story_points || 0,
          estimated_hours: values.estimated_hours || 0,
          actual_hours: values.actual_hours || 0,
          assignee_id: isDeveloper ? user?.id : (values.assignee_id === 0 ? null : values.assignee_id),
          sprint_id: values.sprint_id || 0,
          phase_id: values.phase_id || 0,
          due_date: values.due_date?.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') || new Date().toISOString(),
          is_subtask: values.is_subtask || false,
        };
        await taskService.updateTask(editingTask.id, taskData);
        message.success('وظیفه با موفقیت به‌روزرسانی شد');
      } else {
        const taskData: TaskCreate = {
          title: values.title,
          description: values.description ? values.description : '',
          status: values.status || 'todo',
          priority: values.priority || 2,
          story_points: values.story_points || 0,
          estimated_hours: values.estimated_hours || 0,
          due_date: values.due_date?.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') || new Date().toISOString(),
          is_subtask: values.is_subtask || false,
          project_id: values.project_id,
          assignee_id: isDeveloper ? user?.id : (values.assignee_id === 0 ? null : values.assignee_id),
          sprint_id: values.sprint_id || 0,
          phase_id: values.phase_id || 0,
          parent_task_id: values.parent_task_id || 0,
        };
        await taskService.createTask(taskData);
        message.success('وظیفه با موفقیت ایجاد شد');
      }
      setModalVisible(false);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      message.error('خطا در ذخیره وظیفه');
    }
  };

  // Status and priority helpers
  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      todo: { color: 'default', text: 'انجام نشده' },
      in_progress: { color: 'processing', text: 'در حال انجام' },
      review: { color: 'warning', text: 'در حال بررسی' },
      done: { color: 'success', text: 'انجام شده' },
      blocked: { color: 'error', text: 'مسدود شده' },
    };

    const config = statusConfig[status] || statusConfig.todo;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPriorityTag = (priority: number) => {
    const priorityConfig: Record<number, { color: string; text: string }> = {
      1: { color: 'green', text: 'کم' },
      2: { color: 'orange', text: 'متوسط' },
      3: { color: 'red', text: 'بالا' },
      4: { color: 'red', text: 'فوری' },
    };

    const config = priorityConfig[priority] || priorityConfig[2];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Filter tasks based on filters
  const filteredTasks = tasks.filter(task => {
    if (!filters.showCompleted && task.status === 'done') return false;
    if (filters.searchText && !task.title.toLowerCase().includes(filters.searchText.toLowerCase())) return false;
    if (filters.projectId && task.project_id !== filters.projectId) return false;
    if (filters.assigneeId && task.assignee_id !== filters.assigneeId) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.status && task.status !== filters.status) return false;
    return true;
  });

  // Stats cards component
  const renderStatsCards = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="کل وظایف"
            value={stats.total}
            prefix={<FileTextOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="تکمیل شده"
            value={stats.completed}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="در حال انجام"
            value={stats.inProgress}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="عقب‌مانده"
            value={stats.overdue}
            prefix={<ExclamationCircleOutlined />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render task cards
  const renderTaskCards = () => (
    <Row gutter={[16, 16]}>
      {filteredTasks.map(task => (
        <Col xs={24} sm={12} lg={8} xl={6} key={task.id}>
          <Card
            size="small"
            hoverable
            style={{ borderRadius: 12, boxShadow: '0 2px 8px #f0f1f2', minHeight: 260, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            bodyStyle={{ padding: 18 }}
            actions={[
              <Tooltip title="جزئیات وظیفه" key="detail">
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                />
              </Tooltip>,
              ...(isAdminOrPM || (isDeveloper && task.created_by_username === user?.username) ? [
                <Tooltip title="ویرایش" key="edit">
                  <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(task)} />
                </Tooltip>,
                <Popconfirm
                  title="آیا از حذف این وظیفه اطمینان دارید؟"
                  onConfirm={() => handleDelete(task.id)}
                  okText="بله"
                  cancelText="خیر"
                  key="delete"
                >
                  <Tooltip title="حذف">
                    <Button type="text" icon={<DeleteOutlined />} danger />
                  </Tooltip>
                </Popconfirm>
              ] : [])
            ]}
          >
            <div style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Header: Title & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Tag color="blue" style={{ fontSize: '12px', marginRight: 0 }}>#{task.id}</Tag>
                {getPriorityTag(task.priority)}
              </div>
              <Typography.Title level={5} style={{ margin: 0, lineHeight: 1.3, fontWeight: 700 }} ellipsis={{ rows: 2 }}>
                {task.title}
              </Typography.Title>
              <div style={{ margin: '8px 0' }}>{getStatusTag(task.status)}</div>

              {/* Info: Project, Assignee, Dates */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ProjectOutlined style={{ color: '#1890ff' }} />
                  <Typography.Text style={{ fontSize: '12px' }}>
                    {task.project_name || 'بدون پروژه'}
                  </Typography.Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UserOutlined style={{ color: '#52c41a' }} />
                  <Typography.Text style={{ fontSize: '12px' }}>
                    {task.assignee_name || <Tag color="default">تخصیص داده نشده</Tag>}
                  </Typography.Text>
                </div>
                {task.sprint_name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Tag color="purple" style={{ fontSize: '11px' }}>{task.sprint_name}</Tag>
                  </div>
                )}
              </div>

              {/* Story Points & Hours */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                {task.story_points ? (
                  <Badge count={task.story_points} style={{ backgroundColor: '#52c41a' }} />
                ) : null}
                {task.estimated_hours ? (
                  <Tag color="cyan">برآورد: {task.estimated_hours} ساعت</Tag>
                ) : null}
                {task.actual_hours ? (
                  <Tag color="gold">واقعی: {task.actual_hours} ساعت</Tag>
                ) : null}
              </div>

              {/* Due Date */}
              {task.due_date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <ClockCircleOutlined style={{ color: '#666', fontSize: '13px' }} />
                  {(() => {
                    const dueDate = dayjs(task.due_date);
                    const isOverdue = dueDate.isBefore(dayjs(), 'day');
                    const isDueSoon = dueDate.diff(dayjs(), 'day') <= 3 && !isOverdue;
                    return (
                      <Tag 
                        color={isOverdue ? 'red' : isDueSoon ? 'orange' : 'blue'}
                        style={{ fontWeight: 600 }}
                      >
                        {dueDate.format('YYYY/MM/DD')}
                        {isOverdue && <span style={{ marginRight: 4 }}> (عقب‌مانده)</span>}
                      </Tag>
                    );
                  })()}
                </div>
              )}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              مدیریت وظایف
              <Badge count={filteredTasks.length} style={{ marginLeft: 8 }} />
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFiltersVisible(!filtersVisible)}
                type={filtersVisible ? 'primary' : 'default'}
              >
                فیلترها
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchTasks}
              >
                بروزرسانی
              </Button>
              {(isAdminOrPM || isDeveloper) && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  افزودن وظیفه
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        {renderStatsCards()}

        {/* Simple Filters */}
        <Collapse activeKey={filtersVisible ? ['filters'] : []}>
          <Panel header="فیلترها" key="filters">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="جستجوی وظایف..."
                  value={filters.searchText}
                  onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="انتخاب پروژه"
                  value={filters.projectId}
                  onChange={(projectId) => setFilters({ ...filters, projectId })}
                  style={{ width: '100%' }}
                  allowClear
                >
                  {projects.map(project => (
                    <Option key={project.id} value={project.id}>
                      {project.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="انتخاب مسئول"
                  value={filters.assigneeId}
                  onChange={(assigneeId) => setFilters({ ...filters, assigneeId })}
                  style={{ width: '100%' }}
                  allowClear
                >
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Space>
                  <Switch
                    checked={filters.showCompleted}
                    onChange={(showCompleted) => setFilters({ ...filters, showCompleted })}
                  />
                  <span>نمایش تکمیل شده</span>
                </Space>
              </Col>
            </Row>
          </Panel>
        </Collapse>

        {/* Tasks Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Typography.Text>در حال بارگذاری...</Typography.Text>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Typography.Text type="secondary">
              هیچ وظیفه‌ای یافت نشد
            </Typography.Text>
          </div>
        ) : (
          renderTaskCards()
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingTask ? 'ویرایش وظیفه' : 'ایجاد وظیفه'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="عنوان"
            name="title"
            rules={[{ required: true, message: 'لطفاً عنوان وظیفه را وارد کنید' }]}
          >
            <Input placeholder="عنوان وظیفه را وارد کنید" />
          </Form.Item>

          <Form.Item
            label="توضیحات"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="توضیحات وظیفه (اختیاری)"
            />
          </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="پروژه"
            name="project_id"
            rules={[{ required: true, message: 'لطفاً پروژه را انتخاب کنید' }]}
          >
            <Select placeholder="انتخاب پروژه">
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        {!isDeveloper && (
          <Col span={12}>
            <Form.Item
              label="مسئول"
              name="assignee_id"
              rules={[{ required: true, message: 'لطفاً مسئول را انتخاب کنید' }]}
              initialValue={0}
            >
              <Select placeholder="انتخاب مسئول">
                <Option value={0}>هیچ کس</Option>
                {users.map(user => (
                  <Option key={user.id} value={user.id}>
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} />
                      {user.first_name} {user.last_name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        )}
      </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="وضعیت"
                name="status"
                initialValue="todo"
              >
                <Select>
                  <Option value="todo">انجام نشده</Option>
                  <Option value="in_progress">در حال انجام</Option>
                  <Option value="review">در حال بررسی</Option>
                  <Option value="done">انجام شده</Option>
                  <Option value="blocked">مسدود شده</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="اولویت"
                name="priority"
                initialValue={2}
              >
                <Select>
                  <Option value={1}>کم</Option>
                  <Option value={2}>متوسط</Option>
                  <Option value={3}>بالا</Option>
                  <Option value={4}>فوری</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="اسپرینت"
                name="sprint_id"
                rules={[{ required: true, message: 'لطفاً اسپرینت را انتخاب کنید' }]}
                initialValue={0}
              >
                <Select placeholder="انتخاب اسپرینت">
                  <Option value={0}>هیچ اسپرینت</Option>
                  {sprints.map(sprint => (
                    <Option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="امتیاز استوری"
                name="story_points"
                rules={[{ required: true, message: 'لطفاً امتیاز استوری را وارد کنید' }]}
                initialValue={0}
              >
                <Input type="number" placeholder="امتیاز استوری" min={0} max={10} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="ساعت برآوردی"
                name="estimated_hours"
                rules={[{ required: true, message: 'لطفاً ساعت برآوردی را وارد کنید' }]}
                initialValue={0}
              >
                <Input type="number" placeholder="ساعت برآوردی" min={0} step={0.5} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="ساعت واقعی"
                name="actual_hours"
                rules={[{ required: true, message: 'لطفاً ساعت واقعی را وارد کنید' }]}
                initialValue={0}
              >
                <Input type="number" placeholder="ساعت واقعی" min={0} step={0.5} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="تاریخ انجام"
                name="due_date"
                rules={[{ required: true, message: 'لطفاً تاریخ انجام را انتخاب کنید' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Row justify="end" gutter={8}>
              <Col>
                <Button onClick={() => setModalVisible(false)}>
                  لغو
                </Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit">
                  {editingTask ? 'به‌روزرسانی' : 'ایجاد'}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tasks;

// Tasks.tsx
// Use useAuth() for user info
// const { user } = useAuth();
