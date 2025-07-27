import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Typography,
  Space,
  Drawer,
  Grid,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  BugOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  BarChartOutlined,
  BarsOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const { user, logout, canManageUsers, canManageProjects, canManageTeams, canViewReports } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'داشبورد',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'پروژه‌ها',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: 'وظایف',
    },
    ...(canManageTeams() ? [{
      key: '/teams',
      icon: <TeamOutlined />,
      label: 'تیم‌ها',
    }] : []),
    ...(canManageUsers() ? [{
      key: '/users',
      icon: <UserOutlined />,
      label: 'کاربران',
    }] : []),
    {
      key: '/sprints',
      icon: <CalendarOutlined />,
      label: 'اسپرینت‌ها',
    },
    {
      key: '/backlogs',
      icon: <UnorderedListOutlined />,
      label: 'بک‌لاگ',
    },
    {
      key: '/bug-reports',
      icon: <BugOutlined />,
      label: 'گزارش‌های باگ',
    },
    {
      key: '/time-logs',
      icon: <ClockCircleOutlined />,
      label: 'ثبت زمان',
    },
    {
      key: '/milestones',
      icon: <FlagOutlined />,
      label: 'نقاط عطف',
    },
    {
      key: '/kanban',
      icon: <BarsOutlined />,
      label: 'کانبان',
    },
    ...(canViewReports() ? [{
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'گزارش‌ها',
    }] : []),
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
    if (isMobile) {
      setMobileDrawerVisible(false);
    }
  };

  const userMenuItems: any[] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'پروفایل کاربری',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'تنظیمات',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'خروج',
      danger: true,
    },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'settings') {
      navigate('/settings');
    }
  };

  const sidebarContent = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      style={{ borderRight: 0 }}
      items={menuItems.map(item => ({
        ...item,
        onClick: () => handleMenuClick(item.key),
      }))}
    />
  );

  const headerContent = (
    <Header
      style={{
        padding: '0 16px',
        background: '#001529',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Space>
        {isMobile ? (
          <Button
            type="text"
            icon={<MenuUnfoldOutlined />}
            onClick={() => setMobileDrawerVisible(true)}
            style={{ color: '#fff' }}
          />
        ) : (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: '#fff' }}
          />
        )}
        <Text style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
          سیستم مدیریت وظایف گینگا تک
        </Text>
      </Space>

      <Space>
        <Text style={{ color: '#fff' }}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: handleUserMenuClick,
          }}
          placement="bottomLeft"
        >
          <Avatar
            style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
            icon={<UserOutlined />}
          />
        </Dropdown>
      </Space>
    </Header>
  );

  if (isMobile) {
    return (
      <Layout style={{ minHeight: '100vh', direction: 'rtl' }}>
        {headerContent}
        <Drawer
          title="منو"
          placement="right"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          bodyStyle={{ padding: 0 }}
          width={280}
        >
          {sidebarContent}
        </Drawer>
        <Content style={{ margin: '24px 16px 0' }}>
          <Outlet />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', direction: 'rtl' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          position: 'fixed',
          height: '100vh',
          right: 0,
          top: 0,
          zIndex: 1000,
        }}
        width={280}
        collapsedWidth={80}
      >
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #434343',
            marginBottom: '16px',
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: collapsed ? '16px' : '18px',
              fontWeight: 'bold',
            }}
          >
            {collapsed ? 'GT' : 'گینگا تک'}
          </Text>
        </div>
        {sidebarContent}
      </Sider>
      
      <Layout style={{ marginRight: collapsed ? 80 : 280, transition: 'margin-right 0.2s' }}>
        {headerContent}
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
