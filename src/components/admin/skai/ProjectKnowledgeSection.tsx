import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, FileText, Building2, Calendar, DollarSign, FolderOpen, Layers } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/contexts/CompanyContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ProjectKnowledgeData {
  project_id: string;
  project_name: string;
  status: string;
  document_count: number;
  contract_count: number;
  last_synced: string | null;
  knowledge_sources: string[];
}

interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  document_type: string;
  section_number: number;
  section_name: string;
  sort_order: number;
  is_active: boolean;
}

interface SectionData {
  section_number: number;
  section_name: string;
  categories: DocumentCategory[];
}

export const ProjectKnowledgeSection: React.FC = () => {
  const { toast } = useToast();
  const { currentCompany } = useCompany();
  const [projects, setProjects] = useState<ProjectKnowledgeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingProjectId, setSyncingProjectId] = useState<string | null>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([1]));

  useEffect(() => {
    fetchDocumentCategories();
    if (currentCompany?.id) {
      fetchProjectsKnowledge();
    }
  }, [currentCompany?.id]);

  const fetchDocumentCategories = async () => {
    try {
      setCategoriesLoading(true);
      
      // Fetch document categories directly from the table
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .eq('is_active', true)
        .order('section_number', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Group categories by section
      const sectionMap = new Map<number, SectionData>();
      data?.forEach(category => {
        if (!sectionMap.has(category.section_number)) {
          sectionMap.set(category.section_number, {
            section_number: category.section_number,
            section_name: category.section_name,
            categories: []
          });
        }
        sectionMap.get(category.section_number)!.categories.push(category);
      });

      setSections(Array.from(sectionMap.values()));
    } catch (error) {
      console.error('Error fetching document categories:', error);
      toast({
        title: "Error",
        description: "Failed to load document categories",
        variant: "destructive"
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const toggleSection = (sectionNumber: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionNumber)) {
        newSet.delete(sectionNumber);
      } else {
        newSet.add(sectionNumber);
      }
      return newSet;
    });
  };

  const fetchProjectsKnowledge = async () => {
    if (!currentCompany?.id) return;

    try {
      setIsLoading(true);

      // Fetch all projects with their related data counts
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          status,
          project_documents(count)
        `)
        .eq('company_id', currentCompany.id);

      if (projectsError) throw projectsError;

      // Get knowledge sync status for each project
      const { data: knowledgeData, error: knowledgeError } = await supabase
        .from('skai_knowledge')
        .select('metadata, updated_at')
        .eq('knowledge_type', 'project')
        .eq('company_id', currentCompany.id);

      if (knowledgeError) throw knowledgeError;

      // Map knowledge data by project_id
      const knowledgeMap = new Map(
        knowledgeData?.map(k => {
          const metadata = k.metadata as any;
          return [
            metadata?.project_id,
            { last_synced: k.updated_at, sources: metadata?.sources || [] }
          ];
        }) || []
      );

      const mappedProjects: ProjectKnowledgeData[] = (projectsData || []).map(project => {
        const knowledge = knowledgeMap.get(project.id);
        return {
          project_id: project.id,
          project_name: project.name,
          status: project.status || 'active',
          document_count: project.project_documents?.[0]?.count || 0,
          contract_count: 0,
          last_synced: knowledge?.last_synced || null,
          knowledge_sources: knowledge?.sources || []
        };
      });

      setProjects(mappedProjects);
    } catch (error) {
      console.error('Error fetching projects knowledge:', error);
      toast({
        title: "Error",
        description: "Failed to load project knowledge data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncProjectKnowledge = async (projectId: string) => {
    if (!currentCompany?.id) return;

    try {
      setSyncingProjectId(projectId);

      // Fetch comprehensive project data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          project_documents(*),
          tasks(*),
          activities(*),
          estimates(*)
        `)
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Build knowledge content from project data
      const knowledgeSources = [];
      let knowledgeContent = `# Project Knowledge: ${projectData.name}\n\n`;

      // Add project overview
      knowledgeContent += `## Project Overview\n`;
      knowledgeContent += `- **Project ID**: ${projectData.id}\n`;
      knowledgeContent += `- **Status**: ${projectData.status || 'Active'}\n`;
      knowledgeContent += `- **Description**: ${projectData.description || 'No description'}\n\n`;

      // Add documents information
      if (projectData.project_documents?.length > 0) {
        knowledgeSources.push('Documents');
        knowledgeContent += `## Documents (${projectData.project_documents.length})\n`;
        projectData.project_documents.forEach((doc: any) => {
          knowledgeContent += `- ${doc.name} (${doc.document_type})\n`;
          if (doc.ai_summary) {
            knowledgeContent += `  Summary: ${doc.ai_summary}\n`;
          }
        });
        knowledgeContent += `\n`;
      }


      // Add tasks summary
      if (projectData.tasks?.length > 0) {
        knowledgeSources.push('Tasks');
        knowledgeContent += `## Tasks Summary\n`;
        knowledgeContent += `- Total Tasks: ${projectData.tasks.length}\n`;
        const completedTasks = projectData.tasks.filter((t: any) => t.status === 'completed').length;
        knowledgeContent += `- Completed: ${completedTasks}\n`;
        knowledgeContent += `- In Progress: ${projectData.tasks.filter((t: any) => t.status === 'in_progress').length}\n\n`;
      }

      // Add activities information
      if (projectData.activities?.length > 0) {
        knowledgeSources.push('Activities');
        knowledgeContent += `## Activities (${projectData.activities.length})\n`;
        projectData.activities.forEach((activity: any) => {
          knowledgeContent += `- ${activity.name}\n`;
        });
        knowledgeContent += `\n`;
      }

      // Add estimates information
      if (projectData.estimates?.length > 0) {
        knowledgeSources.push('Estimates');
        knowledgeContent += `## Estimates (${projectData.estimates.length})\n`;
        projectData.estimates.forEach((estimate: any) => {
          knowledgeContent += `- ${estimate.name || 'Unnamed Estimate'}\n`;
          knowledgeContent += `  Total: $${estimate.total_amount || 0}\n`;
        });
        knowledgeContent += `\n`;
      }

      // Upsert the knowledge entry
      const { error: upsertError } = await supabase
        .from('skai_knowledge')
        .upsert({
          knowledge_type: 'project',
          company_id: currentCompany.id,
          title: `${projectData.name} - Auto-Generated Project Knowledge`,
          content: knowledgeContent,
          category: 'Project Context',
          tags: ['auto-generated', 'project', ...knowledgeSources.map(s => s.toLowerCase())],
          metadata: {
            project_id: projectId,
            project_name: projectData.name,
            sources: knowledgeSources,
            document_count: projectData.project_documents?.length || 0,
            task_count: projectData.tasks?.length || 0
          },
          is_active: true
        }, {
          onConflict: 'knowledge_type,company_id,metadata->project_id',
          ignoreDuplicates: false
        });

      if (upsertError) throw upsertError;

      toast({
        title: "Success",
        description: `Project knowledge synced successfully for ${projectData.name}`,
      });

      fetchProjectsKnowledge();
    } catch (error) {
      console.error('Error syncing project knowledge:', error);
      toast({
        title: "Error",
        description: "Failed to sync project knowledge",
        variant: "destructive"
      });
    } finally {
      setSyncingProjectId(null);
    }
  };

  const syncAllProjects = async () => {
    for (const project of projects) {
      await syncProjectKnowledge(project.project_id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            Loading project knowledge data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Project Document Categories
          </CardTitle>
          <CardDescription>
            All document containers/categories used across projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading document categories...
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No document categories found
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section) => (
                <Collapsible
                  key={section.section_number}
                  open={expandedSections.has(section.section_number)}
                  onOpenChange={() => toggleSection(section.section_number)}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FolderOpen className="h-5 w-5 text-primary" />
                            <div className="text-left">
                              <CardTitle className="text-lg">
                                {section.section_name}
                              </CardTitle>
                              <CardDescription>
                                Section {section.section_number} • {section.categories.length} categories
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {section.categories.length}
                          </Badge>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="grid gap-2">
                          {section.categories.map((category) => (
                            <div
                              key={category.id}
                              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{category.name}</div>
                                  {category.description && (
                                    <div className="text-sm text-muted-foreground">
                                      {category.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline">{category.document_type}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Knowledge Sync Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Knowledge Auto-Generation</CardTitle>
              <CardDescription>
                Knowledge automatically extracted from project data, documents, contracts, and analytics
              </CardDescription>
            </div>
            <Button 
              onClick={syncAllProjects}
              disabled={syncingProjectId !== null}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All Projects
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                No projects found. Create projects to generate knowledge.
              </div>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project.project_id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {project.project_name}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => syncProjectKnowledge(project.project_id)}
                    disabled={syncingProjectId === project.project_id}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncingProjectId === project.project_id ? 'animate-spin' : ''}`} />
                    {syncingProjectId === project.project_id ? 'Syncing...' : 'Sync'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{project.document_count}</div>
                      <div className="text-xs text-muted-foreground">Documents</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">
                        {project.last_synced ? 'Synced' : 'Not Synced'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.last_synced 
                          ? new Date(project.last_synced).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {project.knowledge_sources.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Knowledge Sources:</div>
                    <div className="flex flex-wrap gap-2">
                      {project.knowledge_sources.map((source) => (
                        <Badge key={source} variant="secondary">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
