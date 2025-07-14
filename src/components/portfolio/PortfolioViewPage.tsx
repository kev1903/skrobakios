import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Star, 
  ExternalLink, 
  Calendar,
  Image as ImageIcon,
  Search,
  Filter,
  User,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface PortfolioViewPageProps {
  onNavigate: (page: string) => void;
}

const CATEGORIES = [
  'All',
  'Web Development',
  'Mobile App',
  'Design',
  'Construction',
  'Architecture', 
  'Engineering',
  'Marketing',
  'Photography',
  'Video Production',
  'Consulting',
  'Other'
];

export const PortfolioViewPage: React.FC<PortfolioViewPageProps> = ({ onNavigate }) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  const fetchPortfolioItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('is_public', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolioItems(data || []);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch portfolio items',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = portfolioItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesFeatured = !showFeaturedOnly || item.is_featured;
    
    return matchesSearch && matchesCategory && matchesFeatured;
  });

  const featuredItems = filteredItems.filter(item => item.is_featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Portfolio Gallery</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover amazing projects and work from our community
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search portfolio items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showFeaturedOnly ? "default" : "outline"}
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className="flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Featured Only
          </Button>
        </div>

        {/* Featured Section */}
        {featuredItems.length > 0 && !showFeaturedOnly && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-600" />
              Featured Portfolio Items
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {featuredItems.slice(0, 3).map((item) => (
                <PortfolioCard key={item.id} item={item} featured />
              ))}
            </div>
          </div>
        )}

        {/* All Items */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {showFeaturedOnly ? 'Featured Items' : 'All Portfolio Items'}
            <span className="text-slate-500 text-lg font-normal ml-2">
              ({filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'})
            </span>
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading portfolio items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Portfolio Items Found</h3>
              <p className="text-slate-600">
                {searchTerm || selectedCategory !== 'All' || showFeaturedOnly
                  ? 'Try adjusting your search criteria'
                  : 'No public portfolio items are available yet'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <PortfolioCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PortfolioCardProps {
  item: PortfolioItem;
  featured?: boolean;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ item, featured = false }) => {
  const firstImage = item.media_urls?.[0];
  const imageCount = item.media_urls?.length || 0;

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm ${featured ? 'ring-2 ring-yellow-300' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
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
              <Badge variant="outline" className="text-xs">
                <div className="flex items-center gap-1">
                  {item.owner_type === 'user' ? <User className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                  {item.owner_type === 'user' ? 'Individual' : 'Company'}
                </div>
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Image Preview */}
        <div className="relative mb-4 rounded-lg overflow-hidden bg-slate-100 aspect-video group-hover:scale-105 transition-transform duration-300">
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
            className="w-full hover:bg-blue-50 hover:border-blue-300"
            onClick={() => window.open(item.case_study_url!, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Case Study
          </Button>
        )}
      </CardContent>
    </Card>
  );
};