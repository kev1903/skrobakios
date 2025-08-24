import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package, FileText, CheckSquare, Truck, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';
import { QuoteMatrix } from '@/components/procurement/QuoteMatrix';
import { EvaluationDashboard } from '@/components/procurement/EvaluationDashboard';
import { ApprovalQueue } from '@/components/procurement/ApprovalQueue';
import { CommitmentsRegister } from '@/components/procurement/CommitmentsRegister';
import { RFQForm } from '@/components/procurement/RFQForm';
import { VendorManagement } from '@/components/procurement/VendorManagement';

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

interface Project {
  id: string;
  name: string;
  project_id: string;
}

export const ProjectProcurementPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [activeTab, setActiveTab] = useState('matrix');
  const [showRFQForm, setShowRFQForm] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);

  useEffect(() => {
    if (projectId && currentCompany) {
      fetchProjectData();
      fetchRFQs();
    }
  }, [projectId, currentCompany]);

  const fetchProjectData = async () => {
    if (!projectId || !currentCompany) return;

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, name, project_id')
        .eq('id', projectId)
        .eq('company_id', currentCompany.id)
        .single();

      if (projectError) {
        console.error('Error fetching project:', projectError);
        toast.error('Failed to load project data');
        return;
      }

      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project data');
    }
  };

  const fetchRFQs = async () => {
    if (!projectId || !currentCompany) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rfqs')
        .select('*')
        .eq('project_id', projectId)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Project not found</h1>
            <p className="text-muted-foreground mt-2">The requested project could not be loaded.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Procurement</h1>
            <p className="text-muted-foreground mt-2">
              {project.name} ({project.project_id})
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowVendorForm(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
            <Button 
              onClick={() => setShowRFQForm(true)}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create RFQ
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {PROCUREMENT_STATUSES.slice(0, 10).map((status) => {
            const count = getRFQCountByStatus(status.key);
            const StatusIcon = status.icon;
            return (
              <Card key={status.key} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{status.label}</p>
                  <Badge variant="secondary" className={`${status.color} mt-2`}>
                    {status.key}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="matrix" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Quote Matrix
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Evaluation
            </TabsTrigger>
            <TabsTrigger value="approvals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Approvals
            </TabsTrigger>
            <TabsTrigger value="commitments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Commitments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matrix" className="space-y-6">
            <QuoteMatrix 
              projectId={projectId!} 
              rfqs={rfqs} 
              onRFQUpdate={fetchRFQs}
            />
          </TabsContent>

          <TabsContent value="evaluation" className="space-y-6">
            <EvaluationDashboard 
              projectId={projectId!} 
              rfqs={rfqs}
            />
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <ApprovalQueue 
              projectId={projectId!} 
              rfqs={rfqs}
            />
          </TabsContent>

          <TabsContent value="commitments" className="space-y-6">
            <CommitmentsRegister 
              projectId={projectId!}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* RFQ Form Modal */}
      {showRFQForm && (
        <RFQForm 
          projectId={projectId!}
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