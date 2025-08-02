import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  List,
  Drawer,
  Tabs,
  Empty,
  Spin,
  Skeleton,
  Popconfirm,
  Tooltip,
  Badge,
  Row,
  Col,
  Typography,
  Divider,
  Tag,
  Avatar,
  Dropdown,
  Menu,
  InputNumber,
  Switch,
  Alert,
  Collapse,
  Calendar as AntCalendar,
  Badge as AntBadge,
  message,
} from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  MoreOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  ShareAltOutlined,
  CopyOutlined,
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
  DownOutlined,
  UpOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  LockOutlined,
  TeamOutlined,
  DragOutlined,
} from '@ant-design/icons';
import '../styles/planner.css';
import '../styles/calendar.css';
import { usePlanner } from '../hooks/usePlanner';
import {
  PlannerEvent,
  PlannerTodo,
  CalendarEvent,
} from '../types';
import workingHoursService from '../services/workingHoursService';
import timeOffService from '../services/timeOffService';
import PersianDatePicker from '../components/PersianDatePicker';
import { dateUtils } from '../utils/dateConfig';
import PlannerCalendar from '../components/PlannerCalendar';
import MiniJalaliCalendar from '../components/MiniJalaliCalendar';

import moment from 'moment-jalaali';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// Configure moment for Jalali calendar
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });


