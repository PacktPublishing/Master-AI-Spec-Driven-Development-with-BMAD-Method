import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';

export const useTimer = () => {
  const { state, dispatch } = useApp();
  const [elapsed, setElapsed] = useState(0);

  // Calculate elapsed time for active timer
  useEffect(() => {
    if (!state.activeTimer) {
      setElapsed(0);
      return;
    }

    const updateElapsed = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - state.activeTimer!.startTime) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [state.activeTimer]);

  const startTimer = useCallback((taskId: string) => {
    dispatch({ type: 'START_TIMER', payload: taskId });
  }, [dispatch]);

  const stopTimer = useCallback(() => {
    dispatch({ type: 'STOP_TIMER' });
  }, [dispatch]);

  const toggleTimer = useCallback((taskId: string) => {
    if (state.activeTimer?.taskId === taskId) {
      stopTimer();
    } else {
      startTimer(taskId);
    }
  }, [state.activeTimer, startTimer, stopTimer]);

  const isTimerRunning = useCallback((taskId: string): boolean => {
    return state.activeTimer?.taskId === taskId;
  }, [state.activeTimer]);

  const getElapsedForTask = useCallback((taskId: string): number => {
    if (state.activeTimer?.taskId !== taskId) return 0;
    return elapsed;
  }, [state.activeTimer, elapsed]);

  return {
    activeTaskId: state.activeTimer?.taskId || null,
    elapsed,
    startTimer,
    stopTimer,
    toggleTimer,
    isTimerRunning,
    getElapsedForTask,
  };
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${secs}s`;
};

export const formatTimeCompact = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
