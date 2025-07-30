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
  Avatar,
  Progress,
} from 'antd';
import {
  FlagOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import { Milestone, MilestoneCreate, MilestoneStatus, Project, Sprint, Phase, UserRole } from '../types';
import MilestoneService from '../services/milestoneService';
import ProjectService from '../services/projectService';
import SprintService from '../services/sprintService';
import PhaseService from '../services/phaseService';
import dayjs from 'dayjs';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;
const { Option } = Select;

const Milestones: React.FC = () => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | undefined>();
  const [form] = Form.useForm();

  const isAdminOrPM = user?.role === 'admin' || user?.role === 'project_manager' || user?.role === UserRole.TEAM_LEADER;
  const isDeveloper = user?.role === 'developer';

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchMilestones();
  }, [selectedProject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, sprintsData, phasesData] = await Promise.all([
        ProjectService.getProjects(),
        SprintService.getSprints(),
        PhaseService.getPhases(),
      ]);
      setProjects(projectsData);
      setSprints(sprintsData);
      setPhases(phasesData);
      
      // Load all milestones initially
      const milestonesData = await MilestoneService.getMilestones();
      setMilestones(milestonesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async () => {
    try {
      const milestonesData = await MilestoneService.getMilestones(selectedProject ? { project_id: selectedProject } : undefined);
      setMilestones(milestonesData);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      message.error('خطا در بارگذاری نقاط عطف');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const milestoneData: MilestoneCreate = {
        name: values.name,
        description: values.description ? values.description : '',
        estimated_hours: values.estimated_hours || 0,
        due_date: values.due_date.toISOString(),
        project_id: values.project_id,
        phase_id: values.phase_id || 0,
        sprint_id: values.sprint_id,
      };
      if (editingMilestone) {
        await MilestoneService.updateMilestone(editingMilestone.id, milestoneData);
        message.success('نقطه عطف با موفقیت به‌روزرسانی شد');
      } else {
        await MilestoneService.createMilestone(milestoneData);
        message.success('نقطه عطف با موفقیت ایجاد شد');
      }
      setModalVisible(false);
      setEditingMilestone(null);
      form.resetFields();
      fetchMilestones();
    } catch (error) {
      console.error('Error creating/updating milestone:', error);
      message.error('خطا در ایجاد/به‌روزرسانی نقطه عطف');
    }
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    form.setFieldsValue({
      name: milestone.name,
      description: milestone.description,
      estimated_hours: milestone.estimated_hours,
      due_date: dayjs(milestone.due_date),
      project_id: milestone.project_id,
      phase_id: milestone.phase_id,
      sprint_id: milestone.sprint_id,
    });
    setModalVisible(true);
  };

  const handleDelete = async (milestoneId: number) => {
    try {
      await MilestoneService.deleteMilestone(milestoneId);
      message.success('نقطه عطف با موفقیت حذف شد');
      fetchMilestones();
    } catch (error) {
      console.error('Error deleting milestone:', error);
      message.error('خطا در حذف نقطه عطف');
    }
  };

  const handleStatusChange = async (milestone: Milestone, newStatus: MilestoneStatus) => {
    try {
      await MilestoneService.updateMilestone(milestone.id, { status: newStatus } as any);
      message.success('وضعیت نقطه عطف تغییر یافت');
      fetchMilestones();
    } catch (error) {
      console.error('Error updating milestone status:', error);
      message.error('خطا در تغییر وضعیت نقطه عطف');
    }
  };

  const getStatusColor = (status: MilestoneStatus) => {
    const colors = {
      [MilestoneStatus.PENDING]: 'orange',
      [MilestoneStatus.IN_PROGRESS]: 'blue',
      [MilestoneStatus.COMPLETED]: 'green',
    };
    return colors[status];
  };

  const getStatusText = (status: MilestoneStatus) => {
    const texts = {
      [MilestoneStatus.PENDING]: 'در انتظار',
      [MilestoneStatus.IN_PROGRESS]: 'در حال انجام',
      [MilestoneStatus.COMPLETED]: 'تکمیل شده',
    };
    return texts[status];
  };

  const getDaysToDeadline = (dueDate: string | null | undefined) => {
    if (!dueDate) return null;
    const due = dayjs(dueDate);
    const now = dayjs();
    const diff = due.diff(now, 'day');
    return diff;
  };

  const getProgressColor = (daysToDeadline: number | null, status?: MilestoneStatus) => {
    if (status === MilestoneStatus.COMPLETED) return '#52c41a';
    if (daysToDeadline === null) return '#d9d9d9';
    if (daysToDeadline < 0) return '#ff4d4f';
    if (daysToDeadline <= 3) return '#faad14';
    return '#1890ff';
  };

  const columns = [
    {
      title: 'نام نقطه عطف',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Milestone) => {
        const daysToDeadline = getDaysToDeadline(record.due_date);
        return (
          <span>{text}</span>
        );
      },
    },
    {
      title: 'توضیحات',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'پروژه',
      key: 'project',
      render: (record: Milestone) => (
        record.project ? (
          <Space>
            <ProjectOutlined />
            {record.project?.name || 'نامشخص'}
          </Space>
        ) : '-'
      ),
    },
    {
      title: 'وضعیت',
      key: 'status',
      render: (status: MilestoneStatus, record: Milestone) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(newStatus) => handleStatusChange(record, newStatus)}
        >
          <Option value={MilestoneStatus.PENDING}>در انتظار</Option>
          <Option value={MilestoneStatus.IN_PROGRESS}>در حال انجام</Option>
          <Option value={MilestoneStatus.COMPLETED}>تکمیل شده</Option>
        </Select>
      ),
    },
    {
      title: 'تاریخ هدف',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string, record: Milestone) => {
        const daysToDeadline = getDaysToDeadline(date);
        const isOverdue = daysToDeadline !== null && daysToDeadline < 0 && record.status !== MilestoneStatus.COMPLETED;
        return (
          <div>
            <div>{dayjs(date).format('YYYY/MM/DD')}</div>
            {isOverdue && (
              <Tag color="red">تاخیر دارد</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'ایجادکننده',
      key: 'created_by',
      render: (record: Milestone) => (
        <Space>
          <Avatar size="small" icon={<FlagOutlined />} />
          {record.created_by?.first_name || 'نامشخص'} {record.created_by?.last_name || ''}
        </Space>
      ),
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (record: Milestone) => (
        <Space>
          {/* Only show edit/delete milestone if isAdminOrPM */}
          {isAdminOrPM && (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
              {record.status !== MilestoneStatus.COMPLETED && (
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(record, MilestoneStatus.COMPLETED)}
                  title="تکمیل کردن"
                  style={{ color: '#52c41a' }}
                />
              )}
              <Popconfirm
                title="آیا از حذف این نقطه عطف اطمینان دارید؟"
                onConfirm={() => handleDelete(record.id)}
                okText="بله"
                cancelText="خیر"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const stats = {
    totalMilestones: milestones.length,
    completedMilestones: milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length,
    overdueMilestones: milestones.filter(m => {
      const daysToDeadline = getDaysToDeadline(m.due_date);
      return daysToDeadline !== null && daysToDeadline < 0 && m.status !== MilestoneStatus.COMPLETED;
    }).length,
    upcomingMilestones: milestones.filter(m => {
      const daysToDeadline = getDaysToDeadline(m.due_date);
      return daysToDeadline !== null && daysToDeadline >= 0 && daysToDeadline <= 7 && m.status !== MilestoneStatus.COMPLETED;
    }).length,
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <FlagOutlined style={{ marginLeft: 8 }} />
          مدیریت نقاط عطف
        </Title>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کل نقاط عطف"
              value={stats.totalMilestones}
              prefix={<FlagOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            {/* Other statistics here */}
          </Card>
        </Col>
      </Row>

      {/* Progress Overview */}
      {stats.totalMilestones > 0 && (
        <Card title="پیشرفت کلی" style={{ marginBottom: 24 }}>
          <Progress
            percent={Math.round((stats.completedMilestones / stats.totalMilestones) * 100)}
            status={stats.overdueMilestones > 0 ? 'exception' : 'success'}
            format={() => `${stats.completedMilestones}/${stats.totalMilestones}`}
          />
        </Card>
      )}

      <Card
        title="لیست نقاط عطف"
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
            {/* Developers should not see create/edit/delete milestone buttons */}
            {isAdminOrPM && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                نقطه عطف جدید
              </Button>
            )}
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={milestones}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `مجموع ${total} نقطه عطف`,
          }}
        />
      </Card>

      <Modal
        title={editingMilestone ? 'ویرایش نقطه عطف' : 'ایجاد نقطه عطف جدید'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingMilestone(null);
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
            label="نام نقطه عطف"
            rules={[{ required: true, message: 'نام نقطه عطف الزامی است' }]}
          >
            <Input placeholder="نام نقطه عطف را وارد کنید" />
          </Form.Item>

          <Form.Item
            name="description"
            label="توضیحات"
          >
            <Input.TextArea
              rows={4}
              placeholder="توضیحات نقطه عطف را وارد کنید"
            />
          </Form.Item>

          <Form.Item
            name="estimated_hours"
            label="تخمین ساعات"
          >
            <Input type="number" min={0} placeholder="تخمین ساعات" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="project_id"
                label="پروژه"
              >
                <Select
                  placeholder="پروژه را انتخاب کنید"
                  allowClear
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
            </Col>
            <Col span={12}>
              <Form.Item
                name="sprint_id"
                label="اسپرینت"
              >
                <Select
                  placeholder="اسپرینت را انتخاب کنید"
                  allowClear
                >
                  {sprints.map((sprint) => (
                    <Option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phase_id"
            label="فاز"
          >
            <Select
              placeholder="فاز را انتخاب کنید"
              allowClear
            >
              {phases.map((phase) => (
                <Option key={phase.id} value={phase.id}>
                  {phase.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="due_date"
            label="تاریخ هدف"
            rules={[{ required: true, message: 'انتخاب تاریخ هدف الزامی است' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="تاریخ هدف را انتخاب کنید"
              format="YYYY/MM/DD"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                انصراف
              </Button>
              <Button type="primary" htmlType="submit">
                {editingMilestone ? 'به‌روزرسانی' : 'ایجاد'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Milestones;
