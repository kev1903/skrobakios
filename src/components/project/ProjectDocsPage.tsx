import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { DocumentChatBar } from './DocumentChatBar';

import { FileText, Upload, ChevronDown, ChevronRight, Download, Trash2, Link, Plus, Edit, ExternalLink, Sparkles, Loader2, XCircle, RotateCw, CheckCircle2, Brain } from 'lucide-react';
import { getStatusColor, getStatusText } from '../tasks/utils/taskUtils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  const {
    toast
  } = useToast();

  // Project documents management
  const {
    documents,
    loading: docsLoading,
    deleteDocument,
    formatFileSize,
    refetch: refetchDocuments
  } = useProjectDocuments(projectId || undefined);
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
  
  // Selected document for analysis preview
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [documentChatOpen, setDocumentChatOpen] = useState(false);

  // Analysis progress tracking
  const [categoryAnalysisProgress, setCategoryAnalysisProgress] = useState<Record<string, {
    analyzing: boolean;
    progress: number;
    total: number;
  }>>({});
  const [activeAnalysisControllers, setActiveAnalysisControllers] = useState<Record<string, AbortController>>({});
  
  // Individual document analysis progress
  const [documentAnalysisProgress, setDocumentAnalysisProgress] = useState<Record<string, {
    analyzing: boolean;
    progress: number;
  }>>({});


  // Document categories - loaded from database
  const [documentCategories, setDocumentCategories] = useState<Array<{
    id: string;
    title: string;
    icon: any;
    dbId?: string;
  }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Load categories from global document_categories database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const {
          data,
          error
        } = await supabase
          .from('document_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const loadedCategories = data.map((cat: any) => ({
            id: cat.name.toLowerCase().replace(/\s+/g, '-'),
            title: cat.name,
            icon: FileText,
            dbId: cat.id
          }));
          setDocumentCategories(loadedCategories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);
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
    // Get category info to match both new (category_id) and old (document_type) documents
    const category = documentCategories.find(c => c.dbId === categoryId);
    return documents.filter(doc => {
      // Match by category_id (new approach) or document_type (backwards compatibility)
      return doc.category_id === categoryId || 
             (category && doc.document_type?.toLowerCase() === category.id.toLowerCase());
    });
  };
  
  // Clear state when projectId changes
  useEffect(() => {
    setProject(null);
    setExpandedCategories({});
    setCategoryAnalysisProgress({});
    setActiveAnalysisControllers({});
  }, [projectId]);

  // Update category progress when documents change (including real-time updates)
  useEffect(() => {
    if (documentCategories.length > 0 && documents.length > 0) {
      documentCategories.forEach(category => {
        if (category.dbId) {
          updateCategoryProgress(category.dbId);
        }
      });
    }
  }, [documents, documentCategories]);
  
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
      const channel = supabase.channel('analysis-progress').on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'project_documents',
        filter: `project_id=eq.${projectId}`
      }, async payload => {
        console.log('Document update received:', payload);
        
        const docId = payload.new.id;
        
        // Always refetch documents when processing status changes
        if (payload.new.processing_status) {
          await refetchDocuments();
        }
        
        // Update individual document progress based on processing_status
        if (payload.new.processing_status === 'processing') {
          setDocumentAnalysisProgress(prev => ({
            ...prev,
            [docId]: { analyzing: true, progress: 50 }
          }));
        } else if (payload.new.processing_status === 'completed') {
          // Set to 100% and then remove
          setDocumentAnalysisProgress(prev => ({
            ...prev,
            [docId]: { analyzing: true, progress: 100 }
          }));
          
          // Remove progress indicator and refetch
          setTimeout(async () => {
            setDocumentAnalysisProgress(prev => {
              const newState = { ...prev };
              delete newState[docId];
              return newState;
            });
            await refetchDocuments(); // Ensure UI is fully updated
          }, 1000);
        } else if (payload.new.processing_status === 'failed') {
          setDocumentAnalysisProgress(prev => {
            const newState = { ...prev };
            delete newState[docId];
            return newState;
          });
          await refetchDocuments();
        }
        
        // Update category progress when documents are analyzed
        if (payload.new.ai_summary && payload.new.ai_summary.trim().length > 0) {
          // Recalculate progress for affected category
          const categoryId = payload.new.category_id || payload.new.document_type;
          if (categoryId) {
            await updateCategoryProgress(categoryId);

            // Show success toast
            toast({
              title: 'Analysis Complete',
              description: `${payload.new.name} has been analyzed`
            });
          }
        }
      }).subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [projectId, getProject]);

  // Initialize progress tracking when documents load
  useEffect(() => {
    if (documents.length > 0 && projectId) {
      documentCategories.forEach(category => {
        updateCategoryProgress(category.dbId || category.id);
      });
    }
  }, [documents.length, projectId]);
  const updateCategoryProgress = async (categoryId: string) => {
    try {
      const category = documentCategories.find(c => c.dbId === categoryId);
      const categoryDocs = documents.filter(doc => 
        doc.category_id === categoryId ||
        (category && doc.document_type?.toLowerCase() === category.id.toLowerCase())
      );
      const total = categoryDocs.length;
      if (total === 0) {
        setCategoryAnalysisProgress(prev => ({
          ...prev,
          [categoryId]: {
            analyzing: false,
            progress: 0,
            total: 0
          }
        }));
        return;
      }

      // Count documents with actual AI summaries (not just completed status)
      const analyzed = categoryDocs.filter(doc => doc.ai_summary && doc.ai_summary.trim().length > 0).length;
      setCategoryAnalysisProgress(prev => {
        const wasAnalyzing = prev[categoryId]?.analyzing || false;
        const allComplete = analyzed >= total;
        return {
          ...prev,
          [categoryId]: {
            analyzing: wasAnalyzing && !allComplete,
            progress: analyzed,
            total: total
          }
        };
      });
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

      // Set initial analyzing state
      setDocumentAnalysisProgress(prev => ({
        ...prev,
        [documentId]: { analyzing: true, progress: 0 }
      }));

      // Validate required data
      if (!projectId || !project?.company_id) {
        console.error('Missing required data:', {
          projectId,
          companyId: project?.company_id
        });
        toast({
          title: "Analysis failed",
          description: "Project data is not loaded yet. Please wait and try again.",
          variant: "destructive"
        });
        setDocumentAnalysisProgress(prev => {
          const newState = { ...prev };
          delete newState[documentId];
          return newState;
        });
        return;
      }
      
      // Update progress to show started
      setDocumentAnalysisProgress(prev => ({
        ...prev,
        [documentId]: { analyzing: true, progress: 25 }
      }));
      
      const {
        data,
        error
      } = await supabase.functions.invoke('sync-project-knowledge', {
        body: {
          projectId,
          companyId: project.company_id,
          documentId
        }
      });
      
      if (signal?.aborted) {
        console.log('Analysis cancelled for:', documentName);
        setDocumentAnalysisProgress(prev => {
          const newState = { ...prev };
          delete newState[documentId];
          return newState;
        });
        return;
      }
      
      if (error) {
        console.error('Edge function error:', error);
        setDocumentAnalysisProgress(prev => {
          const newState = { ...prev };
          delete newState[documentId];
          return newState;
        });
        throw error;
      }
      
      console.log('Analysis response:', data);
      if (!data || !data.success) {
        setDocumentAnalysisProgress(prev => {
          const newState = { ...prev };
          delete newState[documentId];
          return newState;
        });
        throw new Error(data?.error || 'Analysis failed');
      }
      
      // Update progress to show processing - real-time subscription will update to 100%
      setDocumentAnalysisProgress(prev => ({
        ...prev,
        [documentId]: { analyzing: true, progress: 75 }
      }));
      
      // Refetch to ensure UI updates
      setTimeout(async () => {
        await refetchDocuments();
      }, 2000);
      
      toast({
        title: 'Analysis Started',
        description: `SkAi is analyzing ${documentName}...`
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
      setDocumentAnalysisProgress(prev => {
        const newState = { ...prev };
        delete newState[documentId];
        return newState;
      });
    }
  };
  const handleAnalyzeCategory = async (categoryId: string) => {
    // Get all documents for this category using the DB ID
    const categoryDocs = getDocumentsByCategory(categoryId);
    
    if (categoryDocs.length === 0) {
      toast({
        title: "No Documents",
        description: "This category has no documents to analyze",
        variant: "destructive",
      });
      return;
    }

    // Create abort controller for this analysis
    const controller = new AbortController();
    setActiveAnalysisControllers(prev => ({
      ...prev,
      [categoryId]: controller
    }));

    // Get documents that need analysis (no ai_summary or processing status is pending/failed)
    const docsToAnalyze = categoryDocs.filter(doc => 
      !doc.ai_summary || doc.processing_status === 'pending' || doc.processing_status === 'failed'
    );
    
    if (docsToAnalyze.length === 0) {
      toast({
        title: "All documents analyzed",
        description: "All documents in this category have already been analyzed",
      });
      setCategoryAnalysisProgress(prev => ({
        ...prev,
        [categoryId]: { analyzing: false, progress: categoryDocs.length, total: categoryDocs.length }
      }));
      return;
    }

    // Count already analyzed documents
    const alreadyAnalyzed = categoryDocs.filter(doc => doc.ai_summary && doc.ai_summary.trim().length > 0).length;
    
    // Set initial analyzing state
    setCategoryAnalysisProgress(prev => ({
      ...prev,
      [categoryId]: { analyzing: true, progress: alreadyAnalyzed, total: categoryDocs.length }
    }));

    toast({
      title: "Starting SkAi Analysis",
      description: `Analyzing ${docsToAnalyze.length} document${docsToAnalyze.length > 1 ? 's' : ''}...`,
    });

    // Analyze documents sequentially to avoid overload
    let completed = 0;
    for (const doc of docsToAnalyze) {
      // Check if analysis was stopped
      if (controller.signal.aborted) {
        toast({
          title: "Analysis Stopped",
          description: "Document analysis has been stopped",
          variant: "destructive",
        });
        break;
      }

      try {
        console.log(`📄 Analyzing document: ${doc.name} (ID: ${doc.id})`);
        await handleAnalyzeDocument(doc.id, doc.name, controller.signal);
        completed++;
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update progress immediately after each document
        setCategoryAnalysisProgress(prev => ({
          ...prev,
          [categoryId]: { 
            analyzing: true, 
            progress: alreadyAnalyzed + completed, 
            total: categoryDocs.length 
          }
        }));

        // Refetch documents to show updated analysis in real-time
        await refetchDocuments();
        
      } catch (error) {
        console.error(`❌ Failed to analyze ${doc.name}:`, error);
        toast({
          title: "Analysis Error",
          description: `Failed to analyze ${doc.name}`,
          variant: "destructive",
        });
      }
    }

    // Final refetch to ensure all updates are visible
    await refetchDocuments();

    // Update progress to final state
    await updateCategoryProgress(categoryId);

    // Clean up
    setActiveAnalysisControllers(prev => {
      const newControllers = { ...prev };
      delete newControllers[categoryId];
      return newControllers;
    });

    toast({
      title: "Analysis Complete",
      description: `Successfully analyzed ${completed} document${completed !== 1 ? 's' : ''}`,
    });
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
        await supabase.from('project_documents').update({
          processing_status: null
        }).eq('id', doc.id);
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
      const newControllers = {
        ...prev
      };
      delete newControllers[categoryId];
      return newControllers;
    });
    toast({
      title: 'Analysis Stopped',
      description: 'SkAi analysis has been stopped'
    });
  };
  const handleRestartAnalysis = async (categoryId: string) => {
    // Reset all documents in category
    const categoryDocs = getDocumentsByCategory(categoryId);
    for (const doc of categoryDocs) {
      await supabase.from('project_documents').update({
        processing_status: null,
        ai_summary: null
      }).eq('id', doc.id);
    }

    // Refetch documents to update UI
    await refetchDocuments();

    // Start fresh analysis
    await handleAnalyzeCategory(categoryId);
  };
  if (!project) {
    return <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested project could not be found.</p>
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
        <ProjectPageHeader projectName={project.name} pageTitle="Project Documents & Links" onNavigate={onNavigate} />
        
        <div className="p-6 flex gap-6 h-[calc(100vh-180px)]">
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
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground">Document Categories</h2>
              </div>
              <div className="space-y-4">
                {documentCategories.map(category => {
                  const isExpanded = expandedCategories[category.id];
                  const categoryDocs = getDocumentsByCategory(category.dbId || category.id);
                  const Icon = category.icon;
                  return <Collapsible key={category.id} open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                      <div className={`border border-border rounded-lg overflow-hidden hover:border-border/60 transition-all duration-200`}>
                        {/* Category Header */}
                        <CollapsibleTrigger asChild>
                          <div className="px-4 py-2">
                            <div className="flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors rounded p-2">
                              <div className="flex items-center gap-2.5 category-title-area">
                                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" /> : <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />}
                                <Icon className="h-4 w-4 text-foreground" />
                                <h3 className="text-sm font-medium text-foreground">
                                  {category.title}
                                </h3>
                                {categoryDocs.length > 0 && <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
                                    {categoryDocs.length}
                                  </span>}
                              </div>
                              <div className="flex items-center gap-1">
                                {categoryAnalysisProgress[category.dbId || category.id]?.analyzing ? <>
                                    <Button variant="ghost" size="sm" onClick={e => {
                                  e.stopPropagation();
                                  handleStopAnalysis(category.dbId || category.id);
                                }} className="h-7 px-2 text-xs text-destructive hover:text-destructive/80" title="Stop analysis">
                                      <XCircle className="w-3.5 h-3.5 mr-1" />
                                      Stop
                                    </Button>
                                  </> : <>
                                    {categoryDocs.length > 0 && <Badge variant="outline" className="h-7 px-2 text-xs border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                                        <Brain className="w-3 h-3 mr-1" />
                                        {categoryAnalysisProgress[category.dbId || category.id]?.progress || 0}/{categoryDocs.length} Analyzed
                                      </Badge>}
                                    <Button variant="ghost" size="sm" onClick={e => {
                                  e.stopPropagation();
                                  handleAnalyzeCategory(category.dbId || category.id);
                                }} className="h-7 w-7 p-0 text-primary hover:text-primary/80" title="Analyze all with SkAi" disabled={categoryDocs.length === 0}>
                                      <Sparkles className="w-3.5 h-3.5" />
                                    </Button>
                                  </>}
                                <Button variant="ghost" size="sm" onClick={e => {
                                e.stopPropagation();
                                handleUploadClick(category.dbId || category.id);
                              }} className="h-7 w-7 p-0">
                                  <Upload className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        {/* Category Content */}
                        <CollapsibleContent>
                          <div className="px-4 pb-3 pt-1">
                            {/* Progress Bar - Show during analysis or when complete */}
                            {categoryAnalysisProgress[category.dbId || category.id] && categoryAnalysisProgress[category.dbId || category.id].total > 0 && <div className="mb-3 space-y-2 bg-accent/30 p-3 rounded-lg">
                                {(() => {
                              const progress = categoryAnalysisProgress[category.dbId || category.id];
                              const percentage = Math.round(progress.progress / progress.total * 100);
                              const isComplete = progress.progress >= progress.total;
                              return <>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                          {progress.analyzing ? <>
                                              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                                              Analyzing documents...
                                            </> : isComplete ? <>
                                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                              Analysis Complete
                                            </> : <>
                                              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                                              Analyzing documents...
                                            </>}
                                        </span>
                                        <span className={`text-sm font-semibold ${isComplete ? 'text-green-600' : 'text-primary'}`}>
                                          {percentage}%
                                        </span>
                                      </div>
                                      <Progress value={percentage} className="h-2" />
                                      <div className="text-xs text-muted-foreground text-right">
                                        {progress.progress} of {progress.total} documents
                                      </div>
                                    </>;
                            })()}
                              </div>}
                          
                            {categoryDocs.length > 0 ? <div className="space-y-1">
                                {categoryDocs.map(doc => <div 
                                    key={doc.id} 
                                    className={`group flex items-center justify-between p-2 rounded transition-all duration-200 cursor-pointer ${
                                      selectedDocumentId === doc.id 
                                        ? 'bg-primary/10 border-l-2 border-primary' 
                                        : 'hover:bg-accent/50'
                                    }`}
                                     onClick={() => {
                                       // Select document to show its analysis
                                       console.log('📄 Document clicked:', doc.id, doc.name);
                                       setSelectedDocumentId(doc.id);
                                       setDocumentChatOpen(true); // Auto-open chat when document is clicked
                                     }}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      <FileText className="h-4 w-4 text-primary/70 flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm text-foreground truncate">
                                          {doc.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <span>{formatFileSize(doc.file_size)}</span>
                                          <span>•</span>
                                          <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                          {doc.ai_summary && !documentAnalysisProgress[doc.id] && (
                                            <>
                                              <span>•</span>
                                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                                            </>
                                          )}
                                        </div>
                                        
                                        {/* Individual Document Progress Bar */}
                                        {documentAnalysisProgress[doc.id]?.analyzing && (
                                          <div className="mt-2 space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                              <span className="text-primary flex items-center gap-1">
                                                <Sparkles className="h-3 w-3 animate-pulse" />
                                                Analyzing...
                                              </span>
                                              <span className="text-primary font-semibold">
                                                {documentAnalysisProgress[doc.id].progress}%
                                              </span>
                                            </div>
                                            <Progress 
                                              value={documentAnalysisProgress[doc.id].progress} 
                                              className="h-1.5" 
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAnalyzeDocument(doc.id, doc.name);
                                        }} 
                                        className="h-7 w-7 p-0 text-primary hover:text-primary/80 hover:scale-110 transition-all duration-200"
                                        title="Re-analyze with SkAi"
                                      >
                                        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDocumentClick(doc);
                                        }} 
                                        className="h-7 w-7 p-0"
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(doc.file_url, '_blank');
                                        }} 
                                        className="h-7 w-7 p-0"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteDocument(doc.id);
                                        }} 
                                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>)}
                              </div> : <div className="text-center py-6 text-muted-foreground">
                                <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p className="text-xs">No documents uploaded yet</p>
                              </div>}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>;
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

                {linksLoading ? <div className="text-center py-8 text-muted-foreground">
                    Loading links...
                  </div> : links.length > 0 ? <div className="space-y-2">
                    {links.map(link => <div key={link.id} className="group flex items-center justify-between p-4 rounded-lg border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.03] transition-all duration-200">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Link className="h-5 w-5 text-primary/80 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {link.title}
                            </p>
                            {link.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {link.description}
                              </p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => window.open(link.url, '_blank')} className="h-8 w-8 p-0">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditLink(link)} className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteLink(link)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>)}
                  </div> : <div className="text-center py-12 text-muted-foreground">
                    <Link className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">No links added yet</p>
                    <p className="text-xs mt-1">Click Add Link to create your first project link</p>
                  </div>}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-border self-stretch" />

        {/* Right Column - SkAI Project Study Preview */}
        <div className="flex-1 pl-6 max-w-[50%] flex flex-col h-full">
          <div className="flex-1 overflow-auto">
            <ProjectKnowledgeStatus 
              projectId={projectId!} 
              companyId={project.company_id} 
              selectedDocumentId={selectedDocumentId}
              onClearSelection={() => setSelectedDocumentId(null)}
            />
          </div>
        </div>
      </div>
      </div>

      {/* Floating Chat Button */}
      {selectedDocumentId && !documentChatOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setDocumentChatOpen(true)}
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg hover:scale-105 transition-transform bg-primary hover:bg-primary/90"
          >
            <Sparkles className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Floating Document Chat */}
      {selectedDocumentId && (
        <DocumentChatBar
          documentId={selectedDocumentId}
          documentName={documents.find(d => d.id === selectedDocumentId)?.name || 'Document'}
          documentContent={documents.find(d => d.id === selectedDocumentId)?.ai_summary || undefined}
          isOpen={documentChatOpen}
          onClose={() => setDocumentChatOpen(false)}
        />
      )}

      {/* Document Upload Dialog */}
      <DocumentUpload open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} projectId={projectId || undefined} onUploadComplete={async () => {
      await refetchDocuments();
      setUploadDialogOpen(false);

      // Auto-trigger analysis for newly uploaded documents
      if (selectedCategory) {
        setTimeout(async () => {
          const {
            data: newDocs
          } = await supabase.from('project_documents').select('id, name').eq('project_id', projectId).eq('category_id', selectedCategory).is('ai_summary', null).order('created_at', {
            ascending: false
          }).limit(5);
          if (newDocs && newDocs.length > 0) {
            toast({
              title: 'Starting AI Analysis',
              description: `SkAi is analyzing ${newDocs.length} document${newDocs.length > 1 ? 's' : ''}...`
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
    }} categoryId={selectedCategory || undefined} />

      {/* Project Link Dialog */}
      <ProjectLinkDialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen} mode={linkDialogMode} projectId={projectId || ''} link={selectedLink} onSubmit={handleLinkSubmit} />

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
      <DocumentEditDialog open={editDocDialogOpen} onOpenChange={setEditDocDialogOpen} document={selectedDocument} onDocumentUpdated={handleDocumentUpdated} onDelete={handleDocumentDelete} />
    </div>;
};