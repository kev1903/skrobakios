import { supabase } from '@/integrations/supabase/client';
import type { DatabaseProfile, DatabaseRole } from '@/types/accessUsers';
import type { AccessUser, UserRole } from '@/components/admin/types';
import { mapDatabaseRoleToDisplayRole, mapDisplayRoleToDatabase } from '@/utils/roleMapping';

export const fetchUsersData = async (): Promise<AccessUser[]> => {
  const { data, error: fetchError } = await supabase
    .from('profiles')
    .select(`
      id,
      user_id,
      first_name,
      last_name,
      email,
      avatar_url,
      company,
      status
    `)
    .order('first_name');

  if (fetchError) throw fetchError;

  // Get user roles separately
  const { data: rolesData, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role');

  if (rolesError) throw rolesError;

  // Create a map of user roles for quick lookup
  const rolesMap = new Map<string, DatabaseRole['role']>();
  (rolesData as DatabaseRole[]).forEach(role => {
    rolesMap.set(role.user_id, role.role);
  });

  const accessUsers: AccessUser[] = (data as DatabaseProfile[]).map(user => ({
    id: user.id,
    first_name: user.first_name || 'Unknown',
    last_name: user.last_name || 'User',
    email: user.email || '',
    company: user.company || 'No Company',
    role: mapDatabaseRoleToDisplayRole(rolesMap.get(user.user_id || '') || 'user'),
    status: user.status === 'invited' ? 'Invited' as const : 'Active' as const,
    avatar: user.avatar_url || undefined,
  }));

  return accessUsers;
};

export const updateUserRoleInDatabase = async (userId: string, newRole: UserRole): Promise<void> => {
  const dbRole = mapDisplayRoleToDatabase(newRole);

  const { error: updateError } = await supabase
    .from('user_roles')
    .update({ role: dbRole })
    .eq('user_id', userId);

  if (updateError) throw updateError;
};

export const deleteUserFromDatabase = async (userId: string): Promise<void> => {
  console.log('Starting delete process for user:', userId);
  
  // Get the user_id from the profile first
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, email, first_name, last_name')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    throw profileError;
  }

  console.log('Profile data found:', profileData);
  const userAccountId = profileData.user_id;

  // Delete user role first (foreign key constraint) - only if user has an account
  if (userAccountId) {
    console.log('Deleting user role for:', userAccountId);
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userAccountId);

    if (roleError) {
      console.error('Error deleting user role:', roleError);
      throw roleError;
    }
    console.log('User role deleted successfully');
  } else {
    console.log('No user account found, skipping role deletion');
  }

  // Delete any pending invitations for this user
  if (profileData.email) {
    console.log('Deleting invitations for:', profileData.email);
    const { error: invitationError } = await supabase
      .from('user_invitations')
      .delete()
      .eq('email', profileData.email);

    if (invitationError) {
      console.error('Error deleting invitations:', invitationError);
      // Don't throw here, continue with profile deletion
    } else {
      console.log('Invitations deleted successfully');
    }
  }

  // Delete the profile (this should now work with the new RLS policy)
  console.log('Deleting profile:', userId);
  const { error: deleteError, count } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (deleteError) {
    console.error('Error deleting profile:', deleteError);
    throw deleteError;
  }
  
  console.log('Profile deletion result - rows affected:', count);
  
  if (count === 0) {
    console.warn('No rows were deleted - profile may not exist or permission denied');
    throw new Error('Failed to delete profile - no rows affected');
  }
  
  console.log('Profile deleted successfully');
};