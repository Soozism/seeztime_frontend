import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { notification } from 'antd';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://185.105.187.118:8000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        // Try both possible token keys for backward compatibility
        const token = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          notification.error({
            message: 'جلسه شما منقضی شده است',
            description: 'لطفاً دوباره وارد شوید',
          });
        } else if (error.response?.status === 403) {
          notification.error({
            message: 'دسترسی مجاز نیست',
            description: 'شما مجاز به انجام این عمل نیستید',
          });
        } else if (error.response?.status >= 500) {
          notification.error({
            message: 'خطای سرور',
            description: 'مشکلی در سرور رخ داده است. لطفاً بعداً تلاش کنید',
          });
        } else if (error.code === 'ECONNABORTED') {
          notification.error({
            message: 'زمان اتصال به پایان رسید',
            description: 'اتصال به سرور طولانی شد. لطفاً مجدداً تلاش کنید',
          });
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    console.log('ApiService.post called with:', { url, data, config });
    const response = await this.api.post(url, data, config);
    console.log('ApiService.post response:', response);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.patch(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete(url);
    return response.data;
  }

  // Form data for OAuth2 login
  async postForm<T>(url: string, data: FormData): Promise<T> {
    const response = await this.api.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  }

  // File download method
  async downloadFile(url: string, filename: string) {
    try {
      const response = await this.api.get(url, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      notification.success({
        message: 'فایل با موفقیت دانلود شد',
      });
    } catch (error) {
      notification.error({
        message: 'خطا در دانلود فایل',
        description: 'مشکلی در دانلود فایل رخ داده است',
      });
      throw error;
    }
  }

  // Get blob for export functionality
  async getBlob(url: string, params?: any): Promise<Blob> {
    const response = await this.api.get(url, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;
