import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Plus, Save, Download, Database, Building2, Settings, Users, FileText, TrendingUp, DollarSign, Calendar, Briefcase, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

interface BusinessMapPageProps {
  onNavigate: (page: string) => void;
}

interface CompanyModule {
  id: string;
  module_name: string;
  enabled: boolean;
}

// Module icons mapping
const moduleIcons = {
  projects: Briefcase,
  sales: TrendingUp,
  finance: DollarSign,
  dashboard: Database,
  'digital-twin': Database,
  'cost-contracts': DollarSign,
  tasks: Calendar,
  files: FileText,
  team: Users,
  'digital-objects': Database,
};

// Module colors for glass morphism effect
const moduleColors = {
  projects: 'from-blue-500/20 to-blue-600/30 border-blue-400/30',
  sales: 'from-green-500/20 to-green-600/30 border-green-400/30',
  finance: 'from-purple-500/20 to-purple-600/30 border-purple-400/30',
  dashboard: 'from-indigo-500/20 to-indigo-600/30 border-indigo-400/30',
  'digital-twin': 'from-cyan-500/20 to-cyan-600/30 border-cyan-400/30',
  'cost-contracts': 'from-orange-500/20 to-orange-600/30 border-orange-400/30',
  tasks: 'from-pink-500/20 to-pink-600/30 border-pink-400/30',
  files: 'from-yellow-500/20 to-yellow-600/30 border-yellow-400/30',
  team: 'from-red-500/20 to-red-600/30 border-red-400/30',
  'digital-objects': 'from-teal-500/20 to-teal-600/30 border-teal-400/30',
};

