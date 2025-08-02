import { useState, useEffect, useCallback } from 'react';
import { notification } from 'antd';
import plannerService from '../services/plannerService';
import {
  PlannerEvent,
  PlannerEventCreate,
  PlannerEventUpdate,
  PlannerTodo,
  PlannerTodoCreate,
  PlannerTodoUpdate,
  EventFilters,
  TodoFilters,
} from '../types';

export const usePlanner = () => {
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [todos, setTodos] = useState<PlannerTodo[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventFilters, setEventFilters] = useState<EventFilters>({});
  const [todoFilters, setTodoFilters] = useState<TodoFilters>({});

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsData, todosData] = await Promise.all([
        plannerService.getEvents(eventFilters),
        plannerService.getTodos(todoFilters),
      ]);
      setEvents(eventsData);
      setTodos(todosData);
    } catch (error) {
      notification.error({
        message: 'خطا در بارگذاری داده‌ها',
        description: 'مشکلی در دریافت رویدادها و کارها رخ داده است',
      });
    } finally {
      setLoading(false);
    }
  }, [eventFilters, todoFilters]);

  // Event operations
  const createEvent = useCallback(async (eventData: PlannerEventCreate) => {
    try {
      const newEvent = await plannerService.createEvent(eventData);
      setEvents(prev => [...prev, newEvent]);
      notification.success({
        message: 'رویداد با موفقیت ایجاد شد',
      });
      return newEvent;
    } catch (error) {
      notification.error({
        message: 'خطا در ایجاد رویداد',
        description: 'مشکلی در ایجاد رویداد رخ داده است',
      });
      throw error;
    }
  }, []);

  const updateEvent = useCallback(async (eventId: number, eventData: PlannerEventUpdate) => {
    try {
      const updatedEvent = await plannerService.updateEvent(eventId, eventData);
      setEvents(prev => prev.map(event => 
        event.id === eventId ? updatedEvent : event
      ));
      notification.success({
        message: 'رویداد با موفقیت بروزرسانی شد',
      });
      return updatedEvent;
    } catch (error) {
      notification.error({
        message: 'خطا در بروزرسانی رویداد',
        description: 'مشکلی در بروزرسانی رویداد رخ داده است',
      });
      throw error;
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: number) => {
    try {
      await plannerService.deleteEvent(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      notification.success({
        message: 'رویداد با موفقیت حذف شد',
      });
    } catch (error) {
      notification.error({
        message: 'خطا در حذف رویداد',
        description: 'مشکلی در حذف رویداد رخ داده است',
      });
      throw error;
    }
  }, []);

  // Todo operations
  const createTodo = useCallback(async (todoData: PlannerTodoCreate) => {
    try {
      const newTodo = await plannerService.createTodo(todoData);
      setTodos(prev => [...prev, newTodo]);
      notification.success({
        message: 'کار با موفقیت ایجاد شد',
      });
      return newTodo;
    } catch (error) {
      notification.error({
        message: 'خطا در ایجاد کار',
        description: 'مشکلی در ایجاد کار رخ داده است',
      });
      throw error;
    }
  }, []);

  const updateTodo = useCallback(async (todoId: number, todoData: PlannerTodoUpdate) => {
    try {
      const updatedTodo = await plannerService.updateTodo(todoId, todoData);
      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
      notification.success({
        message: 'کار با موفقیت بروزرسانی شد',
      });
      return updatedTodo;
    } catch (error) {
      notification.error({
        message: 'خطا در بروزرسانی کار',
        description: 'مشکلی در بروزرسانی کار رخ داده است',
      });
      throw error;
    }
  }, []);

  const deleteTodo = useCallback(async (todoId: number) => {
    try {
      await plannerService.deleteTodo(todoId);
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
      notification.success({
        message: 'کار با موفقیت حذف شد',
      });
    } catch (error) {
      notification.error({
        message: 'خطا در حذف کار',
        description: 'مشکلی در حذف کار رخ داده است',
      });
      throw error;
    }
  }, []);

  const toggleTodoComplete = useCallback(async (todoId: number, isCompleted: boolean) => {
    try {
      const updatedTodo = await plannerService.toggleTodoComplete(todoId, isCompleted);
      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
    } catch (error) {
      notification.error({
        message: 'خطا در بروزرسانی کار',
        description: 'مشکلی در بروزرسانی وضعیت کار رخ داده است',
      });
      throw error;
    }
  }, []);

  // Filtered data
  const completedTodos = todos.filter(todo => todo.is_completed);
  const pendingTodos = todos.filter(todo => !todo.is_completed);

  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // State
    events,
    todos,
    loading,
    eventFilters,
    todoFilters,
    completedTodos,
    pendingTodos,
    
    // Actions
    loadData,
    setEventFilters,
    setTodoFilters,
    
    // Event operations
    createEvent,
    updateEvent,
    deleteEvent,
    
    // Todo operations
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
  };
}; 