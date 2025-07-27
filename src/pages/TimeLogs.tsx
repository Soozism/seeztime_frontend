import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
  InputNumber,
  Avatar,
  Select,
  Drawer,
  Switch,
  Tooltip,
  Progress,
  Empty,
  Alert,
  Divider,
} from 'antd';
import {
  ClockCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ProjectOutlined,
  UserOutlined,
  ExportOutlined,
  FilterOutlined,
  TrophyOutlined,
  TeamOutlined,
  DownloadOutlined,
  ReloadOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { TimeLog, TimeLogCreate, Task, User, Project } from '../types';
import TimeLogService from '../services/timeLogService';
import TaskService from '../services/taskService';
import UserService from '../services/userService';
import ProjectService from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface TimeLogFilters {
  project_id?: number;
  user_id?: number;
  start_date?: string;
  end_date?: string;
  task_id?: number;
  skip?: number;
  limit?: number;
}

const TimeLogs: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTimeLog, setEditingTimeLog] = useState<TimeLog | null>(null);
  const [activeTimer, setActiveTimer] = useState<TimeLog | null>(null);
  const [form] = Form.useForm();
  const [filtersDrawerVisible, setFiltersDrawerVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  
  // Advanced filters state
  const [filters, setFilters] = useState<TimeLogFilters>({
    skip: 0,
    limit: 100,
  });
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [quickFilter, setQuickFilter] = useState<string>('all'); // all, today, week, month
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchData();
    checkActiveTimer();
    
    // Setup auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchTimeLogs();
        checkActiveTimer();
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  useEffect(() => {
    fetchTimeLogs();
  }, [filters, dateRange, quickFilter]);

  const fetchData = useCallback(async () => {
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
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTimeLogs = useCallback(async () => {
    try {
      // Prepare filters with date range
      const timeLogFilters: any = { ...filters };
      
      // Apply quick filters
      if (quickFilter !== 'all') {
        const now = dayjs();
        switch (quickFilter) {
          case 'today':
            timeLogFilters.start_date = now.startOf('day').toISOString();
            timeLogFilters.end_date = now.endOf('day').toISOString();
            break;
          case 'week':
            timeLogFilters.start_date = now.startOf('week').toISOString();
            timeLogFilters.end_date = now.endOf('week').toISOString();
            break;
          case 'month':
            timeLogFilters.start_date = now.startOf('month').toISOString();
            timeLogFilters.end_date = now.endOf('month').toISOString();
            break;
        }
      }
      
      // Apply custom date range
      if (dateRange && dateRange[0] && dateRange[1]) {
        timeLogFilters.start_date = dateRange[0].startOf('day').toISOString();
        timeLogFilters.end_date = dateRange[1].endOf('day').toISOString();
      }
      
      const timeLogsData = await TimeLogService.getTimeLogs(timeLogFilters);
      setTimeLogs(timeLogsData);
    } catch (error) {
      console.error('Error fetching time logs:', error);
      message.error('خطا در بارگذاری لاگ‌های زمانی');
    }
  }, [filters, dateRange, quickFilter]);

  const checkActiveTimer = useCallback(async () => {
    if (currentUser) {
      try {
        const activeTimerData = await TimeLogService.getActiveTimer();
        setActiveTimer(activeTimerData);
      } catch (error) {
        // No active timer
        setActiveTimer(null);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
    checkActiveTimer();
    fetchTimeLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    fetchTimeLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, dateRange, quickFilter]); // Re-run when filters change

  useEffect(() => {
    // Setup auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchTimeLogs();
        checkActiveTimer();
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    
    return undefined;
  }, [autoRefresh, fetchTimeLogs, checkActiveTimer, refreshInterval]);

  // Helper functions for charts and statistics
  const getTimeLogsByUser = useMemo(() => {
    const userStats = users.map(user => {
      const userLogs = timeLogs.filter(log => log.user_id === user.id);
      const totalHours = userLogs.reduce((sum, log) => sum + log.hours, 0);
      return {
        user: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        hours: totalHours,
        logs: userLogs.length,
      };
    }).filter(stat => stat.hours > 0);
    
    return userStats.sort((a, b) => b.hours - a.hours);
  }, [timeLogs, users]);

  const getTimeLogsByProject = useMemo(() => {
    const projectStats = projects.map(project => {
      const projectLogs = timeLogs.filter(log => {
        const task = tasks.find(t => t.id === log.task_id);
        return task?.project?.id === project.id;
      });
      const totalHours = projectLogs.reduce((sum, log) => sum + log.hours, 0);
      return {
        project: project.name,
        hours: totalHours,
        logs: projectLogs.length,
      };
    }).filter(stat => stat.hours > 0);
    
    return projectStats.sort((a, b) => b.hours - a.hours);
  }, [timeLogs, projects, tasks]);

  const getDailyTimeLogsChart = useMemo(() => {
    const dailyStats = timeLogs.reduce((acc, log) => {
      const date = dayjs(log.date).format('YYYY-MM-DD');
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += log.hours;
      return acc;
    }, {} as { [key: string]: number });

    const sortedDates = Object.keys(dailyStats).sort();
    const last7Days = sortedDates.slice(-7);

    return {
      labels: last7Days.map(date => dayjs(date).format('MMM DD')),
      datasets: [
        {
          label: 'ساعت کار',
          data: last7Days.map(date => dailyStats[date]),
          backgroundColor: 'rgba(24, 144, 255, 0.6)',
          borderColor: '#1890ff',
          borderWidth: 2,
        },
      ],
    };
  }, [timeLogs]);

  const getUserProductivityChart = useMemo(() => {
    const topUsers = getTimeLogsByUser.slice(0, 5);
    return {
      labels: topUsers.map(stat => stat.user),
      datasets: [
        {
          label: 'ساعت کار',
          data: topUsers.map(stat => stat.hours),
          backgroundColor: [
            '#1890ff',
            '#52c41a',
            '#faad14',
            '#f5222d',
            '#722ed1',
          ],
        },
      ],
    };
  }, [getTimeLogsByUser]);

  const exportTimeLogsToCSV = () => {
    const headers = ['تاریخ', 'کاربر', 'وظیفه', 'پروژه', 'ساعت', 'توضیحات'];
    const csvData = timeLogs.map(log => {
      const task = tasks.find(t => t.id === log.task_id);
      const user = users.find(u => u.id === log.user_id);
      return [
        dayjs(log.date).format('YYYY/MM/DD'),
        `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || '',
        task?.title || '',
        task?.project?.name || '',
        log.hours,
        log.description || '',
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `time-logs-${dayjs().format('YYYY-MM-DD')}.csv`;
    link.click();
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleQuickFilterChange = (value: string) => {
    setQuickFilter(value);
    setDateRange(null); // Clear custom date range when using quick filters
  };

  const handleSubmit = async (values: any) => {
    try {
      const logParams = {
        description: values.description,
        duration_minutes: Math.round(values.hours * 60),
        log_date: values.date.toISOString(),
        task_id: values.task_id,
        is_manual: true,
      };
      if (editingTimeLog) {
        await TimeLogService.updateTimeLog(editingTimeLog.id, {
          hours: values.hours,
          description: values.description,
          date: values.date.toISOString(),
        });
        message.success('لاگ زمانی با موفقیت به‌روزرسانی شد');
      } else {
        await TimeLogService.logTime(logParams);
        message.success('لاگ زمانی جدید با موفقیت ایجاد شد');
      }
      setModalVisible(false);
      setEditingTimeLog(null);
      form.resetFields();
      fetchTimeLogs();
    } catch (error) {
      console.error('Error creating/updating time log:', error);
      message.error('خطا در ایجاد/به‌روزرسانی لاگ زمانی');
    }
  };

  const handleEdit = (timeLog: TimeLog) => {
    setEditingTimeLog(timeLog);
    form.setFieldsValue({
      description: timeLog.description,
      hours: timeLog.hours,
      date: dayjs(timeLog.date),
      task_id: timeLog.task?.id,
    });
    setModalVisible(true);
  };

  const handleDelete = async (timeLogId: number) => {
    try {
      await TimeLogService.deleteTimeLog(timeLogId);
      message.success('لاگ زمانی با موفقیت حذف شد');
      fetchTimeLogs();
    } catch (error) {
      console.error('Error deleting time log:', error);
      message.error('خطا در حذف لاگ زمانی');
    }
  };

  const handleStartTimer = async (taskId: number) => {
    try {
      const newTimer = await TimeLogService.startTimer(taskId);
      setActiveTimer(newTimer);
      message.success('تایمر شروع شد');
    } catch (error) {
      console.error('Error starting timer:', error);
      message.error('خطا در شروع تایمر');
    }
  };

  const handleStopTimer = async () => {
    if (activeTimer) {
      try {
        await TimeLogService.stopTimer({ timer_id: activeTimer.id });
        setActiveTimer(null);
        message.success('تایمر متوقف شد');
        fetchTimeLogs();
      } catch (error) {
        console.error('Error stopping timer:', error);
        message.error('خطا در توقف تایمر');
      }
    }
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const columns = [
    {
      title: 'توضیحات',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: TimeLog) => (
        <Space>
          <Avatar icon={<ClockCircleOutlined />} />
          <div>
            <div><strong>{text}</strong></div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {formatTime(record.hours)}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'وظیفه',
      key: 'task',
      render: (record: TimeLog) => (
        <Space>
          <ProjectOutlined />
          {record.task?.title || 'نامشخص'}
        </Space>
      ),
    },
    {
      title: 'ساعت کار',
      dataIndex: 'hours',
      key: 'hours',
      render: (hours: number) => (
        <Tag color="blue">{formatTime(hours)}</Tag>
      ),
    },
    {
      title: 'تاریخ',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY/MM/DD'),
    },
    {
      title: 'کاربر',
      key: 'user',
      render: (record: TimeLog) => {
        // اگر user نبود، از users با user_id پیدا کن
        const userObj = record.user || users.find(u => u.id === record.user_id);
        return (
          <Space>
            <UserOutlined />
            {userObj?.first_name || 'نامشخص'} {userObj?.last_name || ''}
          </Space>
        );
      },
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (record: TimeLog) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.user_id !== currentUser?.id}
          />
          <Popconfirm
            title="آیا از حذف این لاگ زمانی اطمینان دارید؟"
            onConfirm={() => handleDelete(record.id)}
            okText="بله"
            cancelText="خیر"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              disabled={record.user_id !== currentUser?.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    totalLogs: timeLogs.length,
    totalHours: timeLogs.reduce((sum, log) => sum + log.hours, 0),
    myLogs: currentUser ? timeLogs.filter(log => log.user_id === currentUser.id).length : 0,
    myHours: currentUser ? timeLogs.filter(log => log.user_id === currentUser.id).reduce((sum, log) => sum + log.hours, 0) : 0,
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <ClockCircleOutlined style={{ marginLeft: 8 }} />
          مدیریت ثبت زمان
        </Title>
      </div>

      {/* Active Timer */}
      {activeTimer && (
        <Card style={{ marginBottom: 16, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space>
                <PlayCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                <span><strong>تایمر فعال:</strong> {activeTimer.task?.title || 'نامشخص'}</span>
              </Space>
            </Col>
            <Col>
              <Button
                type="primary"
                danger
                icon={<PauseCircleOutlined />}
                onClick={handleStopTimer}
              >
                توقف تایمر
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کل لاگ‌ها"
              value={stats.totalLogs}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کل ساعت‌ها"
              value={formatTime(stats.totalHours)}
              suffix="ساعت"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="لاگ‌های من"
              value={stats.myLogs}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ساعت‌های من"
              value={formatTime(stats.myHours)}
              suffix="ساعت"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and Analytics Section */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <LineChartOutlined />
                نمودار روزانه ساعت کار (7 روز گذشته)
              </Space>
            }
            size="small"
          >
            {getDailyTimeLogsChart.labels.length > 0 ? (
              <Line 
                data={getDailyTimeLogsChart} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'ساعت',
                      },
                    },
                  },
                }}
                height={200}
              />
            ) : (
              <Empty description="داده‌ای برای نمایش وجود ندارد" />
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <PieChartOutlined />
                بهره‌وری کاربران (5 کاربر برتر)
              </Space>
            }
            size="small"
          >
            {getUserProductivityChart.labels.length > 0 ? (
              <Pie 
                data={getUserProductivityChart} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
                height={200}
              />
            ) : (
              <Empty description="داده‌ای برای نمایش وجود ندارد" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Team Performance Summary */}
      {getTimeLogsByUser.length > 0 && (
        <Card 
          title={
            <Space>
              <TeamOutlined />
              خلاصه عملکرد تیم
            </Space>
          }
          style={{ marginBottom: 24 }}
          size="small"
        >
          <Row gutter={16}>
            {getTimeLogsByUser.slice(0, 4).map((userStat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card size="small">
                  <Statistic
                    title={userStat.user}
                    value={formatTime(userStat.hours)}
                    suffix="ساعت"
                    prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                    valueStyle={{ 
                      color: index === 0 ? '#52c41a' : index === 1 ? '#1890ff' : '#8c8c8c',
                      fontSize: '16px'
                    }}
                  />
                  <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
                    {userStat.logs} لاگ ثبت شده
                  </div>
                  <Progress 
                    percent={Math.round((userStat.hours / Math.max(...getTimeLogsByUser.map(u => u.hours))) * 100)}
                    showInfo={false}
                    strokeColor={index === 0 ? '#52c41a' : index === 1 ? '#1890ff' : '#8c8c8c'}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            لیست لاگ‌های زمانی
            {timeLogs.length > 0 && (
              <Tag color="blue">{timeLogs.length} لاگ</Tag>
            )}
          </Space>
        }
        extra={
          <Space wrap>
            {/* Quick Filters */}
            <Select
              value={quickFilter}
              onChange={handleQuickFilterChange}
              style={{ width: 120 }}
            >
              <Option value="all">همه</Option>
              <Option value="today">امروز</Option>
              <Option value="week">این هفته</Option>
              <Option value="month">این ماه</Option>
            </Select>

            {/* Date Range Picker */}
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="YYYY/MM/DD"
              placeholder={['از تاریخ', 'تا تاریخ']}
              style={{ width: 240 }}
            />

            {/* Project Filter */}
            <Select
              placeholder="انتخاب پروژه"
              style={{ width: 150 }}
              allowClear
              value={filters.project_id}
              onChange={(value) => handleFilterChange('project_id', value)}
            >
              {projects.map((project) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>

            {/* User Filter */}
            <Select
              placeholder="انتخاب کاربر"
              style={{ width: 150 }}
              allowClear
              value={filters.user_id}
              onChange={(value) => handleFilterChange('user_id', value)}
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </Option>
              ))}
            </Select>

            {/* Advanced Filters Button */}
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFiltersDrawerVisible(true)}
            >
              فیلترهای پیشرفته
            </Button>

            {/* Export Button */}
            <Button
              icon={<ExportOutlined />}
              onClick={exportTimeLogsToCSV}
              type="default"
            >
              خروجی CSV
            </Button>

            {/* Refresh Button */}
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchTimeLogs}
              loading={loading}
            />

            {/* Auto Refresh Toggle */}
            <Tooltip title="تازه‌سازی خودکار (30 ثانیه)">
              <Switch
                checked={autoRefresh}
                onChange={setAutoRefresh}
                checkedChildren="Auto"
                unCheckedChildren="Manual"
              />
            </Tooltip>

            {/* Add New Time Log Button */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              لاگ زمانی جدید
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={timeLogs}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `مجموع ${total} لاگ زمانی`,
          }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: 16, backgroundColor: '#fafafa' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <strong>پروژه:</strong> {record.task?.project?.name || 'نامشخص'}
                  </Col>
                  <Col span={12}>
                    <strong>تاریخ ایجاد:</strong> {dayjs(record.created_at).format('YYYY/MM/DD HH:mm')}
                  </Col>
                </Row>
                {!activeTimer && record.user_id === currentUser?.id && (
                  <div style={{ marginTop: 16 }}>
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => record.task?.id && handleStartTimer(record.task.id)}
                      disabled={!record.task?.id}
                    >
                      شروع تایمر برای این وظیفه
                    </Button>
                  </div>
                )}
              </div>
            ),
          }}
        />
      </Card>

      <Modal
        title={editingTimeLog ? 'ویرایش لاگ زمانی' : 'ایجاد لاگ زمانی جدید'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTimeLog(null);
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
            name="description"
            label="توضیحات"
            rules={[{ required: true, message: 'توضیحات الزامی است' }]}
          >
            <Input placeholder="توضیحات کار انجام شده را وارد کنید" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="task_id"
                label="وظیفه"
                rules={[{ required: true, message: 'انتخاب وظیفه الزامی است' }]}
              >
                <Select
                  placeholder="وظیفه را انتخاب کنید"
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
            <Col span={12}>
              <Form.Item
                name="hours"
                label="ساعت کار"
                rules={[{ required: true, message: 'ساعت کار الزامی است' }]}
              >
                <InputNumber
                  min={0.25}
                  max={24}
                  step={0.25}
                  placeholder="ساعت"
                  style={{ width: '100%' }}
                  formatter={(value) => `${value} ساعت`}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="date"
            label="تاریخ"
            rules={[{ required: true, message: 'انتخاب تاریخ الزامی است' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="تاریخ انجام کار"
              format="YYYY/MM/DD"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                انصراف
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTimeLog ? 'به‌روزرسانی' : 'ایجاد'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Advanced Filters Drawer */}
      <Drawer
        title="فیلترهای پیشرفته"
        placement="right"
        width={400}
        open={filtersDrawerVisible}
        onClose={() => setFiltersDrawerVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={5}>فیلتر بر اساس تاریخ</Title>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="YYYY/MM/DD"
              placeholder={['از تاریخ', 'تا تاریخ']}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <Title level={5}>فیلترهای سریع</Title>
            <Select
              value={quickFilter}
              onChange={handleQuickFilterChange}
              style={{ width: '100%' }}
            >
              <Option value="all">همه زمان‌ها</Option>
              <Option value="today">امروز</Option>
              <Option value="week">این هفته</Option>
              <Option value="month">این ماه</Option>
            </Select>
          </div>

          <Divider />

          <div>
            <Title level={5}>فیلتر بر اساس پروژه</Title>
            <Select
              placeholder="انتخاب پروژه"
              style={{ width: '100%' }}
              allowClear
              value={filters.project_id}
              onChange={(value) => handleFilterChange('project_id', value)}
            >
              {projects.map((project) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Title level={5}>فیلتر بر اساس کاربر</Title>
            <Select
              placeholder="انتخاب کاربر"
              style={{ width: '100%' }}
              allowClear
              value={filters.user_id}
              onChange={(value) => handleFilterChange('user_id', value)}
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Title level={5}>فیلتر بر اساس وظیفه</Title>
            <Select
              placeholder="انتخاب وظیفه"
              style={{ width: '100%' }}
              allowClear
              value={filters.task_id}
              onChange={(value) => handleFilterChange('task_id', value)}
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
          </div>

          <Divider />

          <div>
            <Title level={5}>تنظیمات نمایش</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>تازه‌سازی خودکار</span>
                <Switch
                  checked={autoRefresh}
                  onChange={setAutoRefresh}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>تعداد در صفحه</span>
                <Select
                  value={filters.limit}
                  onChange={(value) => handleFilterChange('limit', value)}
                  style={{ width: 100 }}
                >
                  <Option value={50}>50</Option>
                  <Option value={100}>100</Option>
                  <Option value={200}>200</Option>
                  <Option value={500}>500</Option>
                </Select>
              </div>
            </Space>
          </div>

          <Button
            type="primary"
            block
            onClick={() => {
              fetchTimeLogs();
              setFiltersDrawerVisible(false);
            }}
          >
            اعمال فیلترها
          </Button>

          <Button
            block
            onClick={() => {
              setFilters({ skip: 0, limit: 100 });
              setDateRange(null);
              setQuickFilter('all');
              fetchTimeLogs();
            }}
          >
            پاک کردن فیلترها
          </Button>
        </Space>
      </Drawer>

      {/* Export Options Modal */}
      <Modal
        title="گزینه‌های خروجی"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="انتخاب فرمت خروجی"
            description="می‌توانید داده‌های لاگ زمانی فعلی را در فرمت‌های مختلف دانلود کنید."
            type="info"
            showIcon
          />

          <Row gutter={16}>
            <Col span={12}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => {
                  exportTimeLogsToCSV();
                  setExportModalVisible(false);
                }}
                block
                size="large"
              >
                CSV خروجی
              </Button>
            </Col>
            <Col span={12}>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => {
                  // TODO: Implement JSON export
                  message.info('قابلیت خروجی JSON به زودی اضافه خواهد شد');
                  setExportModalVisible(false);
                }}
                block
                size="large"
              >
                JSON خروجی
              </Button>
            </Col>
          </Row>

          <div style={{ textAlign: 'center', color: '#8c8c8c', fontSize: '12px' }}>
            تعداد رکوردها: {timeLogs.length}
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default TimeLogs;
