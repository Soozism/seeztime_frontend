import React, { useState } from 'react';
import { Button, Form, Input, notification, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserLogin } from '../types';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const onFinish = async (values: UserLogin) => {
    setLoading(true);
    try {
      await login(values);
      notification.success({
        message: 'ورود با موفقیت انجام شد',
        description: 'به soozello خوش آمدید',
      });
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'نام کاربری یا رمز عبور اشتباه است';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      notification.error({
        message: 'خطا در ورود',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-900 px-4"
      style={{ direction: 'rtl' }}
    >
      <Card 
        className="w-full max-w-md"
        style={{ 
          backgroundColor: '#1f1f1f',
          border: '1px solid #434343',
        }}
      >
        <div className="text-center mb-8">
          <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>
            ورود به سیستم
          </Title>
          <Text style={{ color: '#8c8c8c' }}>
            soozello
          </Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label={<span style={{ color: '#fff' }}>نام کاربری</span>}
            rules={[
              {
                required: true,
                message: 'لطفاً نام کاربری خود را وارد کنید',
              },
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="نام کاربری"
              style={{
                backgroundColor: '#262626',
                border: '1px solid #434343',
                color: '#fff',
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ color: '#fff' }}>رمز عبور</span>}
            rules={[
              {
                required: true,
                message: 'لطفاً رمز عبور خود را وارد کنید',
              },
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="رمز عبور"
              style={{
                backgroundColor: '#262626',
                border: '1px solid #434343',
                color: '#fff',
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              style={{
                height: '44px',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {loading ? 'در حال ورود...' : 'ورود'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
