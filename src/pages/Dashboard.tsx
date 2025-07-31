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
    if (isAuthenticated && user) {
      fetchDashboardData();
    } else {
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
      setStats(defaultStats);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (dashboardData && isAuthenticated && user) {
      fetchAdvancedData(dashboardData);
    }
  }, [dashboardData, isAuthenticated, user]);

  useEffect(() => {
    if (autoRefresh && isAuthenticated) {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 30000);
      setRefreshInterval(interval);

      return () => {
        clearInterval(interval);
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, isAuthenticated]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await DashboardService.getDashboardData();
      setDashboardData(data);
      
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
      setStats(transformedStats);
    } catch (error) {
      message.error('خطا در بارگذاری اطلاعات داشبورد. در حال نمایش داده‌های نمونه...');
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
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchAdvancedData = useCallback(async (currentDashboardData?: any) => {
    if (!isAuthenticated || !user) return;

    try {
      const dateFilter = filters.dateRange ? {
        start_date: filters.dateRange[0]?.startOf('day').toISOString(),
        end_date: filters.dateRange[1]?.endOf('day').toISOString(),
      } : {};

      if (user.role === 'admin' || user.role === 'project_manager' || user.role === 'team_leader') {
        if (currentDashboardData?.teams?.team_details) {
          const teamStatsData = currentDashboardData.teams.team_details.map((team: any) => ({
            team_id: team.id,
            team_name: team.name,
            total_members: team.member_count || 0,
            active_tasks: 0,
            completed_tasks: 0,
            total_hours: 0,
            performance_score: 0,
          }));
          setTeamStats(teamStatsData);
        } else {
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
      }

      try {
        const endDate = dayjs();
        const startDate = endDate.subtract(30, 'day');
        const trendsData = await DashboardService.getProductivitySummary({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          ...dateFilter,
        });
        setProductivityTrends(trendsData.daily_summary || []);
      } catch (error) {}

      try {
        const projects = await ProjectService.getProjects({ limit: 5 });
        setRecentProjects(projects);
      } catch (error) {}

      try {
        const users = await UserService.getUsers({ limit: 10 });
        const sortedUsers = users.slice(0, 5);
        setTopPerformers(sortedUsers);
      } catch (error) {}

      try {
        const performanceResponse = await DashboardService.getPerformanceMetrics();
        setPerformanceMetrics(Array.isArray(performanceResponse) ? performanceResponse : []);
      } catch (error) {
        setPerformanceMetrics([]);
      }

      try {
        const projectsResponse = await ProjectService.getProjects();
        const projects = Array.isArray(projectsResponse) ? projectsResponse : [];
        
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
        setProjectSummary([]);
      }

    } catch (error) {}
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

      await TimeLogService.exportTimeLogs({
        format: 'csv',
        ...dateFilter,
      });

      message.success('داده‌های داشبورد با موفقیت صادر شد');
    } catch (error) {
      message.error('خطا در صادرات داده‌های داشبورد');
    }
  };

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
          '#E0E0E0',
          '#BBDEFB',
          '#FFECB3',
          '#EF9A9A',
          '#A5D6A7',
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF',
      },
    ],
  }), [dashboardData]);

  const projectProgressData = useMemo(() => ({
    labels: ['پروژه‌های فعال', 'پروژه‌های تکمیل شده'],
    datasets: [
      {
        label: 'تعداد پروژه‌ها',
        data: stats ? [stats.active_projects, stats.total_projects - stats.active_projects] : [0, 0],
        backgroundColor: ['#BBDEFB', '#A5D6A7'],
        borderWidth: 2,
        borderColor: '#FFFFFF',
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
          borderColor: '#006D77',
          backgroundColor: 'rgba(0, 109, 119, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'ساعت کار',
          data: last7Days.map(trend => trend.hours_logged),
          borderColor: '#FF6F61',
          backgroundColor: 'rgba(255, 111, 97, 0.1)',
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
        backgroundColor: '#BBDEFB',
      },
      {
        label: 'وظایف تکمیل شده',
        data: teamStats.map(team => team.completed_tasks),
        backgroundColor: '#A5D6A7',
      },
      {
        label: 'ساعت کار',
        data: teamStats.map(team => team.total_hours),
        backgroundColor: '#FF6F61',
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
        backgroundColor: ['#A5D6A7', '#E0E0E0'],
        borderWidth: 0,
      },
    ],
  }), [dashboardData]);

  // Chart options for Pie/Doughnut (no axes)
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#333333',
          font: {
            size: 14,
          },
        },
      },
    },
  };

  // Chart options for charts with axes (Line/Bar)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#333333',
          font: {
            size: 14,
          },
        },
      },
    },
    scales: {
      y: {
        ticks: { color: '#333333' },
        grid: { color: '#A8B5A2' },
      },
      x: {
        ticks: { color: '#333333' },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
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
          color: '#333333',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'تعداد وظایف',
          color: '#333333',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'ساعت کار',
          color: '#333333',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const renderOverviewTab = () => (
  <div className="dashboard-overview" style={{ padding: '8px 0' }}>
    <Row gutter={[32, 32]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} lg={6}>
        <Card bodyStyle={{ padding: 18, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Statistic
            title="وظایف من"
            value={dashboardData?.tasks?.my_assigned_total || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#006D77', fontWeight: 600 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bodyStyle={{ padding: 18, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Statistic
            title="وظایف تکمیل شده من"
            value={dashboardData?.tasks?.my_completed || 0}
            prefix={<TrophyOutlined />}
            valueStyle={{ color: '#A5D6A7', fontWeight: 600 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bodyStyle={{ padding: 18, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Statistic
            title="پروژه‌های فعال"
            value={stats?.active_projects || 0}
            prefix={<ProjectOutlined />}
            valueStyle={{ color: '#FF6F61', fontWeight: 600 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card bodyStyle={{ padding: 18, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Statistic
            title="تیم‌های من"
            value={dashboardData?.teams?.total || 0}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#D4A017', fontWeight: 600 }}
          />
        </Card>
      </Col>
    </Row>

    <Row gutter={[32, 32]} style={{ marginBottom: 16 }}>
      <Col xs={24} lg={12}>
        <Card title="وضعیت وظایف" className="h-96" bodyStyle={{ padding: 0, height: 340 }}>
          <div style={{ width: '100%', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut data={taskStatusData} options={{ ...pieChartOptions, cutout: '70%' }} />
          </div>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title="پیشرفت پروژه‌ها" className="h-96" bodyStyle={{ padding: 0, height: 340 }}>
          <div style={{ width: '100%', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pie data={projectProgressData} options={{ ...pieChartOptions, cutout: '70%' }} />
          </div>
        </Card>
      </Col>
    </Row>

    <Row gutter={[32, 32]}>
      <Col span={24}>
        <Card title="روند بهره‌وری" className="h-96" bodyStyle={{ padding: 0, height: 340 }}>
          <div style={{ width: '100%', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Line data={productivityTrendData} options={lineChartOptions} />
          </div>
        </Card>
      </Col>
    </Row>
  </div>
  );

  const renderTeamTab = () => (
    <div className="space-y-6">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="عملکرد تیم‌ها" className="h-96">
            <Bar data={teamPerformanceData} options={chartOptions} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
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
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Story Points" className="h-96">
            <Doughnut data={storyPointsData} options={pieChartOptions} />
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
                  strokeColor="#A5D6A7"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Story Points تکمیل شده</span>
                  <span>{dashboardData?.story_points ? Math.round((dashboardData.story_points.my_completed / dashboardData.story_points.my_total) * 100) || 0 : 0}%</span>
                </div>
                <Progress 
                  percent={dashboardData?.story_points ? Math.round((dashboardData.story_points.my_completed / dashboardData.story_points.my_total) * 100) || 0 : 0}
                  strokeColor="#A5D6A7"
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
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
                    <Tag color={score >= 80 ? '#A5D6A7' : score >= 60 ? '#FF6F61' : '#EF9A9A'}>
                      {score.toFixed(1)}
                    </Tag>
                  ),
                },
                {
                  title: 'وضعیت',
                  key: 'status',
                  render: (record: any) => {
                    const score = record.productivity_score;
                    if (score >= 80) return <Tag color="#A5D6A7">عالی</Tag>;
                    if (score >= 60) return <Tag color="#FF6F61">خوب</Tag>;
                    return <Tag color="#EF9A9A">نیاز به بهبود</Tag>;
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
      <Row gutter={[24, 24]}>
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
                    const color = status === 'active' ? '#A5D6A7' : 
                                 status === 'on_hold' ? '#FF6F61' : '#BBDEFB';
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
                      strokeColor="#006D77"
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
      <Content style={{ padding: '32px', minHeight: 'calc(100vh - 134px)', background: '#F5F5EB' }}>
        <div className="dashboard-container">
          <div className="flex justify-between items-center mb-6">
            <AntTitle level={2} className="mb-0 text-2xl">
              <DashboardOutlined className="ml-2" />
              داشبورد
            </AntTitle>
            <Space>
              <Switch
                checked={autoRefresh}
                onChange={setAutoRefresh}
                checkedChildren="خودکار"
                unCheckedChildren="دستی"
                style={{ background: autoRefresh ? '#006D77' : '#A8B5A2' }}
              />
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={() => fetchDashboardData()}
                loading={loading}
                style={{ background: '#FF6F61', borderColor: '#FF6F61' }}
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
              tabBarStyle={{ marginBottom: '24px' }}
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