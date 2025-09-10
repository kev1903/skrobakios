import { Project } from '@/hooks/useProjects';

// Helper function to convert database row to Project type
export const convertDbRowToProject = (row: any): Project => {
  return {
    ...row,
    banner_position: row.banner_position ? 
      (typeof row.banner_position === 'object' ? row.banner_position : { x: 0, y: 0, scale: 1 }) :
      null
  };
};