import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
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
import { useWBS } from '@/hooks/useWBS';
import { WBSItem } from '@/types/wbs';
import { toast } from 'sonner';

interface ProjectScopePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectScopePage = ({ project, onNavigate }: ProjectScopePageProps) => {
  const { wbsItems, loading, error, deleteWBSItem, updateWBSItem, loadWBSItems } = useWBS(project.id);
  const screenSize = useScreenSize();
  const [editingItem, setEditingItem] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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
      case 'Element': return '📝';
      default: return '📄';
    }
  };

  const handleDelete = async (itemId: string, type: string) => {
    try {
      await deleteWBSItem(itemId);
      toast.success(`${type} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error(`Failed to delete ${type}. Please try again.`);
    }
  };

  const handleContextMenuAction = async (action: string, itemId: string, type: string) => {
    switch (action) {
      case 'delete':
        await handleDelete(itemId, type);
        break;
      case 'edit':
        const item = wbsItems.find(item => item.id === itemId);
        if (item) {
          setEditingItem({ id: itemId, field: 'title' });
          setEditValue(item.title || '');
        }
        break;
    }
  };

  // Build hierarchy from flat WBS items
  const buildHierarchy = (items: WBSItem[]): WBSItem[] => {
    const itemMap = new Map<string, WBSItem>();
    const rootItems: WBSItem[] = [];

    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    items.forEach(item => {
      const itemWithChildren = itemMap.get(item.id);
      if (!itemWithChildren) return;

      if (item.parent_id && itemMap.has(item.parent_id)) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(itemWithChildren);
        }
      } else {
        rootItems.push(itemWithChildren);
      }
    });

    return rootItems;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <ProjectSidebar 
          project={project} 
          onNavigate={onNavigate}
          getStatusColor={getStatusColor}
          getStatusText={(status) => status}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const hierarchicalItems = buildHierarchy(wbsItems);
  const stages = hierarchicalItems.filter(item => item.category === 'Stage');

  return (
    <div className="flex h-screen bg-background">
      <ProjectSidebar 
        project={project} 
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={(status) => status}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card">
          <div>
            <h1 className="text-2xl font-bold">Project Scope</h1>
            <p className="text-muted-foreground">{project.name}</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {/* Table Header - Sticky */}
          <div className="bg-muted/30 border-b border-border sticky top-0 z-10">
            <div className="px-6 py-3">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-2">WBS</div>
                <div className="col-span-3">NAME</div>
                <div className="col-span-3">DESCRIPTION</div>
                <div className="col-span-1">STATUS</div>
                <div className="col-span-2">PROGRESS</div>
                <div className="col-span-1">ACTIONS</div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="px-6 py-4">
            {stages.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <span className="text-6xl">📋</span>
                </div>
                <h3 className="text-lg font-medium mb-2">No project scope defined</h3>
                <p className="text-muted-foreground mb-6">
                  Start by creating your first project stage to organize your work breakdown structure.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {stages.map((stage) => (
                  <div key={stage.id} className="space-y-2">
                    {/* Stage Row */}
                    <div className="grid grid-cols-12 gap-4 p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="col-span-2 flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateWBSItem(stage.id, { is_expanded: !stage.is_expanded })}
                          className="p-1 h-6 w-6"
                        >
                          {stage.is_expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                        <span className="text-sm font-medium">{stage.wbs_id}</span>
                      </div>
                      
                      <div className="col-span-3">
                        <span className="text-sm font-medium">{stage.title || 'Untitled Stage'}</span>
                      </div>
                      
                      <div className="col-span-3">
                        <span className="text-sm text-muted-foreground">{stage.description || '-'}</span>
                      </div>
                      
                      <div className="col-span-1">
                        <Badge className={getStatusColor(stage.status)}>{stage.status || 'Not Started'}</Badge>
                      </div>
                      
                      <div className="col-span-2 flex items-center gap-2">
                        <span className="text-sm">{stage.progress || 0}%</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[80px]">
                          <div 
                            className={`h-full ${getProgressColor(stage.progress)} transition-all duration-300`}
                            style={{ width: `${stage.progress || 0}%` }}
                          />
                        </div>
                        {stage.assigned_to && (
                          <span className="text-xs text-muted-foreground">{stage.assigned_to}</span>
                        )}
                      </div>
                      
                      <div className="col-span-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleContextMenuAction('edit', stage.id, 'Stage')}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleContextMenuAction('delete', stage.id, 'Stage')}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Components */}
                    {stage.is_expanded && stage.children && stage.children.length > 0 && (
                      <div className="ml-8 space-y-2">
                        {stage.children.map((component) => (
                          <div key={component.id} className="space-y-2">
                            {/* Component Row */}
                            <div className="grid grid-cols-12 gap-4 p-3 bg-muted/30 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="col-span-2 flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateWBSItem(component.id, { is_expanded: !component.is_expanded })}
                                  className="p-1 h-5 w-5"
                                >
                                  {component.is_expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                </Button>
                                <span className="text-sm">{component.wbs_id}</span>
                              </div>
                              
                              <div className="col-span-3">
                                <span className="text-sm">{component.title || 'Untitled Component'}</span>
                              </div>
                              
                              <div className="col-span-3">
                                <span className="text-sm text-muted-foreground">{component.description || '-'}</span>
                              </div>
                              
                              <div className="col-span-1">
                                <Badge className={getStatusColor(component.status)}>{component.status || 'Not Started'}</Badge>
                              </div>
                              
                              <div className="col-span-2 flex items-center gap-2">
                                <span className="text-sm">{component.progress || 0}%</span>
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[80px]">
                                  <div 
                                    className={`h-full ${getProgressColor(component.progress)} transition-all duration-300`}
                                    style={{ width: `${component.progress || 0}%` }}
                                  />
                                </div>
                                {component.assigned_to && (
                                  <span className="text-xs text-muted-foreground">{component.assigned_to}</span>
                                )}
                              </div>
                              
                              <div className="col-span-1">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleContextMenuAction('edit', component.id, 'Component')}>
                                      <Edit2 className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleContextMenuAction('delete', component.id, 'Component')}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {/* Elements */}
                            {component.is_expanded && component.children && component.children.length > 0 && (
                              <div className="ml-8 space-y-1">
                                {component.children.map((element) => (
                                  <div key={element.id} className="grid grid-cols-12 gap-4 p-3 bg-background border border-border rounded-lg hover:bg-muted/20 transition-colors">
                                    <div className="col-span-2 flex items-center">
                                      <span className="text-sm">{element.wbs_id}</span>
                                    </div>
                                    
                                    <div className="col-span-3">
                                      <span className="text-sm">{element.title || 'Untitled Element'}</span>
                                    </div>
                                    
                                    <div className="col-span-3">
                                      <span className="text-sm text-muted-foreground">{element.description || '-'}</span>
                                    </div>
                                    
                                    <div className="col-span-1">
                                      <Badge className={getStatusColor(element.status)}>{element.status || 'Not Started'}</Badge>
                                    </div>
                                    
                                    <div className="col-span-2 flex items-center gap-2">
                                      <span className="text-sm">{element.progress || 0}%</span>
                                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[80px]">
                                        <div 
                                          className={`h-full ${getProgressColor(element.progress)} transition-all duration-300`}
                                          style={{ width: `${element.progress || 0}%` }}
                                        />
                                      </div>
                                      {element.assigned_to && (
                                        <span className="text-xs text-muted-foreground">{element.assigned_to}</span>
                                      )}
                                    </div>
                                    
                                    <div className="col-span-1">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => handleContextMenuAction('edit', element.id, 'Element')}>
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem 
                                            onClick={() => handleContextMenuAction('delete', element.id, 'Element')}
                                            className="text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};