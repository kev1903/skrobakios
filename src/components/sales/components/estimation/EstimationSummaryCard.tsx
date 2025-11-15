import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface EstimationSummaryCardProps {
  subtotal: number;
  taxRate?: number;
  itemCount: number;
}

export const EstimationSummaryCard = ({ 
  subtotal, 
  taxRate = 10, 
  itemCount 
}: EstimationSummaryCardProps) => {
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Estimation Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Line Items</span>
            <span className="text-sm font-medium text-foreground">{itemCount}</span>
          </div>
          
          <Separator className="bg-border/30" />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-sm font-medium text-foreground">
              {formatCurrency(subtotal)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Tax ({taxRate}%)</span>
            <span className="text-sm font-medium text-foreground">
              {formatCurrency(taxAmount)}
            </span>
          </div>
          
          <Separator className="bg-border/30" />
          
          <div className="flex justify-between items-center pt-1">
            <span className="text-base font-semibold text-foreground">Total</span>
            <span className="text-base font-semibold text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
