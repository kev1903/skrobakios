import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DatabaseOperation {
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data?: any;
  filters?: any;
  explanation: string;
  requiresConfirmation?: boolean;
}

export interface DatabaseOperationResponse {
  success: boolean;
  operation?: string;
  table?: string;
  explanation?: string;
  data?: any;
  recordsAffected?: number;
  error?: string;
  details?: string;
}

export const useSkaiDatabaseOperations = () => {
  const [isExecuting, setIsExecuting] = useState(false);

  const executeOperation = async (
    prompt: string,
    context?: {
      projectId?: string;
      projectName?: string;
      currentPage?: string;
    }
  ): Promise<DatabaseOperationResponse> => {
    setIsExecuting(true);
    
    try {
      console.log('Executing SkAi database operation:', { prompt, context });
      
      const { data, error } = await supabase.functions.invoke('skai-database-operations', {
        body: {
          prompt,
          projectId: context?.projectId,
          context: context || {}
        }
      });

      if (error) {
        console.error('Database operation error:', error);
        
        // Show more detailed error message
        const errorMsg = error.message || 'Failed to execute database operation';
        toast.error(errorMsg, {
          description: 'Please try again or simplify your request',
          duration: 5000
        });
        
        return {
          success: false,
          error: errorMsg,
          details: 'Failed to execute database operation'
        };
      }

      console.log('Database operation result:', data);

      if (data.success) {
        toast.success(`Successfully ${data.operation?.toLowerCase()}d data in ${data.table}`);
        
        // Trigger refresh for task-related operations
        if (data.table === 'wbs_items' && data.operation === 'INSERT') {
          // Dispatch custom event to notify components of new task creation
          window.dispatchEvent(new CustomEvent('skai-task-created', {
            detail: { projectId: context?.projectId }
          }));
        }
        
        return data;
      } else {
        // Show detailed error with suggestion if available
        const errorMsg = data.error || 'Database operation failed';
        const suggestion = data.suggestion || data.details;
        
        toast.error(errorMsg, {
          description: suggestion,
          duration: 6000
        });
        
        return data;
      }
    } catch (error) {
      console.error('Error executing database operation:', error);
      toast.error('Unexpected error occurred');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Unexpected error during database operation'
      };
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    executeOperation,
    isExecuting
  };
};