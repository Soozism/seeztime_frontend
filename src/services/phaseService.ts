import ApiService from './api';
import {
  Phase,
  PhaseCreate,
  PhaseUpdate,
  Milestone,
} from '../types';

class PhaseService {
  async getPhases(params?: { skip?: number; limit?: number }): Promise<Phase[]> {
    return ApiService.get<Phase[]>('/phases/', params);
  }

  async getPhase(id: number): Promise<Phase> {
    return ApiService.get<Phase>(`/phases/${id}`);
  }

  async createPhase(data: PhaseCreate): Promise<Phase> {
    return ApiService.post<Phase>('/phases/', data);
  }

  async updatePhase(id: number, data: PhaseUpdate): Promise<Phase> {
    return ApiService.put<Phase>(`/phases/${id}`, data);
  }

  async deletePhase(id: number): Promise<void> {
    return ApiService.delete<void>(`/phases/${id}`);
  }

  async getProjectPhases(projectId: number): Promise<Phase[]> {
    return ApiService.get<Phase[]>(`/projects/${projectId}/phases`);
  }

  async getPhaseMilestones(phaseId: number): Promise<Milestone[]> {
    return ApiService.get<Milestone[]>(`/phases/${phaseId}/milestones`);
  }
}

const phaseService = new PhaseService();
export default phaseService; 