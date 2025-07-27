import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  UnorderedListOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Backlog, BacklogCreate, BacklogUpdate, Project, ConvertBacklogToTask, Sprint, User } from '../types';
import BacklogService from '../services/backlogService';
import ProjectService from '../services/projectService';
import SprintService from '../services/sprintService';
import UserService from '../services/userService';

const { Title } = Typography;
const { Option } = Select;

const Backlogs: React.FC = () => {
  const [backlogs, setBacklogs] = useState<Backlog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [editingBacklog, setEditingBacklog] = useState<Backlog | null>(null);
  const [convertingBacklog, setConvertingBacklog] = useState<Backlog | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | undefined>();
  const [form] = Form.useForm();
  const [convertForm] = Form.useForm();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [projectsData, usersData] = await Promise.all([
        ProjectService.getProjects(),
        UserService.getUsers(),
      ]);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      message.error('خطا در بارگذاری اطلاعات اولیه');
    } finally {
      setLoading(false);
    }
  };

  const fetchBacklogs = useCallback(async () => {
    if (!selectedProject) return;
    
    try {
      const backlogsData = await BacklogService.getBacklogs({ 
        project_id: selectedProject 
      });
      setBacklogs(backlogsData);
    } catch (error) {
      console.error('Error fetching backlogs:', error);
      message.error('خطا در بارگذاری بک‌لاگ‌ها');
    }
  }, [selectedProject]);

  useEffect(() => {
    fetchBacklogs();
  }, [fetchBacklogs]);

  const fetchSprints = async (projectId: number) => {
    try {
      const sprintsData = await SprintService.getSprints({ project_id: projectId });
      setSprints(sprintsData);
    } catch (error) {
      console.error('Error fetching sprints:', error);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      const backlogData: BacklogCreate = {
        title: values.title,
        description: values.description,
        project_id: values.project_id,
      };

      if (editingBacklog) {
        const updateData: BacklogUpdate = {
          title: values.title,
          description: values.description,
        };
        await BacklogService.updateBacklog(editingBacklog.id, updateData);
        message.success('بک‌لاگ با موفقیت به‌روزرسانی شد');
      } else {
        await BacklogService.createBacklog(backlogData);
        message.success('بک‌لاگ جدید با موفقیت ایجاد شد');
      }

      setModalVisible(false);
      setEditingBacklog(null);
      form.resetFields();
      fetchBacklogs();
    } catch (error) {
      console.error('Error saving backlog:', error);
      message.error('خطا در ذخیره بک‌لاگ');
    }
  };

  const handleEdit = (backlog: Backlog) => {
    setEditingBacklog(backlog);
    form.setFieldsValue({
      title: backlog.title,
      description: backlog.description,
      project_id: backlog.project_id,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await BacklogService.deleteBacklog(id);
      message.success('بک‌لاگ با موفقیت حذف شد');
      fetchBacklogs();
    } catch (error) {
      console.error('Error deleting backlog:', error);
      message.error('خطا در حذف بک‌لاگ');
    }
  };

  const handleConvertToTask = (backlog: Backlog) => {
    setConvertingBacklog(backlog);
    convertForm.setFieldsValue({
      project_id: backlog.project_id,
    });
    if (backlog.project_id) {
      fetchSprints(backlog.project_id);
    }
    setConvertModalVisible(true);
  };

  const handleConvert = async (values: any) => {
    if (!convertingBacklog) return;

    try {
      const convertData: ConvertBacklogToTask = {
        assignee_id: values.assignee_id,
        sprint_id: values.sprint_id,
      };

      await BacklogService.convertToTask(convertingBacklog.id, convertData);
      message.success('بک‌لاگ با موفقیت به تسک تبدیل شد');
      setConvertModalVisible(false);
      setConvertingBacklog(null);
      convertForm.resetFields();
      fetchBacklogs();
    } catch (error) {
      console.error('Error converting backlog:', error);
      message.error('خطا در تبدیل بک‌لاگ');
    }
  };

  const columns = [
    {
      title: 'عنوان',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Backlog) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          {record.description && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'پروژه',
      dataIndex: 'project_id',
      key: 'project_id',
      render: (projectId: number) => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.name : 'نامشخص';
      },
    },
    {
      title: 'تاریخ ایجاد',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('fa-IR'),
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (text: any, record: Backlog) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            ویرایش
          </Button>
          <Button
            type="link"
            icon={<SwapOutlined />}
            onClick={() => handleConvertToTask(record)}
          >
            تبدیل به تسک
          </Button>
          <Popconfirm
            title="آیا از حذف این بک‌لاگ اطمینان دارید؟"
            onConfirm={() => handleDelete(record.id)}
            okText="بله"
            cancelText="خیر"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              حذف
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const getStats = () => {
    return {
      totalBacklogs: backlogs.length,
      projectsWithBacklogs: new Set(backlogs.map(b => b.project_id)).size,
    };
  };

  const stats = getStats();

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Title level={2}>
            <UnorderedListOutlined /> مدیریت بک‌لاگ‌ها
          </Title>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="تعداد بک‌لاگ‌ها"
              value={stats.totalBacklogs}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="پروژه‌های دارای بک‌لاگ"
              value={stats.projectsWithBacklogs}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="لیست بک‌لاگ‌ها"
        extra={
          <Space>
            <Select
              placeholder="انتخاب پروژه"
              style={{ width: 200 }}
              value={selectedProject}
              onChange={setSelectedProject}
              allowClear
            >
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingBacklog(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              بک‌لاگ جدید
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={backlogs}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: selectedProject ? 'بک‌لاگی برای این پروژه یافت نشد' : 'لطفا ابتدا پروژه‌ای را انتخاب کنید',
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingBacklog ? 'ویرایش بک‌لاگ' : 'ایجاد بک‌لاگ جدید'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingBacklog(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="title"
            label="عنوان"
            rules={[{ required: true, message: 'لطفا عنوان را وارد کنید' }]}
          >
            <Input placeholder="عنوان بک‌لاگ" />
          </Form.Item>

          <Form.Item
            name="description"
            label="توضیحات"
          >
            <Input.TextArea
              rows={4}
              placeholder="توضیحات بک‌لاگ"
            />
          </Form.Item>

          {!editingBacklog && (
            <Form.Item
              name="project_id"
              label="پروژه"
              rules={[{ required: true, message: 'لطفا پروژه را انتخاب کنید' }]}
              initialValue={selectedProject}
            >
              <Select placeholder="انتخاب پروژه">
                {projects.map(project => (
                  <Option key={project.id} value={project.id}>
                    {project.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingBacklog ? 'به‌روزرسانی' : 'ایجاد'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingBacklog(null);
                form.resetFields();
              }}>
                انصراف
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Convert to Task Modal */}
      <Modal
        title="تبدیل بک‌لاگ به تسک"
        open={convertModalVisible}
        onCancel={() => {
          setConvertModalVisible(false);
          setConvertingBacklog(null);
          convertForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={convertForm}
          layout="vertical"
          onFinish={handleConvert}
        >
          <Form.Item
            name="assignee_id"
            label="مسئول تسک"
          >
            <Select
              placeholder="انتخاب مسئول"
              allowClear
            >
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.username})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="sprint_id"
            label="اسپرینت"
          >
            <Select
              placeholder="انتخاب اسپرینت"
              allowClear
            >
              {sprints.map(sprint => (
                <Option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                تبدیل به تسک
              </Button>
              <Button onClick={() => {
                setConvertModalVisible(false);
                setConvertingBacklog(null);
                convertForm.resetFields();
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

export default Backlogs;
