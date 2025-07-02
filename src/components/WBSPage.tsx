import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Link as LinkIcon, Eye, ChevronRight, ChevronDown, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/hooks/useProjects';
import { useProjectMembers } from '@/hooks/useProjectMembers';

export interface WBSItem {
  id: string;
  wbsId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  budgetedCost?: number;
  actualCost?: number;
  progress?: number;
  parentId?: string;
  children: WBSItem[];
  linkedTasks: string[];
  level: number;
  isExpanded: boolean;
}

interface WBSPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const WBSPage = ({ project, onNavigate }: WBSPageProps) => {
  const { toast } = useToast();
  const { members } = useProjectMembers(project.id);
  const [wbsItems, setWBSItems] = useState<WBSItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    assignee: '',
    progress: '',
    startDate: '',
  });

  // Initialize with sample data
  useEffect(() => {
    const sampleWBS: WBSItem[] = [
      {
        id: '1',
        wbsId: '1.0',
        title: 'Site Preparation',
        description: 'Prepare construction site for building work',
        assignedTo: 'John Smith',
        startDate: '2024-07-01',
        endDate: '2024-07-15',
        duration: 14,
        budgetedCost: 25000,
        actualCost: 22000,
        progress: 90,
        children: [
          {
            id: '1.1',
            wbsId: '1.1',
            title: 'Site Survey',
            description: 'Conduct detailed site survey',
            assignedTo: 'Mike Johnson',
            startDate: '2024-07-01',
            endDate: '2024-07-05',
            duration: 5,
            budgetedCost: 8000,
            actualCost: 7500,
            progress: 100,
            parentId: '1',
            children: [],
            linkedTasks: [],
            level: 1,
            isExpanded: false,
          },
          {
            id: '1.2',
            wbsId: '1.2',
            title: 'Site Clearance',
            description: 'Clear vegetation and debris',
            assignedTo: 'Sarah Wilson',
            startDate: '2024-07-06',
            endDate: '2024-07-15',
            duration: 9,
            budgetedCost: 17000,
            actualCost: 14500,
            progress: 80,
            parentId: '1',
            children: [],
            linkedTasks: [],
            level: 1,
            isExpanded: false,
          }
        ],
        linkedTasks: [],
        level: 0,
        isExpanded: true,
      },
      {
        id: '2',
        wbsId: '2.0',
        title: 'Foundation Work',
        description: 'Foundation construction and concrete work',
        assignedTo: 'David Miller',
        startDate: '2024-07-16',
        endDate: '2024-08-15',
        duration: 30,
        budgetedCost: 75000,
        actualCost: 0,
        progress: 0,
        children: [],
        linkedTasks: [],
        level: 0,
        isExpanded: false,
      }
    ];
    setWBSItems(sampleWBS);
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (progress >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (progress >= 20) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const toggleExpanded = (id: string) => {
    const updateItems = (items: WBSItem[]): WBSItem[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children.length > 0) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };
    setWBSItems(updateItems(wbsItems));
  };

  const addChildItem = (parentId: string) => {
    const generateWBSId = (parent: WBSItem, siblings: WBSItem[]) => {
      const childCount = siblings.filter(item => item.parentId === parentId).length;
      return `${parent.wbsId}.${childCount + 1}`;
    };

    const newItem: WBSItem = {
      id: `${Date.now()}`,
      wbsId: '',
      title: 'New Work Package',
      description: '',
      assignedTo: '',
      startDate: '',
      endDate: '',
      duration: 0,
      budgetedCost: 0,
      actualCost: 0,
      progress: 0,
      parentId,
      children: [],
      linkedTasks: [],
      level: 0,
      isExpanded: false,
    };

    const updateItems = (items: WBSItem[]): WBSItem[] => {
      return items.map(item => {
        if (item.id === parentId) {
          newItem.wbsId = generateWBSId(item, [...item.children, newItem]);
          newItem.level = item.level + 1;
          return { 
            ...item, 
            children: [...item.children, newItem],
            isExpanded: true 
          };
        }
        if (item.children.length > 0) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };

    setWBSItems(updateItems(wbsItems));
    setEditingId(newItem.id);
  };

  const updateWBSItem = (id: string, updates: Partial<WBSItem>) => {
    const updateItems = (items: WBSItem[]): WBSItem[] => {
      return items.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          if (updates.startDate || updates.endDate) {
            updated.duration = calculateDuration(updated.startDate || '', updated.endDate || '');
          }
          return updated;
        }
        if (item.children.length > 0) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };
    setWBSItems(updateItems(wbsItems));
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
                {item.isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            <span className="text-sm font-mono text-gray-600">{item.wbsId}</span>
          </div>

          {/* Title */}
          <div className="col-span-2">
            {isEditing ? (
              <Input
                value={item.title}
                onChange={(e) => updateWBSItem(item.id, { title: e.target.value })}
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
                value={item.assignedTo}
                onValueChange={(value) => updateWBSItem(item.id, { assignedTo: value })}
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
              <span className="text-sm">{item.assignedTo}</span>
            )}
          </div>

          {/* Start Date */}
          <div className="col-span-1">
            {isEditing ? (
              <Input
                type="date"
                value={item.startDate}
                onChange={(e) => updateWBSItem(item.id, { startDate: e.target.value })}
                className="h-8 text-sm"
              />
            ) : (
              <span className="text-sm">{item.startDate}</span>
            )}
          </div>

          {/* End Date */}
          <div className="col-span-1">
            {isEditing ? (
              <Input
                type="date"
                value={item.endDate}
                onChange={(e) => updateWBSItem(item.id, { endDate: e.target.value })}
                className="h-8 text-sm"
              />
            ) : (
              <span className="text-sm">{item.endDate}</span>
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
                value={item.budgetedCost}
                onChange={(e) => updateWBSItem(item.id, { budgetedCost: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            ) : (
              <span className="text-sm">${item.budgetedCost?.toLocaleString()}</span>
            )}
          </div>

          {/* Actual Cost */}
          <div className="col-span-1">
            {isEditing ? (
              <Input
                type="number"
                value={item.actualCost}
                onChange={(e) => updateWBSItem(item.id, { actualCost: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            ) : (
              <span className="text-sm">${item.actualCost?.toLocaleString()}</span>
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
                onChange={(e) => updateWBSItem(item.id, { progress: Number(e.target.value) })}
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
        {item.isExpanded && item.children.map((child, childIndex) => 
          renderWBSItem(child, childIndex)
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
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
            <Button onClick={() => addChildItem('')} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Top Level</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-4">
          <Select value={filters.assignee} onValueChange={(value) => setFilters({...filters, assignee: value})}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Assignees</SelectItem>
              {members.map((member) => (
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
              <SelectItem value="">All Progress</SelectItem>
              <SelectItem value="0-25">0-25%</SelectItem>
              <SelectItem value="26-50">26-50%</SelectItem>
              <SelectItem value="51-75">51-75%</SelectItem>
              <SelectItem value="76-100">76-100%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* WBS Table Header */}
      <div className="bg-gray-100 border-b border-gray-200">
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
        {wbsItems.map((item, index) => renderWBSItem(item, index))}
      </div>
    </div>
  );
};