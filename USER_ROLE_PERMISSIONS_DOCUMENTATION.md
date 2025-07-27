# 📋 مستندات کامل دسترسی‌های نقش‌های کاربری - سیستم مدیریت تسک گینگا تک

## 📖 فهرست مطالب
- [معرفی سیستم](#معرفی-سیستم)
- [نقش‌های کاربری](#نقش‌های-کاربری)
- [ماتریس دسترسی‌ها](#ماتریس-دسترسی‌ها)
- [جزئیات API ها بر اساس نقش](#جزئیات-api-ها-بر-اساس-نقش)
- [مثال‌های عملی](#مثال‌های-عملی)
- [کدهای خطا و پیام‌ها](#کدهای-خطا-و-پیام‌ها)

---

## 🎯 معرفی سیستم

سیستم مدیریت تسک گینگا تک از یک سیستم احراز هویت و مجوزدهی مبتنی بر نقش (Role-Based Access Control) استفاده می‌کند. هر کاربر دارای یک نقش مشخص است که سطح دسترسی او به API های مختلف را تعیین می‌کند.

### 🔐 سیستم احراز هویت
- **JWT Token**: تمام درخواست‌ها نیاز به Bearer Token دارند
- **مدت اعتبار**: 30 دقیقه (قابل تنظیم)
- **نقش‌محور**: دسترسی بر اساس نقش کاربر کنترل می‌شود

---

## 👥 نقش‌های کاربری

### 1️⃣ **Admin (مدیر سیستم)**
- **دسترسی**: کامل به تمام API ها
- **توانایی‌ها**: 
  - مدیریت تمام کاربران
  - دسترسی به تمام پروژه‌ها و تیم‌ها
  - مشاهده تمام گزارش‌ها
  - مدیریت سیستم

### 2️⃣ **Project Manager (مدیر پروژه)**
- **دسترسی**: مدیریت پروژه‌ها و تیم‌ها
- **توانایی‌ها**:
  - ایجاد و مدیریت پروژه‌ها
  - مدیریت تیم‌ها
  - مشاهده گزارش‌های پروژه
  - مدیریت تسک‌ها و اسپرینت‌ها

### 3️⃣ **Team Leader (رهبر تیم)**
- **دسترسی**: مدیریت تیم خود و پروژه‌های تخصیص داده شده
- **توانایی‌ها**:
  - مدیریت اعضای تیم
  - ایجاد تسک و اسپرینت در پروژه‌های تیم
  - مشاهده گزارش‌های تیم

### 4️⃣ **Developer (توسعه‌دهنده)**
- **دسترسی**: کار روی تسک‌های محول شده
- **توانایی‌ها**:
  - مشاهده و به‌روزرسانی تسک‌های خود
  - ثبت زمان کار
  - گزارش باگ

### 5️⃣ **Tester (تست‌کننده)**
- **دسترسی**: مشابه Developer
- **توانایی‌ها**:
  - تست تسک‌ها
  - گزارش باگ
  - ثبت زمان تست

### 6️⃣ **Viewer (مشاهده‌گر)**
- **دسترسی**: فقط مشاهده
- **توانایی‌ها**:
  - مشاهده پروژه‌های تخصیص داده شده
  - مشاهده گزارش‌ها (بدون ویرایش)

---

## 📊 ماتریس دسترسی‌ها

| عملیات | Admin | Project Manager | Team Leader | Developer | Tester | Viewer |
|--------|-------|----------------|-------------|-----------|--------|--------|
| **مدیریت کاربران** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **ایجاد پروژه** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **مدیریت تیم** | ✅ | ✅ | تیم خود | ❌ | ❌ | ❌ |
| **ایجاد تسک** | ✅ | ✅ | در پروژه‌های تیم | فقط تسک شخصی | فقط تسک شخصی | ❌ |
| **ویرایش تسک** | ✅ | ✅ | در پروژه‌های تیم | تسک‌های خود | تسک‌های خود | ❌ |
| **مدیریت اسپرینت** | ✅ | ✅ | در پروژه‌های تیم | ❌ | ❌ | ❌ |
| **ثبت زمان** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **گزارش باگ** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **مشاهده گزارش‌ها** | ✅ | ✅ | تیم خود | محدود | محدود | محدود |
| **مدیریت milestone** | ✅ | ✅ | در پروژه‌های تیم | ❌ | ❌ | ❌ |

---

## 🔍 جزئیات API ها بر اساس نقش

### 🔐 **Authentication APIs**

#### `POST /api/v1/auth/login`
- **دسترسی**: همه کاربران
- **ورودی**: username, password
- **خروجی**: access_token
- **مثال پاسخ**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### `POST /api/v1/auth/register`
- **دسترسی**: همه کاربران
- **ورودی**: username, email, password, first_name, last_name, role
- **خروجی**: اطلاعات کاربر ایجاد شده
- **نقش‌های مجاز**: admin, project_manager, team_leader, developer, tester, viewer

---

### 👥 **User Management APIs**

#### `GET /api/v1/users/`
- **دسترسی**: فقط Admin
- **نقش‌های مجاز**: Admin
- **خروجی**: لیست تمام کاربران
- **خطای 403**: برای سایر نقش‌ها

#### `GET /api/v1/users/me/`
- **دسترسی**: همه کاربران احراز هویت شده
- **خروجی**: اطلاعات کاربر فعلی
- **مثال پاسخ**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "Admin",
  "last_name": "User",
  "role": "admin",
  "is_active": true
}
```

#### `PUT /api/v1/users/{id}`
- **دسترسی**: Admin یا خود کاربر
- **نقش‌های مجاز**: Admin (برای همه), سایر نقش‌ها (فقط خودشان)
- **خطای 403**: اگر کاربر غیرمجاز باشد

---

### 📋 **Project Management APIs**

#### `GET /api/v1/projects/`
- **Admin/Project Manager**: مشاهده تمام پروژه‌ها
- **Team Leader**: مشاهده پروژه‌های تیم‌های تحت رهبری
- **Developer/Tester**: مشاهده پروژه‌هایی که تسک دارند
- **Viewer**: مشاهده پروژه‌های تخصیص داده شده

#### `POST /api/v1/projects/`
- **دسترسی**: Admin, Project Manager
- **نقش‌های مجاز**: Admin, Project Manager
- **خطای 403**: برای سایر نقش‌ها

#### `GET /api/v1/projects/{id}`
- **دسترسی**: بر اساس نقش و عضویت در تیم
- **Admin/Project Manager**: دسترسی کامل
- **Team Leader**: اگر تیم تحت رهبری در پروژه باشد
- **Developer/Tester**: اگر تسک در پروژه داشته باشند
- **خطای 403**: اگر دسترسی نداشته باشد

#### `PUT /api/v1/projects/{id}`
- **دسترسی**: Admin, Project Manager, یا ایجادکننده پروژه
- **خطای 403**: برای سایر کاربران

---

### 📝 **Task Management APIs**

#### `GET /api/v1/tasks/`
- **Admin/Project Manager**: مشاهده تمام تسک‌ها
- **Team Leader**: مشاهده تسک‌های پروژه‌های تیم
- **Developer/Tester**: مشاهده تسک‌های محول شده
- **Viewer**: مشاهده تسک‌های پروژه‌های تخصیص داده شده

#### `POST /api/v1/tasks/`
- **دسترسی**: Admin, Project Manager, Team Leader
- **نقش‌های مجاز**: Admin, Project Manager, Team Leader
- **خطای 403**: برای Developer, Tester, Viewer

#### `PUT /api/v1/tasks/{task_id}`
- **دسترسی**: 
  - Admin, Project Manager (تمام تسک‌ها)
  - Team Leader (تسک‌های پروژه‌های تیم)
  - Developer/Tester (تسک‌های محول شده)
- **خطای 403**: اگر دسترسی نداشته باشد

#### `PATCH /api/v1/tasks/{task_id}/status`
- **دسترسی**: 
  - Admin, Project Manager (تمام تسک‌ها)
  - Team Leader (تسک‌های پروژه‌های تیم)
  - Developer/Tester (تسک‌های محول شده)
- **مثال درخواست**:
```json
{
  "status": "in_progress"
}
```

---

### 🏃‍♂️ **Sprint Management APIs**

#### `GET /api/v1/sprints/`
- **Admin/Project Manager**: مشاهده تمام اسپرینت‌ها
- **Team Leader**: مشاهده اسپرینت‌های پروژه‌های تیم
- **Developer/Tester**: مشاهده اسپرینت‌های پروژه‌هایی که تسک دارند
- **Viewer**: مشاهده اسپرینت‌های پروژه‌های تخصیص داده شده

#### `POST /api/v1/sprints/`
- **دسترسی**: Admin, Project Manager, Team Leader
- **نقش‌های مجاز**: Admin, Project Manager, Team Leader
- **خطای 403**: برای Developer, Tester, Viewer

#### `PUT /api/v1/sprints/{sprint_id}`
- **دسترسی**: Admin, Project Manager, Team Leader
- **خطای 403**: برای سایر نقش‌ها

---

### 👥 **Team Management APIs**

#### `GET /api/v1/teams/`
- **Admin/Project Manager**: مشاهده تمام تیم‌ها
- **Team Leader**: مشاهده تیم‌های تحت رهبری
- **Developer/Tester**: مشاهده تیم‌های عضویت
- **Viewer**: مشاهده تیم‌های عضویت

#### `POST /api/v1/teams/`
- **دسترسی**: Admin, Project Manager
- **نقش‌های مجاز**: Admin, Project Manager
- **خطای 403**: برای سایر نقش‌ها

#### `PUT /api/v1/teams/{team_id}`
- **دسترسی**: Admin, Project Manager, یا رهبر تیم
- **خطای 403**: برای سایر کاربران

---

### ⏱️ **Time Logging APIs**

#### `GET /api/v1/time-logs/`
- **Admin/Project Manager**: مشاهده تمام time log ها
- **Team Leader**: مشاهده time log های اعضای تیم
- **Developer/Tester**: مشاهده time log های خود
- **Viewer**: مشاهده time log های خود

#### `POST /api/v1/time-logs/`
- **دسترسی**: Admin, Project Manager, Team Leader, Developer, Tester
- **نقش‌های مجاز**: Admin, Project Manager, Team Leader, Developer, Tester
- **خطای 403**: برای Viewer

#### `POST /api/v1/time-logs/start-timer`
- **دسترسی**: Admin, Project Manager, Team Leader, Developer, Tester
- **نقش‌های مجاز**: Admin, Project Manager, Team Leader, Developer, Tester
- **خطای 403**: برای Viewer

#### `POST /api/v1/time-logs/stop-timer`
- **دسترسی**: Admin, Project Manager, Team Leader, Developer, Tester
- **نقش‌های مجاز**: Admin, Project Manager, Team Leader, Developer, Tester
- **خطای 403**: برای Viewer

---

### 🐛 **Bug Report APIs**

#### `GET /api/v1/bug-reports/`
- **Admin/Project Manager**: مشاهده تمام bug report ها
- **Team Leader**: مشاهده bug report های پروژه‌های تیم
- **Developer/Tester**: مشاهده bug report های خود
- **Viewer**: مشاهده bug report های پروژه‌های تخصیص داده شده

#### `POST /api/v1/bug-reports/`
- **دسترسی**: Admin, Project Manager, Team Leader, Developer, Tester
- **نقش‌های مجاز**: Admin, Project Manager, Team Leader, Developer, Tester
- **خطای 403**: برای Viewer

#### `PUT /api/v1/bug-reports/{bug_report_id}`
- **دسترسی**: 
  - Admin, Project Manager (تمام bug report ها)
  - Team Leader (bug report های پروژه‌های تیم)
  - Developer/Tester (bug report های خود)
- **خطای 403**: اگر دسترسی نداشته باشد

---

### 📊 **Dashboard & Reporting APIs**

#### `GET /api/v1/dashboard/dashboard`
- **دسترسی**: همه کاربران احراز هویت شده
- **خروجی**: اطلاعات dashboard کاربر فعلی
- **مثال پاسخ**:
```json
{
  "user_info": {
    "id": 1,
    "username": "developer1",
    "full_name": "John Doe",
    "role": "developer",
    "email": "john@example.com"
  },
  "projects": {
    "total": 3,
    "active": 2,
    "accessible_projects": [...]
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
    "recent_logs": [...]
  },
  "teams": {
    "total": 2,
    "leading": 0,
    "team_details": [...]
  },
  "recent_tasks": [...]
}
```

#### `GET /api/v1/dashboard/dashboard/user/{user_id}`
- **دسترسی**: 
  - Admin, Project Manager (هر کاربری)
  - Team Leader (اعضای تیم)
  - Developer/Tester (فقط خودشان)
- **خطای 403**: اگر دسترسی نداشته باشد

---

### 📈 **Advanced Reports APIs**

#### `GET /api/v1/reports/time-reports`
- **Admin/Project Manager**: گزارش‌های کامل
- **Team Leader**: گزارش‌های تیم
- **Developer/Tester**: گزارش‌های شخصی
- **Viewer**: گزارش‌های محدود

#### `GET /api/v1/reports/story-points-reports`
- **Admin/Project Manager**: گزارش‌های کامل
- **Team Leader**: گزارش‌های تیم
- **Developer/Tester**: گزارش‌های شخصی
- **Viewer**: گزارش‌های محدود

---

### 🔍 **Advanced Queries APIs**

#### `GET /api/v1/queries/tasks/by-sprint/{sprint_id}`
- **دسترسی**: بر اساس دسترسی به اسپرینت
- **Admin/Project Manager**: تمام اسپرینت‌ها
- **Team Leader**: اسپرینت‌های پروژه‌های تیم
- **Developer/Tester**: اسپرینت‌های پروژه‌هایی که تسک دارند

#### `GET /api/v1/queries/tasks/by-user/{user_id}`
- **دسترسی**: 
  - Admin, Project Manager (هر کاربری)
  - Team Leader (اعضای تیم)
  - Developer/Tester (فقط خودشان)
- **خطای 403**: اگر دسترسی نداشته باشد

---

## 💡 مثال‌های عملی

### مثال 1: Developer ایجاد تسک
```bash
# درخواست
POST /api/v1/tasks/
Authorization: Bearer <developer_token>
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description",
  "project_id": 1,
  "assignee_id": 2
}

# پاسخ خطا
{
  "detail": "You don't have permission to create tasks in this project"
}
```

### مثال 2: Team Leader مشاهده dashboard اعضای تیم
```bash
# درخواست
GET /api/v1/dashboard/dashboard/user/5
Authorization: Bearer <team_leader_token>

# پاسخ موفق
{
  "user_info": {
    "id": 5,
    "username": "developer2",
    "role": "developer",
    ...
  },
  "tasks": {
    "my_assigned_total": 8,
    ...
  },
  ...
}
```

### مثال 3: Viewer تلاش برای ویرایش تسک
```bash
# درخواست
PUT /api/v1/tasks/1
Authorization: Bearer <viewer_token>
Content-Type: application/json

{
  "status": "in_progress"
}

# پاسخ خطا
{
  "detail": "You don't have permission to update this task"
}
```

---

## ❌ کدهای خطا و پیام‌ها

### خطاهای احراز هویت
```json
{
  "detail": "Could not validate credentials"
}
```
**کد**: 401 Unauthorized

### خطاهای مجوزدهی
```json
{
  "detail": "Not enough permissions"
}
```
**کد**: 403 Forbidden

### خطاهای دسترسی به پروژه
```json
{
  "detail": "Access denied to this project"
}
```
**کد**: 403 Forbidden

### خطاهای دسترسی به تسک
```json
{
  "detail": "You don't have permission to update this task"
}
```
**کد**: 403 Forbidden

### خطاهای دسترسی به تیم
```json
{
  "detail": "Access denied"
}
```
**کد**: 403 Forbidden

### خطاهای دسترسی به کاربر
```json
{
  "detail": "Access denied. You can only view your own data or your team members' data."
}
```
**کد**: 403 Forbidden

---

## 🔧 نکات فنی

### بررسی دسترسی تیم-پروژه
```python
def check_team_project_access(user: User, project: Project, db: Session) -> bool:
    if user.role in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
        return True
    
    # بررسی رهبر تیم
    team_leader_access = db.query(Team).filter(
        Team.team_leader_id == user.id,
        Team.projects.any(Project.id == project.id)
    ).first()
    if team_leader_access:
        return True
    
    # بررسی عضویت در تیم
    member_access = db.query(Team).join(Team.members).filter(
        User.id == user.id,
        Team.projects.any(Project.id == project.id)
    ).first()
    if member_access:
        return True
    
    return False
```

### بررسی دسترسی به داده‌های کاربر
```python
def can_access_user_data(current_user: User, target_user_id: int, db: Session) -> bool:
    if current_user.role in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
        return True
    
    if current_user.id == target_user_id:
        return True
    
    if current_user.role == UserRole.TEAM_LEADER:
        led_teams = db.query(Team).filter(Team.team_leader_id == current_user.id).all()
        for team in led_teams:
            if any(member.id == target_user_id for member in team.members):
                return True
    
    return False
```

---

## 📝 خلاصه

سیستم مدیریت تسک گینگا تک از یک سیستم مجوزدهی قوی و انعطاف‌پذیر استفاده می‌کند که:

✅ **امنیت بالا**: احراز هویت JWT و مجوزدهی نقش‌محور  
✅ **انعطاف‌پذیری**: دسترسی‌های مختلف برای نقش‌های مختلف  
✅ **مقیاس‌پذیری**: پشتیبانی از تیم‌ها و پروژه‌های متعدد  
✅ **شفافیت**: پیام‌های خطای واضح و مشخص  
✅ **عملکرد بهینه**: بررسی‌های مجوزدهی کارآمد  

این سیستم امکان مدیریت پروژه‌های پیچیده را با حفظ امنیت و کنترل دسترسی فراهم می‌کند. 