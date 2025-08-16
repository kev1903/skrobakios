import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, DollarSign, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "../ProjectSidebar";
import { getStatusColor, getStatusText as utilsGetStatusText } from "./utils";
import { useMenuBarSpacing } from "@/hooks/useMenuBarSpacing";

interface ProjectContractsPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

interface Contract {
  id: string;
  name: string;
  file_url: string;
  file_path: string;
  created_at: string;
  file_size: number;
  status: string;
  confidence: number;
  contract_data: any;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'expired':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'draft':
      return 'Draft';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
};

export const ProjectContractsPage = ({ project, onNavigate }: ProjectContractsPageProps) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { spacingClasses } = useMenuBarSpacing();

  const loadContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_contracts')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading contracts:', error);
        return;
      }

      setContracts(data || []);
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('project_contracts')
        .delete()
        .eq('id', contractId);

      if (error) {
        console.error('Error deleting contract:', error);
        toast.error("Failed to delete contract. Please try again.");
        return;
      }

      toast.success("Contract deleted successfully.");
      loadContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error("Failed to delete contract. Please try again.");
    }
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-AU');
    } catch {
      return 'Invalid date';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    loadContracts();
  }, [project.id]);

  if (loading) {
    return (
      <div className={`${spacingClasses} min-h-screen bg-background`}>
        <div className="relative h-full">
          <ProjectSidebar 
            project={project} 
            onNavigate={onNavigate}
            getStatusColor={getStatusColor}
            getStatusText={utilsGetStatusText}
          />
          <div className="w-full lg:ml-48 flex flex-col overflow-hidden">
            <div className="space-y-4 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${spacingClasses} min-h-screen bg-background`}>
      <div className="relative h-full">
        <ProjectSidebar 
          project={project} 
          onNavigate={onNavigate}
          getStatusColor={getStatusColor}
          getStatusText={utilsGetStatusText}
        />
        <div className="w-full lg:ml-48 flex flex-col overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Contracts</h2>
            <p className="text-muted-foreground">Manage project contracts and documentation.</p>
          </div>

          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Contracts Found</h3>
              <p className="text-muted-foreground">
                No contracts have been uploaded for this project yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">View</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Name</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">File Size</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                      <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contract.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(contract.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatFileSize(contract.file_size)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                          {Math.round((contract.confidence || 0) * 100)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Badge variant={getStatusBadgeVariant(contract.status)} className="text-xs">
                            {getStatusText(contract.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => window.open(contract.file_url, '_blank')}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Contract
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteContract(contract.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Contract
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};