export const BusinessMapPage = ({ onNavigate }: BusinessMapPageProps) => {
  const { currentCompany } = useCompany();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [companyModules, setCompanyModules] = useState<CompanyModule[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch company modules from database
  useEffect(() => {
    const fetchCompanyModules = async () => {
      if (!currentCompany) return;

      try {
        const { data: modules, error } = await supabase
          .from('company_modules')
          .select('*')
          .eq('company_id', currentCompany.id);

        if (error) {
          console.error('Error fetching company modules:', error);
          toast.error('Failed to load business modules');
          return;
        }

        setCompanyModules(modules || []);
        generateBusinessMap(modules || []);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load business data');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyModules();
  }, [currentCompany]);

  const generateBusinessMap = useCallback((modules: CompanyModule[]) => {
    const enabledModules = modules.filter(m => m.enabled);
    const centerX = 400;
    const centerY = 300;
    const radius = 200;

    // Create company center node
    const companyNode: Node = {
      id: 'company-center',
      type: 'default',
      position: { x: centerX - 75, y: centerY - 30 },
      data: { 
        label: (
          <div className="flex items-center gap-2 p-3">
            <Building2 className="w-5 h-5 text-primary" />
            <div className="text-center">
              <div className="font-semibold text-sm">{currentCompany?.name}</div>
              <div className="text-xs text-muted-foreground">Business Core</div>
            </div>
          </div>
        )
      },
      style: { 
        background: 'rgba(59, 130, 246, 0.1)',
        border: '2px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        width: '150px',
        height: '70px',
      },
      draggable: false,
    };

    // Create module nodes in a circle around the company
    const moduleNodes: Node[] = enabledModules.map((module, index) => {
      const angle = (index / enabledModules.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle) - 60;
      const y = centerY + radius * Math.sin(angle) - 30;
      
      const Icon = moduleIcons[module.module_name as keyof typeof moduleIcons] || Database;

      return {
        id: module.id,
        type: 'default',
        position: { x, y },
        data: { 
          label: (
            <div className="flex items-center gap-2 p-3">
              <Icon className="w-4 h-4 text-foreground" />
              <div className="text-center">
                <div className="font-medium text-sm capitalize">{module.module_name.replace('-', ' ')}</div>
                <Badge variant="secondary" className="mt-1 text-xs">Active</Badge>
              </div>
            </div>
          )
        },
        style: { 
          background: 'rgba(255, 255, 255, 0.8)',
          border: '2px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          width: '140px',
          height: '70px',
        },
        draggable: true,
      };
    });

    // Create edges connecting all modules to the company center
    const moduleEdges: Edge[] = enabledModules.map((module) => ({
      id: `company-${module.id}`,
      source: 'company-center',
      target: module.id,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: 'rgba(59, 130, 246, 0.4)',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'rgba(59, 130, 246, 0.6)',
      },
    }));

    // Add interconnections between related modules
    const additionalEdges: Edge[] = [];
    const projectsModule = enabledModules.find(m => m.module_name === 'projects');
    const financeModule = enabledModules.find(m => m.module_name === 'finance');
    const salesModule = enabledModules.find(m => m.module_name === 'sales');
    const tasksModule = enabledModules.find(m => m.module_name === 'tasks');

    if (projectsModule && financeModule) {
      additionalEdges.push({
        id: `${projectsModule.id}-${financeModule.id}`,
        source: projectsModule.id,
        target: financeModule.id,
        type: 'smoothstep',
        style: { stroke: 'rgba(156, 163, 175, 0.3)', strokeWidth: 1 },
      });
    }

    if (salesModule && projectsModule) {
      additionalEdges.push({
        id: `${salesModule.id}-${projectsModule.id}`,
        source: salesModule.id,
        target: projectsModule.id,
        type: 'smoothstep',
        style: { stroke: 'rgba(156, 163, 175, 0.3)', strokeWidth: 1 },
      });
    }

    if (projectsModule && tasksModule) {
      additionalEdges.push({
        id: `${projectsModule.id}-${tasksModule.id}`,
        source: projectsModule.id,
        target: tasksModule.id,
        type: 'smoothstep',
        style: { stroke: 'rgba(156, 163, 175, 0.3)', strokeWidth: 1 },
      });
    }

    setNodes([companyNode, ...moduleNodes]);
    setEdges([...moduleEdges, ...additionalEdges]);
  }, [currentCompany]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const refreshData = useCallback(async () => {
    if (!currentCompany) return;

    setLoading(true);
    try {
      const { data: modules, error } = await supabase
        .from('company_modules')
        .select('*')
        .eq('company_id', currentCompany.id);

      if (error) {
        toast.error('Failed to refresh business modules');
        return;
      }

      setCompanyModules(modules || []);
      generateBusinessMap(modules || []);
      toast.success('Business map refreshed');
    } catch (error) {
      toast.error('Failed to refresh business data');
    } finally {
      setLoading(false);
    }
  }, [currentCompany, generateBusinessMap]);

  const saveMap = useCallback(() => {
    const mapData = { nodes, edges, companyId: currentCompany?.id };
    localStorage.setItem(`businessMap-${currentCompany?.id}`, JSON.stringify(mapData));
    toast.success('Business map saved successfully');
  }, [nodes, edges, currentCompany]);

  const exportMap = useCallback(() => {
    const mapData = { 
      company: currentCompany?.name,
      companyId: currentCompany?.id,
      modules: companyModules,
      nodes, 
      edges,
      exportedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(mapData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `business-map-${currentCompany?.name?.replace(/\s+/g, '-').toLowerCase()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Business map exported');
  }, [nodes, edges, currentCompany, companyModules]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading business map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('home')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {currentCompany?.name} Business Map
            </h1>
            <p className="text-sm text-muted-foreground">Interactive visualization of your business ecosystem</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
            className="hover:bg-muted"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveMap}
            className="hover:bg-muted"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Map
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportMap}
            className="hover:bg-muted"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Business Map Canvas */}
        <div className="w-full h-full relative border rounded-lg bg-background shadow-sm overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="bg-background"
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            panOnDrag={true}
            panOnScroll={true}
            panOnScrollSpeed={0.5}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={true}
            preventScrolling={true}
            minZoom={0.1}
            maxZoom={4}
            translateExtent={[[-5000, -5000], [5000, 5000]]}
            nodeExtent={[[-4500, -4500], [4500, 4500]]}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          >
            <Controls 
              className="bg-background border border-border rounded-lg shadow-lg"
              showZoom={true}
              showFitView={true}
              showInteractive={true}
            />
            <MiniMap 
              className="bg-background border border-border rounded-lg shadow-lg"
              nodeColor={(node) => {
                if (node.id === 'company-center') {
                  return '#3b82f6';
                }
                return '#60a5fa';
              }}
              nodeStrokeWidth={2}
              zoomable
              pannable
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={30} 
              size={2}
              className="text-muted-foreground/20"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Instructions Panel */}
      <Card className="absolute bottom-6 left-6 max-w-sm bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm text-foreground mb-2">Navigation Guide:</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Drag modules to reorganize your business map</li>
            <li>• Connect systems by dragging between connection points</li>
            <li>• Use zoom controls to explore the ecosystem</li>
            <li>• Central node represents your business core</li>
            <li>• Only active modules are displayed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};