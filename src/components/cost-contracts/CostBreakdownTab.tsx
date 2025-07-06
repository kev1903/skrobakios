import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Download, Trash2, Edit3 } from 'lucide-react';
interface CostBreakdownTabProps {
  onNavigate?: (page: string) => void;
}
interface CostItem {
  id: string;
  costCode: string;
  tradeScope: string;
  budget: number;
  committed: number;
  paid: number;
  remaining: number;
  notes: string;
}
export const CostBreakdownTab = ({
  onNavigate
}: CostBreakdownTabProps) => {
  const [costItems, setCostItems] = useState<CostItem[]>([{
    id: '1',
    costCode: 'EXC-001',
    tradeScope: 'Site Excavation',
    budget: 25000,
    committed: 24500,
    paid: 20000,
    remaining: 1000,
    notes: 'Includes rock removal'
  }, {
    id: '2',
    costCode: 'CON-001',
    tradeScope: 'Concrete Foundations',
    budget: 45000,
    committed: 47000,
    paid: 35000,
    remaining: -2000,
    notes: 'Over budget due to additional reinforcement'
  }]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const getStatusColor = (remaining: number, budget: number) => {
    const percentRemaining = remaining / budget * 100;
    if (percentRemaining < 0) return 'bg-red-100 text-red-800 border-red-200';
    if (percentRemaining < 10) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };
  const addNewRow = () => {
    const newItem: CostItem = {
      id: Date.now().toString(),
      costCode: '',
      tradeScope: '',
      budget: 0,
      committed: 0,
      paid: 0,
      remaining: 0,
      notes: ''
    };
    setCostItems([...costItems, newItem]);
    setEditingId(newItem.id);
  };
  const updateItem = (id: string, field: keyof CostItem, value: string | number) => {
    setCostItems(items => items.map(item => {
      if (item.id === id) {
        const updated = {
          ...item,
          [field]: value
        };
        if (field === 'budget' || field === 'committed' || field === 'paid') {
          updated.remaining = updated.budget - Math.max(updated.committed, updated.paid);
        }
        return updated;
      }
      return item;
    }));
  };
  const deleteItem = (id: string) => {
    setCostItems(items => items.filter(item => item.id !== id));
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };
  const totals = costItems.reduce((acc, item) => ({
    budget: acc.budget + item.budget,
    committed: acc.committed + item.committed,
    paid: acc.paid + item.paid,
    remaining: acc.remaining + item.remaining
  }), {
    budget: 0,
    committed: 0,
    paid: 0,
    remaining: 0
  });
  return <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          
          
        </div>
        <div className="flex gap-3">
          
          
          
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Budget</h3>
            <div className="w-12 h-8 bg-blue-50 rounded flex items-center justify-center">
              <div className="w-6 h-4 bg-blue-200 rounded-sm"></div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.budget)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Committed</h3>
            <div className="w-12 h-8 bg-blue-50 rounded flex items-center justify-center">
              <div className="w-6 h-4 bg-blue-200 rounded-sm"></div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.committed)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Paid</h3>
            <div className="w-12 h-8 bg-blue-50 rounded flex items-center justify-center">
              <div className="w-6 h-4 bg-blue-200 rounded-sm"></div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.paid)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Remaining</h3>
            <div className="w-12 h-8 bg-blue-50 rounded flex items-center justify-center">
              <div className="w-6 h-4 bg-blue-200 rounded-sm"></div>
            </div>
          </div>
          <p className={`text-2xl font-bold ${totals.remaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(totals.remaining)}
          </p>
        </div>
      </div>

      {/* Cost Breakdown Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Cost Breakdown Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-700 font-medium">Cost Code</TableHead>
                  <TableHead className="text-gray-700 font-medium">Trade/Scope</TableHead>
                  <TableHead className="text-gray-700 font-medium">Budget</TableHead>
                  <TableHead className="text-gray-700 font-medium">Committed</TableHead>
                  <TableHead className="text-gray-700 font-medium">Paid</TableHead>
                  <TableHead className="text-gray-700 font-medium">Remaining</TableHead>
                  <TableHead className="text-gray-700 font-medium">Status</TableHead>
                  <TableHead className="text-gray-700 font-medium">Notes</TableHead>
                  <TableHead className="text-gray-700 font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costItems.map(item => <TableRow key={item.id} className="border-gray-200 hover:bg-gray-50">
                    <TableCell>
                      {editingId === item.id ? <Input value={item.costCode} onChange={e => updateItem(item.id, 'costCode', e.target.value)} className="bg-white border-gray-200 text-gray-900 h-8" /> : <span className="text-gray-900 font-mono">{item.costCode}</span>}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? <Input value={item.tradeScope} onChange={e => updateItem(item.id, 'tradeScope', e.target.value)} className="bg-white border-gray-200 text-gray-900 h-8" /> : <span className="text-gray-600">{item.tradeScope}</span>}
                     </TableCell>
                     <TableCell>
                       {editingId === item.id ? <Input type="number" value={item.budget} onChange={e => updateItem(item.id, 'budget', parseFloat(e.target.value) || 0)} className="bg-white border-gray-200 text-gray-900 h-8" /> : <span className="text-gray-600">{formatCurrency(item.budget)}</span>}
                     </TableCell>
                     <TableCell>
                       {editingId === item.id ? <Input type="number" value={item.committed} onChange={e => updateItem(item.id, 'committed', parseFloat(e.target.value) || 0)} className="bg-white border-gray-200 text-gray-900 h-8" /> : <span className="text-gray-600">{formatCurrency(item.committed)}</span>}
                     </TableCell>
                     <TableCell>
                       {editingId === item.id ? <Input type="number" value={item.paid} onChange={e => updateItem(item.id, 'paid', parseFloat(e.target.value) || 0)} className="bg-white border-gray-200 text-gray-900 h-8" /> : <span className="text-gray-600">{formatCurrency(item.paid)}</span>}
                     </TableCell>
                     <TableCell>
                       <span className={`font-medium ${item.remaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                         {formatCurrency(item.remaining)}
                       </span>
                     </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(item.remaining, item.budget)}>
                        {item.remaining < 0 ? 'Over Budget' : item.remaining / item.budget < 0.1 ? 'Near Budget' : 'On Budget'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? <Input value={item.notes} onChange={e => updateItem(item.id, 'notes', e.target.value)} className="bg-white border-gray-200 text-gray-900 h-8" /> : <span className="text-gray-500 text-sm">{item.notes}</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(editingId === item.id ? null : item.id)} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteItem(item.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>;
};