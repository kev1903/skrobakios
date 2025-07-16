import { useActivities } from "@/hooks/useActivities";
import { ActivityCard } from "./ActivityCard";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ActivitiesCanvasProps {
  projectId: string;
}

interface ActivityPosition {
  id: string;
  x: number;
  y: number;
}

export function ActivitiesCanvas({ projectId }: ActivitiesCanvasProps) {
  const { activities, isLoading } = useActivities(projectId);
  const [positions, setPositions] = useState<ActivityPosition[]>([]);

  // Initialize positions when activities load
  useEffect(() => {
    if (activities.length > 0 && positions.length === 0) {
      const newPositions = activities.map((activity, index) => ({
        id: activity.id,
        x: 200 + (index % 3) * 400, // Grid layout
        y: 200 + Math.floor(index / 3) * 300
      }));
      setPositions(newPositions);
    }
  }, [activities, positions.length]);

  const updatePosition = (activityId: string, newPosition: { x: number; y: number }) => {
    setPositions(prev => 
      prev.map(pos => 
        pos.id === activityId 
          ? { ...pos, ...newPosition }
          : pos
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No activities found for this project</p>
          <p className="text-sm text-muted-foreground">
            Use Skai AI to create activities: "Create activity Site Prep: 3d, $500 cost"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-auto bg-background/50">
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Activity Cards */}
      {activities.map((activity) => {
        const position = positions.find(p => p.id === activity.id) || { x: 200, y: 200 };
        
        return (
          <ActivityCard
            key={activity.id}
            activity={activity}
            position={position}
            onPositionChange={(newPos) => updatePosition(activity.id, newPos)}
          />
        );
      })}
      
      {/* Connection lines between dependencies */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {activities.map((activity) => {
          const fromPos = positions.find(p => p.id === activity.id);
          if (!fromPos) return null;
          
          return activity.dependencies.map((depName, index) => {
            const depActivity = activities.find(a => a.name === depName);
            const toPos = depActivity ? positions.find(p => p.id === depActivity.id) : null;
            
            if (!toPos) return null;
            
            return (
              <line
                key={`${activity.id}-${index}`}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            );
          });
        })}
      </svg>
    </div>
  );
}