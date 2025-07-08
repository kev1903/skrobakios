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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="text-foreground font-medium heading-modern">Cost Code</TableHead>
            <TableHead className="text-foreground font-medium heading-modern">Trade/Scope</TableHead>
            <TableHead className="text-foreground font-medium heading-modern">Budget</TableHead>
            <TableHead className="text-foreground font-medium heading-modern">Committed</TableHead>
            <TableHead className="text-foreground font-medium heading-modern">Paid</TableHead>
            <TableHead className="text-foreground font-medium heading-modern">Remaining</TableHead>
            <TableHead className="text-foreground font-medium heading-modern">Status</TableHead>
            <TableHead className="text-foreground font-medium heading-modern">Notes</TableHead>
            <TableHead className="text-foreground font-medium heading-modern">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costItems.map(item => (
            <TableRow key={item.id} className="border-border hover:bg-muted/50">
              <TableCell>
                {editingId === item.id ? (
                  <Input 
                    value={item.costCode} 
                    onChange={e => updateItem(item.id, 'costCode', e.target.value)} 
                    className="h-8" 
                  />
                ) : (
                  <span className="text-foreground font-mono">{item.costCode}</span>
                )}
              </TableCell>
              <TableCell>
                {editingId === item.id ? (
                  <Input 
                    value={item.tradeScope} 
                    onChange={e => updateItem(item.id, 'tradeScope', e.target.value)} 
                    className="h-8" 
                  />
                ) : (
                  <span className="text-muted-foreground">{item.tradeScope}</span>
                )}
              </TableCell>
              <TableCell>
                {editingId === item.id ? (
                  <Input 
                    type="number" 
                    value={item.budget} 
                    onChange={e => updateItem(item.id, 'budget', parseFloat(e.target.value) || 0)} 
                    className="h-8" 
                  />
                ) : (
                  <span className="text-muted-foreground">{formatCurrency(item.budget)}</span>
                )}
              </TableCell>
              <TableCell>
                {editingId === item.id ? (
                  <Input 
                    type="number" 
                    value={item.committed} 
                    onChange={e => updateItem(item.id, 'committed', parseFloat(e.target.value) || 0)} 
                    className="h-8" 
                  />
                ) : (
                  <span className="text-muted-foreground">{formatCurrency(item.committed)}</span>
                )}
              </TableCell>
              <TableCell>
                {editingId === item.id ? (
                  <Input 
                    type="number" 
                    value={item.paid} 
                    onChange={e => updateItem(item.id, 'paid', parseFloat(e.target.value) || 0)} 
                    className="h-8" 
                  />
                ) : (
                  <span className="text-muted-foreground">{formatCurrency(item.paid)}</span>
                )}
              </TableCell>
              <TableCell>
                <span className={`font-medium ${item.remaining < 0 ? 'text-destructive' : 'text-foreground'}`}>
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
                    className="h-8" 
                  />
                ) : (
                  <span className="text-muted-foreground text-sm">{item.notes}</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setEditingId(editingId === item.id ? null : item.id)} 
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => deleteItem(item.id)} 
                    className="text-destructive hover:text-destructive"
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
  );
};