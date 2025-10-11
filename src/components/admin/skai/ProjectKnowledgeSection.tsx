import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Layers } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

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
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setCategories(data || []);
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
        ) : categories.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No document categories found
          </div>
        ) : (
          <div className="grid gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-base">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="outline">{category.document_type}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
