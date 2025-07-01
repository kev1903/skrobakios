
import { useState } from "react";
import { ArrowLeft, Upload, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useProjects } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";

interface CreateProjectProps {
  onNavigate: (page: string) => void;
}

export const CreateProject = ({ onNavigate }: CreateProjectProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [deadline, setDeadline] = useState<Date>();
  const [projectId, setProjectId] = useState("SK 002");
  const [projectName, setProjectName] = useState("");
  const [contractPrice, setContractPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [location, setLocation] = useState("");

  const { createProject, loading } = useProjects();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    console.log("Saving project...");
    
    const projectData = {
      project_id: projectId,
      name: projectName,
      description: description || undefined,
      contract_price: contractPrice || undefined,
      start_date: startDate,
      deadline: deadline,
      status: selectedStatus,
      priority: selectedPriority || undefined,
      location: location || undefined,
    };

    const result = await createProject(projectData);
    
    if (result) {
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      onNavigate("projects");
    } else {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    onNavigate("dashboard");
  };

  return (
    <div className="min-h-screen glass-bg p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("dashboard")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-amber-600 bg-clip-text text-transparent heading-modern">Create Project</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <span>3D View</span>
            </Button>
          </div>
        </div>

        {/* Main Form */}
        <Card>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Project Image Upload */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Project Image
                  </Label>
                  <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center bg-white/20 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-amber-500 mb-2" />
                      <p className="text-sm text-slate-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        SVG, PNG or JPG (max 800x400)
                      </p>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <Button variant="outline" size="sm">
                        Paste
                      </Button>
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Project ID */}
                <div>
                  <Label htmlFor="projectId" className="text-sm font-medium text-slate-700 mb-2 block">
                    Project ID
                  </Label>
                  <Input
                    id="projectId"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full input-glass"
                  />
                </div>

                {/* Project Name */}
                <div>
                  <Label htmlFor="projectName" className="text-sm font-medium text-slate-700 mb-2 block">
                    Project Name *
                  </Label>
                  <Input
                    id="projectName"
                    placeholder="Enter Project Name..."
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full input-glass"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-slate-700 mb-2 block">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="Enter Location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full input-glass"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
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
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Contract Price */}
                <div>
                  <Label htmlFor="contractPrice" className="text-sm font-medium text-slate-700 mb-2 block">
                    Contract Price
                  </Label>
                  <Input
                    id="contractPrice"
                    placeholder="Contract Price"
                    value={contractPrice}
                    onChange={(e) => setContractPrice(e.target.value)}
                    className="w-full input-glass"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Deadline */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
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
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Project Status */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Project Status
                  </Label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 backdrop-blur-sm bg-white/60 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
                  >
                    <option value="pending">Pending</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Project Priority */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Project Priority
                  </Label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 backdrop-blur-sm bg-white/60 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
                  >
                    <option value="">Select Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Invite */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Invite
                  </Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-muted-foreground"
                  >
                    Invite People
                  </Button>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700 mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[120px] resize-none input-glass"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
