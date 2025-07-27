import ApiService from './api';
import {
  TimeReportResponse,
  StoryPointsReportResponse,
  TeamReportResponse,
  DashboardReportResponse,
  ReportFilters,
} from '../types';

class ReportService {
  async getTimeReport(params?: {
    project_id?: number | null;
    user_id?: number | null;
    team_id?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    include_details?: boolean;
  }): Promise<TimeReportResponse> {
    return ApiService.get<TimeReportResponse>('/reports/time-logs', params);
  }

  async getStoryPointsReport(params?: {
    project_id?: number | null;
    user_id?: number | null;
    team_id?: number | null;
    start_date?: string | null;
    end_date?: string | null;
  }): Promise<StoryPointsReportResponse> {
    return ApiService.get<StoryPointsReportResponse>('/reports/story-points', params);
  }

  async getTeamReport(params?: {
    team_id?: number | null;
    project_id?: number | null;
    start_date?: string | null;
    end_date?: string | null;
  }): Promise<TeamReportResponse> {
    return ApiService.get<TeamReportResponse>('/reports/teams', params);
  }

  async getDashboardReport(): Promise<DashboardReportResponse> {
    return ApiService.get<DashboardReportResponse>('/reports/dashboard');
  }

  async getProjectReport(projectId: number): Promise<any> {
    return ApiService.get<any>(`/dashboard/reports/project/${projectId}`);
  }

  async getProductivitySummary(params?: {
    period?: string;
    team_id?: number | null;
    project_id?: number | null;
  }): Promise<any> {
    return ApiService.get<any>('/analytics/productivity-summary', params);
  }

  async getBurndownChart(params: {
    project_id: number;
    sprint_id?: number | null;
  }): Promise<any> {
    return ApiService.get<any>('/analytics/burndown-chart', params);
  }

  async getWorkloadAnalysis(params?: {
    period_days?: number;
    team_id?: number | null;
  }): Promise<any> {
    return ApiService.get<any>('/analytics/workload-analysis', params);
  }

  async exportTimeLogs(params?: {
    format?: string;
    project_id?: number | null;
    start_date?: string | null;
    end_date?: string | null;
  }): Promise<any> {
    return ApiService.get<any>('/analytics/export/time-logs', params);
  }
}

const reportService = new ReportService();
export default reportService;
