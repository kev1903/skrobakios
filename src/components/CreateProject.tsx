
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

  const handleSave = () => {
    console.log("Saving project...");
    // Here you would typically save the project data
    onNavigate("dashboard");
  };

  const handleCancel = () => {
    onNavigate("dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
            <h1 className="text-2xl font-bold text-gray-900">Create Project</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <span>3D View</span>
            </Button>
          </div>
        </div>

        {/* Main Form */}
        <Card className="bg-white">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Project Image Upload */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Project Image
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-blue-500 mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
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
                  <Label htmlFor="projectId" className="text-sm font-medium text-gray-700 mb-2 block">
                    Project ID
                  </Label>
                  <Input
                    id="projectId"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Project Name */}
                <div>
                  <Label htmlFor="projectName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Project Name
                  </Label>
                  <Input
                    id="projectName"
                    placeholder="Enter Project Name..."
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
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
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Project Status */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Project Status
                  </Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-muted-foreground"
                  >
                    Select Status
                  </Button>
                </div>

                {/* Contract Price */}
                <div>
                  <Label htmlFor="contractPrice" className="text-sm font-medium text-gray-700 mb-2 block">
                    Contract Price
                  </Label>
                  <Input
                    id="contractPrice"
                    placeholder="Contract Price"
                    value={contractPrice}
                    onChange={(e) => setContractPrice(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Invite */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Invite
                  </Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-muted-foreground"
                  >
                    Invite People
                  </Button>
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
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Project Priority */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Project Priority
                  </Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-muted-foreground"
                  >
                    Select Priority
                  </Button>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[120px] resize-none"
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
