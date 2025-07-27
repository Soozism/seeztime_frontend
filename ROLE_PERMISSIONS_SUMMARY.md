# 📋 خلاصه کامل دسترسی‌های نقش‌های کاربری - سیستم مدیریت تسک گینگا تک

## 🎯 خلاصه اجرایی

سیستم مدیریت تسک گینگا تک از یک سیستم مجوزدهی قوی و انعطاف‌پذیر استفاده می‌کند که شامل **6 نقش کاربری** و **66+ API endpoint** می‌باشد. هر نقش دارای سطح دسترسی مشخص و کنترل شده‌ای است.

---

## 👥 نقش‌های کاربری و دسترسی‌ها

### 🔐 **Admin (مدیر سیستم)**
**دسترسی**: کامل به تمام API ها
- ✅ مدیریت تمام کاربران
- ✅ دسترسی به تمام پروژه‌ها و تیم‌ها
- ✅ مشاهده تمام گزارش‌ها
- ✅ مدیریت سیستم

### 📋 **Project Manager (مدیر پروژه)**
**دسترسی**: مدیریت پروژه‌ها و تیم‌ها
- ✅ ایجاد و مدیریت پروژه‌ها
- ✅ مدیریت تیم‌ها
- ✅ مشاهده گزارش‌های پروژه
- ✅ مدیریت تسک‌ها و اسپرینت‌ها
- ❌ مدیریت کاربران (فقط Admin)

### 👥 **Team Leader (رهبر تیم)**
**دسترسی**: مدیریت تیم خود و پروژه‌های تخصیص داده شده
- ✅ مدیریت اعضای تیم
- ✅ ایجاد تسک و اسپرینت در پروژه‌های تیم
- ✅ مشاهده گزارش‌های تیم
- ❌ ایجاد پروژه جدید
- ❌ مدیریت تیم‌های دیگر

### 💻 **Developer (توسعه‌دهنده)**
**دسترسی**: کار روی تسک‌های محول شده
- ✅ مشاهده و به‌روزرسانی تسک‌های خود
- ✅ ثبت زمان کار
- ✅ گزارش باگ
- ❌ ایجاد تسک جدید
- ❌ مدیریت اسپرینت

### 🧪 **Tester (تست‌کننده)**
**دسترسی**: مشابه Developer
- ✅ تست تسک‌ها
- ✅ گزارش باگ
- ✅ ثبت زمان تست
- ❌ ایجاد تسک جدید
- ❌ مدیریت اسپرینت

### 👁️ **Viewer (مشاهده‌گر)**
**دسترسی**: فقط مشاهده
- ✅ مشاهده پروژه‌های تخصیص داده شده
- ✅ مشاهده گزارش‌ها (بدون ویرایش)
- ❌ ایجاد یا ویرایش هر چیزی
- ❌ ثبت زمان

---

## 📊 ماتریس دسترسی‌های کلیدی

| عملیات | Admin | Project Manager | Team Leader | Developer | Tester | Viewer |
|--------|-------|----------------|-------------|-----------|--------|--------|
| **مدیریت کاربران** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **ایجاد پروژه** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **مدیریت تیم** | ✅ | ✅ | تیم خود | ❌ | ❌ | ❌ |
| **ایجاد تسک** | ✅ | ✅ | در پروژه‌های تیم | ❌ | ❌ | ❌ |
| **ویرایش تسک** | ✅ | ✅ | در پروژه‌های تیم | تسک‌های خود | تسک‌های خود | ❌ |
| **مدیریت اسپرینت** | ✅ | ✅ | در پروژه‌های تیم | ❌ | ❌ | ❌ |
| **ثبت زمان** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **گزارش باگ** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **مشاهده گزارش‌ها** | ✅ | ✅ | تیم خود | محدود | محدود | محدود |
| **مدیریت milestone** | ✅ | ✅ | در پروژه‌های تیم | ❌ | ❌ | ❌ |

---

## 🔍 جزئیات API ها بر اساس نقش

### 🔐 **Authentication APIs**
- **`POST /auth/login`**: همه کاربران ✅
- **`POST /auth/register`**: همه کاربران ✅

### 👥 **User Management APIs**
- **`GET /users/`**: فقط Admin ✅
- **`GET /users/me/`**: همه کاربران ✅
- **`PUT /users/{id}`**: Admin یا خود کاربر ✅

### 📋 **Project Management APIs**
- **`GET /projects/`**: بر اساس نقش (Admin: همه، Team Leader: تیم‌های خود، Developer: پروژه‌های دارای تسک)
- **`POST /projects/`**: Admin, Project Manager ✅
- **`PUT /projects/{id}`**: Admin, Project Manager, یا ایجادکننده ✅

### 📝 **Task Management APIs**
- **`GET /tasks/`**: بر اساس نقش (Admin: همه، Team Leader: پروژه‌های تیم، Developer: تسک‌های محول شده)
- **`POST /tasks/`**: Admin, Project Manager, Team Leader ✅
- **`PUT /tasks/{id}`**: Admin, Project Manager, Team Leader, یا assignee ✅
- **`PATCH /tasks/{id}/status`**: Admin, Project Manager, Team Leader, یا assignee ✅

### 🏃‍♂️ **Sprint Management APIs**
- **`GET /sprints/`**: بر اساس دسترسی به پروژه
- **`POST /sprints/`**: Admin, Project Manager, Team Leader ✅
- **`PUT /sprints/{id}`**: Admin, Project Manager, Team Leader ✅

