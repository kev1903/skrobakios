import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, HardHat, FileText } from "lucide-react";
import { KnowledgeSection } from './skai/KnowledgeSection';
import { useCompany } from '@/contexts/CompanyContext';

export const SkAiPanel: React.FC = () => {
  const { currentCompany } = useCompany();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">SkAi Knowledge Management</h2>
        <p className="text-muted-foreground">
          Manage the knowledge that SkAi uses across the platform for construction business operations
        </p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Business Knowledge
          </TabsTrigger>
          <TabsTrigger value="industry" className="flex items-center gap-2">
            <HardHat className="h-4 w-4" />
            Industry Knowledge
          </TabsTrigger>
          <TabsTrigger value="project" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Project Knowledge
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <KnowledgeSection
            type="business"
            title="Business Knowledge"
            description="Company-specific processes, policies, and operational procedures"
            companyId={currentCompany?.id}
          />
        </TabsContent>

        <TabsContent value="industry" className="space-y-6">
          <KnowledgeSection
            type="industry"
            title="Industry Knowledge"
            description="Construction industry standards, regulations, and best practices"
            companyId={currentCompany?.id}
          />
        </TabsContent>

        <TabsContent value="project" className="space-y-6">
          <KnowledgeSection
            type="project"
            title="Project Knowledge"
            description="Project-specific guidelines, templates, and methodologies"
            companyId={currentCompany?.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
