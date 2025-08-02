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
  DatePicker,
  Typography,
  Row,
  Col,
  Statistic,
  Popconfirm,
  Descriptions
} from 'antd';
import {
  AppstoreOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RocketOutlined,
  TagOutlined,
  CalendarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import versionService from '../services/versionService';
import projectService from '../services/projectService';
import NotificationService from '../utils/notifications';
import { useAuth } from '../contexts/AuthContext';
import { Project as ProjectType, VersionResponse } from '../types';
import { dateUtils } from '../utils/dateConfig';

const { Title, Text } = Typography;
const { Option } = Select;

interface Version extends VersionResponse {
  is_released?: boolean;
  release_date?: string | null;
  project_name?: string;
}

const VersionManagement: React.FC = () => {
  const { user, canManageProjects } = useAuth();
  const [versions, setVersions] = useState<Version[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | undefined>();
  const [form] = Form.useForm();

  useEffect(() => {
    loadProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedProject) {
      loadVersions();
    }
  }, [selectedProject]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProjects = async () => {
    try {
      const projectList = await projectService.getProjects({ limit: 100 });
      setProjects(projectList);
      if (projectList.length > 0 && !selectedProject) {
        setSelectedProject(projectList[0].id);
      }
    } catch (error) {
      NotificationService.error('خطا', 'امکان بارگذاری پروژه‌ها وجود ندارد');
    }
  };

  const loadVersions = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      const versionList = await versionService.getProjectVersions(selectedProject);
      setVersions(versionList as any);
    } catch (error) {
      NotificationService.error('خطا', 'امکان بارگذاری نسخه‌ها وجود ندارد');
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingVersion(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (version: Version) => {
    setEditingVersion(version);
    setModalVisible(true);
    form.setFieldsValue({
      version_number: version.version_number,
      description: version.description,
      release_date: version.release_date ? dateUtils.toPersianDayjs(version.release_date) : null
    });
  };

  const handleSubmit = async (values: any) => {
    if (!selectedProject) {
      NotificationService.error('خطا', 'لطفاً ابتدا پروژه را انتخاب کنید');
      return;
    }

    try {
      const data = {
        version_number: values.version_number,
        description: values.description,
        release_date: values.release_date && typeof values.release_date.format === 'function' ? values.release_date.format('YYYY-MM-DD') : values.release_date || null,
        project_id: selectedProject
      };

      if (editingVersion) {
        await versionService.updateVersion(editingVersion.id, data);
        NotificationService.success('بروزرسانی شد', 'نسخه با موفقیت بروزرسانی شد');
      } else {
        await versionService.createProjectVersion(selectedProject, data);
        NotificationService.success('ایجاد شد', 'نسخه جدید با موفقیت ایجاد شد');
      }

      setModalVisible(false);
      form.resetFields();
      loadVersions();
    } catch (error) {
      NotificationService.error('خطا', editingVersion ? 'امکان بروزرسانی نسخه وجود ندارد' : 'امکان ایجاد نسخه وجود ندارد');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await versionService.deleteVersion(id);
      NotificationService.success('حذف شد', 'نسخه با موفقیت حذف شد');
      loadVersions();
    } catch (error) {
      NotificationService.error('خطا', 'امکان حذف نسخه وجود ندارد');
    }
  };

  const handleRelease = async (id: number) => {
    try {
      await versionService.releaseVersion(id);
      NotificationService.success('منتشر شد', 'نسخه با موفقیت منتشر شد');
      loadVersions();
    } catch (error) {
      NotificationService.error('خطا', 'امکان انتشار نسخه وجود ندارد');
    }
  };

  const columns = [
    {
      title: 'شماره نسخه',
      dataIndex: 'version_number',
      key: 'version_number',
      render: (version: string, record: Version) => (
        <Space>
          <Tag color={record.is_released ? 'green' : 'blue'} icon={<TagOutlined />}>
            v{version}
          </Tag>
        </Space>
      )
    },
    {
      title: 'توضیحات',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'تاریخ انتشار',
      dataIndex: 'release_date',
      key: 'release_date',
      render: (date: string | null) => date ? dateUtils.toPersian(date) : 'تعیین نشده'
    },
    {
      title: 'وضعیت',
      dataIndex: 'is_released',
      key: 'is_released',
      render: (isReleased: boolean) => (
        <Tag color={isReleased ? 'success' : 'processing'}>
          {isReleased ? 'منتشر شده' : 'در انتظار انتشار'}
        </Tag>
      )
    },
    {
      title: 'تاریخ ایجاد',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dateUtils.formatWithTime(date)
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_: any, record: Version) => (
        <Space size="small">
          {canManageProjects() && (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                size="small"
              />
              {!record.is_released && (
                <Button
                  type="text"
                  icon={<RocketOutlined />}
                  onClick={() => handleRelease(record.id)}
                  size="small"
                  style={{ color: '#52c41a' }}
                />
              )}
              <Popconfirm
                title="آیا از حذف این نسخه اطمینان دارید؟"
                onConfirm={() => handleDelete(record.id)}
                okText="بله"
                cancelText="خیر"
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  size="small"
                />
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ];

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const releasedVersions = versions.filter(v => v.is_released).length;
  const pendingVersions = versions.filter(v => !v.is_released).length;

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2}>
            <AppstoreOutlined /> مدیریت نسخه‌ها
          </Title>
        </Col>

        {/* Project Selection */}
        <Col span={24}>
          <Card title="انتخاب پروژه">
            <Select
              placeholder="انتخاب پروژه"
              style={{ width: '100%', maxWidth: 400 }}
              value={selectedProject}
              onChange={setSelectedProject}
            >
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Card>
        </Col>

        {/* Project Info & Stats */}
        {selectedProject && selectedProjectData && (
          <Col span={24}>
            <Card>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Descriptions title="اطلاعات پروژه" bordered size="small">
                    <Descriptions.Item label="نام پروژه" span={3}>
                      {selectedProjectData.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="توضیحات" span={3}>
                      {selectedProjectData.description || 'بدون توضیحات'}
                    </Descriptions.Item>
                    <Descriptions.Item label="وضعیت" span={3}>
                      <Tag color={
                        selectedProjectData.status === 'active' ? 'green' :
                        selectedProjectData.status === 'completed' ? 'blue' : 'default'
                      }>
                        {selectedProjectData.status === 'active' ? 'فعال' :
                         selectedProjectData.status === 'completed' ? 'تکمیل شده' : 'آرشیو شده'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col xs={24} md={12}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="کل نسخه‌ها"
                          value={versions.length}
                          prefix={<AppstoreOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="منتشر شده"
                          value={releasedVersions}
                          prefix={<CheckCircleOutlined />}
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="در انتظار"
                          value={pendingVersions}
                          prefix={<CalendarOutlined />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
        )}

        {/* Versions Table */}
        <Col span={24}>
          <Card
            title="نسخه‌ها"
            extra={
              selectedProject && canManageProjects() && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  نسخه جدید
                </Button>
              )
            }
          >
            <Table
              columns={columns}
              dataSource={versions}
              rowKey="id"
              loading={loading}
              pagination={{
                total: versions.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} از ${total} نسخه`
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Create/Edit Modal */}
      <Modal
        title={editingVersion ? 'ویرایش نسخه' : 'ایجاد نسخه جدید'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
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
            name="version_number"
            label="شماره نسخه"
            rules={[
              { required: true, message: 'لطفاً شماره نسخه را وارد کنید' },
              { pattern: /^\d+\.\d+\.\d+$/, message: 'فرمت شماره نسخه باید به صورت X.Y.Z باشد (مثال: 1.0.0)' }
            ]}
          >
            <Input placeholder="1.0.0" />
          </Form.Item>

          <Form.Item
            name="description"
            label="توضیحات"
            rules={[{ required: true, message: 'لطفاً توضیحات را وارد کنید' }]}
          >
            <Input.TextArea 
              rows={4}
              placeholder="توضیحات نسخه، ویژگی‌های جدید، رفع اشکالات و..."
            />
          </Form.Item>

          <Form.Item
            name="release_date"
            label="تاریخ انتشار (اختیاری)"
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="انتخاب تاریخ انتشار"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingVersion ? 'بروزرسانی' : 'ایجاد'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
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

export default VersionManagement;
