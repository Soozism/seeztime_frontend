import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Button,
  Space,
  Tag,
  Card,
  Typography,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Tooltip,
  Statistic,
  Progress,
  Divider,
  Badge,
  Collapse,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ProjectOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { ProjectResponse, ProjectCreate, ProjectStatus, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ProjectService from '../services/projectService';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// Enhanced interface using new API response fields
interface ProjectFilters {
  search: string;
  status: ProjectStatus | null;
  createdBy: number | null;
}

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  archived: number;
  totalTasks: number;
  totalHours: number;
  averageProgress: number;
}

// Enhanced interface using ProjectResponse with all new fields
interface ProjectWithStats extends ProjectResponse {
  progress?: number; // Calculated field
}

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrPM = user?.role === 'admin' || user?.role === 'project_manager';

  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectWithStats | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    status: null,
    createdBy: null,
  });
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    active: 0,
    completed: 0,
    archived: 0,
    totalTasks: 0,
    totalHours: 0,
    averageProgress: 0,
  });

  // Fetch projects with enhanced data from new API response
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ProjectService.getProjects({});
      let projectData = Array.isArray(response) ? response : (response as any)?.data || [];

      // Add calculated progress to each project using completion_percentage from API
      const enhancedProjects: ProjectWithStats[] = projectData.map((project: ProjectResponse) => {
        // Use completion_percentage from API if available, otherwise calculate from tasks
        const progress = project.completion_percentage !== undefined 
          ? Math.round(project.completion_percentage) 
          : (project.total_tasks && project.total_tasks > 0 
              ? Math.round((project.done_tasks || 0) / project.total_tasks * 100) 
              : 0);

        return {
          ...project,
          progress,
        } as ProjectWithStats;
      });

      // Apply filters
      let filteredProjects = enhancedProjects;

      if (filters.search) {
        filteredProjects = filteredProjects.filter((project) =>
          project.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          project.description?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.status) {
        filteredProjects = filteredProjects.filter((project) => project.status === filters.status);
      }

      if (filters.createdBy) {
        filteredProjects = filteredProjects.filter((project) => project.created_by_id === filters.createdBy);
      }

      setProjects(filteredProjects);
      calculateStats(enhancedProjects);
    } catch (error) {
      message.error('خطا در بارگذاری پروژه‌ها');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const calculateStats = (projectData: ProjectWithStats[]) => {
    const stats: ProjectStats = {
      total: projectData.length,
      active: projectData.filter(p => p.status === ProjectStatus.ACTIVE).length,
      completed: projectData.filter(p => p.status === ProjectStatus.COMPLETED).length,
      archived: projectData.filter(p => p.status === ProjectStatus.ARCHIVED).length,
      totalTasks: projectData.reduce((sum, p) => sum + (p.total_tasks || 0), 0),
      totalHours: projectData.reduce((sum, p) => sum + (p.total_spent_hours || 0), 0),
      averageProgress: projectData.length > 0 ? 
        Math.round(projectData.reduce((sum, p) => sum + (p.progress || 0), 0) / projectData.length) : 0,
    };
    setStats(stats);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const response = await import('../services/userService').then(m => m.default.getUsers());
      setUsers(Array.isArray(response) ? response : (response as any)?.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, [fetchProjects, fetchUsers]);

  const handleCreate = () => {
    setEditingProject(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (project: ProjectResponse) => {
    setEditingProject(project);
    form.setFieldsValue({
      name: project.name,
      description: project.description,
      estimated_hours: project.estimated_hours,
      status: project.status,
      start_date: project.start_date ? dayjs(project.start_date) : null,
      end_date: project.end_date ? dayjs(project.end_date) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await ProjectService.deleteProject(id);
      message.success('پروژه با موفقیت حذف شد');
      fetchProjects();
    } catch (error) {
      message.error('خطا در حذف پروژه');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const projectData: ProjectCreate = {
        name: values.name,
        description: values.description ? values.description : '',
        estimated_hours: values.estimated_hours || 0,
        status: values.status,
        start_date: values.start_date ? values.start_date.toISOString() : null,
        end_date: values.end_date ? values.end_date.toISOString() : null,
      };
      if (editingProject) {
        await ProjectService.updateProject(editingProject.id, projectData);
        message.success('پروژه با موفقیت به‌روزرسانی شد');
      } else {
        await ProjectService.createProject(projectData);
        message.success('پروژه با موفقیت ایجاد شد');
      }
      setModalVisible(false);
      fetchProjects();
    } catch (error) {
      message.error('خطا در ذخیره پروژه');
    }
  };

  const handleViewDetails = (project: ProjectWithStats) => {
    setSelectedProject(project);
    setDetailModalVisible(true);
  };

  // Status helpers
  const getStatusTag = (status: ProjectStatus) => {
    const statusConfig: Record<ProjectStatus, { color: string; text: string }> = {
      [ProjectStatus.ACTIVE]: { color: 'green', text: 'فعال' },
      [ProjectStatus.COMPLETED]: { color: 'blue', text: 'تکمیل شده' },
      [ProjectStatus.ARCHIVED]: { color: 'default', text: 'آرشیو شده' },
    };
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#52c41a';
    if (progress >= 50) return '#1890ff';
    if (progress >= 25) return '#faad14';
    return '#ff4d4f';
  };

  // Stats cards component
  const renderStatsCards = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="کل پروژه‌ها"
            value={stats.total}
            prefix={<ProjectOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="فعال"
            value={stats.active}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="تکمیل شده"
            value={stats.completed}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="کل ساعات"
            value={stats.totalHours.toFixed(1)}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Project card component enhanced with new fields
  const renderProjectCard = (project: ProjectWithStats) => (
    <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
      <Card
        size="small"
        hoverable
        actions={[
          <Tooltip title="مشاهده جزئیات">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(project)}
            />
          </Tooltip>,
          <Tooltip title="رفتن به پروژه">
            <Button
              type="text"
              icon={<ProjectOutlined />}
              onClick={() => navigate(`/projects/${project.id}`)}
            />
          </Tooltip>,
          ...(isAdminOrPM ? [
            <Tooltip title="ویرایش">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(project)}
              />
            </Tooltip>,
            <Popconfirm
              title="آیا از حذف این پروژه اطمینان دارید؟"
              onConfirm={() => handleDelete(project.id)}
              okText="بله"
              cancelText="خیر"
            >
              <Tooltip title="حذف">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                />
              </Tooltip>
            </Popconfirm>
          ] : [])
        ]}
      >
        <div style={{ minHeight: '200px' }}>
          <div style={{ marginBottom: '12px' }}>
            <Text strong style={{ fontSize: '16px' }}>{project.name}</Text>
            <div style={{ float: 'right' }}>
              {getStatusTag(project.status)}
            </div>
          </div>
          
          <div style={{ marginBottom: '16px', minHeight: '40px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {project.description 
                ? (project.description.length > 80 
                    ? `${project.description.substring(0, 80)}...` 
                    : project.description)
                : 'توضیحی ندارد'
              }
            </Text>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <Progress
              percent={project.progress || 0}
              size="small"
              strokeColor={getProgressColor(project.progress || 0)}
              format={(percent) => `${percent}%`}
            />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {project.done_tasks || 0} از {project.total_tasks || 0} وظیفه
            </Text>
          </div>

          <Row gutter={8}>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <ClockCircleOutlined style={{ color: '#fa8c16', marginRight: 4 }} />
                <Text style={{ fontSize: '12px' }}>{(project.total_spent_hours || 0).toFixed(1)} ساعت</Text>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <TeamOutlined style={{ color: '#722ed1', marginRight: 4 }} />
                <Text style={{ fontSize: '12px' }}>{project.total_tasks || 0} وظیفه</Text>
              </div>
            </Col>
          </Row>

          {/* Display estimated hours if available */}
          {project.estimated_hours > 0 && (
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                تخمین: {project.estimated_hours} ساعت
              </Text>
            </div>
          )}

          <Divider style={{ margin: '12px 0 8px 0' }} />
          
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {dayjs(project.created_at).format('YYYY/MM/DD')}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              توسط {project.created_by_name || project.created_by_username || 'نامشخص'}
            </Text>
          </div>
        </div>
      </Card>
    </Col>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              مدیریت پروژه‌ها
              <Badge count={projects.length} style={{ marginLeft: 8 }} />
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
                onClick={fetchProjects}
                loading={loading}
              >
                بروزرسانی
              </Button>
              {isAdminOrPM && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  افزودن پروژه
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
                  placeholder="جستجوی پروژه‌ها..."
                  prefix={<SearchOutlined />}
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="انتخاب وضعیت"
                  value={filters.status}
                  onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value={ProjectStatus.ACTIVE}>فعال</Option>
                  <Option value={ProjectStatus.COMPLETED}>تکمیل شده</Option>
                  <Option value={ProjectStatus.ARCHIVED}>آرشیو شده</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="انتخاب سازنده"
                  value={filters.createdBy}
                  onChange={(value) => setFilters(prev => ({ ...prev, createdBy: value }))}
                  allowClear
                  style={{ width: '100%' }}
                  showSearch
                  filterOption={(input, option) => {
                    const user = users.find(u => u.id === option?.value);
                    return user ? (user.username || '').toLowerCase().includes(input.toLowerCase()) : false;
                  }}
                >
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.username})
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Panel>
        </Collapse>

        {/* Projects Cards Grid */}
        <div style={{ marginTop: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text>در حال بارگذاری...</Text>
            </div>
          ) : projects.length > 0 ? (
            <Row gutter={[16, 16]}>
              {projects.map(project => renderProjectCard(project))}
            </Row>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <ProjectOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
              <Text type="secondary">پروژه‌ای یافت نشد</Text>
            </div>
          )}
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingProject ? 'ویرایش پروژه' : 'ایجاد پروژه'}
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
            label="نام"
            name="name"
            rules={[{ required: true, message: 'لطفاً نام پروژه را وارد کنید' }]}
          >
            <Input placeholder="نام پروژه را وارد کنید" />
          </Form.Item>

          <Form.Item
            label="توضیحات"
            name="description"
          >
            <Input.TextArea
              rows={4}
              placeholder="توضیحات پروژه را وارد کنید"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="تخمین ساعات"
                name="estimated_hours"
              >
                <Input type="number" min={0} placeholder="تخمین ساعات" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="وضعیت"
                name="status"
                initialValue={ProjectStatus.ACTIVE}
              >
                <Select>
                  <Option value={ProjectStatus.ACTIVE}>فعال</Option>
                  <Option value={ProjectStatus.COMPLETED}>تکمیل شده</Option>
                  <Option value={ProjectStatus.ARCHIVED}>آرشیو شده</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="تاریخ شروع"
                name="start_date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="تاریخ پایان"
                name="end_date"
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
                  {editingProject ? 'به‌روزرسانی' : 'ایجاد'}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* Project Details Modal */}
      <Modal
        title={selectedProject ? `${selectedProject.name} - جزئیات` : 'جزئیات پروژه'}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedProject && (
          <div>
            <Card size="small" title="اطلاعات پروژه" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <p><strong>وضعیت:</strong> {getStatusTag(selectedProject.status)}</p>
                  <p><strong>توضیحات:</strong> {selectedProject.description || 'توضیحی ندارد'}</p>
                  <p><strong>تاریخ ایجاد:</strong> {dayjs(selectedProject.created_at).format('YYYY/MM/DD')}</p>
                  <p><strong>سازنده:</strong> {selectedProject.created_by_name || selectedProject.created_by_username || 'نامشخص'}</p>
                </Col>
                <Col span={12}>
                  <p><strong>وظایف:</strong> {selectedProject.total_tasks || 0}</p>
                  <p><strong>تکمیل شده:</strong> {selectedProject.done_tasks || 0}</p>
                  <p><strong>پیشرفت:</strong> {selectedProject.progress || 0}%</p>
                  <p><strong>کل ساعات:</strong> {(selectedProject.total_spent_hours || 0).toFixed(1)} ساعت</p>
                </Col>
              </Row>
            </Card>

            <Card size="small" title="پیشرفت پروژه">
              <Progress
                percent={selectedProject.progress || 0}
                strokeColor={getProgressColor(selectedProject.progress || 0)}
                format={(percent) => `${percent}%`}
              />
              <Divider />
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic title="کل وظایف" value={selectedProject.total_tasks || 0} />
                </Col>
                <Col span={8}>
                  <Statistic title="تکمیل شده" value={selectedProject.done_tasks || 0} />
                </Col>
                <Col span={8}>
                  <Statistic title="باقی‌مانده" value={(selectedProject.total_tasks || 0) - (selectedProject.done_tasks || 0)} />
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Projects;

// Projects.tsx
// Use useAuth() for user info
// import { useAuth } from '../contexts/AuthContext';
// const { user } = useAuth();
