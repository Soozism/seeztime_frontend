import ApiService from './api';
import {
  User,
  UserCreate,
  UserUpdate,
  PasswordChangeRequest,
} from '../types';

class UserService {
  async getUsers(params?: { skip?: number; limit?: number }): Promise<User[]> {
    return ApiService.get<User[]>('/users/', params);
  }

  async getUser(id: number): Promise<User> {
    return ApiService.get<User>(`/users/${id}`);
  }

  async createUser(data: UserCreate): Promise<User> {
    return ApiService.post<User>('/users/', data);
  }

  async updateUser(id: number, data: UserUpdate): Promise<User> {
    return ApiService.put<User>(`/users/${id}`, data);
  }

  async deleteUser(id: number): Promise<void> {
    return ApiService.delete<void>(`/users/${id}`);
  }

  async activateUser(id: number): Promise<User> {
    return ApiService.patch<User>(`/users/${id}`, { is_active: true });
  }

  async deactivateUser(id: number): Promise<User> {
    return ApiService.patch<User>(`/users/${id}`, { is_active: false });
  }

  async resetPassword(id: number, newPassword: string): Promise<void> {
    return ApiService.patch<void>(`/users/${id}`, { password: newPassword });
  }

  async changePassword(data: PasswordChangeRequest): Promise<void> {
    return ApiService.post<void>('/users/change-password', data);
  }
}

const userService = new UserService();
export default userService;
