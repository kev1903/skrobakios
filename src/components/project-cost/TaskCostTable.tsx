import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { CentralTask, TaskUpdate } from '@/services/centralTaskService';
import { WBSItem } from '@/types/wbs';

interface TaskCostTableProps {
  tasks: CentralTask[];
  onUpdateTask: (taskId: string, updates: TaskUpdate) => Promise<void>;
  wbsItems: WBSItem[];
}

export const TaskCostTable = ({
  tasks,
  onUpdateTask,
  wbsItems = []
}: TaskCostTableProps) => {
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  // Group WBS items by stage using the hierarchical structure (roots are stages)
  const groupedWBSData = (wbsItems || []).reduce((acc, stage) => {
    const isStage = stage.level === 0 || (stage.wbs_id?.endsWith('.0'));
    if (!isStage) return acc;

    const key = stage.id || stage.wbs_id || stage.title || Math.random().toString();
    const components = Array.isArray(stage.children) ? stage.children : [];
    const elements = components.flatMap((comp) => 
      Array.isArray(comp.children) ? comp.children.map(el => ({ ...el, parentComponent: comp })) : []
    );

    acc[key] = {
      id: key,
      stage,
      components,
      elements
    };
    return acc;
  }, {} as Record<string, { id: string; stage: WBSItem; components: WBSItem[]; elements: (WBSItem & { parentComponent?: WBSItem })[] }>);

  const groupedData = Object.keys(groupedWBSData).length > 0 ? groupedWBSData : {};

  // Auto-expand all stages by default for better UX
  React.useEffect(() => {
    const hasStages = Object.keys(groupedData).length > 0;
    if (hasStages && expandedStages.size === 0) {
      setExpandedStages(new Set(Object.keys(groupedData)));
    }
  }, [Object.keys(groupedData).length]);

  const toggleStage = (stage: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stage)) {
      newExpanded.delete(stage);
    } else {
      newExpanded.add(stage);
    }
    setExpandedStages(newExpanded);
  };

  const handleCellClick = (itemId: string, field: string, currentValue: any) => {
    setEditingCell({ taskId: itemId, field });
    setEditValue(currentValue?.toString() || '');
  };

  const handleCellSave = async () => {
    if (!editingCell) return;
    
    try {
      // For WBS items, we need to update the WBS database
      const updates: any = {};
      if (editingCell.field === 'budgeted_cost') {
        updates.budgeted_cost = parseFloat(editValue) || 0;
      } else if (editingCell.field === 'actual_cost') {
        updates.actual_cost = parseFloat(editValue) || 0;
      }
      
      // Find the WBS item to update
      const wbsItem = wbsItems.find(item => item.id === editingCell.taskId);
      if (wbsItem) {
        // Update WBS item in database (you'll need to add this to your WBS service)
        console.log('Would update WBS item:', editingCell.taskId, updates);
        // TODO: Add WBS update function when available
      } else {
        // Fall back to task update for any actual tasks
        await onUpdateTask(editingCell.taskId, updates);
      }
      
      setEditingCell(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };
  
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Define exact column widths
  const columnWidths = {
    wbs: '80px',
    name: '200px', 
    description: '180px',
    budget: '100px',
    actual: '100px',
    variance: '100px',
    costCode: '90px',
    status: '80px',
    actions: '90px'
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="bg-muted/30 border-b px-6 py-3">
        <div className="flex items-center justify-end">
          {/* Stage Management button will be added from parent component */}
        </div>
      </div>

      {/* Perfect alignment table using traditional table with fixed layout */}
      <div className="w-full overflow-x-auto">
        <table style={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'collapse' }}>
          <colgroup>
            <col style={{ width: columnWidths.wbs }} />
            <col style={{ width: columnWidths.name }} />
            <col style={{ width: columnWidths.description }} />
            <col style={{ width: columnWidths.budget }} />
            <col style={{ width: columnWidths.actual }} />
            <col style={{ width: columnWidths.variance }} />
            <col style={{ width: columnWidths.costCode }} />
            <col style={{ width: columnWidths.status }} />
            <col style={{ width: columnWidths.actions }} />
          </colgroup>
          
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
              <th style={{ 
                padding: '12px', 
                textAlign: 'left', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: 'hsl(var(--muted-foreground))', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                boxSizing: 'border-box'
              }}>
                WBS
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'left', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: 'hsl(var(--muted-foreground))', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                boxSizing: 'border-box'
              }}>
                NAME
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'left', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: 'hsl(var(--muted-foreground))', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                boxSizing: 'border-box'
              }}>
                DESCRIPTION
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'right', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: 'hsl(var(--muted-foreground))', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                boxSizing: 'border-box'
              }}>
                BUDGET
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'right', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: 'hsl(var(--muted-foreground))', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                boxSizing: 'border-box'
              }}>
                ACTUAL
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'right', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: 'hsl(var(--muted-foreground))', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                boxSizing: 'border-box'
              }}>
                VARIANCE
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'center', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: 'hsl(var(--muted-foreground))', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                boxSizing: 'border-box'
              }}>
                COST CODE
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'center', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: 'hsl(var(--muted-foreground))', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                boxSizing: 'border-box'
              }}>
                STATUS
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'center', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: 'hsl(var(--muted-foreground))', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                boxSizing: 'border-box'
              }}>
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            {Object.keys(groupedData).length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ fontSize: '12px', marginBottom: '8px' }}>No cost items found</p>
                    <Button size="sm" variant="outline" className="text-xs bg-white/20 border-white/30 text-foreground hover:bg-white/30">
                      + Add your first cost item
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              Object.values(groupedData)
                .sort((a, b) => (a.stage.wbs_id || '').localeCompare(b.stage.wbs_id || ''))
                .flatMap((stageData) => {
                  const stageKey = stageData.id;
                  const isExpanded = expandedStages.has(stageKey);
                  
                  // Calculate totals from components and elements
                  const stageTotal = stageData.components.reduce((sum, comp) => sum + (comp.budgeted_cost || 0), 0) +
                                     stageData.elements.reduce((sum, elem) => sum + (elem.budgeted_cost || 0), 0);
                  const stageActualTotal = stageData.components.reduce((sum, comp) => sum + (comp.actual_cost || 0), 0) +
                                           stageData.elements.reduce((sum, elem) => sum + (elem.actual_cost || 0), 0);

                  const rows: JSX.Element[] = [];

                  // Stage row
                  rows.push(
                    <tr 
                      key={`stage-${stageKey}`}
                      style={{ 
                        backgroundColor: '#f3f4f6', 
                        borderBottom: '1px solid #e5e7eb', 
                        cursor: 'pointer' 
                      }}
                      onClick={() => toggleStage(stageKey)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    >
                      <td style={{ 
                        padding: '12px', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: '#111827',
                        borderRight: '1px solid #e5e7eb',
                        boxSizing: 'border-box'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {isExpanded ? (
                            <ChevronDown style={{ width: '16px', height: '16px', marginRight: '8px', color: '#6b7280' }} />
                          ) : (
                            <ChevronRight style={{ width: '16px', height: '16px', marginRight: '8px', color: '#6b7280' }} />
                          )}
                          <span style={{ fontFamily: 'monospace' }}>{stageData.stage.wbs_id || '1'}</span>
                        </div>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: '#111827',
                        borderRight: '1px solid #e5e7eb',
                        boxSizing: 'border-box'
                      }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {stageData.stage.title || 'Untitled Phase'}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        fontSize: '12px', 
                        color: '#6b7280',
                        borderRight: '1px solid #e5e7eb',
                        boxSizing: 'border-box'
                      }}>
                        <span style={{ color: 'hsl(var(--muted-foreground))' }}>Add description...</span>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: '#111827',
                        textAlign: 'right',
                        borderRight: '1px solid #e5e7eb',
                        boxSizing: 'border-box'
                      }}>
                        {formatCurrency(stageTotal)}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: '#111827',
                        textAlign: 'right',
                        borderRight: '1px solid #e5e7eb',
                        boxSizing: 'border-box'
                      }}>
                        {formatCurrency(stageActualTotal)}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        textAlign: 'right',
                        borderRight: '1px solid #e5e7eb',
                        boxSizing: 'border-box'
                      }}>
                        <span style={{ color: (stageTotal - stageActualTotal) >= 0 ? '#059669' : '#dc2626' }}>
                          {formatCurrency(Math.abs(stageTotal - stageActualTotal))}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        fontSize: '12px', 
                        textAlign: 'center',
                        borderRight: '1px solid #e5e7eb',
                        boxSizing: 'border-box'
                      }}>
                        <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        fontSize: '12px', 
                        textAlign: 'center',
                        borderRight: '1px solid #e5e7eb',
                        boxSizing: 'border-box'
                      }}>
                        <span style={{ color: '#059669' }}>$0</span>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        fontSize: '12px', 
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}>
                        <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                      </td>
                    </tr>
                  );

                  if (isExpanded) {
                    // Components
                    stageData.components.forEach((component) => {
                      const budgeted = component.budgeted_cost || 0;
                      const actual = component.actual_cost || 0;
                      const isEditingBudgeted = editingCell?.taskId === component.id && editingCell?.field === 'budgeted_cost';
                      const isEditingActual = editingCell?.taskId === component.id && editingCell?.field === 'actual_cost';

                      rows.push(
                        <tr 
                          key={`component-${component.id}`} 
                          style={{ 
                            borderBottom: '1px solid #f3f4f6', 
                            backgroundColor: 'rgba(59, 130, 246, 0.1)' 
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                        >
                          <td style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px', 
                            color: '#374151',
                            fontFamily: 'monospace',
                            borderRight: '1px solid #f3f4f6',
                            boxSizing: 'border-box'
                          }}>
                            <div style={{ paddingLeft: '16px' }}>
                              {component.wbs_id}
                            </div>
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px', 
                            color: '#1f2937', 
                            fontWeight: '500',
                            borderRight: '1px solid #f3f4f6',
                            boxSizing: 'border-box'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                              <div style={{ width: '8px', height: '8px', backgroundColor: '#60a5fa', borderRadius: '50%', marginRight: '8px' }}></div>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {component.title || 'Untitled Component'}
                              </span>
                            </div>
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px', 
                            color: '#6b7280',
                            borderRight: '1px solid #f3f4f6',
                            boxSizing: 'border-box'
                          }}>
                            <span style={{ color: 'hsl(var(--muted-foreground))' }}>Add description...</span>
                          </td>
                          <td 
                            style={{ 
                              padding: '8px 12px', 
                              fontSize: '12px', 
                              color: '#111827',
                              textAlign: 'right',
                              cursor: 'pointer',
                              borderRight: '1px solid #f3f4f6',
                              boxSizing: 'border-box'
                            }}
                            onClick={() => handleCellClick(component.id, 'budgeted_cost', budgeted)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {isEditingBudgeted ? (
                              <Input 
                                type="number" 
                                value={editValue} 
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleCellSave}
                                style={{ width: '100%', fontSize: '12px', height: '24px', padding: '4px', textAlign: 'right' }}
                                autoFocus
                              />
                            ) : (
                              <span style={{ fontSize: '12px', fontWeight: '500' }}>{formatCurrency(budgeted)}</span>
                            )}
                          </td>
                          <td 
                            style={{ 
                              padding: '8px 12px', 
                              fontSize: '12px', 
                              color: '#111827',
                              textAlign: 'right',
                              cursor: 'pointer',
                              borderRight: '1px solid #f3f4f6',
                              boxSizing: 'border-box'
                            }}
                            onClick={() => handleCellClick(component.id, 'actual_cost', actual)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {isEditingActual ? (
                              <Input 
                                type="number" 
                                value={editValue} 
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleCellSave}
                                style={{ width: '100%', fontSize: '12px', height: '24px', padding: '4px', textAlign: 'right' }}
                                autoFocus
                              />
                            ) : (
                              <span style={{ fontSize: '12px', fontWeight: '500' }}>{formatCurrency(actual)}</span>
                            )}
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px',
                            textAlign: 'right',
                            borderRight: '1px solid #f3f4f6',
                            boxSizing: 'border-box'
                          }}>
                            <span style={{ color: (budgeted - actual) >= 0 ? '#059669' : '#dc2626' }}>
                              {formatCurrency(Math.abs(budgeted - actual))}
                            </span>
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px', 
                            textAlign: 'center',
                            borderRight: '1px solid #f3f4f6',
                            boxSizing: 'border-box'
                          }}>
                            <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px', 
                            textAlign: 'center',
                            borderRight: '1px solid #f3f4f6',
                            boxSizing: 'border-box'
                          }}>
                            <span style={{ color: '#059669' }}>$0</span>
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px', 
                            textAlign: 'center',
                            boxSizing: 'border-box'
                          }}>
                            <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                          </td>
                        </tr>
                      );
                    });

                    // Elements
                    stageData.elements.forEach((element) => {
                      const budgeted = element.budgeted_cost || 0;
                      const actual = element.actual_cost || 0;
                      const isEditingBudgeted = editingCell?.taskId === element.id && editingCell?.field === 'budgeted_cost';
                      const isEditingActual = editingCell?.taskId === element.id && editingCell?.field === 'actual_cost';

                      rows.push(
                        <tr 
                          key={`element-${element.id}`} 
                          style={{ 
                            borderBottom: '1px solid #f3f4f6', 
                            backgroundColor: 'rgba(34, 197, 94, 0.1)' 
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)'}
                        >
                          <td style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px', 
                            color: '#6b7280',
                            fontFamily: 'monospace',
                            borderRight: '1px solid #f3f4f6',
                            boxSizing: 'border-box'
                          }}>
                            <div style={{ paddingLeft: '32px' }}>
                              {element.wbs_id}
                            </div>
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px', 
                            color: '#374151',
                            borderRight: '1px solid #f3f4f6',
                            boxSizing: 'border-box'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '24px' }}>
                              <div style={{ width: '6px', height: '6px', backgroundColor: '#4ade80', borderRadius: '50%', marginRight: '8px' }}></div>
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={element.title}>
                                {element.title || 'Untitled Element'}
                              </div>
                            </div>
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px', 
                            color: '#6b7280',
                            borderRight: '1px solid #f3f4f6',
                            boxSizing: 'border-box'
                          }}>
                            <span style={{ color: 'hsl(var(--muted-foreground))' }}>Add description...</span>
                          </td>
                          <td 
                            style={{ 
                              padding: '8px 12px', 
                              fontSize: '12px', 
                              color: '#111827',
                              textAlign: 'right',
                              cursor: 'pointer',
                              borderRight: '1px solid #f3f4f6',
                              boxSizing: 'border-box'
                            }}
                            onClick={() => handleCellClick(element.id, 'budgeted_cost', budgeted)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {isEditingBudgeted ? (
                              <Input 
                                type="number" 
                                value={editValue} 
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleCellSave}
                                style={{ width: '100%', fontSize: '12px', height: '24px', padding: '4px', textAlign: 'right' }}
                                autoFocus
                              />
                            ) : (
                              <span style={{ fontSize: '12px' }}>{formatCurrency(budgeted)}</span>
                            )}
                          </td>
                          <td 
                            style={{ 
                              padding: '8px 12px', 
                              fontSize: '12px', 
                              color: '#111827',
                              textAlign: 'right',
                              cursor: 'pointer',
                              borderRight: '1px solid #f3f4f6',
                              boxSizing: 'border-box'
                            }}
                            onClick={() => handleCellClick(element.id, 'actual_cost', actual)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {isEditingActual ? (
                              <Input 
                                type="number" 
                                value={editValue} 
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleCellSave}
                                style={{ width: '100%', fontSize: '12px', height: '24px', padding: '4px', textAlign: 'right' }}
                                autoFocus
                              />
                            ) : (
                              <span style={{ fontSize: '12px' }}>{formatCurrency(actual)}</span>
                            )}
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px',
                            textAlign: 'right',
                            borderRight: '1px solid #f3f4f6',
                            boxSizing: 'border-box'
                          }}>
                            <span style={{ color: (budgeted - actual) >= 0 ? '#059669' : '#dc2626' }}>
                              {formatCurrency(Math.abs(budgeted - actual))}
                            </span>
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px', 
                            textAlign: 'center',
                            borderRight: '1px solid #f3f4f6',
                            boxSizing: 'border-box'
                          }}>
                            <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px', 
                            textAlign: 'center',
                            borderRight: '1px solid #f3f4f6',
                            boxSizing: 'border-box'
                          }}>
                            <span style={{ color: '#059669' }}>$0</span>
                          </td>
                          <td style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px', 
                            textAlign: 'center',
                            boxSizing: 'border-box'
                          }}>
                            <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
                          </td>
                        </tr>
                      );
                    });
                  }

                  return rows;
                })
            )}
          </tbody>

          {/* Table Footer with Totals */}
          <tfoot>
            <tr style={{ backgroundColor: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
              <td colSpan={3} style={{ 
                padding: '12px', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: '#374151',
                borderRight: '1px solid #e5e7eb',
                boxSizing: 'border-box'
              }}>
                Total
              </td>
              <td style={{ 
                padding: '12px', 
                fontSize: '12px', 
                fontWeight: '700', 
                color: '#111827',
                textAlign: 'right',
                borderRight: '1px solid #e5e7eb',
                boxSizing: 'border-box'
              }}>
                {formatCurrency(wbsItems.reduce((sum, item) => sum + (item.budgeted_cost || 0), 0))}
              </td>
              <td style={{ 
                padding: '12px', 
                fontSize: '12px', 
                fontWeight: '700', 
                color: '#111827',
                textAlign: 'right',
                borderRight: '1px solid #e5e7eb',
                boxSizing: 'border-box'
              }}>
                {formatCurrency(wbsItems.reduce((sum, item) => sum + (item.actual_cost || 0), 0))}
              </td>
              <td style={{ 
                padding: '12px', 
                fontSize: '12px', 
                fontWeight: '700', 
                color: '#111827',
                textAlign: 'right',
                borderRight: '1px solid #e5e7eb',
                boxSizing: 'border-box'
              }}>
                $0.00
              </td>
              <td style={{ 
                padding: '12px', 
                fontSize: '12px', 
                textAlign: 'center',
                borderRight: '1px solid #e5e7eb',
                boxSizing: 'border-box'
              }}>
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
              </td>
              <td style={{ 
                padding: '12px', 
                fontSize: '12px', 
                textAlign: 'center',
                borderRight: '1px solid #e5e7eb',
                boxSizing: 'border-box'
              }}>
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
              </td>
              <td style={{ 
                padding: '12px', 
                fontSize: '12px', 
                textAlign: 'center',
                boxSizing: 'border-box'
              }}>
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>-</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};