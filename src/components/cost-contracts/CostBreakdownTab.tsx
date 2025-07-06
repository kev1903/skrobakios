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

export const CostBreakdownTab = ({ onNavigate }: CostBreakdownTabProps) => {
  const [costItems, setCostItems] = useState<CostItem[]>([
    {
      id: '1',
      costCode: 'EXC-001',
      tradeScope: 'Site Excavation',
      budget: 25000,
      committed: 24500,
      paid: 20000,
      remaining: 1000,
      notes: 'Includes rock removal'
    },
    {
      id: '2',
      costCode: 'CON-001',
      tradeScope: 'Concrete Foundations',
      budget: 45000,
      committed: 47000,
      paid: 35000,
      remaining: -2000,
      notes: 'Over budget due to additional reinforcement'
    }
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const getStatusColor = (remaining: number, budget: number) => {
    const percentRemaining = (remaining / budget) * 100;
    if (percentRemaining < 0) return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (percentRemaining < 10) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    return 'bg-green-500/20 text-green-300 border-green-500/30';
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
        const updated = { ...item, [field]: value };
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
  }), { budget: 0, committed: 0, paid: 0, remaining: 0 });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-playfair">Cost Breakdown (BOQ)</h2>
          <p className="text-white/70 font-helvetica">Manage project budget and cost tracking</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload BOQ
          </Button>
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={addNewRow}
            className="bg-blue-500/80 hover:bg-blue-600/80 text-white backdrop-blur-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-helvetica">Total Budget</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totals.budget)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <span className="text-blue-400 text-lg">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-helvetica">Committed</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totals.committed)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <span className="text-orange-400 text-lg">📋</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-helvetica">Paid</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totals.paid)}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <span className="text-green-400 text-lg">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-helvetica">Remaining</p>
                <p className={`text-2xl font-bold ${totals.remaining < 0 ? 'text-red-400' : 'text-white'}`}>
                  {formatCurrency(totals.remaining)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <span className="text-purple-400 text-lg">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown Table */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white font-playfair">Cost Breakdown Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/90 font-helvetica">Cost Code</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Trade/Scope</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Budget</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Committed</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Paid</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Remaining</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Status</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Notes</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costItems.map((item) => (
                  <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={item.costCode}
                          onChange={(e) => updateItem(item.id, 'costCode', e.target.value)}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      ) : (
                        <span className="text-white/90 font-mono">{item.costCode}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={item.tradeScope}
                          onChange={(e) => updateItem(item.id, 'tradeScope', e.target.value)}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      ) : (
                        <span className="text-white/90">{item.tradeScope}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          value={item.budget}
                          onChange={(e) => updateItem(item.id, 'budget', parseFloat(e.target.value) || 0)}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      ) : (
                        <span className="text-white/90">{formatCurrency(item.budget)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          value={item.committed}
                          onChange={(e) => updateItem(item.id, 'committed', parseFloat(e.target.value) || 0)}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      ) : (
                        <span className="text-white/90">{formatCurrency(item.committed)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          value={item.paid}
                          onChange={(e) => updateItem(item.id, 'paid', parseFloat(e.target.value) || 0)}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      ) : (
                        <span className="text-white/90">{formatCurrency(item.paid)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${item.remaining < 0 ? 'text-red-400' : 'text-white/90'}`}>
                        {formatCurrency(item.remaining)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(item.remaining, item.budget)}>
                        {item.remaining < 0 ? 'Over Budget' : item.remaining / item.budget < 0.1 ? 'Near Budget' : 'On Budget'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={item.notes}
                          onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      ) : (
                        <span className="text-white/70 text-sm">{item.notes}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteItem(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};