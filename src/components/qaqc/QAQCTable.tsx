import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Eye, Edit, Trash2, FileDown, Download, Archive, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { formatDate } from '@/utils/dateFormat';

interface QAQCTableProps {
  data: any[];
  type: 'checklists' | 'rfis' | 'issueReports' | 'issues' | 'defects' | 'inspections' | 'plans';
  isLoading?: boolean;
  onNavigate?: (page: string) => void;
  onDelete?: (id: string, type: string) => void;
  onRefresh?: () => void;
  onExportPDF?: (id: string, type: string) => void;
  onBulkAction?: (action: string, selectedIds: string[]) => void;
  selectedItems?: string[];
  setSelectedItems?: (items: string[]) => void;
}

const getStatusColor = (status: string, type: string) => {
  const statusMap: Record<string, string> = {
    // Common statuses
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    voided: 'bg-gray-400 text-gray-700',
    
    // RFI specific
    open: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    answered: 'bg-green-100 text-green-800',
    
    // Issues specific
    investigating: 'bg-orange-100 text-orange-800',
    resolved: 'bg-green-100 text-green-800',
    
    // Defects specific
    fixed: 'bg-blue-100 text-blue-800',
    verified: 'bg-green-100 text-green-800',
    
    // Inspections specific
    scheduled: 'bg-gray-100 text-gray-800',
    passed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    
    // Quality plans specific
    approved: 'bg-green-100 text-green-800',
    superseded: 'bg-gray-100 text-gray-800',
  };
  
  return statusMap[status] || 'bg-gray-100 text-gray-800';
};

const getPriorityColor = (priority: string) => {
  const priorityMap: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
    critical: 'bg-red-100 text-red-800',
  };
  
  return priorityMap[priority] || 'bg-gray-100 text-gray-800';
};

