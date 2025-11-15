import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

interface EstimationSummaryCardProps {
  subtotal: number;
  itemCount: number;
  projectDuration?: number; // in months
  escalationRate?: number; // annual %
  preliminariesPercentage?: number;
  contingencyPercentage?: number;
  buildersMarginPercentage?: number;
  gstRate?: number;
  onUpdateSettings?: (settings: {
    projectDuration?: number;
    escalationRate?: number;
    preliminariesPercentage?: number;
    contingencyPercentage?: number;
    buildersMarginPercentage?: number;
    gstRate?: number;
  }) => void;
}

export const EstimationSummaryCard = ({ 
  subtotal, 
  itemCount,
  projectDuration = 12,
  escalationRate = 3,
  preliminariesPercentage = 10,
  contingencyPercentage = 10,
  buildersMarginPercentage = 15,
  gstRate = 10,
  onUpdateSettings
}: EstimationSummaryCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const calculateEscalation = (baseAmount: number, months: number, annualRate: number) => {
    const monthlyRate = annualRate / 12 / 100;
    return baseAmount * (months / 2) * monthlyRate;
  };

  const handlePercentageChange = (field: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && onUpdateSettings) {
      onUpdateSettings({ [field]: numValue });
    }
  };

  // Calculation flow
  const baseSubtotal = subtotal;
  const preliminariesAmount = (baseSubtotal * preliminariesPercentage) / 100;
  const subtotalAfterPrelims = baseSubtotal + preliminariesAmount;
  
  const contingencyAmount = (subtotalAfterPrelims * contingencyPercentage) / 100;
  const subtotalBeforeMargin = subtotalAfterPrelims + contingencyAmount;
  
  const marginAmount = (subtotalBeforeMargin * buildersMarginPercentage) / 100;
  const escalationAmount = calculateEscalation(subtotalBeforeMargin, projectDuration, escalationRate);
  const subtotalBeforeGST = subtotalBeforeMargin + marginAmount + escalationAmount;
  
  const gstAmount = (subtotalBeforeGST * gstRate) / 100;
  const grandTotal = subtotalBeforeGST + gstAmount;

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Estimation Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Costs */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Line Items</span>
            <span className="text-xs font-medium text-foreground">{itemCount}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">Construction Cost</span>
            <span className="text-sm font-bold text-foreground">
              {formatCurrency(baseSubtotal)}
            </span>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* 1. Preliminaries and Generals */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-3">
            1. Preliminaries and Generals
          </div>
          
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_60px_90px] gap-2 pb-1 border-b border-border/20">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Description</div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-center">Rate</div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Amount</div>
          </div>
          
          {/* Preliminaries */}
          <div className="grid grid-cols-[1fr_60px_90px] gap-2 items-center py-1">
            <span className="text-xs text-foreground">Preliminaries & General</span>
            <div className="flex items-center justify-center">
              <Input
                type="number"
                value={preliminariesPercentage}
                onChange={(e) => handlePercentageChange('preliminariesPercentage', e.target.value)}
                className="h-7 w-full px-2 text-xs text-center bg-background border-border/40"
                step="0.5"
                min="0"
                max="100"
              />
              <span className="text-xs text-muted-foreground ml-1">%</span>
            </div>
            <span className="text-xs font-medium text-foreground text-right">
              {formatCurrency(preliminariesAmount)}
            </span>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* 2. Overheads & Profit */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-3">
            2. Overheads & Profit
          </div>
          
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_60px_90px] gap-2 pb-1 border-b border-border/20">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Description</div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-center">Rate</div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Amount</div>
          </div>
          
          {/* Contingency */}
          <div className="grid grid-cols-[1fr_60px_90px] gap-2 items-center py-1">
            <span className="text-xs text-foreground">Contingency</span>
            <div className="flex items-center justify-center">
              <Input
                type="number"
                value={contingencyPercentage}
                onChange={(e) => handlePercentageChange('contingencyPercentage', e.target.value)}
                className="h-7 w-full px-2 text-xs text-center bg-background border-border/40"
                step="0.5"
                min="0"
                max="100"
              />
              <span className="text-xs text-muted-foreground ml-1">%</span>
            </div>
            <span className="text-xs font-medium text-foreground text-right">
              {formatCurrency(contingencyAmount)}
            </span>
          </div>
          
          {/* Builder's Margin */}
          <div className="grid grid-cols-[1fr_60px_90px] gap-2 items-center py-1">
            <span className="text-xs text-foreground">Builder's Margin</span>
            <div className="flex items-center justify-center">
              <Input
                type="number"
                value={buildersMarginPercentage}
                onChange={(e) => handlePercentageChange('buildersMarginPercentage', e.target.value)}
                className="h-7 w-full px-2 text-xs text-center bg-background border-border/40"
                step="0.5"
                min="0"
                max="100"
              />
              <span className="text-xs text-muted-foreground ml-1">%</span>
            </div>
            <span className="text-xs font-medium text-foreground text-right">
              {formatCurrency(marginAmount)}
            </span>
          </div>
          
          {/* Cost Escalation */}
          <div className="grid grid-cols-[1fr_60px_90px] gap-2 items-center py-1">
            <span className="text-xs text-foreground">Cost Escalation</span>
            <div className="flex items-center justify-center gap-1">
              <Input
                type="number"
                value={projectDuration}
                onChange={(e) => handlePercentageChange('projectDuration', e.target.value)}
                className="h-7 w-10 px-1 text-xs text-center bg-background border-border/40"
                step="1"
                min="1"
                max="60"
              />
              <span className="text-[10px] text-muted-foreground">mo @</span>
              <Input
                type="number"
                value={escalationRate}
                onChange={(e) => handlePercentageChange('escalationRate', e.target.value)}
                className="h-7 w-10 px-1 text-xs text-center bg-background border-border/40"
                step="0.1"
                min="0"
                max="20"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
            <span className="text-xs font-medium text-foreground text-right">
              {formatCurrency(escalationAmount)}
            </span>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* Project Cost */}
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 bg-accent/10 -mx-6 px-6 rounded-lg">
            <span className="text-sm font-bold text-foreground">Project Cost</span>
            <span className="text-sm font-bold text-foreground">
              {formatCurrency(subtotalBeforeGST)}
            </span>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* GST */}
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_60px_90px] gap-2 items-center py-1">
            <span className="text-xs font-semibold text-foreground">GST</span>
            <div className="flex items-center justify-center">
              <Input
                type="number"
                value={gstRate}
                onChange={(e) => handlePercentageChange('gstRate', e.target.value)}
                className="h-7 w-full px-2 text-xs text-center bg-background border-border/40"
                step="0.5"
                min="0"
                max="100"
              />
              <span className="text-xs text-muted-foreground ml-1">%</span>
            </div>
            <span className="text-xs font-semibold text-foreground text-right">
              {formatCurrency(gstAmount)}
            </span>
          </div>
        </div>

        <Separator className="bg-border/30" />
        
        {/* Contract Amount */}
        <div className="flex justify-between items-center pt-2 bg-primary/5 -mx-6 px-6 py-3 -mb-6 rounded-b-xl">
          <span className="text-base font-bold text-foreground">Contract Amount</span>
          <span className="text-base font-bold text-primary">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
