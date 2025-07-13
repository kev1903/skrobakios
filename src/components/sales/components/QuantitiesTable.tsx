import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { Trade } from '../hooks/useTrades';

interface QuantitiesTableProps {
  trades: Trade[];
  onAddTrade: () => void;
  onAddMeasurement: (tradeId: string) => void;
  onUpdateMeasurement: (tradeId: string, measurementId: string, field: string, value: any) => void;
  onRemoveMeasurement: (tradeId: string, measurementId: string) => void;
  onUpdateTradeName: (tradeId: string, name: string) => void;
}

export const QuantitiesTable = ({ 
  trades, 
  onAddTrade, 
  onAddMeasurement, 
  onUpdateMeasurement, 
  onRemoveMeasurement, 
  onUpdateTradeName 
}: QuantitiesTableProps) => {
  return (
    <div className="space-y-6">
      {trades.map(trade => (
        <Card key={trade.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Input 
                value={trade.name} 
                onChange={e => onUpdateTradeName(trade.id, e.target.value)} 
                className="text-lg font-semibold border-none p-0 h-auto bg-transparent" 
              />
              <Button variant="outline" size="sm" onClick={() => onAddMeasurement(trade.id)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Qty</TableHead>
                  <TableHead className="w-24">Rate</TableHead>
                  <TableHead className="w-28">Amount</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trade.measurements.map(measurement => (
                  <TableRow key={measurement.id}>
                    <TableCell>
                      <Select 
                        value={measurement.type} 
                        onValueChange={value => onUpdateMeasurement(trade.id, measurement.id, 'type', value)}
                      >
                        <SelectTrigger className="w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M2">M²</SelectItem>
                          <SelectItem value="M3">M³</SelectItem>
                          <SelectItem value="linear">LM</SelectItem>
                          <SelectItem value="number">#</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={measurement.description} 
                        onChange={e => onUpdateMeasurement(trade.id, measurement.id, 'description', e.target.value)} 
                        placeholder="Item description" 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={measurement.quantity} 
                        onChange={e => onUpdateMeasurement(trade.id, measurement.id, 'quantity', parseFloat(e.target.value) || 0)} 
                        className="w-20" 
                        step="0.1" 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={measurement.rate} 
                        onChange={e => onUpdateMeasurement(trade.id, measurement.id, 'rate', parseFloat(e.target.value) || 0)} 
                        className="w-20" 
                        step="0.01" 
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ${measurement.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onRemoveMeasurement(trade.id, measurement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {trade.measurements.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-end">
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">Trade Subtotal: </span>
                    <span className="font-semibold text-lg">
                      ${trade.measurements.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};