const getSeverityColor = (severity: string) => {
  const severityMap: Record<string, string> = {
    minor: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    major: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  
  return severityMap[severity] || 'bg-gray-100 text-gray-800';
};

export const QAQCTable = ({ 
  data, 
  type, 
  isLoading, 
  onNavigate, 
  onDelete, 
  onRefresh, 
  onExportPDF, 
  onBulkAction, 
  selectedItems = [], 
  setSelectedItems 
}: QAQCTableProps) => {

  const handleSelectAll = (checked: boolean) => {
    console.log('handleSelectAll called:', checked, 'data length:', data.length);
    if (checked) {
      setSelectedItems?.(data.map(item => item.id));
    } else {
      setSelectedItems?.([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    console.log('handleSelectItem called:', itemId, checked, 'current selectedItems:', selectedItems);
    if (checked) {
      setSelectedItems?.([...selectedItems, itemId]);
    } else {
      setSelectedItems?.(selectedItems.filter(id => id !== itemId));
    }
  };
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No records found. Create your first {type} item to get started.</p>
      </div>
    );
  }

  const renderColumns = () => {
    console.log('QAQCTable renderColumns - type:', type, 'data length:', data?.length);
    switch (type) {
      case 'checklists':
        return (
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
        );
      
      case 'issueReports':
        return (
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
        );
      
      case 'issues':
        return (
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedItems.length === data.length && data.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
        );
      
      case 'rfis':
        return (
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
        );
      
      case 'defects':
        return (
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
        );
      
      case 'inspections':
        return (
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Inspector</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
        );
      
      case 'plans':
        return (
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responsible Party</TableHead>
              <TableHead>Phase</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
        );
      
      default:
        return null;
    }
  };

  const renderRow = (item: any) => {
    switch (type) {
      case 'checklists':
        return (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <button 
                className="text-blue-600 hover:text-blue-800 hover:underline"
                onClick={() => onNavigate?.(`qaqc-checklist-detail?projectId=${item.project_id}&checklistId=${item.id}`)}
              >
                {item.checklist_number}
              </button>
            </TableCell>
            <TableCell>{item.title}</TableCell>
            <TableCell className="capitalize">{item.type}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(item.status, type)}>{item.status}</Badge>
            </TableCell>
            <TableCell>{item.assigned_to || '-'}</TableCell>
            <TableCell>{formatDate(item.due_date)}</TableCell>
            <TableCell>{formatDate(item.created_at)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-border shadow-lg z-50">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      
      case 'rfis':
        return (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <button 
                className="text-blue-600 hover:text-blue-800 hover:underline"
                onClick={() => onNavigate?.(`qaqc-rfi-detail?projectId=${item.project_id}&rfiId=${item.id}`)}
              >
                {item.rfi_number}
              </button>
            </TableCell>
            <TableCell>{item.title}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(item.status, type)}>{item.status}</Badge>
            </TableCell>
            <TableCell>{item.requested_by}</TableCell>
            <TableCell>{formatDate(item.due_date)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-border shadow-lg z-50">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      
      case 'issues':
        const isOverdue = item.due_date && new Date(item.due_date) < new Date() && item.status !== 'closed' && item.status !== 'resolved' && item.status !== 'voided';
        const isVoided = item.status === 'voided';
        
        if (isVoided) {
          return (
            <TableRow key={item.id} className="h-10 bg-gray-100">
              <TableCell className="py-1 px-2">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                />
              </TableCell>
              <TableCell className="font-medium py-1 px-2 text-gray-500">
                {item.auto_number || item.issue_number || '-'}
              </TableCell>
              <TableCell colSpan={4} className="py-1 px-2 text-gray-600 font-semibold italic">
                VOIDED
              </TableCell>
            </TableRow>
          );
        }
        
        return (
          <TableRow key={item.id} className={`h-10 ${isOverdue ? 'bg-red-50' : ''}`}>
            <TableCell className="py-1 px-2">
              <Checkbox
                checked={selectedItems.includes(item.id)}
                onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
              />
            </TableCell>
            <TableCell className="font-medium py-1 px-2">
              <button 
                className={`hover:underline ${isOverdue ? 'text-red-600 hover:text-red-800' : 'text-blue-600 hover:text-blue-800'}`}
                onClick={() => onNavigate?.(`qaqc-issue-report-detail?projectId=${item.project_id}&reportId=${item.report_id}`)}
              >
                {item.auto_number || item.issue_number || '-'}
              </button>
            </TableCell>
            <TableCell className="py-1 px-2">
              <button 
                className={`text-left hover:underline transition-colors ${isOverdue ? 'text-red-600 hover:text-red-700' : 'hover:text-blue-600'}`}
                onClick={() => onNavigate?.(`qaqc-issue-edit?projectId=${item.project_id}&issueId=${item.id}`)}
              >
                {item.title}
              </button>
            </TableCell>
            <TableCell className="py-1 px-2">
              <Badge className={getStatusColor(item.status, type)}>{item.status}</Badge>
            </TableCell>
            <TableCell className={`py-1 px-2 ${isOverdue ? 'text-red-600' : ''}`}>{item.assigned_to || '-'}</TableCell>
            <TableCell className={`py-1 px-2 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>{formatDate(item.due_date)}</TableCell>
            <TableCell className="py-1 px-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-border shadow-lg z-50">
                  <DropdownMenuItem onClick={() => onNavigate?.(`qaqc-issue-report-detail?projectId=${item.project_id}&reportId=${item.report_id}`)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate?.(`qaqc-issue-edit?projectId=${item.project_id}&issueId=${item.id}`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => onDelete?.(item.id, 'issue')}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      
      case 'issueReports':
        return (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <button 
                className="text-blue-600 hover:text-blue-800 hover:underline"
                onClick={() => onNavigate?.(`qaqc-issue-report-detail?projectId=${item.project_id}&reportId=${item.id}`)}
              >
                {item.title}
              </button>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(item.status, 'issues')}>{item.status || 'active'}</Badge>
            </TableCell>
            <TableCell>{formatDate(item.created_at)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-border shadow-lg z-50">
                  <DropdownMenuItem onClick={() => onNavigate?.(`qaqc-issue-report-detail?projectId=${item.project_id}&reportId=${item.id}`)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate?.(`qaqc-issue-report-edit?projectId=${item.project_id}&reportId=${item.id}`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExportPDF?.(item.id, 'issueReport')}>
                    <FileDown className="w-4 h-4 mr-2" />
                    Export PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => onDelete?.(item.id, 'issueReport')}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      
      
      case 'defects':
        return (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <button 
                className="text-blue-600 hover:text-blue-800 hover:underline"
                onClick={() => onNavigate?.(`qaqc-defect-detail?projectId=${item.project_id}&defectId=${item.id}`)}
              >
                {item.defect_number}
              </button>
            </TableCell>
            <TableCell>{item.title}</TableCell>
            <TableCell className="capitalize">{item.category}</TableCell>
            <TableCell>
              <Badge className={getSeverityColor(item.severity)}>{item.severity}</Badge>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(item.status, type)}>{item.status}</Badge>
            </TableCell>
            <TableCell>{item.location}</TableCell>
            <TableCell>{formatDate(item.created_at)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-border shadow-lg z-50">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      
      case 'inspections':
        return (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <button 
                className="text-blue-600 hover:text-blue-800 hover:underline"
                onClick={() => onNavigate?.(`qaqc-inspection-detail?projectId=${item.project_id}&inspectionId=${item.id}`)}
              >
                {item.inspection_number}
              </button>
            </TableCell>
            <TableCell>{item.title}</TableCell>
            <TableCell className="capitalize">{item.type?.replace('_', ' ') || '-'}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(item.status, type)}>{item.status}</Badge>
            </TableCell>
            <TableCell>{item.inspector_name}</TableCell>
            <TableCell>{formatDate(item.scheduled_date)}</TableCell>
            <TableCell>{formatDate(item.created_at)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-border shadow-lg z-50">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      
      case 'plans':
        return (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <button 
                className="text-blue-600 hover:text-blue-800 hover:underline"
                onClick={() => onNavigate?.(`qaqc-quality-plan-detail?projectId=${item.project_id}&planId=${item.id}`)}
              >
                {item.plan_number}
              </button>
            </TableCell>
            <TableCell>{item.title}</TableCell>
            <TableCell className="uppercase">{item.type}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(item.status, type)}>{item.status}</Badge>
            </TableCell>
            <TableCell>{item.responsible_party}</TableCell>
            <TableCell className="capitalize">{item.phase || '-'}</TableCell>
            <TableCell>{formatDate(item.created_at)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-border shadow-lg z-50">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        {renderColumns()}
        <TableBody>
          {data.map(renderRow)}
        </TableBody>
      </Table>
    </div>
  );
};