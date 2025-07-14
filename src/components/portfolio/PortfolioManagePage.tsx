import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Star, ExternalLink, Image, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreatePortfolioItemDialog } from './CreatePortfolioItemDialog';
import { EditPortfolioItemDialog } from './EditPortfolioItemDialog';
import { PortfolioItemCard } from './PortfolioItemCard';

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

interface PortfolioManagePageProps {
  onNavigate: (page: string) => void;
}

export const PortfolioManagePage: React.FC<PortfolioManagePageProps> = ({ onNavigate }) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchPortfolioItems();
    }
  }, [currentUserId]);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user information',
        variant: 'destructive'
      });
    }
  };

  const fetchPortfolioItems = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('owner_id', currentUserId)
        .eq('owner_type', 'user')
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

  const handleCreateItem = async (newItem: Omit<PortfolioItem, 'id' | 'created_at' | 'owner_id' | 'owner_type'>) => {
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_items')
        .insert([{
          ...newItem,
          owner_id: currentUserId,
          owner_type: 'user'
        }])
        .select()
        .single();

      if (error) throw error;

      setPortfolioItems(prev => [data, ...prev]);
      setShowCreateDialog(false);
      toast({
        title: 'Success',
        description: 'Portfolio item created successfully'
      });
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      toast({
        title: 'Error',
        description: 'Failed to create portfolio item',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateItem = async (updatedItem: PortfolioItem) => {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .update(updatedItem)
        .eq('id', updatedItem.id);

      if (error) throw error;

      setPortfolioItems(prev => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
      setEditingItem(null);
      toast({
        title: 'Success',
        description: 'Portfolio item updated successfully'
      });
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update portfolio item',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPortfolioItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Success',
        description: 'Portfolio item deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete portfolio item',
        variant: 'destructive'
      });
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean | null) => {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .update({ is_featured: !currentFeatured })
        .eq('id', id);

      if (error) throw error;

      setPortfolioItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, is_featured: !currentFeatured } : item
        )
      );

      toast({
        title: 'Success',
        description: `Portfolio item ${!currentFeatured ? 'featured' : 'unfeatured'}`
      });
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update featured status',
        variant: 'destructive'
      });
    }
  };

  const togglePublic = async (id: string, currentPublic: boolean | null) => {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .update({ is_public: !currentPublic })
        .eq('id', id);

      if (error) throw error;

      setPortfolioItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, is_public: !currentPublic } : item
        )
      );

      toast({
        title: 'Success',
        description: `Portfolio item is now ${!currentPublic ? 'public' : 'private'}`
      });
    } catch (error) {
      console.error('Error toggling public status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update visibility',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Portfolio Management</h1>
            <p className="text-slate-600">Showcase your best work and achievements</p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Portfolio Item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Items</p>
                  <p className="text-2xl font-bold text-slate-900">{portfolioItems.length}</p>
                </div>
                <Image className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Featured</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {portfolioItems.filter(item => item.is_featured).length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Public</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {portfolioItems.filter(item => item.is_public).length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">With Case Studies</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {portfolioItems.filter(item => item.case_study_url).length}
                  </p>
                </div>
                <ExternalLink className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Items */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading portfolio items...</p>
          </div>
        ) : portfolioItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Image className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Portfolio Items Yet</h3>
              <p className="text-slate-600 mb-4">
                Start building your portfolio by adding your first project
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {portfolioItems.map((item) => (
              <PortfolioItemCard
                key={item.id}
                item={item}
                onEdit={setEditingItem}
                onDelete={handleDeleteItem}
                onToggleFeatured={toggleFeatured}
                onTogglePublic={togglePublic}
              />
            ))}
          </div>
        )}

        {/* Dialogs */}
        <CreatePortfolioItemDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreateItem}
        />

        <EditPortfolioItemDialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          onSubmit={handleUpdateItem}
        />
      </div>
    </div>
  );
};