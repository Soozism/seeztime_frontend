import ApiService from './api';
import {
  Team,
  TeamCreate,
  TeamUpdate,
  TeamMemberAdd,
  TeamProjectAssign,
} from '../types';

class TeamService {
  async getTeams(params?: {
    skip?: number;
    limit?: number;
    project_id?: number | null;
    include_members?: boolean;
  }): Promise<Team[]> {
    return ApiService.get<Team[]>('/teams/', params);
  }

  async getTeam(id: number, include_members = true): Promise<Team> {
    return ApiService.get<Team>(`/teams/${id}`, { include_members });
  }

  async createTeam(data: TeamCreate): Promise<Team> {
    return ApiService.post<Team>('/teams/', data);
  }

  async updateTeam(id: number, data: TeamUpdate): Promise<Team> {
    return ApiService.put<Team>(`/teams/${id}`, data);
  }

  async deleteTeam(id: number): Promise<void> {
    return ApiService.delete<void>(`/teams/${id}`);
  }

  async addTeamMembers(teamId: number, data: TeamMemberAdd): Promise<Team> {
    return ApiService.post<Team>(`/teams/${teamId}/members`, data);
  }

  async removeTeamMember(teamId: number, userId: number): Promise<void> {
    return ApiService.delete<void>(`/teams/${teamId}/members/${userId}`);
  }

  async assignTeamToProjects(teamId: number, data: TeamProjectAssign): Promise<Team> {
    return ApiService.post<Team>(`/teams/${teamId}/projects`, data);
  }

  async removeTeamFromProject(teamId: number, projectId: number): Promise<void> {
    return ApiService.delete<void>(`/teams/${teamId}/projects/${projectId}`);
  }
}

const teamService = new TeamService();
export default teamService;
