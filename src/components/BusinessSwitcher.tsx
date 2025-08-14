import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Building2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Business {
  id: string;
  name: string;
  role: string;
  status: string;
}

interface BusinessSwitcherProps {
  currentBusiness?: string;
  onBusinessChange?: (businessId: string, businessName: string) => void;
}

export const BusinessSwitcher = ({ currentBusiness, onBusinessChange }: BusinessSwitcherProps) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserBusinesses();
  }, []);

  const loadUserBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('company_members')
        .select(`
          company_id,
          role,
          status,
          companies:company_id (
            id,
            name
          )
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const businessList = data?.map(item => ({
        id: item.company_id,
        name: (item.companies as any)?.name || 'Unknown',
        role: item.role,
        status: item.status
      })) || [];

      console.log('Loaded businesses:', businessList);
      setBusinesses(businessList);

      // Set current active business (first active one or first overall)
      const activeBusinessItem = businessList.find(b => b.status === 'active') || businessList[0];
      if (activeBusinessItem) {
        setActiveBusiness(activeBusinessItem);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
      toast({
        title: "Error",
        description: "Failed to load businesses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchBusiness = async (business: Business) => {
    try {
      // Deactivate all businesses for this user
      await supabase
        .from('company_members')
        .update({ status: 'inactive' })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      // Activate the selected business
      const { error } = await supabase
        .from('company_members')
        .update({ status: 'active' })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('company_id', business.id);

      if (error) throw error;

      setActiveBusiness(business);
      
      toast({
        title: "Business Switched",
        description: `Now viewing ${business.name}`,
      });

      // Notify parent component
      onBusinessChange?.(business.id, business.name);

      // Reload the page to refresh all data
      window.location.reload();
    } catch (error) {
      console.error('Error switching business:', error);
      toast({
        title: "Error",
        description: "Failed to switch business",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        Loading...
      </div>
    );
  }

  // Always show dropdown if there are businesses, even if only one is active
  if (businesses.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Building2 className="h-4 w-4" />
        No Business
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4" />
          {activeBusiness?.name || 'Select Business'}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px] bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl z-50">
        {businesses.map((business) => (
          <DropdownMenuItem
            key={business.id}
            onClick={() => switchBusiness(business)}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="font-medium">{business.name}</span>
              <span className="text-xs text-muted-foreground">
                {business.role} • {business.status}
              </span>
            </div>
            {activeBusiness?.id === business.id && business.status === 'active' && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};