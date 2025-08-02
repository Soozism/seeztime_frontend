# Google Calendar-Style Planner with Persian/Jalali Calendar Support

## Overview

The Planner component has been completely redesigned to provide a Google Calendar-like experience with full Persian/Jalali calendar support. This implementation includes all the key features that users expect from Google Calendar while maintaining cultural and linguistic appropriateness for Persian users.

## Key Features

### 🗓️ **Persian/Jalali Calendar Integration**
- Full Jalali calendar support using `moment-jalaali`
- Persian date formatting throughout the interface
- Jalali month names and day labels
- Persian number support (optional)

### 📅 **Google Calendar-Style Interface**
- Clean, modern design matching Google Calendar aesthetics
- Responsive layout with sidebar and main calendar area
- Intuitive navigation and controls
- Professional color scheme and typography

### ⚡ **Quick Add Functionality**
- One-click event creation from the sidebar
- Quick add modal for fast event entry
- Keyboard shortcuts (Enter to add)
- Smart default time settings

### 🔍 **Advanced Search & Filtering**
- Real-time search across event titles, descriptions, and locations
- Filter by event types
- Search suggestions and highlighting
- Persistent search state

### 📱 **Mini Calendar Sidebar**
- Compact calendar view showing current month
- Event indicators on dates with events
- Quick navigation between months
- Today highlighting

### 📋 **Todo Management**
- Integrated todo list with calendar events
- Quick todo creation and management
- Due date tracking
- Completion status tracking
- Separate drawer for detailed todo management

