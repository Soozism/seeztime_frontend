import ApiService from './api';
import StorageService from '../utils/storageService';
import {
  UserLogin,
  LoginResponse,
  User,
  UserCreate,
} from '../types';

class AuthService {
  async login(credentials: UserLogin): Promise<LoginResponse> {
    try {
      // Create form data for OAuth2PasswordRequestForm as required by FastAPI
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const response = await ApiService.postForm<{access_token: string; token_type: string}>('/auth/login', formData);
      
      // Store token directly to localStorage to match ApiService expectations
      localStorage.setItem('access_token', response.access_token);
      
      // Get current user info from API
      const user = await this.getCurrentUserFromAPI();
      localStorage.setItem('user', JSON.stringify(user));
      
      // Import dynamically to avoid circular dependency
      const NotificationService = (await import('../utils/notifications')).default;
      NotificationService.success('ورود موفق', `${user.first_name} ${user.last_name} خوش آمدید`);
      
      return {
        access_token: response.access_token,
        token_type: response.token_type,
        user: user,
      };
    } catch (error) {
      // Import dynamically to avoid circular dependency
      const NotificationService = (await import('../utils/notifications')).default;
      NotificationService.error('خطا در ورود', 'نام کاربری یا رمز عبور اشتباه است');
      throw error;
    }
  }

  async getCurrentUserFromAPI(): Promise<User> {
    try {
      return await ApiService.get<User>('/users/me/');
    } catch (error: any) {
      // If unauthorized, clear local storage
      if (error?.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
      throw error;
    }
  }

  async register(userData: UserCreate): Promise<User> {
    try {
      const user = await ApiService.post<User>('/auth/register', userData);
      
      // Show success notification
      const NotificationService = (await import('../utils/notifications')).default;
      NotificationService.success('ثبت نام موفق', 'حساب کاربری شما با موفقیت ایجاد شد');
      
      return user;
    } catch (error: any) {
      // Handle common registration errors
      const NotificationService = (await import('../utils/notifications')).default;
      
      if (error?.response?.status === 409) {
        NotificationService.error('خطا در ثبت نام', 'این نام کاربری یا ایمیل قبلاً ثبت شده است');
      } else if (error?.response?.status === 400) {
        NotificationService.error('خطا در اعتبارسنجی', 'لطفاً اطلاعات وارد شده را بررسی کنید');
      } else {
        NotificationService.error('خطا در ثبت نام', 'مشکلی در ثبت نام رخ داده است');
      }
      
      throw error;
    }
  }

  async logout() {
    try {
      // Get user info before removing from localStorage
      const user = this.getCurrentUser();
      
      // Clear auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Show logout notification
      const NotificationService = (await import('../utils/notifications')).default;
      if (user) {
        NotificationService.info('خروج موفق', `${user.first_name} ${user.last_name} با موفقیت خارج شدید`);
      } else {
        NotificationService.info('خروج موفق', 'با موفقیت خارج شدید');
      }
      
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/login';
    }
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!(this.getToken() && this.getCurrentUser());
  }

  hasRole(requiredRoles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }

  canManageUsers(): boolean {
    return this.hasRole(['admin']);
  }

  canManageProjects(): boolean {
    return this.hasRole(['admin', 'project_manager']);
  }

  canManageTeams(): boolean {
    return this.hasRole(['admin', 'project_manager']);
  }

  canCreateTasks(): boolean {
    return this.hasRole(['admin', 'project_manager', 'team_leader']);
  }

  canCreateSprints(): boolean {
    return this.hasRole(['admin', 'project_manager', 'team_leader']);
  }

  canCreateMilestones(): boolean {
    return this.hasRole(['admin', 'project_manager', 'team_leader']);
  }

  canViewReports(): boolean {
    return this.hasRole(['admin', 'project_manager', 'team_leader']);
  }
  
  /**
   * Get user's full name
   */
  getUserFullName(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    return `${user.first_name} ${user.last_name}`;
  }
  
  /**
   * Get user's display role (Persian)
   */
  getUserRolePersian(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    
    const roleMap: Record<string, string> = {
      'admin': 'مدیر سیستم',
      'project_manager': 'مدیر پروژه',
      'team_leader': 'سرپرست تیم',
      'developer': 'توسعه‌دهنده',
      'tester': 'آزمون‌گر',
      'viewer': 'بازدیدکننده'
    };
    
    return roleMap[user.role] || user.role;
  }
  
  /**
   * Get user's avatar or default avatar if none exists
   */
  getUserAvatar(): string {
    const user = this.getCurrentUser();
    if (!user) return '/assets/default-avatar.png';
    
    // Return user avatar if exists, otherwise generate one based on name
    // if (user.avatar) return user.avatar;
    
    const name = `${user.first_name} ${user.last_name}`;
    
    // This uses a placeholder service, replace with your actual avatar generation
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1890ff&color=fff&size=128&font-size=0.5&length=2&rounded=true&bold=true`;
  }
  
  /**
   * Update current user information in storage
   */
  updateUserInfo(userData: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...userData };
    StorageService.setUser(updatedUser);
  }
}

const authService = new AuthService();
export default authService;
