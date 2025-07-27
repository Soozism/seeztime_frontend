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
  message,
  Popconfirm,
  Avatar,
  Typography,
  Row,
  Col,
  Statistic,
  Switch,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { User, UserCreate, UserUpdate, UserRole } from '../types';
import UserService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const Users: React.FC = () => {
  const { user: currentUser, canManageUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await UserService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('خطا در بارگذاری کاربران');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        const userData: UserUpdate = {
          username: values.username,
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
          is_active: values.is_active,
        };
        await UserService.updateUser(editingUser.id, userData);
        message.success('کاربر با موفقیت به‌روزرسانی شد');
      } else {
        const userData: UserCreate = {
          username: values.username,
          email: values.email,
          password: values.password,
          first_name: values.first_name,
          last_name: values.last_name,
          role: values.role,
        };
        await UserService.createUser(userData);
        message.success('کاربر جدید با موفقیت ایجاد شد');
      }

      setModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('Error creating/updating user:', error);
      message.error('خطا در ایجاد/به‌روزرسانی کاربر');
    }
  };

  const handlePasswordReset = async (values: any) => {
    try {
      if (editingUser) {
        await UserService.resetPassword(editingUser.id, values.new_password);
        message.success('رمز عبور با موفقیت تغییر یافت');
        setPasswordModalVisible(false);
        setEditingUser(null);
        passwordForm.resetFields();
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      message.error('خطا در تغییر رمز عبور');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_active: user.is_active,
    });
    setModalVisible(true);
  };

  const handleDelete = async (userId: number) => {
    if (userId === currentUser?.id) {
      message.error('نمی‌توانید خودتان را حذف کنید');
      return;
    }
    
    try {
      await UserService.deleteUser(userId);
      message.success('کاربر با موفقیت حذف شد');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('خطا در حذف کاربر');
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      message.error('نمی‌توانید وضعیت خودتان را تغییر دهید');
      return;
    }

    try {
      if (user.is_active) {
        await UserService.deactivateUser(user.id);
        message.success('کاربر غیرفعال شد');
      } else {
        await UserService.activateUser(user.id);
        message.success('کاربر فعال شد');
      }
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      message.error('خطا در تغییر وضعیت کاربر');
    }
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.ADMIN]: 'red',
      [UserRole.PROJECT_MANAGER]: 'orange',
      [UserRole.TEAM_LEADER]: 'blue',
      [UserRole.DEVELOPER]: 'green',
      [UserRole.TESTER]: 'purple',
      [UserRole.VIEWER]: 'gray',
    };
    return colors[role] || 'default';
  };

  const getRoleText = (role: UserRole) => {
    const texts = {
      [UserRole.ADMIN]: 'مدیر سیستم',
      [UserRole.PROJECT_MANAGER]: 'مدیر پروژه',
      [UserRole.TEAM_LEADER]: 'سرپرست تیم',
      [UserRole.DEVELOPER]: 'توسعه‌دهنده',
      [UserRole.TESTER]: 'تستر',
      [UserRole.VIEWER]: 'بازدیدکننده',
    };
    return texts[role] || role;
  };

  const columns = [
    {
      title: 'کاربر',
      key: 'user',
      render: (record: User) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />}
            style={{ backgroundColor: record.is_active ? '#1890ff' : '#d9d9d9' }}
          />
          <div>
            <div><strong>{record.first_name} {record.last_name}</strong></div>
            <div style={{ fontSize: '12px', color: '#888' }}>@{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'ایمیل',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Space>
          <MailOutlined />
          {email}
        </Space>
      ),
    },
    {
      title: 'نقش',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      ),
    },
    {
      title: 'وضعیت',
      key: 'status',
      render: (record: User) => (
        canManageUsers() ? (
          <Switch
            checked={record.is_active}
            onChange={() => handleToggleStatus(record)}
            checkedChildren="فعال"
            unCheckedChildren="غیرفعال"
            disabled={record.id === currentUser?.id}
          />
        ) : (
          <Tag color={record.is_active ? 'green' : 'red'}>
            {record.is_active ? 'فعال' : 'غیرفعال'}
          </Tag>
        )
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
      render: (record: User) => (
        canManageUsers() ? (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
            <Button
              type="text"
              icon={<LockOutlined />}
              onClick={() => {
                setEditingUser(record);
                setPasswordModalVisible(true);
              }}
              title="تغییر رمز عبور"
            />
            <Popconfirm
              title="آیا از حذف این کاربر اطمینان دارید؟"
              onConfirm={() => handleDelete(record.id)}
              okText="بله"
              cancelText="خیر"
              disabled={record.id === currentUser?.id}
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                disabled={record.id === currentUser?.id}
              />
            </Popconfirm>
          </Space>
        ) : (
          <Text type="secondary">بدون دسترسی</Text>
        )
      ),
    },
  ];

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.is_active).length,
    admins: users.filter(user => user.role === UserRole.ADMIN).length,
    developers: users.filter(user => user.role === UserRole.DEVELOPER).length,
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <UserOutlined style={{ marginLeft: 8 }} />
          مدیریت کاربران
        </Title>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کل کاربران"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کاربران فعال"
              value={stats.activeUsers}
              prefix={<UnlockOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="مدیران"
              value={stats.admins}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="توسعه‌دهندگان"
              value={stats.developers}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="لیست کاربران"
        extra={
          canManageUsers() && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              کاربر جدید
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `مجموع ${total} کاربر`,
          }}
        />
      </Card>

      {/* Create/Edit User Modal */}
      <Modal
        title={editingUser ? 'ویرایش کاربر' : 'ایجاد کاربر جدید'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="نام"
                rules={[{ required: true, message: 'نام الزامی است' }]}
              >
                <Input placeholder="نام کاربر" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="نام خانوادگی"
                rules={[{ required: true, message: 'نام خانوادگی الزامی است' }]}
              >
                <Input placeholder="نام خانوادگی کاربر" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="username"
            label="نام کاربری"
            rules={[{ required: true, message: 'نام کاربری الزامی است' }]}
          >
            <Input placeholder="نام کاربری" />
          </Form.Item>

          <Form.Item
            name="email"
            label="ایمیل"
            rules={[
              { required: true, message: 'ایمیل الزامی است' },
              { type: 'email', message: 'فرمت ایمیل صحیح نیست' }
            ]}
          >
            <Input placeholder="ایمیل کاربر" />
          </Form.Item>

          {!editingUser && (
            <>
              <Form.Item
                name="password"
                label="رمز عبور"
                rules={[{ required: true, message: 'رمز عبور الزامی است' }]}
              >
                <Input.Password placeholder="رمز عبور" />
              </Form.Item>

              <Form.Item
                name="role"
                label="نقش"
                rules={[{ required: true, message: 'انتخاب نقش الزامی است' }]}
              >
                <Select placeholder="نقش کاربر را انتخاب کنید">
                  <Option value={UserRole.ADMIN}>مدیر سیستم</Option>
                  <Option value={UserRole.PROJECT_MANAGER}>مدیر پروژه</Option>
                  <Option value={UserRole.TEAM_LEADER}>سرپرست تیم</Option>
                  <Option value={UserRole.DEVELOPER}>توسعه‌دهنده</Option>
                  <Option value={UserRole.TESTER}>تستر</Option>
                  <Option value={UserRole.VIEWER}>بازدیدکننده</Option>
                </Select>
              </Form.Item>
            </>
          )}

          {editingUser && (
            <Form.Item
              name="is_active"
              label="وضعیت"
              valuePropName="checked"
            >
              <Switch checkedChildren="فعال" unCheckedChildren="غیرفعال" />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                انصراف
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'به‌روزرسانی' : 'ایجاد'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        title="تغییر رمز عبور"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          setEditingUser(null);
          passwordForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordReset}
        >
          <Form.Item
            name="new_password"
            label="رمز عبور جدید"
            rules={[
              { required: true, message: 'رمز عبور جدید الزامی است' },
              { min: 6, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' }
            ]}
          >
            <Input.Password placeholder="رمز عبور جدید" />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="تکرار رمز عبور"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'تکرار رمز عبور الزامی است' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('رمز عبور و تکرار آن یکسان نیستند'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="تکرار رمز عبور جدید" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button onClick={() => setPasswordModalVisible(false)}>
                انصراف
              </Button>
              <Button type="primary" htmlType="submit">
                تغییر رمز عبور
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
