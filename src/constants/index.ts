// Application constants and configurations

// API Constants
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://185.105.187.118:8000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutes
  MAX_SIZE: 100,
  STALE_WHILE_REVALIDATE: true,
} as const;

// Pagination Defaults
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true,
  SHOW_TOTAL: (total: number, range: [number, number]) => 
    `${range[0]}-${range[1]} از ${total} مورد`,
} as const;

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  DURATION: 4,
  PLACEMENT: 'topLeft' as const,
  RTL_CLASS: 'rtl-notification',
  MAX_COUNT: 3,
} as const;

// Modal Configuration
export const MODAL_CONFIG = {
  RTL_CLASS: 'rtl-modal',
  MASK_CLOSABLE: false,
  KEYBOARD: true,
  CENTERED: true,
} as const;

// Form Configuration
export const FORM_CONFIG = {
  LAYOUT: 'vertical' as const,
  LABEL_COL: { span: 24 },
  WRAPPER_COL: { span: 24 },
  VALIDATE_TRIGGER: ['onChange', 'onBlur'] as const,
  PRESERVE: false,
  AUTOCOMPLETE: 'off',
} as const;

// Table Configuration
export const TABLE_CONFIG = {
  SIZE: 'middle' as const,
  BORDERED: false,
  SHOW_HEADER: true,
  ROW_SELECTION_TYPE: 'checkbox' as const,
  PAGINATION: {
    ...PAGINATION_CONFIG,
    POSITION: ['bottomCenter'] as const,
  },
  SCROLL: {
    THRESHOLD: 800,
    X: true,
    Y: 'calc(100vh - 320px)',
  },
} as const;

// Loading Configuration
export const LOADING_CONFIG = {
  SIZE: 'default' as const,
  DELAY: 200,
  TIP: 'در حال بارگذاری...',
  SKELETON_ROWS: 4,
  SKELETON_ACTIVE: true,
} as const;

// Date and Time
export const DATE_CONFIG = {
  LOCALE: 'fa',
  FORMAT: 'YYYY/MM/DD',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'YYYY/MM/DD HH:mm',
  CALENDAR: 'persian',
  DIRECTION: 'rtl' as const,
} as const;

// File Upload
export const UPLOAD_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  MULTIPLE: true,
  DIRECTORY: false,
} as const;

// Status Colors
export const STATUS_COLORS = {
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#ff4d4f',
  INFO: '#1890ff',
  DEFAULT: '#d9d9d9',
} as const;

// Priority Levels
export const PRIORITY_CONFIG = {
  HIGH: {
    value: 'high',
    label: 'بالا',
    color: STATUS_COLORS.ERROR,
    weight: 3,
  },
  MEDIUM: {
    value: 'medium',
    label: 'متوسط',
    color: STATUS_COLORS.WARNING,
    weight: 2,
  },
  LOW: {
    value: 'low',
    label: 'پایین',
    color: STATUS_COLORS.SUCCESS,
    weight: 1,
  },
} as const;

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  DEFAULT: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
} as const;

// Breakpoints (matching Ant Design)
export const BREAKPOINTS = {
  XS: 480,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1600,
} as const;

// Z-Index Levels
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  NOTIFICATION: 1080,
} as const;

