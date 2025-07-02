import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Link as LinkIcon, Eye, ChevronRight, ChevronDown, Edit2, Save, X, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/hooks/useProjects';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import { useWBS, WBSItem } from '@/hooks/useWBS';

interface WBSPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const WBSPage = ({ project, onNavigate }: WBSPageProps) => {
  const { toast } = useToast();
  const { members } = useProjectMembers(project.id);
  const { wbsItems, loading, createWBSItem, updateWBSItem, deleteWBSItem, generateWBSId, calculateDuration, findWBSItem } = useWBS(project.id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    assignee: 'all',
    progress: 'all',
    startDate: '',
  });

  // Remove the sample data initialization since we're using the database hook

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (progress >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (progress >= 20) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const toggleExpanded = async (id: string) => {
    const item = findWBSItem(id);
    if (item) {
      await updateWBSItem(id, { is_expanded: !item.is_expanded });
    }
  };


  const addChildItem = async (parentId?: string) => {
    const newWBSId = generateWBSId(parentId);
    const parentItem = parentId ? findWBSItem(parentId) : null;
    
    const newItem = {
      project_id: project.id,
      parent_id: parentId,
      wbs_id: newWBSId,
      title: 'New Work Package',
      description: '',
      assigned_to: '',
      start_date: '',
      end_date: '',
      duration: 0,
      budgeted_cost: 0,
      actual_cost: 0,
      progress: 0,
      level: parentItem ? parentItem.level + 1 : 0,
      is_expanded: false,
      linked_tasks: [],
    };

    const createdItem = await createWBSItem(newItem);
    if (createdItem) {
      setEditingId(createdItem.id);
      toast({
        title: "WBS Item Created",
        description: "New work package has been added to the WBS.",
      });
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<WBSItem>) => {
    // Calculate duration if dates are updated
    if (updates.start_date || updates.end_date) {
      const item = findWBSItem(id);
      if (item) {
        const startDate = updates.start_date || item.start_date || '';
        const endDate = updates.end_date || item.end_date || '';
        updates.duration = calculateDuration(startDate, endDate);
      }
    }
    
    await updateWBSItem(id, updates);
  };

  const handleDeleteItem = async (id: string) => {
    await deleteWBSItem(id);
    toast({
      title: "WBS Item Deleted",
      description: "Work package has been removed from the WBS.",
    });
  };

  const renderWBSItem = (item: WBSItem, index: number) => {
    const isEditing = editingId === item.id;
    const hasChildren = item.children.length > 0;

    return (
      <div key={item.id} className="animate-fade-in">
        <div 
          className={`grid grid-cols-12 gap-2 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
            item.level > 0 ? 'bg-gray-25' : ''
          }`}
          style={{ paddingLeft: `${item.level * 24 + 12}px` }}
        >
          {/* WBS ID & Expand/Collapse */}
          <div className="col-span-1 flex items-center space-x-2">
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(item.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {item.is_expanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            <span className="text-sm font-mono text-gray-600">{item.wbs_id}</span>
          </div>

          {/* Title */}
          <div className="col-span-2">
            {isEditing ? (
              <Input
                value={item.title}
                onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                className="h-8 text-sm"
              />
            ) : (
              <span className="text-sm font-medium">{item.title}</span>
            )}
          </div>

          {/* Assigned To */}
          <div className="col-span-1">
            {isEditing ? (
              <Select
                value={item.assigned_to}
                onValueChange={(value) => handleUpdateItem(item.id, { assigned_to: value })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.email} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-sm">{item.assigned_to}</span>
            )}
          </div>

          {/* Start Date */}
          <div className="col-span-1">
            {isEditing ? (
              <Input
                type="date"
                value={item.start_date}
                onChange={(e) => handleUpdateItem(item.id, { start_date: e.target.value })}
                className="h-8 text-sm"
              />
            ) : (
              <span className="text-sm">{item.start_date}</span>
            )}
          </div>

          {/* End Date */}
          <div className="col-span-1">
            {isEditing ? (
              <Input
                type="date"
                value={item.end_date}
                onChange={(e) => handleUpdateItem(item.id, { end_date: e.target.value })}
                className="h-8 text-sm"
              />
            ) : (
              <span className="text-sm">{item.end_date}</span>
            )}
          </div>

          {/* Duration */}
          <div className="col-span-1">
            <span className="text-sm text-gray-600">{item.duration}d</span>
          </div>

          {/* Budgeted Cost */}
          <div className="col-span-1">
            {isEditing ? (
              <Input
                type="number"
                value={item.budgeted_cost}
                onChange={(e) => handleUpdateItem(item.id, { budgeted_cost: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            ) : (
              <span className="text-sm">${item.budgeted_cost?.toLocaleString()}</span>
            )}
          </div>

          {/* Actual Cost */}
          <div className="col-span-1">
            {isEditing ? (
              <Input
                type="number"
                value={item.actual_cost}
                onChange={(e) => handleUpdateItem(item.id, { actual_cost: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            ) : (
              <span className="text-sm">${item.actual_cost?.toLocaleString()}</span>
            )}
          </div>

          {/* Progress */}
          <div className="col-span-1">
            {isEditing ? (
              <Input
                type="number"
                min="0"
                max="100"
                value={item.progress}
                onChange={(e) => handleUpdateItem(item.id, { progress: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            ) : (
              <Badge variant="outline" className={`text-xs ${getProgressColor(item.progress || 0)}`}>
                {item.progress}%
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="col-span-2 flex items-center space-x-1">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={() => setEditingId(null)}
                  className="h-7 px-2"
                >
                  <Save className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingId(null)}
                  className="h-7 px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingId(item.id)}
                  className="h-7 px-2"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => addChildItem(item.id)}
                  className="h-7 px-2"
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                >
                  <LinkIcon className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Render children if expanded */}
        {item.is_expanded && item.children.map((child, childIndex) => 
          renderWBSItem(child, childIndex)
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('project-detail')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Project</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Work Breakdown Structure</h1>
              <p className="text-gray-600">{project.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => addChildItem()} 
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Top Level WBS</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <Select value={filters.assignee} onValueChange={(value) => setFilters({...filters, assignee: value})}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {members.filter(member => member.name && member.name.trim() !== '').map((member) => (
                <SelectItem key={member.email} value={member.name}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.progress} onValueChange={(value) => setFilters({...filters, progress: value})}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by progress" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Progress</SelectItem>
              <SelectItem value="0-25">0-25%</SelectItem>
              <SelectItem value="26-50">26-50%</SelectItem>
              <SelectItem value="51-75">51-75%</SelectItem>
              <SelectItem value="76-100">76-100%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* WBS Table Header */}
      <div className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
        <div className="grid grid-cols-12 gap-2 p-3 text-sm font-medium text-gray-700">
          <div className="col-span-1">WBS ID</div>
          <div className="col-span-2">Title</div>
          <div className="col-span-1">Assigned To</div>
          <div className="col-span-1">Start Date</div>
          <div className="col-span-1">End Date</div>
          <div className="col-span-1">Duration</div>
          <div className="col-span-1">Budget</div>
          <div className="col-span-1">Actual</div>
          <div className="col-span-1">Progress</div>
          <div className="col-span-2">Actions</div>
        </div>
      </div>

      {/* WBS Content */}
      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading WBS items...</div>
          </div>
        ) : wbsItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-lg font-medium">No WBS items found</div>
            <div className="text-sm mt-1">Click "Add Top Level WBS" to get started</div>
          </div>
        ) : (
          wbsItems.map((item, index) => renderWBSItem(item, index))
        )}
      </div>
    </div>
  );
};