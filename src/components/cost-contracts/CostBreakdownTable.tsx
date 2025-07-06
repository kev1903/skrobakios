import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table as TableComponent, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardContent className="p-0">
        <TableComponent>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5 h-8">
              <TableHead className="text-white font-semibold h-8">Cost Code</TableHead>
              <TableHead className="text-white font-semibold h-8">Trade/Scope</TableHead>
              <TableHead className="text-white font-semibold h-8">Budget</TableHead>
              <TableHead className="text-white font-semibold h-8">Committed</TableHead>
              <TableHead className="text-white font-semibold h-8">Paid</TableHead>
              <TableHead className="text-white font-semibold h-8">Remaining</TableHead>
              <TableHead className="text-white font-semibold h-8">Status</TableHead>
              <TableHead className="text-white font-semibold h-8">Notes</TableHead>
              <TableHead className="text-white font-semibold h-8 w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costItems.map(item => (
              <TableRow key={item.id} className="border-white/10 hover:bg-white/5 h-8">
                <TableCell>
                  {editingId === item.id ? (
                    <Input 
                      value={item.costCode} 
                      onChange={e => updateItem(item.id, 'costCode', e.target.value)} 
                      className="bg-white/10 border-white/20 text-white h-8" 
                    />
                  ) : (
                    <span className="text-white font-mono">{item.costCode}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <Input 
                      value={item.tradeScope} 
                      onChange={e => updateItem(item.id, 'tradeScope', e.target.value)} 
                      className="bg-white/10 border-white/20 text-white h-8" 
                    />
                  ) : (
                    <span className="text-slate-300">{item.tradeScope}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <Input 
                      type="number" 
                      value={item.budget} 
                      onChange={e => updateItem(item.id, 'budget', parseFloat(e.target.value) || 0)} 
                      className="bg-white/10 border-white/20 text-white h-8" 
                    />
                  ) : (
                    <span className="text-slate-300">{formatCurrency(item.budget)}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <Input 
                      type="number" 
                      value={item.committed} 
                      onChange={e => updateItem(item.id, 'committed', parseFloat(e.target.value) || 0)} 
                      className="bg-white/10 border-white/20 text-white h-8" 
                    />
                  ) : (
                    <span className="text-slate-300">{formatCurrency(item.committed)}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <Input 
                      type="number" 
                      value={item.paid} 
                      onChange={e => updateItem(item.id, 'paid', parseFloat(e.target.value) || 0)} 
                      className="bg-white/10 border-white/20 text-white h-8" 
                    />
                  ) : (
                    <span className="text-slate-300">{formatCurrency(item.paid)}</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${item.remaining < 0 ? 'text-red-400' : 'text-white'}`}>
                    {formatCurrency(item.remaining)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${getStatusColor(item.remaining, item.budget)} border-white/20`}>
                    {item.remaining < 0 ? 'Over Budget' : item.remaining / item.budget < 0.1 ? 'Near Budget' : 'On Budget'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <Input 
                      value={item.notes} 
                      onChange={e => updateItem(item.id, 'notes', e.target.value)} 
                      className="bg-white/10 border-white/20 text-white h-8" 
                    />
                  ) : (
                    <span className="text-slate-400 text-sm">{item.notes}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setEditingId(editingId === item.id ? null : item.id)} 
                      className="text-slate-300 hover:text-white hover:bg-white/10"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => deleteItem(item.id)} 
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {costItems.length === 0 && (
              <TableRow className="border-white/10 h-8">
                <TableCell colSpan={9} className="text-center text-slate-400 py-8">
                  No cost items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableComponent>
      </CardContent>
    </Card>
  );
};