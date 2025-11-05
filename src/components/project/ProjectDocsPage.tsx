import React, { useState, useEffect } from 'react';
import { useProjectSchedules } from '@/hooks/useProjectSchedules';
import { formatDistanceToNow } from 'date-fns';
import { ScheduleDetailPage } from './ScheduleDetailPage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CategoryAIConfigDialog } from '../admin/skai/CategoryAIConfigDialog';
import { ScopeGenerationDialog } from './ScopeGenerationDialog';

import { FileText, Upload, ChevronDown, ChevronRight, ChevronLeft, Download, Trash2, Link, Plus, Edit, ExternalLink, Sparkles, Loader2, XCircle, RotateCw, CheckCircle2, Brain, Package, ImageIcon, FileType, MoreHorizontal, Layers } from 'lucide-react';
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
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);

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
  
  // Active tab tracking
  const [activeTab, setActiveTab] = useState<string>("docs");
  
  // Schedules management
  const { schedules, loading: schedulesLoading, createSchedule, updateSchedule, deleteSchedule } = useProjectSchedules(projectId || undefined);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [scheduleName, setScheduleName] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  
  // Image preview dialog state
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImageDoc, setPreviewImageDoc] = useState<any | null>(null);


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
  const handleCreateSchedule = async () => {
    const success = await createSchedule(scheduleName);
    if (success) {
      setScheduleDialogOpen(false);
      setScheduleName('');
    }
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;
    const success = await updateSchedule(editingSchedule.id, scheduleName);
    if (success) {
      setScheduleDialogOpen(false);
      setEditingSchedule(null);
      setScheduleName('');
    }
  };

  const openCreateScheduleDialog = () => {
    setEditingSchedule(null);
    setScheduleName('');
    setScheduleDialogOpen(true);
  };

  const openEditScheduleDialog = (schedule: any) => {
    setEditingSchedule(schedule);
    setScheduleName(schedule.name);
    setScheduleDialogOpen(true);
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

  // Show schedule detail page if a schedule is selected
  if (selectedSchedule) {
    return (
      <ScheduleDetailPage
        scheduleName={selectedSchedule.name}
        onBack={() => setSelectedSchedule(null)}
      />
    );
  }
  return <div className="flex bg-background min-h-screen">
      {/* Fixed Project Sidebar */}
      <div className="fixed left-0 top-0 h-full w-40 z-40">
        <ProjectSidebar project={project} onNavigate={onNavigate} getStatusColor={getStatusColor} getStatusText={getStatusText} activeSection="docs" />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-40 bg-background">
        <div className="p-6 h-[calc(100vh-var(--header-height))]">
          <Tabs defaultValue="docs" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <TabsList className="mb-6">
              <TabsTrigger value="docs" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Project Docs
              </TabsTrigger>
              <TabsTrigger value="links" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Project Links
              </TabsTrigger>
              <TabsTrigger value="specification" className="flex items-center gap-2">
                <FileType className="h-4 w-4" />
                Specification
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Gallery
              </TabsTrigger>
            </TabsList>

            {/* Project Docs Tab - Two Column Layout */}
            <TabsContent value="docs" className="flex-1 overflow-hidden">
              <div className="flex gap-6 h-full">
                {/* Left Column - Document Categories */}
                <div className="flex-1 pr-6 max-w-[50%] overflow-auto">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Document Categories</h2>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => setScopeDialogOpen(true)}
                        disabled={documents.filter(d => d.processing_status === 'completed' && (d as any).metadata).length === 0}
                        className="gap-2"
                      >
                        <Package className="w-4 h-4" />
                        Generate Scope
                      </Button>
                    </div>
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
                </div>

                {/* Vertical Divider */}
                <div className="w-px bg-border self-stretch" />

                {/* Right Column - SkAi Analysis Panel */}
                <div className="flex-1 pl-6 max-w-[50%] flex flex-col h-full overflow-auto">
                  <ProjectKnowledgeStatus 
                    projectId={projectId!} 
                    companyId={project.company_id} 
                    selectedDocumentId={selectedDocumentId}
                    onClearSelection={() => setSelectedDocumentId(null)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Project Links Tab - Full Width */}
            <TabsContent value="links" className="flex-1 overflow-auto">
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

            {/* Specification Tab */}
            <TabsContent value="specification" className="flex-1 overflow-auto">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Project Specification</h2>
                    <p className="text-sm text-muted-foreground">Project specifications and technical details</p>
                  </div>
                  <Button onClick={openCreateScheduleDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Schedule
                  </Button>
                </div>

                {/* Schedules Table */}
                <div className="bg-white/80 backdrop-blur-xl border border-border/30 rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                  {/* Table Header */}
                  <div className="grid grid-cols-[2fr,1fr,1.5fr,1fr,2fr,auto] gap-4 px-6 py-4 bg-muted/30 border-b border-border/30">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                      NAME
                    </div>
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                      TYPE
                    </div>
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                      SHARED WITH
                    </div>
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                      STATUS
                    </div>
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                      LAST UPDATED
                    </div>
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                      ACTIONS
                    </div>
                  </div>

                  {/* Table Body */}
                  {schedulesLoading ? (
                    <div className="px-6 py-12 text-center text-muted-foreground">
                      Loading schedules...
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <Layers className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">No schedules yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Click "Create Schedule" to get started</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {schedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="grid grid-cols-[2fr,1fr,1.5fr,1fr,2fr,auto] gap-4 px-6 py-4 hover:bg-accent/30 transition-colors"
                        >
                          {/* Name */}
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <button
                              onClick={() => setSelectedSchedule(schedule)}
                              className="text-sm font-medium text-foreground truncate hover:text-primary hover:underline transition-colors text-left"
                            >
                              {schedule.name}
                            </button>
                          </div>

                          {/* Type */}
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground">
                              {schedule.type}
                            </span>
                          </div>

                          {/* Shared With */}
                          <div className="flex items-center">
                            {schedule.is_public ? (
                              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                                Public
                              </Badge>
                            ) : schedule.shared_with && schedule.shared_with.length > 0 ? (
                              <span className="text-sm text-muted-foreground">
                                {schedule.shared_with.length} user(s)
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Private</span>
                            )}
                          </div>

                          {/* Status */}
                          <div className="flex items-center">
                            {schedule.status && (
                              <Badge variant="outline">
                                {schedule.status}
                              </Badge>
                            )}
                          </div>

                          {/* Last Updated */}
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(schedule.updated_at), { addSuffix: true })}
                              {(schedule.profiles?.first_name || schedule.profiles?.last_name) && (
                                <> by {[schedule.profiles.first_name, schedule.profiles.last_name].filter(Boolean).join(' ')}</>
                              )}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditScheduleDialog(schedule)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteSchedule(schedule.id)} className="text-destructive">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Smart Gallery Tab */}
            <TabsContent value="gallery">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Smart Gallery</h2>
                  <p className="text-sm text-muted-foreground">AI-powered image organization and analysis</p>
                </div>
                <Button 
                  variant="default"
                  onClick={() => {
                    setSelectedCategory(null);
                    setUploadDialogOpen(true);
                  }}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Images
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {documents
                  .filter(doc => doc.content_type?.startsWith('image/'))
                  .map(doc => {
                    const aiTags = doc.metadata?.ai_tags || [];
                    const aiDescription = doc.metadata?.ai_description || '';
                    const isAnalyzing = documentAnalysisProgress[doc.id]?.analyzing;
                    
                    return (
                      <div 
                        key={doc.id}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all cursor-pointer"
                        onClick={() => {
                          setPreviewImageDoc(doc);
                          setImagePreviewOpen(true);
                        }}
                      >
                        <img 
                          src={doc.file_url} 
                          alt={doc.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        
                        {/* Analyzing overlay */}
                        {isAnalyzing && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                              <p className="text-xs">AI Analyzing...</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Hover overlay with AI insights */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                            <p className="text-white text-xs font-medium truncate">{doc.name}</p>
                            <p className="text-white/70 text-xs">{formatFileSize(doc.file_size)}</p>
                            
                            {/* AI Description */}
                            {aiDescription && (
                              <p className="text-white/90 text-xs line-clamp-2 italic">
                                {aiDescription}
                              </p>
                            )}
                            
                            {/* AI Tags */}
                            {aiTags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {aiTags.slice(0, 3).map((tag: string, idx: number) => (
                                  <Badge 
                                    key={idx} 
                                    variant="secondary" 
                                    className="text-xs bg-white/20 text-white border-white/30"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {aiTags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                                    +{aiTags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                
                {documents.filter(doc => doc.content_type?.startsWith('image/')).length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-semibold mb-2">Smart Gallery</h3>
                    <p className="text-sm mb-2">Upload images and let AI analyze them automatically</p>
                    <p className="text-xs">AI will detect objects, extract text, and provide insights</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Floating Chat Button */}
      {!documentChatOpen && (
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
      <DocumentChatBar
        documentId={selectedDocumentId || undefined}
        documentName={selectedDocumentId ? (documents.find(d => d.id === selectedDocumentId)?.name || 'Document') : undefined}
        documentContent={selectedDocumentId ? (documents.find(d => d.id === selectedDocumentId)?.ai_summary || undefined) : undefined}
        isOpen={documentChatOpen}
        onClose={() => setDocumentChatOpen(false)}
        currentPage="Project Docs"
        currentTab={activeTab === 'docs' ? 'Project Docs' : activeTab === 'links' ? 'Project Links' : activeTab === 'specification' ? 'Specification' : 'Gallery'}
        projectId={projectId || undefined}
        projectName={project?.name}
      />

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

      {/* Image Preview Dialog */}
      <AlertDialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <AlertDialogContent className="max-w-7xl w-[95vw] max-h-[95vh] p-0 overflow-hidden border-0 !z-[99999] bg-transparent">
          {previewImageDoc && (() => {
            const imageDocuments = documents.filter(doc => doc.content_type?.startsWith('image/'));
            const currentIndex = imageDocuments.findIndex(doc => doc.id === previewImageDoc.id);
            const hasPrevious = currentIndex > 0;
            const hasNext = currentIndex < imageDocuments.length - 1;
            
            const handlePrevious = () => {
              if (hasPrevious) {
                setPreviewImageDoc(imageDocuments[currentIndex - 1]);
              }
            };
            
            const handleNext = () => {
              if (hasNext) {
                setPreviewImageDoc(imageDocuments[currentIndex + 1]);
              }
            };
            
            return (
              <div className="relative flex flex-col h-full bg-transparent">
                {/* Close Button - Floating */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImagePreviewOpen(false)}
                  className="absolute top-4 right-4 z-50 hover:bg-black/20 text-white rounded-full w-10 h-10 p-0 bg-black/40 backdrop-blur-sm"
                >
                  <XCircle className="w-6 h-6" />
                </Button>
                
                {/* Image Container with Navigation */}
                <div className="flex-1 overflow-auto bg-transparent flex items-center justify-center relative">
                  {/* Previous Button */}
                  {hasPrevious && (
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={handlePrevious}
                      className="absolute left-4 z-50 hover:bg-black/40 text-white rounded-full w-12 h-12 p-0 bg-black/30 backdrop-blur-sm"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </Button>
                  )}
                  
                  {/* Image */}
                  <img 
                    src={previewImageDoc.file_url} 
                    alt={previewImageDoc.name}
                    className="max-w-full max-h-[85vh] object-contain"
                  />
                  
                  {/* Next Button */}
                  {hasNext && (
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={handleNext}
                      className="absolute right-4 z-50 hover:bg-black/40 text-white rounded-full w-12 h-12 p-0 bg-black/30 backdrop-blur-sm"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </Button>
                  )}
                  
                  {/* Floating Image Name */}
                  <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <h3 className="text-base font-semibold text-white">{previewImageDoc.name}</h3>
                    <p className="text-sm text-white/70">{formatFileSize(previewImageDoc.file_size)}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Scope Generation Dialog */}
      {project && (
        <ScopeGenerationDialog
          open={scopeDialogOpen}
          onOpenChange={setScopeDialogOpen}
          projectId={projectId!}
          companyId={project.company_id}
          documents={documents}
        />
      )}

      {/* Create/Edit Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
            </DialogTitle>
            <DialogDescription>
              {editingSchedule 
                ? 'Update the schedule name'
                : 'Enter a name for your new schedule'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Schedule Name</Label>
              <Input
                id="name"
                placeholder="Enter schedule name"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}>
              {editingSchedule ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};