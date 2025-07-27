import ApiService from './api';

export interface TaskDependency {
  id: number;
  task_id: number;
  depends_on_task_id: number;
  dependency_type: string;
  created_at: string;
  depends_on_task: {
    id: number;
    title: string;
    status: string;
  };
}

export interface TaskDependencyCreate {
  depends_on_task_id: number;
  dependency_type: string;
}

class DependencyService {
  async getTaskDependencies(taskId: number): Promise<TaskDependency[]> {
    return ApiService.get<TaskDependency[]>(`/task-dependencies/task/${taskId}/dependencies`);
  }

  async createTaskDependency(taskId: number, data: TaskDependencyCreate): Promise<TaskDependency> {
    return ApiService.post<TaskDependency>(`/task-dependencies/task/${taskId}/dependencies`, data);
  }

  async deleteTaskDependency(dependencyId: number): Promise<void> {
    return ApiService.delete<void>(`/task-dependencies/${dependencyId}`);
  }
}

const dependencyService = new DependencyService();
export default dependencyService;
