import { AppState, Column, Client, Task, TimeEntry, ActiveTimer } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'freelancer-kanban-data';

const DEFAULT_COLUMNS: Column[] = [
  { id: uuidv4(), title: 'Backlog', order: 0 },
  { id: uuidv4(), title: 'In Progress', order: 1 },
  { id: uuidv4(), title: 'Review', order: 2 },
  { id: uuidv4(), title: 'Done', order: 3 },
];

const DEFAULT_CLIENTS: Client[] = [
  { id: uuidv4(), name: 'Acme Corp', hourlyRate: 85, color: '#10b981' },
  { id: uuidv4(), name: 'TechStart', hourlyRate: 95, color: '#6366f1' },
];

const getDefaultState = (): AppState => {
  const columns = DEFAULT_COLUMNS;
  const clients = DEFAULT_CLIENTS;
  
  // Sample tasks for demo
  const tasks: Task[] = [
    {
      id: uuidv4(),
      title: 'Design homepage wireframes',
      description: 'Create low-fidelity wireframes for the new homepage redesign',
      columnId: columns[0].id,
      clientId: clients[0].id,
      priority: 'high',
      isBillable: true,
      hourlyRate: null,
      timeEstimate: 3 * 3600, // 3 hours
      timeSpent: 0,
      createdAt: Date.now(),
      dueDate: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
      tags: ['design', 'ui'],
      order: 0,
    },
    {
      id: uuidv4(),
      title: 'Implement authentication',
      description: 'Add user login and registration with OAuth',
      columnId: columns[1].id,
      clientId: clients[1].id,
      priority: 'high',
      isBillable: true,
      hourlyRate: 110, // Higher rate for complex work
      timeEstimate: 8 * 3600,
      timeSpent: 2.5 * 3600,
      createdAt: Date.now() - 86400000,
      dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
      tags: ['development', 'backend'],
      order: 0,
    },
    {
      id: uuidv4(),
      title: 'Write API documentation',
      description: 'Document all REST endpoints for the mobile app team',
      columnId: columns[1].id,
      clientId: clients[1].id,
      priority: 'medium',
      isBillable: true,
      hourlyRate: null,
      timeEstimate: 4 * 3600,
      timeSpent: 1 * 3600,
      createdAt: Date.now() - 172800000,
      dueDate: null,
      tags: ['documentation'],
      order: 1,
    },
    {
      id: uuidv4(),
      title: 'Update portfolio site',
      description: 'Add recent projects and testimonials',
      columnId: columns[0].id,
      clientId: null,
      priority: 'low',
      isBillable: false,
      hourlyRate: null,
      timeEstimate: 2 * 3600,
      timeSpent: 0,
      createdAt: Date.now(),
      dueDate: null,
      tags: ['personal'],
      order: 1,
    },
    {
      id: uuidv4(),
      title: 'Code review for feature branch',
      description: 'Review pull request #42 for the payment integration',
      columnId: columns[2].id,
      clientId: clients[0].id,
      priority: 'medium',
      isBillable: true,
      hourlyRate: null,
      timeEstimate: 1 * 3600,
      timeSpent: 0.5 * 3600,
      createdAt: Date.now() - 43200000,
      dueDate: Date.now() + 1 * 24 * 60 * 60 * 1000,
      tags: ['review'],
      order: 0,
    },
  ];

  return {
    tasks,
    columns,
    clients,
    timeEntries: [],
    activeTimer: null,
    isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  };
};

export const loadState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure dark mode matches system preference on first load if not set
      return {
        ...getDefaultState(),
        ...parsed,
      };
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return getDefaultState();
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
};

export const clearState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
