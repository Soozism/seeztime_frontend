import ApiService from './api';
import {
  VersionResponse,
  VersionCreate,
  VersionUpdate,
} from '../types';

class VersionService {
  async getProjectVersions(projectId: number): Promise<VersionResponse[]> {
    return ApiService.get<VersionResponse[]>(`/versions/project/${projectId}/versions`);
  }

  async getVersion(id: number): Promise<VersionResponse> {
    return ApiService.get<VersionResponse>(`/versions/${id}`);
  }

  async createProjectVersion(projectId: number, data: VersionCreate): Promise<VersionResponse> {
    return ApiService.post<VersionResponse>(`/versions/project/${projectId}/versions`, data);
  }

  async updateVersion(id: number, data: VersionUpdate): Promise<VersionResponse> {
    return ApiService.put<VersionResponse>(`/versions/${id}`, data);
  }

  async releaseVersion(id: number): Promise<VersionResponse> {
    return ApiService.post<VersionResponse>(`/versions/${id}/release`);
  }

  async deleteVersion(id: number): Promise<void> {
    return ApiService.delete<void>(`/versions/${id}`);
  }
}

const versionService = new VersionService();
export default versionService;
