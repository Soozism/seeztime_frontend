// TypeScript interfaces for API schemas - Updated to match backend OpenAPI spec
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

// Legacy alias for backward compatibility
export interface User extends UserResponse {}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: UserRole;
  is_active?: boolean;
}

export interface UserUpdate {
  username?: string | null;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role?: UserRole | null;
  is_active?: boolean | null;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginResponse extends Token {
  user?: User; // This is added by frontend
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export enum UserRole {
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  TEAM_LEADER = 'team_leader',
  DEVELOPER = 'developer',
  TESTER = 'tester',
  VIEWER = 'viewer'
}

// Enhanced type definitions for better development experience
export interface EnhancedApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
  status: number;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  success: boolean;
}

export interface AsyncOperation<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize?: number) => void;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  showTotal: (total: number, range: [number, number]) => string;
}

export interface FormState<T = any> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
}

export interface NotificationConfig {
  message: string;
  description?: string;
  duration?: number;
  placement?: 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
  className?: string;
  style?: React.CSSProperties;
}

export interface ConfirmationConfig {
  title: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  okType?: 'primary' | 'danger' | 'default';
  icon?: React.ReactNode;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface TableColumn<T = any> {
  title: string;
  dataIndex: keyof T;
  key: string;
  width?: number | string;
  fixed?: 'left' | 'right';
  sorter?: boolean | ((a: T, b: T) => number);
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number';
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
}

export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

export interface SearchConfig {
  placeholder: string;
  fields: string[];
  debounceMs?: number;
}

// Navigation and menu types
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  permission?: string;
  badge?: number | string;
}

export interface BreadcrumbItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
}

// Error handling types
export interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type Modify<T, R> = Omit<T, keyof R> & R;

// Component prop types for better reusability
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  testId?: string;
  children?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  spinning?: boolean;
  delay?: number;
}

export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: React.ComponentType<any>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

export interface TeamResponse {
  id: number;
  name: string;
  description?: string | null;
  team_leader_id: number;
  created_at: string;
  updated_at?: string | null;
  team_leader?: UserResponse | null;
  members?: UserResponse[] | null;
  project_count?: number | null;
  projects?: Project[] | null; // Added projects property
}

// Legacy alias for backward compatibility
export interface Team extends TeamResponse {}

export interface TeamCreate {
  name: string;
  description?: string | null;
  team_leader_id: number;
  member_ids?: number[];
  project_ids?: number[]; // Add project_ids for create
}

export interface TeamUpdate {
  name?: string | null;
  description?: string | null;
  team_leader_id?: number | null;
  // Enhanced update operations
  member_ids?: number[]; // Complete replacement of members
  add_member_ids?: number[]; // Add specific members
  remove_member_ids?: number[]; // Remove specific members
  project_ids?: number[]; // Complete replacement of projects
  add_project_ids?: number[]; // Add specific projects
  remove_project_ids?: number[]; // Remove specific projects
}

export interface TeamMemberAdd {
  user_ids: number[];
}

export interface TeamProjectAssign {
  project_ids: number[];
}

export interface ProjectResponse {
  id: number;
  name: string;
  description?: string | null;
  estimated_hours: number;
  start_date?: string | null;
  end_date?: string | null;
  status: ProjectStatus;
  created_by_id: number;
  created_at: string;
  updated_at?: string | null;
  // Enhanced fields for list response
  total_tasks?: number;
  done_tasks?: number;
  total_spent_hours?: number;
  completion_percentage?: number;
  created_by_username?: string | null;
  created_by_name?: string | null;
  tasks_count?: number; // Added tasks_count property for backward compatibility
}

