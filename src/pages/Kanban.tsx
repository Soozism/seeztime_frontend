import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, message, Tag, Avatar, Tooltip, Button, Modal, Form, InputNumber, Select } from 'antd';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { UserOutlined, ProjectOutlined, CalendarOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import { Project, Task, TaskStatus, Backlog } from '../types';
import backlogService from '../services/backlogService';
import '../styles/kanban.css';

const { Title } = Typography;

const statusColumns: { id: TaskStatus; title: string; color: string; gradient: string; icon: React.ReactNode }[] = [
  { id: TaskStatus.TODO, title: 'To Do', color: '#E0E0E0', gradient: 'linear-gradient(135deg, #F5F5EB 0%, #E6E6E6 100%)', icon: <ProjectOutlined /> },
  { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: '#BBDEFB', gradient: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)', icon: <CalendarOutlined /> },
  { id: TaskStatus.REVIEW, title: 'Review', color: '#FF6F61', gradient: 'linear-gradient(135deg, #FFE0DB 0%, #FF6F61 100%)', icon: <ExclamationCircleOutlined /> },
  { id: TaskStatus.DONE, title: 'Done', color: '#A5D6A7', gradient: 'linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%)', icon: <UserOutlined /> },
  { id: TaskStatus.BLOCKED, title: 'Blocked', color: '#EF9A9A', gradient: 'linear-gradient(135deg, #FFEBEE 0%, #EF9A9A 100%)', icon: <ExclamationCircleOutlined /> },
];

const Kanban: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [updating, setUpdating] = useState(false);
  const [backlogs, setBacklogs] = useState<{ [projectId: number]: Backlog[] }>({});
  const [convertModal, setConvertModal] = useState<{ visible: boolean; backlog?: Backlog; projectId?: number }>({ visible: false });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projects, tasks] = await Promise.all([
          projectService.getProjects(),
          taskService.getTasks(),
        ]);
        setProjects(projects);
        setTasks(tasks);
        const backlogMap: { [projectId: number]: Backlog[] } = {};
        await Promise.all(
          projects.map(async (project) => {
            try {
              const bls = await backlogService.getBacklogs({ project_id: project.id });
              backlogMap[project.id] = bls;
            } catch {
              backlogMap[project.id] = [];
            }
          })
        );
        setBacklogs(backlogMap);
      } catch (err) {
        message.error('Failed to load Kanban data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTasksByStatus = (projectId: number, status: TaskStatus) =>
    tasks
      .filter((t) => t.project_id === projectId && t.status === status)
      .sort((a, b) => a.id - b.id);

  const getDroppableId = (projectId: number, status: TaskStatus) => `${projectId}-${status}`;

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    const taskId = parseInt(draggableId);
    const [, newStatusStr] = destination.droppableId.split('-');
    const newStatus = newStatusStr as TaskStatus;
    setUpdating(true);
    try {
      await taskService.updateTaskStatus(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      message.success('Task status updated');
    } catch (err) {
      message.error('Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const handleViewTaskDetail = (taskId: number) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="kanban-root">
      <div className="kanban-header">
        <Title level={2} className="kanban-title">Kanban Board</Title>
      </div>
      <Spin spinning={loading || updating}>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-projects">
            {projects.map((project) => (
              <div key={project.id} className="kanban-project">
                <Card
                  bordered={false}
                  className="kanban-card"
                  title={
                    <div className="kanban-project-title">
                      <ProjectOutlined style={{ fontSize: 22, color: '#006D77' }} />
                      <span>{project.name}</span>
                    </div>
                  }
                  extra={
                    <Tooltip title="Project ID">
                      <Tag color="#A8B5A2" style={{ fontWeight: 600, fontSize: 14, borderRadius: 8 }}>#{project.id}</Tag>
                    </Tooltip>
                  }
                >
                  <div className="kanban-columns">
                    <div className="kanban-column backlog-column">
                      <div className="kanban-column-header">
                        <span className="kanban-column-title">Backlog</span>
                        <Tag color="#A8B5A2" className="kanban-column-count">{(backlogs[project.id] || []).length}</Tag>
                      </div>
                      {(backlogs[project.id] || []).length === 0 && (
                        <div className="kanban-no-tasks">No backlogs</div>
                      )}
                      {(backlogs[project.id] || []).map((backlog) => (
                        <div className="kanban-task backlog-task" key={backlog.id}>
                          <div className="kanban-task-header">
                            <span className="kanban-task-title">{backlog.title}</span>
                          </div>
                          <div className="kanban-task-desc">{backlog.description?.slice(0, 80)}</div>
                          <Button size="small" type="primary" style={{ marginTop: 8, background: '#FF6F61', borderColor: '#FF6F61' }} onClick={() => setConvertModal({ visible: true, backlog, projectId: project.id })}>
                            انتقال به وظایف
                          </Button>
                        </div>
                      ))}
                    </div>
                    {statusColumns.map((col) => {
                      const tasksInCol = getTasksByStatus(project.id, col.id);
                      const droppableId = getDroppableId(project.id, col.id);
                      return (
                        <Droppable droppableId={droppableId} key={droppableId}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`kanban-column${snapshot.isDraggingOver ? ' dragging-over' : ''}`}
                              style={{ background: snapshot.isDraggingOver ? col.gradient : 'none' }}
                            >
                              <div className="kanban-column-header" style={{ borderBottomColor: col.color }}>
                                <span className="kanban-column-icon">{col.icon}</span>
                                <span className="kanban-column-title">{col.title}</span>
                                <Tag color={col.color} className="kanban-column-count">{tasksInCol.length}</Tag>
                              </div>
                              {tasksInCol.length === 0 && (
                                <div className="kanban-no-tasks">No tasks</div>
                              )}
                              {tasksInCol.map((task, idx) => (
                                <Draggable draggableId={task.id.toString()} index={idx} key={`draggable-${task.id}`}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`kanban-task${snapshot.isDragging ? ' dragging' : ''}`}
                                      style={{ background: snapshot.isDragging ? col.gradient : 'none' }}
                                    >
                                      <div className="kanban-task-header">
                                        <span className="kanban-task-title">{task.title}</span>
                                        {task.assignee_name && (
                                          <Tooltip title={task.assignee_name}>
                                            <Avatar style={{ backgroundColor: '#FF6F61', verticalAlign: 'middle', fontWeight: 600 }} size={24}>
                                              {task.assignee_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </Avatar>
                                          </Tooltip>
                                        )}
                                      </div>
                                      <div className="kanban-task-desc">{task.description?.slice(0, 80)}</div>
                                      <div className="kanban-task-tags">
                                        <Tag color="#D4A017" className="kanban-task-priority">Priority: {task.priority}</Tag>
                                        {task.due_date && <Tag color="#EF9A9A" className="kanban-task-due"><CalendarOutlined /> {task.due_date}</Tag>}
                                      </div>
                                      <div className="kanban-task-actions">
                                        <Tooltip title="مشاهده جزئیات وظیفه">
                                          <Button
                                            type="text"
                                            size="small"
                                            icon={<EyeOutlined />}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              handleViewTaskDetail(task.id);
                                            }}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            style={{ 
                                              color: '#006D77',
                                              padding: '4px 10px',
                                              height: 'auto',
                                              fontSize: '12px',
                                              borderRadius: '6px',
                                              transition: 'all 0.3s ease',
                                            }}
                                          >
                                            جزئیات
                                          </Button>
                                        </Tooltip>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      );
                    })}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </DragDropContext>
      </Spin>
      <Modal
        open={convertModal.visible}
        title="انتقال به وظایف"
        onCancel={() => setConvertModal({ visible: false })}
        footer={null}
        destroyOnClose
        style={{ top: '20px' }}
        width={400}
      >
        {convertModal.backlog && (
          <ConvertBacklogForm
            backlog={convertModal.backlog}
            projectId={convertModal.projectId!}
            onSuccess={(task) => {
              setConvertModal({ visible: false });
              setBacklogs((prev) => {
                const copy = { ...prev };
                copy[convertModal.projectId!] = (copy[convertModal.projectId!] || []).filter((b) => b.id !== convertModal.backlog!.id);
                return copy;
              });
              setTasks((prev) => [...prev, task]);
              message.success('با موفقیت به وظایف منتقل شد');
            }}
          />
        )}
      </Modal>
    </div>
  );
};

const ConvertBacklogForm: React.FC<{
  backlog: Backlog;
  projectId: number;
  onSuccess: (task: Task) => void;
}> = ({ backlog, projectId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await backlogService.convertToTask(backlog.id, {
        ...values,
        priority: values.priority,
      });
      onSuccess({ ...res.task, status: 'TODO' });
    } catch (err) {
      message.error('خطا در انتقال به وظایف');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ priority: 'MEDIUM' }}>
      <Form.Item label="تخصیص به" name="assignee_id">
        <InputNumber style={{ width: '100%' }} placeholder="ID کاربر" />
      </Form.Item>
      <Form.Item label="اسپرینت" name="sprint_id">
        <InputNumber style={{ width: '100%' }} placeholder="ID اسپرینت (اختیاری)" />
      </Form.Item>
      <Form.Item label="ساعت تخمینی" name="estimated_hours">
        <InputNumber style={{ width: '100%' }} placeholder="ساعت تخمینی" min={0} />
      </Form.Item>
      <Form.Item label="امتیاز داستان" name="story_points">
        <InputNumber style={{ width: '100%' }} placeholder="امتیاز داستان" min={0} />
      </Form.Item>
      <Form.Item label="اولویت" name="priority">
        <Select>
          <Select.Option value="LOW">کم</Select.Option>
          <Select.Option value="MEDIUM">متوسط</Select.Option>
          <Select.Option value="HIGH">زیاد</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block style={{ background: '#FF6F61', borderColor: '#FF6F61', transition: 'all 0.3s ease' }}>
          انتقال
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Kanban;