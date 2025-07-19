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
import { ArrowLeft, Plus, Save, Download, Database, Building2, Settings, Users, FileText, TrendingUp, DollarSign, Calendar, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
          <div className="flex items-center gap-2 p-2">
            <Building2 className="w-5 h-5 text-primary" />
            <div className="text-center">
              <div className="font-semibold text-sm">{currentCompany?.name}</div>
              <div className="text-xs text-muted-foreground">Business Core</div>
            </div>
          </div>
        )
      },
      style: { 
        background: 'linear-gradient(135deg, hsl(var(--primary))/20, hsl(var(--primary))/30)',
        border: '2px solid hsl(var(--primary))/40',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        width: '150px',
        height: '60px',
      },
      draggable: false,
    };

    // Create module nodes in a circle around the company
    const moduleNodes: Node[] = enabledModules.map((module, index) => {
      const angle = (index / enabledModules.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle) - 60;
      const y = centerY + radius * Math.sin(angle) - 30;
      
      const Icon = moduleIcons[module.module_name as keyof typeof moduleIcons] || Database;
      const colorClass = moduleColors[module.module_name as keyof typeof moduleColors] || 'from-gray-500/20 to-gray-600/30 border-gray-400/30';

      return {
        id: module.id,
        type: 'default',
        position: { x, y },
        data: { 
          label: (
            <div className="flex items-center gap-2 p-3">
              <Icon className="w-4 h-4 text-white" />
              <div className="text-center">
                <div className="font-medium text-sm capitalize text-white">{module.module_name.replace('-', ' ')}</div>
                <Badge variant="secondary" className="mt-1 text-xs">Active</Badge>
              </div>
            </div>
          )
        },
        style: { 
          background: `linear-gradient(135deg, ${colorClass.split(' ')[0].replace('from-', '').replace('/20', '/30')}, ${colorClass.split(' ')[1].replace('to-', '').replace('/30', '/40')})`,
          border: `2px solid ${colorClass.split(' ')[2].replace('border-', '').replace('/30', '/50')}`,
          borderRadius: '12px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          width: '120px',
          height: '60px',
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
        stroke: 'hsl(var(--primary))/40',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'hsl(var(--primary))/60',
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
        style: { stroke: 'hsl(var(--muted-foreground))/30', strokeWidth: 1 },
      });
    }

    if (salesModule && projectsModule) {
      additionalEdges.push({
        id: `${salesModule.id}-${projectsModule.id}`,
        source: salesModule.id,
        target: projectsModule.id,
        type: 'smoothstep',
        style: { stroke: 'hsl(var(--muted-foreground))/30', strokeWidth: 1 },
      });
    }

    if (projectsModule && tasksModule) {
      additionalEdges.push({
        id: `${projectsModule.id}-${tasksModule.id}`,
        source: projectsModule.id,
        target: tasksModule.id,
        type: 'smoothstep',
        style: { stroke: 'hsl(var(--muted-foreground))/30', strokeWidth: 1 },
      });
    }

    setNodes([companyNode, ...moduleNodes]);
    setEdges([...moduleEdges, ...additionalEdges]);
  }, [currentCompany]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading business map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('home')}
            className="hover:bg-white/20 text-white border border-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              {currentCompany?.name} Business Map
            </h1>
            <p className="text-sm text-white/80">Interactive visualization of your business ecosystem</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={saveMap}
            className="hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Map
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportMap}
            className="hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative z-10">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-transparent"
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
        >
          <Controls 
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg"
            showZoom={true}
            showFitView={true}
            showInteractive={true}
          />
          <MiniMap 
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg"
            nodeColor={(node) => {
              if (node.id === 'company-center') {
                return 'hsl(var(--primary))';
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
            className="text-white/10"
          />
        </ReactFlow>
      </div>

      {/* Business Modules Panel */}
      <Card className="absolute top-20 right-6 w-80 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardContent className="p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Business Modules ({companyModules.filter(m => m.enabled).length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {companyModules.map((module) => {
              const Icon = moduleIcons[module.module_name as keyof typeof moduleIcons] || Database;
              return (
                <div 
                  key={module.id} 
                  className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                    module.enabled 
                      ? 'bg-green-500/20 border border-green-400/30' 
                      : 'bg-gray-500/20 border border-gray-400/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-white" />
                    <span className="text-sm text-white capitalize">
                      {module.module_name.replace('-', ' ')}
                    </span>
                  </div>
                  <Badge 
                    variant={module.enabled ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {module.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Instructions Panel */}
      <Card className="absolute bottom-6 left-6 max-w-sm bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm text-white mb-2">Navigation Guide:</h3>
          <ul className="text-xs text-white/80 space-y-1">
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