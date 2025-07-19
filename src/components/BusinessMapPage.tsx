import React, { useCallback, useState, useEffect } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Connection, Edge, Node, BackgroundVariant, MarkerType, NodeTypes, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Database, Building2, Users, FileText, TrendingUp, DollarSign, Calendar, Briefcase, RefreshCw, Plus, Settings, FolderOpen, CheckSquare, BarChart3, MapPin, Search, Filter, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { ModuleSidePopup } from './ModuleSidePopup';
interface BusinessMapPageProps {
  onNavigate: (page: string) => void;
}
interface CompanyModule {
  id: string;
  module_name: string;
  enabled: boolean;
}
interface ModuleData {
  count: number;
  recent: any[];
  status?: string;
}
interface NodeInteractionState {
  selectedNodes: string[];
  hoveredNode: string | null;
  connectionMode: boolean;
}

// Custom Node Components with Interactive Features and Handles
const ModuleNode = ({
  data,
  selected
}: {
  data: any;
  selected?: boolean;
}) => {
  const Icon = data.icon;
  const isSelected = selected || data.isSelected;
  const isConnecting = data.isConnecting;
  return <>
      {/* Handle for connections - positioned on the left to connect to center */}
      <Handle type="target" position={Position.Left} id="input" style={{
      background: '#3b82f6',
      width: '12px',
      height: '12px',
      border: '2px solid white'
    }} />
      <Handle type="source" position={Position.Right} id="output" style={{
      background: '#3b82f6',
      width: '12px',
      height: '12px',
      border: '2px solid white'
    }} />
      
      <div className={`bg-white/90 backdrop-blur-sm border rounded-xl shadow-lg p-4 min-w-[200px] transition-all duration-300 cursor-pointer
        ${isSelected ? 'border-primary shadow-primary/20 scale-105' : 'border-border hover:shadow-xl hover:scale-102'}
        ${isConnecting ? 'ring-2 ring-primary/50 animate-pulse' : ''}
      `} onClick={() => data.onClick?.(data.id)} onMouseEnter={() => data.onHover?.(data.id)} onMouseLeave={() => data.onHover?.(null)}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${data.color} transition-all duration-200 ${isSelected ? 'scale-110' : ''}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{data.title}</h3>
            <p className="text-xs text-muted-foreground">{data.subtitle}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Total Count</span>
            <Badge variant="secondary" className="text-xs">{data.count || 0}</Badge>
          </div>
          
          {data.status && <div className="flex justify-between items-center">
              <span className="text-xs font-medium">Status</span>
              <Badge variant="outline" className="text-xs">{data.status}</Badge>
            </div>}
          
          {data.recent && data.recent.length > 0 && <div className="mt-3 pt-2 border-t border-border/50">
              <p className="text-xs font-medium mb-1">Recent Activity</p>
              <div className="space-y-1">
                {data.recent.slice(0, 2).map((item: any, index: number) => <div key={index} className="text-xs text-muted-foreground truncate">
                    • {item.name || item.title || item.description || 'Item'}
                  </div>)}
              </div>
            </div>}
          
          {isSelected && <div className="mt-3 pt-2 border-t border-primary/20">
              <p className="text-xs font-medium text-primary">Click to connect</p>
            </div>}
        </div>
      </div>
    </>;
};
const CompanyCenterNode = ({
  data,
  selected
}: {
  data: any;
  selected?: boolean;
}) => {
  const isSelected = selected || data.isSelected;
  const isConnecting = data.isConnecting;
  return <>
      {/* Center node handles - multiple positions for all connections */}
      <Handle type="source" position={Position.Left} id="left" style={{
      background: '#3b82f6',
      width: '12px',
      height: '12px',
      border: '2px solid white'
    }} />
      <Handle type="source" position={Position.Right} id="right" style={{
      background: '#3b82f6',
      width: '12px',
      height: '12px',
      border: '2px solid white'
    }} />
      <Handle type="source" position={Position.Top} id="top" style={{
      background: '#3b82f6',
      width: '12px',
      height: '12px',
      border: '2px solid white'
    }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{
      background: '#3b82f6',
      width: '12px',
      height: '12px',
      border: '2px solid white'
    }} />
      
      <div className={`bg-gradient-to-br from-primary/20 to-primary/30 backdrop-blur-sm border-2 rounded-2xl shadow-xl p-6 min-w-[250px] transition-all duration-300 cursor-pointer
        ${isSelected ? 'border-primary scale-105 shadow-primary/30' : 'border-primary/40'}
        ${isConnecting ? 'ring-4 ring-primary/30 animate-pulse' : ''}
      `} onClick={() => data.onClick?.(data.id)} onMouseEnter={() => data.onHover?.(data.id)} onMouseLeave={() => data.onHover?.(null)}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 bg-primary/20 rounded-xl transition-all duration-200 ${isSelected ? 'scale-110 bg-primary/30' : ''}`}>
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">{data.companyName}</h2>
            <p className="text-sm text-muted-foreground">
              {isSelected ? 'Connection Hub - Click modules to connect' : 'Business Ecosystem Hub'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className={`text-center p-2 bg-white/20 rounded-lg transition-all duration-200 ${isSelected ? 'bg-white/30' : ''}`}>
            <div className="text-lg font-bold text-primary">{data.moduleCount}</div>
            <div className="text-xs text-muted-foreground">Active Modules</div>
          </div>
          <div className={`text-center p-2 bg-white/20 rounded-lg transition-all duration-200 ${isSelected ? 'bg-white/30' : ''}`}>
            <div className="text-lg font-bold text-primary">{data.projectCount || 0}</div>
            <div className="text-xs text-muted-foreground">Projects</div>
          </div>
        </div>
        
        {isSelected && <div className="mt-4 p-2 bg-primary/10 rounded-lg">
            <p className="text-xs font-medium text-primary text-center">
              Connection Mode Active
            </p>
          </div>}
      </div>
    </>;
};

// Module configuration with enhanced data and categories
const moduleConfig = {
  // Business Modules
  sales: {
    icon: TrendingUp,
    color: 'bg-green-500',
    title: 'Sales',
    subtitle: 'Sales Management',
    table: 'leads',
    category: 'business'
  },
  finance: {
    icon: DollarSign,
    color: 'bg-purple-500',
    title: 'Finance',
    subtitle: 'Financial Management',
    table: 'project_costs',
    category: 'business'
  },
  dashboard: {
    icon: BarChart3,
    color: 'bg-indigo-500',
    title: 'Dashboard',
    subtitle: 'Analytics & Reports',
    table: null,
    category: 'business'
  },
  'cost-contracts': {
    icon: FileText,
    color: 'bg-orange-500',
    title: 'Cost & Contracts',
    subtitle: 'Cost & Contract Management',
    table: 'estimates',
    category: 'business'
  },
  team: {
    icon: Users,
    color: 'bg-red-500',
    title: 'Team',
    subtitle: 'Team Management',
    table: 'company_members',
    category: 'business'
  },
  // Project Modules
  projects: {
    icon: Briefcase,
    color: 'bg-blue-500',
    title: 'Projects',
    subtitle: 'Project Management',
    table: 'projects',
    category: 'project'
  },
  'digital-twin': {
    icon: MapPin,
    color: 'bg-cyan-500',
    title: 'Digital Twin',
    subtitle: '3D Models & Mapping',
    table: 'model_3d',
    category: 'project'
  },
  tasks: {
    icon: CheckSquare,
    color: 'bg-pink-500',
    title: 'Tasks',
    subtitle: 'Task Management',
    table: 'activities',
    category: 'project'
  },
  files: {
    icon: FolderOpen,
    color: 'bg-yellow-500',
    title: 'Files',
    subtitle: 'Document Management',
    table: 'portfolio_items',
    category: 'project'
  },
  'digital-objects': {
    icon: Database,
    color: 'bg-teal-500',
    title: 'Digital Objects',
    subtitle: 'Object Management',
    table: 'digital_objects',
    category: 'project'
  }
};
const nodeTypes: NodeTypes = {
  moduleNode: ModuleNode,
  companyCenter: CompanyCenterNode
};
export const BusinessMapPage = ({
  onNavigate
}: BusinessMapPageProps) => {
  const {
    currentCompany
  } = useCompany();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [companyModules, setCompanyModules] = useState<CompanyModule[]>([]);
  const [moduleData, setModuleData] = useState<Record<string, ModuleData>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [interactionState, setInteractionState] = useState<NodeInteractionState>({
    selectedNodes: [],
    hoveredNode: null,
    connectionMode: false
  });
  const [sidePopup, setSidePopup] = useState<{
    isOpen: boolean;
    moduleData: any;
  }>({
    isOpen: false,
    moduleData: null
  });
  const [isMapLocked, setIsMapLocked] = useState(false);
  const [lastSavedPositions, setLastSavedPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Auto-save node positions when they change (only in unlocked mode)
  const handleNodesChange = useCallback((changes: any[]) => {
    if (!isMapLocked) {
      onNodesChange(changes);
      
      // Check if any position changes occurred
      const positionChanges = changes.filter(change => change.type === 'position');
      if (positionChanges.length > 0 && currentCompany) {
        // Debounced auto-save implementation
        const saveTimer = setTimeout(async () => {
          try {
            const currentPositions: Record<string, { x: number; y: number }> = {};
            nodes.forEach(node => {
              if (node.id !== 'company-center') {
                currentPositions[node.id] = { x: node.position.x, y: node.position.y };
              }
            });

            // Only save if positions actually changed
            const hasChanges = Object.keys(currentPositions).some(nodeId => {
              const current = currentPositions[nodeId];
              const saved = lastSavedPositions[nodeId];
              return !saved || current.x !== saved.x || current.y !== saved.y;
            });

            if (hasChanges) {
              // Save to localStorage for now (could be extended to database)
              const saveKey = `business-map-positions-${currentCompany.id}`;
              localStorage.setItem(saveKey, JSON.stringify(currentPositions));
              setLastSavedPositions(currentPositions);
              
              toast.success('Map layout auto-saved', { duration: 1000 });
            }
          } catch (error) {
            console.error('Error auto-saving positions:', error);
          }
        }, 1000); // 1 second debounce

        return () => clearTimeout(saveTimer);
      }
    }
  }, [isMapLocked, onNodesChange, nodes, lastSavedPositions, currentCompany]);

  // Load saved positions on component mount
  useEffect(() => {
    if (currentCompany) {
      const saveKey = `business-map-positions-${currentCompany.id}`;
      const savedPositions = localStorage.getItem(saveKey);
      if (savedPositions) {
        try {
          const positions = JSON.parse(savedPositions);
          setLastSavedPositions(positions);
        } catch (error) {
          console.error('Error loading saved positions:', error);
        }
      }
    }
  }, [currentCompany]);

  // Toggle lock/unlock mode
  const toggleMapLock = useCallback(() => {
    setIsMapLocked(prev => {
      const newLocked = !prev;
      toast.success(newLocked ? 'Map locked - View only mode' : 'Map unlocked - Edit mode enabled');
      return newLocked;
    });
  }, []);

  // Fetch company modules and their data
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!currentCompany) return;
      try {
        // Fetch modules
        const {
          data: modules,
          error: modulesError
        } = await supabase.from('company_modules').select('*').eq('company_id', currentCompany.id);
        if (modulesError) throw modulesError;
        setCompanyModules(modules || []);

        // Fetch data for each enabled module
        const enabledModules = modules?.filter(m => m.enabled) || [];
        const dataPromises = enabledModules.map(async module => {
          const config = moduleConfig[module.module_name as keyof typeof moduleConfig];
          if (!config?.table) return {
            moduleName: module.module_name,
            data: {
              count: 0,
              recent: []
            }
          };
          const {
            data,
            error
          } = await supabase.from(config.table).select('*').eq('company_id', currentCompany.id).limit(5).order('created_at', {
            ascending: false
          });
          if (error) {
            console.error(`Error fetching ${config.table}:`, error);
            return {
              moduleName: module.module_name,
              data: {
                count: 0,
                recent: []
              }
            };
          }
          return {
            moduleName: module.module_name,
            data: {
              count: data?.length || 0,
              recent: data || [],
              status: data && data.length > 0 && 'status' in data[0] ? String(data[0].status) : 'Active'
            }
          };
        });
        const results = await Promise.all(dataPromises);
        const dataMap = results.reduce((acc, result) => {
          acc[result.moduleName] = result.data;
          return acc;
        }, {} as Record<string, ModuleData>);
        setModuleData(dataMap);
        generateBusinessMap(enabledModules, dataMap);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load business data');
      } finally {
        setLoading(false);
      }
    };
    fetchBusinessData();
  }, [currentCompany]);

  // Interactive node handlers
  const handleNodeClick = useCallback((nodeId: string) => {
    if (nodeId === 'company-center') {
      // Toggle connection mode when clicking company center
      setInteractionState(prev => ({
        ...prev,
        connectionMode: !prev.connectionMode,
        selectedNodes: prev.connectionMode ? [] : ['company-center']
      }));
    } else {
      // Handle module node clicks - show side popup instead of just selecting
      const moduleNode = nodes.find(n => n.id === nodeId);
      if (moduleNode && moduleNode.data) {
        // Open side popup with module data
        setSidePopup({
          isOpen: true,
          moduleData: {
            id: moduleNode.id,
            title: moduleNode.data.title,
            subtitle: moduleNode.data.subtitle,
            icon: moduleNode.data.icon,
            color: moduleNode.data.color,
            table: moduleNode.data.table,
            moduleName: moduleNode.data.moduleName
          }
        });
      }

      if (interactionState.connectionMode && interactionState.selectedNodes.includes('company-center')) {
        // Create a temporary highlighted connection
        setInteractionState(prev => ({
          ...prev,
          selectedNodes: [...prev.selectedNodes, nodeId]
        }));

        // Create dynamic connection animation
        const newEdge: Edge = {
          id: `dynamic-${Date.now()}`,
          source: 'company-center',
          target: nodeId,
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: 'hsl(var(--primary))',
            strokeWidth: 3,
            strokeDasharray: '10,5'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--primary))'
          }
        };
        setEdges(prev => [...prev, newEdge]);
        toast.success(`Connected ${currentCompany?.name} to ${nodes.find(n => n.id === nodeId)?.data?.title || 'Module'}`);

        // Auto-clear connection mode after 2 seconds
        setTimeout(() => {
          setInteractionState(prev => ({
            ...prev,
            connectionMode: false,
            selectedNodes: []
          }));
        }, 2000);
      } else {
        // Regular module selection
        setInteractionState(prev => ({
          ...prev,
          selectedNodes: [nodeId]
        }));
      }
    }
  }, [interactionState, nodes, setEdges]);
  const handleNodeHover = useCallback((nodeId: string | null) => {
    setInteractionState(prev => ({
      ...prev,
      hoveredNode: nodeId
    }));
  }, []);
  const generateBusinessMap = useCallback((modules: CompanyModule[], data: Record<string, ModuleData>) => {
    const enabledModules = modules.filter(m => m.enabled);

    // Create a more mind-map style layout instead of radial
    const centerX = 500;
    const centerY = 300;

    // Create company center node
    const companyNode: Node = {
      id: 'company-center',
      type: 'companyCenter',
      position: {
        x: centerX - 125,
        y: centerY - 75
      },
      data: {
        id: 'company-center',
        companyName: currentCompany?.name,
        moduleCount: enabledModules.length,
        projectCount: data.projects?.count || 0,
        isSelected: interactionState.selectedNodes.includes('company-center'),
        isConnecting: interactionState.connectionMode,
        onClick: handleNodeClick,
        onHover: handleNodeHover
      },
      draggable: false
    };

    // Create mind-map style layout with business modules and project modules in different areas
    const businessModules = enabledModules.filter(m => {
      const config = moduleConfig[m.module_name as keyof typeof moduleConfig];
      return config?.category === 'business';
    });
    const projectModules = enabledModules.filter(m => {
      const config = moduleConfig[m.module_name as keyof typeof moduleConfig];
      return config?.category === 'project';
    });

    // Position business modules on the left side with increased spacing
    const businessNodes: Node[] = businessModules.map((module, index) => {
      const defaultY = centerY + (index - (businessModules.length - 1) / 2) * 220;
      const defaultX = centerX - 450;
      
      // Use saved position if available
      const savedPos = lastSavedPositions[module.id];
      const position = savedPos ? savedPos : { x: defaultX, y: defaultY };
      
      const config = moduleConfig[module.module_name as keyof typeof moduleConfig];
      const moduleStats = data[module.module_name] || {
        count: 0,
        recent: []
      };
      return {
        id: module.id,
        type: 'moduleNode',
        position,
        data: {
          id: module.id,
          ...config,
          ...moduleStats,
          moduleName: module.module_name,
          isSelected: interactionState.selectedNodes.includes(module.id),
          isConnecting: interactionState.connectionMode && interactionState.selectedNodes.includes('company-center'),
          onClick: handleNodeClick,
          onHover: handleNodeHover
        },
        draggable: !isMapLocked
      };
    });

    // Position project modules on the right side with increased spacing
    const projectNodes: Node[] = projectModules.map((module, index) => {
      const defaultY = centerY + (index - (projectModules.length - 1) / 2) * 220;
      const defaultX = centerX + 450;
      
      // Use saved position if available
      const savedPos = lastSavedPositions[module.id];
      const position = savedPos ? savedPos : { x: defaultX, y: defaultY };
      
      const config = moduleConfig[module.module_name as keyof typeof moduleConfig];
      const moduleStats = data[module.module_name] || {
        count: 0,
        recent: []
      };
      return {
        id: module.id,
        type: 'moduleNode',
        position,
        data: {
          id: module.id,
          ...config,
          ...moduleStats,
          moduleName: module.module_name,
          isSelected: interactionState.selectedNodes.includes(module.id),
          isConnecting: interactionState.connectionMode && interactionState.selectedNodes.includes('company-center'),
          onClick: handleNodeClick,
          onHover: handleNodeHover
        },
        draggable: !isMapLocked
      };
    });

    // Create dynamic edges based on data relationships
    const moduleEdges: Edge[] = enabledModules.map(module => {
      const config = moduleConfig[module.module_name as keyof typeof moduleConfig];
      const isBusinessModule = config?.category === 'business';
      return {
        id: `company-${module.id}`,
        source: 'company-center',
        sourceHandle: isBusinessModule ? 'left' : 'right',
        // Use appropriate handle based on module position
        target: module.id,
        targetHandle: 'input',
        type: 'default',
        animated: true,
        style: {
          stroke: '#3b82f6',
          strokeWidth: 3,
          strokeOpacity: 0.8
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3b82f6',
          width: 20,
          height: 20
        },
        labelStyle: {
          fill: '#3b82f6',
          fontWeight: 600
        },
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 0.8
        }
      };
    });

    // Add smart interconnections based on business logic
    const additionalEdges: Edge[] = [];
    const moduleMap = new Map<string, string>();
    enabledModules.forEach(m => moduleMap.set(m.module_name, m.id));

    // Business workflow connections
    const connections = [['sales', 'projects'], ['projects', 'tasks'], ['projects', 'finance'], ['tasks', 'team'], ['files', 'projects'], ['digital-twin', 'projects'], ['cost-contracts', 'finance']];
    connections.forEach(([source, target]) => {
      const sourceId = moduleMap.get(source);
      const targetId = moduleMap.get(target);
      if (sourceId && targetId) {
        additionalEdges.push({
          id: `${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          type: 'smoothstep',
          style: {
            stroke: 'hsl(var(--muted-foreground))',
            strokeWidth: 1,
            strokeDasharray: '5,5'
          }
        });
      }
    });
    setNodes([companyNode, ...businessNodes, ...projectNodes]);
    setEdges([...moduleEdges, ...additionalEdges]);
  }, [currentCompany, interactionState, handleNodeClick, handleNodeHover]);
  const onConnect = useCallback((params: Edge | Connection) => setEdges(eds => addEdge(params, eds)), [setEdges]);
  const filteredModules = companyModules.filter(module => module.module_name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Group modules by category
  const businessModules = filteredModules.filter(module => {
    const config = moduleConfig[module.module_name as keyof typeof moduleConfig];
    return config?.category === 'business';
  });
  const projectModules = filteredModules.filter(module => {
    const config = moduleConfig[module.module_name as keyof typeof moduleConfig];
    return config?.category === 'project';
  });
  if (loading) {
    return <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading business ecosystem...</p>
        </div>
      </div>;
  }
  return <div className="h-screen bg-background flex flex-col">
      {/* Header with Back Button, Title, and Search */}
      <div className="bg-card/50 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('home')} className="p-1">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-semibold">Business Map</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search modules..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 w-64" />
            </div>
            
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Cards
            </Button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={handleNodesChange} 
          onEdgesChange={onEdgesChange} 
          onConnect={onConnect} 
          nodeTypes={nodeTypes} 
          fitView 
          className="bg-background" 
          nodesDraggable={!isMapLocked} 
          nodesConnectable={!isMapLocked} 
          elementsSelectable={!isMapLocked} 
          panOnDrag={true} 
          panOnScroll={true} 
          zoomOnScroll={true} 
          zoomOnPinch={true} 
          zoomOnDoubleClick={true} 
          minZoom={0.1} 
          maxZoom={2} 
          defaultViewport={{
            x: 0,
            y: 0,
            zoom: 0.7
          }}
        >
          <Controls className="bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-lg" showZoom={true} showFitView={true} showInteractive={true} />
          
          {/* Custom Lock/Unlock Control */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-lg">
            <Button
              variant={isMapLocked ? "destructive" : "default"}
              size="sm"
              onClick={toggleMapLock}
              className="m-2"
              title={isMapLocked ? "Click to unlock map editing" : "Click to lock map (view only)"}
            >
              {isMapLocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
            </Button>
          </div>
          <MiniMap className="bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-lg" nodeColor={node => {
            if (node.id === 'company-center') return 'hsl(var(--primary))';
            return 'hsl(var(--muted))';
          }} nodeStrokeWidth={2} zoomable pannable />
          <Background variant={BackgroundVariant.Dots} gap={30} size={1} className="text-muted-foreground/10" />
        </ReactFlow>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" size="sm" className="bg-card/90 backdrop-blur-sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="bg-card/90 backdrop-blur-sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Connection Status Panel */}
        {interactionState.connectionMode && <div className="absolute bottom-6 right-6 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-sm">Connection Mode Active</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Click on any module to create a dynamic connection to Skrobaki
            </p>
            <Button size="sm" variant="outline" onClick={() => setInteractionState(prev => ({
          ...prev,
          connectionMode: false,
          selectedNodes: []
        }))} className="w-full">
              Exit Connection Mode
            </Button>
          </div>}

        {/* Connection Status Indicator */}
        <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h4 className="font-semibold text-sm">Live Connections</h4>
          </div>
          <div className="text-xs text-muted-foreground">
            <div>Active Modules: {nodes.length - 1}</div>
            <div>Total Connections: {edges.length}</div>
          </div>
        </div>

        {/* Interactive Instructions */}
        {!interactionState.connectionMode}
        
      </div>

      {/* Module Side Popup */}
      <ModuleSidePopup
        isOpen={sidePopup.isOpen}
        onClose={() => setSidePopup({ isOpen: false, moduleData: null })}
        moduleData={sidePopup.moduleData}
        onNavigate={onNavigate}
      />
    </div>;
};