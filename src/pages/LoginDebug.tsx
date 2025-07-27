import React, { useState } from 'react';
import { Button, Card, Input, Space, Typography, Divider } from 'antd';
import ApiService from '../services/api';

const { Title, Paragraph, Text } = Typography;

const LoginDebug: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDirectCurl = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('🔄 Testing direct API calls...');
      
      // Step 1: Login
      addResult('Step 1: Creating form data for login...');
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      addResult('Step 2: Calling login API...');
      const loginResponse = await fetch('http://185.105.187.118:8000/api/v1/auth/login', {
        method: 'POST',
        body: formData,
      });
      
      if (!loginResponse.ok) {
        addResult(`❌ Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
        return;
      }
      
      const loginData = await loginResponse.json();
      addResult(`✅ Login successful: ${JSON.stringify(loginData)}`);
      
      // Step 2: Get user data
      addResult('Step 3: Calling /me API with token...');
      const meResponse = await fetch('http://185.105.187.118:8000/api/v1/users/me/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.access_token}`,
          'Accept': 'application/json',
        },
      });
      
      if (!meResponse.ok) {
        addResult(`❌ /me failed: ${meResponse.status} ${meResponse.statusText}`);
        const errorText = await meResponse.text();
        addResult(`Error body: ${errorText}`);
        return;
      }
      
      const userData = await meResponse.json();
      addResult(`✅ /me successful: ${JSON.stringify(userData)}`);
      
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testThroughApiService = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('🔄 Testing through ApiService...');
      
      // Step 1: Login through ApiService
      addResult('Step 1: Creating form data...');
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      addResult('Step 2: Calling login through ApiService...');
      const loginResponse = await ApiService.postForm<{access_token: string; token_type: string}>('/api/v1/auth/login', formData);
      addResult(`✅ Login successful: ${JSON.stringify(loginResponse)}`);
      
      // Step 2: Store token
      addResult('Step 3: Storing token...');
      localStorage.setItem('access_token', loginResponse.access_token);
      addResult('✅ Token stored');
      
      // Step 3: Get user data through ApiService
      addResult('Step 4: Calling /me through ApiService...');
      const userData = await ApiService.get('/api/v1/users/me/');
      addResult(`✅ /me successful: ${JSON.stringify(userData)}`);
      
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
      if (error.response) {
        addResult(`Response status: ${error.response.status}`);
        addResult(`Response data: ${JSON.stringify(error.response.data)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>🔍 Login Debug Tool</Title>
      
      <Card title="Test Credentials" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text>Username: </Text>
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '200px', marginLeft: '10px' }}
            />
          </div>
          <div>
            <Text>Password: </Text>
            <Input.Password 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '200px', marginLeft: '10px' }}
            />
          </div>
        </Space>
      </Card>

      <Card title="Test Methods" style={{ marginBottom: '20px' }}>
        <Space>
          <Button 
            type="primary" 
            onClick={testDirectCurl} 
            loading={loading}
          >
            Test Direct Fetch API
          </Button>
          <Button 
            onClick={testThroughApiService} 
            loading={loading}
          >
            Test Through ApiService
          </Button>
          <Button onClick={() => setResults([])}>
            Clear Results
          </Button>
        </Space>
      </Card>

      <Card title="Results">
        <div style={{ 
          height: '400px', 
          overflowY: 'auto',
          backgroundColor: '#f5f5f5',
          padding: '10px',
          fontFamily: 'monospace',
          fontSize: '12px',
          whiteSpace: 'pre-wrap'
        }}>
          {results.length === 0 ? (
            <Text type="secondary">Click a test button to see results...</Text>
          ) : (
            results.map((result, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {result}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default LoginDebug;
