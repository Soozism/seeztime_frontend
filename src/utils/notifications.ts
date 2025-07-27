import { notification } from 'antd';

interface NotificationOptions {
  duration?: number;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  className?: string;
}

class NotificationService {
  private defaultOptions: NotificationOptions = {
    duration: 4.5,
    placement: 'topLeft',
    className: 'rtl-notification',
  };

  constructor() {
    // Configure default notification settings
    notification.config({
      placement: 'topLeft',
      duration: 4.5,
      rtl: true,
    });
  }

  success(message: string, description?: string, options?: NotificationOptions) {
    notification.success({
      message,
      description,
      ...this.defaultOptions,
      ...options,
    });
  }

  error(message: string, description?: string, options?: NotificationOptions) {
    notification.error({
      message,
      description,
      duration: 6, // Longer duration for errors
      ...this.defaultOptions,
      ...options,
    });
  }

  warning(message: string, description?: string, options?: NotificationOptions) {
    notification.warning({
      message,
      description,
      ...this.defaultOptions,
      ...options,
    });
  }

  info(message: string, description?: string, options?: NotificationOptions) {
    notification.info({
      message,
      description,
      ...this.defaultOptions,
      ...options,
    });
  }

  // Specialized notifications for common use cases
  saveSuccess(entityName: string = 'مورد') {
    this.success(
      'ذخیره موفق',
      `${entityName} با موفقیت ذخیره شد.`
    );
  }

  updateSuccess(entityName: string = 'مورد') {
    this.success(
      'به‌روزرسانی موفق',
      `${entityName} با موفقیت به‌روزرسانی شد.`
    );
  }

  deleteSuccess(entityName: string = 'مورد') {
    this.success(
      'حذف موفق',
      `${entityName} با موفقیت حذف شد.`
    );
  }

  createSuccess(entityName: string = 'مورد') {
    this.success(
      'ایجاد موفق',
      `${entityName} جدید با موفقیت ایجاد شد.`
    );
  }

  networkError() {
    this.error(
      'خطای شبکه',
      'لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.'
    );
  }

  serverError() {
    this.error(
      'خطای سرور',
      'خطایی در سرور رخ داده است. لطفاً بعداً تلاش کنید.'
    );
  }

  unauthorizedAccess() {
    this.error(
      'دسترسی غیرمجاز',
      'شما مجوز لازم برای انجام این عملیات را ندارید.'
    );
  }

  validationError(message: string = 'اطلاعات وارد شده صحیح نیست') {
    this.warning(
      'خطای اعتبارسنجی',
      message
    );
  }

  loadingComplete(entityName: string = 'اطلاعات') {
    this.success(
      'بارگذاری کامل',
      `${entityName} با موفقیت بارگذاری شد.`
    );
  }

  // Destroy all notifications
  destroy() {
    notification.destroy();
  }

  // Close specific notification
  close(key: string) {
    notification.destroy(key);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;

// Export individual methods for convenience
export const {
  success,
  error,
  warning,
  info,
  saveSuccess,
  updateSuccess,
  deleteSuccess,
  createSuccess,
  networkError,
  serverError,
  unauthorizedAccess,
  validationError,
  loadingComplete,
  destroy,
  close,
} = notificationService;
