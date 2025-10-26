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
  budgeted_cost?: number;
  variations?: number;
  revised_budget?: number;
  committed_cost?: number;
  paid_cost?: number;
  forecast_cost?: number;
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Determine if we're in unified scroll mode
  const useUnifiedScroll = true; // Enable unified scrolling for Cost tab

  const content = (
    <div style={{ minWidth: '820px' }}> {/* Reasonable minimum width for cost columns */}
      {items.map((item) => {
        const budget = parseFloat(item.budgeted_cost?.toString() || '0') || 0;
        const variations = parseFloat(item.variations?.toString() || '0') || 0;
        const revisedBudget = parseFloat(item.revised_budget?.toString() || '0') || (budget + variations);
        const committed = parseFloat(item.committed_cost?.toString() || '0') || 0;
        const paid = parseFloat(item.paid_cost?.toString() || '0') || 0;
        const forecast = parseFloat(item.forecast_cost?.toString() || '0') || budget;
        const remaining = calculateRemaining(budget, paid);
        const variance = calculateVariance(budget, forecast);
        
        return (
          <div
            key={item.id}
              className={`grid items-center w-full border-b border-gray-100 border-l-4 cursor-pointer transition-colors duration-150 ${
                selectedItems.includes(item.id) 
                  ? 'bg-primary/10 border-l-primary' 
                  : hoveredId === item.id 
                    ? 'bg-gray-50 border-l-transparent' 
                    : 'bg-white hover:bg-gray-50 border-l-transparent'
              }`}
            style={{
              gridTemplateColumns: '100px 100px 100px 100px 100px 100px 120px 100px 1fr',
              height: '28px',
            }}
            onMouseEnter={() => onRowHover?.(item.id)}
            onMouseLeave={() => onRowHover?.(null)}
            onClick={(e) => onRowClick?.(item.id, e.ctrlKey || e.metaKey)}
        >
            {/* Budget */}
            <div className="px-2 flex items-center justify-end h-full text-xs bg-white">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="budgeted_cost"
                value={budget > 0 ? formatCurrency(budget) : ''}
                placeholder="$0.00"
                className="text-xs text-foreground text-right w-full font-medium"
              />
            </div>

            {/* Variations */}
            <div className="px-2 flex items-center justify-end h-full text-xs bg-white">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="variations"
                value={variations !== 0 ? formatCurrency(variations) : ''}
                placeholder="$0.00"
                className="text-xs text-orange-600 text-right w-full font-medium"
              />
            </div>

            {/* New Budget (Revised Budget) - Editable */}
            <div className="px-2 flex items-center justify-end h-full text-xs bg-white">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="revised_budget"
                value={revisedBudget > 0 ? formatCurrency(revisedBudget) : ''}
                placeholder="$0.00"
                className="text-xs text-indigo-600 text-right w-full font-medium"
              />
            </div>

            {/* Committed */}
            <div className="px-2 flex items-center justify-end h-full text-xs bg-white">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="committed_cost"
                value={committed > 0 ? formatCurrency(committed) : ''}
                placeholder="$0.00"
                className="text-xs text-amber-600 text-right w-full font-medium"
              />
            </div>

            {/* Paid */}
            <div className="px-2 flex items-center justify-end h-full text-xs bg-white">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="paid_cost"
                value={paid > 0 ? formatCurrency(paid) : ''}
                placeholder="$0.00"
                className="text-xs text-green-600 text-right w-full font-medium"
              />
            </div>

            {/* Remaining - Calculated */}
            <div className="px-2 flex items-center justify-end h-full text-xs text-blue-600 font-medium bg-slate-50/50">
              {formatCurrency(remaining)}
            </div>

            {/* Forecast Final Cost */}
            <div className="px-2 flex items-center justify-end h-full text-xs bg-white">
              <EditableCell
                id={item.id}
                type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : 'element'}
                field="forecast_cost"
                value={forecast > 0 ? formatCurrency(forecast) : ''}
                placeholder="$0.00"
                className="text-xs text-purple-600 text-right w-full font-medium"
              />
            </div>

            {/* Variance - Calculated */}
            <div className={`px-2 flex items-center justify-end h-full text-xs font-medium bg-slate-50/50 ${
              variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {variance !== 0 && (variance > 0 ? '+' : '')}{formatCurrency(Math.abs(variance))}
            </div>

            {/* Notes */}
            <div className="px-2 flex items-center h-full text-xs bg-white">
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