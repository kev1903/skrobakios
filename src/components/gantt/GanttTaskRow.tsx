import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { GanttTask } from '@/types/gantt';
import { getTaskLevelStyles, formatDuration } from '@/utils/ganttUtils';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface GanttTaskRowProps {
  task: GanttTask;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpanded: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  style: React.CSSProperties;
}

export const GanttTaskRow: React.FC<GanttTaskRowProps> = ({
  task,
  hasChildren,
  isExpanded,
  onToggleExpanded,
  onTaskUpdate,
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
        ...style,
        gridTemplateColumns: '20px 60px 1fr 80px 80px 60px 100px'
      }}
    >
      {/* Expand/Collapse Button */}
      <div className="px-2 py-2">
        {hasChildren ? (
          <button
            onClick={() => onToggleExpanded(task.id)}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-600" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-600" />
            )}
          </button>
        ) : (
          <div className="w-5 h-5" />
        )}
      </div>

      {/* WBS ID */}
      <div className="px-2 py-2">
        <span className={cn("text-xs", levelStyles.text)}>
          {task.wbs || `${task.level + 1}.${task.id.slice(-2)}`}
        </span>
      </div>

      {/* Task Name */}
      <div 
        className="px-3 py-2 min-w-0"
        style={{ paddingLeft: `${12 + indentWidth}px` }}
      >
        {editingName ? (
          <Input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleNameKeyDown}
            className="text-xs h-6"
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
      <div className="px-2 py-2 text-xs text-gray-600">
        {task.startDate.toLocaleDateString()}
      </div>

      {/* End Date */}
      <div className="px-2 py-2 text-xs text-gray-600">
        {task.endDate.toLocaleDateString()}
      </div>

      {/* Duration */}
      <div className="px-2 py-2 text-xs text-gray-600">
        {formatDuration(task.startDate, task.endDate)}
      </div>

      {/* Status */}
      <div className="px-2 py-2">
        <Badge variant={getStatusVariant(task.status)} className="text-xs">
          {getStatusLabel(task.status)}
        </Badge>
      </div>
    </div>
  );
};