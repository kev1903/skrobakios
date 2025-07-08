import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Download } from 'lucide-react';
import { CostSummaryCards } from './CostSummaryCards';
import { CostBreakdownTable } from './CostBreakdownTable';
import { useCostBreakdown } from './useCostBreakdown';
interface CostBreakdownTabProps {
  onNavigate?: (page: string) => void;
}
export const CostBreakdownTab = ({
  onNavigate
}: CostBreakdownTabProps) => {
  const {
    costItems,
    editingId,
    setEditingId,
    addNewRow,
    updateItem,
    deleteItem,
    formatCurrency,
    totals
  } = useCostBreakdown();
  
  return (
    <div className="space-y-8">
      {/* Clean Financial Overview */}
      <CostSummaryCards totals={totals} formatCurrency={formatCurrency} />

      {/* Main Table with Integrated Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground heading-modern">
              Cost Breakdown
            </h2>
            <p className="text-sm text-muted-foreground body-modern mt-1">
              Detailed breakdown of project costs and expenses
            </p>
          </div>
          <Button onClick={addNewRow} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
        
        <CostBreakdownTable 
          costItems={costItems} 
          editingId={editingId} 
          setEditingId={setEditingId} 
          updateItem={updateItem} 
          deleteItem={deleteItem} 
          formatCurrency={formatCurrency} 
        />
      </div>
    </div>
  );
};