// Enhanced project detail response interface
export interface ProjectDetailResponse extends ProjectResponse {
  task_summary: {
    total: number;
    todo: number;
    in_progress: number;
    review: number;
    done: number;
    todo_percentage: number;
    in_progress_percentage: number;
    review_percentage: number;
    done_percentage: number;
  };
  sprint_summary: {
    total: number;
    planned: number;
    active: number;
    completed: number;
    planned_percentage: number;
    active_percentage: number;
    completed_percentage: number;
  };
  milestone_summary: {
    total: number;
    pending: number;
    completed: number;
    pending_percentage: number;
    completed_percentage: number;
  };
  users_summary: {
    total_project_hours: number;
    total_project_story_points: number;
    active_users_count: number;
    users_stats: Array<{
      user_id: number;
      username: string;
      first_name: string;
      last_name: string;
      full_name: string;
      total_hours: number;
      total_story_points: number;
      tasks_completed: number;
      tasks_in_progress: number;
      tasks_total: number;
    }>;
  };
  tasks: Array<{
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    story_points: number;
    estimated_hours: number;
    actual_hours: number;
    created_at: string;
    updated_at?: string | null;
    due_date: string;
    assignee_name: string;
    assignee_username: string;
    sprint_name: string;
    is_subtask: boolean;
  }>;
  sprints: Array<{
    id: number;
    name: string;
    description: string;
    status: SprintStatus;
    estimated_hours?: number;
    start_date?: string | null;
    end_date?: string | null;
    created_at: string;
    updated_at?: string | null;
    task_count: number;
  }>;
  milestones: Array<{
    id: number;
    name: string;
    description: string;
    due_date?: string | null;
    completed_at?: string | null;
    created_at: string;
    updated_at?: string | null;
    sprint_count: number;
    is_completed: boolean;
  }>;
}

// Legacy alias for backward compatibility  
export interface Project extends ProjectResponse {}

export interface ProjectCreate {
  name: string;
  description?: string | null;
  estimated_hours?: number;
  start_date?: string | null;
  end_date?: string | null;
  status?: ProjectStatus;
}

export interface ProjectUpdate {
  name?: string | null;
  description?: string | null;
  estimated_hours?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: ProjectStatus | null;
}

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export interface TaskResponse {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  story_points: number;
  estimated_hours: number;
  due_date?: string | null;
  is_subtask: boolean;
  project_id: number;
  phase_id: number;
  sprint_id?: number | null;
  milestone_id?: number | null;
  assignee_id?: number | null;
  created_by_id: number;
  parent_task_id?: number | null;
  actual_hours: number;
  created_at: string;
  updated_at?: string | null;
  project_name?: string | null;
  assignee_username?: string | null;
  assignee_name?: string | null;
  created_by_username?: string | null;
  created_by_name?: string | null;
  sprint_name?: string | null;
  phase_name?: string | null;
  milestone_name?: string | null;
  project?: Project;
  phase?: Phase;
  sprint?: Sprint;
  milestone?: Milestone;
  hours_estimated?: number;
  hours_actual?: number;
  assignee?: User;
}

// Legacy alias for backward compatibility
export interface Task extends TaskResponse {}

export interface TaskCreate {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  story_points: number;
  estimated_hours: number;
  due_date: string;
  is_subtask: boolean;
  project_id: number;
  phase_id: number;
  assignee_id: number;
  sprint_id: number;
  milestone_id?: number | null;
  parent_task_id: number;
}

export interface TaskUpdate {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  story_points: number;
  estimated_hours: number;
  actual_hours: number;
  assignee_id: number;
  sprint_id: number;
  phase_id: number;
  milestone_id?: number | null;
  due_date: string;
  is_subtask: boolean;
}

export interface TaskStatusUpdate {
  status: TaskStatus;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
  BLOCKED = 'blocked'
}

export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4
}

export interface SprintResponse {
  id: number;
  name: string;
  description?: string | null;
  status: SprintStatus;
  estimated_hours?: number;
  start_date?: string | null;
  end_date?: string | null;
  project_id: number;
  phase_id: number;
  milestone_id?: number | null;
  created_at: string;
  updated_at?: string | null;
  total_story_points?: number;
  completed_story_points?: number;
  tasks?: Task[];
  project?: Project;
  phase?: Phase;
  milestone?: Milestone;
}

// Legacy alias for backward compatibility
export interface Sprint extends SprintResponse {}

export interface SprintCreate {
  name: string;
  description?: string | null;
  status?: SprintStatus;
  estimated_hours?: number;
  start_date?: string | null;
  end_date?: string | null;
  milestone_id?: number | null;
  project_id: number;
  phase_id: number;
}

