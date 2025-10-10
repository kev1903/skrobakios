import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, Clock, FileCheck } from 'lucide-react';

export type WorkflowStage = 'pending' | 'review' | 'approved';

interface WorkflowStatusPipelineProps {
  currentStage: WorkflowStage;
  onStageChange: (stage: WorkflowStage) => void;
  submittalCount: number;
  approvedCount: number;
}

const stages: { id: WorkflowStage; label: string; icon: any }[] = [
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'review', label: 'In Review', icon: Circle },
  { id: 'approved', label: 'Approved', icon: CheckCircle2 },
];

export const WorkflowStatusPipeline = ({
  currentStage,
  onStageChange,
  submittalCount,
  approvedCount,
}: WorkflowStatusPipelineProps) => {
  const getStageIndex = (stage: WorkflowStage) => stages.findIndex(s => s.id === stage);
  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="grid grid-cols-3 gap-4">
      {stages.map((stage, index) => {
        const Icon = stage.icon;
        const isActive = currentStage === stage.id;
        const isPast = index < currentIndex;
        const isFuture = index > currentIndex;

        return (
          <Card
            key={stage.id}
            className={`p-6 cursor-pointer transition-all hover:shadow-md ${
              isActive
                ? 'border-primary bg-primary/5 shadow-sm'
                : isPast
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-muted hover:border-primary/30'
            }`}
            onClick={() => onStageChange(stage.id)}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isPast
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">{stage.label}</h3>
                {stage.id === 'pending' && (
                  <Badge variant="outline" className="text-xs">
                    {submittalCount} items
                  </Badge>
                )}
                {stage.id === 'approved' && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-500/30">
                    {approvedCount} approved
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
