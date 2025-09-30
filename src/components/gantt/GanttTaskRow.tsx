import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { GanttTask } from '@/types/gantt';
import { getTaskLevelStyles, formatDuration } from '@/utils/ganttUtils';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PredecessorManager } from './PredecessorManager';

interface GanttTaskRowProps {
  task: GanttTask;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpanded: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  onPredecessorUpdate?: (taskId: string, predecessors: any[]) => void;
  allTasks?: GanttTask[];
  style: React.CSSProperties;
}

export const GanttTaskRow: React.FC<GanttTaskRowProps> = ({
  task,
  hasChildren,
  isExpanded,
  onToggleExpanded,
  onTaskUpdate,
  onPredecessorUpdate,
  allTasks = [],
  style
}) => {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(task.name);
  
  const levelStyles = getTaskLevelStyles(task.level);
  const indentWidth = task.level * 16;

  const handleNameSubmit = () => {
    if (nameInput.trim() && nameInput !== task.name) {
      onTaskUpdate?.(task.id, { name: nameInput.trim() });
    }
    setEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setNameInput(task.name);
      setEditingName(false);
    }
  };

  const getStatusVariant = (status: GanttTask['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'delayed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: GanttTask['status']) => {
    switch (status) {
      case 'not-started': return 'Not Started';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'delayed': return 'Delayed';
      default: return status;
    }
  };

  return (
    <div
      className={cn(
        "grid items-center border-b border-gray-100 hover:bg-gray-50 transition-colors",
        levelStyles.background,
        levelStyles.border
      )}
      style={{
        height: '28px',
        gridTemplateColumns: '20px 60px 1fr 90px 90px 60px 100px 120px',
        maxHeight: '28px',
        minHeight: '28px'
      }}
    >
      {/* Expand/Collapse Button */}
      <div className="px-2 py-0 flex items-center justify-center h-full">
        {hasChildren ? (
          <button
            onClick={() => onToggleExpanded(task.id)}
            className="p-0.5 rounded hover:bg-gray-200 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-600" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-600" />
            )}
          </button>
        ) : (
          <div className="w-3 h-3" />
        )}
      </div>

      {/* WBS ID */}
      <div className="px-2 py-0 flex items-center h-full">
        <span className={cn("text-xs", levelStyles.text)}>
          {task.wbs || `${task.level + 1}.${task.id.slice(-2)}`}
        </span>
      </div>

      {/* Task Name */}
      <div 
        className="px-3 py-0 min-w-0 flex items-center h-full"
        style={{ paddingLeft: `${12 + indentWidth}px` }}
      >
        {editingName ? (
          <Input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleNameKeyDown}
            className="text-xs h-5"
            autoFocus
          />
        ) : (
          <span
            className={cn("text-xs cursor-pointer hover:text-blue-600 truncate block", levelStyles.text)}
            onClick={() => setEditingName(true)}
          >
            {task.name}
          </span>
        )}
      </div>

      {/* Start Date */}
      <div className="px-2 py-0 text-xs text-gray-600 text-center flex items-center justify-center h-full">
        {task.startDate.toLocaleDateString()}
      </div>

      {/* End Date */}
      <div className="px-2 py-0 text-xs text-gray-600 text-center flex items-center justify-center h-full">
        {task.endDate.toLocaleDateString()}
      </div>

      {/* Duration */}
      <div className="px-2 py-0 text-xs text-gray-600 flex items-center h-full">
        {formatDuration(task.startDate, task.endDate)}
      </div>

      {/* Status */}
      <div className="px-2 py-0 flex items-center h-full">
        <Badge variant={getStatusVariant(task.status)} className="text-[10px] h-5 px-2">
          {getStatusLabel(task.status)}
        </Badge>
      </div>

      {/* Predecessors */}
      <div className="px-2 py-0 flex items-center h-full">
        <PredecessorManager
          task={task}
          allTasks={allTasks}
          onUpdatePredecessors={onPredecessorUpdate || (() => {})}
        />
      </div>
    </div>
  );
};