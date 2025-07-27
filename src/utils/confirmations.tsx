import { Modal } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';

interface ConfirmationOptions {
  title?: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  okType?: 'primary' | 'danger' | 'default';
  icon?: React.ReactNode;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  centered?: boolean;
  autoFocusButton?: 'ok' | 'cancel' | null;
}

class ConfirmationService {
  private defaultOptions: ConfirmationOptions = {
    okText: 'تأیید',
    cancelText: 'لغو',
    centered: true,
    autoFocusButton: 'ok',
  };

  confirm(options: ConfirmationOptions) {
    const { confirm } = Modal;
    
    confirm({
      ...this.defaultOptions,
      ...options,
      className: 'rtl-modal',
      direction: 'rtl',
    });
  }

  // Specialized confirmation dialogs
  deleteConfirm(
    entityName: string,
    onConfirm: () => void | Promise<void>,
    additionalMessage?: string
  ) {
    this.confirm({
      title: 'تأیید حذف',
      content: `آیا از حذف ${entityName} اطمینان دارید؟${additionalMessage ? `\n\n${additionalMessage}` : '\n\nاین عملیات قابل برگشت نیست.'}`,
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      okType: 'danger',
      okText: 'حذف',
      onOk: onConfirm,
    });
  }

  saveChangesConfirm(onConfirm: () => void | Promise<void>) {
    this.confirm({
      title: 'ذخیره تغییرات',
      content: 'آیا تغییرات را ذخیره کنید؟',
      icon: <QuestionCircleOutlined style={{ color: '#faad14' }} />,
      okText: 'ذخیره',
      onOk: onConfirm,
    });
  }

  discardChangesConfirm(onConfirm: () => void | Promise<void>) {
    this.confirm({
      title: 'لغو تغییرات',
      content: 'تغییرات ذخیره نشده‌ای دارید. آیا مایل به لغو این تغییرات هستید؟',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      okType: 'danger',
      okText: 'لغو تغییرات',
      onOk: onConfirm,
    });
  }

  statusChangeConfirm(
    action: string,
    entityName: string,
    onConfirm: () => void | Promise<void>
  ) {
    this.confirm({
      title: `تأیید ${action}`,
      content: `آیا مایل به ${action} ${entityName} هستید؟`,
      icon: <QuestionCircleOutlined style={{ color: '#1890ff' }} />,
      onOk: onConfirm,
    });
  }

  logoutConfirm(onConfirm: () => void | Promise<void>) {
    this.confirm({
      title: 'خروج از حساب کاربری',
      content: 'آیا مایل به خروج از حساب کاربری خود هستید؟',
      icon: <QuestionCircleOutlined style={{ color: '#faad14' }} />,
      okText: 'خروج',
      onOk: onConfirm,
    });
  }

  bulkActionConfirm(
    action: string,
    count: number,
    onConfirm: () => void | Promise<void>
  ) {
    this.confirm({
      title: `تأیید ${action} دسته‌ای`,
      content: `آیا مایل به ${action} ${count} مورد انتخاب شده هستید؟`,
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      okText: action,
      onOk: onConfirm,
    });
  }

  dangerousActionConfirm(
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    actionText: string = 'انجام عملیات'
  ) {
    this.confirm({
      title,
      content: `${message}\n\nاین عملیات خطرناک است و ممکن است باعث از دست رفتن داده‌ها شود.`,
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      okType: 'danger',
      okText: actionText,
      onOk: onConfirm,
    });
  }
}

// Create singleton instance
const confirmationService = new ConfirmationService();

export default confirmationService;

// Export individual methods for convenience
export const {
  confirm,
  deleteConfirm,
  saveChangesConfirm,
  discardChangesConfirm,
  statusChangeConfirm,
  logoutConfirm,
  bulkActionConfirm,
  dangerousActionConfirm,
} = confirmationService;
