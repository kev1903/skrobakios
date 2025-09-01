import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, MoreHorizontal, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { WBSItem } from '@/types/wbs';
import { format } from 'date-fns';

interface WBSScheduleTableProps {
  wbsItems: WBSItem[];
  onUpdateWBSItem: (id: string, updates: Partial<WBSItem>) => Promise<void>;
  onCreateWBSItem: (item: any) => Promise<void>;
  onDeleteWBSItem: (id: string) => Promise<void>;
  companyId: string;
  projectId: string;
}

export const WBSScheduleTable = ({ 
  wbsItems, 
  onUpdateWBSItem, 
  onCreateWBSItem, 
  onDeleteWBSItem,
  companyId,
  projectId
}: WBSScheduleTableProps) => {
  const [editingItem, setEditingItem] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Completed': return 'bg-success/10 text-success border-success/20';
      case 'In Progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'On Hold': return 'bg-warning/10 text-warning border-warning/20';
      case 'Not Started': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'Stage': return '📋';
      case 'Component': return '🔧';
      case 'Element': return '⚡';
      default: return '📄';
    }
  };

  const toggleExpansion = async (item: WBSItem) => {
    await onUpdateWBSItem(item.id, { is_expanded: !item.is_expanded });
  };

  const handleEdit = (item: WBSItem, field: string) => {
    setEditingItem({ id: item.id, field });
    setEditValue((item as any)[field] || '');
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    await onUpdateWBSItem(editingItem.id, { [editingItem.field]: editValue });
    setEditingItem(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditValue('');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d');
    } catch {
      return '-';
    }
  };

  const addNewStage = async () => {
    const stageCount = wbsItems.filter(item => item.level === 0).length;
    const wbsId = `${stageCount + 1}.0`;

    await onCreateWBSItem({
      company_id: companyId,
      project_id: projectId,
      parent_id: undefined,
      wbs_id: wbsId,
      title: 'New Stage',
      description: '',
      level: 0,
      category: 'Stage',
      status: 'Not Started',
      progress: 0,
      is_expanded: true,
      linked_tasks: []
    });
  };

  const addNewComponent = async (parentStage: WBSItem) => {
    const componentCount = parentStage.children.length;
    const wbsId = `${parentStage.wbs_id.split('.')[0]}.${componentCount + 1}`;

    await onCreateWBSItem({
      company_id: companyId,
      project_id: projectId,
      parent_id: parentStage.id,
      wbs_id: wbsId,
      title: 'New Component',
      description: '',
      level: 1,
      category: 'Component',
      status: 'Not Started',
      progress: 0,
      is_expanded: true,
      linked_tasks: []
    });
  };

  const addNewElement = async (parentComponent: WBSItem) => {
    const elementCount = parentComponent.children.length;
    const wbsId = `${parentComponent.wbs_id}.${elementCount + 1}`;

    await onCreateWBSItem({
      company_id: companyId,
      project_id: projectId,
      parent_id: parentComponent.id,
      wbs_id: wbsId,
      title: 'New Element',
      description: '',
      level: 2,
      category: 'Element',
      status: 'Not Started',
      progress: 0,
      is_expanded: false,
      linked_tasks: []
    });
  };

  const renderTableHeader = () => (
    <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
      <div className="col-span-1 flex items-center justify-center">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="col-span-1">WBS</div>
      <div className="col-span-4">Name</div>
      <div className="col-span-2">Start / End</div>
      <div className="col-span-2">Duration</div>
      <div className="col-span-2">Status</div>
    </div>
  );

  const renderElement = (element: WBSItem) => (
    <div key={element.id} className="grid grid-cols-12 gap-2 p-3 bg-card border-b border-border hover:bg-muted/30 transition-colors">
      <div className="col-span-1 flex items-center justify-center">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="col-span-1 flex items-center">
        <span className="text-xs text-muted-foreground font-mono">{element.wbs_id}</span>
      </div>
      <div className="col-span-4 flex items-center gap-2" style={{ marginLeft: '2rem' }}>
        <span className="text-lg">{getCategoryIcon(element.category)}</span>
        {editingItem?.id === element.id && editingItem?.field === 'title' ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            className="text-sm font-medium"
            autoFocus
          />
        ) : (
          <span 
            className="text-sm font-medium cursor-pointer hover:text-primary"
            onClick={() => handleEdit(element, 'title')}
          >
            {element.title}
          </span>
        )}
      </div>
      <div className="col-span-2 flex items-center text-xs text-muted-foreground">
        {formatDate(element.start_date)} / {formatDate(element.end_date)}
      </div>
      <div className="col-span-2 flex items-center text-xs text-muted-foreground">
        {element.duration || 0} days
      </div>
      <div className="col-span-2 flex items-center">
        <Badge className={getStatusColor(element.status)} variant="outline">
          {element.status}
        </Badge>
      </div>
    </div>
  );

  const renderComponent = (component: WBSItem) => (
    <div key={component.id}>
      <div className="grid grid-cols-12 gap-2 p-3 bg-card border-b border-border hover:bg-muted/30 transition-colors">
        <div className="col-span-1 flex items-center justify-center">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="col-span-1 flex items-center">
          <span className="text-xs text-muted-foreground font-mono">{component.wbs_id}</span>
        </div>
        <div className="col-span-4 flex items-center gap-2" style={{ marginLeft: '1rem' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleExpansion(component)}
            className="p-1 h-6 w-6"
          >
            {component.is_expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
          <span className="text-lg">{getCategoryIcon(component.category)}</span>
          {editingItem?.id === component.id && editingItem?.field === 'title' ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              className="text-sm font-semibold"
              autoFocus
            />
          ) : (
            <span 
              className="text-sm font-semibold cursor-pointer hover:text-primary"
              onClick={() => handleEdit(component, 'title')}
            >
              {component.title}
            </span>
          )}
        </div>
        <div className="col-span-2 flex items-center text-xs text-muted-foreground">
          {formatDate(component.start_date)} / {formatDate(component.end_date)}
        </div>
        <div className="col-span-2 flex items-center text-xs text-muted-foreground">
          {component.duration || 0} days
        </div>
        <div className="col-span-2 flex items-center">
          <Badge className={getStatusColor(component.status)} variant="outline">
            {component.status}
          </Badge>
        </div>
      </div>
      
      {component.is_expanded && component.children.map(renderElement)}
    </div>
  );

  const renderStage = (stage: WBSItem) => (
    <div key={stage.id}>
      <div className="grid grid-cols-12 gap-2 p-4 bg-muted/20 border-b border-border hover:bg-muted/40 transition-colors">
        <div className="col-span-1 flex items-center justify-center">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="col-span-1 flex items-center">
          <span className="text-sm text-muted-foreground font-mono font-semibold">{stage.wbs_id}</span>
        </div>
        <div className="col-span-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleExpansion(stage)}
            className="p-1 h-6 w-6"
          >
            {stage.is_expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <span className="text-xl">{getCategoryIcon(stage.category)}</span>
          {editingItem?.id === stage.id && editingItem?.field === 'title' ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              className="text-base font-bold"
              autoFocus
            />
          ) : (
            <span 
              className="text-base font-bold cursor-pointer hover:text-primary"
              onClick={() => handleEdit(stage, 'title')}
            >
              {stage.title}
            </span>
          )}
        </div>
        <div className="col-span-2 flex items-center text-sm text-muted-foreground">
          {formatDate(stage.start_date)} / {formatDate(stage.end_date)}
        </div>
        <div className="col-span-2 flex items-center text-sm text-muted-foreground">
          {stage.duration || 0} days
        </div>
        <div className="col-span-2 flex items-center">
          <Badge className={getStatusColor(stage.status)} variant="outline">
            {stage.status}
          </Badge>
        </div>
      </div>
      
      {stage.is_expanded && (
        <div>
          {stage.children.map(renderComponent)}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Work Breakdown Structure</h3>
          <Button onClick={addNewStage} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Stage
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        {renderTableHeader()}
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
          {wbsItems.map(renderStage)}
        </div>
      </div>
    </div>
  );
};