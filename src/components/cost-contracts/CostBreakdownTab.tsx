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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cost Breakdown</h2>
          <p className="text-gray-600">Track project costs, commitments, and payments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={addNewRow} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <CostSummaryCards totals={totals} formatCurrency={formatCurrency} />

      {/* Cost Breakdown Table */}
      <CostBreakdownTable
        costItems={costItems}
        editingId={editingId}
        setEditingId={setEditingId}
        updateItem={updateItem}
        deleteItem={deleteItem}
        formatCurrency={formatCurrency}
      />
    </div>;
};