import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  ExternalLink, 
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  media_urls: string[] | null;
  is_public: boolean | null;
  is_featured: boolean | null;
  case_study_url: string | null;
  project_date: string | null;
  created_at: string | null;
  owner_type: string;
  owner_id: string;
}

interface PortfolioItemCardProps {
  item: PortfolioItem;
  onEdit: (item: PortfolioItem) => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string, currentFeatured: boolean | null) => void;
  onTogglePublic: (id: string, currentPublic: boolean | null) => void;
}

export const PortfolioItemCard: React.FC<PortfolioItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleFeatured,
  onTogglePublic
}) => {
  const firstImage = item.media_urls?.[0];
  const imageCount = item.media_urls?.length || 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-900 mb-1 line-clamp-2">
              {item.title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {item.category}
              </Badge>
              {item.is_featured && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {item.is_public ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Eye className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge className="bg-slate-100 text-slate-800 border-slate-200">
                  <EyeOff className="w-3 h-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Image Preview */}
        <div className="relative mb-4 rounded-lg overflow-hidden bg-slate-100 aspect-video">
          {firstImage ? (
            <>
              <img 
                src={firstImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {imageCount > 1 && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  +{imageCount - 1} more
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-slate-400" />
            </div>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-3">
            {item.description}
          </p>
        )}

        {/* Project Date */}
        {item.project_date && (
          <div className="flex items-center text-sm text-slate-500 mb-4">
            <Calendar className="w-4 h-4 mr-2" />
            {format(new Date(item.project_date), 'MMM yyyy')}
          </div>
        )}

        {/* Case Study Link */}
        {item.case_study_url && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-4"
            onClick={() => window.open(item.case_study_url!, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Case Study
          </Button>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          
          <Button
            variant={item.is_featured ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleFeatured(item.id, item.is_featured)}
            className={item.is_featured ? "bg-yellow-600 hover:bg-yellow-700" : ""}
          >
            <Star className="w-4 h-4" />
          </Button>

          <Button
            variant={item.is_public ? "default" : "outline"}
            size="sm"
            onClick={() => onTogglePublic(item.id, item.is_public)}
            className={item.is_public ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {item.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};