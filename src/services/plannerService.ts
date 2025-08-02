import apiService from './api';
import {
  PlannerEvent,
  PlannerEventCreate,
  PlannerEventUpdate,
  PlannerTodo,
  PlannerTodoCreate,
  PlannerTodoUpdate,
  EventFilters,
  TodoFilters,
} from '../types';

class PlannerService {
  // Event methods
  async getEvents(filters?: EventFilters): Promise<PlannerEvent[]> {
    return apiService.get<PlannerEvent[]>('/planner/events', filters);
  }

  async createEvent(event: PlannerEventCreate): Promise<PlannerEvent> {
    return apiService.post<PlannerEvent>('/planner/events', event);
  }

  async updateEvent(eventId: number, event: PlannerEventUpdate): Promise<PlannerEvent> {
    return apiService.put<PlannerEvent>(`/planner/events/${eventId}`, event);
  }

  async deleteEvent(eventId: number): Promise<void> {
    return apiService.delete<void>(`/planner/events/${eventId}`);
  }

  // Todo methods
  async getTodos(filters?: TodoFilters): Promise<PlannerTodo[]> {
    return apiService.get<PlannerTodo[]>('/planner/todos', filters);
  }

  async createTodo(todo: PlannerTodoCreate): Promise<PlannerTodo> {
    return apiService.post<PlannerTodo>('/planner/todos', todo);
  }

  async updateTodo(todoId: number, todo: PlannerTodoUpdate): Promise<PlannerTodo> {
    return apiService.put<PlannerTodo>(`/planner/todos/${todoId}`, todo);
  }

  async deleteTodo(todoId: number): Promise<void> {
    return apiService.delete<void>(`/planner/todos/${todoId}`);
  }

  async toggleTodoComplete(todoId: number, isCompleted: boolean): Promise<PlannerTodo> {
    return this.updateTodo(todoId, { is_completed: isCompleted });
  }
}

const plannerService = new PlannerService();
export default plannerService;
