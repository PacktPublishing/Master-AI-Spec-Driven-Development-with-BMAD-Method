import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, Trash2, Edit2, Check, X } from 'lucide-react';
import { Column, Task } from '@/types';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import TaskCard from './TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onAddTask,
  onTaskClick,
}) => {
  const { dispatch, state } = useApp();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      dispatch({ type: 'UPDATE_COLUMN', payload: { id: column.id, title: editTitle.trim() } });
    }
    setIsEditing(false);
  };

  const handleDeleteColumn = () => {
    if (state.columns.length > 1) {
      dispatch({ type: 'DELETE_COLUMN', payload: column.id });
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col w-80 min-w-80 bg-column-bg rounded-xl h-full',
        isOver && 'ring-2 ring-primary/50'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        {isEditing ? (
          <div className="flex items-center gap-1 flex-1">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-7 text-sm font-semibold"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveTitle}>
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-column-header">{column.title}</h3>
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {tasks.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onAddTask}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    {t.rename}
                  </DropdownMenuItem>
                  {state.columns.length > 1 && (
                    <DropdownMenuItem onClick={handleDeleteColumn} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t.delete}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 column-scroll">
        <SortableContext items={sortedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {sortedTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">{t.noTasksYet}</p>
            <Button variant="outline" size="sm" onClick={onAddTask}>
              <Plus className="h-4 w-4 mr-1" />
              {t.addTask}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
