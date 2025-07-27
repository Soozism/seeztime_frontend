import ApiService from './api';
import {
  Project,
  ProjectResponse,
  ProjectDetailResponse,
  ProjectCreate,
  ProjectUpdate,
  Task,
  Sprint,
  ProjectFilters,
} from '../types';

class ProjectService {
  async getProjects(params?: { 
    skip?: number; 
    limit?: number; 
    show_closed?: boolean; 
    status?: string; 
    expand?: boolean;
  }): Promise<ProjectResponse[]> {
    return ApiService.get<ProjectResponse[]>('/projects/', params);
  }

  async getProject(id: number, params?: {
    expand?: boolean;
    include_details?: boolean;
    include_users?: boolean;
  }): Promise<ProjectDetailResponse> {
    return ApiService.get<ProjectDetailResponse>(`/projects/${id}`, params);
  }

  async createProject(data: ProjectCreate): Promise<Project> {
    return ApiService.post<Project>('/projects/', data);
  }

  async updateProject(id: number, data: ProjectUpdate): Promise<Project> {
    return ApiService.put<Project>(`/projects/${id}`, data);
  }

  async deleteProject(id: number): Promise<void> {
    return ApiService.delete<void>(`/projects/${id}`);
  }

  async closeProject(id: number): Promise<void> {
    return ApiService.patch<void>(`/projects/${id}/close`);
  }

  async reopenProject(id: number): Promise<void> {
    return ApiService.patch<void>(`/projects/${id}/reopen`);
  }

  async getProjectTasks(id: number, params?: { skip?: number; limit?: number }): Promise<any> {
    return ApiService.get<any>(`/projects/${id}/tasks`, params);
  }

  async getProjectSprints(id: number, params?: { skip?: number; limit?: number }): Promise<any> {
    return ApiService.get<any>(`/projects/${id}/sprints`, params);
  }
}

const projectService = new ProjectService();
export default projectService;
