import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const UserCleanupButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCleanup = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('cleanup-auth-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Cleanup Successful",
          description: data.message,
        });
      } else {
        throw new Error(data.error || 'Cleanup failed');
      }
    } catch (error: any) {
      console.error('Cleanup error:', error);
      toast({
        title: "Cleanup Failed",
        description: error.message || 'An error occurred during cleanup',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear All Users
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Clear All Users
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete ALL users from the system except your superadmin account. 
            This action cannot be undone.
            
            <div className="mt-3 p-3 bg-destructive/10 rounded-md">
              <strong>What will be deleted:</strong>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>All user accounts (except superadmin)</li>
                <li>All user profiles</li>
                <li>All user roles</li>
                <li>All orphaned data</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCleanup}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? "Cleaning up..." : "Yes, Clear All Users"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};