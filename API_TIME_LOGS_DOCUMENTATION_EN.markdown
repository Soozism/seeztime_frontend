# Time Logs API Documentation

This API provides endpoints for managing time logs and live timers for tasks in a project management system. It includes advanced features for time tracking, reporting, and access control. This documentation covers all endpoints, response models, error handling, prerequisites, user roles, and database structure.

---

## Prerequisites
- **Authentication**: All requests require a valid authentication token (e.g., JWT) in the `Authorization` header. The user must be active.
- **Database**: Uses a relational database (e.g., PostgreSQL) with SQLAlchemy for data management.
- **Date Format**: All dates must be provided in ISO 8601 format (e.g., `2025-07-24T08:00:00+00:00`).
- **Dependencies**: Requires Python 3.8+ and libraries including FastAPI, SQLAlchemy, and Pydantic.

---

## User Roles
The system defines the following user roles, which determine access permissions for the Time Logs API:
- `admin`: Full access to all operations (create, update, delete time logs and timers for any task).
- `project_manager`: Can start timers and log time for any tasks within their projects, without assignment restrictions.
- `team_leader`: Not explicitly used in the Time Logs API; may have similar permissions to `project_manager` in related APIs (e.g., task or project management).
- `developer`: Can only log time and start/stop timers for tasks assigned to them.
- `tester`: Not explicitly used in the Time Logs API; may have similar restrictions to `developer` in related APIs.
- `viewer`: Not explicitly used in the Time Logs API; likely has read-only access in related APIs.

**Note**: The Time Logs API explicitly checks for `admin`, `project_manager`, and `developer` roles. Other roles (`team_leader`, `tester`, `viewer`) may not have specific permissions for time logging operations but could interact with related endpoints (e.g., task or report APIs).

---

## Error Handling
| Status Code | Error Message                                      | Description                              |
|-------------|---------------------------------------------------|------------------------------------------|
| 400         | Invalid date format                               | The provided date format is invalid.      |
| 403         | Not enough permissions                            | User lacks permission for the operation. |
| 403         | You can only start timers for tasks assigned to you | Non-admin/project manager cannot start a timer for an unassigned task. |
| 404         | Task not found                                   | Task with the specified ID does not exist. |
| 404         | Time log not found                               | Time log with the specified ID does not exist. |
| 404         | No active timer found                            | No active timer found for the user.      |
| 409         | Duplicate time log detected                       | Duplicate time log within the last 10 seconds. |
| 409         | You already have an active timer running for task {task_id} | Another active timer exists for the user. |

---

## Database Structure
- **Table: time_logs**
  - `id`: Unique identifier (integer).
  - `task_id`: Task identifier (foreign key to `tasks` table).
  - `user_id`: User identifier (foreign key to `users` table).
  - `hours`: Number of hours (float, minimum 0).
  - `date`: Log date (ISO 8601 format).
  - `description`: Optional description (text).
  - `created_at`, `updated_at`: Creation and update timestamps.
  - Indexes: `idx_timelog_task_id`, `idx_timelog_user_id`, `idx_timelog_date`.

- **Table: active_timers**
  - `id`: Unique identifier (integer).
  - `task_id`: Task identifier (foreign key to `tasks` table).
  - `user_id`: User identifier (foreign key to `users` table).
  - `start_time`: Timer start time (ISO 8601 format).
  - `is_active`: Timer status (boolean).
  - `created_at`, `updated_at`: Creation and update timestamps.
  - Indexes: `idx_active_timer_task_id`, `idx_active_timer_user_id`, `idx_active_timer_is_active`.

---

## Endpoints and Details

### 1. Get All Time Logs
`GET /api/v1/time-logs/`

**Parameters:**
- `skip` (integer, optional, default: 0): Number of records to skip for pagination.
- `limit` (integer, optional, default: 100): Maximum number of records to return.
- `task_id` (integer, optional): Filter by task ID.
- `user_id` (integer, optional): Filter by user ID.
- `start_date` (datetime, optional): Filter by start date (ISO 8601, e.g., `2025-07-01T00:00:00+00:00`).
- `end_date` (datetime, optional): Filter by end date (ISO 8601, e.g., `2025-07-31T23:59:59+00:00`).

**Response:**
```json
[
  {
    "id": 1,
    "task_id": 5,
    "user_id": 2,
    "date": "2025-07-24T09:10:02+00:00",
    "hours": 2.5,
    "description": "Bug fixing and final testing",
    "created_at": "2025-07-24T09:10:02+00:00",
    "updated_at": null
  }
]
```

