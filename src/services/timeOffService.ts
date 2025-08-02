import apiService from './api';
import { TimeOffCreate, TimeOffUpdate, TimeOffResponse } from '../types';

class TimeOffService {
  async listTimeOff(params?: { user_id?: number; status_filter?: string; start_date?: string; end_date?: string; expand?: boolean }): Promise<TimeOffResponse[]> {
    return apiService.get<TimeOffResponse[]>('/time-off/time-off', params);
  }

  async createTimeOff(data: TimeOffCreate): Promise<TimeOffResponse> {
    return apiService.post<TimeOffResponse>('/time-off/time-off', data);
  }

  async updateTimeOff(id: number, data: TimeOffUpdate): Promise<TimeOffResponse> {
    return apiService.put<TimeOffResponse>(`/time-off/time-off/${id}`, data);
  }

  async deleteTimeOff(id: number): Promise<void> {
    return apiService.delete<void>(`/time-off/time-off/${id}`);
  }

  async approveTimeOff(id: number, notes?: string): Promise<void> {
    return apiService.post<void>(`/time-off/time-off/${id}/approve`, undefined, { params: { approval_notes: notes } });
  }

  async rejectTimeOff(id: number, reason: string): Promise<void> {
    return apiService.post<void>(`/time-off/time-off/${id}/reject`, undefined, { params: { rejection_reason: reason } });
  }
}

const timeOffService = new TimeOffService();
export default timeOffService; 