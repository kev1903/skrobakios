import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ZoomIn, ZoomOut } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { GanttTaskNode } from './GanttTaskNode';
import { GanttDependencyEdge } from './GanttDependencyEdge';
import { GanttTimeline } from './GanttTimeline';

interface Task {
  id: string;
  task_name: string;
  start_date?: string;
  end_date?: string;
  estimated_duration?: number;
  progress: number;
  status: string;
  is_milestone: boolean;
  is_critical_path: boolean;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
}

interface TaskDependency {
  id: string;
  predecessor_task_id: string;
  successor_task_id: string;
  dependency_type: string;
  lag_days: number;
}

interface GanttChartProps {
  tasks: Task[];
  dependencies: TaskDependency[];
  projectStartDate: Date;
  projectEndDate: Date;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDependencyCreate: (predecessor: string, successor: string) => void;
  onDependencyDelete: (dependencyId: string) => void;
}

const nodeTypes: NodeTypes = {
  ganttTask: GanttTaskNode as any,
};

const edgeTypes: EdgeTypes = {
  dependency: GanttDependencyEdge as any,
};

export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  dependencies,
  projectStartDate,
  projectEndDate,
  onTaskUpdate,
  onDependencyCreate,
  onDependencyDelete,
}) => {
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [timelineStart, setTimelineStart] = React.useState(projectStartDate);
  const [timelineEnd, setTimelineEnd] = React.useState(projectEndDate);

  // Convert tasks to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    const dayWidth = 40 * zoomLevel;
    const rowHeight = 60;
    
    return tasks.map((task, index) => {
      const startDate = task.start_date ? new Date(task.start_date) : projectStartDate;
      const endDate = task.end_date ? new Date(task.end_date) : addDays(startDate, task.estimated_duration || 1);
      
      const startOffset = differenceInDays(startDate, timelineStart) * dayWidth;
      const duration = differenceInDays(endDate, startDate) || 1;
      const taskWidth = duration * dayWidth;

      return {
        id: task.id,
        type: 'ganttTask',
        position: { x: startOffset + 200, y: index * rowHeight + 100 },
        data: {
          task,
          width: taskWidth,
          startDate,
          endDate,
          dayWidth,
        },
        style: {
          width: taskWidth,
          height: 40,
        },
      };
    });
  }, [tasks, timelineStart, zoomLevel, projectStartDate]);

  // Convert dependencies to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    return dependencies.map((dep) => ({
      id: dep.id,
      source: dep.predecessor_task_id,
      target: dep.successor_task_id,
      type: 'dependency',
      data: {
        dependency: dep,
        onDelete: () => onDependencyDelete(dep.id),
      },
      style: {
        stroke: dep.dependency_type === 'finish_to_start' ? '#3b82f6' : '#10b981',
        strokeWidth: 2,
      },
    }));
  }, [dependencies, onDependencyDelete]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when tasks change
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges when dependencies change
  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        onDependencyCreate(params.source, params.target);
      }
    },
    [onDependencyCreate]
  );

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleTaskDrag = useCallback(
    (taskId: string, newPosition: { x: number; y: number }) => {
      const dayWidth = 40 * zoomLevel;
      const newStartOffset = (newPosition.x - 200) / dayWidth;
      const newStartDate = addDays(timelineStart, Math.round(newStartOffset));
      
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const duration = task.estimated_duration || 1;
        const newEndDate = addDays(newStartDate, duration);
        
        onTaskUpdate(taskId, {
          start_date: format(newStartDate, 'yyyy-MM-dd'),
          end_date: format(newEndDate, 'yyyy-MM-dd'),
        });
      }
    },
    [timelineStart, zoomLevel, tasks, onTaskUpdate]
  );

  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Project Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[500px]">
        <div className="relative w-full h-full">
          <GanttTimeline
            startDate={timelineStart}
            endDate={timelineEnd}
            zoomLevel={zoomLevel}
          />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView={false}
            preventScrolling={false}
            panOnScroll={false}
            zoomOnScroll={false}
            className="gantt-flow"
            style={{ backgroundColor: 'transparent' }}
          >
            <Background />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
};