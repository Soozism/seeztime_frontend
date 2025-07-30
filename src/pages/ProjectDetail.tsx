import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Typography,
  Statistic,
  Row,
  Col,
  Empty,
  Popconfirm,
  Progress,
  Divider,
  List,
  Avatar,
} from 'antd';

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import {
  ProjectDetailResponse,
  Task,
  TaskCreate,
  TaskUpdate,
  Sprint,
  SprintCreate,
  SprintUpdate,
  Milestone,
  MilestoneCreate,
  Phase,
  PhaseCreate,
  PhaseUpdate,
  TaskStatus,
  TaskPriority,
  SprintStatus,
  MilestoneStatus,
  PhaseStatus,
  User,
} from '../types';
import ProjectService from '../services/projectService';
import TaskService from '../services/taskService';
import SprintService from '../services/sprintService';
import MilestoneService from '../services/milestoneService';
import PhaseService from '../services/phaseService';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const { Option } = Select;

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface ProjectDetailProps {}

const ProjectDetail: React.FC<ProjectDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrPM = user?.role === 'admin' || user?.role === 'project_manager';
  const isDeveloper = user?.role === 'developer';

  // State management - Updated to use ProjectDetailResponse
  const [project, setProject] = useState<ProjectDetailResponse | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modal states
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [sprintModalVisible, setSprintModalVisible] = useState(false);
  const [milestoneModalVisible, setMilestoneModalVisible] = useState(false);
  const [phaseModalVisible, setPhaseModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);

  const [taskForm] = Form.useForm();
  const [sprintForm] = Form.useForm();
  const [milestoneForm] = Form.useForm();
  const [phaseForm] = Form.useForm();

  const fetchProjectData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const projectId = parseInt(id);
      
      const [projectData, usersData, phasesData] = await Promise.all([
        ProjectService.getProject(projectId),
        userService.getUsers(),
        PhaseService.getProjectPhases(projectId),
      ]);

      setProject(projectData);
      setUsers(usersData || []);
      setPhases(phasesData || []);
      console.log('Phases loaded:', phasesData);
      
    } catch (error) {
      console.error('Error fetching project data:', error);
      message.error('خطا در بارگذاری اطلاعات پروژه');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id, fetchProjectData]);

  // Task management - using project.tasks from API response
  const handleCreateTask = async (values: any) => {
    if (!project) return;

    try {
      if (editingTask) {
        const taskData: TaskUpdate = {
          title: values.title,
          description: values.description || '',
          status: values.status || 'todo',
          priority: values.priority || 1,
          story_points: values.story_points || 0,
          estimated_hours: values.estimated_hours || 0,
          actual_hours: values.actual_hours || 0,
          assignee_id: values.assignee_id || 0,
          sprint_id: values.sprint_id || 0,
          phase_id: values.phase_id || 0,
          due_date: values.due_date?.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') || new Date().toISOString(),
          is_subtask: values.is_subtask || false,
        };
        
        await TaskService.updateTask(editingTask.id, taskData);
        message.success('وظیفه با موفقیت به‌روزرسانی شد');
      } else {
        const taskData: TaskCreate = {
          title: values.title,
          description: values.description || '',
          status: values.status || 'todo',
          priority: values.priority || 2,
          story_points: values.story_points || 0,
          estimated_hours: values.estimated_hours || 0,
          due_date: values.due_date?.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') || new Date().toISOString(),
          is_subtask: values.is_subtask || false,
          project_id: project.id,
          assignee_id: values.assignee_id || 0,
          sprint_id: values.sprint_id || 0,
          phase_id: values.phase_id || 0,
          parent_task_id: values.parent_task_id || 0,
        };
        
        await TaskService.createTask(taskData);
        message.success('وظیفه جدید با موفقیت ایجاد شد');
      }

      setTaskModalVisible(false);
      setEditingTask(null);
      taskForm.resetFields();
      fetchProjectData();
    } catch (error) {
      console.error('Error creating/updating task:', error);
      message.error('خطا در ایجاد/به‌روزرسانی وظیفه');
    }
  };

  // Phase management
  const handleCreatePhase = async (values: any) => {
    if (!project) return;

    try {
      if (editingPhase) {
        const phaseData: PhaseUpdate = {
          name: values.name,
          description: values.description,
          order: values.order || 0,
          status: values.status || 'planned',
          start_date: values.start_date?.toISOString(),
          end_date: values.end_date?.toISOString(),
        };
        await PhaseService.updatePhase(editingPhase.id, phaseData);
        message.success('فاز با موفقیت به‌روزرسانی شد');
      } else {
        const phaseData: PhaseCreate = {
          name: values.name,
          description: values.description,
          project_id: project.id,
          order: values.order || 0,
          status: values.status || 'planned',
          start_date: values.start_date?.toISOString(),
          end_date: values.end_date?.toISOString(),
        };
        await PhaseService.createPhase(phaseData);
        message.success('فاز جدید با موفقیت ایجاد شد');
      }

      setPhaseModalVisible(false);
      setEditingPhase(null);
      phaseForm.resetFields();
      fetchProjectData();
    } catch (error) {
      console.error('Error creating/updating phase:', error);
      message.error('خطا در ایجاد/به‌روزرسانی فاز');
    }
  };

  const handleDeletePhase = async (phaseId: number) => {
    try {
      await PhaseService.deletePhase(phaseId);
      message.success('فاز با موفقیت حذف شد');
      fetchProjectData();
    } catch (error) {
      console.error('Error deleting phase:', error);
      message.error('خطا در حذف فاز');
    }
  };

  // Sprint management - using project.sprints from API response
  const handleCreateSprint = async (values: any) => {
    if (!project) return;

    try {
      if (editingSprint) {
        const sprintUpdateData: SprintUpdate = {
          name: values.name,
          description: values.description,
          estimated_hours: values.estimated_hours || 0,
          start_date: values.start_date.toISOString(),
          end_date: values.end_date.toISOString(),
          milestone_id: values.milestone_id || null,
        };
        await SprintService.updateSprint(editingSprint.id, sprintUpdateData);
        message.success('اسپرینت با موفقیت به‌روزرسانی شد');
      } else {
        const sprintCreateData: SprintCreate = {
          name: values.name,
          description: values.description,
          estimated_hours: values.estimated_hours || 0,
          project_id: project.id,
          phase_id: values.phase_id || 0,
          milestone_id: values.milestone_id || null,
          start_date: values.start_date.toISOString(),
          end_date: values.end_date.toISOString(),
        };
        await SprintService.createSprint(sprintCreateData);
        message.success('اسپرینت جدید با موفقیت ایجاد شد');
      }

      setSprintModalVisible(false);
      setEditingSprint(null);
      sprintForm.resetFields();
      fetchProjectData();
    } catch (error) {
      console.error('Error creating/updating sprint:', error);
      message.error('خطا در ایجاد/به‌روزرسانی اسپرینت');
    }
  };

  // Milestone management - using project.milestones from API response
  const handleCreateMilestone = async (values: any) => {
    console.log('handleCreateMilestone called with values:', values); // Debug log
    if (!project) return;

    try {
      
      if (!values.due_date) {
        message.error('تاریخ تحویل الزامی است');
        return;
      }

      const milestoneData: MilestoneCreate = {
        name: values.name,
        description: values.description || '',
        estimated_hours: values.estimated_hours || 0,
        project_id: project.id,
        phase_id: values.phase_id || 0,
        due_date: values.due_date.toISOString(),
      };

      console.log('Milestone data to send:', milestoneData); // Debug log

      if (editingMilestone) {
        await MilestoneService.updateMilestone(editingMilestone.id, milestoneData);
        message.success('نقطه عطف با موفقیت به‌روزرسانی شد');
      } else {
        await MilestoneService.createMilestone(milestoneData);
        message.success('نقطه عطف جدید با موفقیت ایجاد شد');
      }

      setMilestoneModalVisible(false);
      setEditingMilestone(null);
      milestoneForm.resetFields();
      fetchProjectData();
    } catch (error) {
      console.error('Error creating/updating milestone:', error);
      message.error('خطا در ایجاد/به‌روزرسانی نقطه عطف');
    }
  };

  // Delete handlers
  const handleDeleteTask = async (taskId: number) => {
    try {
      await TaskService.deleteTask(taskId);
      message.success('وظیفه با موفقیت حذف شد');
      fetchProjectData();
    } catch (error) {
      console.error('Error deleting task:', error);
      message.error('خطا در حذف وظیفه');
    }
  };

  const handleDeleteSprint = async (sprintId: number) => {
    try {
      await SprintService.deleteSprint(sprintId);
      message.success('اسپرینت با موفقیت حذف شد');
      fetchProjectData();
    } catch (error) {
      console.error('Error deleting sprint:', error);
      message.error('خطا در حذف اسپرینت');
    }
  };

  const handleDeleteMilestone = async (milestoneId: number) => {
    try {
      await MilestoneService.deleteMilestone(milestoneId);
      message.success('نقطه عطف با موفقیت حذف شد');
      fetchProjectData();
    } catch (error) {
      console.error('Error deleting milestone:', error);
      message.error('خطا در حذف نقطه عطف');
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    const statusColors = {
      [TaskStatus.TODO]: 'default',
      [TaskStatus.IN_PROGRESS]: 'processing',
      [TaskStatus.REVIEW]: 'warning',
      [TaskStatus.BLOCKED]: 'error',
      [TaskStatus.DONE]: 'success',
      active: 'success',
      completed: 'success',
      pending: 'warning',
      planned: 'default',
      closed: 'default',
    };
    return statusColors[status as keyof typeof statusColors] || 'default';
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const priorityColors = {
      [TaskPriority.LOW]: 'green',
      [TaskPriority.MEDIUM]: 'blue',
      [TaskPriority.HIGH]: 'orange',
      [TaskPriority.URGENT]: 'red',
    };
    return priorityColors[priority];
  };

  const getPriorityText = (priority: TaskPriority) => {
    const priorityTexts = {
      [TaskPriority.LOW]: 'پایین',
      [TaskPriority.MEDIUM]: 'متوسط',
      [TaskPriority.HIGH]: 'بالا',
      [TaskPriority.URGENT]: 'بحرانی',
    };
    return priorityTexts[priority];
  };

  const getPhaseStatusText = (status: PhaseStatus) => {
    const statusTexts = {
      [PhaseStatus.PLANNED]: 'برنامه‌ریزی شده',
      [PhaseStatus.IN_PROGRESS]: 'در حال اجرا',
      [PhaseStatus.COMPLETED]: 'تکمیل شده',
      [PhaseStatus.ON_HOLD]: 'متوقف شده',
    };
    return statusTexts[status];
  };

  // Enhanced overview component using new API data
  const renderOverview = () => {
    if (!project) return null;

    return (
      <div>
        <Row gutter={[16, 16]}>
          {/* Task Summary */}
          <Col xs={24} md={12} lg={6}>
            <Card title="خلاصه وظایف" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic title="کل وظایف" value={project.task_summary.total} />
                <Progress
                  percent={project.task_summary.done_percentage}
                  strokeColor="#52c41a"
                  format={() => `${project.task_summary.done}/${project.task_summary.total}`}
                />
                <div>
                  <Tag color="default">انجام نشده: {project.task_summary.todo}</Tag>
                  <Tag color="processing">در حال انجام: {project.task_summary.in_progress}</Tag>
                  <Tag color="warning">بررسی: {project.task_summary.review}</Tag>
                  <Tag color="success">انجام شده: {project.task_summary.done}</Tag>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Sprint Summary */}
          <Col xs={24} md={12} lg={6}>
            <Card title="خلاصه اسپرینت‌ها" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic title="کل اسپرینت‌ها" value={project.sprint_summary.total} />
                <div>
                  <Tag color="default">برنامه‌ریزی شده: {project.sprint_summary.planned}</Tag>
                  <Tag color="processing">فعال: {project.sprint_summary.active}</Tag>
                  <Tag color="success">تکمیل شده: {project.sprint_summary.completed}</Tag>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Sprint Time Summary */}
          <Col xs={24} md={12} lg={6}>
            <Card title="تخمین زمان اسپرینت‌ها" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic 
                  title="کل تخمین ساعات" 
                  value={project.sprints.reduce((total, sprint) => total + (sprint.estimated_hours || 0), 0).toFixed(1)} 
                  suffix="ساعت"
                />
                <Statistic 
                  title="میانگین ساعات" 
                  value={project.sprints.length > 0 ? (project.sprints.reduce((total, sprint) => total + (sprint.estimated_hours || 0), 0) / project.sprints.length).toFixed(1) : '0'} 
                  suffix="ساعت"
                />
                <div>
                  <Tag color="blue">اسپرینت‌های فعال: {project.sprints.filter(s => s.status === SprintStatus.ACTIVE).reduce((total, sprint) => total + (sprint.estimated_hours || 0), 0).toFixed(1)} ساعت</Tag>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Milestone Summary */}
          <Col xs={24} md={12} lg={6}>
            <Card title="خلاصه نقاط عطف" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic title="کل نقاط عطف" value={project.milestone_summary.total} />
                <Progress
                  percent={project.milestone_summary.completed_percentage}
                  strokeColor="#1890ff"
                  format={() => `${project.milestone_summary.completed}/${project.milestone_summary.total}`}
                />
                <div>
                  <Tag color="warning">در انتظار: {project.milestone_summary.pending}</Tag>
                  <Tag color="success">تکمیل شده: {project.milestone_summary.completed}</Tag>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Users Summary */}
          <Col xs={24} md={12} lg={6}>
            <Card title="خلاصه کاربران" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic title="کاربران فعال" value={project.users_summary.active_users_count} />
                <Statistic 
                  title="کل ساعات" 
                  value={project.users_summary.total_project_hours.toFixed(1)} 
                  suffix="ساعت"
                />
                <Statistic 
                  title="کل امتیازات" 
                  value={project.users_summary.total_project_story_points} 
                  suffix="امتیاز"
                />
              </Space>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Users Performance */}
        <Card title="عملکرد کاربران" size="small" style={{ marginTop: '16px' }}>
          <List
            itemLayout="horizontal"
            dataSource={project.users_summary.users_stats}
            renderItem={(userStat) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={userStat.full_name}
                  description={`@${userStat.username}`}
                />
                <div>
                  <Space direction="vertical" size="small">
                    <Text><ClockCircleOutlined /> {userStat.total_hours.toFixed(1)} ساعت</Text>
                    <Text><TrophyOutlined /> {userStat.total_story_points} امتیاز</Text>
                    <Text><CheckCircleOutlined /> {userStat.tasks_completed}/{userStat.tasks_total} وظیفه</Text>
                  </Space>
                </div>
              </List.Item>
            )}
          />
        </Card>

        {/* Sprint Time List Card */}
        <Card title="لیست اسپرینت‌ها" size="small" style={{ marginTop: '16px' }}>
          <List
            itemLayout="horizontal"
            dataSource={project.sprints}
            renderItem={(sprint) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: getStatusColor(sprint.status) }}>{sprint.name.charAt(0)}</Avatar>}
                  title={sprint.name}
                  description={
                    <Space direction="vertical" size="small">
                      <Tag color={getStatusColor(sprint.status)}>
                        {sprint.status === SprintStatus.PLANNED ? 'برنامه‌ریزی شده' :
                         sprint.status === SprintStatus.ACTIVE ? 'فعال' :
                         sprint.status === SprintStatus.COMPLETED ? 'تکمیل شده' : sprint.status}
                      </Tag>
                      <Text type="secondary">
                        {sprint.start_date ? dayjs(sprint.start_date).format('YYYY/MM/DD') : 'بدون تاریخ شروع'} - 
                        {sprint.end_date ? dayjs(sprint.end_date).format('YYYY/MM/DD') : 'بدون تاریخ پایان'}
                      </Text>
                    </Space>
                  }
                />
                <div>
                  <Space direction="vertical" size="small" align="end">
                    <Text strong>
                      <ClockCircleOutlined /> {sprint.estimated_hours ? `${sprint.estimated_hours} ساعت` : 'تعیین نشده'}
                    </Text>
                    <Text type="secondary">
                      {sprint.task_count} وظیفه
                    </Text>
                  </Space>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>
    );
  };

  // Sprint Time List Card
  const renderSprintTimeList = () => {
    if (!project) return null;

    return (
      <Card title="تخمین زمان اسپرینت‌ها" size="small" style={{ marginTop: '16px' }}>
        <List
          itemLayout="horizontal"
          dataSource={project.sprints}
          renderItem={(sprint) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: getStatusColor(sprint.status) }}>{sprint.name.charAt(0)}</Avatar>}
                title={sprint.name}
                description={
                  <Space direction="vertical" size="small">
                    <Tag color={getStatusColor(sprint.status)}>
                      {sprint.status === SprintStatus.PLANNED ? 'برنامه‌ریزی شده' :
                       sprint.status === SprintStatus.ACTIVE ? 'فعال' :
                       sprint.status === SprintStatus.COMPLETED ? 'تکمیل شده' : sprint.status}
                    </Tag>
                    <Text type="secondary">
                      {sprint.start_date ? dayjs(sprint.start_date).format('YYYY/MM/DD') : 'بدون تاریخ شروع'} - 
                      {sprint.end_date ? dayjs(sprint.end_date).format('YYYY/MM/DD') : 'بدون تاریخ پایان'}
                    </Text>
                  </Space>
                }
              />
              <div>
                <Space direction="vertical" size="small" align="end">
                  <Text strong>
                    <ClockCircleOutlined /> {sprint.estimated_hours ? `${sprint.estimated_hours} ساعت` : 'تعیین نشده'}
                  </Text>
                  <Text type="secondary">
                    {sprint.task_count} وظیفه
                  </Text>
                </Space>
              </div>
            </List.Item>
          )}
        />
      </Card>
    );
  };

  // Table columns updated to use new API task structure
  const taskColumns: ColumnsType<any> = [
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
          {status === TaskStatus.TODO ? 'انجام نشده' :
           status === TaskStatus.IN_PROGRESS ? 'در حال انجام' :
           status === TaskStatus.REVIEW ? 'در حال بررسی' :
           status === TaskStatus.BLOCKED ? 'مسدود شده' :
           status === TaskStatus.DONE ? 'انجام شده' : status}
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
      render: (assigneeName: string) => assigneeName || 'تعیین نشده',
    },
    {
      title: 'اسپرینت',
      dataIndex: 'sprint_name',
      key: 'sprint_name',
      render: (sprintName: string) => sprintName || 'تعیین نشده',
    },
    {
      title: 'امتیاز',
      dataIndex: 'story_points',
      key: 'story_points',
    },
    {
      title: 'ساعت',
      key: 'hours',
      render: (_, record) => `${record.actual_hours}/${record.estimated_hours}`,
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/tasks/${record.id}`)}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              // Convert API task to Task interface for editing
              const taskForEdit: Task = {
                ...record,
                project_id: project!.id,
                assignee_id: users.find(u => u.username === record.assignee_username)?.id || 0,
                sprint_id: project!.sprints.find(s => s.name === record.sprint_name)?.id || 0,
                created_by_id: project!.created_by_id,
                parent_task_id: 0,
              };
              setEditingTask(taskForEdit);
              taskForm.setFieldsValue({
                ...taskForEdit,
                due_date: dayjs(record.due_date),
              });
              setTaskModalVisible(true);
            }}
          />
          <Popconfirm
            title="آیا از حذف این وظیفه اطمینان دارید؟"
            onConfirm={() => handleDeleteTask(record.id)}
            okText="بله"
            cancelText="خیر"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Sprint columns updated to use new API sprint structure
  const sprintColumns: ColumnsType<any> = [
    {
      title: 'نام',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      render: (status: SprintStatus) => (
        <Tag color={getStatusColor(status)}>
          {status === SprintStatus.PLANNED ? 'برنامه‌ریزی شده' :
           status === SprintStatus.ACTIVE ? 'فعال' :
           status === SprintStatus.COMPLETED ? 'تکمیل شده' : status}
        </Tag>
      ),
    },
    {
      title: 'تخمین ساعات',
      dataIndex: 'estimated_hours',
      key: 'estimated_hours',
      render: (hours: number) => hours ? `${hours} ساعت` : 'تعیین نشده',
    },
    {
      title: 'تاریخ شروع',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date: string) => date ? dayjs(date).format('YYYY/MM/DD') : 'تعیین نشده',
    },
    {
      title: 'تاریخ پایان',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date: string) => date ? dayjs(date).format('YYYY/MM/DD') : 'تعیین نشده',
    },
    {
      title: 'تعداد وظایف',
      dataIndex: 'task_count',
      key: 'task_count',
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              // Convert API sprint to Sprint interface for editing
              const sprintForEdit: Sprint = {
                ...record,
                project_id: project!.id,
                total_story_points: 0,
                completed_story_points: 0,
                tasks: [],
                project: undefined,
              };
              setEditingSprint(sprintForEdit);
              sprintForm.setFieldsValue({
                ...sprintForEdit,
                estimated_hours: record.estimated_hours,
                milestone_id: record.milestone_id,
                start_date: record.start_date ? dayjs(record.start_date) : null,
                end_date: record.end_date ? dayjs(record.end_date) : null,
              });
              setSprintModalVisible(true);
            }}
          />
          <Popconfirm
            title="آیا از حذف این اسپرینت اطمینان دارید؟"
            onConfirm={() => handleDeleteSprint(record.id)}
            okText="بله"
            cancelText="خیر"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Milestone columns updated to use new API milestone structure
  const milestoneColumns: ColumnsType<any> = [
    {
      title: 'نام',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'وضعیت',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.is_completed ? 'success' : 'warning'}>
          {record.is_completed ? 'تکمیل شده' : 'در انتظار'}
        </Tag>
      ),
    },
    {
      title: 'تاریخ تحویل',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => date ? dayjs(date).format('YYYY/MM/DD') : 'تعیین نشده',
    },
    {
      title: 'تعداد اسپرینت‌ها',
      dataIndex: 'sprint_count',
      key: 'sprint_count',
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              console.log('Opening milestone modal for edit:', record);
              // Convert API milestone to Milestone interface for editing
              const milestoneForEdit: Milestone = {
                ...record,
                project_id: project!.id,
                sprint_id: null,
                status: record.is_completed ? MilestoneStatus.COMPLETED : MilestoneStatus.PENDING,
                project: undefined,
                sprint: undefined,
                created_by: undefined,
              };
              setEditingMilestone(milestoneForEdit);
              milestoneForm.setFieldsValue({
                ...milestoneForEdit,
                estimated_hours: record.estimated_hours,
                phase_id: record.phase_id,
                due_date: record.due_date ? dayjs(record.due_date) : null,
              });
              console.log('Form fields set for edit');
              setMilestoneModalVisible(true);
            }}
          />
          <Popconfirm
            title="آیا از حذف این نقطه عطف اطمینان دارید؟"
            onConfirm={() => handleDeleteMilestone(record.id)}
            okText="بله"
            cancelText="خیر"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const phaseColumns: ColumnsType<any> = [
    {
      title: 'نام',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'توضیحات',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <Text type="secondary">{text || 'توضیحی ندارد'}</Text>,
    },
    {
      title: 'ترتیب',
      dataIndex: 'order',
      key: 'order',
      render: (order: number) => <Text>{order}</Text>,
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      render: (status: PhaseStatus) => (
        <Tag color={getStatusColor(status)}>
          {getPhaseStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'تاریخ شروع',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date: string) => date ? dayjs(date).format('YYYY/MM/DD') : 'تعیین نشده',
    },
    {
      title: 'تاریخ پایان',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date: string) => date ? dayjs(date).format('YYYY/MM/DD') : 'تعیین نشده',
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (record: Phase) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingPhase(record);
              phaseForm.setFieldsValue({
                name: record.name,
                description: record.description,
                order: record.order,
                status: record.status,
                start_date: record.start_date ? dayjs(record.start_date) : null,
                end_date: record.end_date ? dayjs(record.end_date) : null,
              });
              setPhaseModalVisible(true);
            }}
          />
          <Popconfirm
            title="آیا از حذف این فاز اطمینان دارید؟"
            onConfirm={() => handleDeletePhase(record.id)}
            okText="بله"
            cancelText="خیر"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  if (!project) {
    return <div>پروژه یافت نشد</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/projects')}
          style={{ marginBottom: '16px' }}
        >
          بازگشت به لیست پروژه‌ها
        </Button>
        
        <Title level={2}>{project.name}</Title>
        <Paragraph>{project.description}</Paragraph>
        
        <Row gutter={16} style={{ marginTop: '16px' }}>
          <Col span={6}>
            <Statistic title="وضعیت" value={project.status === 'active' ? 'فعال' : 'بسته شده'} />
          </Col>
          <Col span={6}>
            <Statistic title="درصد تکمیل" value={project.completion_percentage} suffix="%" />
          </Col>
          <Col span={6}>
            <Statistic title="کل ساعات" value={project.users_summary.total_project_hours.toFixed(1)} suffix="ساعت" />
          </Col>
          <Col span={6}>
            <Statistic title="کل امتیازات" value={project.users_summary.total_project_story_points} />
          </Col>
        </Row>
      </div>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="نمای کلی" key="overview">
          {renderOverview()}
        </TabPane>

        <TabPane tab="وظایف" key="tasks">
          <Card
            title="وظایف پروژه"
            extra={
              (isAdminOrPM || (isDeveloper && project.created_by_id === user.id)) && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingTask(null);
                    taskForm.resetFields();
                    setTaskModalVisible(true);
                  }}
                >
                  افزودن وظیفه
                </Button>
              )
            }
          >
            <Table
              columns={taskColumns}
              dataSource={project.tasks}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: <Empty description="هیچ وظیفه‌ای یافت نشد" /> }}
            />
          </Card>
        </TabPane>

        <TabPane tab="اسپرینت‌ها" key="sprints">
          <Card
            title="اسپرینت‌های پروژه"
            extra={
              (isAdminOrPM || (isDeveloper && project.created_by_id === user.id)) && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingSprint(null);
                    sprintForm.resetFields();
                    setSprintModalVisible(true);
                  }}
                >
                  افزودن اسپرینت
                </Button>
              )
            }
          >
            <Table
              columns={sprintColumns}
              dataSource={project.sprints}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: <Empty description="هیچ اسپرینتی یافت نشد" /> }}
            />
          </Card>
        </TabPane>

        <TabPane tab="فازها" key="phases">
          <Card
            title="فازهای پروژه"
            extra={
              (isAdminOrPM || (isDeveloper && project.created_by_id === user.id)) && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingPhase(null);
                    phaseForm.resetFields();
                    setPhaseModalVisible(true);
                  }}
                >
                  افزودن فاز
                </Button>
              )
            }
          >
            <Table
              columns={phaseColumns}
              dataSource={phases}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: <Empty description="هیچ فازی یافت نشد" /> }}
            />
          </Card>
        </TabPane>

        <TabPane tab="نقاط عطف" key="milestones">
          <Card
            title="نقاط عطف پروژه"
            extra={
              (isAdminOrPM || (isDeveloper && project.created_by_id === user.id)) && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingMilestone(null);
                    milestoneForm.resetFields();
                    console.log('Opening milestone modal for create');
                    setMilestoneModalVisible(true);
                  }}
                >
                  افزودن نقطه عطف
                </Button>
              )
            }
          >
            <Table
              columns={milestoneColumns}
              dataSource={project.milestones}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: <Empty description="هیچ نقطه عطفی یافت نشد" /> }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Task Modal */}
      <Modal
        title={editingTask ? 'ویرایش وظیفه' : 'افزودن وظیفه جدید'}
        open={taskModalVisible}
        onCancel={() => {
          setTaskModalVisible(false);
          setEditingTask(null);
          taskForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={taskForm}
          onFinish={handleCreateTask}
          layout="vertical"
          initialValues={{
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            story_points: 0,
            estimated_hours: 0,
            actual_hours: 0,
            assignee_id: 0,
            sprint_id: 0,
            description: '',
            is_subtask: false,
            parent_task_id: 0,
          }}
        >
          <Form.Item
            name="title"
            label="عنوان"
            rules={[{ required: true, message: 'لطفاً عنوان وظیفه را وارد کنید' }]}
          >
            <Input placeholder="عنوان وظیفه" />
          </Form.Item>

          <Form.Item 
            name="description" 
            label="توضیحات"
            rules={[{ required: true, message: 'لطفاً توضیحات وظیفه را وارد کنید' }]}
          >
            <TextArea rows={4} placeholder="توضیحات وظیفه" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="status" 
                label="وضعیت"
                rules={[{ required: true, message: 'لطفاً وضعیت را انتخاب کنید' }]}
              >
                <Select>
                  <Select.Option value={TaskStatus.TODO}>انجام نشده</Select.Option>
                  <Select.Option value={TaskStatus.IN_PROGRESS}>در حال انجام</Select.Option>
                  <Select.Option value={TaskStatus.REVIEW}>در حال بررسی</Select.Option>
                  <Select.Option value={TaskStatus.BLOCKED}>مسدود شده</Select.Option>
                  <Select.Option value={TaskStatus.DONE}>انجام شده</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="priority" 
                label="اولویت"
                rules={[{ required: true, message: 'لطفاً اولویت را انتخاب کنید' }]}
              >
                <Select>
                  <Select.Option value={TaskPriority.LOW}>پایین</Select.Option>
                  <Select.Option value={TaskPriority.MEDIUM}>متوسط</Select.Option>
                  <Select.Option value={TaskPriority.HIGH}>بالا</Select.Option>
                  <Select.Option value={TaskPriority.URGENT}>بحرانی</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="story_points" 
                label="امتیاز داستان"
                rules={[{ required: true, message: 'لطفاً امتیاز داستان را وارد کنید' }]}
              >
                <Input type="number" placeholder="امتیاز داستان" min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="estimated_hours" 
                label="ساعت تخمینی"
                rules={[{ required: true, message: 'لطفاً ساعت تخمینی را وارد کنید' }]}
              >
                <Input type="number" step="0.5" placeholder="ساعت تخمینی" min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="actual_hours" 
                label="ساعت واقعی"
                rules={[{ required: true, message: 'لطفاً ساعت واقعی را وارد کنید' }]}
              >
                <Input type="number" step="0.5" placeholder="ساعت واقعی" min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="assignee_id" 
                label="مسئول"
                rules={[{ required: true, message: 'لطفاً مسئول را انتخاب کنید' }]}
              >
                <Select placeholder="انتخاب مسئول">
                  <Select.Option value={0}>هیچ کس</Select.Option>
                  {users.map(user => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="sprint_id" 
                label="اسپرینت"
                rules={[{ required: true, message: 'لطفاً اسپرینت را انتخاب کنید' }]}
              >
                <Select placeholder="انتخاب اسپرینت">
                  <Select.Option value={0}>هیچ اسپرینت</Select.Option>
                  {project.sprints.map(sprint => (
                    <Select.Option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="due_date" 
                label="تاریخ انجام"
                rules={[{ required: true, message: 'لطفاً تاریخ انجام را انتخاب کنید' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'left', marginTop: '24px' }}>
            <Space>
              <Button onClick={() => {
                setTaskModalVisible(false);
                setEditingTask(null);
                taskForm.resetFields();
              }}>
                لغو
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTask ? 'به‌روزرسانی' : 'ایجاد'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Sprint Modal */}
      <Modal
        title={editingSprint ? 'ویرایش اسپرینت' : 'افزودن اسپرینت جدید'}
        open={sprintModalVisible}
        onCancel={() => {
          setSprintModalVisible(false);
          setEditingSprint(null);
          sprintForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={sprintForm} onFinish={handleCreateSprint} layout="vertical">
          <Form.Item
            name="name"
            label="نام اسپرینت"
            rules={[{ required: true, message: 'لطفاً نام اسپرینت را وارد کنید' }]}
          >
            <Input placeholder="نام اسپرینت" />
          </Form.Item>

          <Form.Item name="description" label="توضیحات">
            <TextArea rows={4} placeholder="توضیحات اسپرینت" />
          </Form.Item>

          <Form.Item
            name="estimated_hours"
            label="تخمین ساعات"
          >
            <Input type="number" min={0} placeholder="تخمین ساعات" />
          </Form.Item>

          <Form.Item
            name="milestone_id"
            label="نقطه عطف"
          >
            <Select placeholder="نقطه عطف را انتخاب کنید" allowClear>
              {project.milestones.map((milestone) => (
                <Select.Option key={milestone.id} value={milestone.id}>
                  {milestone.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="تاریخ شروع"
                rules={[{ required: true, message: 'لطفاً تاریخ شروع را انتخاب کنید' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="تاریخ شروع" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="تاریخ پایان"
                rules={[{ required: true, message: 'لطفاً تاریخ پایان را انتخاب کنید' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="تاریخ پایان" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'left', marginTop: '24px' }}>
            <Space>
              <Button onClick={() => {
                setSprintModalVisible(false);
                setEditingSprint(null);
                sprintForm.resetFields();
              }}>
                لغو
              </Button>
              <Button type="primary" htmlType="submit">
                {editingSprint ? 'به‌روزرسانی' : 'ایجاد'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Milestone Modal */}
      <Modal
        title={editingMilestone ? 'ویرایش نقطه عطف' : 'افزودن نقطه عطف جدید'}
        open={milestoneModalVisible}
        onCancel={() => {
          setMilestoneModalVisible(false);
          setEditingMilestone(null);
          milestoneForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form 
          form={milestoneForm} 
          onFinish={handleCreateMilestone} 
          onFinishFailed={(errorInfo) => {
            console.log('Form validation failed:', errorInfo);
            message.error('لطفاً تمام فیلدهای الزامی را پر کنید');
          }}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="نام نقطه عطف"
            rules={[{ required: true, message: 'لطفاً نام نقطه عطف را وارد کنید' }]}
          >
            <Input placeholder="نام نقطه عطف" />
          </Form.Item>

          <Form.Item name="description" label="توضیحات">
            <TextArea rows={4} placeholder="توضیحات نقطه عطف" />
          </Form.Item>

          <Form.Item
            name="estimated_hours"
            label="تخمین ساعات"
          >
            <Input type="number" min={0} placeholder="تخمین ساعات" />
          </Form.Item>

          <Form.Item
            name="phase_id"
            label="فاز"
          >
            <Select 
              placeholder="فاز را انتخاب کنید" 
              allowClear
              onChange={(value) => {
                console.log('Phase selected:', value);
              }}
            >
              {phases.map((phase) => (
                <Select.Option key={phase.id} value={phase.id}>
                  {phase.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="due_date"
            label="تاریخ تحویل"
            rules={[{ required: true, message: 'لطفاً تاریخ تحویل را انتخاب کنید' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              placeholder="تاریخ تحویل"
              format="YYYY-MM-DD"
              onChange={(date, dateString) => {
                console.log('DatePicker changed:', date, dateString);
              }}
            />
          </Form.Item>

          <div style={{ textAlign: 'left', marginTop: '24px' }}>
            <Space>
              <Button onClick={() => {
                setMilestoneModalVisible(false);
                setEditingMilestone(null);
                milestoneForm.resetFields();
              }}>
                لغو
              </Button>
              <Button type="primary" htmlType="submit">
                {editingMilestone ? 'به‌روزرسانی' : 'ایجاد'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Phase Modal */}
      <Modal
        title={editingPhase ? 'ویرایش فاز' : 'افزودن فاز جدید'}
        open={phaseModalVisible}
        onCancel={() => {
          setPhaseModalVisible(false);
          setEditingPhase(null);
          phaseForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={phaseForm} onFinish={handleCreatePhase} layout="vertical">
          <Form.Item
            name="name"
            label="نام فاز"
            rules={[{ required: true, message: 'لطفاً نام فاز را وارد کنید' }]}
          >
            <Input placeholder="نام فاز" />
          </Form.Item>

          <Form.Item name="description" label="توضیحات">
            <TextArea rows={4} placeholder="توضیحات فاز" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="order"
                label="ترتیب"
                rules={[{ required: true, message: 'لطفاً ترتیب فاز را وارد کنید' }]}
              >
                <Input type="number" min={1} placeholder="ترتیب فاز" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="وضعیت"
                rules={[{ required: true, message: 'لطفاً وضعیت فاز را انتخاب کنید' }]}
              >
                <Select placeholder="وضعیت فاز">
                  <Option value={PhaseStatus.PLANNED}>برنامه‌ریزی شده</Option>
                  <Option value={PhaseStatus.IN_PROGRESS}>در حال اجرا</Option>
                  <Option value={PhaseStatus.COMPLETED}>تکمیل شده</Option>
                  <Option value={PhaseStatus.ON_HOLD}>متوقف شده</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="تاریخ شروع"
              >
                <DatePicker style={{ width: '100%' }} placeholder="تاریخ شروع" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="تاریخ پایان"
              >
                <DatePicker style={{ width: '100%' }} placeholder="تاریخ پایان" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'left', marginTop: '24px' }}>
            <Space>
              <Button onClick={() => {
                setPhaseModalVisible(false);
                setEditingPhase(null);
                phaseForm.resetFields();
              }}>
                لغو
              </Button>
              <Button type="primary" htmlType="submit">
                {editingPhase ? 'به‌روزرسانی' : 'ایجاد'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
