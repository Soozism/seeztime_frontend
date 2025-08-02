import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Select,
  DatePicker,
  Typography,
  Space,
  Spin,
  Alert,
  message,
} from 'antd';
import {
  BarChartOutlined,
  DownloadOutlined,
  ProjectOutlined,
  UserOutlined,
  ClockCircleOutlined,
  BugOutlined,
} from '@ant-design/icons';
import {
  TimeReportResponse,
  ProjectStoryStats,
  TeamProductivityReport,
  Project,
  User,
  Team,
} from '../types';
import ReportService from '../services/reportService';
import ProjectService from '../services/projectService';
import UserService from '../services/userService';
import TeamService from '../services/teamService';
import { dateUtils } from '../utils/dateConfig';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timeLogReport, setTimeLogReport] = useState<TimeReportResponse | null>(null);
  const [storyPointsReport, setStoryPointsReport] = useState<ProjectStoryStats[]>([]);
  const [teamProductivityReport, setTeamProductivityReport] = useState<TeamProductivityReport[]>([]);
  
  // Filter states
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | undefined>();
  const [selectedUser, setSelectedUser] = useState<number | undefined>();
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [projectsData, usersData, teamsData] = await Promise.all([
        ProjectService.getProjects(),
        UserService.getUsers(),
        TeamService.getTeams(),
      ]);
      setProjects(projectsData);
      setUsers(usersData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchTimeLogReport = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedProject) filters.project_id = selectedProject;
      if (selectedUser) filters.user_id = selectedUser;
      if (selectedTeam) filters.team_id = selectedTeam;
      if (dateRange) {
        filters.start_date = (dateRange[0] as any).toISOString();
        filters.end_date = (dateRange[1] as any).toISOString();
      }

      const report = await ReportService.getTimeReport(filters);
      setTimeLogReport(report);
    } catch (error) {
      console.error('Error fetching time log report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoryPointsReport = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedProject) filters.project_id = selectedProject;
      if (dateRange) {
        filters.start_date = (dateRange[0] as any).toISOString();
        filters.end_date = (dateRange[1] as any).toISOString();
      }

      const report = await ReportService.getStoryPointsReport(filters);
      setStoryPointsReport(report.project_stats);
    } catch (error) {
      console.error('Error fetching story points report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamProductivityReport = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedTeam) filters.team_id = selectedTeam;
      if (dateRange) {
        filters.start_date = (dateRange[0] as any).toISOString();
        filters.end_date = (dateRange[1] as any).toISOString();
      }

      const report = await ReportService.getTeamReport(filters);
      setTeamProductivityReport(report.team_productivity);
    } catch (error) {
      console.error('Error fetching team productivity report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (reportType: string) => {
    try {
      const filters: any = {};
      if (selectedProject) filters.project_id = selectedProject;
      if (selectedUser) filters.user_id = selectedUser;
      if (selectedTeam) filters.team_id = selectedTeam;
      if (dateRange) {
        filters.start_date = (dateRange[0] as any).toISOString();
        filters.end_date = (dateRange[1] as any).toISOString();
      }

      // await ReportService.exportReport(reportType, filters, 'pdf');
      message.info('قابلیت اکسپورت هنوز پیاده‌سازی نشده است');
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const timeLogColumns = [
    {
      title: 'پروژه',
      dataIndex: 'project_name',
      key: 'project_name',
    },
    {
      title: 'کل ساعت‌ها',
      dataIndex: 'total_hours',
      key: 'total_hours',
      render: (hours: number) => `${hours.toFixed(2)} ساعت`,
    },
    {
      title: 'تعداد وظایف',
      dataIndex: 'total_tasks',
      key: 'total_tasks',
    },
    {
      title: 'وظایف تکمیل شده',
      dataIndex: 'completed_tasks',
      key: 'completed_tasks',
    },
    {
      title: 'درصد تکمیل',
      key: 'completion_rate',
      render: (record: any) => {
        const rate = (record.completed_tasks / record.total_tasks) * 100;
        return `${rate.toFixed(1)}%`;
      },
    },
  ];

  const storyPointsColumns = [
    {
      title: 'پروژه',
      dataIndex: 'project_name',
      key: 'project_name',
    },
    {
      title: 'کل امتیاز',
      dataIndex: 'total_story_points',
      key: 'total_story_points',
    },
    {
      title: 'امتیاز تکمیل شده',
      dataIndex: 'completed_story_points',
      key: 'completed_story_points',
    },
    {
      title: 'درصد تکمیل',
      dataIndex: 'completion_rate',
      key: 'completion_rate',
      render: (rate: number) => `${(rate * 100).toFixed(1)}%`,
    },
  ];

  const teamProductivityColumns = [
    {
      title: 'تیم',
      dataIndex: 'team_name',
      key: 'team_name',
    },
    {
      title: 'کل ساعت‌ها',
      dataIndex: 'total_hours',
      key: 'total_hours',
      render: (hours: number) => `${hours.toFixed(2)} ساعت`,
    },
    {
      title: 'کل امتیاز',
      dataIndex: 'total_story_points',
      key: 'total_story_points',
    },
    {
      title: 'امتیاز تکمیل شده',
      dataIndex: 'completed_story_points',
      key: 'completed_story_points',
    },
    {
      title: 'درصد تکمیل',
      dataIndex: 'completion_rate',
      key: 'completion_rate',
      render: (rate: number) => `${(rate * 100).toFixed(1)}%`,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BarChartOutlined style={{ marginLeft: 8 }} />
          گزارش‌ها و تحلیل‌ها
        </Title>
      </div>

      {/* Filters */}
      <Card title="فیلترها" style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={4}>
            <Select
              placeholder="انتخاب پروژه"
              style={{ width: '100%' }}
              allowClear
              value={selectedProject}
              onChange={setSelectedProject}
            >
              {projects.map((project) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="انتخاب کاربر"
              style={{ width: '100%' }}
              allowClear
              value={selectedUser}
              onChange={setSelectedUser}
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="انتخاب تیم"
              style={{ width: '100%' }}
              allowClear
              value={selectedTeam}
              onChange={setSelectedTeam}
            >
              {teams.map((team) => (
                <Option key={team.id} value={team.id}>
                  {team.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['تاریخ شروع', 'تاریخ پایان']}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            />
          </Col>
          <Col span={6}>
            <Space>
              <Button type="primary" onClick={fetchTimeLogReport}>
                گزارش زمان
              </Button>
              <Button onClick={fetchStoryPointsReport}>
                گزارش امتیاز
              </Button>
              <Button onClick={fetchTeamProductivityReport}>
                گزارش تیم
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      )}

      {/* Time Log Report */}
      {timeLogReport && (
        <Card
          title="گزارش ثبت زمان"
          style={{ marginBottom: 24 }}
          extra={
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExportReport('time-logs')}
            >
              دانلود PDF
            </Button>
          }
        >
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic
                title="کل ساعت‌ها"
                value={timeLogReport.summary?.total_hours?.toFixed(2) || '0'}
                suffix="ساعت"
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="تعداد لاگ‌ها"
                value={timeLogReport.detailed_logs?.length || 0}
                prefix={<BarChartOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="تعداد پروژه‌ها"
                value={timeLogReport.project_stats.length}
                prefix={<ProjectOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="تعداد کاربران"
                value={timeLogReport.user_stats.length}
                prefix={<UserOutlined />}
              />
            </Col>
          </Row>
          
          <Table
            columns={timeLogColumns}
            dataSource={timeLogReport.project_stats}
            rowKey="project_id"
            pagination={false}
          />
        </Card>
      )}

      {/* Story Points Report */}
      {storyPointsReport.length > 0 && (
        <Card
          title="گزارش امتیاز استوری"
          style={{ marginBottom: 24 }}
          extra={
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExportReport('story-points')}
            >
              دانلود PDF
            </Button>
          }
        >
          <Table
            columns={storyPointsColumns}
            dataSource={storyPointsReport}
            rowKey="project_id"
            pagination={false}
          />
        </Card>
      )}

      {/* Team Productivity Report */}
      {teamProductivityReport.length > 0 && (
        <Card
          title="گزارش بهره‌وری تیم"
          style={{ marginBottom: 24 }}
          extra={
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExportReport('team-productivity')}
            >
              دانلود PDF
            </Button>
          }
        >
          <Table
            columns={teamProductivityColumns}
            dataSource={teamProductivityReport}
            rowKey="team_id"
            pagination={false}
          />
        </Card>
      )}

      {/* Default state */}
      {!loading && !timeLogReport && storyPointsReport.length === 0 && teamProductivityReport.length === 0 && (
        <Alert
          message="گزارشی انتخاب نشده"
          description="لطفاً فیلترهای مورد نظر را انتخاب کرده و بر روی یکی از دکمه‌های گزارش کلیک کنید."
          type="info"
          showIcon
          style={{ textAlign: 'center' }}
        />
      )}
    </div>
  );
};

export default Reports;
