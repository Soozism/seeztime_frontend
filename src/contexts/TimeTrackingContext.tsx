import React, { createContext, useContext, ReactNode } from 'react';
import { useTimeTracker } from '../hooks/useTimeTracker';
import { TimeLogCreate } from '../types';

interface TimeTrackingContextType {
  // State
  isRunning: boolean;
  elapsedTime: number;
  taskId: number | null;
  description: string;
  formattedTime: string;
  timeInHours: number;
  
  // Actions
  startTimer: (taskId: number, description?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopAndSaveTimer: () => Promise<void>;
  saveCurrentSession: (resetAfterSave?: boolean) => Promise<void>;
  resetTimer: () => void;
  updateDescription: (description: string) => void;
  switchTask: (newTaskId: number, description?: string, saveCurrentFirst?: boolean) => Promise<void>;
  
  // Utilities
  formatTime: (seconds: number) => string;
  getTimeInHours: (seconds: number) => number;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

interface TimeTrackingProviderProps {
  children: ReactNode;
  autoSave?: boolean;
  saveInterval?: number; // in minutes
  onSave?: (timeLog: TimeLogCreate) => void;
  onError?: (error: Error) => void;
}

export const TimeTrackingProvider: React.FC<TimeTrackingProviderProps> = ({
  children,
  autoSave = true,
  saveInterval = 30,
  onSave,
  onError,
}) => {
  const timeTracker = useTimeTracker({
    autoSave,
    saveInterval,
    onSave,
    onError,
  });

  const contextValue: TimeTrackingContextType = {
    // State
    isRunning: timeTracker.isRunning,
    elapsedTime: timeTracker.elapsedTime,
    taskId: timeTracker.taskId,
    description: timeTracker.description,
    formattedTime: timeTracker.formattedTime,
    timeInHours: timeTracker.timeInHours,
    
    // Actions
    startTimer: timeTracker.startTimer,
    pauseTimer: timeTracker.pauseTimer,
    resumeTimer: timeTracker.resumeTimer,
    stopAndSaveTimer: timeTracker.stopAndSaveTimer,
    saveCurrentSession: timeTracker.saveCurrentSession,
    resetTimer: timeTracker.resetTimer,
    updateDescription: timeTracker.updateDescription,
    switchTask: timeTracker.switchTask,
    
    // Utilities
    formatTime: timeTracker.formatTime,
    getTimeInHours: timeTracker.getTimeInHours,
  };

  return (
    <TimeTrackingContext.Provider value={contextValue}>
      {children}
    </TimeTrackingContext.Provider>
  );
};

export const useTimeTracking = (): TimeTrackingContextType => {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
};

export default TimeTrackingProvider;
