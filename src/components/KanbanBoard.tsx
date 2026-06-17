import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { Task } from '@/types';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface KanbanBoardProps {
  onAddTask: (columnId: string) => void;
  onTaskClick: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ onAddTask, onTaskClick }) => {
  const { state, dispatch } = useApp();
  const { t } = useLanguage();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedColumns = [...state.columns].sort((a, b) => a.order - b.order);

  const getTasksByColumn = (columnId: string) => {
    return state.tasks.filter(task => task.columnId === columnId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = state.tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = state.tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Check if we're over a column
    const overColumn = state.columns.find(c => c.id === overId);
    if (overColumn && activeTask.columnId !== overId) {
      const tasksInColumn = getTasksByColumn(overId);
      dispatch({
        type: 'MOVE_TASK',
        payload: {
          taskId: activeId,
          newColumnId: overId,
          newOrder: tasksInColumn.length,
        },
      });
      return;
    }

    // Check if we're over another task
    const overTask = state.tasks.find(t => t.id === overId);
    if (overTask && activeTask.id !== overTask.id) {
      if (activeTask.columnId !== overTask.columnId) {
        dispatch({
          type: 'MOVE_TASK',
          payload: {
            taskId: activeId,
            newColumnId: overTask.columnId,
            newOrder: overTask.order,
          },
        });
      } else {
        // Reorder within column
        const columnTasks = getTasksByColumn(activeTask.columnId)
          .sort((a, b) => a.order - b.order);
        const activeIndex = columnTasks.findIndex(t => t.id === activeId);
        const overIndex = columnTasks.findIndex(t => t.id === overId);
        
        const newOrder = [...columnTasks];
        const [removed] = newOrder.splice(activeIndex, 1);
        newOrder.splice(overIndex, 0, removed);

        dispatch({
          type: 'REORDER_TASKS',
          payload: {
            columnId: activeTask.columnId,
            taskIds: newOrder.map(t => t.id),
          },
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      dispatch({ type: 'ADD_COLUMN', payload: newColumnTitle.trim() });
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full p-4 overflow-x-auto">
        {sortedColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksByColumn(column.id)}
            onAddTask={() => onAddTask(column.id)}
            onTaskClick={onTaskClick}
          />
        ))}

        {/* Add Column */}
        <div className="w-80 min-w-80">
          {isAddingColumn ? (
            <div className="bg-column-bg rounded-xl p-3 space-y-2">
              <Input
                placeholder={t.columnTitle}
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddColumn();
                  if (e.key === 'Escape') setIsAddingColumn(false);
                }}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddColumn}>
                  {t.add}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAddingColumn(false)}>
                  {t.cancel}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => setIsAddingColumn(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.addColumn}
            </Button>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="w-80 opacity-90 rotate-3">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