export interface SprintUpdate {
  name?: string | null;
  description?: string | null;
  status?: SprintStatus | null;
  estimated_hours?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  milestone_id?: number | null;
  phase_id?: number | null;
}

export enum SprintStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

export interface BacklogResponse {
  id: number;
  title: string;
  description?: string | null;
  project_id: number;
  created_at: string;
  updated_at?: string | null;
}

// Legacy alias for backward compatibility
export interface Backlog extends BacklogResponse {}

export interface BacklogCreate {
  title: string;
  description?: string | null;
  project_id: number;
}

export interface BacklogUpdate {
  title?: string | null;
  description?: string | null;
}

export interface BugReportResponse {
  id: number;
  title: string;
  description: string;
  steps_to_reproduce?: string | null;
  expected_behavior?: string | null;
  actual_behavior?: string | null;
  severity: BugSeverity;
  status: BugStatus;
  task_id?: number | null;
  reported_by_id: number;
  created_at: string;
  updated_at?: string | null;
  project?: Project; // Added project property
  task?: Task; // Added task property
  assigned_to?: User; // Added assigned_to property
  reported_by?: User; // Added reported_by property
}

// Legacy alias for backward compatibility
export interface BugReport extends BugReportResponse {}

export interface BugReportCreate {
  title: string;
  description: string;
  steps_to_reproduce?: string | null;
  expected_behavior?: string | null;
  actual_behavior?: string | null;
  severity?: BugSeverity;
  status?: BugStatus;
  task_id?: number | null;
  project_id?: number; // Added project_id property
  assigned_to_id?: number; // Added assigned_to_id property
}

export interface BugReportUpdate {
  title?: string | null;
  description?: string | null;
  steps_to_reproduce?: string | null;
  expected_behavior?: string | null;
  actual_behavior?: string | null;
  severity?: BugSeverity | null;
  status?: BugStatus | null;
}

export enum BugSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum BugStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface TimeLogResponse {
  id: number;
  description?: string | null;
  hours: number;
  date: string;
  task_id: number;
  user_id: number;
  created_at: string;
  updated_at?: string | null;
  user?: User; // Added user property
  task?: Task; // Added task property
}

// Legacy alias for backward compatibility
export interface TimeLog extends TimeLogResponse {}

export interface TimeLogCreate {
  description?: string | null;
  hours: number;
  date: string;
  task_id: number;
}

export interface TimeLogUpdate {
  description?: string | null;
  hours?: number | null;
  date?: string | null;
}

// New backend-specific types
export interface TaskDependencyResponse {
  id: number;
  task_id: number;
  depends_on_task_id: number;
}

export interface TaskDependencyCreate {
  task_id: number;
  depends_on_task_id: number;
}

export interface VersionResponse {
  id: number;
  version_number: string;
  description?: string | null;
  project_id: number;
  created_at: string;
  updated_at?: string | null;
}

export interface VersionCreate {
  version_number: string;
  description?: string | null;
  project_id: number;
}

export interface VersionUpdate {
  version_number?: string | null;
  description?: string | null;
}

// Comment type (inferred from common usage but not in swagger)
export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  user: User;
  content: string;
  created_at: string;
}

export interface MilestoneResponse {
  id: number;
  name: string;
  description: string;
  estimated_hours?: number;
  due_date?: string | null;
  project_id: number;
  phase_id: number;
  sprint_id?: number | null;
  completed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  status?: MilestoneStatus;
  project?: Project;
  phase?: Phase;
  sprint?: Sprint;
  created_by?: User;
}

export interface Milestone extends MilestoneResponse {}

export interface MilestoneCreate {
  name: string;
  description?: string;
  estimated_hours?: number;
  due_date?: string | null;
  project_id: number;
  phase_id: number;
  sprint_id?: number | null;
}

export interface MilestoneUpdate {
  name?: string | null;
  description?: string | null;
  estimated_hours?: number | null;
  due_date?: string | null;
  phase_id?: number | null;
  sprint_id?: number | null;
}

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface TagResponse {
  id: number;
  name: string;
  color: string;
  description?: string | null;
  category?: string | null;
}

