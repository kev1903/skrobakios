
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Project } from "@/hooks/useProjects";

interface DangerZoneCardProps {
  project: Project;
  onDeleteProject: () => Promise<void>;
  loading: boolean;
}

export const DangerZoneCard = ({ project, onDeleteProject, loading }: DangerZoneCardProps) => {
  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Irreversible and destructive actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Delete Project</h4>
          <p className="text-sm text-red-700 mb-4">
            Once you delete this project, there is no going back. This will permanently delete the project and all associated data.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the project "{project.name}" 
                  and remove all of its data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={onDeleteProject}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? "Deleting..." : "Yes, delete project"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};
