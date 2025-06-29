import { useState, useEffect } from "react";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, Users, Calendar, DollarSign, MapPin, ExternalLink, LinkIcon } from "lucide-react";
import { Project } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";

interface ProjectSettingsPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectSettingsPage = ({ project, onNavigate }: ProjectSettingsPageProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    contract_price: project.contract_price || "",
    location: project.location || "",
    priority: project.priority || "Medium",
    status: project.status,
    start_date: project.start_date || "",
    deadline: project.deadline || "",
    sharepoint_link: "",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "on_hold": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Completed";
      case "in_progress": return "In Progress";
      case "pending": return "Pending";
      case "on_hold": return "On Hold";
      default: return "Unknown";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateSharePointLink = (url: string) => {
    return url.includes('sharepoint.com') || url.includes('onedrive.com') || url === '';
  };

  const handleSave = () => {
    if (formData.sharepoint_link && !validateSharePointLink(formData.sharepoint_link)) {
      toast({
        title: "Invalid SharePoint Link",
        description: "Please enter a valid SharePoint or OneDrive link.",
        variant: "destructive",
      });
      return;
    }

    // In a real application, this would update the project in the database
    console.log("Saving project settings:", formData);
    
    // Store SharePoint link in localStorage for demo purposes
    if (formData.sharepoint_link) {
      localStorage.setItem(`project_sharepoint_${project.id}`, formData.sharepoint_link);
    }

    toast({
      title: "Settings Saved",
      description: "Project settings have been updated successfully.",
    });
  };

  const testSharePointConnection = () => {
    if (!formData.sharepoint_link) {
      toast({
        title: "No SharePoint Link",
        description: "Please enter a SharePoint link first.",
        variant: "destructive",
      });
      return;
    }

    if (!validateSharePointLink(formData.sharepoint_link)) {
      toast({
        title: "Invalid Link",
        description: "Please enter a valid SharePoint or OneDrive link.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Connection Test",
      description: "SharePoint link is valid and ready to use.",
    });
  };

  useEffect(() => {
    // Load existing SharePoint link from localStorage
    const savedLink = localStorage.getItem(`project_sharepoint_${project.id}`);
    if (savedLink) {
      setFormData(prev => ({
        ...prev,
        sharepoint_link: savedLink
      }));
    }
  }, [project.id]);

  return (
    <div className="flex h-screen bg-gray-50">
      <ProjectSidebar 
        project={project} 
        onNavigate={onNavigate} 
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="setting"
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Project Settings</h1>
            <p className="text-gray-600 mt-1">Manage your project configuration and details</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Information card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Project Information
                  </CardTitle>
                  <CardDescription>
                    Basic information about your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter project name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="Enter project location"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SharePoint Integration Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    SharePoint Integration
                  </CardTitle>
                  <CardDescription>
                    Connect your project to a SharePoint folder for file management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sharepoint-link">SharePoint Folder Link</Label>
                    <Input
                      id="sharepoint-link"
                      value={formData.sharepoint_link}
                      onChange={(e) => handleInputChange("sharepoint_link", e.target.value)}
                      placeholder="Paste your SharePoint folder link here (e.g., https://company.sharepoint.com/...)"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Paste the SharePoint or OneDrive folder link where your project files are stored
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={testSharePointConnection}
                      disabled={!formData.sharepoint_link}
                    >
                      Test Connection
                    </Button>
                    {formData.sharepoint_link && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(formData.sharepoint_link, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open in SharePoint
                      </Button>
                    )}
                  </div>
                  
                  {formData.sharepoint_link && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <LinkIcon className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">SharePoint Connected</p>
                          <p className="text-xs text-blue-700">
                            Files from this SharePoint folder will be displayed in the Project Files page
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline & Status card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Timeline & Status
                  </CardTitle>
                  <CardDescription>
                    Manage project timeline and current status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleInputChange("start_date", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => handleInputChange("deadline", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Financial Information
                  </CardTitle>
                  <CardDescription>
                    Project budget and contract details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="contract-price">Contract Price</Label>
                    <Input
                      id="contract-price"
                      value={formData.contract_price}
                      onChange={(e) => handleInputChange("contract_price", e.target.value)}
                      placeholder="Enter contract price (e.g., $2,450,000)"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Overview Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Project ID</span>
                    </div>
                    <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {project.project_id}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Current Status</span>
                    </div>
                    <Badge variant="outline" className={getStatusColor(formData.status)}>
                      {getStatusText(formData.status)}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Priority</span>
                    </div>
                    <Badge variant="outline">
                      {formData.priority}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Created</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Last Updated</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Manage who has access to this project
                  </p>
                  <Button variant="outline" className="w-full">
                    Manage Team
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
