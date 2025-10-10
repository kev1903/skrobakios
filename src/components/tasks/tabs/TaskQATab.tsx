import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TaskQATabProps {
  taskId: string;
}

export const TaskQATab = ({ taskId }: TaskQATabProps) => {
  const { data: qaItems, isLoading } = useQuery({
    queryKey: ['task-qa', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_qa')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const completedCount = qaItems?.filter(item => item.status === 'completed').length || 0;
  const totalCount = qaItems?.length || 0;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">QA/QC Checklist</h3>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} items completed ({completionRate}%)
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Checklist Item
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-muted-foreground">
          Loading QA items...
        </Card>
      ) : qaItems && qaItems.length === 0 ? (
        <Card className="p-8 text-center">
          <Circle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No QA items yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {qaItems?.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={item.status === 'completed'}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{item.checklist_item}</h4>
                    <Badge variant="outline" className="text-xs">
                      {item.qa_type}
                    </Badge>
                  </div>
                  
                  {item.notes && (
                    <p className="text-sm text-muted-foreground mb-2">{item.notes}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {item.checked_at && (
                      <span>
                        Checked {new Date(item.checked_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {item.status === 'completed' && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
