
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project } from "@/hooks/useProjects";
import { Info } from "lucide-react";

interface ProjectOverviewCardProps {
  project: Project;
  formData: {
    project_id: string;
    priority: string;
    status: string;
    contract_price: string;
  };
  onInputChange: (field: string, value: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const ProjectOverviewCard = ({ 
  project, 
  formData, 
  onInputChange,
  getStatusColor, 
  getStatusText 
}: ProjectOverviewCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Project Overview
        </CardTitle>
        <CardDescription>
          Key project information and current status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-id" className="text-sm font-medium text-gray-600">
                Project ID
              </Label>
              <Input
                id="project-id"
                value={formData.project_id}
                onChange={(e) => onInputChange("project_id", e.target.value)}
                className="font-mono text-sm"
                placeholder="Enter project ID"
              />
            </div>
            
            <div>
              <Label htmlFor="project-status" className="text-sm font-medium text-gray-600">
                Current Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => onInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="running">In Progress</SelectItem>
                  <SelectItem value="pending">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2">
                <Badge variant="outline" className={getStatusColor(formData.status)}>
                  {getStatusText(formData.status)}
                </Badge>
              </div>
            </div>
            
            <div>
              <Label htmlFor="project-priority" className="text-sm font-medium text-gray-600">
                Priority
              </Label>
              <Select value={formData.priority} onValueChange={(value) => onInputChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2">
                <Badge variant="outline">
                  {formData.priority}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="contract-amount" className="text-sm font-medium text-gray-600">
                Contract Amount
              </Label>
              <Input
                id="contract-amount"
                value={formData.contract_price}
                onChange={(e) => onInputChange("contract_price", e.target.value)}
                placeholder="Enter contract amount"
                className="text-sm"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Created
              </Label>
              <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Last Updated
              </Label>
              <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                {new Date(project.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