// Layout Configuration
export const LAYOUT_CONFIG = {
  HEADER_HEIGHT: 64,
  SIDER_WIDTH: 250,
  SIDER_COLLAPSED_WIDTH: 80,
  FOOTER_HEIGHT: 70,
  CONTENT_PADDING: 24,
  CARD_MARGIN: 16,
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  PRIMARY_COLOR: '#1890ff',
  SUCCESS_COLOR: '#52c41a',
  WARNING_COLOR: '#faad14',
  ERROR_COLOR: '#ff4d4f',
  INFO_COLOR: '#1890ff',
  TEXT_COLOR: 'rgba(255, 255, 255, 0.85)',
  TEXT_COLOR_SECONDARY: 'rgba(255, 255, 255, 0.65)',
  BACKGROUND_COLOR: '#001529',
  BORDER_COLOR: 'rgba(255, 255, 255, 0.15)',
  BOX_SHADOW: '0 2px 8px rgba(0, 0, 0, 0.15)',
  BORDER_RADIUS: 8,
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^(\+98|0)?9\d{9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PERSIAN_CHARACTERS: /^[\u0600-\u06FF\s]+$/,
  NUMERIC: /^\d+$/,
  DECIMAL: /^\d+(\.\d+)?$/,
  URL: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'این فیلد اجباری است',
  EMAIL_INVALID: 'ایمیل وارد شده معتبر نیست',
  PHONE_INVALID: 'شماره تلفن وارد شده معتبر نیست',
  PASSWORD_WEAK: 'رمز عبور باید حداقل ۸ کاراکتر و شامل حروف کوچک، بزرگ، عدد و علامت باشد',
  USERNAME_INVALID: 'نام کاربری باید بین ۳ تا ۲۰ کاراکتر و شامل حروف انگلیسی، عدد و _ باشد',
  MIN_LENGTH: (min: number) => `حداقل ${min} کاراکتر وارد کنید`,
  MAX_LENGTH: (max: number) => `حداکثر ${max} کاراکتر وارد کنید`,
  MIN_VALUE: (min: number) => `حداقل مقدار ${min} است`,
  MAX_VALUE: (max: number) => `حداکثر مقدار ${max} است`,
  NUMERIC_ONLY: 'فقط عدد وارد کنید',
  PERSIAN_ONLY: 'فقط حروف فارسی وارد کنید',
  CONFIRM_PASSWORD: 'تأیید رمز عبور مطابقت ندارد',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVE: 'اطلاعات با موفقیت ذخیره شد',
  UPDATE: 'اطلاعات با موفقیت بروزرسانی شد',
  DELETE: 'حذف با موفقیت انجام شد',
  CREATE: 'ایجاد با موفقیت انجام شد',
  UPLOAD: 'فایل با موفقیت آپلود شد',
  COPY: 'در کلیپ بورد کپی شد',
  SEND: 'ارسال با موفقیت انجام شد',
  IMPORT: 'وارد کردن اطلاعات با موفقیت انجام شد',
  EXPORT: 'خروجی با موفقیت تهیه شد',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'خطا در برقراری ارتباط با سرور',
  UNAUTHORIZED: 'دسترسی غیرمجاز',
  FORBIDDEN: 'شما اجازه دسترسی به این بخش را ندارید',
  NOT_FOUND: 'صفحه مورد نظر یافت نشد',
  VALIDATION: 'لطفاً اطلاعات وارد شده را بررسی کنید',
  SERVER: 'خطای داخلی سرور',
  TIMEOUT: 'زمان درخواست به اتمام رسید',
  UNKNOWN: 'خطای نامشخص رخ داده است',
  FILE_SIZE: 'حجم فایل بیش از حد مجاز است',
  FILE_TYPE: 'نوع فایل مجاز نیست',
} as const;

// Confirmation Messages
export const CONFIRMATION_MESSAGES = {
  DELETE: 'آیا مطمئن هستید که می‌خواهید این مورد را حذف کنید؟',
  DELETE_MULTIPLE: 'آیا مطمئن هستید که می‌خواهید موارد انتخاب شده را حذف کنید؟',
  STATUS_CHANGE: 'آیا مطمئن هستید که می‌خواهید وضعیت را تغییر دهید؟',
  SAVE_CHANGES: 'آیا می‌خواهید تغییرات را ذخیره کنید؟',
  DISCARD_CHANGES: 'تغییرات ذخیره نشده از بین خواهد رفت. آیا مطمئن هستید؟',
  LOGOUT: 'آیا می‌خواهید از سیستم خارج شوید؟',
  DANGEROUS_ACTION: 'این عمل غیرقابل بازگشت است. آیا مطمئن هستید؟',
} as const;

// Button Texts
export const BUTTON_TEXTS = {
  OK: 'تأیید',
  CANCEL: 'لغو',
  SAVE: 'ذخیره',
  DELETE: 'حذف',
  EDIT: 'ویرایش',
  ADD: 'افزودن',
  SEARCH: 'جستجو',
  RESET: 'بازنشانی',
  SUBMIT: 'ثبت',
  BACK: 'بازگشت',
  NEXT: 'بعدی',
  PREVIOUS: 'قبلی',
  FINISH: 'پایان',
  RETRY: 'تلاش مجدد',
  RELOAD: 'بارگذاری مجدد',
  REFRESH: 'بروزرسانی',
  UPLOAD: 'آپلود',
  DOWNLOAD: 'دانلود',
  EXPORT: 'خروجی',
  IMPORT: 'وارد کردن',
  PRINT: 'چاپ',
  COPY: 'کپی',
  SELECT_ALL: 'انتخاب همه',
  CLEAR_ALL: 'پاک کردن همه',
} as const;

// Navigation Labels
export const NAV_LABELS = {
  DASHBOARD: 'داشبورد',
  USERS: 'کاربران',
  PROJECTS: 'پروژه‌ها',
  TASKS: 'وظایف',
  REPORTS: 'گزارش‌ها',
  SETTINGS: 'تنظیمات',
  PROFILE: 'پروفایل',
  LOGOUT: 'خروج',
  HOME: 'خانه',
  ABOUT: 'درباره ما',
  CONTACT: 'تماس با ما',
  HELP: 'راهنما',
  FAQ: 'سؤالات متداول',
} as const;

// Status Labels
export const STATUS_LABELS = {
  ACTIVE: 'فعال',
  INACTIVE: 'غیرفعال',
  PENDING: 'در انتظار',
  APPROVED: 'تأیید شده',
  REJECTED: 'رد شده',
  COMPLETED: 'تکمیل شده',
  IN_PROGRESS: 'در حال انجام',
  TODO: 'انجام نشده',
  DRAFT: 'پیش‌نویس',
  PUBLISHED: 'منتشر شده',
  ARCHIVED: 'بایگانی شده',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  TABLE_SETTINGS: 'table_settings',
  RECENT_SEARCHES: 'recent_searches',
  PREFERENCES: 'preferences',
  CACHE_PREFIX: 'cache_',
} as const;

// Event Names
export const EVENT_NAMES = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  DATA_UPDATED: 'data_updated',
  THEME_CHANGED: 'theme_changed',
  LANGUAGE_CHANGED: 'language_changed',
  ERROR_OCCURRED: 'error_occurred',
  SUCCESS_ACTION: 'success_action',
  MODAL_OPENED: 'modal_opened',
  MODAL_CLOSED: 'modal_closed',
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'],
  SUCCESS: ['#b7eb8f', '#95de64', '#73d13d', '#52c41a', '#389e0d'],
  WARNING: ['#fff1b8', '#ffe58f', '#ffd666', '#faad14', '#d48806'],
  ERROR: ['#ffccc7', '#ffa39e', '#ff7875', '#ff4d4f', '#cf1322'],
  INFO: ['#bae7ff', '#91d5ff', '#69c0ff', '#1890ff', '#096dd9'],
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  DARK_MODE: true,
  NOTIFICATIONS: true,
  REAL_TIME_UPDATES: true,
  ADVANCED_SEARCH: true,
  EXPORT_FUNCTIONALITY: true,
  BULK_OPERATIONS: true,
  USER_PREFERENCES: true,
  ANALYTICS: true,
  OFFLINE_MODE: false,
  PWA: false,
} as const;

// Performance Thresholds
export const PERFORMANCE_CONFIG = {
  MAX_BUNDLE_SIZE: 250 * 1024, // 250KB
  MAX_COMPONENT_RENDER_TIME: 16, // 16ms
  MAX_API_RESPONSE_TIME: 2000, // 2 seconds
  MAX_IMAGE_SIZE: 1024 * 1024, // 1MB
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
} as const;

// Environment Configuration
export const ENV_CONFIG = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  CURRENT: process.env.NODE_ENV || 'development',
} as const;

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  SAVE: 'Ctrl+S',
  SEARCH: 'Ctrl+K',
  NEW: 'Ctrl+N',
  EDIT: 'Enter',
  DELETE: 'Delete',
  REFRESH: 'F5',
  CLOSE: 'Escape',
  SELECT_ALL: 'Ctrl+A',
  COPY: 'Ctrl+C',
  PASTE: 'Ctrl+V',
} as const;
