
import { useState, useEffect } from "react";
import { X, Calendar, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { convertDbRowToProject } from "@/utils/projectTypeConverter";
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

      onUpdate(convertDbRowToProject(data));
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
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Input
                    id="contract_price"
                    type="number"
                    step="0.01"
                    value={formData.contract_price}
                    onChange={(e) => handleInputChange('contract_price', e.target.value)}
                    className="pl-8 pr-16"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-xs">Inc GST</span>
                  </div>
                </div>
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
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Priority
                </Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
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
