import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Table,
  Statistic,
  Progress,
  Typography,
  Space,
  Tabs,
  Alert,
  Spin
} from 'antd';
import {
  DownloadOutlined,
  BarChartOutlined,
  UserOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import advancedQueriesService from '../services/advancedQueriesService';
import projectService from '../services/projectService';
import teamService from '../services/teamService';
import userService from '../services/userService';
import NotificationService from '../utils/notifications';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface ProductivityMetrics {
  total_hours: number;
  total_story_points: number;
  unique_users: number;
  unique_projects: number;
  velocity: number;
  efficiency: number;
}

interface ProjectAnalytics {
  project_id: number;
  project_name: string;
  task_summary: {
    total: number;
    todo: number;
    in_progress: number;
    review: number;
    done: number;
    blocked: number;
  };
  time_summary: {
    total_hours: number;
    billable_hours: number;
    avg_hours_per_task: number;
  };
  team_performance: {
    total_members: number;
    active_members: number;
    avg_velocity: number;
  };
}

interface UserPerformance {
  user_id: number;
  username: string;
  full_name: string;
  metrics: {
    tasks_completed: number;
    hours_logged: number;
    story_points_completed: number;
    avg_task_completion_time: number;
    efficiency_score: number;
  };
}

const AdvancedReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('productivity');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | undefined>();
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>();
  const [selectedUser, setSelectedUser] = useState<number | undefined>();
  
  // Data states
  const [productivityData, setProductivityData] = useState<any>(null);
  const [projectAnalytics, setProjectAnalytics] = useState<ProjectAnalytics[]>([]);
  const [userPerformance, setUserPerformance] = useState<UserPerformance[]>([]);
  const [timeSummary, setTimeSummary] = useState<any>(null);
  
  // Options for dropdowns
  const [projects, setProjects] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [projectList, teamList, userList] = await Promise.all([
        projectService.getProjects({ limit: 100 }),
        teamService.getTeams({ limit: 100 }),
        userService.getUsers({ limit: 100 })
      ]);
      
      setProjects(projectList);
      setTeams(teamList);
      setUsers(userList);
    } catch (error) {
      NotificationService.error('خطا', 'امکان بارگذاری اطلاعات اولیه وجود ندارد');
    }
  };

  const getFilterParams = () => ({
    start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
    end_date: dateRange?.[1]?.format('YYYY-MM-DD'),
    project_id: selectedProject,
    team_id: selectedTeam,
    user_id: selectedUser
  });

  const loadProductivityData = async () => {
    setLoading(true);
    try {
      const data = await advancedQueriesService.getProductivitySummary(getFilterParams());
      setProductivityData(data);
    } catch (error) {
      NotificationService.error('خطا', 'امکان دریافت داده‌های بهره‌وری وجود ندارد');
    }
    setLoading(false);
  };

  const loadProjectAnalytics = async () => {
    setLoading(true);
    try {
      const data = await advancedQueriesService.getProjectAnalytics(getFilterParams());
      setProjectAnalytics(data);
    } catch (error) {
      NotificationService.error('خطا', 'امکان دریافت تحلیل پروژه‌ها وجود ندارد');
    }
    setLoading(false);
  };

  const loadUserPerformance = async () => {
    setLoading(true);
    try {
      const data = await advancedQueriesService.getUserPerformance(getFilterParams());
      setUserPerformance(data);
    } catch (error) {
      NotificationService.error('خطا', 'امکان دریافت عملکرد کاربران وجود ندارد');
    }
    setLoading(false);
  };

  const loadTimeSummary = async () => {
    setLoading(true);
    try {
      const data = await advancedQueriesService.getTimeSummary(getFilterParams());
      setTimeSummary(data);
    } catch (error) {
      NotificationService.error('خطا', 'امکان دریافت خلاصه زمان‌بندی وجود ندارد');
    }
    setLoading(false);
  };

  const exportData = async (type: 'time-logs' | 'tasks' | 'team-performance') => {
    try {
      const params = { ...getFilterParams(), format: 'csv' as const };
      let blob: Blob;
      
      switch (type) {
        case 'time-logs':
          blob = await advancedQueriesService.exportTimeLogs(params);
          break;
        case 'tasks':
          blob = await advancedQueriesService.exportTasksReport(params);
          break;
        case 'team-performance':
          blob = await advancedQueriesService.exportTeamPerformance(params);
          break;
      }
      
      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-report-${dayjs().format('YYYY-MM-DD')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      NotificationService.success('خروجی آماده شد', 'فایل با موفقیت دانلود شد');
    } catch (error) {
      NotificationService.error('خطا', 'امکان دانلود فایل وجود ندارد');
    }
  };

  const refreshCurrentTab = () => {
    switch (activeTab) {
      case 'productivity':
        loadProductivityData();
        break;
      case 'projects':
        loadProjectAnalytics();
        break;
      case 'users':
        loadUserPerformance();
        break;
      case 'time':
        loadTimeSummary();
        break;
    }
  };

  const projectColumns = [
    {
      title: 'پروژه',
      dataIndex: 'project_name',
      key: 'project_name'
    },
    {
      title: 'کل تسک‌ها',
      dataIndex: ['task_summary', 'total'],
      key: 'total_tasks'
    },
    {
      title: 'تسک‌های انجام شده',
      dataIndex: ['task_summary', 'done'],
      key: 'done_tasks',
      render: (done: number, record: ProjectAnalytics) => (
        <div>
          <div>{done}</div>
          <Progress 
            percent={(done / record.task_summary.total) * 100} 
            size="small" 
            showInfo={false}
          />
        </div>
      )
    },
    {
      title: 'مجموع ساعت‌ها',
      dataIndex: ['time_summary', 'total_hours'],
      key: 'total_hours',
      render: (hours: number) => `${hours.toFixed(1)} ساعت`
    },
    {
      title: 'میانگین ساعت/تسک',
      dataIndex: ['time_summary', 'avg_hours_per_task'],
      key: 'avg_hours',
      render: (hours: number) => `${hours.toFixed(1)} ساعت`
    },
    {
      title: 'اعضای فعال',
      dataIndex: ['team_performance', 'active_members'],
      key: 'active_members'
    }
  ];

  const userColumns = [
    {
      title: 'کاربر',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (name: string, record: UserPerformance) => (
        <div>
          <div>{name}</div>
          <Text type="secondary">@{record.username}</Text>
        </div>
      )
    },
    {
      title: 'تسک‌های تکمیل شده',
      dataIndex: ['metrics', 'tasks_completed'],
      key: 'tasks_completed'
    },
    {
      title: 'ساعت‌های ثبت شده',
      dataIndex: ['metrics', 'hours_logged'],
      key: 'hours_logged',
      render: (hours: number) => `${hours.toFixed(1)} ساعت`
    },
    {
      title: 'Story Points',
      dataIndex: ['metrics', 'story_points_completed'],
      key: 'story_points'
    },
    {
      title: 'امتیاز کارایی',
      dataIndex: ['metrics', 'efficiency_score'],
      key: 'efficiency_score',
      render: (score: number) => (
        <Progress 
          percent={score * 100} 
          size="small"
          format={(percent) => `${percent?.toFixed(0)}%`}
        />
      )
    },
    {
      title: 'میانگین زمان تکمیل',
      dataIndex: ['metrics', 'avg_task_completion_time'],
      key: 'avg_completion_time',
      render: (time: number) => `${time.toFixed(1)} روز`
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2}>
            <BarChartOutlined /> گزارش‌های پیشرفته
          </Title>
        </Col>

        {/* Filters */}
        <Col span={24}>
          <Card title="فیلترها">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8} md={6}>
                <RangePicker
                  placeholder={['از تاریخ', 'تا تاریخ']}
                  style={{ width: '100%' }}
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                />
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="انتخاب پروژه"
                  style={{ width: '100%' }}
                  allowClear
                  value={selectedProject}
                  onChange={setSelectedProject}
                >
                  {projects.map(project => (
                    <Option key={project.id} value={project.id}>
                      {project.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="انتخاب تیم"
                  style={{ width: '100%' }}
                  allowClear
                  value={selectedTeam}
                  onChange={setSelectedTeam}
                >
                  {teams.map(team => (
                    <Option key={team.id} value={team.id}>
                      {team.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="انتخاب کاربر"
                  style={{ width: '100%' }}
                  allowClear
                  value={selectedUser}
                  onChange={setSelectedUser}
                >
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
            <Row style={{ marginTop: 16 }}>
              <Col>
                <Space>
                  <Button type="primary" onClick={refreshCurrentTab}>
                    اعمال فیلتر
                  </Button>
                  <Button onClick={() => {
                    setDateRange(null);
                    setSelectedProject(undefined);
                    setSelectedTeam(undefined);
                    setSelectedUser(undefined);
                  }}>
                    پاک کردن فیلترها
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Reports Tabs */}
        <Col span={24}>
          <Card>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              tabBarExtraContent={
                <Space>
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={() => exportData('time-logs')}
                  >
                    خروجی زمان‌بندی
                  </Button>
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={() => exportData('tasks')}
                  >
                    خروجی تسک‌ها
                  </Button>
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={() => exportData('team-performance')}
                  >
                    خروجی عملکرد تیم
                  </Button>
                </Space>
              }
            >
              <TabPane 
                tab={
                  <span>
                    <TrophyOutlined />
                    بهره‌وری
                  </span>
                } 
                key="productivity"
              >
                <Spin spinning={loading}>
                  {productivityData ? (
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={8}>
                        <Card>
                          <Statistic
                            title="مجموع ساعت‌ها"
                            value={productivityData.metrics?.total_hours || 0}
                            suffix="ساعت"
                            prefix={<ClockCircleOutlined />}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card>
                          <Statistic
                            title="Story Points کل"
                            value={productivityData.metrics?.total_story_points || 0}
                            prefix={<TrophyOutlined />}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card>
                          <Statistic
                            title="سرعت (Velocity)"
                            value={productivityData.metrics?.velocity || 0}
                            precision={2}
                            prefix={<BarChartOutlined />}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card>
                          <Statistic
                            title="کاربران فعال"
                            value={productivityData.metrics?.unique_users || 0}
                            prefix={<UserOutlined />}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card>
                          <Statistic
                            title="پروژه‌های فعال"
                            value={productivityData.metrics?.unique_projects || 0}
                            prefix={<ProjectOutlined />}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card>
                          <Statistic
                            title="راندمان"
                            value={(productivityData.metrics?.efficiency || 0) * 100}
                            precision={1}
                            suffix="%"
                          />
                        </Card>
                      </Col>
                    </Row>
                  ) : (
                    <Alert
                      message="داده‌ای یافت نشد"
                      description="برای مشاهده داده‌های بهره‌وری، فیلترها را تنظیم کرده و دکمه 'اعمال فیلتر' را کلیک کنید."
                      type="info"
                      showIcon
                    />
                  )}
                </Spin>
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <ProjectOutlined />
                    تحلیل پروژه‌ها
                  </span>
                } 
                key="projects"
              >
                <Spin spinning={loading}>
                  <Table
                    columns={projectColumns}
                    dataSource={projectAnalytics}
                    rowKey="project_id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} از ${total} پروژه`
                    }}
                  />
                </Spin>
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <UserOutlined />
                    عملکرد کاربران
                  </span>
                } 
                key="users"
              >
                <Spin spinning={loading}>
                  <Table
                    columns={userColumns}
                    dataSource={userPerformance}
                    rowKey="user_id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} از ${total} کاربر`
                    }}
                  />
                </Spin>
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <ClockCircleOutlined />
                    خلاصه زمان‌بندی
                  </span>
                } 
                key="time"
              >
                <Spin spinning={loading}>
                  {timeSummary ? (
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Card title="مجموع ساعت‌ها">
                          <Statistic
                            title="کل ساعت‌های ثبت شده"
                            value={timeSummary.total_hours || 0}
                            suffix="ساعت"
                          />
                        </Card>
                      </Col>
                      
                      {timeSummary.project_breakdown && (
                        <Col span={24}>
                          <Card title="تقسیم‌بندی بر اساس پروژه">
                            {timeSummary.project_breakdown.map((item: any) => (
                              <Row key={item.project_id} style={{ marginBottom: 8 }}>
                                <Col span={12}>
                                  <Text>{item.project_name}</Text>
                                </Col>
                                <Col span={8}>
                                  <Text>{item.hours.toFixed(1)} ساعت</Text>
                                </Col>
                                <Col span={4}>
                                  <Progress 
                                    percent={(item.hours / timeSummary.total_hours) * 100}
                                    size="small"
                                    showInfo={false}
                                  />
                                </Col>
                              </Row>
                            ))}
                          </Card>
                        </Col>
                      )}
                      
                      {timeSummary.user_breakdown && (
                        <Col span={24}>
                          <Card title="تقسیم‌بندی بر اساس کاربر">
                            {timeSummary.user_breakdown.map((item: any) => (
                              <Row key={item.user_id} style={{ marginBottom: 8 }}>
                                <Col span={12}>
                                  <Text>{item.username}</Text>
                                </Col>
                                <Col span={8}>
                                  <Text>{item.hours.toFixed(1)} ساعت</Text>
                                </Col>
                                <Col span={4}>
                                  <Progress 
                                    percent={(item.hours / timeSummary.total_hours) * 100}
                                    size="small"
                                    showInfo={false}
                                  />
                                </Col>
                              </Row>
                            ))}
                          </Card>
                        </Col>
                      )}
                    </Row>
                  ) : (
                    <Alert
                      message="داده‌ای یافت نشد"
                      description="برای مشاهده خلاصه زمان‌بندی، فیلترها را تنظیم کرده و دکمه 'اعمال فیلتر' را کلیک کنید."
                      type="info"
                      showIcon
                    />
                  )}
                </Spin>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdvancedReports;
