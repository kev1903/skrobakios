
import { useState, useEffect } from "react";
import { X, Calendar, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Project } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditProjectFormProps {
  project: Project;
  onClose: () => void;
  onUpdate: (updatedProject: Project) => void;
}

export const EditProjectForm = ({ project, onClose, onUpdate }: EditProjectFormProps) => {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    location: project.location || "",
    contract_price: project.contract_price || "",
    priority: project.priority || "",
    status: project.status,
  });
  const [startDate, setStartDate] = useState<Date | undefined>(
    project.start_date ? new Date(project.start_date) : undefined
  );
  const [deadline, setDeadline] = useState<Date | undefined>(
    project.deadline ? new Date(project.deadline) : undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const updateData = {
        name: formData.name,
        description: formData.description || null,
        location: formData.location || null,
        contract_price: formData.contract_price || null,
        priority: formData.priority || null,
        status: formData.status,
        start_date: startDate?.toISOString().split('T')[0] || null,
        deadline: deadline?.toISOString().split('T')[0] || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', project.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project updated successfully",
      });

      onUpdate(data);
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Project</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Name */}
              <div className="md:col-span-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                  Project Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Contract Price */}
              <div>
                <Label htmlFor="contract_price" className="text-sm font-medium text-gray-700 mb-2 block">
                  Contract Price
                </Label>
                <Input
                  id="contract_price"
                  value={formData.contract_price}
                  onChange={(e) => handleInputChange('contract_price', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Start Date */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select Date..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Deadline */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Deadline
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : "Select Date..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Status */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </Label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Priority
                </Label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full min-h-[100px] resize-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
