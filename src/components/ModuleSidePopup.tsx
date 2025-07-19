import React, { useState, useEffect } from 'react';
import { X, Plus, ExternalLink, Calendar, User, DollarSign, MapPin, FileText, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

interface ModuleSidePopupProps {
  isOpen: boolean;
  onClose: () => void;
  moduleData: {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
    color: string;
    table: string | null;
    moduleName: string;
  } | null;
  onNavigate: (page: string) => void;
}

interface ModuleItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
  [key: string]: any;
}

export const ModuleSidePopup = ({ isOpen, onClose, moduleData, onNavigate }: ModuleSidePopupProps) => {
  const { currentCompany } = useCompany();
  const [items, setItems] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && moduleData?.table && currentCompany) {
      fetchModuleItems();
    }
  }, [isOpen, moduleData, currentCompany]);

  const fetchModuleItems = async () => {
    if (!moduleData?.table || !currentCompany) return;

    setLoading(true);
    try {
      let query;
      
      // Handle different table types with proper typing
      switch (moduleData.table) {
        case 'leads':
          query = supabase.from('leads').select('*').eq('company_id', currentCompany.id);
          break;
        case 'projects':
          query = supabase.from('projects').select('*').eq('company_id', currentCompany.id);
          break;
        case 'project_costs':
          query = supabase.from('project_costs').select('*').eq('company_id', currentCompany.id);
          break;
        case 'estimates':
          query = supabase.from('estimates').select('*').eq('company_id', currentCompany.id);
          break;
        case 'activities':
          query = supabase.from('activities').select('*').eq('company_id', currentCompany.id);
          break;
        case 'company_members':
          query = supabase.from('company_members').select('*').eq('company_id', currentCompany.id);
          break;
        case 'model_3d':
          query = supabase.from('model_3d').select('*');
          break;
        case 'portfolio_items':
          query = supabase.from('portfolio_items').select('*').eq('owner_id', currentCompany.id).eq('owner_type', 'company');
          break;
        case 'digital_objects':
          query = supabase.from('digital_objects').select('*').eq('company_id', currentCompany.id);
          break;
        default:
          setItems([]);
          return;
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error(`Error fetching ${moduleData.table}:`, error);
        toast.error(`Failed to load ${moduleData.title} items`);
        setItems([]);
      } else {
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to load ${moduleData.title} items`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getItemDisplayName = (item: ModuleItem) => {
    return item.name || item.title || item.contact_name || item.estimate_name || item.project_id || `Item ${item.id.slice(0, 8)}`;
  };

  const getItemDescription = (item: ModuleItem) => {
    if (moduleData?.moduleName === 'leads') {
      return `${item.company || 'Unknown Company'} • ${item.stage || 'Unknown Stage'}`;
    }
    if (moduleData?.moduleName === 'projects') {
      return `${item.status || 'Unknown Status'} • ${item.project_type || 'Unknown Type'}`;
    }
    if (moduleData?.moduleName === 'estimates') {
      return `${item.status || 'Unknown Status'} • $${item.total_amount || '0'}`;
    }
    if (moduleData?.moduleName === 'activities') {
      return item.stage || item.description || 'Task item';
    }
    if (moduleData?.moduleName === 'company_members') {
      return `${item.role || 'Member'} • ${item.status || 'Unknown Status'}`;
    }
    return item.description || item.notes || 'No description available';
  };

  const getItemIcon = () => {
    switch (moduleData?.moduleName) {
      case 'leads':
        return User;
      case 'projects':
        return Building2;
      case 'estimates':
        return DollarSign;
      case 'activities':
        return Calendar;
      case 'company_members':
        return User;
      case 'model_3d':
        return MapPin;
      case 'portfolio_items':
        return FileText;
      default:
        return FileText;
    }
  };

  const handleItemClick = (item: ModuleItem) => {
    // Navigate to the specific module page
    if (moduleData?.moduleName === 'projects') {
      onNavigate('projects');
    } else if (moduleData?.moduleName === 'leads') {
      onNavigate('sales');
    } else if (moduleData?.moduleName === 'estimates') {
      onNavigate('cost-contracts');
    } else {
      onNavigate(moduleData?.moduleName || 'system');
    }
    onClose();
  };

  const handleAddNew = () => {
    // Navigate to create page for the module
    if (moduleData?.moduleName === 'projects') {
      onNavigate('create-project');
    } else if (moduleData?.moduleName === 'leads') {
      onNavigate('sales');
    } else if (moduleData?.moduleName === 'estimates') {
      onNavigate('cost-contracts');
    } else {
      onNavigate(moduleData?.moduleName || 'system');
    }
    onClose();
  };

  if (!isOpen || !moduleData) return null;

  const Icon = moduleData.icon;
  const ItemIcon = getItemIcon();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="fixed right-0 top-0 h-full w-96 bg-white/95 backdrop-blur-xl border-l border-white/20 shadow-2xl animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`${moduleData.color} p-6 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{moduleData.title}</h2>
                  <p className="text-white/80 text-sm">{moduleData.subtitle}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Badge>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddNew}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !moduleData.table ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Icon className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Dashboard Module</h3>
                <p className="text-muted-foreground">
                  This module provides analytics and insights for your business.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => {
                    onNavigate('dashboard');
                    onClose();
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Dashboard
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <ItemIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No {moduleData.title} Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first {moduleData.title.toLowerCase()} item.
                </p>
                <Button onClick={handleAddNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First {moduleData.title.slice(0, -1)}
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {items.map((item, index) => (
                    <Card 
                      key={item.id} 
                      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => handleItemClick(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                            <ItemIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {getItemDisplayName(item)}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {getItemDescription(item)}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                              {item.status && (
                                <Badge variant="outline" className="text-xs py-0 px-2">
                                  {item.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <>
              <Separator />
              <div className="p-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    onNavigate(moduleData.moduleName);
                    onClose();
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View All {moduleData.title}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};