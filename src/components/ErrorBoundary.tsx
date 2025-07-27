import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography } from 'antd';
import { BugOutlined, ReloadOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You can integrate with error tracking services like Sentry here
    // Sentry.captureException(error);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          direction: 'rtl'
        }}>
          <Result
            status="error"
            icon={<BugOutlined />}
            title="خطای غیرمنتظره"
            subTitle="متأسفانه خطایی در برنامه رخ داده است. لطفاً صفحه را بازنوانی کنید یا با پشتیبانی تماس بگیرید."
            extra={[
              <Button type="primary" key="reload" icon={<ReloadOutlined />} onClick={this.handleReload}>
                بازنوانی صفحه
              </Button>,
              <Button key="reset" onClick={this.handleReset}>
                تلاش مجدد
              </Button>,
            ]}
          >
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{ marginTop: 24, textAlign: 'left' }}>
                <Typography>
                  <Paragraph>
                    <Text strong>خطا: </Text>
                    <Text code>{this.state.error.message}</Text>
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Stack Trace:</Text>
                  </Paragraph>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    backgroundColor: '#f5f5f5', 
                    padding: '16px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}>
                    {this.state.error.stack}
                  </pre>
                </Typography>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
