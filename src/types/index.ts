export type Priority = 'high' | 'medium' | 'low';

export interface Client {
  id: string;
  name: string;
  hourlyRate: number;
  color: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: number;
  endTime: number | null;
  duration: number; // in seconds
}

export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: string;
  clientId: string | null;
  priority: Priority;
  isBillable: boolean;
  hourlyRate: number | null; // Override client rate
  timeEstimate: number | null; // in seconds
  timeSpent: number; // in seconds, calculated from entries
  createdAt: number;
  dueDate: number | null;
  tags: string[];
  order: number;
}

export interface Column {
  id: string;
  title: string;
  order: number;
}

export interface ActiveTimer {
  taskId: string;
  startTime: number;
}

export interface AppState {
  tasks: Task[];
  columns: Column[];
  clients: Client[];
  timeEntries: TimeEntry[];
  activeTimer: ActiveTimer | null;
  isDarkMode: boolean;
}
