import ApiService from './api';
import {
  Backlog,
  BacklogCreate,
  BacklogUpdate,
} from '../types';

class BacklogService {
  async getBacklogs(params?: { project_id?: number; skip?: number; limit?: number }): Promise<Backlog[]> {
    return ApiService.get<Backlog[]>('/backlogs/', params);
  }

  async getBacklog(id: number): Promise<Backlog> {
    return ApiService.get<Backlog>(`/backlogs/${id}`);
  }

  async createBacklog(data: BacklogCreate): Promise<Backlog> {
    return ApiService.post<Backlog>('/backlogs/', data);
  }

  async updateBacklog(id: number, data: BacklogUpdate): Promise<Backlog> {
    return ApiService.put<Backlog>(`/backlogs/${id}`, data);
  }

  async deleteBacklog(id: number): Promise<void> {
    return ApiService.delete<void>(`/backlogs/${id}`);
  }

  async convertToTask(id: number, data?: any): Promise<any> {
    return ApiService.post<any>(`/backlogs/${id}/convert-to-task`, data);
  }
}

const backlogService = new BacklogService();
export default backlogService;