---

### 2. Get Active Timer
`GET /api/v1/time-logs/active-timer`

**Response:**
```json
{
  "id": 3,
  "task_id": 5,
  "user_id": 2,
  "start_time": "2025-07-24T09:00:00+00:00",
  "is_active": true,
  "created_at": "2025-07-24T09:00:00+00:00",
  "updated_at": null,
  "task_title": "Final bug fixing",
  "task_description": "Task description",
  "project_name": "Online Store Project",
  "elapsed_seconds": 600
}
```

**Errors:**
- `404`: "No active timer found" (if no active timer exists for the user).

---

### 3. Get Time Log by ID
`GET /api/v1/time-logs/{time_log_id}`

**Path Parameter:**
- `time_log_id` (integer, required): Time log ID.

**Response:**
```json
{
  "id": 1,
  "task_id": 5,
  "user_id": 2,
  "date": "2025-07-24T09:10:02+00:00",
  "hours": 2.5,
  "description": "Bug fixing and final testing",
  "created_at": "2025-07-24T09:10:02+00:00",
  "updated_at": null
}
```

**Errors:**
- `404`: "Time log not found" (if the time log does not exist).

---

### 4. Create Time Log
`POST /api/v1/time-logs/`

**Request Body:**
```json
{
  "task_id": 5,
  "hours": 1.5,
  "description": "Planning meeting",
  "date": "2025-07-24T08:00:00+00:00"
}
```

**Response:**
```json
{
  "id": 2,
  "task_id": 5,
  "user_id": 2,
  "date": "2025-07-24T08:00:00+00:00",
  "hours": 1.5,
  "description": "Planning meeting",
  "created_at": "2025-07-24T08:00:00+00:00",
  "updated_at": null
}
```

**Errors:**
- `404`: "Task not found" (if the task does not exist).

---

### 5. Update Time Log
`PUT /api/v1/time-logs/{time_log_id}`

**Path Parameter:**
- `time_log_id` (integer, required): Time log ID.

**Request Body:**
```json
{
  "hours": 2.0,
  "description": "Updated description",
  "date": "2025-07-24T08:00:00+00:00"
}
```

**Response:**
```json
{
  "id": 2,
  "task_id": 5,
  "user_id": 2,
  "date": "2025-07-24T08:00:00+00:00",
  "hours": 2.0,
  "description": "Updated description",
  "created_at": "2025-07-24T08:00:00+00:00",
  "updated_at": "2025-07-24T10:00:00+00:00"
}
```

**Errors:**
- `404`: "Time log not found" (if the time log does not exist).
- `403`: "Not enough permissions" (if the user is not the owner or an admin).

---

### 6. Delete Time Log
`DELETE /api/v1/time-logs/{time_log_id}`

**Path Parameter:**
- `time_log_id` (integer, required): Time log ID.

**Response:**
```json
{ "message": "Time log deleted successfully" }
```

**Errors:**
- `404`: "Time log not found" (if the time log does not exist).
- `403`: "Not enough permissions" (if the user is not the owner or an admin).

---

### 7. Get Time Logs for a Task
`GET /api/v1/time-logs/task/{task_id}`

**Path Parameter:**
- `task_id` (integer, required): Task ID.

**Response:**
List of time logs (`TimeLogResponse`), e.g.:
```json
[
  {
    "id": 1,
    "task_id": 5,
    "user_id": 2,
    "date": "2025-07-24T09:10:02+00:00",
    "hours": 2.5,
    "description": "Bug fixing and final testing",
    "created_at": "2025-07-24T09:10:02+00:00",
    "updated_at": null
  }
]
```

**Errors:**
- `404`: "Task not found" (if the task does not exist).

---

### 8. Log Time with Advanced Parameters
`POST /api/v1/time-logs/log-time`

**Parameters:**
- `task_id` (integer, required): Task ID.
- `duration_minutes` (integer, required): Duration in minutes (converted to hours internally).
- `description` (string, optional): Time log description.
- `is_manual` (boolean, optional, default: `true`): Indicates manual or automatic logging.
- `log_date` (string, optional): Log date in ISO 8601 format (e.g., `2025-07-24T08:00:00+00:00`). Defaults to current time if not provided.

**Request Body:**
```json
{
  "task_id": 5,
  "duration_minutes": 30,
  "description": "Manual time logging",
  "is_manual": true,
  "log_date": "2025-07-24T11:00:00+00:00"
}
```

