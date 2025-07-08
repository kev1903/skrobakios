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
    <div className="space-y-6">
      {/* Summary Cards */}
      <CostSummaryCards totals={totals} formatCurrency={formatCurrency} />

      {/* Cost Breakdown Table */}
      <div className="glass-light rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground heading-modern">
            Cost Breakdown Details
          </h3>
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