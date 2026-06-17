import React from 'react';
import { Play, Square, DollarSign, Clock, Calendar, MoreHorizontal, Trash2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { useApp } from '@/context/AppContext';
import { useTimer, formatTime, formatTimeCompact } from '@/hooks/useTimer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { getClient, getTaskRate, getTaskRevenue, dispatch } = useApp();
  const { toggleTimer, isTimerRunning, getElapsedForTask } = useTimer();
  const { t } = useLanguage();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const client = getClient(task.clientId);
  const rate = getTaskRate(task);
  const isRunning = isTimerRunning(task.id);
  const elapsedFromTimer = getElapsedForTask(task.id);
  const totalTime = task.timeSpent + elapsedFromTimer;
  const revenue = getTaskRevenue(task);
  const currentRevenue = task.isBillable ? (rate * totalTime / 3600) : 0;

  const priorityColors = {
    high: 'bg-priority-high/10 text-priority-high border-priority-high/20',
    medium: 'bg-timer-muted text-timer border-timer/20',
    low: 'bg-muted text-muted-foreground border-border',
  };

  const handleTimerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTimer(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'DELETE_TASK', payload: task.id });
  };

  const formatDueDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return t.today;
    if (date.toDateString() === tomorrow.toDateString()) return t.tomorrow;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isDueSoon = task.dueDate && (task.dueDate - Date.now()) < 24 * 60 * 60 * 1000;
  const isOverdue = task.dueDate && task.dueDate < Date.now();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative bg-task-card rounded-lg border border-border p-3 cursor-grab active:cursor-grabbing',
        'hover:shadow-card-hover hover:border-border/80 transition-all duration-200',
        isDragging && 'opacity-50 shadow-xl rotate-2 scale-105',
        isRunning && 'ring-2 ring-timer shadow-timer-active'
      )}
      onClick={onClick}
    >
      {/* Timer indicator */}
      {isRunning && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-timer rounded-full animate-pulse-gentle" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm text-foreground leading-snug flex-1 line-clamp-2">
          {task.title}
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Client & Priority */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {client && (
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${client.color}15`,
              color: client.color,
            }}
          >
            {client.name}
          </span>
        )}
        <Badge variant="outline" className={cn('text-xs', priorityColors[task.priority])}>
          {task.priority}
        </Badge>
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mb-2">
          {task.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 2 && (
            <span className="text-[10px] text-muted-foreground">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Time & Revenue Section */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Timer button */}
          <button
            onClick={handleTimerClick}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all',
              isRunning
                ? 'bg-timer text-timer-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            )}
          >
            {isRunning ? (
              <>
                <Square className="h-3 w-3 fill-current" />
                <span className="font-mono">{formatTime(totalTime)}</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current" />
                <span className="font-mono">{totalTime > 0 ? formatTimeCompact(totalTime) : t.start}</span>
              </>
            )}
          </button>

          {/* Time estimate */}
          {task.timeEstimate && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeCompact(task.timeEstimate)}
            </span>
          )}
        </div>

        {/* Billable indicator & Revenue */}
        <div className="flex items-center gap-2">
          {task.isBillable ? (
            <span className="billable-badge">
              <DollarSign className="h-3 w-3" />
              ${currentRevenue.toFixed(0)}
            </span>
          ) : (
            <span className="non-billable-badge text-[10px]">
              {t.nonBillable}
            </span>
          )}
        </div>
      </div>

      {/* Due date */}
      {task.dueDate && (
        <div className={cn(
          'mt-2 pt-2 border-t border-border flex items-center gap-1 text-xs',
          isOverdue ? 'text-destructive' : isDueSoon ? 'text-timer' : 'text-muted-foreground'
        )}>
          <Calendar className="h-3 w-3" />
          {isOverdue ? t.overdue : formatDueDate(task.dueDate)}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
