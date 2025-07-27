import ApiService from './api';
import {
  Sprint,
  SprintCreate,
  SprintUpdate,
  Task,
} from '../types';

class SprintService {
  async getSprints(params?: { skip?: number; limit?: number; project_id?: number }): Promise<Sprint[]> {
    return ApiService.get<Sprint[]>('/sprints/', params);
  }

  async getSprint(id: number): Promise<Sprint> {
    return ApiService.get<Sprint>(`/sprints/${id}`);
  }

  async createSprint(data: SprintCreate): Promise<Sprint> {
    return ApiService.post<Sprint>('/sprints/', data);
  }

  async updateSprint(id: number, data: SprintUpdate): Promise<Sprint> {
    return ApiService.put<Sprint>(`/sprints/${id}`, data);
  }

  async deleteSprint(id: number): Promise<void> {
    return ApiService.delete<void>(`/sprints/${id}`);
  }

  async startSprint(id: number): Promise<Sprint> {
    return ApiService.post<Sprint>(`/sprints/${id}/start`);
  }

  async closeSprint(id: number): Promise<Sprint> {
    return ApiService.post<Sprint>(`/sprints/${id}/close`);
  }

  async getSprintStatistics(id: number): Promise<any> {
    return ApiService.get<any>(`/sprints/${id}/statistics`);
  }

  async getSprintTasks(id: number): Promise<Task[]> {
    return ApiService.get<Task[]>(`/sprints/${id}/tasks`);
  }

  async addTasksToSprint(sprintId: number, taskIds: number[]): Promise<any> {
    return ApiService.post<any>(`/sprints/${sprintId}/tasks/bulk`, { task_ids: taskIds });
  }

  async removeTaskFromSprint(sprintId: number, taskId: number): Promise<void> {
    return ApiService.delete<void>(`/sprints/${sprintId}/tasks/${taskId}`);
  }

  async getProjectSprints(projectId: number): Promise<Sprint[]> {
    return ApiService.get<Sprint[]>(`/projects/${projectId}/sprints`);
  }

  async getUserSprints(userId: number): Promise<Sprint[]> {
    return ApiService.get<Sprint[]>(`/queries/sprints/by-user/${userId}`);
  }
}

const sprintService = new SprintService();
export default sprintService;
