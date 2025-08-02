import apiService from './api';
import { WorkingHoursCreate, WorkingHoursUpdate, WorkingHoursResponse } from '../types';

class WorkingHoursService {
  async listWorkingHours(params?: {
    user_id?: number;
    active_only?: boolean;
    expand?: boolean;
  }): Promise<WorkingHoursResponse[]> {
    return apiService.get<WorkingHoursResponse[]>('/working-hours/working-hours', params);
  }

  async createWorkingHours(data: WorkingHoursCreate): Promise<WorkingHoursResponse> {
    return apiService.post<WorkingHoursResponse>('/working-hours/working-hours', data);
  }

  async updateWorkingHours(id: number, data: WorkingHoursUpdate): Promise<WorkingHoursResponse> {
    return apiService.put<WorkingHoursResponse>(`/working-hours/working-hours/${id}`, data);
  }

  async deleteWorkingHours(id: number): Promise<void> {
    return apiService.delete<void>(`/working-hours/working-hours/${id}`);
  }

  // Calendar helpers
  async getDailySchedule(params: { user_id: number; start_date: string; end_date: string; }): Promise<any[]> {
    return apiService.get<any[]>(`/working-hours/daily-schedule`, params);
  }

  async getUserWorkSchedule(userId: number, daysAhead = 30): Promise<any> {
    return apiService.get<any>(`/working-hours/users/${userId}/schedule`, { days_ahead: daysAhead });
  }
}

const workingHoursService = new WorkingHoursService();
export default workingHoursService; 