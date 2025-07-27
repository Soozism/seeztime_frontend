import ApiService from './api';
import {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskStatusUpdate,
} from '../types';

class TaskService {
  async getTasks(params?: { skip?: number; limit?: number; assignee_id?: number }): Promise<Task[]> {
    return ApiService.get<Task[]>('/tasks/', params);
  }

  async getTask(id: number): Promise<Task> {
    return ApiService.get<Task>(`/tasks/${id}`);
  }

  async createTask(data: TaskCreate): Promise<Task> {
    return ApiService.post<Task>('/tasks/', data);
  }

  async updateTask(id: number, data: TaskUpdate): Promise<Task> {
    return ApiService.put<Task>(`/tasks/${id}`, data);
  }

  async deleteTask(id: number): Promise<void> {
    return ApiService.delete<void>(`/tasks/${id}`);
  }

  async updateTaskStatus(id: number, status: TaskStatusUpdate): Promise<Task> {
    return ApiService.patch<Task>(`/tasks/${id}/status`, status);
  }

  async getTaskSubtasks(id: number): Promise<Task[]> {
    return ApiService.get<Task[]>(`/tasks/${id}/subtasks`);
  }

  async getProjectTasks(projectId: number): Promise<Task[]> {
    return ApiService.get<Task[]>(`/projects/${projectId}/tasks`);
  }

  async getSprintTasks(sprintId: number): Promise<Task[]> {
    return ApiService.get<Task[]>(`/queries/tasks/by-sprint/${sprintId}`);
  }

  async getUserTasks(userId: number): Promise<Task[]> {
    return ApiService.get<Task[]>(`/queries/tasks/by-user/${userId}`);
  }

  async getTaskTimeLogs(taskId: number): Promise<any[]> {
    return ApiService.get<any[]>(`/time-logs/task/${taskId}`);
  }
}

const taskService = new TaskService();
export default taskService;
