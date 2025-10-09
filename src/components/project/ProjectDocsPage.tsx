import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { useProjectLinks, ProjectLink } from '@/hooks/useProjectLinks';
import { useProjectDocuments } from '@/hooks/useProjectDocuments';
import { ProjectLinkDialog } from './ProjectLinkDialog';
import { ProjectPageHeader } from './ProjectPageHeader';
import { Plus, Link, Edit, Trash2, ExternalLink, FileText } from 'lucide-react';
import { getStatusColor, getStatusText } from '../tasks/utils/taskUtils';

interface ProjectDocsPageProps {
  onNavigate: (page: string) => void;
}

export const ProjectDocsPage = ({
  onNavigate
}: ProjectDocsPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
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

  // Project documents management
  const { documents, loading: docsLoading, deleteDocument, formatFileSize } = useProjectDocuments(projectId || undefined);
  
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
  
  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The requested project could not be found.</p>
          <Button onClick={() => onNavigate('projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex bg-background min-h-screen">
      {/* Fixed Project Sidebar */}
      <div className="fixed left-0 top-0 h-full w-40 z-40">
        <ProjectSidebar 
          project={project} 
          onNavigate={onNavigate} 
          getStatusColor={getStatusColor} 
          getStatusText={getStatusText} 
          activeSection="docs" 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-40 bg-background">
        {/* Header Section */}
        <ProjectPageHeader 
          projectName={project.name}
          pageTitle="Project Documents & Links"
          onNavigate={onNavigate}
        />
        
        <div className="p-6">
          <Tabs defaultValue="links" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="links" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Project Links
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Project Docs
              </TabsTrigger>
            </TabsList>

            {/* Project Links Tab */}
            <TabsContent value="links">
              <div className="bg-card border rounded-lg">
                {/* Header */}
                <div className="bg-muted/30 border-b px-6 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Link className="h-5 w-5" />
                      Project Links
                    </h3>
                    <Button onClick={handleAddLink}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                </div>

                {/* Links Content */}
                <div className="p-6">
                  {linksLoading ? (
                    <div className="text-center py-8">Loading links...</div>
                  ) : links.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No links added yet. Click "Add Link" to get started.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {links.map(link => (
                        <div 
                          key={link.id} 
                          className="group flex items-center justify-between p-3 rounded-lg border border-border/40 hover:border-border hover:bg-accent/20 transition-all duration-200"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-2 h-2 rounded-full bg-primary/60 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground truncate">{link.title}</h4>
                                <span className="text-xs text-muted-foreground/70 bg-muted/30 px-2 py-0.5 rounded-full flex-shrink-0">
                                  {link.category}
                                </span>
                              </div>
                              {link.description && (
                                <p className="text-sm text-muted-foreground/80 truncate">{link.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-primary/10" 
                              onClick={() => window.open(link.url, '_blank')} 
                              title="Open link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-primary/10" 
                              onClick={() => handleEditLink(link)} 
                              title="Edit link"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive" 
                              onClick={() => handleDeleteLink(link)} 
                              title="Delete link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Project Docs Tab */}
            <TabsContent value="docs">
              <div className="bg-card border rounded-lg">
                {/* Header */}
                <div className="bg-muted/30 border-b px-6 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Project Documents
                    </h3>
                  </div>
                </div>

                {/* Documents Content */}
                <div className="p-6">
                  {docsLoading ? (
                    <div className="text-center py-8">Loading documents...</div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No documents uploaded yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documents.map(doc => (
                        <div 
                          key={doc.id} 
                          className="group flex items-center justify-between p-3 rounded-lg border border-border/40 hover:border-border hover:bg-accent/20 transition-all duration-200"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <FileText className="h-5 w-5 text-primary/60 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground truncate">{doc.name}</h4>
                                <span className="text-xs text-muted-foreground/70 bg-muted/30 px-2 py-0.5 rounded-full flex-shrink-0">
                                  {formatFileSize(doc.file_size)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground/80">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-primary/10" 
                              onClick={() => window.open(doc.file_url, '_blank')} 
                              title="View document"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive" 
                              onClick={() => deleteDocument(doc.id)} 
                              title="Delete document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Link Dialog */}
      {projectId && (
        <ProjectLinkDialog 
          open={linkDialogOpen} 
          onOpenChange={setLinkDialogOpen} 
          onSubmit={handleLinkSubmit} 
          link={selectedLink} 
          projectId={projectId} 
          mode={linkDialogMode} 
        />
      )}

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
    </div>
  );
};