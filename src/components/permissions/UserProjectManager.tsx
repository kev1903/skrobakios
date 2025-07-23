import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ArrowLeft, 
  Building, 
  Calendar,
  User,
  Save,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface UserProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  start_date?: string;
  deadline?: string;
  location?: string;
  company_id: string;
  company_name: string;
  created_at: string;
  updated_at: string;
}

interface UserInfo {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  app_role: string;
  status: string;
}

interface UserProjectManagerProps {
  userId: string;
  userInfo: UserInfo;
  onBack: () => void;
}

export const UserProjectManager: React.FC<UserProjectManagerProps> = ({
  userId,
  userInfo,
  onBack
}) => {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<UserProject | null>(null);
  const { toast } = useToast();

  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    status: 'pending',
    start_date: '',
    deadline: '',
    location: '',
    company_id: ''
  });

  const fetchUserProjects = async () => {
    try {
      setIsLoading(true);
      
      // Get projects where user is a member
      const { data: projectMembers, error: memberError } = await supabase
        .from('project_members')
        .select(`
          project_id,
          role,
          status,
          projects (
            id,
            name,
            description,
            status,
            start_date,
            deadline,
            location,
            company_id,
            created_at,
            updated_at,
            companies (
              name
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (memberError) throw memberError;

      // Transform the data
      const userProjects = projectMembers?.map(pm => ({
        id: pm.projects.id,
        name: pm.projects.name,
        description: pm.projects.description,
        status: pm.projects.status,
        start_date: pm.projects.start_date,
        deadline: pm.projects.deadline,
        location: pm.projects.location,
        company_id: pm.projects.company_id,
        company_name: pm.projects.companies?.name || 'Unknown Company',
        created_at: pm.projects.created_at,
        updated_at: pm.projects.updated_at
      })) || [];

      setProjects(userProjects);
    } catch (error: any) {
      console.error('Error fetching user projects:', error);
      toast({
        title: "Error",
        description: "Failed to load user projects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
    }
  };

  useEffect(() => {
    fetchUserProjects();
    fetchCompanies();
  }, [userId]);

  const resetProjectData = () => {
    setProjectData({
      name: '',
      description: '',
      status: 'pending',
      start_date: '',
      deadline: '',
      location: '',
      company_id: ''
    });
  };

  const handleCreateProject = () => {
    resetProjectData();
    setSelectedProject(null);
    setShowCreateDialog(true);
  };

  const handleEditProject = (project: UserProject) => {
    setProjectData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      start_date: project.start_date || '',
      deadline: project.deadline || '',
      location: project.location || '',
      company_id: project.company_id
    });
    setSelectedProject(project);
    setShowEditDialog(true);
  };

  const handleSaveProject = async () => {
    try {
      if (!projectData.name.trim()) {
        toast({
          title: "Error",
          description: "Project name is required",
          variant: "destructive",
        });
        return;
      }

      if (!projectData.company_id) {
        toast({
          title: "Error",
          description: "Please select a company",
          variant: "destructive",
        });
        return;
      }

      const projectPayload = {
        name: projectData.name.trim(),
        description: projectData.description.trim() || null,
        status: projectData.status,
        start_date: projectData.start_date || null,
        deadline: projectData.deadline || null,
        location: projectData.location.trim() || null,
        company_id: projectData.company_id,
        project_id: `PROJ-${Date.now()}` // Generate a unique project ID
      };

      if (selectedProject) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(projectPayload)
          .eq('id', selectedProject.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      } else {
        // Create new project
        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert(projectPayload)
          .select()
          .single();

        if (projectError) throw projectError;

        // Add user as project member
        const { error: memberError } = await supabase
          .from('project_members')
          .insert({
            project_id: newProject.id,
            user_id: userId,
            email: userInfo.email,
            role: 'member',
            status: 'active',
            joined_at: new Date().toISOString()
          });

        if (memberError) throw memberError;

        toast({
          title: "Success",
          description: "Project created and user assigned successfully",
        });
      }

      setShowCreateDialog(false);
      setShowEditDialog(false);
      fetchUserProjects();
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save project",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to remove this user from the project?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('project_members')
        .update({ status: 'removed' })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User removed from project successfully",
      });

      fetchUserProjects();
    } catch (error: any) {
      console.error('Error removing user from project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove user from project",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Team
              </Button>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userInfo.avatar_url} />
                  <AvatarFallback>
                    {userInfo.first_name?.[0]}{userInfo.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {userInfo.first_name} {userInfo.last_name}'s Projects
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button onClick={handleCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading projects...</div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No projects match your search' : 'No projects assigned to this user'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-muted-foreground">
                            {project.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {project.company_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {project.start_date ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(project.start_date), 'MMM dd, yyyy')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {project.deadline ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(project.deadline), 'MMM dd, yyyy')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {project.location || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromProject(project.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Project for {userInfo.first_name} {userInfo.last_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={projectData.name}
                  onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <Label htmlFor="company">Company *</Label>
                <Select value={projectData.company_id} onValueChange={(value) => setProjectData(prev => ({ ...prev, company_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={projectData.description}
                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter project description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={projectData.status} onValueChange={(value) => setProjectData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={projectData.start_date}
                  onChange={(e) => setProjectData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={projectData.deadline}
                  onChange={(e) => setProjectData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={projectData.location}
                onChange={(e) => setProjectData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter project location"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveProject}>
                <Save className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Project Name *</Label>
                <Input
                  id="edit-name"
                  value={projectData.name}
                  onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <Label htmlFor="edit-company">Company *</Label>
                <Select value={projectData.company_id} onValueChange={(value) => setProjectData(prev => ({ ...prev, company_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={projectData.description}
                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter project description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={projectData.status} onValueChange={(value) => setProjectData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-start_date">Start Date</Label>
                <Input
                  id="edit-start_date"
                  type="date"
                  value={projectData.start_date}
                  onChange={(e) => setProjectData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-deadline">Deadline</Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={projectData.deadline}
                  onChange={(e) => setProjectData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={projectData.location}
                onChange={(e) => setProjectData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter project location"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveProject}>
                <Save className="h-4 w-4 mr-2" />
                Update Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};