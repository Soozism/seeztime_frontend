import ApiService from './api';
import {
  Milestone,
  MilestoneCreate,
  MilestoneUpdate,
} from '../types';

class MilestoneService {
  async getMilestones(params?: { skip?: number; limit?: number; project_id?: number }): Promise<Milestone[]> {
    return ApiService.get<Milestone[]>('/milestones/', params);
  }

  async getMilestone(id: number): Promise<Milestone> {
    return ApiService.get<Milestone>(`/milestones/${id}`);
  }

  async createMilestone(data: MilestoneCreate): Promise<Milestone> {
    console.log('MilestoneService.createMilestone called with data:', data);
    const result = await ApiService.post<Milestone>('/milestones/', data);
    console.log('MilestoneService.createMilestone result:', result);
    return result;
  }

  async updateMilestone(id: number, data: MilestoneUpdate): Promise<Milestone> {
    return ApiService.put<Milestone>(`/milestones/${id}`, data);
  }

  async deleteMilestone(id: number): Promise<void> {
    return ApiService.delete<void>(`/milestones/${id}`);
  }

  async completeMilestone(id: number): Promise<Milestone> {
    return ApiService.post<Milestone>(`/milestones/${id}/complete`);
  }

  async reopenMilestone(id: number): Promise<Milestone> {
    return ApiService.post<Milestone>(`/milestones/${id}/reopen`);
  }

  async getProjectMilestones(projectId: number): Promise<Milestone[]> {
    return ApiService.get<Milestone[]>(`/queries/milestones/by-project/${projectId}`);
  }

  async getSprintMilestones(sprintId: number): Promise<Milestone[]> {
    return ApiService.get<Milestone[]>(`/queries/milestones/by-sprint/${sprintId}`);
  }
}

const milestoneService = new MilestoneService();
export default milestoneService;
