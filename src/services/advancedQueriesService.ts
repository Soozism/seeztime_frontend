import ApiService from './api';

export interface AdvancedQueryParams {
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  team_id?: number;
  project_id?: number;
  user_id?: number;
  include_charts?: boolean;
  format?: 'json' | 'csv';
}

export interface ProductivitySummary {
  period: string;
  date_range: {
    start: string;
    end: string;
  };
  metrics: {
    total_hours: number;
    total_story_points: number;
    unique_users: number;
    unique_projects: number;
    velocity: number;
    efficiency: number;
  };
  breakdown: {
    daily_hours: number[];
    daily_story_points: number[];
  };
}

export interface ProjectAnalytics {
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

export interface UserPerformance {
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
  trends: {
    weekly_productivity: number[];
    task_completion_rate: number[];
  };
}

export interface TimeSummary {
  total_hours: number;
  period_breakdown: {
    daily: { date: string; hours: number }[];
    weekly: { week: string; hours: number }[];
    monthly: { month: string; hours: number }[];
  };
  project_breakdown: { project_id: number; project_name: string; hours: number }[];
  user_breakdown: { user_id: number; username: string; hours: number }[];
}

class AdvancedQueriesService {
  // Project Analytics
  async getProjectAnalytics(params?: AdvancedQueryParams): Promise<ProjectAnalytics[]> {
    return ApiService.get<ProjectAnalytics[]>('/advanced-queries/project-analytics', params);
  }

  // User Performance Report
  async getUserPerformance(params?: AdvancedQueryParams): Promise<UserPerformance[]> {
    return ApiService.get<UserPerformance[]>('/advanced-queries/user-performance', params);
  }

  // Time Tracking Summary
  async getTimeSummary(params?: AdvancedQueryParams): Promise<TimeSummary> {
    return ApiService.get<TimeSummary>('/advanced-queries/time-summary', params);
  }

  // Advanced Reports
  async getAdvancedReports(params?: AdvancedQueryParams): Promise<any> {
    return ApiService.get<any>('/reports/advanced', params);
  }

  // Productivity Summary
  async getProductivitySummary(params?: AdvancedQueryParams): Promise<ProductivitySummary> {
    return ApiService.get<ProductivitySummary>('/advanced-reports/productivity-summary', params);
  }

  // Export endpoints
  async exportTimeLogs(params?: AdvancedQueryParams): Promise<Blob> {
    const response = await ApiService.getBlob('/advanced-reports/export/time-logs', params);
    return response;
  }

  async exportTasksReport(params?: AdvancedQueryParams): Promise<Blob> {
    const response = await ApiService.getBlob('/advanced-reports/export/tasks', params);
    return response;
  }

  async exportTeamPerformance(params?: AdvancedQueryParams): Promise<Blob> {
    const response = await ApiService.getBlob('/advanced-reports/export/team-performance', params);
    return response;
  }

  // Query endpoints for specific entities
  async getTasksByUser(userId: number, params?: AdvancedQueryParams): Promise<any[]> {
    return ApiService.get<any[]>(`/queries/tasks/by-user/${userId}`, params);
  }

  async getTasksByProject(projectId: number, params?: AdvancedQueryParams): Promise<any[]> {
    return ApiService.get<any[]>(`/queries/tasks/by-project/${projectId}`, params);
  }

  async getTasksBySprint(sprintId: number, params?: AdvancedQueryParams): Promise<any[]> {
    return ApiService.get<any[]>(`/queries/tasks/by-sprint/${sprintId}`, params);
  }

  async getTimeLogsByTask(taskId: number, params?: AdvancedQueryParams): Promise<any[]> {
    return ApiService.get<any[]>(`/queries/time-logs/by-task/${taskId}`, params);
  }

  async getTimeLogsByUser(userId: number, params?: AdvancedQueryParams): Promise<any[]> {
    return ApiService.get<any[]>(`/queries/time-logs/by-user/${userId}`, params);
  }

  async getTimeLogsByProject(projectId: number, params?: AdvancedQueryParams): Promise<any[]> {
    return ApiService.get<any[]>(`/queries/time-logs/by-project/${projectId}`, params);
  }

  async getTimeLogsBySprint(sprintId: number, params?: AdvancedQueryParams): Promise<any[]> {
    return ApiService.get<any[]>(`/queries/time-logs/by-sprint/${sprintId}`, params);
  }

  // Summary endpoints
  async getProjectTimeSummary(projectId: number, params?: AdvancedQueryParams): Promise<any> {
    return ApiService.get<any>(`/queries/summary/project/${projectId}/time-logs`, params);
  }

  async getUserTimeSummary(userId: number, params?: AdvancedQueryParams): Promise<any> {
    return ApiService.get<any>(`/queries/summary/user/${userId}/time-logs`, params);
  }

  async getSprintTimeSummary(sprintId: number, params?: AdvancedQueryParams): Promise<any> {
    return ApiService.get<any>(`/queries/summary/sprint/${sprintId}/time-logs`, params);
  }

  async getTaskTimeSummary(taskId: number, params?: AdvancedQueryParams): Promise<any> {
    return ApiService.get<any>(`/queries/summary/task/${taskId}/time-logs`, params);
  }
}

const advancedQueriesService = new AdvancedQueriesService();
export default advancedQueriesService;
