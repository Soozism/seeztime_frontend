import ApiService from './api';
import {
  BugReport,
  BugReportCreate,
  BugReportUpdate,
  BugReportFilters,
} from '../types';

class BugReportService {
  async getBugReports(params?: { 
    skip?: number; 
    limit?: number; 
    task_id?: number; 
    status?: string;
    project_id?: number; // Added project_id as an optional parameter
  }): Promise<BugReport[]> {
    return ApiService.get<BugReport[]>('/bug-reports/', params);
  }

  async getBugReport(id: number): Promise<BugReport> {
    return ApiService.get<BugReport>(`/bug-reports/${id}`);
  }

  async createBugReport(data: BugReportCreate): Promise<BugReport> {
    return ApiService.post<BugReport>('/bug-reports/', data);
  }

  async updateBugReport(id: number, data: BugReportUpdate): Promise<BugReport> {
    return ApiService.put<BugReport>(`/bug-reports/${id}`, data);
  }

  async deleteBugReport(id: number): Promise<void> {
    return ApiService.delete<void>(`/bug-reports/${id}`);
  }

  async reportProblem(params: {
    task_id: number;
    title: string;
    description: string;
    severity?: string;
    priority?: number;
    steps_to_reproduce?: string;
    expected_behavior?: string;
    actual_behavior?: string;
    add_to_backlog?: boolean;
  }): Promise<BugReport> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return ApiService.post<BugReport>(`/bug-reports/report-problem?${queryParams.toString()}`);
  }

  async reportGeneralProblem(params: {
    project_id: number;
    title: string;
    description: string;
    task_id?: number;
    severity?: string;
    priority?: number;
    steps_to_reproduce?: string;
    expected_behavior?: string;
    actual_behavior?: string;
    add_to_backlog?: boolean;
  }): Promise<BugReport> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return ApiService.post<BugReport>(`/bug-reports/report-general-problem?${queryParams.toString()}`);
  }

  async reportSimpleProblem(params: {
    project_id: number;
    title: string;
    description: string;
    severity?: string;
    priority?: number;
    steps_to_reproduce?: string;
  }): Promise<BugReport> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return ApiService.post<BugReport>(`/bug-reports/report-simple-problem?${queryParams.toString()}`);
  }

  // Add missing methods
  async updateBugStatus(id: number, status: string): Promise<BugReport> {
    return ApiService.put<BugReport>(`/bug-reports/${id}/status`, { status });
  }

  async resolveBugReport(id: number, resolution: string): Promise<BugReport> {
    return ApiService.put<BugReport>(`/bug-reports/${id}/resolve`, { resolution });
  }
}

const bugReportService = new BugReportService();
export default bugReportService;
