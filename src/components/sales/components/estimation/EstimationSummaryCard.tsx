import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';

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
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

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
    return baseAmount * (months / 2) * monthlyRate; // Average over project duration
  };

  const handleStartEdit = (field: string, currentValue: number) => {
    setEditingField(field);
    setTempValue(currentValue.toString());
  };

  const handleSaveEdit = (field: string) => {
    const value = parseFloat(tempValue);
    if (!isNaN(value) && value >= 0 && onUpdateSettings) {
      onUpdateSettings({ [field]: value });
    }
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(field);
    } else if (e.key === 'Escape') {
      setEditingField(null);
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

  const EditablePercentage = ({ 
    label, 
    field, 
    value, 
    amount 
  }: { 
    label: string; 
    field: string; 
    value: number; 
    amount: number;
  }) => (
    <div className="flex justify-between items-center group">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {editingField === field ? (
          <Input
            type="number"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={() => handleSaveEdit(field)}
            onKeyDown={(e) => handleKeyDown(e, field)}
            className="w-16 h-6 px-2 text-xs"
            autoFocus
            step="0.1"
            min="0"
          />
        ) : (
          <button
            onClick={() => handleStartEdit(field, value)}
            className="flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            {value}%
            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>
      <span className="text-sm font-medium text-foreground">
        {formatCurrency(amount)}
      </span>
    </div>
  );

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Estimation Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Costs Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Line Items</span>
            <span className="text-sm font-medium text-foreground">{itemCount}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Base Subtotal</span>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(baseSubtotal)}
            </span>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* Additional Costs Section */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Additional Costs
          </div>
          
          <EditablePercentage
            label="Preliminaries & General"
            field="preliminariesPercentage"
            value={preliminariesPercentage}
            amount={preliminariesAmount}
          />
          
          <EditablePercentage
            label="Contingency"
            field="contingencyPercentage"
            value={contingencyPercentage}
            amount={contingencyAmount}
          />
          
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm font-medium text-foreground">Subtotal Before Margin</span>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(subtotalBeforeMargin)}
            </span>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* Margin & Escalation Section */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Margin & Escalation
          </div>
          
          <EditablePercentage
            label="Builder's Margin"
            field="buildersMarginPercentage"
            value={buildersMarginPercentage}
            amount={marginAmount}
          />
          
          <div className="flex justify-between items-center group">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Cost Escalation</span>
              {editingField === 'projectDuration' ? (
                <Input
                  type="number"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={() => handleSaveEdit('projectDuration')}
                  onKeyDown={(e) => handleKeyDown(e, 'projectDuration')}
                  className="w-16 h-6 px-2 text-xs"
                  autoFocus
                  step="1"
                  min="1"
                />
              ) : (
                <button
                  onClick={() => handleStartEdit('projectDuration', projectDuration)}
                  className="flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary transition-colors"
                >
                  {projectDuration}mo @ {escalationRate}%
                  <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
            <span className="text-sm font-medium text-foreground">
              {formatCurrency(escalationAmount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm font-medium text-foreground">Subtotal Before GST</span>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(subtotalBeforeGST)}
            </span>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* Tax & Total Section */}
        <div className="space-y-3">
          <EditablePercentage
            label="GST"
            field="gstRate"
            value={gstRate}
            amount={gstAmount}
          />
          
          <Separator className="bg-border/30" />
          
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-bold text-foreground">Grand Total</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
