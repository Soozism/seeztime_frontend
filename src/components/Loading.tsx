import React from 'react';
import { Spin, Skeleton, Card, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingProps {
  type?: 'spin' | 'skeleton' | 'card' | 'table' | 'form';
  loading?: boolean;
  children?: React.ReactNode;
  size?: 'small' | 'default' | 'large';
  tip?: string;
  rows?: number;
  avatar?: boolean;
  title?: boolean;
  paragraph?: boolean;
}

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const Loading: React.FC<LoadingProps> = ({
  type = 'spin',
  loading = true,
  children,
  size = 'default',
  tip = 'در حال بارگذاری...',
  rows = 4,
  avatar = false,
  title = true,
  paragraph = true,
}) => {
  if (!loading && children) {
    return <>{children}</>;
  }

  const renderContent = () => {
    switch (type) {
      case 'skeleton':
        return (
          <Skeleton
            loading={loading}
            active
            avatar={avatar}
            title={title}
            paragraph={{ rows }}
          >
            {children}
          </Skeleton>
        );

      case 'card':
        return (
          <div style={{ padding: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} style={{ direction: 'rtl' }}>
                  <Skeleton loading={true} active avatar paragraph={{ rows: 2 }} />
                </Card>
              ))}
            </Space>
          </div>
        );

      case 'table':
        return (
          <div style={{ padding: '24px' }}>
            <Card title={<Skeleton.Input style={{ width: 200 }} active />}>
              <Skeleton loading={true} active paragraph={{ rows: 8 }} />
            </Card>
          </div>
        );

      case 'form':
        return (
          <div style={{ padding: '24px' }}>
            <Card>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Skeleton.Input style={{ width: '100%' }} active />
                <Skeleton.Input style={{ width: '100%' }} active />
                <Skeleton.Input style={{ width: '60%' }} active />
                <Skeleton loading={true} active paragraph={{ rows: 3 }} />
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <Skeleton.Button active />
                  <Skeleton.Button active />
                </div>
              </Space>
            </Card>
          </div>
        );

      case 'spin':
      default:
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px',
            direction: 'rtl'
          }}>
            <Spin 
              indicator={antIcon} 
              size={size} 
              tip={tip}
              style={{ color: '#fff' }}
            />
          </div>
        );
    }
  };

  return renderContent();
};

// Specific loading components for common use cases
export const PageLoading: React.FC<{ tip?: string }> = ({ tip = 'در حال بارگذاری صفحه...' }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '60vh',
    direction: 'rtl'
  }}>
    <Spin indicator={antIcon} size="large" tip={tip} />
  </div>
);

export const TableLoading: React.FC = () => (
  <Loading type="table" />
);

export const CardLoading: React.FC = () => (
  <Loading type="card" />
);

export const FormLoading: React.FC = () => (
  <Loading type="form" />
);

export default Loading;
