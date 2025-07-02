import { useState, useEffect } from "react";
import { ArrowLeft, Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project, useProjects } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { ProjectInformationCard } from "./project-settings/ProjectInformationCard";
import { SharePointIntegrationCard } from "./project-settings/SharePointIntegrationCard";
import { TimelineStatusCard } from "./project-settings/TimelineStatusCard";
import { DangerZoneCard } from "./project-settings/DangerZoneCard";
import { ProjectOverviewCard } from "./project-settings/ProjectOverviewCard";
import { ProjectBannerCard } from "./project-settings/ProjectBannerCard";

interface ProjectSettingsPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectSettingsPage = ({ project, onNavigate }: ProjectSettingsPageProps) => {
  const { toast } = useToast();
  const { deleteProject, updateProject, loading } = useProjects();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    location: project.location || "",
    coordinates: undefined as { lat: number; lng: number } | undefined,
    priority: project.priority || "Medium",
    status: project.status,
    start_date: project.start_date || "",
    deadline: project.deadline || "",
    sharepoint_link: "",
    banner_image: "",
    banner_position: { x: 0, y: 0, scale: 1 },
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

  const handleInputChange = (field: string, value: string | { lat: number; lng: number } | { x: number; y: number; scale: number }) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateSharePointLink = (url: string) => {
    return url.includes('sharepoint.com') || url.includes('onedrive.com') || url === '';
  };

  const handleSave = async () => {
    if (formData.sharepoint_link && !validateSharePointLink(formData.sharepoint_link)) {
      toast({
        title: "Invalid SharePoint Link",
        description: "Please enter a valid SharePoint or OneDrive link.",
        variant: "destructive",
      });
      return;
    }

    console.log("Saving project settings:", formData);
    
    // Prepare project updates (only include fields that exist in the database)
    const projectUpdates = {
      name: formData.name,
      description: formData.description,
      location: formData.location,
      priority: formData.priority,
      status: formData.status,
      start_date: formData.start_date || null,
      deadline: formData.deadline || null,
    };

    // Update project in the database
    const updatedProject = await updateProject(project.id, projectUpdates);
    
    if (updatedProject) {
      // Store additional settings in localStorage (since they're not in the projects table)
      if (formData.sharepoint_link) {
        localStorage.setItem(`project_sharepoint_${project.id}`, formData.sharepoint_link);
      }

      if (formData.coordinates) {
        localStorage.setItem(`project_coordinates_${project.id}`, JSON.stringify(formData.coordinates));
      }

      if (formData.banner_image) {
        localStorage.setItem(`project_banner_${project.id}`, formData.banner_image);
      }

      if (formData.banner_position) {
        localStorage.setItem(`project_banner_position_${project.id}`, JSON.stringify(formData.banner_position));
      }

      toast({
        title: "Settings Saved",
        description: "Project settings have been updated successfully.",
      });
      
      // Navigate back to project detail to see the updated data
      setTimeout(() => {
        onNavigate("project-detail");
      }, 1000);
    } else {
      toast({
        title: "Save Failed",
        description: "Failed to update project settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async () => {
    const success = await deleteProject(project.id);
    
    if (success) {
      toast({
        title: "Project Deleted",
        description: "The project has been permanently deleted.",
      });
      // Navigate back to dashboard after deletion
      onNavigate("dashboard");
    } else {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive",
      });
    }
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

    // Load existing coordinates from localStorage
    const savedCoordinates = localStorage.getItem(`project_coordinates_${project.id}`);
    if (savedCoordinates) {
      try {
        const coordinates = JSON.parse(savedCoordinates);
        setFormData(prev => ({
          ...prev,
          coordinates
        }));
      } catch (error) {
        console.error('Error parsing saved coordinates:', error);
      }
    }

    // Load existing banner image from localStorage
    const savedBanner = localStorage.getItem(`project_banner_${project.id}`);
    if (savedBanner) {
      setFormData(prev => ({
        ...prev,
        banner_image: savedBanner
      }));
    }

    // Load existing banner position from localStorage
    const savedBannerPosition = localStorage.getItem(`project_banner_position_${project.id}`);
    if (savedBannerPosition) {
      try {
        const bannerPosition = JSON.parse(savedBannerPosition);
        setFormData(prev => ({
          ...prev,
          banner_position: bannerPosition
        }));
      } catch (error) {
        console.error('Error parsing saved banner position:', error);
      }
    }
  }, [project.id]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="relative backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-b border-white/20 dark:border-slate-700/20 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  Project Settings
                </h1>
                <p className="text-sm text-slate-500 mt-1">Manage your project configuration and details</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-1 lg:grid-cols-4 backdrop-blur-sm bg-white/60">
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="integration" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Integration</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="danger" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Danger Zone</span>
              </TabsTrigger>
            </TabsList>

            <div className="space-y-6">
              <TabsContent value="general" className="space-y-6 mt-0">
                <ProjectBannerCard 
                  formData={formData}
                  onInputChange={handleInputChange}
                />
                <ProjectInformationCard 
                  formData={formData}
                  onInputChange={handleInputChange}
                />
                <ProjectOverviewCard 
                  project={project}
                  formData={formData}
                  onInputChange={handleInputChange}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                />
              </TabsContent>

              <TabsContent value="integration" className="space-y-6 mt-0">
                <SharePointIntegrationCard 
                  formData={formData}
                  onInputChange={handleInputChange}
                />
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6 mt-0">
                <TimelineStatusCard 
                  formData={formData}
                  onInputChange={handleInputChange}
                />
              </TabsContent>

              <TabsContent value="danger" className="space-y-6 mt-0">
                <DangerZoneCard 
                  project={project}
                  onDeleteProject={handleDeleteProject}
                  loading={loading}
                />
              </TabsContent>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
