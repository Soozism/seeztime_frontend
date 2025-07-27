# 🔍 جزئیات کامل دسترسی‌های API - سیستم مدیریت تسک گینگا تک

## 📋 فهرست مطالب
- [Authentication & Authorization](#authentication--authorization)
- [User Management APIs](#user-management-apis)
- [Project Management APIs](#project-management-apis)
- [Task Management APIs](#task-management-apis)
- [Sprint Management APIs](#sprint-management-apis)
- [Team Management APIs](#team-management-apis)
- [Time Logging APIs](#time-logging-apis)
- [Bug Report APIs](#bug-report-apis)
- [Dashboard & Reporting APIs](#dashboard--reporting-apis)
- [Advanced Queries APIs](#advanced-queries-apis)
- [Milestone APIs](#milestone-apis)
- [Backlog APIs](#backlog-apis)
- [Version Management APIs](#version-management-apis)
- [Tag Management APIs](#tag-management-apis)

---

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "username",
  "exp": 1640995200,
  "iat": 1640991600
}
```

### Authorization Header Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 👥 User Management APIs

### `GET /api/v1/users/`
**Purpose**: Get all users in the system

**Permissions**:
- ✅ **Admin**: Full access to all users
- ❌ **Project Manager**: Access denied (403)
- ❌ **Team Leader**: Access denied (403)
- ❌ **Developer**: Access denied (403)
- ❌ **Tester**: Access denied (403)
- ❌ **Viewer**: Access denied (403)

**Response Example**:
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
  },
  {
    "id": 2,
    "username": "developer1",
    "email": "dev1@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "developer",
    "is_active": true,
    "created_at": "2025-01-22T11:00:00Z",
    "updated_at": null
  }
]
```

**Error Response (403)**:
```json
{
  "detail": "Not enough permissions"
}
```

### `GET /api/v1/users/me/`
**Purpose**: Get current user information

**Permissions**:
- ✅ **All Roles**: Access to own information

**Response Example**:
```json
{
  "id": 2,
  "username": "developer1",
  "email": "dev1@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "developer",
  "is_active": true,
  "created_at": "2025-01-22T11:00:00Z",
  "updated_at": null
}
```

### `PUT /api/v1/users/{id}`
**Purpose**: Update user information

**Permissions**:
- ✅ **Admin**: Can update any user
- ✅ **All Roles**: Can update own information
- ❌ **Other Roles**: Cannot update other users

**Request Example**:
```json
{
  "first_name": "Updated Name",
  "last_name": "Updated Last",
  "email": "updated@example.com"
}
```

**Response Example**:
```json
{
  "id": 2,
  "username": "developer1",
  "email": "updated@example.com",
  "first_name": "Updated Name",
  "last_name": "Updated Last",
  "role": "developer",
  "is_active": true,
  "created_at": "2025-01-22T11:00:00Z",
  "updated_at": "2025-01-22T15:30:00Z"
}
```

**Error Response (403)**:
```json
{
  "detail": "You can only update your own profile"
}
```

---

## 📋 Project Management APIs

### `GET /api/v1/projects/`
**Purpose**: Get projects based on user role

**Permissions**:
- ✅ **Admin**: All projects
- ✅ **Project Manager**: All projects
- ✅ **Team Leader**: Projects assigned to teams they lead
- ✅ **Developer/Tester**: Projects where they have assigned tasks
- ✅ **Viewer**: Projects assigned to their teams

**Response Example**:
```json
[
  {
    "id": 1,
    "name": "E-commerce Platform",
    "description": "Online shopping platform",
    "status": "active",
    "created_by_id": 1,
    "created_at": "2025-01-22T10:00:00Z",
    "updated_at": null,
    "created_by": {
      "id": 1,
      "username": "admin",
      "full_name": "Admin User"
    }
  }
]
```

### `POST /api/v1/projects/`
**Purpose**: Create new project

**Permissions**:
- ✅ **Admin**: Can create projects
- ✅ **Project Manager**: Can create projects
- ❌ **Team Leader**: Access denied (403)
- ❌ **Developer**: Access denied (403)
- ❌ **Tester**: Access denied (403)
- ❌ **Viewer**: Access denied (403)

**Request Example**:
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "active"
}
```

**Response Example**:
```json
{
  "id": 2,
  "name": "New Project",
  "description": "Project description",
  "status": "active",
  "created_by_id": 1,
  "created_at": "2025-01-22T16:00:00Z",
  "updated_at": null,
  "created_by": {
    "id": 1,
    "username": "admin",
    "full_name": "Admin User"
  }
}
```

**Error Response (403)**:
```json
{
  "detail": "Not enough permissions to create projects"
}
```

### `GET /api/v1/projects/{id}`
**Purpose**: Get specific project details

**Permissions**:
- ✅ **Admin/Project Manager**: Full access
- ✅ **Team Leader**: If team leads project
- ✅ **Developer/Tester**: If has tasks in project
- ✅ **Viewer**: If team assigned to project

**Response Example**:
```json
{
  "id": 1,
  "name": "E-commerce Platform",
  "description": "Online shopping platform",
  "status": "active",
  "created_by_id": 1,
  "created_at": "2025-01-22T10:00:00Z",
  "updated_at": null,
  "created_by": {
    "id": 1,
    "username": "admin",
    "full_name": "Admin User"
  },
  "task_count": 15,
  "sprint_count": 3,
  "team_count": 2
}
```

**Error Response (403)**:
```json
{
  "detail": "Access denied to this project"
}
```

### `PUT /api/v1/projects/{id}`
**Purpose**: Update project information

**Permissions**:
- ✅ **Admin**: Can update any project
- ✅ **Project Manager**: Can update any project
- ✅ **Team Leader**: Can update projects assigned to their teams
- ❌ **Developer**: Access denied (403)
- ❌ **Tester**: Access denied (403)
- ❌ **Viewer**: Access denied (403)

**Request Example**:
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "active"
}
```

**Error Response (403)**:
```json
{
  "detail": "You don't have permission to update this project"
}
```

---

## 📝 Task Management APIs

### `GET /api/v1/tasks/`
**Purpose**: Get tasks based on user role

**Permissions**:
- ✅ **Admin**: All tasks
- ✅ **Project Manager**: All tasks
- ✅ **Team Leader**: Tasks in projects assigned to their teams
- ✅ **Developer/Tester**: Assigned tasks
- ✅ **Viewer**: Tasks in assigned projects

**Response Example**:
```json
[
  {
    "id": 1,
    "title": "Implement user authentication",
    "description": "Create login and registration system",
    "status": "in_progress",
    "priority": 3,
    "story_points": 8,
    "project_id": 1,
    "assignee_id": 2,
    "created_by_id": 1,
    "sprint_id": 1,
    "created_at": "2025-01-22T10:00:00Z",
    "updated_at": null,
    "project": {
      "id": 1,
      "name": "E-commerce Platform"
    },
    "assignee": {
      "id": 2,
      "username": "developer1",
      "full_name": "John Doe"
    },
    "created_by": {
      "id": 1,
      "username": "admin",
      "full_name": "Admin User"
    }
  }
]
```

### `POST /api/v1/tasks/`
**Purpose**: Create new task

**Permissions**:
- ✅ **Admin**: Can create tasks in any project
- ✅ **Project Manager**: Can create tasks in any project
- ✅ **Team Leader**: Can create tasks in projects assigned to their teams
- ❌ **Developer**: Access denied (403)
- ❌ **Tester**: Access denied (403)
- ❌ **Viewer**: Access denied (403)

**Request Example**:
```json
{
  "title": "New Task",
  "description": "Task description",
  "project_id": 1,
  "assignee_id": 2,
  "priority": 2,
  "story_points": 5,
  "sprint_id": 1
}
```

**Response Example**:
```json
{
  "id": 2,
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": 2,
  "story_points": 5,
  "project_id": 1,
  "assignee_id": 2,
  "created_by_id": 1,
  "sprint_id": 1,
  "created_at": "2025-01-22T16:00:00Z",
  "updated_at": null,
  "project": {
    "id": 1,
    "name": "E-commerce Platform"
  },
  "assignee": {
    "id": 2,
    "username": "developer1",
    "full_name": "John Doe"
  },
  "created_by": {
    "id": 1,
    "username": "admin",
    "full_name": "Admin User"
  }
}
```

**Error Response (403)**:
```json
{
  "detail": "You don't have permission to create tasks in this project"
}
```

### `PUT /api/v1/tasks/{task_id}`
**Purpose**: Update task information

**Permissions**:
- ✅ **Admin**: Can update any task
- ✅ **Project Manager**: Can update any task
- ✅ **Team Leader**: Can update tasks in projects assigned to their teams
- ✅ **Developer/Tester**: Can update assigned tasks
- ❌ **Viewer**: Access denied (403)

**Request Example**:
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": 3,
  "story_points": 8
}
```

**Error Response (403)**:
```json
{
  "detail": "You don't have permission to update this task"
}
```

### `PATCH /api/v1/tasks/{task_id}/status`
**Purpose**: Update task status

**Permissions**:
- ✅ **Admin**: Can update any task status
- ✅ **Project Manager**: Can update any task status
- ✅ **Team Leader**: Can update task status in projects assigned to their teams
- ✅ **Developer/Tester**: Can update status of assigned tasks
- ❌ **Viewer**: Access denied (403)

**Request Example**:
```json
{
  "status": "in_progress"
}
```

**Response Example**:
```json
{
  "id": 1,
  "title": "Implement user authentication",
  "status": "in_progress",
  "updated_at": "2025-01-22T16:30:00Z"
}
```

**Error Response (403)**:
```json
{
  "detail": "You don't have permission to update this task status"
}
```

---

## 🏃‍♂️ Sprint Management APIs

### `GET /api/v1/sprints/`
**Purpose**: Get sprints based on user role

**Permissions**:
- ✅ **Admin**: All sprints
- ✅ **Project Manager**: All sprints
- ✅ **Team Leader**: Sprints in projects assigned to their teams
- ✅ **Developer/Tester**: Sprints in projects where they have tasks
- ✅ **Viewer**: Sprints in assigned projects

**Response Example**:
```json
[
  {
    "id": 1,
    "name": "Sprint 1",
    "description": "First sprint of the project",
    "start_date": "2025-01-22T00:00:00Z",
    "end_date": "2025-02-05T00:00:00Z",
    "status": "active",
    "project_id": 1,
    "created_at": "2025-01-22T10:00:00Z",
    "updated_at": null,
    "project": {
      "id": 1,
      "name": "E-commerce Platform"
    },
    "task_count": 8,
    "completed_task_count": 3
  }
]
```

### `POST /api/v1/sprints/`
**Purpose**: Create new sprint

**Permissions**:
- ✅ **Admin**: Can create sprints in any project
- ✅ **Project Manager**: Can create sprints in any project
- ✅ **Team Leader**: Can create sprints in projects assigned to their teams
- ❌ **Developer**: Access denied (403)
- ❌ **Tester**: Access denied (403)
- ❌ **Viewer**: Access denied (403)

**Request Example**:
```json
{
  "name": "Sprint 2",
  "description": "Second sprint",
  "start_date": "2025-02-06T00:00:00Z",
  "end_date": "2025-02-20T00:00:00Z",
  "project_id": 1
}
```

**Error Response (403)**:
```json
{
  "detail": "You don't have permission to create sprints in this project"
}
```

### `PUT /api/v1/sprints/{sprint_id}`
**Purpose**: Update sprint information

**Permissions**:
- ✅ **Admin**: Can update any sprint
- ✅ **Project Manager**: Can update any sprint
- ✅ **Team Leader**: Can update sprints in projects assigned to their teams
- ❌ **Developer**: Access denied (403)
- ❌ **Tester**: Access denied (403)
- ❌ **Viewer**: Access denied (403)

**Error Response (403)**:
```json
{
  "detail": "You don't have permission to update this sprint"
}
```

---

## 👥 Team Management APIs

### `GET /api/v1/teams/`
**Purpose**: Get teams based on user role

**Permissions**:
- ✅ **Admin**: All teams
- ✅ **Project Manager**: All teams
- ✅ **Team Leader**: Teams they lead
- ✅ **Developer/Tester**: Teams they are members of
- ✅ **Viewer**: Teams they are members of

**Response Example**:
```json
[
  {
    "id": 1,
    "name": "Development Team",
    "description": "Main development team",
    "team_leader_id": 3,
    "created_at": "2025-01-22T10:00:00Z",
    "updated_at": null,
    "team_leader": {
      "id": 3,
      "username": "team_leader1",
      "full_name": "Team Leader"
    },
    "member_count": 5,
    "project_count": 2
  }
]
```

### `POST /api/v1/teams/`
**Purpose**: Create new team

**Permissions**:
- ✅ **Admin**: Can create teams
- ✅ **Project Manager**: Can create teams
- ❌ **Team Leader**: Access denied (403)
- ❌ **Developer**: Access denied (403)
- ❌ **Tester**: Access denied (403)
- ❌ **Viewer**: Access denied (403)

**Request Example**:
```json
{
  "name": "New Team",
  "description": "New team description",
  "team_leader_id": 3
}
```

**Error Response (403)**:
```json
{
  "detail": "Not enough permissions to create teams"
}
```

### `PUT /api/v1/teams/{team_id}`
**Purpose**: Update team information

**Permissions**:
- ✅ **Admin**: Can update any team
- ✅ **Project Manager**: Can update any team
- ✅ **Team Leader**: Can update teams they lead
- ❌ **Developer**: Access denied (403)
- ❌ **Tester**: Access denied (403)
- ❌ **Viewer**: Access denied (403)

**Error Response (403)**:
```json
{
  "detail": "Access denied"
}
```

---

## ⏱️ Time Logging APIs

### `GET /api/v1/time-logs/`
**Purpose**: Get time logs based on user role

**Permissions**:
- ✅ **Admin**: All time logs
- ✅ **Project Manager**: All time logs
- ✅ **Team Leader**: Time logs of team members
- ✅ **Developer/Tester**: Own time logs
- ✅ **Viewer**: Own time logs

**Response Example**:
```json
[
  {
    "id": 1,
    "user_id": 2,
    "task_id": 1,
    "hours": 4.5,
    "description": "Implemented login form",
    "date": "2025-01-22",
    "created_at": "2025-01-22T16:00:00Z",
    "updated_at": null,
    "user": {
      "id": 2,
      "username": "developer1",
      "full_name": "John Doe"
    },
    "task": {
      "id": 1,
      "title": "Implement user authentication"
    }
  }
]
```

### `POST /api/v1/time-logs/`
**Purpose**: Create time log entry

**Permissions**:
- ✅ **Admin**: Can create time logs for any user
- ✅ **Project Manager**: Can create time logs for any user
- ✅ **Team Leader**: Can create time logs for team members
- ✅ **Developer**: Can create own time logs
- ✅ **Tester**: Can create own time logs
- ❌ **Viewer**: Access denied (403)

**Request Example**:
```json
{
  "task_id": 1,
  "hours": 4.5,
  "description": "Worked on authentication system",
  "date": "2025-01-22"
}
```

**Error Response (403)**:
```json
{
  "detail": "Viewers cannot create time logs"
}
```

### `POST /api/v1/time-logs/start-timer`
**Purpose**: Start time tracking timer

**Permissions**:
- ✅ **Admin**: Can start timer for any user
- ✅ **Project Manager**: Can start timer for any user
- ✅ **Team Leader**: Can start timer for team members
- ✅ **Developer**: Can start own timer
- ✅ **Tester**: Can start own timer
- ❌ **Viewer**: Access denied (403)

**Request Example**:
```json
{
  "task_id": 1
}
```

**Response Example**:
```json
{
  "id": 1,
  "task_id": 1,
  "user_id": 2,
  "start_time": "2025-01-22T16:00:00Z",
  "is_active": true,
  "task_title": "Implement user authentication",
  "project_name": "E-commerce Platform"
}
```

**Error Response (403)**:
```json
{
  "detail": "Viewers cannot use timers"
}
```

### `POST /api/v1/time-logs/stop-timer`
**Purpose**: Stop time tracking timer

**Permissions**:
- ✅ **Admin**: Can stop timer for any user
- ✅ **Project Manager**: Can stop timer for any user
- ✅ **Team Leader**: Can stop timer for team members
- ✅ **Developer**: Can stop own timer
- ✅ **Tester**: Can stop own timer
- ❌ **Viewer**: Access denied (403)

**Request Example**:
```json
{
  "timer_id": 1,
  "description": "Completed authentication implementation"
}
```

**Response Example**:
```json
{
  "timer_id": 1,
  "time_log_id": 2,
  "duration_hours": 3.5,
  "description": "Completed authentication implementation"
}
```

---

## 🐛 Bug Report APIs

### `GET /api/v1/bug-reports/`
**Purpose**: Get bug reports based on user role

**Permissions**:
- ✅ **Admin**: All bug reports
- ✅ **Project Manager**: All bug reports
- ✅ **Team Leader**: Bug reports in projects assigned to their teams
- ✅ **Developer/Tester**: Own bug reports
- ✅ **Viewer**: Bug reports in assigned projects

**Response Example**:
```json
[
  {
    "id": 1,
    "title": "Login button not working",
    "description": "Users cannot click the login button",
    "severity": "high",
    "status": "open",
    "reported_by_id": 2,
    "task_id": 1,
    "created_at": "2025-01-22T16:00:00Z",
    "updated_at": null,
    "reported_by": {
      "id": 2,
      "username": "developer1",
      "full_name": "John Doe"
    },
    "task": {
      "id": 1,
      "title": "Implement user authentication"
    }
  }
]
```

### `POST /api/v1/bug-reports/`
**Purpose**: Create bug report

**Permissions**:
- ✅ **Admin**: Can create bug reports
- ✅ **Project Manager**: Can create bug reports
- ✅ **Team Leader**: Can create bug reports
- ✅ **Developer**: Can create bug reports
- ✅ **Tester**: Can create bug reports
- ❌ **Viewer**: Access denied (403)

**Request Example**:
```json
{
  "title": "New Bug Report",
  "description": "Bug description",
  "severity": "medium",
  "task_id": 1
}
```

**Error Response (403)**:
```json
{
  "detail": "Viewers cannot create bug reports"
}
```

### `PUT /api/v1/bug-reports/{bug_report_id}`
**Purpose**: Update bug report

**Permissions**:
- ✅ **Admin**: Can update any bug report
- ✅ **Project Manager**: Can update any bug report
- ✅ **Team Leader**: Can update bug reports in projects assigned to their teams
- ✅ **Developer/Tester**: Can update own bug reports
- ❌ **Viewer**: Access denied (403)

**Request Example**:
```json
{
  "title": "Updated Bug Title",
  "description": "Updated description",
  "severity": "high",
  "status": "in_progress"
}
```

**Error Response (403)**:
```json
{
  "detail": "You don't have permission to update this bug report"
}
```

---

## 📊 Dashboard & Reporting APIs

### `GET /api/v1/dashboard/dashboard`
**Purpose**: Get current user's dashboard data

**Permissions**:
- ✅ **All Roles**: Access to own dashboard

**Response Example**:
```json
{
  "user_info": {
    "id": 2,
    "username": "developer1",
    "full_name": "John Doe",
    "role": "developer",
    "email": "dev1@example.com"
  },
  "projects": {
    "total": 3,
    "active": 2,
    "accessible_projects": [
      {
        "id": 1,
        "name": "E-commerce Platform",
        "status": "active"
      }
    ]
  },
  "tasks": {
    "my_assigned_total": 15,
    "my_todo": 5,
    "my_in_progress": 7,
    "my_review": 2,
    "my_completed": 1,
    "my_blocked": 0,
    "accessible_total": 45
  },
  "story_points": {
    "my_total": 85,
    "my_completed": 45,
    "completion_rate": 52.94
  },
  "sprints": {
    "total": 8,
    "active": 2
  },
  "time_logs": {
    "total_hours": 120.5,
    "recent_logs": [
      {
        "id": 1,
        "task_title": "Implement user authentication",
        "hours": 4.5,
        "date": "2025-01-22"
      }
    ]
  },
  "teams": {
    "total": 2,
    "leading": 0,
    "team_details": [
      {
        "id": 1,
        "name": "Development Team",
        "member_count": 5,
        "project_count": 2
      }
    ]
  },
  "recent_tasks": [
    {
      "id": 1,
      "title": "Implement user authentication",
      "status": "in_progress",
      "priority": 3,
      "story_points": 8
    }
  ]
}
```

### `GET /api/v1/dashboard/dashboard/user/{user_id}`
**Purpose**: Get dashboard data for specific user

**Permissions**:
- ✅ **Admin**: Can view any user's dashboard
- ✅ **Project Manager**: Can view any user's dashboard
- ✅ **Team Leader**: Can view team members' dashboards
- ✅ **Developer/Tester**: Can view own dashboard only
- ❌ **Viewer**: Can view own dashboard only

**Error Response (403)**:
```json
{
  "detail": "Access denied. You can only view your own data or your team members' data."
}
```

---

## 🔍 Advanced Queries APIs

### `GET /api/v1/queries/tasks/by-sprint/{sprint_id}`
**Purpose**: Get tasks for specific sprint

**Permissions**:
- ✅ **Admin**: Can view tasks in any sprint
- ✅ **Project Manager**: Can view tasks in any sprint
- ✅ **Team Leader**: Can view tasks in sprints of projects assigned to their teams
- ✅ **Developer/Tester**: Can view tasks in sprints of projects where they have tasks
- ❌ **Viewer**: Access denied (403)

**Response Example**:
```json
[
  {
    "id": 1,
    "title": "Implement user authentication",
    "status": "in_progress",
    "priority": 3,
    "story_points": 8,
    "assignee": {
      "id": 2,
      "username": "developer1",
      "full_name": "John Doe"
    }
  }
]
```

### `GET /api/v1/queries/tasks/by-user/{user_id}`
**Purpose**: Get tasks for specific user

**Permissions**:
- ✅ **Admin**: Can view any user's tasks
- ✅ **Project Manager**: Can view any user's tasks
- ✅ **Team Leader**: Can view team members' tasks
- ✅ **Developer/Tester**: Can view own tasks only
- ❌ **Viewer**: Access denied (403)

**Error Response (403)**:
```json
{
  "detail": "You don't have permission to view this user's tasks"
}
```

---

## 🎯 Milestone APIs

### `GET /api/v1/milestones/`
**Purpose**: Get milestones based on user role

**Permissions**:
- ✅ **Admin**: All milestones
- ✅ **Project Manager**: All milestones
- ✅ **Team Leader**: Milestones in projects assigned to their teams
- ✅ **Developer/Tester**: Milestones in projects where they have tasks
- ✅ **Viewer**: Milestones in assigned projects

### `POST /api/v1/milestones/`
**Purpose**: Create milestone

**Permissions**:
- ✅ **Admin**: Can create milestones in any project
- ✅ **Project Manager**: Can create milestones in any project
- ✅ **Team Leader**: Can create milestones in projects assigned to their teams
- ❌ **Developer**: Access denied (403)
- ❌ **Tester**: Access denied (403)
- ❌ **Viewer**: Access denied (403)

---

## 📋 Backlog APIs

### `GET /api/v1/backlogs/`
**Purpose**: Get backlog items based on user role

**Permissions**:
- ✅ **Admin**: All backlog items
- ✅ **Project Manager**: All backlog items
- ✅ **Team Leader**: Backlog items in projects assigned to their teams
- ✅ **Developer/Tester**: Backlog items in projects where they have tasks
- ✅ **Viewer**: Backlog items in assigned projects

### `POST /api/v1/backlogs/`
**Purpose**: Create backlog item

**Permissions**:
- ✅ **Admin**: Can create backlog items in any project
- ✅ **Project Manager**: Can create backlog items in any project
- ✅ **Team Leader**: Can create backlog items in projects assigned to their teams
- ❌ **Developer**: Access denied (403)
- ❌ **Tester**: Access denied (403)
- ❌ **Viewer**: Access denied (403)

---

## 🔄 Version Management APIs

### `GET /api/v1/versions/`
**Purpose**: Get project versions based on user role

**Permissions**:
- ✅ **Admin**: All versions
- ✅ **Project Manager**: All versions
- ✅ **Team Leader**: Versions in projects assigned to their teams
- ✅ **Developer/Tester**: Versions in projects where they have tasks
- ✅ **Viewer**: Versions in assigned projects

### `POST /api/v1/versions/`
**Purpose**: Create version

**Permissions**:
- ✅ **Admin**: Can create versions in any project
- ✅ **Project Manager**: Can create versions in any project
- ✅ **Team Leader**: Can create versions in projects assigned to their teams
- ❌ **Developer**: Access denied (403)
- ❌ **Tester**: Access denied (403)
- ❌ **Viewer**: Access denied (403)

---

## 🏷️ Tag Management APIs

### `GET /api/v1/tags/`
**Purpose**: Get tags based on user role

**Permissions**:
- ✅ **Admin**: All tags
- ✅ **Project Manager**: All tags
- ✅ **Team Leader**: Tags used in projects assigned to their teams
- ✅ **Developer/Tester**: Tags used in projects where they have tasks
- ✅ **Viewer**: Tags used in assigned projects

### `POST /api/v1/tags/`
**Purpose**: Create tag

**Permissions**:
- ✅ **Admin**: Can create tags
- ✅ **Project Manager**: Can create tags
- ✅ **Team Leader**: Can create tags
- ❌ **Developer**: Access denied (403)
- ❌ **Tester**: Access denied (403)
- ❌ **Viewer**: Access denied (403)

---

## 📝 خلاصه دسترسی‌ها

### 🔐 **سطح دسترسی کامل (Admin)**
- تمام API ها
- تمام عملیات CRUD
- مدیریت کاربران و سیستم

### 📋 **سطح دسترسی مدیریتی (Project Manager)**
- تمام API ها (به جز مدیریت کاربران)
- مدیریت پروژه‌ها و تیم‌ها
- مشاهده تمام گزارش‌ها

### 👥 **سطح دسترسی رهبری (Team Leader)**
- مدیریت تیم خود
- مدیریت پروژه‌های تخصیص داده شده
- مشاهده گزارش‌های تیم

### 💻 **سطح دسترسی کاری (Developer/Tester)**
- کار روی تسک‌های محول شده
- ثبت زمان کار
- گزارش باگ
- مشاهده محدود

### 👁️ **سطح دسترسی مشاهده (Viewer)**
- فقط مشاهده
- بدون قابلیت ویرایش
- گزارش‌های محدود

---

## ⚠️ نکات مهم

1. **احراز هویت اجباری**: تمام API ها (به جز login/register) نیاز به JWT token دارند
2. **بررسی نقش**: هر درخواست بر اساس نقش کاربر بررسی می‌شود
3. **دسترسی تیم**: کاربران فقط به داده‌های تیم‌های خود دسترسی دارند
4. **خطای 403**: برای دسترسی‌های غیرمجاز
5. **خطای 404**: برای منابع موجود نبوده
6. **خطای 401**: برای احراز هویت ناموفق

این سیستم امنیتی قوی و انعطاف‌پذیر امکان مدیریت پروژه‌های پیچیده را با حفظ امنیت و کنترل دسترسی فراهم می‌کند. 