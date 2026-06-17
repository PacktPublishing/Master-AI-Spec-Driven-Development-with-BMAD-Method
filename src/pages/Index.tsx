import React, { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import KanbanBoard from '@/components/KanbanBoard';
import Header from '@/components/Header';
import TaskDetailPanel from '@/components/TaskDetailPanel';
import AddTaskDialog from '@/components/AddTaskDialog';
import { Task } from '@/types';

const IndexContent: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [addTaskColumnId, setAddTaskColumnId] = useState<string | null>(null);

  const handleAddTask = (columnId?: string) => {
    setAddTaskColumnId(columnId || null);
    setIsAddTaskOpen(true);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header onAddTask={() => handleAddTask()} />
      
      <main className="flex-1 overflow-hidden">
        <KanbanBoard
          onAddTask={(columnId) => handleAddTask(columnId)}
          onTaskClick={setSelectedTask}
        />
      </main>

      <TaskDetailPanel
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        defaultColumnId={addTaskColumnId}
      />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <AppProvider>
      <IndexContent />
    </AppProvider>
  );
};

export default Index;
