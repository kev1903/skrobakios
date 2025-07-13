import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Send } from 'lucide-react';
import { Trade } from '../hooks/useTrades';

interface SummaryTabProps {
  trades: Trade[];
  markupPercentage: number;
  taxPercentage: number;
  onMarkupChange: (value: number) => void;
  onTaxChange: (value: number) => void;
}

interface EstimateData {
  id: string;
  name: string;
  project: string;
  amount: string;
  status: string;
  date: string;
}

export const SummaryTab = ({ 
  trades, 
  markupPercentage, 
  taxPercentage, 
  onMarkupChange, 
  onTaxChange 
}: SummaryTabProps) => {
  // Calculate totals
  const tradesTotal = trades.reduce((sum, trade) => 
    sum + trade.measurements.reduce((tradeSum, measurement) => tradeSum + measurement.amount, 0), 0
  );
  const markup = tradesTotal * (markupPercentage / 100);
  const subtotalWithMarkup = tradesTotal + markup;
  const tax = subtotalWithMarkup * (taxPercentage / 100);
  const total = subtotalWithMarkup + tax;

  const existingEstimates: EstimateData[] = [{
    id: '1',
    name: 'Kitchen Extension - Initial',
    project: 'Smith House',
    amount: '$85,000',
    status: 'Approved',
    date: '2024-01-15'
  }, {
    id: '2',
    name: 'Office Renovation - Quote',
    project: 'TechCorp Office',
    amount: '$120,000',
    status: 'Sent',
    date: '2024-01-20'
  }, {
    id: '3',
    name: 'Bathroom Upgrade - Draft',
    project: 'Davis Home',
    amount: '$35,000',
    status: 'Draft',
    date: '2024-01-22'
  }];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Sent':
        return 'bg-blue-100 text-blue-700';
      case 'Draft':
        return 'bg-gray-100 text-gray-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cost Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {trades.map(trade => (
              <div key={trade.id} className="flex justify-between">
                <span>{trade.name}:</span>
                <span className="font-medium">
                  ${trade.measurements.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Trades Total:</span>
              <span>${tradesTotal.toLocaleString()}</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="markup">Markup (%)</Label>
              <Input 
                id="markup" 
                type="number" 
                value={markupPercentage} 
                onChange={e => onMarkupChange(parseFloat(e.target.value) || 0)} 
              />
              <div className="flex justify-between text-sm">
                <span>Markup Amount:</span>
                <span>${markup.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax">Tax (%)</Label>
              <Input 
                id="tax" 
                type="number" 
                value={taxPercentage} 
                onChange={e => onTaxChange(parseFloat(e.target.value) || 0)} 
              />
              <div className="flex justify-between text-sm">
                <span>Tax Amount:</span>
                <span>${tax.toLocaleString()}</span>
              </div>
            </div>

            <Separator />
            <div className="flex justify-between text-xl font-bold text-primary">
              <span>Total:</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Button className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Generate PDF Quote
            </Button>
            <Button variant="outline" className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Send to Client
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Estimates */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Estimates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {existingEstimates.map(estimate => (
              <div key={estimate.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{estimate.name}</h4>
                  <Badge className={getStatusColor(estimate.status)}>{estimate.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{estimate.project}</p>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-primary">{estimate.amount}</span>
                  <span className="text-xs text-muted-foreground">{estimate.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};