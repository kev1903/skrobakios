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
  return <div className="space-y-8">
      

      {/* Summary Cards */}
      <CostSummaryCards totals={totals} formatCurrency={formatCurrency} />

      {/* Cost Breakdown Table */}
      <CostBreakdownTable costItems={costItems} editingId={editingId} setEditingId={setEditingId} updateItem={updateItem} deleteItem={deleteItem} formatCurrency={formatCurrency} />
    </div>;
};