import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface KnowledgeListProps {
  entries: KnowledgeEntry[];
  onEdit: (entry: KnowledgeEntry) => void;
  onDelete: (id: string) => void;
  onView: (entry: KnowledgeEntry) => void;
}

export const KnowledgeList: React.FC<KnowledgeListProps> = ({
  entries,
  onEdit,
  onDelete,
  onView
}) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No knowledge entries yet. Create your first one!
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {entries.map((entry) => (
        <Card key={entry.id} className={!entry.is_active ? 'opacity-50' : ''}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{entry.title}</CardTitle>
                {entry.category && (
                  <Badge variant="outline" className="mt-2">
                    {entry.category}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onView(entry)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(entry)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {entry.content}
            </p>
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-3">
              Updated: {new Date(entry.updated_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
