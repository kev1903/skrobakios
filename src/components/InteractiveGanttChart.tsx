import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ZoomIn, ZoomOut, Maximize2, Calendar, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  task_name: string;
  task_type: string;
  status: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  progress_percentage: number;
  dependencies?: string[];
  is_critical_path?: boolean;
}

interface InteractiveGanttChartProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

// Custom Task Node Component
const TaskNode = ({ data }: { data: any }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'hsl(var(--chart-1))';
      case 'in-progress':
        return 'hsl(var(--chart-2))';
      case 'delayed':
        return 'hsl(var(--destructive))';
      case 'pending':
        return 'hsl(var(--muted))';
      default:
        return 'hsl(var(--muted))';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-AU', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`px-4 py-3 rounded-lg border shadow-sm bg-card text-card-foreground min-w-[200px] cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${
              data.is_critical_path ? 'ring-2 ring-amber-400 ring-opacity-50' : ''
            }`}
            style={{
              borderLeftColor: getStatusColor(data.status),
              borderLeftWidth: '4px',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm text-foreground leading-tight">
                  {data.task_name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(data.start_date)} - {formatDate(data.end_date)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {data.status}
                  </Badge>
                  {data.is_critical_path && (
                    <Badge variant="outline" className="text-xs border-amber-400 text-amber-600">
                      Critical
                    </Badge>
                  )}
                </div>
              </div>
              <div className="ml-3 text-right">
                <div className="text-sm font-medium text-foreground">
                  {data.progress_percentage}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.duration_days}d
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3 w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${data.progress_percentage}%`,
                  backgroundColor: getStatusColor(data.status),
                }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="p-2">
            <p className="font-medium">{data.task_name}</p>
            <p className="text-sm text-muted-foreground">Type: {data.task_type}</p>
            <p className="text-sm text-muted-foreground">Duration: {data.duration_days} days</p>
            <p className="text-sm text-muted-foreground">Progress: {data.progress_percentage}%</p>
            {data.is_critical_path && (
              <p className="text-sm text-amber-600 font-medium">⚠ Critical Path</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const nodeTypes: NodeTypes = {
  taskNode: TaskNode,
};

export const InteractiveGanttChart: React.FC<InteractiveGanttChartProps> = ({ 
  tasks, 
  onTaskUpdate 
}) => {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Convert tasks to React Flow nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Calculate positions based on timeline
    const projectStart = tasks.length > 0 
      ? new Date(Math.min(...tasks.map(t => new Date(t.start_date).getTime())))
      : new Date();
    
    const projectEnd = tasks.length > 0
      ? new Date(Math.max(...tasks.map(t => new Date(t.end_date).getTime())))
      : new Date();

    const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    tasks.forEach((task, index) => {
      const taskStart = new Date(task.start_date);
      const startOffset = Math.ceil((taskStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
      
      // Position nodes based on timeline
      const x = (startOffset / totalDays) * 800 + 50;
      const y = index * 120 + 50;

      nodes.push({
        id: task.id,
        type: 'taskNode',
        position: { x, y },
        data: {
          ...task,
          is_critical_path: task.is_critical_path || index > 0, // Mock critical path for demo
        },
        draggable: true,
      });

      // Create dependency edges
      if (task.dependencies) {
        task.dependencies.forEach(depId => {
          edges.push({
            id: `${depId}-${task.id}`,
            source: depId,
            target: task.id,
            type: 'smoothstep',
            animated: task.is_critical_path,
            style: {
              stroke: task.is_critical_path ? '#f59e0b' : '#06b6d4',
              strokeWidth: task.is_critical_path ? 3 : 2,
            },
            markerEnd: {
              type: 'arrowclosed' as any,
              color: task.is_critical_path ? '#f59e0b' : '#06b6d4',
            },
          });
        });
      } else if (index > 0) {
        // Create sequential dependencies for demo
        const prevTask = tasks[index - 1];
        edges.push({
          id: `${prevTask.id}-${task.id}`,
          source: prevTask.id,
          target: task.id,
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: '#f59e0b',
            strokeWidth: 3,
          },
          markerEnd: {
            type: 'arrowclosed' as any,
            color: '#f59e0b',
          },
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [tasks]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when tasks change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeDrag = useCallback((event: any, node: Node) => {
    if (onTaskUpdate) {
      // Calculate new dates based on position (simplified)
      const newStartDate = new Date();
      newStartDate.setDate(newStartDate.getDate() + Math.floor(node.position.x / 50));
      
      onTaskUpdate(node.id, {
        start_date: newStartDate.toISOString().split('T')[0],
      });
    }
  }, [onTaskUpdate]);

  const handleOptimizeSchedule = async () => {
    setIsOptimizing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('optimize-schedule', {
        body: { tasks }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Schedule Optimized",
        description: "The project schedule has been optimized using AI analysis.",
      });

      // The optimization would update the tasks in the database
      // and trigger a re-fetch in the parent component
      
    } catch (error) {
      console.error('Error optimizing schedule:', error);
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize the schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleZoomIn = () => {
    reactFlowInstance?.zoomIn();
  };

  const handleZoomOut = () => {
    reactFlowInstance?.zoomOut();
  };

  const handleFitView = () => {
    reactFlowInstance?.fitView({ padding: 0.1 });
  };

  return (
    <Card className="w-full h-[600px]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Interactive Project Timeline</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Drag tasks to reschedule • Critical path highlighted in amber
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleOptimizeSchedule}
              disabled={isOptimizing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Bot className="h-4 w-4" />
              {isOptimizing ? 'Optimizing...' : 'Optimize Schedule'}
            </Button>
            <Button onClick={handleZoomIn} variant="outline" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button onClick={handleZoomOut} variant="outline" size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button onClick={handleFitView} variant="outline" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-100px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={handleNodeDrag}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          minZoom={0.1}
          maxZoom={2}
          className="bg-background"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="hsl(var(--muted-foreground))" size={1} />
          <MiniMap 
            className="bg-background border border-border"
            nodeColor={(node) => {
              const status = node.data?.status;
              switch (status) {
                case 'complete': return 'hsl(var(--chart-1))';
                case 'in-progress': return 'hsl(var(--chart-2))';
                case 'delayed': return 'hsl(var(--destructive))';
                default: return 'hsl(var(--muted))';
              }
            }}
          />
          <Controls 
            className="bg-background border border-border"
            showInteractive={false}
          />
          <Panel position="top-right" className="m-2">
            <Card className="p-3">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-chart-1"></div>
                  <span>Complete</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-chart-2"></div>
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-destructive"></div>
                  <span>Delayed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-muted"></div>
                  <span>Pending</span>
                </div>
              </div>
            </Card>
          </Panel>
        </ReactFlow>
      </CardContent>
    </Card>
  );
};