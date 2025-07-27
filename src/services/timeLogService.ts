import ApiService from './api';
import {
  TimeLog,
  TimeLogCreate,
  TimeLogUpdate,
  TimeLogFilters,
  TimeLogReport,
} from '../types';

interface TimeLogQueryParams {
  skip?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  task_id?: number;
  user_id?: number;
  project_id?: number;
}

interface TimeSummary {
  total_hours: number;
  start_date?: string;
  end_date?: string;
}

interface UserTimeSummary extends TimeSummary {
  user_id: number;
}

interface ProjectTimeSummary extends TimeSummary {
  project_id: number;
}

interface SprintTimeSummary extends TimeSummary {
  sprint_id: number;
}

class TimeLogService {
  // Enhanced main time logs endpoint with time filtering
  async getTimeLogs(params?: TimeLogQueryParams): Promise<TimeLog[]> {
    return ApiService.get<TimeLog[]>('/time-logs/', params);
  }

  async getTimeLog(id: number): Promise<TimeLog> {
    return ApiService.get<TimeLog>(`/time-logs/${id}`);
  }

  async createTimeLog(data: TimeLogCreate): Promise<TimeLog> {
    return ApiService.post<TimeLog>('/time-logs/', data);
  }

  async updateTimeLog(id: number, data: TimeLogUpdate): Promise<TimeLog> {
    return ApiService.put<TimeLog>(`/time-logs/${id}`, data);
  }

  async deleteTimeLog(id: number): Promise<void> {
    return ApiService.delete<void>(`/time-logs/${id}`);
  }

  // Advanced Query APIs - Task-related
  async getTimeLogsByTask(taskId: number, params?: {
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
  }): Promise<TimeLog[]> {
    // مسیر جدید طبق مستندات
    return ApiService.get<TimeLog[]>(`/time-logs/task/${taskId}`, params);
  }

  async getTimeLogsBySprint(sprintId: number, params?: {
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
  }): Promise<TimeLog[]> {
    return ApiService.get<TimeLog[]>(`/queries/time-logs/by-sprint/${sprintId}`, params);
  }

  async getTimeLogsByProject(projectId: number, params?: {
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
  }): Promise<TimeLog[]> {
    return ApiService.get<TimeLog[]>(`/queries/time-logs/by-project/${projectId}`, params);
  }

  // Advanced Query APIs - User-related
  async getTimeLogsByUser(userId: number, params?: {
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
  }): Promise<TimeLog[]> {
    return ApiService.get<TimeLog[]>(`/queries/time-logs/by-user/${userId}`, params);
  }

  // Summary/Aggregation APIs
  async getUserTimeSummary(userId: number, params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<UserTimeSummary> {
    return ApiService.get<UserTimeSummary>(`/queries/summary/user/${userId}/time-logs`, params);
  }

  async getProjectTimeSummary(projectId: number, params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ProjectTimeSummary> {
    return ApiService.get<ProjectTimeSummary>(`/queries/summary/project/${projectId}/time-logs`, params);
  }

  async getSprintTimeSummary(sprintId: number, params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<SprintTimeSummary> {
    return ApiService.get<SprintTimeSummary>(`/queries/summary/sprint/${sprintId}/time-logs`, params);
  }

  // Export functionality
  async exportTimeLogs(params?: {
    format?: 'csv' | 'json';
    start_date?: string;
    end_date?: string;
    user_id?: number;
    project_id?: number;
    task_id?: number;
  }): Promise<Blob> {
    const response = await ApiService.getBlob('/advanced-reports/export/time-logs', params);
    return response;
  }

  // Legacy methods for backward compatibility
  async getTaskTimeLogs(taskId: number): Promise<TimeLog[]> {
    return this.getTimeLogsByTask(taskId);
  }

  async getMyTimeLogs(params?: { skip?: number; limit?: number }): Promise<TimeLog[]> {
    return ApiService.get<TimeLog[]>('/time-logs/user/me', params);
  }

  // Timer functionality
  async logTime(params: {
    task_id: number;
    duration_minutes: number;
    description?: string;
    is_manual?: boolean;
    log_date?: string;
  }): Promise<TimeLog> {
    // طبق مستندات جدید - استفاده از query parameters بجای body
    return ApiService.post<TimeLog>(`/time-logs/log-time`, null, { params });
  }

  async startTimer(taskId: number): Promise<any> {
    // ارسال task_id به صورت query string
    return ApiService.post<any>(`/time-logs/start-timer?task_id=${taskId}`);
  }

  async stopTimer(data?: { timer_id?: number; description?: string }): Promise<any> {
    // طبق مستندات جدید
    return ApiService.post<any>('/time-logs/stop-timer', data || {});
  }

  async getActiveTimer(): Promise<any> {
    // طبق مستندات جدید
    return ApiService.get<any>('/time-logs/active-timer');
  }
}

const timeLogService = new TimeLogService();
export default timeLogService;



