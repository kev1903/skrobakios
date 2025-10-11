import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { useProjectLinks, ProjectLink } from '@/hooks/useProjectLinks';
import { useProjectDocuments } from '@/hooks/useProjectDocuments';
import { ProjectLinkDialog } from './ProjectLinkDialog';
import { DocumentUpload } from '../project-documents/DocumentUpload';
import { DocumentEditDialog } from './DocumentEditDialog';
import { ProjectPageHeader } from './ProjectPageHeader';
import { ProjectKnowledgeStatus } from './ProjectKnowledgeStatus';
import { CategoryDialog } from './CategoryDialog';
import { FileText, Upload, ChevronDown, ChevronRight, Download, Trash2, Link, Plus, Edit, ExternalLink, Sparkles, Loader2, XCircle, RotateCw } from 'lucide-react';
import { getStatusColor, getStatusText } from '../tasks/utils/taskUtils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProjectDocsPageProps {
  onNavigate: (page: string) => void;
}

export const ProjectDocsPage = ({ onNavigate }: ProjectDocsPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const { toast } = useToast();

  // Project documents management
  const { documents, loading: docsLoading, deleteDocument, formatFileSize, refetch: refetchDocuments } = useProjectDocuments(projectId || undefined);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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

  // Document edit dialog state
  const [editDocDialogOpen, setEditDocDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | undefined>();

  // Analysis progress tracking
  const [categoryAnalysisProgress, setCategoryAnalysisProgress] = useState<Record<string, { analyzing: boolean; progress: number; total: number }>>({});
  const [activeAnalysisControllers, setActiveAnalysisControllers] = useState<Record<string, AbortController>>({});

  // Category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // Document categories - now dynamic
  const [documentCategories, setDocumentCategories] = useState([
    {
      id: 'architectural',
      title: 'Architectural',
      icon: FileText,
    },
    {
      id: 'structural',
      title: 'Structural Engineering',
      icon: FileText,
    },
  ]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleUploadClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setUploadDialogOpen(true);
  };

  const getDocumentsByCategory = (categoryId: string) => {
    return documents.filter(doc => 
      doc.document_type?.toLowerCase() === categoryId.toLowerCase()
    );
  };
  
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

      // Subscribe to real-time analysis progress updates
      const channel = supabase
        .channel('analysis-progress')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'project_documents',
            filter: `project_id=eq.${projectId}`
          },
          async (payload) => {
            console.log('Document update received:', payload);
            // Update progress when documents are analyzed
            if (payload.new.ai_summary && payload.new.ai_summary.trim().length > 0) {
              // Recalculate progress for affected category
              const documentType = payload.new.document_type;
              if (documentType) {
                await refetchDocuments(); // Refresh document list
                await updateCategoryProgress(documentType);
                
                // Show success toast
                toast({
                  title: 'Analysis Complete',
                  description: `${payload.new.name} has been analyzed`,
                });
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [projectId, getProject]);

  // Initialize progress tracking when documents load
  useEffect(() => {
    if (documents.length > 0 && projectId) {
      documentCategories.forEach(category => {
        updateCategoryProgress(category.id);
      });
    }
  }, [documents.length, projectId]);

  const updateCategoryProgress = async (categoryId: string) => {
    try {
      const categoryDocs = documents.filter(doc => 
        doc.document_type?.toLowerCase() === categoryId.toLowerCase()
      );
      
      const total = categoryDocs.length;
      if (total === 0) {
        setCategoryAnalysisProgress(prev => ({
          ...prev,
          [categoryId]: { analyzing: false, progress: 0, total: 0 }
        }));
        return;
      }

      // Count documents with actual AI summaries (not just completed status)
      const analyzed = categoryDocs.filter(doc => doc.ai_summary && doc.ai_summary.trim().length > 0).length;
      const isAnalyzing = categoryAnalysisProgress[categoryId]?.analyzing || false;

      setCategoryAnalysisProgress(prev => ({
        ...prev,
        [categoryId]: {
          analyzing: isAnalyzing && analyzed < total,
          progress: analyzed,
          total: total
        }
      }));
    } catch (error) {
      console.error('Error updating category progress:', error);
    }
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

  const handleDocumentClick = (doc: any) => {
    setSelectedDocument(doc);
    setEditDocDialogOpen(true);
  };

  const handleDocumentUpdated = () => {
    refetchDocuments();
    setEditDocDialogOpen(false);
  };

  const handleDocumentDelete = async (docId: string) => {
    await deleteDocument(docId);
    setEditDocDialogOpen(false);
  };

  const handleAnalyzeDocument = async (documentId: string, documentName: string, signal?: AbortSignal) => {
    try {
      console.log('Triggering analysis for:', documentName, documentId);
      
      // Validate required data
      if (!projectId || !project?.company_id) {
        console.error('Missing required data:', { projectId, companyId: project?.company_id });
        toast({
          title: "Analysis failed",
          description: "Project data is not loaded yet. Please wait and try again.",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('sync-project-knowledge', {
        body: { 
          projectId, 
          companyId: project.company_id,
          documentId
        }
      });

      if (signal?.aborted) {
        console.log('Analysis cancelled for:', documentName);
        return;
      }

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Analysis response:', data);

      if (!data || !data.success) {
        throw new Error(data?.error || 'Analysis failed');
      }

      toast({
        title: 'Analysis Started',
        description: `SkAi is analyzing ${documentName}...`,
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }
      console.error('Error triggering document analysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start document analysis';
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleAnalyzeCategory = async (categoryId: string) => {
    const categoryDocs = getDocumentsByCategory(categoryId);
    
    if (categoryDocs.length === 0) return;

    // Create abort controller for this analysis
    const controller = new AbortController();
    setActiveAnalysisControllers(prev => ({
      ...prev,
      [categoryId]: controller
    }));

    // Set analyzing state
    setCategoryAnalysisProgress(prev => ({
      ...prev,
      [categoryId]: {
        analyzing: true,
        progress: 0,
        total: categoryDocs.length
      }
    }));

    // Trigger analysis for all documents sequentially to avoid overload
    for (const doc of categoryDocs) {
      if (controller.signal.aborted) break;
      await handleAnalyzeDocument(doc.id, doc.name, controller.signal);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Set up polling to update progress
    const pollProgress = async () => {
      if (controller.signal.aborted) return;
      await refetchDocuments();
      await updateCategoryProgress(categoryId);
      
      // Check if all documents are analyzed
      const currentDocs = getDocumentsByCategory(categoryId);
      const allAnalyzed = currentDocs.every(doc => doc.ai_summary && doc.ai_summary.trim().length > 0);
      
      if (allAnalyzed) {
        setCategoryAnalysisProgress(prev => ({
          ...prev,
          [categoryId]: {
            analyzing: false,
            progress: currentDocs.length,
            total: currentDocs.length
          }
        }));
        setActiveAnalysisControllers(prev => {
          const newControllers = { ...prev };
          delete newControllers[categoryId];
          return newControllers;
        });
      } else if (categoryAnalysisProgress[categoryId]?.analyzing) {
        setTimeout(pollProgress, 3000);
      }
    };

    // Start polling after a delay
    setTimeout(pollProgress, 3000);
  };

  const handleStopAnalysis = async (categoryId: string) => {
    // Abort ongoing requests
    const controller = activeAnalysisControllers[categoryId];
    if (controller) {
      controller.abort();
    }

    // Reset processing status for documents in this category
    const categoryDocs = getDocumentsByCategory(categoryId);
    for (const doc of categoryDocs) {
      if (doc.processing_status === 'processing') {
        await supabase
          .from('project_documents')
          .update({ processing_status: null })
          .eq('id', doc.id);
      }
    }

    // Clear analysis state
    setCategoryAnalysisProgress(prev => ({
      ...prev,
      [categoryId]: {
        analyzing: false,
        progress: 0,
        total: categoryDocs.length
      }
    }));

    setActiveAnalysisControllers(prev => {
      const newControllers = { ...prev };
      delete newControllers[categoryId];
      return newControllers;
    });

    toast({
      title: 'Analysis Stopped',
      description: 'SkAi analysis has been stopped',
    });
  };

  const handleRestartAnalysis = async (categoryId: string) => {
    // Reset all documents in category
    const categoryDocs = getDocumentsByCategory(categoryId);
    for (const doc of categoryDocs) {
      await supabase
        .from('project_documents')
        .update({ 
          processing_status: null,
          ai_summary: null 
        })
        .eq('id', doc.id);
    }

    // Refetch documents to update UI
    await refetchDocuments();

    // Start fresh analysis
    await handleAnalyzeCategory(categoryId);
  };

  const handleAddCategory = (title: string) => {
    const newCategory = {
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title: title,
      icon: FileText,
    };
    setDocumentCategories(prev => [...prev, newCategory]);
    toast({
      title: 'Category Added',
      description: `"${title}" category has been created`,
    });
  };
  
  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested project could not be found.</p>
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
        
        <div className="p-6 flex gap-6 min-h-[calc(100vh-180px)]">
          {/* Left Column - Project Docs & Links */}
          <div className="flex-1 pr-6 max-w-[50%]">
            <Tabs defaultValue="docs" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="docs" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Project Docs
                </TabsTrigger>
                <TabsTrigger value="links" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Project Links
                </TabsTrigger>
              </TabsList>

            {/* Project Docs Tab */}
            <TabsContent value="docs">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">Document Categories</h2>
                <Button onClick={() => setCategoryDialogOpen(true)} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
              <div className="space-y-4">
                {documentCategories.map(category => {
                  const isExpanded = expandedCategories[category.id];
                  const categoryDocs = getDocumentsByCategory(category.id);
                  const Icon = category.icon;
                  
                  return (
                    <Collapsible
                      key={category.id}
                      open={isExpanded}
                      onOpenChange={() => toggleCategory(category.id)}
                    >
                      <div className="border border-border rounded-lg overflow-hidden hover:border-border/60 transition-all duration-200">
                        {/* Category Header */}
                        <CollapsibleTrigger asChild>
                          <div className="px-4 py-2">
                            <div className="flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors rounded p-2">
                              <div className="flex items-center gap-2.5">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
                                )}
                                <Icon className="h-4 w-4 text-foreground" />
                                <h3 className="text-sm font-medium text-foreground">
                                  {category.title}
                                </h3>
                                {categoryDocs.length > 0 && (
                                  <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
                                    {categoryDocs.length}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {categoryAnalysisProgress[category.id]?.analyzing ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStopAnalysis(category.id);
                                      }}
                                      className="h-7 px-2 text-xs text-destructive hover:text-destructive/80"
                                      title="Stop analysis"
                                    >
                                      <XCircle className="w-3.5 h-3.5 mr-1" />
                                      Stop
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRestartAnalysis(category.id);
                                      }}
                                      className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700"
                                      title="Restart analysis"
                                      disabled={categoryDocs.length === 0}
                                    >
                                      <RotateCw className="w-3.5 h-3.5 mr-1" />
                                      Restart
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAnalyzeCategory(category.id);
                                      }}
                                      className="h-7 w-7 p-0 text-primary hover:text-primary/80"
                                      title="Analyze all with SkAi"
                                      disabled={categoryDocs.length === 0}
                                    >
                                      <Sparkles className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUploadClick(category.id);
                                  }}
                                  className="h-7 w-7 p-0"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            {categoryAnalysisProgress[category.id]?.analyzing && (
                              <div className="mt-3 px-2 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                                    Analyzing documents...
                                  </span>
                                  <span className="text-sm font-semibold text-primary">
                                    {Math.round((categoryAnalysisProgress[category.id].progress / categoryAnalysisProgress[category.id].total) * 100)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={(categoryAnalysisProgress[category.id].progress / categoryAnalysisProgress[category.id].total) * 100} 
                                  className="h-2"
                                />
                                <div className="text-xs text-muted-foreground text-right">
                                  {categoryAnalysisProgress[category.id].progress} of {categoryAnalysisProgress[category.id].total} documents
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleTrigger>

                        {/* Category Content */}
                        <CollapsibleContent>
                          <div className="px-4 pb-3 pt-1">
                            {categoryDocs.length > 0 ? (
                              <div className="space-y-1">
                                {categoryDocs.map(doc => (
                                  <div
                                    key={doc.id}
                                    className="group flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-all duration-200"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      <FileText className="h-4 w-4 text-primary/70 flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p 
                                          className="text-sm text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                                          onClick={() => handleDocumentClick(doc)}
                                        >
                                          {doc.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <span>{formatFileSize(doc.file_size)}</span>
                                          <span>•</span>
                                          <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(doc.file_url, '_blank')}
                                        className="h-7 w-7 p-0"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteDocument(doc.id)}
                                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-muted-foreground">
                                <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p className="text-xs">No documents uploaded yet</p>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </TabsContent>

            {/* Project Links Tab */}
            <TabsContent value="links">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Project Links</h2>
                  <Button onClick={handleAddLink}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </div>

                {linksLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading links...
                  </div>
                ) : links.length > 0 ? (
                  <div className="space-y-2">
                    {links.map(link => (
                      <div
                        key={link.id}
                        className="group flex items-center justify-between p-4 rounded-lg border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.03] transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Link className="h-5 w-5 text-primary/80 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {link.title}
                            </p>
                            {link.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {link.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(link.url, '_blank')}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLink(link)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLink(link)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Link className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">No links added yet</p>
                    <p className="text-xs mt-1">Click Add Link to create your first project link</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-border self-stretch" />

        {/* Right Column - AI Knowledge Status */}
        <div className="flex-1 pl-6 max-w-[50%]">
          <h2 className="text-xl font-semibold text-foreground mb-6">AI Knowledge Extraction</h2>

          <ProjectKnowledgeStatus 
            projectId={projectId!}
            companyId={project.company_id}
          />
        </div>
      </div>
      </div>

      {/* Document Upload Dialog */}
      <DocumentUpload
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        projectId={projectId || undefined}
        onUploadComplete={async () => {
          await refetchDocuments();
          setUploadDialogOpen(false);
          
          // Auto-trigger analysis for newly uploaded documents
          if (selectedCategory) {
            setTimeout(async () => {
              const { data: newDocs } = await supabase
                .from('project_documents')
                .select('id, name')
                .eq('project_id', projectId)
                .eq('document_type', selectedCategory)
                .is('ai_summary', null)
                .order('created_at', { ascending: false })
                .limit(5);

              if (newDocs && newDocs.length > 0) {
                toast({
                  title: 'Starting AI Analysis',
                  description: `SkAi is analyzing ${newDocs.length} document${newDocs.length > 1 ? 's' : ''}...`,
                });
                
                // Trigger analysis for each new document
                for (const doc of newDocs) {
                  await handleAnalyzeDocument(doc.id, doc.name);
                }
                
                // Update progress tracking
                await updateCategoryProgress(selectedCategory);
              }
            }, 1000);
          }
        }}
        categoryId={selectedCategory || undefined}
      />

      {/* Category Dialog */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSubmit={handleAddCategory}
      />

      {/* Project Link Dialog */}
      <ProjectLinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        mode={linkDialogMode}
        projectId={projectId || ''}
        link={selectedLink}
        onSubmit={handleLinkSubmit}
      />

      {/* Delete Link Confirmation Dialog */}
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
            <AlertDialogAction onClick={confirmDeleteLink} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Edit Dialog */}
      <DocumentEditDialog
        open={editDocDialogOpen}
        onOpenChange={setEditDocDialogOpen}
        document={selectedDocument}
        onDocumentUpdated={handleDocumentUpdated}
        onDelete={handleDocumentDelete}
      />
    </div>
  );
};
