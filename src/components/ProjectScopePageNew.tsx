import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
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
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Project } from '@/hooks/useProjects';
import { useScreenSize } from '@/hooks/use-mobile';
import { useCompany } from '@/contexts/CompanyContext';
import { useWBS, WBSItem } from '@/hooks/useWBS';

interface ProjectScopePageNewProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectScopePageNew = ({ project, onNavigate }: ProjectScopePageNewProps) => {
  const { wbsItems, loading, error, createWBSItem, updateWBSItem, deleteWBSItem } = useWBS(project.id);
  const { currentCompany } = useCompany();
  const screenSize = useScreenSize();
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

  const getProgressColor = (progress?: number) => {
    if (!progress || progress === 0) return 'bg-muted';
    if (progress < 30) return 'bg-destructive';
    if (progress < 70) return 'bg-warning';
    return 'bg-success';
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
    await updateWBSItem(item.id, { is_expanded: !item.is_expanded });
  };

  const addNewStage = async () => {
    if (!currentCompany?.id) return;

    const stageCount = wbsItems.filter(item => item.level === 0).length;
    const wbsId = `${stageCount + 1}.0`;

    await createWBSItem({
      company_id: currentCompany.id,
      project_id: project.id,
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
    } as any);
  };

  const addNewComponent = async (parentStage: WBSItem) => {
    if (!currentCompany?.id) return;

    const componentCount = parentStage.children.length;
    const wbsId = `${parentStage.wbs_id.split('.')[0]}.${componentCount + 1}`;

    await createWBSItem({
      company_id: currentCompany.id,
      project_id: project.id,
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
    } as any);
  };

  const addNewElement = async (parentComponent: WBSItem) => {
    if (!currentCompany?.id) return;

    const elementCount = parentComponent.children.length;
    const wbsId = `${parentComponent.wbs_id}.${elementCount + 1}`;

    await createWBSItem({
      company_id: currentCompany.id,
      project_id: project.id,
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
    } as any);
  };

  const handleEdit = (item: WBSItem, field: string) => {
    setEditingItem({ id: item.id, field });
    setEditValue((item as any)[field] || '');
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    await updateWBSItem(editingItem.id, { [editingItem.field]: editValue });
    setEditingItem(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditValue('');
  };

  const renderElement = (element: WBSItem) => (
    <div
      key={element.id}
      className="ml-8 p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-lg">{getCategoryIcon(element.category)}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">{element.wbs_id}</span>
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
              <Badge className={getStatusColor(element.status)} variant="outline">
                {element.status}
              </Badge>
            </div>
            {element.description && (
              <p className="text-xs text-muted-foreground mt-1">{element.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Progress:</span>
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor(element.progress)} transition-all`}
                    style={{ width: `${element.progress || 0}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{element.progress || 0}%</span>
              </div>
              {element.assigned_to && (
                <span className="text-xs text-muted-foreground">
                  Assigned: {element.assigned_to}
                </span>
              )}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleEdit(element, 'title')}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => deleteWBSItem(element.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const renderComponent = (component: WBSItem) => (
    <div key={component.id} className="ml-4">
      <div className="p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpansion(component)}
              className="p-1"
            >
              {component.is_expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <span className="text-lg">{getCategoryIcon(component.category)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">{component.wbs_id}</span>
                {editingItem?.id === component.id && editingItem?.field === 'title' ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="text-base font-semibold"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="text-base font-semibold cursor-pointer hover:text-primary"
                    onClick={() => handleEdit(component, 'title')}
                  >
                    {component.title}
                  </span>
                )}
                <Badge className={getStatusColor(component.status)} variant="outline">
                  {component.status}
                </Badge>
              </div>
              {component.description && (
                <p className="text-sm text-muted-foreground mt-1">{component.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Progress:</span>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getProgressColor(component.progress)} transition-all`}
                      style={{ width: `${component.progress || 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{component.progress || 0}%</span>
                </div>
                {component.assigned_to && (
                  <span className="text-xs text-muted-foreground">
                    Assigned: {component.assigned_to}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNewElement(component)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Element
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleEdit(component, 'title')}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => deleteWBSItem(component.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {component.is_expanded && component.children.map(renderElement)}
    </div>
  );

  const renderStage = (stage: WBSItem) => (
    <div key={stage.id} className="mb-6">
      <div className="p-6 bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpansion(stage)}
              className="p-1"
            >
              {stage.is_expanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
            <span className="text-xl">{getCategoryIcon(stage.category)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-mono">{stage.wbs_id}</span>
                {editingItem?.id === stage.id && editingItem?.field === 'title' ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="text-lg font-bold"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="text-lg font-bold cursor-pointer hover:text-primary"
                    onClick={() => handleEdit(stage, 'title')}
                  >
                    {stage.title}
                  </span>
                )}
                <Badge className={getStatusColor(stage.status)} variant="outline">
                  {stage.status}
                </Badge>
              </div>
              {stage.description && (
                <p className="text-muted-foreground mt-1">{stage.description}</p>
              )}
              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Progress:</span>
                  <div className="w-24 h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getProgressColor(stage.progress)} transition-all`}
                      style={{ width: `${stage.progress || 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground font-semibold">{stage.progress || 0}%</span>
                </div>
                {stage.assigned_to && (
                  <span className="text-sm text-muted-foreground">
                    Lead: {stage.assigned_to}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {stage.children.length} component{stage.children.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => addNewComponent(stage)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Component
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleEdit(stage, 'title')}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => deleteWBSItem(stage.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {stage.is_expanded && (
        <div className="mt-4 space-y-4">
          {stage.children.map(renderComponent)}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen">
        <ProjectSidebar 
          project={project} 
          onNavigate={onNavigate}
          getStatusColor={getStatusColor}
          getStatusText={(status) => status}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project scope...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <ProjectSidebar 
          project={project} 
          onNavigate={onNavigate}
          getStatusColor={getStatusColor}
          getStatusText={(status) => status}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">Error loading project scope: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <ProjectSidebar 
        project={project} 
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={(status) => status}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Project Scope</h1>
              <p className="text-muted-foreground">
                Manage project stages, components, and elements from the single source of truth
              </p>
            </div>
            <Button onClick={addNewStage}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stage
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {wbsItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No project scope defined yet</p>
              <Button onClick={addNewStage}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Stage
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {wbsItems
                .filter(item => item.level === 0) // Only show root stages
                .map(renderStage)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};