import React, { useState, useEffect, useCallback } from 'react';
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
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
  Avatar,
} from 'antd';
import {
  BugOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { BugReport, BugReportCreate, BugStatus, BugSeverity, Project, Task, User } from '../types';
import BugReportService from '../services/bugReportService';
import ProjectService from '../services/projectService';
import TaskService from '../services/taskService';
import UserService from '../services/userService';

const { Title } = Typography;
const { Option } = Select;

const BugReports: React.FC = () => {
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBug, setEditingBug] = useState<BugReport | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | undefined>();
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, usersData, tasksData] = await Promise.all([
        ProjectService.getProjects(),
        UserService.getUsers(),
        TaskService.getTasks(),
      ]);
      setProjects(projectsData);
      setUsers(usersData);
      setTasks(tasksData);
      
      // Load all bug reports initially
      const bugReportsData = await BugReportService.getBugReports();
      setBugReports(bugReportsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const fetchBugReports = useCallback(async () => {
    try {
      const filters = selectedProject ? { project_id: selectedProject } : {};
      const bugReportsData = await BugReportService.getBugReports(filters);
      setBugReports(bugReportsData);
    } catch (error) {
      console.error('Error fetching bug reports:', error);
      message.error('خطا در بارگذاری گزارش‌های باگ');
    }
  }, [selectedProject]);

  useEffect(() => {
    fetchBugReports();
  }, [fetchBugReports]);

  const handleSubmit = async (values: any) => {
    try {
      const bugData: BugReportCreate = {
        title: values.title,
        description: values.description,
        project_id: values.project_id,
        task_id: values.task_id,
        severity: values.severity,
        assigned_to_id: values.assigned_to_id,
      };

      if (editingBug) {
        await BugReportService.updateBugReport(editingBug.id, bugData);
        message.success('گزارش باگ با موفقیت به‌روزرسانی شد');
      } else {
        await BugReportService.createBugReport(bugData);
        message.success('گزارش باگ جدید با موفقیت ایجاد شد');
      }

      setModalVisible(false);
      setEditingBug(null);
      form.resetFields();
      fetchBugReports();
    } catch (error) {
      console.error('Error creating/updating bug report:', error);
      message.error('خطا در ایجاد/به‌روزرسانی گزارش باگ');
    }
  };

  const handleEdit = (bug: BugReport) => {
    setEditingBug(bug);
    form.setFieldsValue({
      title: bug.title,
      description: bug.description,
      project_id: bug.project?.id,
      task_id: bug.task?.id,
      severity: bug.severity,
      assigned_to_id: bug.assigned_to?.id,
    });
    setModalVisible(true);
  };

  const handleDelete = async (bugId: number) => {
    try {
      await BugReportService.deleteBugReport(bugId);
      message.success('گزارش باگ با موفقیت حذف شد');
      fetchBugReports();
    } catch (error) {
      console.error('Error deleting bug report:', error);
      message.error('خطا در حذف گزارش باگ');
    }
  };

  const handleStatusChange = async (bug: BugReport, newStatus: BugStatus) => {
    try {
      await BugReportService.updateBugStatus(bug.id, newStatus);
      message.success('وضعیت باگ تغییر یافت');
      fetchBugReports();
    } catch (error) {
      console.error('Error updating bug status:', error);
      message.error('خطا در تغییر وضعیت باگ');
    }
  };

  const handleResolve = async (bug: BugReport) => {
    try {
      await BugReportService.resolveBugReport(bug.id, 'باگ برطرف شد');
      message.success('باگ برطرف شد');
      fetchBugReports();
    } catch (error) {
      console.error('Error resolving bug:', error);
      message.error('خطا در برطرف کردن باگ');
    }
  };

  const getSeverityColor = (severity: BugSeverity) => {
    const colors = {
      [BugSeverity.LOW]: 'green',
      [BugSeverity.MEDIUM]: 'yellow',
      [BugSeverity.HIGH]: 'orange',
      [BugSeverity.CRITICAL]: 'red',
    };
    return colors[severity];
  };

  const getSeverityText = (severity: BugSeverity) => {
    const texts = {
      [BugSeverity.LOW]: 'کم',
      [BugSeverity.MEDIUM]: 'متوسط',
      [BugSeverity.HIGH]: 'بالا',
      [BugSeverity.CRITICAL]: 'بحرانی',
    };
    return texts[severity];
  };

  const columns = [
    {
      title: 'عنوان',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: BugReport) => (
        <Space>
          <Avatar icon={<BugOutlined />} style={{ backgroundColor: getSeverityColor(record.severity) }} />
          <div>
            <div><strong>{text}</strong></div>
            <div style={{ fontSize: '12px', color: '#888', fontFamily: 'Iranian Sans, IranianSans, Vazir, Arial, sans-serif' }}>
              #{record.id}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'وظیفه',
      key: 'task',
      render: (record: BugReport) => {
        return record.task ? record.task.title : '-';
      },
    },
    {
      title: 'شدت',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: BugSeverity) => (
        <Tag color={getSeverityColor(severity)}>
          {getSeverityText(severity)}
        </Tag>
      ),
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      render: (status: BugStatus, record: BugReport) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(newStatus) => handleStatusChange(record, newStatus)}
        >
          <Option value={BugStatus.OPEN}>باز</Option>
          <Option value={BugStatus.IN_PROGRESS}>در حال انجام</Option>
          <Option value={BugStatus.RESOLVED}>برطرف شده</Option>
          <Option value={BugStatus.CLOSED}>بسته شده</Option>
        </Select>
      ),
    },
    {
      title: 'تخصیص یافته به',
      key: 'assigned_to',
      render: (record: BugReport) => (
        record.assigned_to ? (
          <Space>
            <UserOutlined />
            {record.assigned_to?.first_name || 'نامشخص'} {record.assigned_to?.last_name || ''}
          </Space>
        ) : (
          <Tag>تخصیص نیافته</Tag>
        )
      ),
    },
    {
      title: 'گزارش‌دهنده',
      key: 'reported_by',
      render: (record: BugReport) => (
        <Space>
          <UserOutlined />
          {record.reported_by?.first_name || 'نامشخص'} {record.reported_by?.last_name || ''}
        </Space>
      ),
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
      render: (record: BugReport) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          {record.status === BugStatus.IN_PROGRESS && (
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              onClick={() => handleResolve(record)}
              title="برطرف کردن"
              style={{ color: '#52c41a' }}
            />
          )}
          <Popconfirm
            title="آیا از حذف این گزارش باگ اطمینان دارید؟"
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
    totalBugs: bugReports.length,
    openBugs: bugReports.filter(bug => bug.status === BugStatus.OPEN).length,
    criticalBugs: bugReports.filter(bug => bug.severity === BugSeverity.CRITICAL).length,
    resolvedBugs: bugReports.filter(bug => bug.status === BugStatus.RESOLVED || bug.status === BugStatus.CLOSED).length,
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BugOutlined style={{ marginLeft: 8 }} />
          مدیریت گزارش‌های باگ
        </Title>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کل باگ‌ها"
              value={stats.totalBugs}
              prefix={<BugOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="باگ‌های باز"
              value={stats.openBugs}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="باگ‌های بحرانی"
              value={stats.criticalBugs}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="باگ‌های برطرف شده"
              value={stats.resolvedBugs}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="لیست گزارش‌های باگ"
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
              گزارش باگ جدید
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={bugReports}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `مجموع ${total} گزارش باگ`,
          }}
        />
      </Card>

      <Modal
        title={editingBug ? 'ویرایش گزارش باگ' : 'ایجاد گزارش باگ جدید'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingBug(null);
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
            name="title"
            label="عنوان"
            rules={[{ required: true, message: 'عنوان الزامی است' }]}
          >
            <Input placeholder="عنوان باگ را وارد کنید" />
          </Form.Item>

          <Form.Item
            name="description"
            label="توضیحات"
            rules={[{ required: true, message: 'توضیحات الزامی است' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="توضیحات باگ را وارد کنید"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
              <Form.Item
                name="task_id"
                label="وظیفه مرتبط"
              >
                <Select
                  placeholder="وظیفه را انتخاب کنید"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {tasks.map((task) => (
                    <Option key={task.id} value={task.id}>
                      {task.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="severity"
                label="شدت"
                rules={[{ required: true, message: 'انتخاب شدت الزامی است' }]}
              >
                <Select placeholder="شدت باگ را انتخاب کنید">
                  <Option value={BugSeverity.LOW}>کم</Option>
                  <Option value={BugSeverity.MEDIUM}>متوسط</Option>
                  <Option value={BugSeverity.HIGH}>بالا</Option>
                  <Option value={BugSeverity.CRITICAL}>بحرانی</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assigned_to_id"
                label="تخصیص به"
              >
                <Select
                  placeholder="کاربر را انتخاب کنید"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {users.map((user) => (
                    <Option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.username})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                انصراف
              </Button>
              <Button type="primary" htmlType="submit">
                {editingBug ? 'به‌روزرسانی' : 'ایجاد'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BugReports;
