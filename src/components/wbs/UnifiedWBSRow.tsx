import React from 'react';
import { ChevronRight, ChevronDown, GripVertical, Plus, MoreHorizontal, Edit2, Copy, Trash2, NotebookPen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import { WBSItem } from '@/types/wbs';
import { DatePickerCell } from './DatePickerCell';
import { DurationCell } from './DurationCell';
import { PredecessorCell } from './PredecessorCell';
import { DependencyLockIndicator } from './DependencyLockIndicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface UnifiedWBSRowProps {
  item: WBSItem;
  isHovered?: boolean;
  onToggleExpanded: (itemId: string) => void;
  onItemUpdate: (itemId: string, updates: any) => Promise<void> | void;
  onAddChild?: (parentId: string) => void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
  onRowHover?: (id: string | null) => void;
  dragHandleProps?: any;
  EditableCell: any;
  StatusSelect: any;
  timelineDays: Date[];
  chartStart: Date;
  dayWidth?: number;
  availableItems?: WBSItem[]; // Add this for predecessor selection
}

export const UnifiedWBSRow = ({
  item,
  isHovered = false,
  onToggleExpanded,
  onItemUpdate,
  onAddChild,
  onContextMenuAction,
  onOpenNotesDialog,
  onRowHover,
  dragHandleProps,
  EditableCell,
  StatusSelect,
  timelineDays,
  chartStart,
  dayWidth = 32,
  availableItems = []
}: UnifiedWBSRowProps) => {
  const rowHeight = 28; // 1.75rem in pixels
  
  // Calculate timeline position for gantt bars
  const getTaskPosition = () => {
    if (!item.start_date && !item.end_date) return null;

    const taskStart = item.start_date 
      ? (typeof item.start_date === 'string' ? parseISO(item.start_date) : item.start_date)
      : chartStart;
    
    const taskEnd = item.end_date 
      ? (typeof item.end_date === 'string' ? parseISO(item.end_date) : item.end_date)
      : (item.start_date && item.duration ? addDays(taskStart, item.duration) : chartStart);

    const startOffset = differenceInDays(taskStart, chartStart);
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    return {
      left: Math.max(0, startOffset * dayWidth),
      width: Math.max(dayWidth, duration * dayWidth),
      startDate: taskStart,
      endDate: taskEnd
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/80';
      case 'In Progress': return 'bg-gray-500/80';
      case 'On Hold': return 'bg-amber-500/80';
      case 'Not Started': return 'bg-slate-300/80';
      default: return 'bg-slate-300/80';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return 'border-gray-400 bg-white/95 shadow-md';
      case 1:
        return 'border-gray-300 bg-white/90 shadow-sm';
      case 2:
        return 'border-gray-200 bg-white/85 shadow-sm';
      default:
        return 'border-gray-200 bg-white/80 shadow-sm';
    }
  };

  const position = getTaskPosition();
  const chartWidth = timelineDays.length * dayWidth;

  return (
    <div 
      className={`flex border-b border-gray-100 transition-all duration-200 ${
        item.level === 0 
          ? 'bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 border-l-[6px] border-l-blue-800 shadow-sm hover:from-blue-50 hover:to-blue-100' 
          : item.level === 1
          ? 'bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-l-[4px] border-l-blue-400 hover:from-blue-100 hover:to-blue-200'
          : 'bg-white border-l-2 border-l-slate-300 hover:bg-slate-50/50'
      } ${isHovered ? 'bg-gradient-to-r from-gray-200/80 via-gray-100/60 to-gray-200/80 shadow-lg ring-2 ring-gray-300/50' : ''}`}
      style={{ height: rowHeight }}
      onMouseEnter={() => onRowHover?.(item.id)}
      onMouseLeave={() => onRowHover?.(null)}
    >
      {/* Left Section - WBS Data */}
      <div className="flex-shrink-0 flex" style={{ width: '420px' }}>
        {/* Expand/Collapse & Drag Handle */}
        <div className="px-2 flex items-center justify-center" style={{ width: '32px' }}>
          <div className="flex items-center">
            <div
              {...dragHandleProps}
              className={`cursor-grab active:cursor-grabbing p-1 rounded transition-colors duration-200 mr-1 ${
                item.level === 1 ? 'ml-4' : item.level === 2 ? 'ml-8' : ''
              } hover:bg-accent/20`}
              title="Drag to reorder"
            >
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </div>
            {item.children && item.children.length > 0 && (
              <button
                onClick={() => onToggleExpanded(item.id)}
                className="p-1 hover:bg-accent/20 rounded"
              >
                {item.is_expanded ? (
                  <ChevronDown className={`w-3 h-3 ${
                    item.level === 0 ? 'text-gray-700' : 'text-gray-600'
                  }`} />
                ) : (
                  <ChevronRight className={`w-3 h-3 ${
                    item.level === 0 ? 'text-gray-700' : 'text-gray-600'
                  }`} />
                )}
              </button>
            )}
          </div>
        </div>

        {/* WBS Number */}
        <div className={`px-2 flex items-center ${
          item.level === 1 ? 'ml-4' : item.level === 2 ? 'ml-12' : ''
        } ${
          item.level === 0 
            ? 'font-black text-gray-800 text-sm tracking-wide' 
            : item.level === 1
            ? 'font-bold text-gray-700 text-sm'
            : 'font-medium text-gray-600 text-xs'
        }`} style={{ width: '120px' }}>
          {item.wbs_id || ''}
        </div>

        {/* Name */}
        <div className={`px-3 flex items-center flex-1 ${
          item.level === 1 ? 'ml-4' : item.level === 2 ? 'ml-12' : ''
        } ${
          item.level === 0 
            ? 'font-black text-gray-800 text-base tracking-wide' 
            : item.level === 1
            ? 'font-bold text-gray-700 text-sm'
            : 'font-medium text-foreground text-xs'
        }`}>
          <EditableCell
            id={item.id}
            type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
            field="title"
            value={item.title}
            placeholder={item.level === 2 ? "Untitled Element" : "Untitled"}
            className={item.level === 0 ? "font-black text-base text-gray-800 tracking-wide" : item.level === 1 ? "font-bold text-sm text-gray-700" : "font-medium text-xs text-muted-foreground"}
          />
        </div>

        {/* Add Child Button */}
        <div className="px-2 flex items-center" style={{ width: '40px' }}>
          {item.level < 2 && onAddChild && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddChild(item.id);
              }}
              className="h-6 w-6 p-0 hover:bg-primary/10"
              title={item.level === 0 ? "Add Component" : "Add Element"}
            >
              <Plus className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Middle Section - Detail Data */}
      <div className="flex-shrink-0 flex" style={{ minWidth: '920px' }}>
        {/* Description */}
        <div className="px-3 flex items-center text-muted-foreground text-xs" style={{ minWidth: '200px', flex: 1 }}>
          <EditableCell
            id={item.id}
            type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
            field="description"
            value={item.description || ''}
            placeholder="Add description..."
            className="text-xs text-muted-foreground"
          />
        </div>

        {/* Start Date */}
        <div className="px-2 flex items-center text-xs text-muted-foreground" style={{ width: '120px' }}>
          <div className="flex items-center w-full">
            <DatePickerCell
              id={item.id}
              type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
              field="start_date"
              value={item.start_date}
              placeholder="Start date"
              className="text-xs text-muted-foreground"
              onUpdate={(id, field, value) => onItemUpdate(id, { [field]: value })}
              currentItem={item}
            />
            <DependencyLockIndicator item={item} field="start_date" />
          </div>
        </div>

        {/* End Date */}
        <div className="px-2 flex items-center text-xs text-muted-foreground" style={{ width: '120px' }}>
          <div className="flex items-center w-full">
            <DatePickerCell
              id={item.id}
              type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
              field="end_date"
              value={item.end_date}
              placeholder="End date"
              className="text-xs text-muted-foreground"
              onUpdate={(id, field, value) => onItemUpdate(id, { [field]: value })}
              currentItem={item}
            />
            <DependencyLockIndicator item={item} field="end_date" />
          </div>
        </div>

        {/* Duration */}
        <div className="px-2 flex items-center text-xs text-muted-foreground" style={{ width: '100px' }}>
          <DurationCell
            id={item.id}
            type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
            value={item.duration || 0}
            className="text-xs text-muted-foreground"
            onUpdate={(id, field, value) => onItemUpdate(id, { [field]: value })}
          />
        </div>

        {/* Predecessors */}
        <div className="px-2 flex items-center text-xs text-muted-foreground" style={{ width: '140px' }}>
          <PredecessorCell
            id={item.id}
            type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
            value={item.predecessors || []}
            availableItems={availableItems.map(avItem => ({
              id: avItem.id,
              name: avItem.title,
              wbsNumber: avItem.wbs_id || '',
              level: avItem.level
            }))}
            className="text-xs text-muted-foreground"
            onUpdate={(id, field, value) => onItemUpdate(id, { [field]: value })}
          />
        </div>

        {/* Status */}
        <div className="px-2 flex items-center text-xs text-muted-foreground" style={{ width: '140px' }}>
          <StatusSelect
            id={item.id}
            type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
            value={item.status || 'Not Started'}
            onUpdate={(id: string, field: string, value: string) => onItemUpdate(id, { [field]: value })}
          />
        </div>

        {/* Actions */}
        <div className="px-2 flex items-center" style={{ width: '120px' }}>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-accent/20"
              onClick={() => onOpenNotesDialog(item)}
              title="Add notes"
            >
              <NotebookPen className="w-3 h-3" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent/20">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onContextMenuAction('edit', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element')}>
                  <Edit2 className="w-3 h-3 mr-2" />
                  Edit Properties
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onContextMenuAction('duplicate', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element')}>
                  <Copy className="w-3 h-3 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onContextMenuAction('delete', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element')}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Right Section - Timeline */}
      <div className="flex-1 relative border-l border-gray-200" style={{ minWidth: chartWidth }}>
        {/* Grid lines */}
        {timelineDays.map((day, dayIndex) => {
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          return (
            <div
              key={day.toISOString()}
              className={`absolute top-0 bottom-0 border-r transition-all duration-200 z-0 ${
                isWeekend ? 'border-gray-200 bg-gray-50/30' : 'border-gray-100'
              }`}
              style={{ 
                left: dayIndex * dayWidth,
                width: dayWidth
              }}
            />
          );
        })}

        {/* Task bar based on level */}
        {position && (
          <>
            {/* Rectangular bar for Phases (level 0) */}
            {item.level === 0 && (
              <div
                className="absolute cursor-pointer group z-20"
                style={{
                  left: position.left + 8,
                  top: rowHeight / 2 - 8,
                  width: Math.max(40, position.width - 16),
                  height: 16
                }}
                title={`${item.wbs_id} - ${item.title}\n${format(position.startDate, 'MMM dd')} to ${format(position.endDate, 'MMM dd')}`}
              >
                <div className="relative h-full w-full bg-gray-800 rounded-sm border border-gray-700 shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10 rounded-sm" />
                  {position.width > 60 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold truncate px-1">
                        {item.wbs_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Summary line for Components (level 1) */}
            {item.level === 1 && (
              <div
                className="absolute cursor-pointer group z-20"
                style={{
                  left: position.left + 8,
                  top: rowHeight / 2 - 1,
                  width: Math.max(40, position.width - 16),
                  height: 2
                }}
                title={`${item.wbs_id} - ${item.title}\n${format(position.startDate, 'MMM dd')} to ${format(position.endDate, 'MMM dd')}`}
              >
                <div className="relative h-full">
                  <div className="h-full bg-gray-600 rounded-full" />
                  <div className="absolute left-0 top-1/2 w-2 h-2 transform -translate-y-1/2 -translate-x-1/2 rounded-full bg-gray-600 border-white border" />
                  <div className="absolute right-0 top-1/2 w-2 h-2 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-gray-600 border-white border" />
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                                 bg-white px-2 py-0.5 rounded text-xs font-medium text-gray-700 
                                 border border-gray-300 shadow-sm whitespace-nowrap">
                    {item.title}
                  </div>
                </div>
              </div>
            )}

            {/* Regular task bar for Elements (level 2) */}
            {item.level === 2 && (
              <div
                className="absolute cursor-pointer group z-20"
                style={{
                  left: position.left + 4,
                  top: 2,
                  width: Math.max(32, position.width - 8),
                  height: rowHeight - 4
                }}
                title={`${item.wbs_id} - ${item.title}\n${format(position.startDate, 'MMM dd')} to ${format(position.endDate, 'MMM dd')}`}
              >
                <div className={`
                  h-full rounded-xl ${getLevelColor(item.level)} 
                  transition-all duration-300 ease-out
                  flex items-center
                  backdrop-blur-sm
                  hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg
                  relative overflow-hidden
                  border
                `}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                animate-pulse opacity-30" />
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(item.status || 'Not Started')} rounded-l-xl`} />
                  
                  {position.width > 60 && (
                    <div className="relative z-10 px-2 flex-1 flex items-center justify-between">
                      <span className={`text-xs font-medium text-gray-700 truncate`}>
                        {item.title}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};