// Legacy alias for backward compatibility
export interface Tag extends TagResponse {}

export interface TagCreate {
  name: string;
  color?: string;
  description?: string | null;
  category?: string | null;
}

export interface TagUpdate {
  name?: string | null;
  color?: string | null;
  description?: string | null;
  category?: string | null;
}

// Report and analytics types from backend
export interface ReportFilters {
  project_id?: number | null;
  user_id?: number | null;
  team_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface TimeLogReport {
  date: string;
  user_name: string;
  project_name: string;
  task_title: string;
  duration_minutes: number;
  duration_hours: number;
  log_type: string;
  description?: string | null;
}

export interface ProjectTimeStats {
  project_name: string;
  total_minutes: number;
  total_hours: number;
  task_count: number;
  user_count: number;
}

export interface UserTimeStats {
  user_name: string;
  total_minutes: number;
  total_hours: number;
  task_count: number;
  project_count: number;
}

export interface WeeklyTrendData {
  date: string;
  hours: number;
  minutes: number;
}

export interface TimeReportResponse {
  summary: any;
  project_stats: ProjectTimeStats[];
  user_stats: UserTimeStats[];
  detailed_logs: TimeLogReport[];
  weekly_trend: WeeklyTrendData[];
  applied_filters: ReportFilters;
}

export interface ProjectStoryStats {
  project_name: string;
  total_points_planned: number;
  total_points_completed: number;
  completion_rate: number;
  active_tasks: number;
  completed_tasks: number;
}

export interface UserStoryPerformance {
  user_name: string;
  planned_points: number;
  completed_points: number;
  completion_rate: number;
  active_tasks: number;
  completed_tasks: number;
}

export interface StoryPointsReport {
  user_name: string;
  project_name: string;
  task_title: string;
  story_points: number;
  completed_at: string;
}

export interface StoryPointsReportResponse {
  summary: any;
  project_stats: ProjectStoryStats[];
  user_performance: UserStoryPerformance[];
  detailed_completions: StoryPointsReport[];
  applied_filters: ReportFilters;
}

export interface TeamProductivityReport {
  team_name: string;
  team_leader: string;
  member_count: number;
  total_hours: number;
  total_story_points: number;
  projects_count: number;
  avg_completion_rate: number;
}

export interface TeamReportResponse {
  summary: any;
  team_productivity: TeamProductivityReport[];
  applied_filters: ReportFilters;
}

export interface DashboardSummary {
  total_hours_logged: number;
  total_story_points_completed: number;
  active_projects: number;
  active_tasks: number;
  total_users: number;
  total_teams: number;
}

export interface DashboardReportResponse {
  dashboard_summary: DashboardSummary;
  recent_activities: TimeLogReport[];
  top_performers: UserStoryPerformance[];
  project_progress: ProjectStoryStats[];
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Form types
export interface TaskUpdateStatus {
  status: TaskStatus;
}

export interface ConvertBacklogToTask {
  assignee_id?: number;
  sprint_id?: number;
}

// Kanban board types
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface KanbanBoard {
  columns: KanbanColumn[];
}

// Filter types
export interface TaskFilters {
  project_id?: number;
  assignee_id?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  sprint_id?: number;
}

export interface ProjectFilters {
  show_closed?: boolean;
  status?: ProjectStatus;
}

export interface BugReportFilters {
  task_id?: number;
  status?: BugStatus;
  severity?: BugSeverity;
  project_id?: number;
}

export interface TimeLogFilters {
  task_id?: number;
  user_id?: number;
  project_id?: number;
  start_date?: string;
  end_date?: string;
}

// Dashboard Statistics Interface
export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  total_tasks: number;
  completed_tasks: number;
  total_hours_logged: number;
  total_story_points: number;
  completed_story_points: number;
  active_sprints: number;
  recent_activities: any[]; // You can define a more specific type for activities if needed
}

export interface PhaseResponse {
  id: number;
  name: string;
  description?: string | null;
  project_id: number;
  order: number;
  status: PhaseStatus;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at?: string | null;
  project?: Project;
  milestones?: Milestone[];
}

export interface Phase extends PhaseResponse {}

export interface PhaseCreate {
  name: string;
  description?: string | null;
  project_id: number;
  order?: number;
  status?: PhaseStatus;
  start_date?: string | null;
  end_date?: string | null;
}

export interface PhaseUpdate {
  name?: string | null;
  description?: string | null;
  order?: number | null;
  status?: PhaseStatus | null;
  start_date?: string | null;
  end_date?: string | null;
}

export enum PhaseStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold'
}

