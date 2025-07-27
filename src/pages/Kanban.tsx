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
  { id: TaskStatus.TODO, title: 'To Do', color: '#bdbdbd', gradient: 'linear-gradient(135deg, #ece9f7 0%, #f5f7fa 100%)', icon: <ProjectOutlined /> },
  { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: '#1976d2', gradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', icon: <CalendarOutlined /> },
  { id: TaskStatus.REVIEW, title: 'Review', color: '#ffb300', gradient: 'linear-gradient(135deg, #fffbe7 0%, #ffe082 100%)', icon: <ExclamationCircleOutlined /> },
  { id: TaskStatus.DONE, title: 'Done', color: '#43a047', gradient: 'linear-gradient(135deg, #e8f5e9 0%, #b9f6ca 100%)', icon: <UserOutlined /> },
  { id: TaskStatus.BLOCKED, title: 'Blocked', color: '#d32f2f', gradient: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)', icon: <ExclamationCircleOutlined /> },
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
        // Fetch backlogs for each project
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

  // Group tasks by status for a project
  // مهم: آرایه مرتب شده را بر اساس id بازگردانید تا ترتیب index همیشه ثابت باشد
  const getTasksByStatus = (projectId: number, status: TaskStatus) =>
    tasks
      .filter((t) => t.project_id === projectId && t.status === status)
      .sort((a, b) => a.id - b.id);

  // Helper to build unique droppableId
  const getDroppableId = (projectId: number, status: TaskStatus) => `${projectId}-${status}`;

  // Drag and drop handler
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
    // destination.droppableId is now in the form "projectId-status"
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

  // Navigate to task detail
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
                      <ProjectOutlined style={{ fontSize: 22, color: '#1890ff' }} />
                      <span>{project.name}</span>
                    </div>
                  }
                  extra={
                    <Tooltip title="Project ID">
                      <Tag color="#434343" style={{ fontWeight: 600, fontSize: 14, borderRadius: 8 }}>#{project.id}</Tag>
                    </Tooltip>
                  }
                >
                  <div className="kanban-columns">
                    {/* Backlog column */}
                    <div className="kanban-column backlog-column">
                      <div className="kanban-column-header">
                        <span className="kanban-column-title">Backlog</span>
                        <Tag color="#888" className="kanban-column-count">{(backlogs[project.id] || []).length}</Tag>
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
                          <Button size="small" type="primary" style={{ marginTop: 8 }} onClick={() => setConvertModal({ visible: true, backlog, projectId: project.id })}>
                            انتقال به وظایف
                          </Button>
                        </div>
                      ))}
                    </div>
                    {/* Kanban columns (with drag and drop) */}
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
                            >
                              <div className="kanban-column-header">
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
                                    >
                                      <div className="kanban-task-header">
                                        <span className="kanban-task-title">{task.title}</span>
                                        {task.assignee_name && (
                                          <Tooltip title={task.assignee_name}>
                                            <Avatar style={{ backgroundColor: '#1890ff', verticalAlign: 'middle', fontWeight: 600 }} size={24}>
                                              {task.assignee_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </Avatar>
                                          </Tooltip>
                                        )}
                                      </div>
                                      <div className="kanban-task-desc">{task.description?.slice(0, 80)}</div>
                                      <div className="kanban-task-tags">
                                        <Tag color="#7c4dff" className="kanban-task-priority">Priority: {task.priority}</Tag>
                                        {task.due_date && <Tag color="#d32f2f" className="kanban-task-due"><CalendarOutlined /> {task.due_date}</Tag>}
                                      </div>
                                      {/* Task Detail Button */}
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
                                            onMouseDown={(e) => {
                                              e.stopPropagation();
                                            }}
                                            style={{ 
                                              color: '#1890ff',
                                              padding: '4px 8px',
                                              height: 'auto',
                                              fontSize: '12px',
                                              borderRadius: '6px'
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
      {/* Convert Backlog Modal */}
      <Modal
        open={convertModal.visible}
        title="انتقال به وظایف"
        onCancel={() => setConvertModal({ visible: false })}
        footer={null}
        destroyOnClose
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

// Form component for converting backlog to task
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
        <Button type="primary" htmlType="submit" loading={loading} block>
          انتقال
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Kanban;
