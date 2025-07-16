import { Activity } from "@/hooks/useActivities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, Clock, CheckCircle2 } from "lucide-react";

interface ActivityCardProps {
  activity: Activity;
  position: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
}

export function ActivityCard({ activity, position, onPositionChange }: ActivityCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDuration = (duration?: string) => {
    if (!duration) return 'No duration';
    return duration.replace(/(\d+)\s*(\w+)/, '$1 $2');
  };

  const calculateProgress = () => {
    if (activity.cost_est === 0) return 0;
    return Math.min((activity.cost_actual / activity.cost_est) * 100, 100);
  };

  const getQualityScore = () => {
    const metrics = activity.quality_metrics;
    if (!metrics || Object.keys(metrics).length === 0) return 0;
    
    const scores = Object.values(metrics).filter(v => typeof v === 'number');
    if (scores.length === 0) return 0;
    
    return scores.reduce((sum: number, score: any) => sum + score, 0) / scores.length;
  };

  const qualityScore = getQualityScore();
  const progress = calculateProgress();

  return (
    <Card 
      className="absolute w-80 p-4 bg-card border-border shadow-lg hover:shadow-xl transition-all duration-200 cursor-move"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
      draggable
      onDragEnd={(e) => {
        if (onPositionChange) {
          const rect = e.currentTarget.parentElement?.getBoundingClientRect();
          if (rect) {
            onPositionChange({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            });
          }
        }
      }}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg text-foreground truncate flex-1">
            {activity.name}
          </h3>
          <Badge variant="outline" className="ml-2">
            Active
          </Badge>
        </div>

        {/* Description */}
        {activity.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {activity.description}
          </p>
        )}

        {/* Duration and Timeline */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(activity.duration)}</span>
          {activity.start_date && (
            <>
              <Calendar className="h-4 w-4 ml-2" />
              <span>{new Date(activity.start_date).toLocaleDateString()}</span>
            </>
          )}
        </div>

        {/* Cost Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Cost Progress</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(activity.cost_actual)} / {formatCurrency(activity.cost_est)}
            </span>
          </div>
          <Progress 
            value={progress} 
            className="h-2"
            style={{
              '--progress-background': progress > 100 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'
            } as React.CSSProperties}
          />
        </div>

        {/* Quality Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Quality Score</span>
          </div>
          <Badge 
            variant={qualityScore >= 80 ? "default" : qualityScore >= 60 ? "secondary" : "destructive"}
            className="text-xs"
          >
            {qualityScore.toFixed(0)}%
          </Badge>
        </div>

        {/* Dependencies */}
        {activity.dependencies.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Dependencies:</span>
            <div className="flex flex-wrap gap-1">
              {activity.dependencies.map((dep, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {dep}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}