import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin } from 'antd';

const { Title } = Typography;

const Kanban: React.FC = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Kanban Board</Title>
      <Card>
        <Spin spinning={loading}>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Kanban board is being enhanced. Please use the Tasks page for now.
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default Kanban;
