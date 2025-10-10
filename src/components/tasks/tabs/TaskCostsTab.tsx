import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TaskCostsTabProps {
  taskId: string;
}

export const TaskCostsTab = ({ taskId }: TaskCostsTabProps) => {
  const { data: costs, isLoading } = useQuery({
    queryKey: ['task-costs', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_costs')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const totalEstimated = costs?.reduce((sum, cost) => sum + Number(cost.estimated_cost || 0), 0) || 0;
  const totalActual = costs?.reduce((sum, cost) => sum + Number(cost.actual_cost || 0), 0) || 0;
  const variance = totalActual - totalEstimated;
  const variancePercent = totalEstimated > 0 ? Math.round((variance / totalEstimated) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cost & Impact</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Cost Item
        </Button>
      </div>

      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated</p>
              <p className="text-xl font-semibold">${totalEstimated.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Actual</p>
              <p className="text-xl font-semibold">${totalActual.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${variance > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              {variance > 0 ? (
                <TrendingUp className="w-5 h-5 text-red-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Variance</p>
              <p className={`text-xl font-semibold ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {variance > 0 ? '+' : ''}{variancePercent}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Cost Items */}
      {isLoading ? (
        <Card className="p-8 text-center text-muted-foreground">
          Loading costs...
        </Card>
      ) : costs && costs.length === 0 ? (
        <Card className="p-8 text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No cost items yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {costs?.map((cost) => (
            <Card key={cost.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{cost.cost_type}</h4>
                    {cost.impact_level && (
                      <Badge variant={
                        cost.impact_level === 'high' ? 'destructive' :
                        cost.impact_level === 'medium' ? 'default' :
                        'secondary'
                      }>
                        {cost.impact_level} impact
                      </Badge>
                    )}
                  </div>
                  
                  {cost.cost_description && (
                    <p className="text-sm text-muted-foreground mb-3">{cost.cost_description}</p>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Estimated: </span>
                      <span className="font-semibold">${Number(cost.estimated_cost).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Actual: </span>
                      <span className="font-semibold">${Number(cost.actual_cost).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Variance: </span>
                      <span className={`font-semibold ${
                        Number(cost.actual_cost) > Number(cost.estimated_cost) ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ${(Number(cost.actual_cost) - Number(cost.estimated_cost)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
