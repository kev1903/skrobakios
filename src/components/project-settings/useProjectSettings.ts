import { useState, useEffect } from "react";
import { Project, useProjects } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { ProjectSettingsFormData } from "./types";
import { validateSharePointLink } from "./utils";

export const useProjectSettings = (project: Project) => {
  const { toast } = useToast();
  const { deleteProject, updateProject, loading } = useProjects();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<ProjectSettingsFormData>({
    project_id: project.project_id,
    name: project.name,
    description: project.description || "",
    location: project.location || "",
    coordinates: undefined,
    priority: project.priority || "Medium",
    status: project.status,
    start_date: project.start_date || "",
    deadline: project.deadline || "",
    sharepoint_link: "",
    banner_image: "",
    banner_position: { x: 0, y: 0, scale: 1 },
  });

  const handleInputChange = (field: string, value: string | { lat: number; lng: number } | { x: number; y: number; scale: number }) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      project_id: formData.project_id,
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
      
      return true;
    } else {
      toast({
        title: "Save Failed",
        description: "Failed to update project settings. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteProject = async () => {
    const success = await deleteProject(project.id);
    
    if (success) {
      toast({
        title: "Project Deleted",
        description: "The project has been permanently deleted.",
      });
      return true;
    } else {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive",
      });
      return false;
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

  return {
    activeTab,
    setActiveTab,
    formData,
    handleInputChange,
    handleSave,
    handleDeleteProject,
    loading
  };
};