// Planner Types
export interface PlannerEvent {
  id: number;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  location?: string | null;
  event_type?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface PlannerEventCreate {
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  location?: string | null;
  event_type?: string | null;
}

export interface PlannerEventUpdate {
  title?: string | null;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  event_type?: string | null;
}

export interface PlannerTodo {
  id: number;
  title: string;
  description?: string | null;
  due_date?: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface PlannerTodoCreate {
  title: string;
  description?: string | null;
  due_date?: string | null;
  is_completed?: boolean;
}

export interface PlannerTodoUpdate {
  title?: string | null;
  description?: string | null;
  due_date?: string | null;
  is_completed?: boolean;
}

export enum CalendarView {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month'
}

export interface CalendarEvent extends PlannerEvent {
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
}

export interface TodoFilters {
  is_completed?: boolean;
  due_date?: string;
}

export interface EventFilters {
  event_type?: string;
  start_date?: string;
  end_date?: string;
}

// WORKING_HOURS_TYPES_START
export interface WorkingHoursCreate {
  user_id: number;
  start_time: string; // HH:MM:SS
  end_time: string;   // HH:MM:SS
  work_hours_per_day?: number;
  monday_enabled?: boolean;
  tuesday_enabled?: boolean;
  wednesday_enabled?: boolean;
  thursday_enabled?: boolean;
  friday_enabled?: boolean;
  saturday_enabled?: boolean;
  sunday_enabled?: boolean;
  break_start_time?: string | null; // HH:MM:SS
  break_end_time?: string | null;   // HH:MM:SS
  break_duration_minutes?: number;
  timezone?: string;
  effective_from: string; // YYYY-MM-DD
  effective_to?: string | null;     // YYYY-MM-DD
  notes?: string | null;
}

export interface WorkingHoursUpdate extends Partial<WorkingHoursCreate> {}

export interface WorkingHoursResponse extends WorkingHoursCreate {
  id: number;
  set_by_id?: number;
  created_at: string;
  updated_at?: string | null;
  user_name?: string;
  user_full_name?: string;
  set_by_name?: string;
}

export interface WorkDayStatus {
  date: string; // YYYY-MM-DD
  is_working_day: boolean;
  is_holiday: boolean;
  is_time_off: boolean;
  holiday_name?: string | null;
  time_off_id?: number | null;
}
// WORKING_HOURS_TYPES_END

// HOLIDAY_TIMEOFF_TYPES_START
export interface HolidayCreate {
  name: string;
  date: string; // YYYY-MM-DD
  calendar_type?: 'national' | 'religious' | 'weekly' | 'company';
  is_national?: boolean;
  is_recurring?: boolean;
  jalali_year?: number | null;
  jalali_month?: number | null;
  jalali_day?: number | null;
  description?: string | null;
}

export interface HolidayResponse extends HolidayCreate {
  id: number;
  created_by_id?: number;
  created_at: string;
  updated_at?: string | null;
  created_by_name?: string | null;
}

export interface TimeOffCreate {
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  reason?: string | null;
  user_id?: number; // admin/PM can specify
}

export interface TimeOffUpdate extends Partial<TimeOffCreate> {}

export interface TimeOffResponse extends TimeOffCreate {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  approved_by_id?: number | null;
  approved_at?: string | null;
  approval_notes?: string | null;
  created_at: string;
  updated_at?: string | null;
  user_name?: string | null;
  approved_by_name?: string | null;
  days_count?: number;
}
// HOLIDAY_TIMEOFF_TYPES_END
