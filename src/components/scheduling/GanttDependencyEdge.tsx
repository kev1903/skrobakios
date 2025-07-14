import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
} from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DependencyEdgeData {
  dependency: {
    id: string;
    dependency_type: string;
    lag_days: number;
  };
  onDelete: () => void;
}

export const GanttDependencyEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getDependencyTypeLabel = (type: string) => {
    switch (type) {
      case 'finish_to_start':
        return 'FS';
      case 'start_to_start':
        return 'SS';
      case 'finish_to_finish':
        return 'FF';
      case 'start_to_finish':
        return 'SF';
      default:
        return 'FS';
    }
  };

  const getDependencyColor = (type: string) => {
    switch (type) {
      case 'finish_to_start':
        return '#3b82f6'; // blue
      case 'start_to_start':
        return '#10b981'; // green
      case 'finish_to_finish':
        return '#f59e0b'; // yellow
      case 'start_to_finish':
        return '#ef4444'; // red
      default:
        return '#3b82f6';
    }
  };

  const dependencyData = data as unknown as DependencyEdgeData;
  const dependencyType = dependencyData?.dependency.dependency_type || 'finish_to_start';
  const lagDays = dependencyData?.dependency.lag_days || 0;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: getDependencyColor(dependencyType),
          strokeWidth: 2,
          strokeDasharray: lagDays > 0 ? '5,5' : undefined,
          ...style,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute flex items-center gap-1 bg-background border rounded-md shadow-sm px-2 py-1 text-xs font-medium pointer-events-auto"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <span style={{ color: getDependencyColor(dependencyType) }}>
            {getDependencyTypeLabel(dependencyType)}
          </span>
          {lagDays > 0 && (
            <span className="text-muted-foreground">
              +{lagDays}d
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-4 h-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
            onClick={dependencyData?.onDelete}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};