import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Table,
  Tag,
  message,
  Select,
  DatePicker,
  Button,
  Space,
  Tabs,
  Progress,
  List,
  Avatar,
  Tooltip,
  Alert,
  Switch,
  Divider,
} from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  SyncOutlined,
  ExportOutlined,
  FilterOutlined,
  DashboardOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { DashboardStats, User, Project, Task, TimeLog, Sprint, Team } from '../types';
import DashboardService from '../services/dashboardService';
import ProjectService from '../services/projectService';
import UserService from '../services/userService';
import TaskService from '../services/taskService';
import TimeLogService from '../services/timeLogService';
import TeamService from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const { Content } = Layout;
const { Title: AntTitle } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface DashboardFilters {
  dateRange?: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
  projectId?: number;
  teamId?: number;
}

interface TeamStats {
  team_id: number;
  team_name: string;
  total_members: number;
  active_tasks: number;
  completed_tasks: number;
  total_hours: number;
  performance_score: number;
}

interface ProductivityTrend {
  date: string;
  tasks_completed: number;
  hours_logged: number;
  story_points: number;
}

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [productivityTrends, setProductivityTrends] = useState<ProductivityTrend[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [topPerformers, setTopPerformers] = useState<User[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [projectSummary, setProjectSummary] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('Dashboard useEffect triggered:', { isAuthenticated, user: user?.username });
    if (isAuthenticated && user) {
      fetchDashboardData();
    } else {
      // Set default values if not authenticated
      setLoading(false);
      const defaultStats: DashboardStats = {
        total_projects: 0,
        active_projects: 0,
        total_tasks: 0,
        completed_tasks: 0,
        total_hours_logged: 0,
        total_story_points: 0,
        completed_story_points: 0,
        active_sprints: 0,
        recent_activities: [],
      };
      console.log('Setting default stats for unauthenticated user:', defaultStats);
      setStats(defaultStats);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Separate effect for advanced data when dashboardData changes
  useEffect(() => {
    if (dashboardData && isAuthenticated && user) {
      fetchAdvancedData(dashboardData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardData, isAuthenticated, user]);

  useEffect(() => {
    if (autoRefresh && isAuthenticated) {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);

      return () => {
        clearInterval(interval);
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, isAuthenticated]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...', { isAuthenticated, user: user?.username });
      
      // Fetch data from the dashboard service
      const data = await DashboardService.getDashboardData();
      console.log('Dashboard API response:', data);
      
      // Store raw data for charts
      setDashboardData(data);
      
      // Transform the API response to match our DashboardStats interface
      const transformedStats: DashboardStats = {
        total_projects: data.projects?.total || 0,
        active_projects: data.projects?.active || 0,
        total_tasks: data.tasks?.accessible_total || 0,
        completed_tasks: data.tasks?.my_completed || 0,
        total_hours_logged: data.time_logs?.total_hours || 0,
        total_story_points: data.story_points?.my_total || 0,
        completed_story_points: data.story_points?.my_completed || 0,
        active_sprints: data.sprints?.active || 0,
        recent_activities: data.recent_tasks || [],
      };
      
      console.log('Transformed stats:', transformedStats);
      setStats(transformedStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('خطا در بارگذاری اطلاعات داشبورد. در حال نمایش داده‌های نمونه...');
      
      // Set mock data if API fails for development purposes
      const mockStats: DashboardStats = {
        total_projects: 5,
        active_projects: 3,
        total_tasks: 25,
        completed_tasks: 15,
        total_hours_logged: 120,
        total_story_points: 80,
        completed_story_points: 50,
        active_sprints: 2,
        recent_activities: [],
      };
      console.log('Using mock stats:', mockStats);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchAdvancedData = useCallback(async (currentDashboardData?: any) => {
    if (!isAuthenticated || !user) return;

    try {
      // Apply date range filter if set
      const dateFilter = filters.dateRange ? {
        start_date: filters.dateRange[0]?.startOf('day').toISOString(),
        end_date: filters.dateRange[1]?.endOf('day').toISOString(),
      } : {};

      // Fetch team stats for managers
      if (user.role === 'admin' || user.role === 'project_manager' || user.role === 'team_leader') {
        try {
          // Use teams data from dashboard API if available
          if (currentDashboardData?.teams?.team_details) {
            const teamStatsData = currentDashboardData.teams.team_details.map((team: any) => ({
              team_id: team.id,
              team_name: team.name,
              total_members: team.member_count || 0,
              active_tasks: 0, // Will be filled by additional API calls if needed
              completed_tasks: 0,
              total_hours: 0,
              performance_score: 0,
            }));
            setTeamStats(teamStatsData);
          } else {
            // Fallback to separate TeamService call
            const teams = await TeamService.getTeams();
            const teamStatsPromises = teams.map(async (team) => {
              try {
                const teamData = await DashboardService.getTeamStats(team.id);
                return {
                  team_id: team.id,
                  team_name: team.name,
                  total_members: team.members?.length || 0,
                  active_tasks: teamData.active_tasks || 0,
                  completed_tasks: teamData.completed_tasks || 0,
                  total_hours: teamData.total_hours || 0,
                  performance_score: teamData.performance_score || 0,
                };
              } catch (error) {
                console.error(`Error fetching stats for team ${team.id}:`, error);
                return {
                  team_id: team.id,
                  team_name: team.name,
                  total_members: 0,
                  active_tasks: 0,
                  completed_tasks: 0,
                  total_hours: 0,
                  performance_score: 0,
                };
              }
            });
            const teamStatsData = await Promise.all(teamStatsPromises);
            setTeamStats(teamStatsData);
          }
        } catch (error) {
          console.error('Error fetching team stats:', error);
        }
      }

      // Fetch productivity trends
      try {
        const endDate = dayjs();
        const startDate = endDate.subtract(30, 'day');
        const trendsData = await DashboardService.getProductivitySummary({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          ...dateFilter,
        });
        setProductivityTrends(trendsData.daily_summary || []);
      } catch (error) {
        console.error('Error fetching productivity trends:', error);
      }

      // Fetch recent projects
      try {
        const projects = await ProjectService.getProjects({ limit: 5 });
        setRecentProjects(projects);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
      }

      // Fetch top performers
      try {
        const users = await UserService.getUsers({ limit: 10 });
        // Sort by recent activity or performance metrics
        const sortedUsers = users.slice(0, 5);
        setTopPerformers(sortedUsers);
      } catch (error) {
        console.error('Error fetching top performers:', error);
      }

      // Fetch performance metrics
      try {
        const performanceResponse = await DashboardService.getPerformanceMetrics();
        setPerformanceMetrics(Array.isArray(performanceResponse) ? performanceResponse : []);
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
        setPerformanceMetrics([]);
      }

      // Fetch project summary data
      try {
        const projectsResponse = await ProjectService.getProjects();
        const projects = Array.isArray(projectsResponse) ? projectsResponse : [];
        
        // Transform projects to summary format
        const projectSummaryData = projects.map((project: any) => ({
          project_id: project.id,
          project_name: project.name,
          start_date: project.start_date || new Date().toISOString(),
          end_date: project.end_date || new Date().toISOString(),
          status: project.status || 'active',
          completed_tasks: project.completed_tasks || 0,
          total_tasks: project.total_tasks || 1,
        }));
        
        setProjectSummary(projectSummaryData);
      } catch (projectError) {
        console.warn('Failed to fetch project summary:', projectError);
        setProjectSummary([]);
      }

    } catch (error) {
      console.error('Error fetching advanced dashboard data:', error);
    }
  }, [isAuthenticated, user, filters]);

  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const exportDashboardData = async () => {
    try {
      const dateFilter = filters.dateRange ? {
        start_date: filters.dateRange[0]?.startOf('day').toISOString(),
        end_date: filters.dateRange[1]?.endOf('day').toISOString(),
      } : {};

      // Export time logs
      await TimeLogService.exportTimeLogs({
        format: 'csv',
        ...dateFilter,
      });

      message.success('داده‌های داشبورد با موفقیت صادر شد');
    } catch (error) {
      console.error('Error exporting dashboard data:', error);
      message.error('خطا در صادرات داده‌های داشبورد');
    }
  };

  // Memoized chart data for better performance
  const taskStatusData = useMemo(() => ({
    labels: ['انجام نشده', 'در حال انجام', 'در حال بررسی', 'مسدود شده', 'انجام شده'],
    datasets: [
      {
        data: dashboardData?.tasks ? [
          dashboardData.tasks.my_todo || 0,
          dashboardData.tasks.my_in_progress || 0,
          dashboardData.tasks.my_review || 0,
          dashboardData.tasks.my_blocked || 0,
          dashboardData.tasks.my_completed || 0,
        ] : [0, 0, 0, 0, 0],
        backgroundColor: [
          '#ff4d4f', // Red for Todo
          '#faad14', // Orange for In Progress
          '#1890ff', // Blue for Review
          '#f5222d', // Dark Red for Blocked
          '#52c41a', // Green for Done
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  }), [dashboardData]);

  const projectProgressData = useMemo(() => ({
    labels: ['پروژه‌های فعال', 'پروژه‌های تکمیل شده'],
    datasets: [
      {
        label: 'تعداد پروژه‌ها',
        data: stats ? [stats.active_projects, stats.total_projects - stats.active_projects] : [0, 0],
        backgroundColor: ['#1890ff', '#52c41a'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  }), [stats]);

  const productivityTrendData = useMemo(() => {
    const last7Days = productivityTrends.slice(-7);
    return {
      labels: last7Days.map(trend => dayjs(trend.date).format('MM/DD')),
      datasets: [
        {
          label: 'وظایف تکمیل شده',
          data: last7Days.map(trend => trend.tasks_completed),
          borderColor: '#1890ff',
          backgroundColor: 'rgba(24, 144, 255, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'ساعت کار',
          data: last7Days.map(trend => trend.hours_logged),
          borderColor: '#52c41a',
          backgroundColor: 'rgba(82, 196, 26, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1',
        },
      ],
    };
  }, [productivityTrends]);

  const teamPerformanceData = useMemo(() => ({
    labels: teamStats.map(team => team.team_name),
    datasets: [
      {
        label: 'وظایف فعال',
        data: teamStats.map(team => team.active_tasks),
        backgroundColor: '#1890ff',
      },
      {
        label: 'وظایف تکمیل شده',
        data: teamStats.map(team => team.completed_tasks),
        backgroundColor: '#52c41a',
      },
      {
        label: 'ساعت کار',
        data: teamStats.map(team => team.total_hours),
        backgroundColor: '#faad14',
      },
    ],
  }), [teamStats]);

  const storyPointsData = useMemo(() => ({
    labels: ['تکمیل شده', 'باقی‌مانده'],
    datasets: [
      {
        data: dashboardData?.story_points ? [
          dashboardData.story_points.my_completed,
          dashboardData.story_points.my_total - dashboardData.story_points.my_completed
        ] : [0, 0],
        backgroundColor: ['#52c41a', '#f0f0f0'],
        borderWidth: 0,
      },
    ],
  }), [dashboardData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'تاریخ',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'تعداد وظایف',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'ساعت کار',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  // Tabbed interface for different dashboard views
  const renderOverviewTab = () => (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="وظایف من"
              value={dashboardData?.tasks?.my_assigned_total || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="وظایف تکمیل شده من"
              value={dashboardData?.tasks?.my_completed || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="پروژه‌های فعال"
              value={stats?.active_projects || 0}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="تیم‌های من"
              value={dashboardData?.teams?.total || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="وضعیت وظایف" className="h-96">
            <Doughnut data={taskStatusData} options={chartOptions} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="پیشرفت پروژه‌ها" className="h-96">
            <Pie data={projectProgressData} options={chartOptions} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="روند بهره‌وری" className="h-96">
            <Line data={productivityTrendData} options={lineChartOptions} />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderTeamTab = () => (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="عملکرد تیم‌ها" className="h-96">
            <Bar data={teamPerformanceData} options={chartOptions} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="جزئیات تیم‌ها">
            <Table
              dataSource={teamStats}
              rowKey="team_id"
              columns={[
                {
                  title: 'نام تیم',
                  dataIndex: 'team_name',
                  key: 'team_name',
                },
                {
                  title: 'تعداد اعضا',
                  dataIndex: 'member_count',
                  key: 'member_count',
                },
                {
                  title: 'وظایف فعال',
                  dataIndex: 'active_tasks',
                  key: 'active_tasks',
                },
                {
                  title: 'وظایف تکمیل شده',
                  dataIndex: 'completed_tasks',
                  key: 'completed_tasks',
                },
                {
                  title: 'ساعت کار',
                  dataIndex: 'total_hours',
                  key: 'total_hours',
                  render: (hours: number) => `${hours.toFixed(1)} ساعت`,
                },
                {
                  title: 'بهره‌وری',
                  key: 'productivity',
                  render: (record: any) => {
                    const productivity = record.total_hours > 0 
                      ? (record.completed_tasks / record.total_hours * 100).toFixed(1)
                      : '0';
                    return `${productivity}%`;
                  },
                },
              ]}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Story Points" className="h-96">
            <Doughnut data={storyPointsData} options={chartOptions} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="آمار پیشرفت">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>پیشرفت وظایف من</span>
                  <span>{dashboardData?.tasks ? Math.round((dashboardData.tasks.my_completed / dashboardData.tasks.my_assigned_total) * 100) || 0 : 0}%</span>
                </div>
                <Progress 
                  percent={dashboardData?.tasks ? Math.round((dashboardData.tasks.my_completed / dashboardData.tasks.my_assigned_total) * 100) || 0 : 0}
                  status="active"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Story Points تکمیل شده</span>
                  <span>{dashboardData?.story_points ? Math.round((dashboardData.story_points.my_completed / dashboardData.story_points.my_total) * 100) || 0 : 0}%</span>
                </div>
                <Progress 
                  percent={dashboardData?.story_points ? Math.round((dashboardData.story_points.my_completed / dashboardData.story_points.my_total) * 100) || 0 : 0}
                  strokeColor="#52c41a"
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="گزارش‌های پیشرفته">
            <Table
              dataSource={performanceMetrics}
              rowKey="user_id"
              columns={[
                {
                  title: 'کاربر',
                  dataIndex: 'user_name',
                  key: 'user_name',
                },
                {
                  title: 'وظایف تکمیل شده',
                  dataIndex: 'completed_tasks',
                  key: 'completed_tasks',
                },
                {
                  title: 'ساعت کار',
                  dataIndex: 'hours_logged',
                  key: 'hours_logged',
                  render: (hours: number) => `${hours.toFixed(1)} ساعت`,
                },
                {
                  title: 'امتیاز بهره‌وری',
                  dataIndex: 'productivity_score',
                  key: 'productivity_score',
                  render: (score: number) => (
                    <Tag color={score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red'}>
                      {score.toFixed(1)}
                    </Tag>
                  ),
                },
                {
                  title: 'وضعیت',
                  key: 'status',
                  render: (record: any) => {
                    const score = record.productivity_score;
                    if (score >= 80) return <Tag color="green">عالی</Tag>;
                    if (score >= 60) return <Tag color="orange">خوب</Tag>;
                    return <Tag color="red">نیاز به بهبود</Tag>;
                  },
                },
              ]}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderProjectsTab = () => (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="پروژه‌های فعال">
            <Table
              dataSource={projectSummary}
              rowKey="project_id"
              columns={[
                {
                  title: 'نام پروژه',
                  dataIndex: 'project_name',
                  key: 'project_name',
                },
                {
                  title: 'تاریخ شروع',
                  dataIndex: 'start_date',
                  key: 'start_date',
                  render: (date: string) => dayjs(date).format('YYYY/MM/DD'),
                },
                {
                  title: 'تاریخ پایان',
                  dataIndex: 'end_date',
                  key: 'end_date',
                  render: (date: string) => dayjs(date).format('YYYY/MM/DD'),
                },
                {
                  title: 'وضعیت',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => {
                    const color = status === 'active' ? 'green' : 
                                 status === 'on_hold' ? 'orange' : 'blue';
                    return <Tag color={color}>{status}</Tag>;
                  },
                },
                {
                  title: 'پیشرفت',
                  key: 'progress',
                  render: (record: any) => (
                    <Progress
                      percent={Math.round((record.completed_tasks / record.total_tasks) * 100)}
                      size="small"
                    />
                  ),
                },
                {
                  title: 'وظایف',
                  key: 'tasks',
                  render: (record: any) => `${record.completed_tasks}/${record.total_tasks}`,
                },
              ]}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 134px)' }}>
        <div className="dashboard-container">
          <div className="flex justify-between items-center mb-6">
            <AntTitle level={2} className="mb-0">
              <DashboardOutlined className="ml-2" />
              داشبورد
            </AntTitle>
            <Space>
              <Switch
                checked={autoRefresh}
                onChange={setAutoRefresh}
                checkedChildren="خودکار"
                unCheckedChildren="دستی"
              />
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={() => {
                  fetchDashboardData();
                }}
                loading={loading}
              >
                به‌روزرسانی
              </Button>
            </Space>
          </div>

          <Spin spinning={loading}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              type="card"
              items={[
                {
                  key: 'overview',
                  label: (
                    <span>
                      <DashboardOutlined />
                      کلی
                    </span>
                  ),
                  children: renderOverviewTab(),
                },
                {
                  key: 'teams',
                  label: (
                    <span>
                      <TeamOutlined />
                      تیم‌ها
                    </span>
                  ),
                  children: renderTeamTab(),
                },
                {
                  key: 'analytics',
                  label: (
                    <span>
                      <BarChartOutlined />
                      تحلیل‌ها
                    </span>
                  ),
                  children: renderAnalyticsTab(),
                },
                {
                  key: 'projects',
                  label: (
                    <span>
                      <ProjectOutlined />
                      پروژه‌ها
                    </span>
                  ),
                  children: renderProjectsTab(),
                },
              ]}
            />
          </Spin>
        </div>
      </Content>
    </Layout>
  );
};

export default Dashboard;