const Planner: React.FC = () => {
  const {
    events,
    todos,
    loading,
    completedTodos,
    pendingTodos,
    createEvent,
    updateEvent,
    deleteEvent,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
  } = usePlanner();

  const { user } = useAuth();
  const [scheduleEvents,setScheduleEvents]=useState<CalendarEvent[]>([]);

  // Fetch working hours & timeoff and convert to events
  useEffect(()=>{
    const fetchExtra=async()=>{
      if(!user) return;
      try{
        const start=(moment() as any).startOf('month').format('YYYY-MM-DD');
        const end=(moment() as any).endOf('month').format('YYYY-MM-DD');
        const daily=await workingHoursService.getDailySchedule({user_id:user.id,start_date:start,end_date:end});
        const extra:CalendarEvent[]=daily.map((d:any)=>{
          const title=d.is_holiday?`تعطیل: ${d.holiday_name||''}`:d.is_time_off?'مرخصی':'کاری';
          const color=d.is_holiday?'#ff6b6b':d.is_time_off?'#9e9e9e':'#4caf50';
          return {id:`sch-${d.date}`,title,start:new Date(d.date),end:new Date(d.date),allDay:true,event_type:'schedule',backgroundColor:color,borderColor:color} as unknown as CalendarEvent;
        });
        setScheduleEvents(extra);
      }catch{}
    };
    fetchExtra();
  },[user]);

  // State management
  // Unified modal for both event and todo
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'event' | 'todo'>('event');

  // Helper functions to open modal in desired tab
  const openEventModal = () => {
    setActiveModalTab('event');
    setEditModalVisible(true);
  };

  const openTodoModal = () => {
    setActiveModalTab('todo');
    setEditModalVisible(true);
  };
  const [selectedEvent, setSelectedEvent] = useState<PlannerEvent | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<PlannerTodo | null>(null);
  const [todoDrawerVisible, setTodoDrawerVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [form] = Form.useForm();
  const [todoForm] = Form.useForm();
  
  // Google Calendar-like features
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [eventDetailsVisible, setEventDetailsVisible] = useState(false);
  const [miniCalendarVisible, setMiniCalendarVisible] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showCompletedTodos, setShowCompletedTodos] = useState(true);
  const [calendarSettings, setCalendarSettings] = useState({
    showWeekNumbers: false,
    showTodayButton: true,
    showEventTimes: true,
    showEventDetails: true,
    defaultView: 'dayGridMonth',
  });



  // Event types for categorization (Google Calendar style)
  const eventTypes = [
    { value: 'meeting', label: 'جلسه', color: '#4285f4', icon: <VideoCameraOutlined /> },
    { value: 'hobby', label: 'سرگرمی', color: '#34a853', icon: <CalendarOutlined /> },
    { value: 'work', label: 'کار', color: '#fbbc04', icon: <FileTextOutlined /> },
    { value: 'personal', label: 'شخصی', color: '#ea4335', icon: <UserOutlined /> },
    { value: 'health', label: 'سلامت', color: '#ff6b6b', icon: <InfoCircleOutlined /> },
    { value: 'education', label: 'آموزش', color: '#4ecdc4', icon: <GlobalOutlined /> },
    { value: 'travel', label: 'سفر', color: '#45b7d1', icon: <EnvironmentOutlined /> },
    { value: 'birthday', label: 'تولد', color: '#f78fb3', icon: <BellOutlined /> },
  ];

  // Convert events to calendar format
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    console.log('Events from usePlanner:', events);
    const base= events.map((event) => {
      // Parse the date strings properly
      let startDate, endDate;
      
      try {
        // Handle different date formats
        if (event.start_time.includes('/')) {
          // Persian date format - convert to Gregorian
          const persianStart = moment(event.start_time, 'jYYYY/jMM/jDD HH:mm:ss');
          const persianEnd = moment(event.end_time, 'jYYYY/jMM/jDD HH:mm:ss');
          startDate = persianStart.toDate();
          endDate = persianEnd.toDate();
        } else {
          // ISO date format
          startDate = new Date(event.start_time);
          endDate = new Date(event.end_time);
        }
        
        const calendarEvent = {
          ...event,
          start: startDate,
          end: endDate,
          title: event.title,
          allDay: false,
        };
        
        console.log('Original event:', event);
        console.log('Converted calendar event:', calendarEvent);
        console.log('Start date:', startDate);
        console.log('End date:', endDate);
        
        return calendarEvent;
      } catch (error) {
        console.error('Error converting event:', event, error);
        // Fallback to current date if conversion fails
        return {
          ...event,
          start: new Date(),
          end: new Date(Date.now() + 3600000), // 1 hour later
          title: event.title,
          allDay: false,
        };
      }
    });
    return [...base,...scheduleEvents];
  }, [events,scheduleEvents]);

  // Filtered events based on search
  const filteredEvents = useMemo(() => {
    if (!searchText) return calendarEvents;
    return calendarEvents.filter(event =>
      event.title.toLowerCase().includes(searchText.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [calendarEvents, searchText]);

  // Load data on component mount
  React.useEffect(() => {
    console.log('Planner component mounted, events:', events);
    console.log('Calendar events:', calendarEvents);
    console.log('Filtered events:', filteredEvents);
  }, [events, calendarEvents, filteredEvents]);

  // Quick add event handler (Google Calendar style)
  const handleQuickAdd = useCallback(async () => {
    if (!quickAddText.trim()) return;

    const now = moment();
    const eventData = {
      title: quickAddText,
      description: '',
      start_time: now.format('YYYY-MM-DD HH:mm:ss'),
      end_time: now.add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      location: '',
      event_type: 'meeting',
    };

    try {
      await createEvent(eventData);
      setQuickAddText('');
      setQuickAddVisible(false);
      message.success('رویداد با موفقیت اضافه شد');
    } catch (error) {
      message.error('خطا در ایجاد رویداد');
    }
  }, [quickAddText, createEvent]);

  // Handle event creation/update
  const handleEventSubmit = async (values: any) => {
    try {
      // Convert Persian date strings to ISO format
      let startTime = values.start_time;
      let endTime = values.end_time;
      
      // If the values are strings from PersianDatePicker, convert them
      if (typeof startTime === 'string') {
        // Convert Persian date string to ISO format
        const startDate = moment(startTime, 'jYYYY/jMM/jDD HH:mm');
        startTime = startDate.format('YYYY-MM-DD HH:mm:ss');
      } else if (startTime && startTime.format) {
        // If it's a moment object
        startTime = startTime.format('YYYY-MM-DD HH:mm:ss');
      }
      
      if (typeof endTime === 'string') {
        // Convert Persian date string to ISO format
        const endDate = moment(endTime, 'jYYYY/jMM/jDD HH:mm');
        endTime = endDate.format('YYYY-MM-DD HH:mm:ss');
      } else if (endTime && endTime.format) {
        // If it's a moment object
        endTime = endTime.format('YYYY-MM-DD HH:mm:ss');
      }

      const eventData = {
        title: values.title,
        description: values.description,
        start_time: startTime,
        end_time: endTime,
        location: values.location,
        event_type: values.event_type,
      };

      if (selectedEvent) {
        await updateEvent(selectedEvent.id, eventData);
        message.success('رویداد با موفقیت بروزرسانی شد');
      } else {
        await createEvent(eventData);
        message.success('رویداد با موفقیت ایجاد شد');
      }

      setEditModalVisible(false);
      setSelectedEvent(null);
      form.resetFields();
    } catch (error) {
      console.error('Event submit error:', error);
      message.error('خطا در ذخیره رویداد');
    }
  };

  // Handle todo creation/update
  const handleTodoSubmit = async (values: any) => {
    try {
      // Convert Persian date string to ISO format
      let dueDate = values.due_date;
      
      if (typeof dueDate === 'string') {
        // Convert Persian date string to ISO format
        const date = moment(dueDate, 'jYYYY/jMM/jDD HH:mm');
        dueDate = date.format('YYYY-MM-DD HH:mm:ss');
      } else if (dueDate && dueDate.format) {
        // If it's a moment object
        dueDate = dueDate.format('YYYY-MM-DD HH:mm:ss');
      }

      const todoData = {
        title: values.title,
        description: values.description,
        due_date: dueDate,
        is_completed: values.is_completed || false,
      };

      if (selectedTodo) {
        await updateTodo(selectedTodo.id, todoData);
        message.success('کار با موفقیت بروزرسانی شد');
      } else {
        await createTodo(todoData);
        message.success('کار با موفقیت ایجاد شد');
      }

      setEditModalVisible(false);
      setSelectedTodo(null);
      todoForm.resetFields();
    } catch (error) {
      console.error('Todo submit error:', error);
      message.error('خطا در ذخیره کار');
    }
  };

  // Handle event deletion
  const handleEventDelete = async (eventId: number) => {
    try {
      await deleteEvent(eventId);
      setEventDetailsVisible(false);
      message.success('رویداد با موفقیت حذف شد');
    } catch (error) {
      message.error('خطا در حذف رویداد');
    }
  };

  // Handle todo deletion
  const handleTodoDelete = async (todoId: number) => {
    try {
      await deleteTodo(todoId);
      message.success('کار با موفقیت حذف شد');
    } catch (error) {
      message.error('خطا در حذف کار');
    }
  };

  // Handle todo completion toggle
  const handleTodoToggle = async (todo: PlannerTodo) => {
    try {
      await toggleTodoComplete(todo.id, !todo.is_completed);
    } catch (error) {
      message.error('خطا در بروزرسانی کار');
    }
  };

  // Google Calendar-style slot selection
  const handleSelectSlot = (slotInfo: any) => {
    setSelectedEvent(null);
    const startMoment = moment(slotInfo.start);
    const endMoment = moment(slotInfo.end);
    
    form.setFieldsValue({
      start_time: startMoment.format('jYYYY/jMM/jDD HH:mm'),
      end_time: endMoment.format('jYYYY/jMM/jDD HH:mm'),
    });
    openEventModal();
  };

  // Handle event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    const clickedId = typeof event.id === 'string' ? parseInt(event.id) : event.id;
    const plannerEvent = events.find((e) => e.id === clickedId);
    if (plannerEvent) {
      setSelectedEvent(plannerEvent);
      setEventDetailsVisible(true);
    }
  };



  // Event styling (Google Calendar style)
  const eventStyleGetter = (event: CalendarEvent) => {
    const eventType = event.event_type || 'meeting';
    const typeConfig = eventTypes.find(t => t.value === eventType);
    
    return {
      className: `event-${eventType} google-calendar-event`,
      style: {
        backgroundColor: typeConfig?.color || '#4285f4',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontWeight: '500',
        padding: '2px 6px',
        fontSize: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        cursor: 'pointer',
        position: 'relative' as const,
        minHeight: '20px',
      },
    };
  };



  // Mini calendar date cell renderer
  const dateCellRender = (value: any) => {
    const dateEvents = events.filter(event => 
      moment(event.start_time).isSame(value, 'day')
    );
    
    return (
      <div className="mini-calendar-date">
        {dateEvents.map((event, index) => (
          <div
            key={index}
            className="mini-calendar-event"
            style={{
              backgroundColor: eventTypes.find(t => t.value === event.event_type)?.color || '#4285f4',
              height: '4px',
              margin: '1px 0',
              borderRadius: '2px',
            }}
          />
        ))}
      </div>
    );
  };

  // Event details sidebar
  const EventDetailsSidebar = () => {
    if (!selectedEvent) return null;

    const eventType = eventTypes.find(t => t.value === selectedEvent.event_type);
    
    return (
      <Drawer
        title={
          <Space>
            {eventType?.icon}
            <Text strong>{selectedEvent.title}</Text>
          </Space>
        }
        placement="right"
        width={400}
        open={eventDetailsVisible}
        onClose={() => setEventDetailsVisible(false)}
        className="event-details-drawer"
        extra={
          <Space>
            <Tooltip title="ویرایش">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setEventDetailsVisible(false);
                  setSelectedEvent(selectedEvent);
                  form.setFieldsValue({
                    title: selectedEvent.title,
                    description: selectedEvent.description,
                    start_time: moment(selectedEvent.start_time),
                    end_time: moment(selectedEvent.end_time),
                    location: selectedEvent.location,
                    event_type: selectedEvent.event_type,
                  });
                  openEventModal();
                }}
              />
            </Tooltip>
            <Popconfirm
              title="آیا از حذف این رویداد اطمینان دارید؟"
              onConfirm={() => handleEventDelete(selectedEvent.id)}
              okText="بله"
              cancelText="خیر"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Event Type Badge */}
          <div>
            <Tag color={eventType?.color} icon={eventType?.icon}>
              {eventType?.label}
            </Tag>
          </div>

          {/* Time Information */}
          <div>
            <Title level={5}>زمان</Title>
            <Space direction="vertical" size="small">
              <Space>
                <ClockCircleOutlined />
                <Text>
                  {moment(selectedEvent.start_time).format('jYYYY/jMM/jDD HH:mm')} - 
                  {moment(selectedEvent.end_time).format(' HH:mm')}
                </Text>
              </Space>
              <Text type="secondary">
                مدت: {Math.round((new Date(selectedEvent.end_time).getTime() - new Date(selectedEvent.start_time).getTime()) / (1000 * 60 * 60))} ساعت
              </Text>
            </Space>
          </div>

          {/* Location */}
          {selectedEvent.location && (
            <div>
              <Title level={5}>مکان</Title>
              <Space>
                <EnvironmentOutlined />
                <Text>{selectedEvent.location}</Text>
              </Space>
            </div>
          )}

          {/* Description */}
          {selectedEvent.description && (
            <div>
              <Title level={5}>توضیحات</Title>
              <Paragraph>{selectedEvent.description}</Paragraph>
            </div>
          )}

          {/* Actions */}
          <Divider />
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button icon={<ShareAltOutlined />} block>
              اشتراک‌گذاری
            </Button>
            <Button icon={<CopyOutlined />} block>
              کپی لینک
            </Button>
            <Button icon={<BellOutlined />} block>
              یادآوری
            </Button>
          </Space>
        </Space>
      </Drawer>
    );
  };

  return (
    <div className="planner-container fade-in">
      <Row gutter={[16, 16]}>
        {/* Main Calendar Column */}
        <Col xs={24} lg={miniCalendarVisible ? 18 : 24}>
          <Card
            className="planner-card"
            title={
              <Space>
                <CalendarOutlined style={{ color: '#1a73e8' }} />
                <Title level={4} style={{ margin: 0, color: '#3c4043' }}>
                  تقویم شخصی
                </Title>
              </Space>
            }
            extra={
              <Space>
                {/* Quick Add Button */}
                <Button
                  type="primary"
                  className="planner-btn-primary"
                  icon={<PlusOutlined />}
                  onClick={() => setQuickAddVisible(true)}
                  aria-label="ایجاد رویداد جدید"
                >
                  رویداد جدید
                </Button>
                
                {/* Search */}
                <Input
                  placeholder="جستجو در رویدادها..."
                  prefix={<SearchOutlined style={{ color: '#5f6368' }} />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 200 }}
                  aria-label="جستجو در رویدادها"
                />
                
                {/* Settings */}
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item key="settings" icon={<SettingOutlined />}>
                        تنظیمات
                      </Menu.Item>
                      <Menu.Item key="todos" icon={<CheckSquareOutlined />}>
                        کارها ({todos.length})
                      </Menu.Item>
                      <Menu.Item key="mini-calendar" icon={<CalendarOutlined />}>
                        {miniCalendarVisible ? 'مخفی کردن تقویم کوچک' : 'نمایش تقویم کوچک'}
                      </Menu.Item>
                      <Menu.Item 
                        key="test-event" 
                        icon={<PlusOutlined />}
                        onClick={() => {
                          const testEvent = {
                            title: 'تست رویداد',
                            description: 'این یک رویداد تست است',
                            start_time: moment().format('YYYY-MM-DD HH:mm:ss'),
                            end_time: moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
                            location: 'دفتر',
                            event_type: 'meeting',
                          };
                          createEvent(testEvent);
                        }}
                      >
                        افزودن رویداد تست
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button icon={<MoreOutlined />} aria-label="منوی تنظیمات" />
                </Dropdown>
              </Space>
            }
          >
            {loading ? (
              <Skeleton active style={{ height: 600 }} paragraph={{ rows: 10 }} />
            ) : (
              <div style={{height:'85vh'}}>
              <PlannerCalendar
                events={calendarEvents.map(e=>({...e,id: e.id.toString()}))}
                onDateSelect={(arg) => {
                  handleSelectSlot({
                    start: arg.start,
                    end: arg.end,
                    slots: [],
                  } as any);
                }}
                onEventClick={(arg) => {
                  handleSelectEvent({
                    id: arg.event.id,
                    title: arg.event.title,
                    start: arg.event.start!,
                    end: arg.event.end!,
                    allDay: arg.event.allDay,
                    event_type: undefined,
                  } as any);
                }}
                onEventDrop={(arg)=>{
                  const id=parseInt(arg.event.id as string);
                  updateEvent(id,{
                    start_time: arg.event.start?.toISOString()||'',
                    end_time: arg.event.end?.toISOString()||''
                  });
                }}
                onEventResize={(arg)=>{
                  const id=parseInt(arg.event.id as string);
                  updateEvent(id,{
                    start_time: arg.event.start?.toISOString()||'',
                    end_time: arg.event.end?.toISOString()||''
                  });
                }}
              />
              </div>
            )}
          </Card>
        </Col>

        {/* Mini Calendar and Todos Sidebar */}
        {miniCalendarVisible && (
          <Col xs={24} lg={6}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* Mini Jalali Calendar */}
              <Card className="planner-card" title="تقویم کوچک">
                <MiniJalaliCalendar events={events.map(ev=>({start_time:ev.start_time,event_type:ev.event_type||undefined}))} />
              </Card>

              {/* Quick Add */}
              <Card className="planner-card" title="افزودن سریع">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input
                    placeholder="رویداد جدید..."
                    value={quickAddText}
                    onChange={(e) => setQuickAddText(e.target.value)}
                    onPressEnter={handleQuickAdd}
                  />
                  <Button
                    type="primary"
                    block
                    onClick={handleQuickAdd}
                    disabled={!quickAddText.trim()}
                  >
                    افزودن
                  </Button>
                </Space>
              </Card>

              {/* Todos Summary */}
              <Card 
                className="planner-card" 
                title={
                  <Space>
                    <CheckSquareOutlined />
                    <span>کارها</span>
                    <Badge count={pendingTodos.length} size="small" />
                  </Space>
                }
                extra={
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => setTodoDrawerVisible(true)}
                  >
                    مشاهده همه
                  </Button>
                }
              >
                {loading ? (
                  <Skeleton active paragraph={{ rows: 4 }} />
                ) : (
                <List
                  size="small"
                  dataSource={pendingTodos.slice(0, 3)}
                  renderItem={(todo) => (
                    <List.Item
                      className="todo-list-item"
                      actions={[
                        <Checkbox
                          checked={todo.is_completed}
                          onChange={() => handleTodoToggle(todo)}
                        />,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Text
                            style={{
                              textDecoration: todo.is_completed ? 'line-through' : 'none',
                              fontSize: '12px',
                            }}
                          >
                            {todo.title}
                          </Text>
                        }
                        description={
                          todo.due_date && (
                            <Text type="secondary" style={{ fontSize: '10px' }}>
                              {moment(todo.due_date).format('jMM/jDD')}
                            </Text>
                          )
                        }
                      />
                    </List.Item>
                  )}
                  locale={{
                    emptyText: <Empty description="هیچ کاری وجود ندارد" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
                  }}
                />
                )}
              </Card>
            </Space>
          </Col>
        )}
      </Row>

      {/* Quick Add Modal */}
      <Modal
        title="افزودن سریع رویداد"
        open={quickAddVisible}
        onCancel={() => {
          setQuickAddVisible(false);
          setQuickAddText('');
        }}
        footer={null}
        width={400}
        destroyOnClose
        className="planner-modal"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="عنوان رویداد..."
            value={quickAddText}
            onChange={(e) => setQuickAddText(e.target.value)}
            onPressEnter={handleQuickAdd}
            autoFocus
          />
          <Alert
            message="نکته"
            description="برای افزودن جزئیات بیشتر، روی تقویم کلیک کنید یا بازه زمانی را بکشید"
            type="info"
            showIcon
          />
          <Space>
            <Button onClick={() => setQuickAddVisible(false)}>
              انصراف
            </Button>
            <Button
              type="primary"
              onClick={handleQuickAdd}
              disabled={!quickAddText.trim()}
            >
              افزودن
            </Button>
          </Space>
        </Space>
      </Modal>

      {/* Unified Edit Modal */}
      <Modal
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedEvent(null);
          setSelectedTodo(null);
          form.resetFields();
          todoForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
        className="planner-modal"
      >
        <Tabs activeKey={activeModalTab} onChange={(key) => setActiveModalTab(key as any)}>
          <TabPane tab="رویداد" key="event">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleEventSubmit}
              initialValues={{
                event_type: 'meeting',
              }}
              className="planner-form"
            >
              <Form.Item
                name="title"
                label="عنوان"
                rules={[{ required: true, message: 'لطفاً عنوان را وارد کنید' }]}
              >
                <Input placeholder="عنوان رویداد" />
              </Form.Item>

              <Form.Item name="description" label="توضیحات">
                <TextArea rows={3} placeholder="توضیحات رویداد" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="start_time"
                    label="زمان شروع"
                    rules={[{ required: true, message: 'لطفاً زمان شروع را انتخاب کنید' }]}
                  >
                    <PersianDatePicker
                      showTime
                      format="jYYYY/jMM/jDD HH:mm"
                      placeholder="زمان شروع"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="end_time"
                    label="زمان پایان"
                    rules={[{ required: true, message: 'لطفاً زمان پایان را انتخاب کنید' }]}
                  >
                    <PersianDatePicker
                      showTime
                      format="jYYYY/jMM/jDD HH:mm"
                      placeholder="زمان پایان"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="location" label="مکان">
                <Input placeholder="مکان رویداد" prefix={<EnvironmentOutlined />} />
              </Form.Item>

              <Form.Item name="event_type" label="نوع رویداد">
                <Select placeholder="نوع رویداد را انتخاب کنید">
                  {eventTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      <Space>
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: type.color,
                          }}
                        />
                        {type.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" className="planner-btn-primary" htmlType="submit">
                    {selectedEvent ? 'بروزرسانی' : 'ایجاد'}
                  </Button>
                  {selectedEvent && (
                    <Popconfirm
                      title="آیا از حذف این رویداد اطمینان دارید؟"
                      onConfirm={() => handleEventDelete(selectedEvent.id)}
                      okText="بله"
                      cancelText="خیر"
                    >
                      <Button danger icon={<DeleteOutlined />}>
                        حذف
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="کار" key="todo">
            <Form
              form={todoForm}
              layout="vertical"
              onFinish={handleTodoSubmit}
              initialValues={{
                is_completed: false,
              }}
              className="planner-form"
            >
              <Form.Item
                name="title"
                label="عنوان"
                rules={[{ required: true, message: 'لطفاً عنوان را وارد کنید' }]}
              >
                <Input placeholder="عنوان کار" />
              </Form.Item>

              <Form.Item name="description" label="توضیحات">
                <TextArea rows={3} placeholder="توضیحات کار" />
              </Form.Item>

              <Form.Item name="due_date" label="تاریخ و زمان سررسید">
                <PersianDatePicker
                  showTime
                  format="jYYYY/jMM/jDD HH:mm"
                  placeholder="تاریخ و زمان سررسید"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item name="is_completed" valuePropName="checked">
                <Checkbox>انجام شده</Checkbox>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" className="planner-btn-primary" htmlType="submit">
                    {selectedTodo ? 'بروزرسانی' : 'ایجاد'}
                  </Button>
                  {selectedTodo && (
                    <Popconfirm
                      title="آیا از حذف این کار اطمینان دارید؟"
                      onConfirm={() => handleTodoDelete(selectedTodo.id)}
                      okText="بله"
                      cancelText="خیر"
                    >
                      <Button danger icon={<DeleteOutlined />}>
                        حذف
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>

      {/* Todo Drawer */}
      <Drawer
        title={
          <Space>
            <CheckSquareOutlined />
            <Text strong>کارهای شخصی</Text>
          </Space>
        }
        placement="right"
        width={400}
        open={todoDrawerVisible}
        onClose={() => setTodoDrawerVisible(false)}
        className="planner-drawer"
        extra={
          <Button
            type="primary"
            className="planner-btn-primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setTodoDrawerVisible(false);
              setSelectedTodo(null);
              todoForm.resetFields();
              openTodoModal();
            }}
          >
            کار جدید
          </Button>
        }
      >
        <Tabs defaultActiveKey="pending">
          <TabPane
            tab={
              <Badge count={pendingTodos.length} size="small" className="planner-badge">
                <span>در انتظار</span>
              </Badge>
            }
            key="pending"
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
            <List
              dataSource={pendingTodos}
              renderItem={(todo) => (
                <List.Item
                  className={`todo-list-item ${todo.is_completed ? 'todo-completed' : ''}`}
                  actions={[
                    <Tooltip title="ویرایش">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setSelectedTodo(todo);
                          todoForm.setFieldsValue({
                            title: todo.title,
                            description: todo.description,
                            due_date: todo.due_date ? moment(todo.due_date) : null,
                            is_completed: todo.is_completed,
                          });
                          setTodoDrawerVisible(false);
                          openTodoModal();
                        }}
                      />
                    </Tooltip>,
                    <Popconfirm
                      title="آیا از حذف این کار اطمینان دارید؟"
                      onConfirm={() => handleTodoDelete(todo.id)}
                      okText="بله"
                      cancelText="خیر"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Checkbox
                        checked={todo.is_completed}
                        onChange={() => handleTodoToggle(todo)}
                      />
                    }
                    title={
                      <Text
                        style={{
                          textDecoration: todo.is_completed ? 'line-through' : 'none',
                        }}
                      >
                        {todo.title}
                      </Text>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        {todo.description && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {todo.description}
                          </Text>
                        )}
                        {todo.due_date && (
                          <Space size="small">
                            <ClockCircleOutlined />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {moment(todo.due_date).format('jYYYY/jMM/jDD HH:mm')}
                            </Text>
                          </Space>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{
                emptyText: <Empty description="هیچ کاری در انتظار وجود ندارد" />,
              }}
            />
            )}
          </TabPane>
          <TabPane
            tab={
              <Badge count={completedTodos.length} size="small" className="planner-badge">
                <span>انجام شده</span>
              </Badge>
            }
            key="completed"
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
            <List
              dataSource={completedTodos}
              renderItem={(todo) => (
                <List.Item
                  className={`todo-list-item ${todo.is_completed ? 'todo-completed' : ''}`}
                  actions={[
                    <Tooltip title="ویرایش">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setSelectedTodo(todo);
                          todoForm.setFieldsValue({
                            title: todo.title,
                            description: todo.description,
                            due_date: todo.due_date ? moment(todo.due_date) : null,
                            is_completed: todo.is_completed,
                          });
                          setTodoDrawerVisible(false);
                          openTodoModal();
                        }}
                      />
                    </Tooltip>,
                    <Popconfirm
                      title="آیا از حذف این کار اطمینان دارید؟"
                      onConfirm={() => handleTodoDelete(todo.id)}
                      okText="بله"
                      cancelText="خیر"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Checkbox
                        checked={todo.is_completed}
                        onChange={() => handleTodoToggle(todo)}
                      />
                    }
                    title={
                      <Text
                        style={{
                          textDecoration: todo.is_completed ? 'line-through' : 'none',
                          color: '#52c41a',
                        }}
                      >
                        {todo.title}
                      </Text>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        {todo.description && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {todo.description}
                          </Text>
                        )}
                        {todo.due_date && (
                          <Space size="small">
                            <ClockCircleOutlined />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {moment(todo.due_date).format('jYYYY/jMM/jDD HH:mm')}
                            </Text>
                          </Space>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{
                emptyText: <Empty description="هیچ کاری انجام نشده است" />,
              }}
            />
            )}
          </TabPane>
        </Tabs>
      </Drawer>

      {/* Event Details Sidebar */}
      <EventDetailsSidebar />

      {/* Floating Action Button */}
      <Button
        type="primary"
        shape="circle"
        icon={<PlusOutlined />}
        size="large"
        className="planner-fab"
        aria-label="ایجاد رویداد جدید"
        onClick={() => setQuickAddVisible(true)}
      />
    </div>
  );
};

export default Planner;
