import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'pt';

interface Translations {
  // Header
  totalRevenue: string;
  billableHours: string;
  
  // Kanban
  addColumn: string;
  addTask: string;
  noTasksYet: string;
  columnTitle: string;
  rename: string;
  delete: string;
  
  // Task Card
  start: string;
  today: string;
  tomorrow: string;
  overdue: string;
  nonBillable: string;
  
  // Task Detail Panel
  taskDetails: string;
  title: string;
  description: string;
  addDescription: string;
  client: string;
  selectClient: string;
  noClient: string;
  priority: string;
  low: string;
  medium: string;
  high: string;
  dueDate: string;
  pickDate: string;
  billable: string;
  hourlyRate: string;
  clientRate: string;
  timeEstimate: string;
  hours: string;
  minutes: string;
  timeTracking: string;
  totalTime: string;
  revenue: string;
  addManualTime: string;
  add: string;
  cancel: string;
  
  // Add Task Dialog
  createNewTask: string;
  addNewTask: string;
  taskTitle: string;
  enterTaskTitle: string;
  taskDescription: string;
  optional: string;
  createTask: string;
  
  // Tags
  tags: string;
  addTag: string;

  // Settings
  language: string;
  english: string;
  portuguese: string;
}

const translations: Record<Language, Translations> = {
  en: {
    totalRevenue: 'Total Revenue',
    billableHours: 'Billable Hours',
    addColumn: 'Add column',
    addTask: 'Add task',
    noTasksYet: 'No tasks yet',
    columnTitle: 'Column title...',
    rename: 'Rename',
    delete: 'Delete',
    start: 'Start',
    today: 'Today',
    tomorrow: 'Tomorrow',
    overdue: 'Overdue',
    nonBillable: 'Non-billable',
    taskDetails: 'Task Details',
    title: 'Title',
    description: 'Description',
    addDescription: 'Add a description...',
    client: 'Client',
    selectClient: 'Select client',
    noClient: 'No client',
    priority: 'Priority',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    dueDate: 'Due Date',
    pickDate: 'Pick a date',
    billable: 'Billable',
    hourlyRate: 'Hourly Rate',
    clientRate: 'Client rate',
    timeEstimate: 'Time Estimate',
    hours: 'Hours',
    minutes: 'Minutes',
    timeTracking: 'Time Tracking',
    totalTime: 'Total Time',
    revenue: 'Revenue',
    addManualTime: 'Add Manual Time',
    add: 'Add',
    cancel: 'Cancel',
    createNewTask: 'Create New Task',
    addNewTask: 'Add a new task to your board',
    taskTitle: 'Task Title',
    enterTaskTitle: 'Enter task title...',
    taskDescription: 'Task Description',
    optional: 'Optional',
    createTask: 'Create Task',
    tags: 'Tags',
    addTag: 'Add tag...',
    language: 'Language',
    english: 'English',
    portuguese: 'Portuguese',
  },
  pt: {
    totalRevenue: 'Receita Total',
    billableHours: 'Horas Faturáveis',
    addColumn: 'Adicionar coluna',
    addTask: 'Adicionar tarefa',
    noTasksYet: 'Nenhuma tarefa ainda',
    columnTitle: 'Título da coluna...',
    rename: 'Renomear',
    delete: 'Excluir',
    start: 'Iniciar',
    today: 'Hoje',
    tomorrow: 'Amanhã',
    overdue: 'Atrasado',
    nonBillable: 'Não faturável',
    taskDetails: 'Detalhes da Tarefa',
    title: 'Título',
    description: 'Descrição',
    addDescription: 'Adicionar uma descrição...',
    client: 'Cliente',
    selectClient: 'Selecionar cliente',
    noClient: 'Sem cliente',
    priority: 'Prioridade',
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    dueDate: 'Data de Vencimento',
    pickDate: 'Escolher uma data',
    billable: 'Faturável',
    hourlyRate: 'Taxa Horária',
    clientRate: 'Taxa do cliente',
    timeEstimate: 'Estimativa de Tempo',
    hours: 'Horas',
    minutes: 'Minutos',
    timeTracking: 'Controle de Tempo',
    totalTime: 'Tempo Total',
    revenue: 'Receita',
    addManualTime: 'Adicionar Tempo Manual',
    add: 'Adicionar',
    cancel: 'Cancelar',
    createNewTask: 'Criar Nova Tarefa',
    addNewTask: 'Adicione uma nova tarefa ao seu quadro',
    taskTitle: 'Título da Tarefa',
    enterTaskTitle: 'Digite o título da tarefa...',
    taskDescription: 'Descrição da Tarefa',
    optional: 'Opcional',
    createTask: 'Criar Tarefa',
    tags: 'Tags',
    addTag: 'Adicionar tag...',
    language: 'Idioma',
    english: 'Inglês',
    portuguese: 'Português',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
