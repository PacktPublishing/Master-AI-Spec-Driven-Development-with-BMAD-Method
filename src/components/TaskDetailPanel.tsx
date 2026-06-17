import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, DollarSign, Calendar, User, AlertCircle, Tag } from 'lucide-react';
import { Task, Priority } from '@/types';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatTimeCompact } from '@/hooks/useTimer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ task, onClose }) => {
  const { state, dispatch, getClient, getTaskRate } = useApp();
  const { t } = useLanguage();
  const [localTask, setLocalTask] = useState<Task | null>(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    setLocalTask(task);
    setTagInput('');
  }, [task]);

  if (!localTask) return null;

  const handleUpdate = (updates: Partial<Task>) => {
    setLocalTask(prev => prev ? { ...prev, ...updates } : null);
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id: localTask.id, updates },
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,$/, '');
      if (tag && localTask && !localTask.tags.includes(tag)) {
        handleUpdate({ tags: [...localTask.tags, tag] });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (!localTask) return;
    handleUpdate({ tags: localTask.tags.filter(t => t !== tag) });
  };

  const client = getClient(localTask.clientId);
  const rate = getTaskRate(localTask);
  const revenue = localTask.isBillable ? (rate * localTask.timeSpent / 3600) : 0;

  return (
    <AnimatePresence>
      {task && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="font-semibold">{t.taskDetails}</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-6">
              {/* Title */}
              <div>
                <Label className="text-xs text-muted-foreground">{t.title}</Label>
                <Input
                  value={localTask.title}
                  onChange={(e) => handleUpdate({ title: e.target.value })}
                  className="mt-1 font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs text-muted-foreground">{t.description}</Label>
                <Textarea
                  value={localTask.description}
                  onChange={(e) => handleUpdate({ description: e.target.value })}
                  placeholder={t.addDescription}
                  className="mt-1 min-h-24 resize-none"
                />
              </div>

              {/* Client */}
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {t.client}
                </Label>
                <Select
                  value={localTask.clientId || 'none'}
                  onValueChange={(value) => handleUpdate({ clientId: value === 'none' ? null : value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t.selectClient} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.noClient}</SelectItem>
                    {state.clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          {c.name} (${c.hourlyRate}/hr)
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {t.priority}
                </Label>
                <Select
                  value={localTask.priority}
                  onValueChange={(value) => handleUpdate({ priority: value as Priority })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-priority-high" />
                        {t.high}
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-priority-medium" />
                        {t.medium}
                      </span>
                    </SelectItem>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-priority-low" />
                        {t.low}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {t.dueDate}
                </Label>
                <Input
                  type="date"
                  value={localTask.dueDate ? new Date(localTask.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleUpdate({
                    dueDate: e.target.value ? new Date(e.target.value).getTime() : null
                  })}
                  className="mt-1"
                />
              </div>

              {/* Tags */}
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {t.tags}
                </Label>
                {localTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                    {localTask.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={t.addTag}
                  className="mt-1 h-8 text-sm"
                />
              </div>

              {/* Billable & Rate */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-revenue" />
                    {t.billable}
                  </Label>
                  <Switch
                    checked={localTask.isBillable}
                    onCheckedChange={(checked) => handleUpdate({ isBillable: checked })}
                  />
                </div>

                {localTask.isBillable && (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        {t.hourlyRate}
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={localTask.hourlyRate || ''}
                          onChange={(e) => handleUpdate({
                            hourlyRate: e.target.value ? parseFloat(e.target.value) : null
                          })}
                          placeholder={client ? `${client.hourlyRate} (${t.clientRate})` : t.hourlyRate}
                          className="flex-1"
                        />
                        <span className="text-muted-foreground">/hr</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.hourlyRate}:</span>
                        <span className="font-medium">${rate}/hr</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">{t.revenue}:</span>
                        <span className="font-semibold text-revenue">${revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Time Tracking */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <Label>{t.timeTracking}</Label>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">{t.timeEstimate}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={localTask.timeEstimate ? Math.floor(localTask.timeEstimate / 3600) : ''}
                      onChange={(e) => {
                        const hours = parseFloat(e.target.value) || 0;
                        handleUpdate({ timeEstimate: hours * 3600 });
                      }}
                      placeholder="0"
                      className="w-20"
                    />
                    <span className="text-muted-foreground text-sm">{t.hours}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.totalTime}:</span>
                    <span className="font-medium font-mono">{formatTimeCompact(localTask.timeSpent)}</span>
                  </div>
                  {localTask.timeEstimate && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{Math.round((localTask.timeSpent / localTask.timeEstimate) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            localTask.timeSpent > localTask.timeEstimate
                              ? 'bg-priority-high'
                              : 'bg-revenue'
                          )}
                          style={{
                            width: `${Math.min((localTask.timeSpent / localTask.timeEstimate) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  dispatch({ type: 'DELETE_TASK', payload: localTask.id });
                  onClose();
                }}
              >
                {t.delete}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailPanel;
