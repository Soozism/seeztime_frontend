# Ginga Task Management System - Comprehensive API Documentation

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Project Management APIs](#project-management-apis)
4. [Task Management APIs](#task-management-apis)
5. [Sprint Management APIs](#sprint-management-apis)
6. [Team Management APIs](#team-management-apis)
7. [Time Tracking APIs](#time-tracking-apis)
8. [Dashboard & Reporting APIs](#dashboard--reporting-apis)
9. [Bug Report APIs](#bug-report-apis)
10. [Milestone APIs](#milestone-apis)
11. [Backlog APIs](#backlog-apis)
12. [Advanced Query APIs](#advanced-query-apis)
13. [Data Models & Enums](#data-models--enums)

---

## Authentication APIs

### 1. Login
**Endpoint:** `POST /api/v1/auth/login`

**Purpose:** Authenticate a user and receive an access token for API access.

**Request Body:**
```json
{
    "username": "john_doe",
    "password": "secure_password123"
}
```

**Response:**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Missing required fields

### 2. Register
**Endpoint:** `POST /api/v1/auth/register`

**Purpose:** Create a new user account in the system.

**Request Body:**
```json
{
    "username": "new_user",
    "email": "user@example.com",
    "password": "secure_password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "developer",
    "is_active": true
}
```

**Response:**
```json
{
    "id": 1,
    "username": "new_user",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "developer",
    "is_active": true,
    "created_at": "2025-01-22T10:30:00Z",
    "updated_at": null
}
```

**Possible Role Values:** `admin`, `project_manager`, `team_leader`, `developer`, `tester`, `viewer`

---

## User Management APIs

### 1. Get All Users
**Endpoint:** `GET /api/v1/users/`

**Purpose:** Retrieve a list of all users (Admin only).

**Query Parameters:**
- `skip` (int, default: 0): Number of records to skip
- `limit` (int, default: 100): Maximum number of records to return

**Response:**
```json
[
    {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "first_name": "Admin",
        "last_name": "User",
        "role": "admin",
        "is_active": true,
        "created_at": "2025-01-22T10:30:00Z",
        "updated_at": null
    }
]
```

### 2. Create User
**Endpoint:** `POST /api/v1/users/`

**Purpose:** Create a new user (Admin only).

**Request Body:** Same as register endpoint

### 3. Get User by ID
**Endpoint:** `GET /api/v1/users/{user_id}`

**Purpose:** Retrieve specific user information.

**Response:** Same structure as user list item

### 4. Get Current User Info
**Endpoint:** `GET /api/v1/users/me/`

**Purpose:** Get information about the currently authenticated user.

### 5. Update User
**Endpoint:** `PUT /api/v1/users/{user_id}`

**Purpose:** Update user information (self or admin).

**Request Body:**
```json
{
    "first_name": "Updated",
    "last_name": "Name",
    "email": "new_email@example.com",
    "role": "team_leader",
    "is_active": true
}
```

### 6. Delete User
**Endpoint:** `DELETE /api/v1/users/{user_id}`

**Purpose:** Delete a user (Admin only).

**Response:**
```json
{
    "message": "User deleted successfully"
}
```

### 7. Change Password
**Endpoint:** `POST /api/v1/users/change-password`

**Purpose:** Change current user's password.

**Request Body:**
```json
{
    "current_password": "old_password",
    "new_password": "new_secure_password"
}
```

---

## Project Management APIs

### 1. Get All Projects
**Endpoint:** `GET /api/v1/projects/`

**Purpose:** Retrieve projects based on user role and permissions.

**Query Parameters:**
- `skip` (int): Pagination offset
- `limit` (int): Maximum results
- `show_closed` (bool): Include closed projects
- `status` (str): Filter by project status
- `expand` (bool): Include expanded details

**Response:**
```json
[
    {
        "id": 1,
        "name": "Mobile App Development",
        "description": "iOS and Android app for task management",
        "status": "active",
        "start_date": "2025-01-01",
        "end_date": "2025-06-30",
        "created_by_id": 1,
        "created_at": "2025-01-22T10:30:00Z",
        "updated_at": null,
        "created_by": {
            "id": 1,
            "username": "project_manager",
            "full_name": "John Manager"
        }
    }
]
```

**Project Status Values:** `active`, `completed`, `archived`

### 2. Get Project by ID
**Endpoint:** `GET /api/v1/projects/{project_id}`

**Purpose:** Get detailed project information with comprehensive statistics.

**Query Parameters:**
- `expand` (bool): Include related object details
- `include_details` (bool): Include task/sprint lists
- `include_users` (bool): Include user information

**Response:**
```json
{
    "id": 1,
    "name": "Mobile App Development",
    "description": "iOS and Android app for task management",
    "status": "active",
    "start_date": "2025-01-01",
    "end_date": "2025-06-30",
    "created_by_id": 1,
    "task_summary": {
        "total": 25,
        "todo": 5,
        "in_progress": 8,
        "review": 4,
        "done": 8,
        "todo_percentage": 20.0,
        "in_progress_percentage": 32.0,
        "review_percentage": 16.0,
        "done_percentage": 32.0
    },
    "sprint_summary": {
        "total": 5,
        "planned": 1,
        "active": 1,
        "completed": 3,
        "planned_percentage": 20.0,
        "active_percentage": 20.0,
        "completed_percentage": 60.0
    },
    "milestone_summary": {
        "total": 10,
        "pending": 3,
        "completed": 7,
        "pending_percentage": 30.0,
        "completed_percentage": 70.0
    },
    "created_by": {...},
    "tasks": [...],
    "sprints": [...]
}
```

### 3. Create Project
**Endpoint:** `POST /api/v1/projects/`

**Purpose:** Create a new project (Admin/Project Manager only).

**Request Body:**
```json
{
    "name": "New Project",
    "description": "Project description",
    "status": "active",
    "start_date": "2025-02-01",
    "end_date": "2025-08-31"
}
```

### 4. Update Project
**Endpoint:** `PUT /api/v1/projects/{project_id}`

**Purpose:** Update project information.

### 5. Delete Project
**Endpoint:** `DELETE /api/v1/projects/{project_id}`

**Purpose:** Delete a project and all related data.

---

## Task Management APIs

### 1. Get All Tasks
**Endpoint:** `GET /api/v1/tasks/`

**Purpose:** Retrieve tasks with optional filtering and expanded details.

**Query Parameters:**
- `skip`, `limit`: Pagination
- `project_id` (int): Filter by project
- `assignee_id` (int): Filter by assignee
- `expand` (bool): Include related objects

**Response:**
```json
[
    {
        "id": 1,
        "title": "Implement user authentication",
        "description": "Add JWT-based authentication system",
        "status": "in_progress",
        "priority": 3,
        "story_points": 8,
        "project_id": 1,
        "assignee_id": 2,
        "sprint_id": 1,
        "due_date": "2025-02-15",
        "created_at": "2025-01-22T10:30:00Z",
        "project": {
            "id": 1,
            "name": "Mobile App Development"
        },
        "assignee": {
            "id": 2,
            "username": "developer1",
            "full_name": "Jane Developer"
        },
        "sprint": {
            "id": 1,
            "name": "Sprint 1"
        }
    }
]
```

**Task Status Values:** `todo`, `in_progress`, `review`, `done`, `blocked`
**Priority Values:** `1` (Low), `2` (Medium), `3` (High), `4` (Critical)

### 2. Get Task by ID
**Endpoint:** `GET /api/v1/tasks/{task_id}`

**Purpose:** Get detailed task information including time logs.

**Query Parameters:**
- `expand` (bool): Include related objects
- `include_time_logs` (bool): Include time tracking data

**Response:** Extended task object with time logs:
```json
{
    "id": 1,
    "title": "Implement user authentication",
    "...": "... other task fields ...",
    "time_logs": [
        {
            "id": 1,
            "description": "Set up JWT configuration",
            "hours": 2.5,
            "date": "2025-01-22",
            "user_id": 2,
            "user_username": "developer1",
            "user_name": "Jane Developer",
            "created_at": "2025-01-22T14:30:00Z"
        }
    ]
}
```

### 3. Create Task
**Endpoint:** `POST /api/v1/tasks/`

**Purpose:** Create a new task in a project.

**Request Body:**
```json
{
    "title": "New Task",
    "description": "Task description",
    "status": "todo",
    "priority": 2,
    "story_points": 5,
    "project_id": 1,
    "assignee_id": 2,
    "sprint_id": 1,
    "due_date": "2025-03-01"
}
```

### 4. Update Task
**Endpoint:** `PUT /api/v1/tasks/{task_id}`

**Purpose:** Update task information.

### 5. Update Task Status
**Endpoint:** `PUT /api/v1/tasks/{task_id}/status`

**Purpose:** Update only the task status.

**Request Body:**
```json
{
    "status": "done"
}
```

### 6. Delete Task
**Endpoint:** `DELETE /api/v1/tasks/{task_id}`

**Purpose:** Delete a task.

---

## Sprint Management APIs

### 1. Get All Sprints
**Endpoint:** `GET /api/v1/sprints/`

**Purpose:** Retrieve sprints with role-based filtering.

**Query Parameters:**
- `skip`, `limit`: Pagination
- `project_id` (int): Filter by project

**Response:**
```json
[
    {
        "id": 1,
        "name": "Sprint 1",
        "description": "Initial development sprint",
        "status": "active",
        "start_date": "2025-01-22",
        "end_date": "2025-02-05",
        "project_id": 1,
        "goal": "Complete user authentication and basic UI",
        "created_at": "2025-01-22T10:30:00Z"
    }
]
```

**Sprint Status Values:** `planned`, `active`, `completed`

### 2. Get Sprint by ID
**Endpoint:** `GET /api/v1/sprints/{sprint_id}`

**Purpose:** Get detailed sprint information.

### 3. Create Sprint
**Endpoint:** `POST /api/v1/sprints/`

**Purpose:** Create a new sprint (Team Leader+ only).

**Request Body:**
```json
{
    "name": "Sprint 2",
    "description": "Second development sprint",
    "status": "planned",
    "start_date": "2025-02-06",
    "end_date": "2025-02-20",
    "project_id": 1,
    "goal": "Complete core features"
}
```

### 4. Add Tasks to Sprint
**Endpoint:** `POST /api/v1/sprints/{sprint_id}/tasks`

**Purpose:** Add multiple tasks to a sprint.

**Request Body:**
```json
{
    "task_ids": [1, 2, 3, 4]
}
```

### 5. Remove Tasks from Sprint
**Endpoint:** `DELETE /api/v1/sprints/{sprint_id}/tasks`

**Purpose:** Remove tasks from a sprint.

### 6. Start Sprint
**Endpoint:** `POST /api/v1/sprints/{sprint_id}/start`

**Purpose:** Change sprint status to active.

### 7. Complete Sprint
**Endpoint:** `POST /api/v1/sprints/{sprint_id}/complete`

**Purpose:** Mark sprint as completed.

---

## Team Management APIs

### 1. Get All Teams
**Endpoint:** `GET /api/v1/teams/`

**Purpose:** Retrieve teams with role-based access control.

**Query Parameters:**
- `skip`, `limit`: Pagination
- `project_id` (int): Filter teams by project
- `include_members` (bool): Include team member details

**Response:**
```json
[
    {
        "id": 1,
        "name": "Frontend Team",
        "description": "UI/UX development team",
        "team_leader_id": 3,
        "created_at": "2025-01-22T10:30:00Z",
        "project_count": 2,
        "team_leader": {
            "id": 3,
            "username": "team_lead1",
            "full_name": "Bob Leader"
        },
        "members": [
            {
                "id": 4,
                "username": "developer2",
                "full_name": "Alice Developer"
            }
        ]
    }
]
```

### 2. Create Team
**Endpoint:** `POST /api/v1/teams/`

**Purpose:** Create a new team (Admin/Project Manager only).

**Request Body:**
```json
{
    "name": "Backend Team",
    "description": "Server-side development team",
    "team_leader_id": 5
}
```

### 3. Add Member to Team
**Endpoint:** `POST /api/v1/teams/{team_id}/members`

**Purpose:** Add a user to a team.

**Request Body:**
```json
{
    "user_id": 6
}
```

### 4. Remove Member from Team
**Endpoint:** `DELETE /api/v1/teams/{team_id}/members/{user_id}`

**Purpose:** Remove a user from a team.

### 5. Assign Team to Project
**Endpoint:** `POST /api/v1/teams/{team_id}/projects`

**Purpose:** Assign a team to work on a project.

**Request Body:**
```json
{
    "project_id": 2
}
```

---

## Time Tracking APIs

### 1. Get Time Logs
**Endpoint:** `GET /api/v1/time-logs/`

**Purpose:** Retrieve time logs with filtering options.

**Query Parameters:**
- `skip`, `limit`: Pagination
- `task_id` (int): Filter by task
- `user_id` (int): Filter by user
- `start_date` (datetime): Filter from date
- `end_date` (datetime): Filter to date

**Response:**
```json
[
    {
        "id": 1,
        "description": "Implemented login functionality",
        "hours": 3.5,
        "date": "2025-01-22",
        "task_id": 1,
        "user_id": 2,
        "created_at": "2025-01-22T18:00:00Z",
        "updated_at": null
    }
]
```

### 2. Create Time Log
**Endpoint:** `POST /api/v1/time-logs/`

**Purpose:** Log time spent on a task.

**Request Body:**
```json
{
    "description": "Fixed authentication bugs",
    "hours": 2.0,
    "date": "2025-01-22",
    "task_id": 1
}
```

### 3. Start Timer
**Endpoint:** `POST /api/v1/time-logs/timer/start`

**Purpose:** Start a live timer for a task.

**Request Body:**
```json
{
    "task_id": 1
}
```

**Response:**
```json
{
    "id": 1,
    "task_id": 1,
    "start_time": "2025-01-22T14:30:00Z",
    "message": "Timer started successfully"
}
```

### 4. Stop Timer
**Endpoint:** `POST /api/v1/time-logs/timer/stop`

**Purpose:** Stop the active timer and create a time log.

**Request Body:**
```json
{
    "description": "Completed feature implementation"
}
```

### 5. Get Active Timer
**Endpoint:** `GET /api/v1/time-logs/active-timer`

**Purpose:** Get current user's active timer status.

**Response:**
```json
{
    "id": 1,
    "task_id": 1,
    "user_id": 2,
    "start_time": "2025-01-22T14:30:00Z",
    "is_active": true,
    "task_title": "Implement user authentication",
    "project_name": "Mobile App Development",
    "elapsed_seconds": 1800
}
```

---

## Dashboard & Reporting APIs

### 1. Get Dashboard Data
**Endpoint:** `GET /api/v1/dashboard/dashboard`

**Purpose:** Get comprehensive dashboard statistics for the current user.

**Response:**
```json
{
    "user_info": {
        "id": 2,
        "username": "developer1",
        "full_name": "Jane Developer",
        "role": "developer"
    },
    "project_stats": {
        "total_projects": 3,
        "active_projects": 2
    },
    "task_stats": {
        "my_total_tasks": 12,
        "my_todo": 3,
        "my_in_progress": 5,
        "my_review": 2,
        "my_done": 2,
        "my_blocked": 0
    },
    "story_points": {
        "my_total_story_points": 45,
        "my_completed_story_points": 20
    },
    "sprint_stats": {
        "active_sprints": 2,
        "total_sprints": 8
    },
    "time_stats": {
        "total_hours_logged": 156.5,
        "this_week_hours": 38.0,
        "today_hours": 6.5
    },
    "team_info": {
        "teams_count": 2,
        "led_teams_count": 0,
        "member_teams_count": 2
    }
}
```

### 2. Get User Statistics
**Endpoint:** `GET /api/v1/dashboard/user-stats/{user_id}`

**Purpose:** Get detailed statistics for a specific user.

### 3. Get Team Statistics
**Endpoint:** `GET /api/v1/dashboard/team-stats/{team_id}`

**Purpose:** Get performance statistics for a team.

### 4. Get Advanced Reports
**Endpoint:** `GET /api/v1/reports/advanced`

**Purpose:** Get comprehensive project and team reports with detailed analytics.

**Query Parameters:**
- `start_date`, `end_date`: Date range filters
- `project_ids`: List of project IDs to include
- `team_ids`: List of team IDs to include
- `include_charts`: Include chart data for visualization

### 5. Get Productivity Summary
**Endpoint:** `GET /api/v1/advanced-reports/productivity-summary`

**Purpose:** Get productivity metrics for different time periods.

**Query Parameters:**
- `period` (str): Time period - "day", "week", "month", "quarter", "year"
- `team_id` (int): Filter by specific team
- `project_id` (int): Filter by specific project

**Response:**
```json
{
    "period": "week",
    "date_range": {
        "start": "2025-01-20T00:00:00",
        "end": "2025-01-27T00:00:00"
    },
    "metrics": {
        "total_hours": 156.5,
        "total_story_points": 45,
        "unique_users": 8,
        "unique_projects": 3,
        "velocity": 6.43,
        "efficiency": 0.29
    },
    "breakdown": {
        "daily_hours": [22.5, 18.0, 25.5, 31.0, 28.5, 21.0, 10.0],
        "daily_story_points": [6, 5, 8, 12, 9, 3, 2]
    }
}
```

### 6. Export Time Logs
**Endpoint:** `GET /api/v1/advanced-reports/export/time-logs`

**Purpose:** Export time tracking data in CSV or JSON format.

**Query Parameters:**
- `format` (str): Export format - "csv" or "json"
- `start_date`, `end_date`: Date range
- `project_id`, `team_id`: Filters

**Response:** File download with time tracking data

### 7. Export Tasks Report
**Endpoint:** `GET /api/v1/advanced-reports/export/tasks`

**Purpose:** Export task data with completion metrics.

### 8. Export Team Performance
**Endpoint:** `GET /api/v1/advanced-reports/export/team-performance`

**Purpose:** Export team productivity and performance metrics.

---

## Bug Report APIs

### 1. Get Bug Reports
**Endpoint:** `GET /api/v1/bug-reports/`

**Purpose:** Retrieve bug reports with filtering.

**Query Parameters:**
- `project_id`, `assignee_id`: Filters
- `severity`, `status`: Filter by severity/status

**Response:**
```json
[
    {
        "id": 1,
        "title": "Login page crashes on iOS",
        "description": "App crashes when tapping login button on iOS devices",
        "severity": "high",
        "status": "open",
        "project_id": 1,
        "reported_by_id": 2,
        "assigned_to_id": 3,
        "created_at": "2025-01-22T10:30:00Z"
    }
]
```

**Bug Severity Values:** `low`, `medium`, `high`, `critical`
**Bug Status Values:** `open`, `in_progress`, `resolved`, `closed`

### 2. Create Bug Report
**Endpoint:** `POST /api/v1/bug-reports/`

**Purpose:** Report a new bug.

**Request Body:**
```json
{
    "title": "Navigation menu not responsive",
    "description": "Menu doesn't work on mobile devices",
    "severity": "medium",
    "project_id": 1,
    "assigned_to_id": 3
}
```

---

## Milestone APIs

### 1. Get Milestones
**Endpoint:** `GET /api/v1/milestones/`

**Purpose:** Retrieve milestones for sprints.

**Response:**
```json
[
    {
        "id": 1,
        "name": "Authentication Complete",
        "description": "All authentication features implemented",
        "due_date": "2025-02-01",
        "completed_at": null,
        "sprint_id": 1,
        "created_at": "2025-01-22T10:30:00Z"
    }
]
```

### 2. Create Milestone
**Endpoint:** `POST /api/v1/milestones/`

**Purpose:** Create a milestone for a sprint.

### 3. Complete Milestone
**Endpoint:** `POST /api/v1/milestones/{milestone_id}/complete`

**Purpose:** Mark a milestone as completed.

---

## Backlog APIs

### 1. Get Backlog Items
**Endpoint:** `GET /api/v1/backlogs/`

**Purpose:** Retrieve product backlog items.

**Query Parameters:**
- `skip`, `limit`: Pagination
- `project_id` (int): Filter by project

**Response:**
```json
[
    {
        "id": 1,
        "title": "User profile management",
        "description": "Allow users to update their profiles",
        "priority": 2,
        "story_points": 5,
        "project_id": 1,
        "status": "new",
        "created_by_id": 1,
        "created_at": "2025-01-22T10:30:00Z"
    }
]
```

### 2. Get Backlog Item by ID
**Endpoint:** `GET /api/v1/backlogs/{backlog_id}`

**Purpose:** Get detailed backlog item information.

### 3. Create Backlog Item
**Endpoint:** `POST /api/v1/backlogs/`

**Purpose:** Add new item to product backlog.

**Request Body:**
```json
{
    "title": "User notification system",
    "description": "Implement push notifications and email alerts",
    "priority": 3,
    "story_points": 8,
    "project_id": 1,
    "status": "new"
}
```

### 4. Update Backlog Item
**Endpoint:** `PUT /api/v1/backlogs/{backlog_id}`

**Purpose:** Update backlog item details.

### 5. Delete Backlog Item
**Endpoint:** `DELETE /api/v1/backlogs/{backlog_id}`

**Purpose:** Remove backlog item.

### 6. Convert to Task
**Endpoint:** `POST /api/v1/backlogs/{backlog_id}/convert-to-task`

**Purpose:** Convert backlog item to a sprint task.

---

## Tag Management APIs

### 1. Get All Tags
**Endpoint:** `GET /api/v1/tags/`

**Purpose:** Retrieve all tags with optional category filtering.

**Query Parameters:**
- `category` (str): Filter by tag category (e.g., "priority", "type", "technology")

**Response:**
```json
[
    {
        "id": 1,
        "name": "urgent",
        "description": "High priority items",
        "color": "#FF0000",
        "category": "priority",
        "created_at": "2025-01-22T10:30:00Z"
    },
    {
        "id": 2,
        "name": "frontend",
        "description": "Frontend development tasks",
        "color": "#00FF00",
        "category": "technology",
        "created_at": "2025-01-22T10:30:00Z"
    }
]
```

### 2. Create Tag
**Endpoint:** `POST /api/v1/tags/`

**Purpose:** Create a new tag (Admin/Project Manager only).

**Request Body:**
```json
{
    "name": "backend",
    "description": "Backend development tasks",
    "color": "#0000FF",
    "category": "technology"
}
```

### 3. Get Tag by ID
**Endpoint:** `GET /api/v1/tags/{tag_id}`

**Purpose:** Get specific tag information.

### 4. Update Tag
**Endpoint:** `PUT /api/v1/tags/{tag_id}`

**Purpose:** Update tag information (Admin/Project Manager only).

### 5. Delete Tag
**Endpoint:** `DELETE /api/v1/tags/{tag_id}`

**Purpose:** Delete a tag (Admin/Project Manager only).

---

## Task Dependencies APIs

### 1. Get Task Dependencies
**Endpoint:** `GET /api/v1/task-dependencies/task/{task_id}/dependencies`

**Purpose:** Get all dependencies for a specific task.

**Response:**
```json
[
    {
        "id": 1,
        "task_id": 5,
        "depends_on_task_id": 3,
        "dependency_type": "blocks",
        "created_at": "2025-01-22T10:30:00Z",
        "depends_on_task": {
            "id": 3,
            "title": "Setup database schema",
            "status": "done"
        }
    }
]
```

### 2. Create Task Dependency
**Endpoint:** `POST /api/v1/task-dependencies/task/{task_id}/dependencies`

**Purpose:** Create a dependency relationship between tasks.

**Request Body:**
```json
{
    "depends_on_task_id": 3,
    "dependency_type": "blocks"
}
```

**Features:**
- Prevents circular dependencies
- Validates task existence
- Checks project access permissions

### 3. Delete Task Dependency
**Endpoint:** `DELETE /api/v1/task-dependencies/{dependency_id}`

**Purpose:** Remove a task dependency relationship.

---

## Version Management APIs

### 1. Get Project Versions
**Endpoint:** `GET /api/v1/versions/project/{project_id}/versions`

**Purpose:** Get all versions for a specific project.

**Response:**
```json
[
    {
        "id": 1,
        "version_number": "1.0.0",
        "description": "Initial release with core features",
        "project_id": 1,
        "release_date": "2025-03-01",
        "is_released": true,
        "created_at": "2025-01-22T10:30:00Z"
    },
    {
        "id": 2,
        "version_number": "1.1.0",
        "description": "Feature updates and bug fixes",
        "project_id": 1,
        "release_date": null,
        "is_released": false,
        "created_at": "2025-02-01T10:30:00Z"
    }
]
```

### 2. Create Project Version
**Endpoint:** `POST /api/v1/versions/project/{project_id}/versions`

**Purpose:** Create a new version for a project.

**Request Body:**
```json
{
    "version_number": "1.2.0",
    "description": "Major feature additions and performance improvements",
    "release_date": "2025-04-15"
}
```

### 3. Get Version by ID
**Endpoint:** `GET /api/v1/versions/{version_id}`

**Purpose:** Get detailed information about a specific version.

### 4. Update Version
**Endpoint:** `PUT /api/v1/versions/{version_id}`

**Purpose:** Update version information.

### 5. Release Version
**Endpoint:** `POST /api/v1/versions/{version_id}/release`

**Purpose:** Mark a version as released.

---

## Advanced Query APIs

### 1. Project Analytics
**Endpoint:** `GET /api/v1/advanced-queries/project-analytics`

**Purpose:** Get comprehensive project analytics and metrics.

### 2. User Performance Report
**Endpoint:** `GET /api/v1/advanced-queries/user-performance`

**Purpose:** Get detailed user performance metrics.

### 3. Time Tracking Summary
**Endpoint:** `GET /api/v1/advanced-queries/time-summary`

**Purpose:** Get time tracking summaries with various breakdowns.

---

## Data Models & Enums

### User Roles
- `admin`: Full system access
- `project_manager`: Manage projects and teams
- `team_leader`: Lead teams and manage sprints
- `developer`: Development tasks
- `tester`: Testing and QA tasks  
- `viewer`: Read-only access

### Task Status Values
- `todo`: Not started
- `in_progress`: Currently being worked on
- `review`: Under review/testing
- `done`: Completed
- `blocked`: Cannot proceed

### Task Priority Levels
- `1`: Low priority
- `2`: Medium priority
- `3`: High priority
- `4`: Critical priority

### Project Status Values
- `active`: Currently active
- `completed`: Finished
- `archived`: Archived/inactive

### Sprint Status Values
- `planned`: Not yet started
- `active`: Currently running
- `completed`: Finished

### Bug Severity Levels
- `low`: Minor issue
- `medium`: Moderate impact
- `high`: Significant impact
- `critical`: System breaking

### Bug Status Values
- `open`: Newly reported
- `in_progress`: Being fixed
- `resolved`: Fix implemented
- `closed`: Verified and closed

---

## Authentication & Authorization

All API endpoints (except `/auth/login` and `/auth/register`) require authentication via Bearer token:

```
Authorization: Bearer <your_access_token>
```

Role-based access control is enforced:
- **Admins**: Full access to all endpoints
- **Project Managers**: Can manage projects, teams, and users
- **Team Leaders**: Can manage their teams and assigned projects
- **Developers/Testers**: Can view and update assigned tasks
- **Viewers**: Read-only access to assigned projects

---

## Error Handling

Standard HTTP status codes are used:
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

Error responses include detail messages:
```json
{
    "detail": "Error description here"
}
```

---

## Pagination, Filtering & Advanced Usage

### Pagination
Most list endpoints support pagination using `skip` and `limit` parameters:

```bash
# Get first 20 tasks
GET /api/v1/tasks/?skip=0&limit=20

# Get next 20 tasks  
GET /api/v1/tasks/?skip=20&limit=20
```

### Filtering Examples

**Multiple Filters:**
```bash
# Get high priority tasks assigned to user 5 in project 1
GET /api/v1/tasks/?project_id=1&assignee_id=5&priority=3

# Get time logs for specific date range
GET /api/v1/time-logs/?start_date=2025-01-01&end_date=2025-01-31
```

**Expand Related Objects:**
```bash
# Get tasks with project, assignee, and sprint details
GET /api/v1/tasks/?expand=true

# Get project with task statistics and team information
GET /api/v1/projects/1?expand=true&include_details=true
```

### Complex Workflow Examples

**Creating a Complete Sprint:**
```bash
# 1. Create sprint
POST /api/v1/sprints/
{
    "name": "Sprint 3",
    "project_id": 1,
    "start_date": "2025-02-01",
    "end_date": "2025-02-14"
}

# 2. Add tasks to sprint
POST /api/v1/sprints/3/tasks
{
    "task_ids": [15, 16, 17, 18]
}

# 3. Start sprint
POST /api/v1/sprints/3/start
```

**Time Tracking Workflow:**
```bash
# 1. Start timer for task
POST /api/v1/time-logs/timer/start
{
    "task_id": 15
}

# 2. Check active timer status
GET /api/v1/time-logs/active-timer

# 3. Stop timer and create log
POST /api/v1/time-logs/timer/stop
{
    "description": "Completed user authentication feature"
}
```

**Team Management Workflow:**
```bash
# 1. Create team
POST /api/v1/teams/
{
    "name": "Mobile Development Team",
    "team_leader_id": 5
}

# 2. Add members
POST /api/v1/teams/2/members
{
    "user_id": 10
}

# 3. Assign to project
POST /api/v1/teams/2/projects
{
    "project_id": 1
}
```

---

## WebSocket Endpoints (Real-time Features)

### Live Time Tracking Updates
**Endpoint:** `ws://localhost:8000/ws/time-tracking/{user_id}`

**Purpose:** Real-time timer updates and notifications.

**Events:**
- `timer_started`: When user starts a timer
- `timer_stopped`: When user stops a timer
- `timer_update`: Periodic timer status updates

### Task Status Updates
**Endpoint:** `ws://localhost:8000/ws/tasks/{project_id}`

**Purpose:** Real-time task status change notifications.

**Events:**
- `task_created`: New task added
- `task_updated`: Task status/details changed
- `task_assigned`: Task assigned to team member

---

## Performance & Optimization Tips

### 1. Use Pagination
Always use pagination for large datasets to improve response times:
```bash
# Good
GET /api/v1/tasks/?limit=50

# Avoid
GET /api/v1/tasks/  # Could return thousands of records
```

### 2. Strategic Use of Expand Parameter
Only expand related objects when needed:
```bash
# Minimal data for lists
GET /api/v1/projects/?expand=false

# Full details for single item view
GET /api/v1/projects/1?expand=true
```

### 3. Filter at API Level
Filter data using query parameters rather than client-side filtering:
```bash
# Efficient server-side filtering
GET /api/v1/tasks/?status=in_progress&assignee_id=5

# Avoid: Getting all tasks and filtering client-side
GET /api/v1/tasks/  # Then filter thousands of records in frontend
```

### 4. Use Specific Date Ranges
For time-based reports, use specific date ranges:
```bash
# Good: Specific range
GET /api/v1/reports/time-logs?start_date=2025-01-01&end_date=2025-01-31

# Avoid: Open-ended queries
GET /api/v1/reports/time-logs
```

---

## Integration Examples

### JavaScript/Frontend Integration
```javascript
// Authentication
const token = localStorage.getItem('access_token');
const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};

// Get dashboard data
const dashboard = await fetch('/api/v1/dashboard/dashboard', { headers })
    .then(res => res.json());

// Create task with error handling
try {
    const task = await fetch('/api/v1/tasks/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            title: 'New Feature',
            project_id: 1,
            assignee_id: 5,
            priority: 3
        })
    }).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    });
} catch (error) {
    console.error('Failed to create task:', error);
}
```

### Python Integration
```python
import requests

class GingaTaskAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {'Authorization': f'Bearer {token}'}
    
    def get_my_tasks(self, status=None):
        params = {'assignee_id': self.user_id}
        if status:
            params['status'] = status
        
        response = requests.get(
            f'{self.base_url}/api/v1/tasks/',
            headers=self.headers,
            params=params
        )
        return response.json()
    
    def log_time(self, task_id, hours, description):
        data = {
            'task_id': task_id,
            'hours': hours,
            'description': description,
            'date': '2025-01-22'
        }
        
        response = requests.post(
            f'{self.base_url}/api/v1/time-logs/',
            headers=self.headers,
            json=data
        )
        return response.json()

# Usage
api = GingaTaskAPI('http://localhost:8000', 'your_token_here')
my_tasks = api.get_my_tasks(status='in_progress')
```

---

## Common Use Cases & Solutions

### 1. Project Dashboard
**Endpoints needed:**
- `GET /api/v1/projects/{id}?expand=true`
- `GET /api/v1/dashboard/dashboard`
- `GET /api/v1/tasks/?project_id={id}&expand=true`

### 2. Time Tracking Application
**Endpoints needed:**
- `GET /api/v1/time-logs/active-timer`
- `POST /api/v1/time-logs/timer/start`
- `POST /api/v1/time-logs/timer/stop`
- `GET /api/v1/time-logs/?user_id={id}`

### 3. Team Management System
**Endpoints needed:**
- `GET /api/v1/teams/?include_members=true`
- `GET /api/v1/dashboard/team-stats/{team_id}`
- `GET /api/v1/reports/time-logs?team_id={id}`

### 4. Agile Sprint Board
**Endpoints needed:**
- `GET /api/v1/sprints/?project_id={id}`
- `GET /api/v1/tasks/?sprint_id={id}&expand=true`
- `PUT /api/v1/tasks/{id}/status`

---

## Rate Limiting & Best Practices

1. Use pagination parameters (`skip`, `limit`) for large datasets
2. Use the `expand` parameter to get related object details
3. Filter endpoints provide query parameters for efficient data retrieval
4. Time tracking APIs support both manual logging and live timers
5. Dashboard APIs provide aggregated data to minimize multiple requests
6. All datetime values are in UTC timezone
7. Use appropriate HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove)
8. Implement proper error handling for all API calls
9. Cache frequently accessed data on the client side
10. Use WebSocket connections for real-time features when available