**Response:**
```json
{
  "id": 3,
  "task_id": 5,
  "user_id": 2,
  "date": "2025-07-24T11:00:00+00:00",
  "hours": 0.5,
  "description": "Manual time logging",
  "created_at": "2025-07-24T11:00:00+00:00",
  "updated_at": null
}
```

**Errors:**
- `404`: "Task not found" (if the task does not exist).
- `403`: "Not enough permissions" (if the user is a developer and the task is not assigned to them).
- `409`: "Duplicate time log detected" (if a similar log exists within the last 10 seconds).
- `400`: "Invalid date format" (if the `log_date` format is invalid).

---

### 9. Start Live Timer
`POST /api/v1/time-logs/start-timer`

**Parameters:**
- `task_id` (integer, required): Task ID.

**Request Body:**
```json
{
  "task_id": 5
}
```

**Response:**
```json
{
  "message": "Timer started successfully",
  "timer_id": 4,
  "task_id": 5,
  "task_title": "Final bug fixing",
  "start_time": "2025-07-24T12:00:00+00:00"
}
```

**Errors:**
- `404`: "Task not found" (if the task does not exist).
- `403`: "You can only start timers for tasks assigned to you" (if the user is not admin/project manager and the task is not assigned to them).
- `409`: "You already have an active timer running for task {task_id}" (if another active timer exists).

---

### 10. Stop Live Timer and Log Time
`POST /api/v1/time-logs/stop-timer`

**Parameters:**
- `timer_id` (integer, optional): Timer ID. If not provided, the user's active timer is selected.
- `description` (string, optional): Description for the time log.

**Request Body:**
```json
{
  "timer_id": 4,
  "description": "Planning meeting"
}
```

**Response:**
```json
{
  "message": "Timer stopped and time logged successfully",
  "timer_id": 4,
  "elapsed_hours": 1.25,
  "elapsed_seconds": 4500,
  "time_log_id": 5
}
```

**Errors:**
- `404`: "No active timer found" (if no active timer exists).

---

### 11. Get Current User's Time Logs
`GET /api/v1/time-logs/user/me`

**Parameters:**
- `skip` (integer, optional, default: 0): Number of records to skip for pagination.
- `limit` (integer, optional, default: 100): Maximum number of records to return.

**Response:**
List of time logs (`TimeLogResponse`), e.g.:
```json
[
  {
    "id": 1,
    "task_id": 5,
    "user_id": 2,
    "date": "2025-07-24T09:10:02+00:00",
    "hours": 2.5,
    "description": "Bug fixing and final testing",
    "created_at": "2025-07-24T09:10:02+00:00",
    "updated_at": null
  }
]
```

---

## Response Models

### TimeLogResponse
```json
{
  "id": 1,
  "task_id": 5,
  "user_id": 2,
  "date": "2025-07-24T09:10:02+00:00",
  "hours": 2.5,
  "description": "Bug fixing and final testing",
  "created_at": "2025-07-24T09:10:02+00:00",
  "updated_at": null
}
```

### ActiveTimerResponse
```json
{
  "id": 3,
  "task_id": 5,
  "user_id": 2,
  "start_time": "2025-07-24T09:00:00+00:00",
  "is_active": true,
  "created_at": "2025-07-24T09:00:00+00:00",
  "updated_at": null,
  "task_title": "Final bug fixing",
  "task_description": "Task description",
  "project_name": "Online Store Project",
  "elapsed_seconds": 600
}
```

### TimerStartResponse
```json
{
  "message": "Timer started successfully",
  "timer_id": 4,
  "task_id": 5,
  "task_title": "Final bug fixing",
  "start_time": "2025-07-24T12:00:00+00:00"
}
```

### TimerStopResponse
```json
{
  "message": "Timer stopped and time logged successfully",
  "timer_id": 4,
  "elapsed_hours": 1.25,
  "elapsed_seconds": 4500,
  "time_log_id": 5
}
```

---

## Notes and Behaviors
- Only admins or the time log owner can update or delete a time log.
- Developers can only log time for tasks assigned to them.
- Duplicate time logs (same user, task, and duration within the last 10 seconds) are prevented.
- Logging time updates the `actual_hours` field of the associated task.
- Live timers can only be started for tasks assigned to the user (unless the user is an admin or project manager).
- All dates are processed in ISO 8601 format.
- Database indexes are created on `task_id`, `user_id`, and `date` for improved query performance.