### 🎨 **Event Categories & Colors**
- 8 predefined event types with distinct colors:
  - **جلسه (Meeting)**: Blue (#4285f4)
  - **سرگرمی (Hobby)**: Green (#34a853)
  - **کار (Work)**: Yellow (#fbbc04)
  - **شخصی (Personal)**: Red (#ea4335)
  - **سلامت (Health)**: Pink (#ff6b6b)
  - **آموزش (Education)**: Teal (#4ecdc4)
  - **سفر (Travel)**: Light Blue (#45b7d1)
  - **تولد (Birthday)**: Light Pink (#f78fb3)

### 📊 **Multiple Calendar Views**
- **Month View**: Traditional monthly calendar layout
- **Week View**: Detailed weekly schedule
- **Day View**: Hour-by-hour daily view
- **Agenda View**: List view of upcoming events

### 🔧 **Event Details Sidebar**
- Comprehensive event information display
- Quick edit and delete actions
- Event sharing options
- Duration calculation
- Location and description display

### 🎯 **Smart Event Management**
- Drag and drop event creation
- Click-to-edit existing events
- Bulk operations support
- Event duplication
- Recurring event support (planned)

### 📱 **Responsive Design**
- Mobile-optimized interface
- Touch-friendly controls
- Adaptive layout for different screen sizes
- Tablet and desktop optimizations

## Technical Implementation

### Core Technologies
- **React 18** with TypeScript
- **Ant Design** for UI components
- **React Big Calendar** for calendar functionality
- **Moment Jalaali** for Persian date handling
- **Custom CSS** for Google Calendar styling

### State Management
```typescript
// Main state variables
const [events, setEvents] = useState<PlannerEvent[]>([]);
const [todos, setTodos] = useState<PlannerTodo[]>([]);
const [currentView, setCurrentView] = useState<View>(Views.MONTH);
const [currentDate, setCurrentDate] = useState(new Date());
const [searchText, setSearchText] = useState('');
const [miniCalendarVisible, setMiniCalendarVisible] = useState(true);
```

### Event Handling
```typescript
// Quick add event
const handleQuickAdd = useCallback(async () => {
  const eventData = {
    title: quickAddText,
    start_time: now.format('YYYY-MM-DD HH:mm:ss'),
    end_time: now.add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    event_type: 'meeting',
  };
  await createEvent(eventData);
}, [quickAddText, createEvent]);
```

### Persian Date Integration
```typescript
// Configure moment for Jalali calendar
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

// Date formatting
moment(date).format('jYYYY/jMM/jDD HH:mm')
```

## User Experience Features

### 🚀 **Quick Actions**
- **Quick Add**: Type event title and press Enter
- **Drag to Create**: Click and drag on calendar to create events
- **Click to Edit**: Click any event to view details and edit
- **Keyboard Navigation**: Full keyboard support for accessibility

### 🎨 **Visual Feedback**
- Hover effects on interactive elements
- Loading states and progress indicators
- Success/error notifications
- Smooth animations and transitions

### 🔧 **Customization Options**
- Toggle mini calendar visibility
- Customize event colors and types
- Adjust calendar settings
- Personalize interface preferences

### 📊 **Data Management**
- Real-time data synchronization
- Offline support (planned)
- Data export/import capabilities
- Backup and restore functionality

## Accessibility Features

### ♿ **Accessibility Compliance**
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

### 🌍 **Internationalization**
- Persian language support
- RTL layout support
- Cultural date formatting
- Localized error messages

## Performance Optimizations

### ⚡ **Performance Features**
- Virtualized event rendering
- Lazy loading of calendar data
- Optimized re-renders
- Efficient state management
- Memory leak prevention

### 🔄 **Caching Strategy**
- Event data caching
- User preferences caching
- Search result caching
- Calendar view state persistence

## Future Enhancements

### 🚀 **Planned Features**
- **Recurring Events**: Support for daily, weekly, monthly, yearly recurring events
- **Event Reminders**: Push notifications and email reminders
- **Calendar Sharing**: Share calendars with other users
- **Event Templates**: Predefined event templates
- **Advanced Search**: Full-text search with filters
- **Data Export**: Export to iCal, Google Calendar, Outlook
- **Mobile App**: Native mobile application
- **Offline Support**: Full offline functionality

### 🔧 **Technical Improvements**
- **Service Worker**: For offline functionality
- **WebSocket**: Real-time updates
- **PWA Support**: Progressive Web App features
- **Performance Monitoring**: Analytics and performance tracking

## Usage Examples

### Creating a Quick Event
```typescript
// User types in quick add field
setQuickAddText("جلسه تیم");
// Presses Enter
handleQuickAdd(); // Creates event for current time + 1 hour
```

### Adding Event Details
```typescript
// Click on calendar slot
handleSelectSlot(slotInfo);
// Opens detailed event form
// User fills in title, description, location, type
handleEventSubmit(values);
```

### Searching Events
```typescript
// User types in search field
setSearchText("جلسه");
// Events are filtered in real-time
const filteredEvents = events.filter(event => 
  event.title.includes(searchText)
);
```

## Configuration Options

### Calendar Settings
```typescript
const calendarSettings = {
  showWeekNumbers: false,
  showTodayButton: true,
  showEventTimes: true,
  showEventDetails: true,
  defaultView: Views.MONTH,
  step: 15, // 15-minute time slots
  timeslots: 4, // 4 slots per hour
};
```

### Event Type Configuration
```typescript
const eventTypes = [
  { value: 'meeting', label: 'جلسه', color: '#4285f4', icon: <VideoCameraOutlined /> },
  { value: 'work', label: 'کار', color: '#fbbc04', icon: <FileTextOutlined /> },
  // ... more types
];
```

## Troubleshooting

### Common Issues
1. **Persian Date Display Issues**: Ensure moment-jalaali is properly configured
2. **Event Not Saving**: Check API connectivity and form validation
3. **Calendar Not Loading**: Verify react-big-calendar installation
4. **Styling Issues**: Check CSS import order and specificity

### Debug Mode
Enable debug mode for detailed logging:
```typescript
const DEBUG_MODE = process.env.NODE_ENV === 'development';
```

## Contributing

### Development Setup
1. Install dependencies: `npm install`
2. Start development server: `npm start`
3. Run tests: `npm test`
4. Build for production: `npm run build`

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent naming conventions
- Add comprehensive JSDoc comments

### Testing
- Unit tests for utility functions
- Integration tests for API calls
- E2E tests for user workflows
- Accessibility testing

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide
- Contact the development team

---

**Last Updated**: December 2024
**Version**: 2.0.0
**Compatibility**: React 18+, TypeScript 4.5+, Ant Design 5.0+ 