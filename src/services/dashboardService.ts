import ApiService from './api';

interface ProductivitySummaryParams {
  start_date?: string;
  end_date?: string;
  user_id?: number;
  project_id?: number;
}

interface TeamStatsData {
  active_tasks: number;
  completed_tasks: number;
  total_hours: number;
  performance_score: number;
  team_members: number;
}

interface ProductivitySummary {
  daily_summary: Array<{
    date: string;
    tasks_completed: number;
    hours_logged: number;
    story_points: number;
  }>;
  weekly_summary: Array<{
    week: string;
    tasks_completed: number;
    hours_logged: number;
    story_points: number;
  }>;
  monthly_summary: Array<{
    month: string;
    tasks_completed: number;
    hours_logged: number;
    story_points: number;
  }>;
}

class DashboardService {
  async getDashboardData(): Promise<any> {
    return ApiService.get<any>('/dashboard/dashboard');
  }

  async getKanbanBoard(projectId: number): Promise<any> {
    return ApiService.get<any>(`/dashboard/kanban/${projectId}`);
  }

  async getProjectReport(projectId: number): Promise<any> {
    return ApiService.get<any>(`/dashboard/reports/project/${projectId}`);
  }

  // Advanced Dashboard APIs
  async getTeamStats(teamId: number, params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<TeamStatsData> {
    return ApiService.get<TeamStatsData>(`/dashboard/team-stats/${teamId}`, params);
  }

  async getUserStats(userId: number, params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<any> {
    return ApiService.get<any>(`/dashboard/user-stats/${userId}`, params);
  }

  async getProductivitySummary(params?: ProductivitySummaryParams): Promise<ProductivitySummary> {
    return ApiService.get<ProductivitySummary>('/advanced-reports/productivity-summary', params);
  }

  async getTimeLogsReport(params?: {
    start_date?: string;
    end_date?: string;
    user_id?: number;
    project_id?: number;
    format?: 'json' | 'csv';
  }): Promise<any> {
    return ApiService.get<any>('/advanced-reports/time-logs', params);
  }

  async getTasksReport(params?: {
    start_date?: string;
    end_date?: string;
    user_id?: number;
    project_id?: number;
    status?: string;
    format?: 'json' | 'csv';
  }): Promise<any> {
    return ApiService.get<any>('/advanced-reports/tasks', params);
  }

  async getPerformanceMetrics(params?: {
    start_date?: string;
    end_date?: string;
    team_id?: number;
    user_id?: number;
  }): Promise<any> {
    return ApiService.get<any>('/advanced-reports/performance-metrics', params);
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
