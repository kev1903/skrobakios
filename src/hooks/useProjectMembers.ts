
import { useState, useEffect } from 'react';

interface ProjectMember {
  name: string;
  avatar: string;
  role: string;
  email: string;
}

export const useProjectMembers = (projectId?: string) => {
  const [members, setMembers] = useState<ProjectMember[]>([
    {
      name: 'John Smith',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      role: 'Project Manager',
      email: 'john@example.com'
    },
    {
      name: 'Sarah Wilson',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      role: 'Architect',
      email: 'sarah@example.com'
    },
    {
      name: 'Mike Johnson',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      role: 'Engineer',
      email: 'mike@example.com'
    },
    {
      name: 'Lisa Brown',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      role: 'Electrician',
      email: 'lisa@example.com'
    },
    {
      name: 'David Miller',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      role: 'Plumber',
      email: 'david@example.com'
    }
  ]);

  // In a real application, you would fetch members based on projectId
  useEffect(() => {
    if (projectId) {
      // Fetch project members from API
      console.log('Fetching members for project:', projectId);
    }
  }, [projectId]);

  return { members };
};
