import ApiService from './api';
import { Task, TaskStatus } from '../types';

export interface TeamTaskStats {
  total: number;
  done: number;
}

const teamTaskStatsService = {
  async getTeamTaskStats(teamId: number): Promise<TeamTaskStats> {
    // Assumes backend supports this endpoint, otherwise fetch all tasks and filter by team members
    return ApiService.get<TeamTaskStats>(`/teams/${teamId}/task-stats`);
  },

  // Fallback: fetch all tasks and count by team members
  async getTeamTaskStatsByMembers(memberIds: number[]): Promise<TeamTaskStats> {
    if (!memberIds.length) return { total: 0, done: 0 };
    const tasks: Task[] = await ApiService.get<Task[]>('/tasks/', { assignee_ids: memberIds });
    const total = tasks.length;
    const done = tasks.filter(t => t.status === TaskStatus.DONE).length;
    return { total, done };
  },
};

export default teamTaskStatsService;
