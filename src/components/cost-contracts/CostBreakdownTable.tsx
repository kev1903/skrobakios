import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2 } from 'lucide-react';
import { CostItem } from './types';

interface CostBreakdownTableProps {
  costItems: CostItem[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  updateItem: (id: string, field: keyof CostItem, value: string | number) => void;
  deleteItem: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

export const CostBreakdownTable = ({
  costItems,
  editingId,
  setEditingId,
  updateItem,
  deleteItem,
  formatCurrency
}: CostBreakdownTableProps) => {
  const getStatusColor = (remaining: number, budget: number) => {
    const percentRemaining = remaining / budget * 100;
    if (percentRemaining < 0) return 'bg-red-100 text-red-800 border-red-200';
    if (percentRemaining < 10) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <Card className="mb-8">
      <CardHeader className="py-3">
        <CardTitle className="text-base font-semibold">Cost Breakdown Table</CardTitle>
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
              {costItems.map(item => (
                <TableRow key={item.id} className="border-gray-200 hover:bg-gray-50">
                  <TableCell>
                    {editingId === item.id ? (
                      <Input 
                        value={item.costCode} 
                        onChange={e => updateItem(item.id, 'costCode', e.target.value)} 
                        className="bg-white border-gray-200 text-gray-900 h-8" 
                      />
                    ) : (
                      <span className="text-gray-900 font-mono">{item.costCode}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input 
                        value={item.tradeScope} 
                        onChange={e => updateItem(item.id, 'tradeScope', e.target.value)} 
                        className="bg-white border-gray-200 text-gray-900 h-8" 
                      />
                    ) : (
                      <span className="text-gray-600">{item.tradeScope}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input 
                        type="number" 
                        value={item.budget} 
                        onChange={e => updateItem(item.id, 'budget', parseFloat(e.target.value) || 0)} 
                        className="bg-white border-gray-200 text-gray-900 h-8" 
                      />
                    ) : (
                      <span className="text-gray-600">{formatCurrency(item.budget)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input 
                        type="number" 
                        value={item.committed} 
                        onChange={e => updateItem(item.id, 'committed', parseFloat(e.target.value) || 0)} 
                        className="bg-white border-gray-200 text-gray-900 h-8" 
                      />
                    ) : (
                      <span className="text-gray-600">{formatCurrency(item.committed)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input 
                        type="number" 
                        value={item.paid} 
                        onChange={e => updateItem(item.id, 'paid', parseFloat(e.target.value) || 0)} 
                        className="bg-white border-gray-200 text-gray-900 h-8" 
                      />
                    ) : (
                      <span className="text-gray-600">{formatCurrency(item.paid)}</span>
                    )}
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
                    {editingId === item.id ? (
                      <Input 
                        value={item.notes} 
                        onChange={e => updateItem(item.id, 'notes', e.target.value)} 
                        className="bg-white border-gray-200 text-gray-900 h-8" 
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">{item.notes}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setEditingId(editingId === item.id ? null : item.id)} 
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteItem(item.id)} 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
  );
};