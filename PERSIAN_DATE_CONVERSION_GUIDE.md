# Persian Date Conversion Guide

This document explains how Persian (Jalali) date conversion has been implemented in the Ginga Tech Frontend project.

## Overview

The project has been converted to use Persian (Jalali) calendar for display while maintaining Gregorian calendar for backend API communication. This ensures users see dates in their familiar Persian format while the backend continues to work with standard Gregorian dates.

## Key Components

### 1. Date Configuration (`src/utils/dateConfig.ts`)

This is the central configuration file that handles all Persian date operations:

- **Persian Locale Configuration**: Ant Design locale settings for Persian calendar
- **Date Format Constants**: Standardized date formats for display and API
- **Utility Functions**: Helper functions for date conversion

#### Key Functions:
- `dateUtils.toPersian()`: Convert Gregorian date to Persian for display
- `dateUtils.toGregorian()`: Convert Persian date to Gregorian for API
- `dateUtils.toPersianDayjs()`: Convert to Persian dayjs object
- `dateUtils.formatWithTime()`: Format date with time for display
- `dateUtils.formatForAPI()`: Format date for API communication

### 2. Persian DatePicker Component (`src/components/PersianDatePicker.tsx`)

A custom DatePicker component that:
- Displays dates in Persian format
- Automatically converts Persian input to Gregorian for API calls
- Handles both date-only and date-time inputs
- Maintains compatibility with Ant Design DatePicker props

### 3. Persian RangePicker Component (`src/components/PersianRangePicker.tsx`)

A custom RangePicker component for date ranges that:
- Displays date ranges in Persian format
- Converts Persian ranges to Gregorian for API calls
- Supports both date-only and date-time ranges

## Implementation Details

### App-Level Configuration

The main App.tsx has been updated to include Persian locale:

```typescript
import { persianLocale } from './utils/dateConfig';

<ConfigProvider
  locale={persianLocale}
  direction="rtl"
  // ... other props
>
```

### Date Format Standards

#### Display Formats (Persian):
- `jYYYY/jMM/jDD` - Date only (e.g., 1402/09/15)
- `jYYYY/jMM/jDD HH:mm` - Date with time (e.g., 1402/09/15 14:30)
- `jYYYY/jMM/jDD HH:mm:ss` - Full date time (e.g., 1402/09/15 14:30:25)

#### API Formats (Gregorian):
- `YYYY-MM-DD` - Date only (e.g., 2024-01-05)
- `YYYY-MM-DD HH:mm:ss` - Date with time (e.g., 2024-01-05 14:30:25)
- `YYYY-MM-DDTHH:mm:ss.SSSZ` - ISO format for API calls

### Usage Examples

#### 1. Using PersianDatePicker in Forms:

```typescript
import PersianDatePicker from '../components/PersianDatePicker';

<Form.Item name="due_date" label="تاریخ سررسید">
  <PersianDatePicker 
    style={{ width: '100%' }}
    showTime={false} // or true for date-time
  />
</Form.Item>
```

#### 2. Displaying Persian Dates:

```typescript
import { dateUtils } from '../utils/dateConfig';

// In table columns
{
  title: 'تاریخ',
  dataIndex: 'date',
  render: (date: string) => dateUtils.toPersian(date)
}

// In components
<p>تاریخ ایجاد: {dateUtils.toPersian(project.created_at)}</p>
```

#### 3. Date Comparisons:

```typescript
import { dateUtils } from '../utils/dateConfig';

// Check if date is today
const isToday = dateUtils.isToday(task.due_date);

// Check if date is in the past
const isOverdue = dateUtils.isPast(task.due_date);

// Check if date is in the future
const isUpcoming = dateUtils.isFuture(task.due_date);
```

## Updated Pages

The following pages have been updated to use Persian dates:

### ✅ Completed:
- **TimeTracking.tsx**: Date picker and date display in time logs
- **TimeLogs.tsx**: Date picker, range picker, and table date display
- **Planner.tsx**: Event and todo date pickers with Persian format
- **Tasks.tsx**: Task due date picker and display
- **Projects.tsx**: Project start/end date pickers and creation date display

### 🔄 Partially Updated:
- **TaskDetail.tsx**: Date display in task details
- **TaskDetailEnhanced.tsx**: Enhanced task detail date handling

### ⏳ Remaining Pages:
- **Sprints.tsx**: Sprint date ranges and display
- **Milestones.tsx**: Milestone due dates
- **Reports.tsx**: Report date filters
- **AdvancedReports.tsx**: Advanced report date handling
- **Dashboard.tsx**: Dashboard date displays
- **ProjectDetail.tsx**: Project detail date information
- **VersionManagement.tsx**: Version release dates

## Backend Compatibility

### API Communication:
- All dates sent to the backend are in Gregorian format
- All dates received from the backend are converted to Persian for display
- No changes required on the backend side

### Data Flow:
1. User selects Persian date in UI
2. PersianDatePicker converts to Gregorian
3. Gregorian date sent to API
4. API returns Gregorian date
5. Frontend converts to Persian for display

## Dependencies

The following packages are used for Persian date handling:

```json
{
  "jalali-dayjs": "^1.0.0",
  "dayjs": "^1.11.13",
  "moment-jalaali": "^0.10.4"
}
```

## Testing

### Manual Testing Checklist:
- [ ] Date pickers display Persian calendar
- [ ] Date pickers convert to Gregorian for API calls
- [ ] Date displays show Persian format
- [ ] Date comparisons work correctly
- [ ] Date ranges function properly
- [ ] Export files use correct date format

### Common Test Cases:
1. Create a new task with Persian due date
2. Filter time logs by Persian date range
3. View project details with Persian creation date
4. Export reports with Persian date headers
5. Compare overdue tasks using Persian dates

## Troubleshooting

### Common Issues:

1. **Date not displaying in Persian format**
   - Check if `dateUtils.toPersian()` is being used
   - Verify PersianDatePicker is imported correctly

2. **API errors with date format**
   - Ensure `dateUtils.formatForAPI()` is used for API calls
   - Check that Gregorian format is being sent

3. **Date picker not showing Persian calendar**
   - Verify `persianLocale` is configured in App.tsx
   - Check if PersianDatePicker is being used instead of regular DatePicker

### Debug Tips:
- Use browser dev tools to check date values
- Log both Persian and Gregorian dates during conversion
- Verify date format constants are being used consistently

## Future Enhancements

### Potential Improvements:
1. **Date Localization**: Support for different Persian dialects
2. **Custom Date Formats**: User-configurable date display formats
3. **Date Validation**: Persian-specific date validation rules
4. **Holiday Calendar**: Persian holiday integration
5. **Date Utilities**: Additional Persian date utility functions

### Performance Optimizations:
1. **Date Caching**: Cache converted dates to avoid repeated conversions
2. **Lazy Loading**: Load Persian date libraries only when needed
3. **Bundle Optimization**: Optimize Persian date library imports

## Conclusion

The Persian date conversion implementation provides a seamless user experience while maintaining backend compatibility. The modular approach with centralized configuration makes it easy to maintain and extend the date functionality across the application.

For questions or issues related to Persian date handling, refer to this guide or check the implementation in the respective component files. 