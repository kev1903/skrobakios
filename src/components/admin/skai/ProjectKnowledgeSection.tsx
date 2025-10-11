import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FolderOpen, Layers } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [sections, setSections] = useState<SectionData[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([1]));

  useEffect(() => {
    fetchDocumentCategories();
  }, []);

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

  return (
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
  );
};
