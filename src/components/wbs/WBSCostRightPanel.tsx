import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit2, Copy, Trash2, NotebookPen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface WBSItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  assignedTo?: string;
  level: number;
  hasChildren?: boolean;
  start_date?: string | Date | null;
  end_date?: string | Date | null;
  duration?: number;
  predecessors?: string[];
  budgeted_cost?: string;
  committed_cost?: string;
  paid_cost?: string;
  forecast_cost?: string;
  cost_notes?: string;
}

interface WBSCostRightPanelProps {
  items: WBSItem[];
  onItemUpdate: (itemId: string, updates: any) => void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
  EditableCell: any;
  StatusSelect: any;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: () => void;
  hoveredId?: string | null;
  onRowHover?: (id: string | null) => void;
  selectedItems?: string[];
  onRowClick?: (itemId: string, ctrlKey?: boolean) => void;
}

export const WBSCostRightPanel = ({
  items,
  onItemUpdate,
  onContextMenuAction,
  onOpenNotesDialog,
  EditableCell,
  StatusSelect,
  scrollRef,
  onScroll,
  hoveredId,
  onRowHover,
  selectedItems = [],
  onRowClick
}: WBSCostRightPanelProps) => {
  
  // Helper function to calculate values
  const calculateRemaining = (budget: number, paid: number) => {
    return Math.max(0, budget - paid);
  };

  const calculateVariance = (budget: number, forecast: number) => {
    return forecast - budget;
  };

  const formatCurrency = (value: number | string | undefined) => {
    const num = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Determine if we're in unified scroll mode
  const useUnifiedScroll = true; // Enable unified scrolling for Cost tab

  const content = (
    <div style={{ minWidth: '720px' }}> {/* Reasonable minimum width for cost columns */}
      {items.map((item) => {
        const budget = parseFloat(item.budgeted_cost || '0') || 0;
        const committed = parseFloat(item.committed_cost || '0') || 0;
        const paid = parseFloat(item.paid_cost || '0') || 0;
        const forecast = parseFloat(item.forecast_cost || '0') || budget;
        const remaining = calculateRemaining(budget, paid);
        const variance = calculateVariance(budget, forecast);
        
        return (
          <div
            key={item.id}
             className={`grid items-center w-full border-b border-gray-100 cursor-pointer transition-all duration-200 ${
               selectedItems.includes(item.id) 
                 ? 'bg-primary/10 border-l-4 border-l-primary' 
                 : hoveredId === item.id 
                   ? 'bg-gradient-to-r from-gray-200/80 via-gray-100/60 to-gray-200/80 ring-2 ring-gray-300/50' 
                   : 'bg-white hover:bg-slate-50/50'
             }`}
            style={{
              gridTemplateColumns: '1fr 100px 100px 100px 100px 120px 100px 100px 200px',
              height: '28px',
            }}
            onMouseEnter={() => onRowHover?.(item.id)}
            onMouseLeave={() => onRowHover?.(null)}
            onClick={(e) => onRowClick?.(item.id, e.ctrlKey || e.metaKey)}
        >
            {/* Description */}
            <div className="px-3 flex items-center h-full text-xs overflow-hidden">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="description"
                value={item.description || ''}
                placeholder="Add description..."
                className="text-xs text-muted-foreground w-full truncate"
              />
            </div>

            {/* Budget */}
            <div className="px-2 flex items-center justify-end h-full text-xs">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="budgeted_cost"
                value={item.budgeted_cost || ''}
                placeholder="0"
                className="text-xs text-foreground text-right w-full font-medium"
              />
            </div>

            {/* Committed */}
            <div className="px-2 flex items-center justify-end h-full text-xs">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="committed_cost"
                value={item.committed_cost || ''}
                placeholder="0"
                className="text-xs text-amber-600 text-right w-full font-medium"
              />
            </div>

            {/* Paid */}
            <div className="px-2 flex items-center justify-end h-full text-xs">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="paid_cost"
                value={item.paid_cost || ''}
                placeholder="0"
                className="text-xs text-green-600 text-right w-full font-medium"
              />
            </div>

            {/* Remaining - Calculated */}
            <div className="px-2 flex items-center justify-end h-full text-xs text-blue-600 font-medium">
              {formatCurrency(remaining)}
            </div>

            {/* Forecast Final Cost */}
            <div className="px-2 flex items-center justify-end h-full text-xs">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="forecast_cost"
                value={item.forecast_cost || ''}
                placeholder={budget.toString()}
                className="text-xs text-purple-600 text-right w-full font-medium"
              />
            </div>

            {/* Variance - Calculated */}
            <div className={`px-2 flex items-center justify-end h-full text-xs font-medium ${
              variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {variance !== 0 && (variance > 0 ? '+' : '')}{formatCurrency(Math.abs(variance))}
            </div>

             {/* Status */}
             <div className="px-2 flex items-center justify-center h-full">
               <StatusSelect 
                 value={item.status} 
                 onChange={(newStatus: string) => onItemUpdate(item.id, { status: newStatus })}
                 disabled={item.hasChildren}
               />
             </div>

            {/* Notes */}
            <div className="px-2 flex items-center h-full text-xs">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="cost_notes"
                value={item.cost_notes || ''}
                placeholder="Add notes..."
                className="text-xs text-muted-foreground w-full"
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white">
      {useUnifiedScroll ? (
        // Unified scroll mode - parent handles scrolling
        <div>
          {content}
        </div>
      ) : (
        // Separate scroll mode - this component handles its own scrolling
        <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin" onScroll={onScroll}>
          <div className="min-h-full">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};