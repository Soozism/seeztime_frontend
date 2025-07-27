export default {
  // Navigation
  dashboard: 'داشبورد',
  projectsMenu: 'پروژه‌ها',
  tasksMenu: 'وظایف',
  teams: 'تیم‌ها',
  users: 'کاربران',
  sprints: 'اسپرینت‌ها',
  backlogs: 'بک‌لاگ',
  bugReports: 'گزارش‌های باگ',
  timeLogs: 'ثبت زمان',
  milestones: 'نقاط عطف',
  reports: 'گزارش‌ها',
  kanban: 'کانبان',
  
  // Authentication
  login: 'ورود',
  logout: 'خروج',
  register: 'ثبت‌نام',
  username: 'نام کاربری',
  password: 'رمز عبور',
  email: 'ایمیل',
  firstName: 'نام',
  lastName: 'نام خانوادگی',
  
  // Common actions
  create: 'ایجاد',
  edit: 'ویرایش',
  delete: 'حذف',
  save: 'ذخیره',
  cancel: 'لغو',
  submit: 'ارسال',
  search: 'جستجو',
  filter: 'فیلتر',
  export: 'خروجی',
  view: 'مشاهده',
  close: 'بستن',
  reopen: 'بازگشایی',
  complete: 'تکمیل',
  
  // Form labels
  title: 'عنوان',
  description: 'توضیحات',
  name: 'نام',
  status: 'وضعیت',
  priority: 'اولویت',
  assignee: 'مسئول',
  dueDate: 'تاریخ انجام',
  startDate: 'تاریخ شروع',
  endDate: 'تاریخ پایان',
  storyPoints: 'امتیاز استوری',
  estimatedHours: 'ساعت برآوردی',
  actualHours: 'ساعت واقعی',
  
  // Status values
  statusValues: {
    todo: 'انجام نشده',
    inProgress: 'در حال انجام',
    inReview: 'در حال بررسی',
    blocked: 'مسدود شده',
    done: 'انجام شده',
    active: 'فعال',
    closed: 'بسته شده',
    pending: 'در انتظار',
    completed: 'تکمیل شده',
    open: 'باز',
    resolved: 'حل شده'
  },
  
  // Priority values
  priorityValues: {
    1: 'کم',
    2: 'متوسط',
    3: 'بالا',
    4: 'فوری'
  },
  
  // Roles
  roles: {
    admin: 'مدیر سیستم',
    projectManager: 'مدیر پروژه',
    teamLeader: 'سرپرست تیم',
    developer: 'توسعه‌دهنده',
    tester: 'تستر',
    viewer: 'بازدیدکننده'
  },
  
  // Bug severity
  bugSeverity: {
    low: 'کم',
    medium: 'متوسط',
    high: 'بالا',
    critical: 'بحرانی'
  },
  
  // Messages
  messages: {
    loginSuccess: 'ورود با موفقیت انجام شد',
    loginError: 'نام کاربری یا رمز عبور اشتباه است',
    createSuccess: 'با موفقیت ایجاد شد',
    updateSuccess: 'با موفقیت به‌روزرسانی شد',
    deleteSuccess: 'با موفقیت حذف شد',
    deleteConfirm: 'آیا از حذف این مورد اطمینان دارید؟',
    networkError: 'خطا در اتصال به سرور',
    validationError: 'لطفاً تمام فیلدها را به درستی پر کنید',
    unauthorizedError: 'شما مجاز به انجام این عمل نیستید',
    loading: 'در حال بارگذاری...',
    noData: 'داده‌ای یافت نشد',
    exportSuccess: 'فایل با موفقیت دانلود شد'
  },
  
  // Validation
  validation: {
    required: 'این فیلد الزامی است',
    email: 'ایمیل معتبر وارد کنید',
    minLength: 'حداقل {min} کاراکتر وارد کنید',
    maxLength: 'حداکثر {max} کاراکتر مجاز است',
    numeric: 'فقط عدد مجاز است',
    positive: 'عدد مثبت وارد کنید'
  },
  
  // Table headers
  table: {
    id: 'شناسه',
    createdAt: 'تاریخ ایجاد',
    updatedAt: 'تاریخ به‌روزرسانی',
    actions: 'عملیات',
    totalHours: 'کل ساعات',
    totalTasks: 'کل وظایف',
    completedTasks: 'وظایف تکمیل شده',
    completionRate: 'درصد تکمیل',
    teamLeader: 'سرپرست تیم',
    members: 'اعضا',
    memberCount: 'تعداد اعضا'
  },
  
  // Dashboard
  dashboardStats: {
    totalProjects: 'کل پروژه‌ها',
    activeProjects: 'پروژه‌های فعال',
    totalTasks: 'کل وظایف',
    completedTasks: 'وظایف تکمیل شده',
    totalHours: 'کل ساعات ثبت شده',
    totalStoryPoints: 'کل امتیاز استوری',
    completedStoryPoints: 'امتیاز استوری تکمیل شده',
    activeSprints: 'اسپرینت‌های فعال',
    recentActivities: 'فعالیت‌های اخیر',
    topPerformers: 'بهترین عملکردها',
    projectProgress: 'پیشرفت پروژه‌ها'
  },
  
  // Reports
  reportTitles: {
    timeTracking: 'گزارش ردیابی زمان',
    storyPoints: 'گزارش امتیاز استوری',
    teamProductivity: 'گزارش بهره‌وری تیم',
    dashboard: 'گزارش داشبورد',
    productivity: 'خلاصه بهره‌وری',
    burndown: 'نمودار برن‌داون',
    workload: 'تحلیل بار کاری'
  },
  
  // Time periods
  periods: {
    day: 'روزانه',
    week: 'هفتگی',
    month: 'ماهانه',
    quarter: 'فصلی',
    year: 'سالانه'
  },
  
  // Kanban
  kanbanBoard: {
    dragHint: 'وظایف را بکشید و رها کنید',
    updateStatus: 'به‌روزرسانی وضعیت',
    createTask: 'ایجاد وظیفه جدید'
  },

  // Tasks page
  tasks: {
    management: 'مدیریت وظایف',
    overview: 'نمای کلی وظایف',
    analytics: 'آنالیز وظایف',
    addTask: 'افزودن وظیفه',
    editTask: 'ویرایش وظیفه',
    createTask: 'ایجاد وظیفه',
    taskDetails: 'جزئیات وظیفه',
    filters: 'فیلترها',
    showCompleted: 'نمایش تکمیل شده',
    hideCompleted: 'مخفی کردن تکمیل شده',
    searchTasks: 'جستجوی وظایف...',
    selectProjects: 'انتخاب پروژه‌ها',
    selectAssignees: 'انتخاب مسئولین',
    selectPriorities: 'انتخاب اولویت‌ها',
    selectSprint: 'انتخاب اسپرینت',
    applyFilters: 'اعمال فیلترها',
    resetFilters: 'پاک کردن فیلترها',
    taskInformation: 'اطلاعات وظیفه',
    statistics: 'آمار',
    comments: 'نظرات',
    timeTracking: 'ردیابی زمان',
    noComments: 'نظری ثبت نشده است',
    noProject: 'بدون پروژه',
    unassigned: 'تخصیص داده نشده',
    noDueDate: 'بدون تاریخ انجام',
    noSprint: 'بدون اسپرینت',
    progress: 'پیشرفت',
    timeSpent: 'زمان صرف شده',
    estimated: 'برآورد شده',
    remaining: 'باقی‌مانده',
    overdue: 'عقب‌مانده',
    dueSoon: 'به زودی سررسید',
    completionRate: 'درصد تکمیل',
    productivityScore: 'امتیاز بهره‌وری',
    averageCompletion: 'میانگین تکمیل',
    hours: 'ساعت',
    days: 'روز'
  },

  // Task stats
  taskStats: {
    totalTasks: 'کل وظایف',
    completedTasks: 'تکمیل شده',
    inProgressTasks: 'در حال انجام',
    pendingTasks: 'در انتظار',
    overdueTasks: 'عقب‌مانده',
    totalTime: 'کل زمان',
    avgCompletion: 'میانگین تکمیل',
    productivity: 'بهره‌وری'
  },

  // Projects page
  projects: {
    management: 'مدیریت پروژه‌ها',
    overview: 'نمای کلی پروژه‌ها',
    analytics: 'آنالیز پروژه‌ها',
    addProject: 'افزودن پروژه',
    editProject: 'ویرایش پروژه',
    createProject: 'ایجاد پروژه',
    projectDetails: 'جزئیات پروژه',
    filters: 'فیلترها',
    searchProjects: 'جستجوی پروژه‌ها...',
    selectStatus: 'انتخاب وضعیت',
    selectCreator: 'انتخاب سازنده',
    dateRange: 'بازه تاریخ',
    startDate: 'تاریخ شروع',
    endDate: 'تاریخ پایان',
    advanced: 'پیشرفته',
    basic: 'ساده',
    autoRefresh: 'بروزرسانی خودکار',
    manual: 'دستی',
    refresh: 'بروزرسانی',
    exportCsv: 'خروجی CSV',
    projectInfo: 'اطلاعات پروژه',
    statistics: 'آمار',
    progress: 'پیشرفت',
    noDescription: 'توضیحی ندارد',
    creator: 'سازنده',
    navigateToProject: 'رفتن به پروژه',
    viewDetails: 'مشاهده جزئیات',
    totalProjects: 'کل پروژه‌ها',
    activeProjects: 'پروژه‌های فعال',
    completedProjects: 'پروژه‌های تکمیل شده',
    archivedProjects: 'پروژه‌های آرشیو شده',
    totalHours: 'کل ساعات',
    avgProgress: 'میانگین پیشرفت',
    projectDistribution: 'توزیع پروژه‌ها',
    tasksCompleted: 'وظایف تکمیل شده',
    tasksRemaining: 'وظایف باقی‌مانده',
    hours: 'ساعت',
    deleteConfirm: 'آیا از حذف این پروژه اطمینان دارید؟'
  },

  // Project status
  projectStatus: {
    active: 'فعال',
    completed: 'تکمیل شده',
    archived: 'آرشیو شده'
  }
};
