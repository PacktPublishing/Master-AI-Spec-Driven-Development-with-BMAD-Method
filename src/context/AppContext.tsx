import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, Task, Column, Client, TimeEntry, ActiveTimer, Priority } from '@/types';
import { loadState, saveState } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'order'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { taskId: string; newColumnId: string; newOrder: number } }
  | { type: 'REORDER_TASKS'; payload: { columnId: string; taskIds: string[] } }
  | { type: 'ADD_COLUMN'; payload: string }
  | { type: 'UPDATE_COLUMN'; payload: { id: string; title: string } }
  | { type: 'DELETE_COLUMN'; payload: string }
  | { type: 'REORDER_COLUMNS'; payload: string[] }
  | { type: 'ADD_CLIENT'; payload: Omit<Client, 'id'> }
  | { type: 'UPDATE_CLIENT'; payload: { id: string; updates: Partial<Client> } }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'START_TIMER'; payload: string }
  | { type: 'STOP_TIMER' }
  | { type: 'UPDATE_TASK_TIME'; payload: { taskId: string; additionalTime: number } }
  | { type: 'TOGGLE_DARK_MODE' };

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'ADD_TASK': {
      const columnTasks = state.tasks.filter(t => t.columnId === action.payload.columnId);
      const newTask: Task = {
        ...action.payload,
        id: uuidv4(),
        createdAt: Date.now(),
        order: columnTasks.length,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        activeTimer: state.activeTimer?.taskId === action.payload ? null : state.activeTimer,
      };

    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, columnId: action.payload.newColumnId, order: action.payload.newOrder }
            : task
        ),
      };

    case 'REORDER_TASKS':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.columnId !== action.payload.columnId) return task;
          const newOrder = action.payload.taskIds.indexOf(task.id);
          return newOrder !== -1 ? { ...task, order: newOrder } : task;
        }),
      };

    case 'ADD_COLUMN': {
      const newColumn: Column = {
        id: uuidv4(),
        title: action.payload,
        order: state.columns.length,
      };
      return { ...state, columns: [...state.columns, newColumn] };
    }

    case 'UPDATE_COLUMN':
      return {
        ...state,
        columns: state.columns.map(col =>
          col.id === action.payload.id
            ? { ...col, title: action.payload.title }
            : col
        ),
      };

    case 'DELETE_COLUMN': {
      // Move tasks to first column
      const firstColumnId = state.columns.find(c => c.id !== action.payload)?.id;
      return {
        ...state,
        columns: state.columns
          .filter(col => col.id !== action.payload)
          .map((col, i) => ({ ...col, order: i })),
        tasks: state.tasks.map(task =>
          task.columnId === action.payload && firstColumnId
            ? { ...task, columnId: firstColumnId }
            : task
        ),
      };
    }

    case 'REORDER_COLUMNS':
      return {
        ...state,
        columns: state.columns.map(col => ({
          ...col,
          order: action.payload.indexOf(col.id),
        })),
      };

    case 'ADD_CLIENT': {
      const newClient: Client = {
        ...action.payload,
        id: uuidv4(),
      };
      return { ...state, clients: [...state.clients, newClient] };
    }

    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id
            ? { ...client, ...action.payload.updates }
            : client
        ),
      };

    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload),
        tasks: state.tasks.map(task =>
          task.clientId === action.payload
            ? { ...task, clientId: null }
            : task
        ),
      };

    case 'START_TIMER': {
      // Stop any existing timer first
      let updatedTasks = state.tasks;
      if (state.activeTimer) {
        const elapsed = Math.floor((Date.now() - state.activeTimer.startTime) / 1000);
        updatedTasks = updatedTasks.map(task =>
          task.id === state.activeTimer?.taskId
            ? { ...task, timeSpent: task.timeSpent + elapsed }
            : task
        );
      }
      return {
        ...state,
        tasks: updatedTasks,
        activeTimer: { taskId: action.payload, startTime: Date.now() },
      };
    }

    case 'STOP_TIMER': {
      if (!state.activeTimer) return state;
      const elapsed = Math.floor((Date.now() - state.activeTimer.startTime) / 1000);
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === state.activeTimer?.taskId
            ? { ...task, timeSpent: task.timeSpent + elapsed }
            : task
        ),
        activeTimer: null,
      };
    }

    case 'UPDATE_TASK_TIME':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, timeSpent: task.timeSpent + action.payload.additionalTime }
            : task
        ),
      };

    case 'TOGGLE_DARK_MODE':
      return { ...state, isDarkMode: !state.isDarkMode };

    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getClient: (id: string | null) => Client | undefined;
  getTaskRate: (task: Task) => number;
  getTaskRevenue: (task: Task) => number;
  getTotalRevenue: () => number;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  // Save state on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.isDarkMode);
  }, [state.isDarkMode]);

  const getClient = useCallback((id: string | null): Client | undefined => {
    if (!id) return undefined;
    return state.clients.find(c => c.id === id);
  }, [state.clients]);

  const getTaskRate = useCallback((task: Task): number => {
    if (task.hourlyRate) return task.hourlyRate;
    const client = getClient(task.clientId);
    return client?.hourlyRate || 0;
  }, [getClient]);

  const getTaskRevenue = useCallback((task: Task): number => {
    if (!task.isBillable) return 0;
    const rate = getTaskRate(task);
    const hours = task.timeSpent / 3600;
    return rate * hours;
  }, [getTaskRate]);

  const getTotalRevenue = useCallback((): number => {
    return state.tasks.reduce((sum, task) => sum + getTaskRevenue(task), 0);
  }, [state.tasks, getTaskRevenue]);

  return (
    <AppContext.Provider value={{ state, dispatch, getClient, getTaskRate, getTaskRevenue, getTotalRevenue }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