### 👥 **Team Management APIs**
- **`GET /teams/`**: Admin: همه، Team Leader: تیم‌های تحت رهبری، Developer: تیم‌های عضویت
- **`POST /teams/`**: Admin, Project Manager ✅
- **`PUT /teams/{id}`**: Admin, Project Manager, یا رهبر تیم ✅

### ⏱️ **Time Logging APIs**
- **`GET /time-logs/`**: Admin: همه، Team Leader: اعضای تیم، Developer: خود
- **`POST /time-logs/`**: Admin, Project Manager, Team Leader, Developer, Tester ✅
- **`POST /time-logs/start-timer`**: Admin, Project Manager, Team Leader, Developer, Tester ✅
- **`POST /time-logs/stop-timer`**: Admin, Project Manager, Team Leader, Developer, Tester ✅

### 🐛 **Bug Report APIs**
- **`GET /bug-reports/`**: بر اساس نقش
- **`POST /bug-reports/`**: Admin, Project Manager, Team Leader, Developer, Tester ✅
- **`PUT /bug-reports/{id}`**: Admin, Project Manager, Team Leader, یا گزارش‌دهنده ✅

### 📊 **Dashboard & Reporting APIs**
- **`GET /dashboard/dashboard`**: همه کاربران ✅
- **`GET /dashboard/dashboard/user/{id}`**: Admin, Project Manager (هر کسی)، Team Leader (اعضای تیم)، Developer (فقط خود)

### 🔍 **Advanced Queries APIs**
- **`GET /queries/tasks/by-sprint/{id}`**: بر اساس دسترسی به اسپرینت
- **`GET /queries/tasks/by-user/{id}`**: Admin, Project Manager (هر کسی)، Team Leader (اعضای تیم)، Developer (فقط خود)

---

## 💡 مثال‌های عملی

### مثال 1: Developer تلاش برای ایجاد تسک
```bash
POST /api/v1/tasks/
Authorization: Bearer <developer_token>

# پاسخ خطا
{
  "detail": "You don't have permission to create tasks in this project"
}
```

### مثال 2: Team Leader مشاهده dashboard اعضای تیم
```bash
GET /api/v1/dashboard/dashboard/user/5
Authorization: Bearer <team_leader_token>

# پاسخ موفق
{
  "user_info": {
    "id": 5,
    "username": "developer2",
    "role": "developer"
  },
  "tasks": {
    "my_assigned_total": 8
  }
}
```

### مثال 3: Viewer تلاش برای ویرایش تسک
```bash
PUT /api/v1/tasks/1
Authorization: Bearer <viewer_token>

# پاسخ خطا
{
  "detail": "You don't have permission to update this task"
}
```

---

## ❌ کدهای خطا و پیام‌ها

### خطاهای احراز هویت (401)
```json
{
  "detail": "Could not validate credentials"
}
```

### خطاهای مجوزدهی (403)
```json
{
  "detail": "Not enough permissions"
}
```

### خطاهای دسترسی به پروژه (403)
```json
{
  "detail": "Access denied to this project"
}
```

### خطاهای دسترسی به تسک (403)
```json
{
  "detail": "You don't have permission to update this task"
}
```

### خطاهای دسترسی به کاربر (403)
```json
{
  "detail": "Access denied. You can only view your own data or your team members' data."
}
```

---

## 🔧 نکات فنی مهم

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

## 📝 خلاصه ویژگی‌های امنیتی

### ✅ **امنیت بالا**
- احراز هویت JWT با مدت اعتبار 30 دقیقه
- مجوزدهی نقش‌محور برای تمام API ها
- بررسی دسترسی تیم-پروژه
- جداسازی داده‌ها بر اساس نقش

### ✅ **انعطاف‌پذیری**
- 6 نقش مختلف با دسترسی‌های مشخص
- پشتیبانی از تیم‌های متعدد
- مدیریت پروژه‌های پیچیده
- کنترل دسترسی دقیق

### ✅ **مقیاس‌پذیری**
- پشتیبانی از تیم‌ها و پروژه‌های بزرگ
- سیستم گزارش‌دهی پیشرفته
- API های بهینه شده
- عملکرد بالا

### ✅ **شفافیت**
- پیام‌های خطای واضح و مشخص
- کدهای خطای استاندارد HTTP
- مستندات کامل
- مثال‌های عملی

### ✅ **عملکرد بهینه**
- بررسی‌های مجوزدهی کارآمد
- کوئری‌های بهینه شده
- کش‌گذاری مناسب
- پاسخ‌های سریع

---

## 🎯 نتیجه‌گیری

سیستم مدیریت تسک گینگا تک یک سیستم امنیتی قوی و انعطاف‌پذیر ارائه می‌دهد که:

1. **امنیت کامل**: احراز هویت و مجوزدهی قوی
2. **کنترل دقیق**: دسترسی‌های مشخص برای هر نقش
3. **انعطاف‌پذیری**: پشتیبانی از ساختارهای پیچیده تیم و پروژه
4. **مقیاس‌پذیری**: قابلیت رشد و توسعه
5. **شفافیت**: مستندات کامل و پیام‌های واضح

این سیستم امکان مدیریت پروژه‌های پیچیده را با حفظ امنیت و کنترل دسترسی فراهم می‌کند و برای سازمان‌های مختلف قابل استفاده است. 