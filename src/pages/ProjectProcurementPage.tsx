import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package, FileText, CheckSquare, Truck, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { getStatusColor, getStatusText } from '@/components/tasks/utils/taskUtils';
import { Project } from '@/hooks/useProjects';
import { QuoteMatrix } from '@/components/procurement/QuoteMatrix';
import { RFQDashboard } from '@/components/procurement/RFQDashboard';
import { EvaluationDashboard } from '@/components/procurement/EvaluationDashboard';
import { ApprovalQueue } from '@/components/procurement/ApprovalQueue';
import { CommitmentsRegister } from '@/components/procurement/CommitmentsRegister';
import { RFQForm } from '@/components/procurement/RFQForm';
import { VendorManagement } from '@/components/procurement/VendorManagement';
import { projectCache } from '@/utils/projectCache';

const PROCUREMENT_STATUSES = [
  { key: 'RFQ Draft', label: 'RFQ Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  { key: 'RFQ Issued', label: 'RFQ Issued', color: 'bg-blue-100 text-blue-800', icon: Package },
  { key: 'Partially Received', label: 'Partially Received', color: 'bg-yellow-100 text-yellow-800', icon: Package },
  { key: 'Fully Received', label: 'Fully Received', color: 'bg-orange-100 text-orange-800', icon: Package },
  { key: 'Under Evaluation', label: 'Under Evaluation', color: 'bg-purple-100 text-purple-800', icon: CheckSquare },
  { key: 'Recommended', label: 'Recommended', color: 'bg-indigo-100 text-indigo-800', icon: CheckSquare },
  { key: 'Approved', label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckSquare },
  { key: 'Committed', label: 'Committed', color: 'bg-emerald-100 text-emerald-800', icon: ShoppingBag },
  { key: 'In Delivery', label: 'In Delivery', color: 'bg-cyan-100 text-cyan-800', icon: Truck },
  { key: 'Closed', label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckSquare },
  { key: 'On Hold', label: 'On Hold', color: 'bg-amber-100 text-amber-800', icon: Package },
  { key: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: Package },
  { key: 'Not Proceeding', label: 'Not Proceeding', color: 'bg-red-100 text-red-800', icon: Package },
];

interface RFQ {
  id: string;
  rfq_number: string;
  work_package: string;
  trade_category: string;
  scope_summary?: string;
  status: string;
  due_date?: string;
  created_at: string;
}

export const ProjectProcurementPage = () => {
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const resolvedProjectId = routeProjectId || searchParams.get('projectId') || '';
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [activeTab, setActiveTab] = useState('matrix');
  const [showRFQForm, setShowRFQForm] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);

  // Navigation handler for ProjectSidebar - Use client-side navigation instead of page reload
  const handleNavigate = (page: string) => {
    if (page === 'projects') {
      // Navigate to projects list without projectId
      const search = new URLSearchParams();
      search.set('page', 'projects');
      const newUrl = `${window.location.pathname}?${search.toString()}`;
      window.history.pushState({}, '', newUrl);
      window.location.reload(); // Only projects page needs reload to reset state
      return;
    }
    
    // Handle client-side navigation
    let targetPage = page;
    const search = new URLSearchParams(window.location.search);
    
    if (page.includes('?')) {
      const [pageName, queryString] = page.split('?');
      targetPage = pageName;
      const params = new URLSearchParams(queryString);
      params.forEach((value, key) => {
        search.set(key, value);
      });
    }
    
    // Always preserve projectId for seamless navigation
    search.set('page', targetPage);
    if (resolvedProjectId) {
      search.set('projectId', resolvedProjectId);
    }
    
    // Use pushState for instant navigation without reload
    const newUrl = `${window.location.pathname}?${search.toString()}`;
    window.history.pushState({}, '', newUrl);
    
    // Trigger page change without reload
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    if (resolvedProjectId && currentCompany) {
      // Only fetch if we don't have the project data or if projectId changed
      if (!project || project.id !== resolvedProjectId) {
        fetchProjectData();
      }
      fetchRFQs();
    }
  }, [resolvedProjectId, currentCompany]);

  const fetchProjectData = async () => {
    if (!resolvedProjectId || !currentCompany) return;

    // Check cache first for instant navigation
    const cachedProject = projectCache.get(resolvedProjectId);
    if (cachedProject && cachedProject.company_id === currentCompany.id) {
      setProject(cachedProject);
      return;
    }

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, name, project_id, company_id, status, created_at, updated_at')
        .eq('id', resolvedProjectId)
        .eq('company_id', currentCompany.id)
        .single();

      if (projectError) {
        console.error('Error fetching project:', projectError);
        toast.error('Failed to load project data');
        return;
      }

      // Cache the project data for future navigations
      projectCache.set(resolvedProjectId, projectData);
      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project data');
    }
  };

  const fetchRFQs = async () => {
    if (!resolvedProjectId || !currentCompany) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rfqs')
        .select('*')
        .eq('project_id', resolvedProjectId)
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching RFQs:', error);
        toast.error('Failed to load RFQ data');
        return;
      }

      setRFQs(data || []);
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      toast.error('Failed to load RFQ data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return PROCUREMENT_STATUSES.find(s => s.key === status) || PROCUREMENT_STATUSES[0];
  };

  const getRFQCountByStatus = (status: string) => {
    return rfqs.filter(rfq => rfq.status === status).length;
  };

  const handleRFQCreated = () => {
    setShowRFQForm(false);
    fetchRFQs();
    toast.success('RFQ created successfully');
  };

  if (loading || !currentCompany) {
    return (
      <div className="h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse space-y-6 w-full max-w-md">
            <div className="h-8 bg-muted rounded w-64 mx-auto"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show proper loading state while project is being fetched
  if (!project && resolvedProjectId && currentCompany) {
    return (
      <div className="h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project && !loading) {
    return (
      <div className="h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Project not found</h1>
            <p className="text-muted-foreground mt-2">The requested project could not be loaded.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={handleNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="procurement"
      />

      {/* Main Content - Fixed positioning to match Task Page */}
      <div className="fixed left-40 right-0 top-[var(--header-height)] bottom-0 overflow-hidden bg-gradient-to-br from-background to-muted/20">
        <div className="h-full w-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-border/30 bg-white/80 backdrop-blur-xl shadow-glass">
            <div className="px-8 py-6">
              {/* Luxury Navigation Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="inline-flex items-center gap-1 bg-white/80 border border-border/30 rounded-xl p-1 shadow-glass">
                  <TabsTrigger 
                    value="matrix" 
                    className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-accent/50"
                  >
                    Quote Matrix
                  </TabsTrigger>
                  <TabsTrigger 
                    value="approvals" 
                    className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-accent/50"
                  >
                    Approvals
                  </TabsTrigger>
                  <TabsTrigger 
                    value="commitments" 
                    className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-accent/50"
                  >
                    Commitments
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Content Area with Glass Morphism */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="matrix" className="mt-0">
                  <RFQDashboard 
                    projectId={resolvedProjectId}
                  />
                </TabsContent>

                <TabsContent value="approvals" className="mt-0">
                  <ApprovalQueue 
                    projectId={resolvedProjectId} 
                    rfqs={rfqs}
                  />
                </TabsContent>

                <TabsContent value="commitments" className="mt-0">
                  <CommitmentsRegister 
                    projectId={resolvedProjectId}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* RFQ Form Modal */}
      {showRFQForm && (
        <RFQForm 
          projectId={resolvedProjectId}
          companyId={currentCompany!.id}
          onSuccess={handleRFQCreated}
          onCancel={() => setShowRFQForm(false)}
        />
      )}

      {/* Vendor Management Modal */}
      {showVendorForm && (
        <VendorManagement 
          companyId={currentCompany!.id}
          onClose={() => setShowVendorForm(false)}
        />
      )}
    </div>
  );
};