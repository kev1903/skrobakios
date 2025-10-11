import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, FileText, Building2, Calendar, DollarSign } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/contexts/CompanyContext';

interface ProjectKnowledgeData {
  project_id: string;
  project_name: string;
  status: string;
  document_count: number;
  contract_count: number;
  last_synced: string | null;
  knowledge_sources: string[];
}

export const ProjectKnowledgeSection: React.FC = () => {
  const { toast } = useToast();
  const { currentCompany } = useCompany();
  const [projects, setProjects] = useState<ProjectKnowledgeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingProjectId, setSyncingProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (currentCompany?.id) {
      fetchProjectsKnowledge();
    }
  }, [currentCompany?.id]);

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
          project_documents(count),
          project_contracts(count)
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
          contract_count: project.project_contracts?.[0]?.count || 0,
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
          project_contracts(*),
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

      // Add contracts information
      if (projectData.project_contracts?.length > 0) {
        knowledgeSources.push('Contracts');
        knowledgeContent += `## Contracts (${projectData.project_contracts.length})\n`;
        projectData.project_contracts.forEach((contract: any) => {
          knowledgeContent += `- ${contract.contract_name || 'Unnamed Contract'}\n`;
          knowledgeContent += `  Type: ${contract.contract_type}\n`;
          knowledgeContent += `  Value: $${contract.contract_value || 0}\n`;
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
            contract_count: projectData.project_contracts?.length || 0,
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
    <div className="space-y-4">
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
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{project.contract_count}</div>
                      <div className="text-xs text-muted-foreground">Contracts</div>
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
