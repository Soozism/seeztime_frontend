import { useState, useRef, useEffect, useCallback } from 'react';
import { notification, message } from 'antd';
import { TimeLogCreate } from '../types';
import TimeLogService from '../services/timeLogService';

interface TimeTracker {
  isRunning: boolean;
  startTime: Date | null;
  elapsedTime: number; // in seconds
  taskId: number | null;
  description: string;
}

interface UseTimeTrackerOptions {
  autoSave?: boolean;
  saveInterval?: number; // in minutes
  onSave?: (timeLog: TimeLogCreate) => void;
  onError?: (error: Error) => void;
}

export const useTimeTracker = (options: UseTimeTrackerOptions = {}) => {
  const {
    autoSave = false,
    saveInterval = 30, // Default 30 minutes
    onSave,
    onError,
  } = options;

  const [tracker, setTracker] = useState<TimeTracker>({
    isRunning: false,
    startTime: null,
    elapsedTime: 0,
    taskId: null,
    description: '',
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get time in hours
  const getTimeInHours = useCallback((seconds: number) => {
    return parseFloat((seconds / 3600).toFixed(2));
  }, []);

  // Start timer
  const startTimer = useCallback((taskId: number, description: string = '') => {
    const now = new Date();
    setTracker(prev => ({
      ...prev,
      isRunning: true,
      startTime: now,
      taskId,
      description,
    }));

    // Start the main timer
    timerRef.current = setInterval(() => {
      setTracker(prev => {
        if (prev.startTime) {
          const elapsed = Math.floor((Date.now() - prev.startTime.getTime()) / 1000) + prev.elapsedTime;
          return { ...prev, elapsedTime: elapsed };
        }
        return prev;
      });
    }, 1000);

    // Setup auto-save if enabled
    if (autoSave && saveInterval > 0) {
      autoSaveRef.current = setInterval(async () => {
        try {
          const currentTracker = tracker;
          if (currentTracker.taskId && currentTracker.elapsedTime > 0) {
            const hours = getTimeInHours(currentTracker.elapsedTime);
            const timeLogData: TimeLogCreate = {
              task_id: currentTracker.taskId,
              hours: hours,
              description: currentTracker.description || 'جلسه کاری خودکار',
              date: new Date().toISOString().split('T')[0],
            };

            await TimeLogService.createTimeLog(timeLogData);
            
            if (onSave) {
              onSave(timeLogData);
            }

            // Reset elapsed time but keep timer running
            setTracker(prev => ({
              ...prev,
              elapsedTime: 0,
              startTime: prev.isRunning ? new Date() : null,
            }));

            notification.success({
              message: 'ذخیره خودکار',
              description: `${hours} ساعت کاری ثبت شد`,
            });
          }
        } catch (error) {
          console.error('Auto-save error:', error);
        }
      }, saveInterval * 60 * 1000); // Convert minutes to milliseconds
    }

    message.success('شمارش زمان شروع شد');
  }, [autoSave, saveInterval, tracker, getTimeInHours, onSave]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }
    
    setTracker(prev => ({
      ...prev,
      isRunning: false,
      startTime: null,
    }));

    message.info('شمارش زمان متوقف شد');
  }, []);

  // Resume timer
  const resumeTimer = useCallback(() => {
    if (tracker.taskId) {
      const now = new Date();
      setTracker(prev => ({
        ...prev,
        isRunning: true,
        startTime: now,
      }));

      timerRef.current = setInterval(() => {
        setTracker(prev => {
          if (prev.startTime) {
            const elapsed = Math.floor((Date.now() - prev.startTime.getTime()) / 1000) + prev.elapsedTime;
            return { ...prev, elapsedTime: elapsed };
          }
          return prev;
        });
      }, 1000);

      message.success('شمارش زمان ادامه یافت');
    }
  }, [tracker.taskId]);

  // Save current session
  const saveCurrentSession = useCallback(async (resetAfterSave: boolean = false) => {
    if (!tracker.taskId || tracker.elapsedTime === 0) {
      message.warning('هیچ زمانی برای ذخیره وجود ندارد');
      return;
    }

    try {
      const hours = getTimeInHours(tracker.elapsedTime);
      const timeLogData: TimeLogCreate = {
        task_id: tracker.taskId,
        hours: hours,
        description: tracker.description || 'جلسه کاری خودکار',
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      };

      await TimeLogService.createTimeLog(timeLogData);
      
      if (onSave) {
        onSave(timeLogData);
      }

      notification.success({
        message: 'موفقیت',
        description: `${hours} ساعت کاری ثبت شد`,
      });

      if (resetAfterSave) {
        // Reset timer completely
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        if (autoSaveRef.current) {
          clearInterval(autoSaveRef.current);
        }
        
        setTracker({
          isRunning: false,
          startTime: null,
          elapsedTime: 0,
          taskId: null,
          description: '',
        });
      } else {
        // Reset elapsed time but keep timer running
        setTracker(prev => ({
          ...prev,
          elapsedTime: 0,
          startTime: prev.isRunning ? new Date() : null,
        }));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'خطای نامشخص';
      notification.error({
        message: 'خطا در ثبت زمان',
        description: errorMsg,
      });
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMsg));
      }
    }
  }, [tracker, getTimeInHours, onSave, onError]);

  // Stop and save timer
  const stopAndSaveTimer = useCallback(async () => {
    await saveCurrentSession(true);
  }, [saveCurrentSession]);

  // Reset timer
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }
    
    setTracker({
      isRunning: false,
      startTime: null,
      elapsedTime: 0,
      taskId: null,
      description: '',
    });

    message.info('شمارش زمان ریست شد');
  }, []);

  // Update description
  const updateDescription = useCallback((description: string) => {
    setTracker(prev => ({ ...prev, description }));
  }, []);

  // Switch task (pause current, start new)
  const switchTask = useCallback(async (newTaskId: number, description: string = '', saveCurrentFirst: boolean = true) => {
    if (tracker.isRunning && tracker.taskId && saveCurrentFirst) {
      try {
        await saveCurrentSession(false);
      } catch (error) {
        console.error('Error saving current session before switching:', error);
      }
    }

    resetTimer();
    setTimeout(() => {
      startTimer(newTaskId, description);
    }, 100); // Small delay to ensure state is reset
  }, [tracker, saveCurrentSession, resetTimer, startTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, []);

  // Auto-save before page unload
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (tracker.isRunning && tracker.elapsedTime > 0) {
        event.preventDefault();
        event.returnValue = 'شما زمان ثبت نشده دارید. آیا مطمئن هستید که می‌خواهید صفحه را ترک کنید؟';
        
        // Try to save (though this might not work in all browsers due to security restrictions)
        try {
          await saveCurrentSession(false);
        } catch (error) {
          console.error('Error auto-saving before unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tracker, saveCurrentSession]);

  return {
    // State
    tracker,
    isRunning: tracker.isRunning,
    elapsedTime: tracker.elapsedTime,
    taskId: tracker.taskId,
    description: tracker.description,
    
    // Formatted values
    formattedTime: formatTime(tracker.elapsedTime),
    timeInHours: getTimeInHours(tracker.elapsedTime),
    
    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    stopAndSaveTimer,
    saveCurrentSession,
    resetTimer,
    updateDescription,
    switchTask,
    
    // Utilities
    formatTime,
    getTimeInHours,
  };
};

export default useTimeTracker;
