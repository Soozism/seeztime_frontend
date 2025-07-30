import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Avatar,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Tooltip,
} from 'antd';
import {
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import { Team, TeamCreate, User, Project } from '../types';
import TeamService from '../services/teamService';
import UserService from '../services/userService';
import ProjectService from '../services/projectService';
import teamTaskStatsService, { TeamTaskStats } from '../services/teamTaskStatsService';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;
const { Option } = Select;

const Teams: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrPM = user?.role === 'admin' || user?.role === 'project_manager';
  const isDeveloper = user?.role === 'developer';

  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [form] = Form.useForm();
  const [teamTaskStats, setTeamTaskStats] = useState<Record<number, TeamTaskStats>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsData, usersData, projectsData] = await Promise.all([
        TeamService.getTeams(),
        UserService.getUsers(),
        ProjectService.getProjects(),
      ]);
      setTeams(teamsData);
      setUsers(usersData);
      setProjects(projectsData);

      // Fetch task stats for each team (by member ids)
      const stats: Record<number, TeamTaskStats> = {};
      await Promise.all(
        teamsData.map(async (team) => {
          const memberIds = team.members?.map((m) => m.id) || [];
          if (memberIds.length) {
            try {
              stats[team.id] = await teamTaskStatsService.getTeamTaskStatsByMembers(memberIds);
            } catch {
              stats[team.id] = { total: 0, done: 0 };
            }
          } else {
            stats[team.id] = { total: 0, done: 0 };
          }
        })
      );
      setTeamTaskStats(stats);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const teamData: TeamCreate = {
        name: values.name,
        description: values.description,
        team_leader_id: values.team_leader_id,
        member_ids: values.member_ids || [],
        project_ids: values.project_ids || [], // Add project_ids for create
      };

      if (editingTeam) {
        // For updates, you can use the enhanced API operations:
        // - project_ids: Complete replacement of projects
        // - add_project_ids: Add specific projects  
        // - remove_project_ids: Remove specific projects
        // - add_member_ids: Add specific members
        // - remove_member_ids: Remove specific members
        await TeamService.updateTeam(editingTeam.id, teamData);
        message.success('تیم با موفقیت به‌روزرسانی شد');
      } else {
        await TeamService.createTeam(teamData);
        message.success('تیم جدید با موفقیت ایجاد شد');
      }

      setModalVisible(false);
      setEditingTeam(null);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error('Error creating/updating team:', error);
      message.error('خطا در ایجاد/به‌روزرسانی تیم');
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    form.setFieldsValue({
      name: team.name,
      description: team.description,
      team_leader_id: team.team_leader?.id,
      member_ids: team.members?.map(member => member.id) || [],
      project_ids: [], // Cannot get project list from API, only project_count
    });
    setModalVisible(true);
  };

  const handleDelete = async (teamId: number) => {
    try {
      await TeamService.deleteTeam(teamId);
      message.success('تیم با موفقیت حذف شد');
      fetchData();
    } catch (error) {
      console.error('Error deleting team:', error);
      message.error('خطا در حذف تیم');
    }
  };

  // Team card component with detailed reports
  const renderTeamCard = (team: Team) => {
    const teamMemberCount = team.members?.length || 0;
    const teamProjectCount = (team as any).project_count || 0;

    // Team performance: done/total tasks
    const stats = teamTaskStats[team.id] || { total: 0, done: 0 };
    const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={team.id}>
        <Card
          size="small"
          hoverable
          actions={[
            <Tooltip title="ویرایش تیم">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(team)}
              />
            </Tooltip>,
            <Popconfirm
              title="آیا از حذف این تیم اطمینان دارید؟"
              onConfirm={() => handleDelete(team.id)}
              okText="بله"
              cancelText="خیر"
            >
              <Tooltip title="حذف تیم">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                />
              </Tooltip>
            </Popconfirm>
          ]}
        >
          <div style={{ minHeight: '220px' }}>
            {/* Team Header */}
            <div style={{ marginBottom: '12px', textAlign: 'center' }}>
              <Avatar size={48} icon={<TeamOutlined />} style={{ marginBottom: '8px' }} />
              <Typography.Title level={5} style={{ margin: 0 }} ellipsis>
                {team.name}
              </Typography.Title>
            </div>

            {/* Team Description */}
            <div style={{ marginBottom: '12px', minHeight: '40px' }}>
              <Typography.Text 
                type="secondary" 
                style={{ fontSize: '12px', display: 'block', textAlign: 'center' }}
              >
                {team.description 
                  ? (team.description.length > 60 
                      ? `${team.description.substring(0, 60)}...` 
                      : team.description)
                  : 'توضیحی ندارد'
                }
              </Typography.Text>
            </div>

            {/* Team Leader */}
            <div style={{ marginBottom: '12px', textAlign: 'center' }}>
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <Typography.Text style={{ fontSize: '12px' }}>
                  <strong>سرپرست:</strong> {team.team_leader?.first_name || 'نامشخص'} {team.team_leader?.last_name || ''}
                </Typography.Text>
              </Space>
            </div>

            {/* Team Stats */}
            <div style={{ marginBottom: '12px' }}>
              <Row gutter={8}>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f0f2f5', borderRadius: '4px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                      {teamMemberCount}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>اعضا</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f0f2f5', borderRadius: '4px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                      {teamProjectCount}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>پروژه</div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Projects Count Display */}
            {teamProjectCount > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <Typography.Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  پروژه‌ها:
                </Typography.Text>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  <Tag color="blue" style={{ marginBottom: '2px', fontSize: '10px' }}>
                    {teamProjectCount} پروژه تخصیص داده شده
                  </Tag>
                </div>
              </div>
            )}

            {/* Performance Progress */}
            <div style={{ marginBottom: '8px' }}>
              <Typography.Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                عملکرد تیم:
              </Typography.Text>
              <Progress
                percent={completionRate}
                size="small"
                strokeColor={completionRate >= 70 ? '#52c41a' : completionRate >= 40 ? '#faad14' : '#ff4d4f'}
                format={() => `${stats.done} از ${stats.total} انجام شده`}
              />
            </div>

            {/* Creation Date */}
            <div style={{ textAlign: 'center', marginTop: 'auto' }}>
              <Typography.Text type="secondary" style={{ fontSize: '10px' }}>
                ایجاد شده در {new Date(team.created_at).toLocaleDateString('fa-IR')}
              </Typography.Text>
            </div>
          </div>
        </Card>
      </Col>
    );
  };

  const stats = {
    totalTeams: teams.length,
    totalMembers: teams.reduce((sum, team) => sum + (team.members?.length || 0), 0),
    totalProjects: teams.reduce((sum, team) => sum + ((team as any).project_count || 0), 0),
    averageTeamSize: teams.length > 0 ? Math.round(teams.reduce((sum, team) => sum + (team.members?.length || 0), 0) / teams.length) : 0,
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <TeamOutlined style={{ marginLeft: 8 }} />
          مدیریت تیم‌ها
        </Title>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="تعداد تیم‌ها"
              value={stats.totalTeams}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کل اعضا"
              value={stats.totalMembers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="کل پروژه‌ها"
              value={stats.totalProjects}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="میانگین سایز تیم"
              value={stats.averageTeamSize}
              suffix="نفر"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <TeamOutlined />
            <span>تیم‌ها</span>
          </Space>
        }
        extra={
          isAdminOrPM && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              تیم جدید
            </Button>
          )
        }
      >
        {/* Teams Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Typography.Text>در حال بارگذاری...</Typography.Text>
          </div>
        ) : teams.length > 0 ? (
          <Row gutter={[16, 16]}>
            {teams.map(team => renderTeamCard(team))}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <TeamOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
            <Typography.Text type="secondary">تیمی یافت نشد</Typography.Text>
          </div>
        )}
      </Card>

      <Modal
        title={editingTeam ? 'ویرایش تیم' : 'ایجاد تیم جدید'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTeam(null);
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
            name="name"
            label="نام تیم"
            rules={[{ required: true, message: 'نام تیم الزامی است' }]}
          >
            <Input placeholder="نام تیم را وارد کنید" />
          </Form.Item>

          <Form.Item
            name="description"
            label="توضیحات"
            rules={[{ required: true, message: 'توضیحات الزامی است' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="توضیحات تیم را وارد کنید"
            />
          </Form.Item>

          <Form.Item
            name="team_leader_id"
            label="سرپرست تیم"
            rules={[{ required: true, message: 'انتخاب سرپرست الزامی است' }]}
          >
            <Select
              placeholder="سرپرست تیم را انتخاب کنید"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.username})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="member_ids"
            label="اعضای تیم"
            help="اعضای تیم را انتخاب کنید (اختیاری)"
          >
            <Select
              mode="multiple"
              placeholder="اعضای تیم را انتخاب کنید"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.username})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="project_ids"
            label="پروژه‌های تیم"
            help="پروژه‌هایی که این تیم روی آن‌ها کار خواهد کرد"
          >
            <Select
              mode="multiple"
              placeholder="پروژه‌های تیم را انتخاب کنید"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {projects.map((project) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                انصراف
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTeam ? 'به‌روزرسانی' : 'ایجاد'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Teams;

// Teams.tsx
// Use useAuth() for user info
// const { user } = useAuth();
