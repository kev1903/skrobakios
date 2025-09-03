import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecureContact {
  id: string;
  stakeholder_id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  is_primary: boolean;
  is_preferred: boolean;
  created_at: string;
}

interface UseSecureStakeholderContactsReturn {
  contacts: SecureContact[];
  loading: boolean;
  error: string | null;
  canViewSensitiveData: boolean;
  refetch: () => Promise<void>;
}

export const useSecureStakeholderContacts = (
  stakeholderId: string
): UseSecureStakeholderContactsReturn => {
  const [contacts, setContacts] = useState<SecureContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canViewSensitiveData, setCanViewSensitiveData] = useState(false);

  const checkPermissions = async () => {
    try {
      // Check if user can manage stakeholder contacts (admin/owner access)
      const { data: canManage, error: manageError } = await supabase
        .rpc('can_manage_stakeholder_contacts', {
          target_stakeholder_id: stakeholderId
        });

      if (manageError) {
        console.warn('Permission check failed:', manageError);
        setCanViewSensitiveData(false);
        return;
      }

      setCanViewSensitiveData(canManage || false);
    } catch (err) {
      console.warn('Permission check error:', err);
      setCanViewSensitiveData(false);
    }
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check rate limiting first
      const { data: canProceed, error: rateLimitError } = await supabase
        .rpc('check_contact_access_rate_limit', {
          operation_type: 'stakeholder_contact_access'
        });

      if (rateLimitError) {
        throw new Error('Rate limit check failed');
      }

      if (!canProceed) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Fetch contacts using the secure function
      const { data: contactsData, error: contactsError } = await supabase
        .rpc('get_stakeholder_contacts_secure', {
          target_stakeholder_id: stakeholderId,
          include_sensitive_data: false // Always use masked data initially
        });

      if (contactsError) {
        if (contactsError.message.includes('Access denied')) {
          throw new Error('Access denied: You do not have permission to view these contacts');
        }
        throw contactsError;
      }

      setContacts(contactsData || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch contacts';
      setError(errorMessage);
      console.error('Error fetching secure contacts:', err);
      
      // Show user-friendly error message
      if (errorMessage.includes('Rate limit')) {
        toast.error('Too many contact access requests. Please wait before trying again.');
      } else if (errorMessage.includes('Access denied')) {
        toast.error('You do not have permission to view contact information for this stakeholder.');
      } else {
        toast.error('Failed to load contact information');
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchContacts();
  };

  useEffect(() => {
    if (stakeholderId) {
      checkPermissions();
      fetchContacts();
    }
  }, [stakeholderId]);

  return {
    contacts,
    loading,
    error,
    canViewSensitiveData,
    refetch
  };
};

// Utility function to check if contact data appears to be masked
export const isContactDataMasked = (value: string | null): boolean => {
  if (!value) return false;
  return value.includes('***') || value.includes('*');
};

// Utility function to determine if any contact data is sensitive
export const hasSensitiveData = (contact: SecureContact): boolean => {
  return !!(contact.email || contact.phone || contact.mobile);
};