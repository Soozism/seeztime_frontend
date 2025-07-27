import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Avatar,
} from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import { Sprint, SprintCreate, SprintStatus, Project, Milestone } from '../types';
import SprintService from '../services/sprintService';
import ProjectService from '../services/projectService';
import MilestoneService from '../services/milestoneService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Sprints: React.FC = () => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | undefined>();
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchSprints();
  }, [selectedProject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, milestonesData] = await Promise.all([
        ProjectService.getProjects(),
        MilestoneService.getMilestones(),
      ]);
      setProjects(projectsData);
      setMilestones(milestonesData);
      
      // Load all sprints initially
      const sprintsData = await SprintService.getSprints();
      setSprints(sprintsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const fetchSprints = async () => {
    try {
      const sprintsData = await SprintService.getSprints(selectedProject ? { project_id: selectedProject } : undefined);
      setSprints(sprintsData);
    } catch (error) {
      console.error('Error fetching sprints:', error);
      message.error('خطا در بارگذاری اسپرینت‌ها');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const sprintData: SprintCreate = {
        name: values.name,
        description: values.description,
        estimated_hours: values.estimated_hours || 0,
        project_id: values.project_id,
        phase_id: values.phase_id || 0,
        milestone_id: values.milestone_id || null,
        start_date: values.dateRange[0].toISOString(),
        end_date: values.dateRange[1].toISOString(),
      };

      if (editingSprint) {
        await SprintService.updateSprint(editingSprint.id, sprintData);
        message.success('اسپرینت با موفقیت به‌روزرسانی شد');
      } else {
        await SprintService.createSprint(sprintData);
        message.success('اسپرینت جدید با موفقیت ایجاد شد');
      }

      setModalVisible(false);
      setEditingSprint(null);
      form.resetFields();
      fetchSprints();
    } catch (error) {
      console.error('Error creating/updating sprint:', error);
      message.error('خطا در ایجاد/به‌روزرسانی اسپرینت');
    }
  };

  const handleEdit = (sprint: Sprint) => {
    setEditingSprint(sprint);
    form.setFieldsValue({
      name: sprint.name,
      description: sprint.description,
      estimated_hours: sprint.estimated_hours,
      project_id: sprint.project_id,
      milestone_id: sprint.milestone_id,
      dateRange: [dayjs(sprint.start_date), dayjs(sprint.end_date)],
    });
    setModalVisible(true);
  };

  const handleDelete = async (sprintId: number) => {
    try {
      await SprintService.deleteSprint(sprintId);
      message.success('اسپرینت با موفقیت حذف شد');
      fetchSprints();
    } catch (error) {
      console.error('Error deleting sprint:', error);
      message.error('خطا در حذف اسپرینت');
    }
  };

  const handleStatusChange = async (sprint: Sprint) => {
    try {
      if (sprint.status === SprintStatus.ACTIVE) {
        await SprintService.closeSprint(sprint.id);
      } else {
        await SprintService.startSprint(sprint.id);
      }
      message.success('وضعیت اسپرینت تغییر یافت');
      fetchSprints();
    } catch (error) {
      console.error('Error updating sprint status:', error);
      message.error('خطا در تغییر وضعیت اسپرینت');
    }
  };

  const getStatusColor = (status: SprintStatus) => {
    return status === SprintStatus.ACTIVE ? 'green' : 'gray';
  };

  const getStatusText = (status: SprintStatus) => {
    return status === SprintStatus.ACTIVE ? 'فعال' : 'بسته شده';
  };

  const calculateProgress = (sprint: Sprint) => {
    if (!sprint.total_story_points || sprint.total_story_points === 0) return 0;
    const completed = sprint.completed_story_points || 0;
    return Math.round((completed / sprint.total_story_points) * 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = dayjs(endDate);
    const now = dayjs();
    const diff = end.diff(now, 'day');
    return diff > 0 ? diff : 0;
  };

  const columns = [
    {
      title: 'نام اسپرینت',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Sprint) => (
        <Space>
          <Avatar icon={<CalendarOutlined />} />
          <div>
            <div><strong>{text}</strong></div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {record.tasks?.length || 0} وظیفه
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'پروژه',
      key: 'project',
      render: (record: Sprint) => (
        <Space>
          <ProjectOutlined />
          {record.project?.name || 'نامشخص'}
        </Space>
      ),
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      render: (status: SprintStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'پیشرفت',
      key: 'progress',
      render: (record: Sprint) => {
        const progress = calculateProgress(record);
        return (
          <div style={{ width: 120 }}>
            <Progress 
              percent={progress} 
              size="small" 
              format={() => `${record.completed_story_points}/${record.total_story_points}`}
            />
          </div>
        );
      },
    },
    {
      title: 'تاریخ شروع',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date: string) => dayjs(date).format('YYYY/MM/DD'),
    },
    {
      title: 'تاریخ پایان',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date: string, record: Sprint) => {
        const daysRemaining = getDaysRemaining(date);
        const isActive = record.status === SprintStatus.ACTIVE;
        return (
          <div>
            <div>{dayjs(date).format('YYYY/MM/DD')}</div>
            {isActive && (
              <div style={{ 
                fontSize: '12px', 
                color: daysRemaining > 3 ? '#52c41a' : daysRemaining > 0 ? '#faad14' : '#ff4d4f' 
              }}>
                {daysRemaining > 0 ? `${daysRemaining} روز باقی‌مانده` : 'منقضی شده'}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (record: Sprint) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            icon={record.status === SprintStatus.ACTIVE ? <StopOutlined /> : <PlayCircleOutlined />}
            onClick={() => handleStatusChange(record)}
            title={record.status === SprintStatus.ACTIVE ? 'بستن اسپرینت' : 'فعال کردن اسپرینت'}
          />
          <Popconfirm
            title="آیا از حذف این اسپرینت اطمینان دارید؟"
            onConfirm={() => handleDelete(record.id)}
            okText="بله"
            cancelText="خیر"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    totalSprints: sprints.length,
    activeSprints: sprints.filter(sprint => sprint.status === SprintStatus.ACTIVE).length,
    totalStoryPoints: sprints.reduce((sum, sprint) => sum + (sprint.total_story_points || 0), 0),
    completedStoryPoints: sprints.reduce((sum, sprint) => sum + (sprint.completed_story_points || 0), 0),
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CalendarOutlined style={{ marginLeft: 8 }} />
          مدیریت اسپرینت‌ها
        </Title>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کل اسپرینت‌ها"
              value={stats.totalSprints}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="اسپرینت‌های فعال"
              value={stats.activeSprints}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کل امتیاز استوری"
              value={stats.totalStoryPoints}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="امتیاز تکمیل شده"
              value={stats.completedStoryPoints}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="لیست اسپرینت‌ها"
        extra={
          <Space>
            <Select
              placeholder="انتخاب پروژه"
              style={{ width: 200 }}
              allowClear
              value={selectedProject}
              onChange={setSelectedProject}
            >
              {projects.map((project) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              اسپرینت جدید
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={sprints}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `مجموع ${total} اسپرینت`,
          }}
        />
      </Card>

      <Modal
        title={editingSprint ? 'ویرایش اسپرینت' : 'ایجاد اسپرینت جدید'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingSprint(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="نام اسپرینت"
            rules={[{ required: true, message: 'نام اسپرینت الزامی است' }]}
          >
            <Input placeholder="نام اسپرینت را وارد کنید" />
          </Form.Item>

          <Form.Item
            name="description"
            label="توضیحات"
            rules={[{ required: true, message: 'توضیحات الزامی است' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="توضیحات اسپرینت را وارد کنید"
            />
          </Form.Item>

          <Form.Item
            name="estimated_hours"
            label="تخمین ساعات"
          >
            <Input type="number" min={0} placeholder="تخمین ساعات" />
          </Form.Item>

          <Form.Item
            name="project_id"
            label="پروژه"
            rules={[{ required: true, message: 'انتخاب پروژه الزامی است' }]}
          >
            <Select
              placeholder="پروژه را انتخاب کنید"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {projects.map((project) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="milestone_id"
            label="میله‌سینه"
          >
            <Select
              placeholder="میله‌سینه را انتخاب کنید"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {milestones.map((milestone) => (
                <Option key={milestone.id} value={milestone.id}>
                  {milestone.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="بازه زمانی"
            rules={[{ required: true, message: 'انتخاب تاریخ الزامی است' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['تاریخ شروع', 'تاریخ پایان']}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                انصراف
              </Button>
              <Button type="primary" htmlType="submit">
                {editingSprint ? 'به‌روزرسانی' : 'ایجاد'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sprints;
