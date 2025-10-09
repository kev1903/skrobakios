import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { useProjectLinks, ProjectLink } from '@/hooks/useProjectLinks';
import { ProjectLinkDialog } from './ProjectLinkDialog';
import { ProjectPageHeader } from './ProjectPageHeader';
import { Plus, FileText, Link, Download, Eye, Edit, Trash2, Upload, ExternalLink, Folder, ChevronRight } from 'lucide-react';
import { getStatusColor, getStatusText } from '../tasks/utils/taskUtils';
interface ProjectDocsPageProps {
  onNavigate: (page: string) => void;
}
export const ProjectDocsPage = ({
  onNavigate
}: ProjectDocsPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const tabParam = searchParams.get('tab') || 'files';
  const defaultTab = (['files', 'links'] as const).includes(tabParam as any) ? tabParam as any : 'files';
  const {
    getProject
  } = useProjects();
  const [project, setProject] = useState<Project | null>(null);

  // Project links management
  const {
    links,
    loading: linksLoading,
    createLink,
    updateLink,
    deleteLink
  } = useProjectLinks(projectId || undefined);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkDialogMode, setLinkDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedLink, setSelectedLink] = useState<ProjectLink | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<ProjectLink | undefined>();

  // Mock data for folders
  const [folders] = useState([
    {
      id: '1',
      name: 'Drawings & Plans',
      fileCount: 24,
      lastModified: '2024-01-15',
      size: '156 MB',
      type: 'Technical Documents'
    },
    {
      id: '2', 
      name: 'Specifications',
      fileCount: 12,
      lastModified: '2024-01-14',
      size: '45 MB',
      type: 'Project Documents'
    },
    {
      id: '3',
      name: 'Site Photos',
      fileCount: 89,
      lastModified: '2024-01-13',
      size: '234 MB',
      type: 'Media'
    },
    {
      id: '4',
      name: 'Contracts & Legal',
      fileCount: 8,
      lastModified: '2024-01-12',
      size: '12 MB',
      type: 'Legal Documents'
    },
    {
      id: '5',
      name: 'Invoices & Financial',
      fileCount: 34,
      lastModified: '2024-01-11',
      size: '28 MB',
      type: 'Financial'
    },
    {
      id: '6',
      name: 'Reports & Analysis',
      fileCount: 15,
      lastModified: '2024-01-10',
      size: '67 MB',
      type: 'Reports'
    }
  ]);
  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        try {
          const fetchedProject = await getProject(projectId);
          setProject(fetchedProject);
        } catch (error) {
          console.error('Failed to fetch project:', error);
        }
      };
      fetchProject();
    }
  }, [projectId, getProject]);
  const getFileIcon = (type: string) => {
    return <FileText className="w-5 h-5 text-blue-600" />;
  };
  const handleAddLink = () => {
    setLinkDialogMode('create');
    setSelectedLink(undefined);
    setLinkDialogOpen(true);
  };
  const handleEditLink = (link: ProjectLink) => {
    setLinkDialogMode('edit');
    setSelectedLink(link);
    setLinkDialogOpen(true);
  };
  const handleDeleteLink = (link: ProjectLink) => {
    setLinkToDelete(link);
    setDeleteDialogOpen(true);
  };
  const confirmDeleteLink = async () => {
    if (linkToDelete) {
      await deleteLink(linkToDelete.id);
      setDeleteDialogOpen(false);
      setLinkToDelete(undefined);
    }
  };
  const handleLinkSubmit = async (data: any) => {
    if (linkDialogMode === 'create') {
      await createLink(data);
    } else if (selectedLink) {
      await updateLink(selectedLink.id, data);
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  if (!project) {
    return <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The requested project could not be found.</p>
          <Button onClick={() => onNavigate('projects')}>Back to Projects</Button>
        </div>
      </div>;
  }
  return <div className="flex bg-background min-h-screen">
      {/* Fixed Project Sidebar */}
      <div className="fixed left-0 top-0 h-full w-40 z-40">
        <ProjectSidebar project={project} onNavigate={onNavigate} getStatusColor={getStatusColor} getStatusText={getStatusText} activeSection="docs" />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-40 bg-background">
        {/* Header Section */}
        <ProjectPageHeader 
          projectName={project.name}
          pageTitle="Project Documents"
          onNavigate={onNavigate}
        />
        
        <div className="p-6">
          {/* Main Content with Tabs */}
          <div className="bg-card border rounded-lg">
            <Tabs defaultValue={defaultTab} className="w-full">
              {/* Tab Header */}
              <div className="bg-muted/30 border-b px-6 py-3">
                <div className="flex items-center justify-between">
                  {/* Left side - Tab buttons */}
                  <div className="flex items-center gap-6">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                      <TabsTrigger value="files" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Files</span>
                      </TabsTrigger>
                      <TabsTrigger value="links" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">
                        <Link className="h-4 w-4" />
                        <span>Links</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Right side - Action buttons */}
                  <div className="flex items-center gap-4">
                    <Button onClick={() => {
                    if (defaultTab === 'links') {
                      handleAddLink();
                    } else {
                      // TODO: Handle file upload when implemented
                      console.log('File upload not implemented yet');
                    }
                  }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <TabsContent value="files" className="space-y-0 mt-0">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-foreground">Project Folders</h3>
                    <Button size="sm" className="h-8 text-sm">
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      New Folder
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    {folders.map(folder => (
                      <div 
                        key={folder.id}
                        className="group flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex-shrink-0">
                            <Folder className="w-5 h-5 text-muted-foreground/60" strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-foreground">{folder.name}</span>
                              <span className="text-xs text-muted-foreground/60">
                                {folder.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground/70 mt-0.5">
                              <span>{folder.fileCount} files</span>
                              <span>•</span>
                              <span>{folder.size}</span>
                              <span>•</span>
                              <span>Modified {folder.lastModified}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" strokeWidth={1.5} />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="links" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Project Links</h3>
                    <Button onClick={handleAddLink}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                  
                  {linksLoading ? <div className="text-center py-8">Loading links...</div> : links.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                      No links added yet. Click "Add Link" to get started.
                    </div> : <div className="space-y-2">
                      {links.map(link => <div key={link.id} className="group flex items-center justify-between p-3 rounded-lg border border-border/40 hover:border-border hover:bg-accent/20 transition-all duration-200">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-2 h-2 rounded-full bg-primary/60 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground truncate">{link.title}</h4>
                                <span className="text-xs text-muted-foreground/70 bg-muted/30 px-2 py-0.5 rounded-full flex-shrink-0">
                                  {link.category}
                                </span>
                              </div>
                              {link.description && <p className="text-sm text-muted-foreground/80 truncate">{link.description}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10" onClick={() => window.open(link.url, '_blank')} title="Open link">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10" onClick={() => handleEditLink(link)} title="Edit link">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteLink(link)} title="Delete link">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>)}
                    </div>}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Link Dialog */}
      {projectId && <ProjectLinkDialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen} onSubmit={handleLinkSubmit} link={selectedLink} projectId={projectId} mode={linkDialogMode} />}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{linkToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLink}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};