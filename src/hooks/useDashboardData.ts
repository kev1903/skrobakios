import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardStats {
  totalEmployees: number;
  totalHirings: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingProjects: number;
}

export interface OnboardingTask {
  id: string;
  name: string;
  date: string;
  completed: boolean;
  description?: string;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalHirings: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingProjects: 0,
  });
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    if (!user) {
      console.log('No user found, skipping dashboard data fetch');
      return;
    }

    try {
      setError(null); // Clear any previous errors
      console.log('Fetching dashboard data for user:', user.id);

      // Fetch projects data with better error handling
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('status');

      if (projectsError) {
        console.error('Projects fetch error:', projectsError);
        throw new Error(`Failed to fetch projects: ${projectsError.message}`);
      }

      console.log('Projects data:', projects);

      // Fetch team members data with better error handling
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('status');

      if (teamError) {
        console.error('Team members fetch error:', teamError);
        throw new Error(`Failed to fetch team members: ${teamError.message}`);
      }

      console.log('Team members data:', teamMembers);

      // Calculate stats
      const totalProjects = projects?.length || 0;
      const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
      const pendingProjects = projects?.filter(p => p.status === 'pending').length || 0;
      
      const totalEmployees = teamMembers?.filter(m => m.status === 'active').length || 0;
      const totalHirings = teamMembers?.filter(m => m.status === 'pending').length || 0;

      setStats({
        totalEmployees,
        totalHirings,
        totalProjects,
        activeProjects,
        completedProjects,
        pendingProjects,
      });

      console.log('Dashboard stats updated successfully');
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
    }
  };

  const initializeOnboardingTasks = () => {
    const defaultTasks: OnboardingTask[] = [
      {
        id: '1',
        name: 'Complete Profile Setup',
        date: new Date().toLocaleDateString(),
        completed: false,
        description: 'Fill out your personal and professional information'
      },
      {
        id: '2',
        name: 'Join First Project',
        date: new Date().toLocaleDateString(),
        completed: false,
        description: 'Get assigned to your first project'
      },
      {
        id: '3',
        name: 'Team Introduction',
        date: new Date().toLocaleDateString(),
        completed: false,
        description: 'Meet your team members'
      },
      {
        id: '4',
        name: 'First Task Assignment',
        date: new Date().toLocaleDateString(),
        completed: false,
        description: 'Complete your first assigned task'
      },
      {
        id: '5',
        name: 'Training Completion',
        date: new Date().toLocaleDateString(),
        completed: false,
        description: 'Complete required training modules'
      }
    ];

    // Load from localStorage if available
    const saved = localStorage.getItem(`onboarding_tasks_${user?.id}`);
    if (saved) {
      setOnboardingTasks(JSON.parse(saved));
    } else {
      setOnboardingTasks(defaultTasks);
      localStorage.setItem(`onboarding_tasks_${user?.id}`, JSON.stringify(defaultTasks));
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setOnboardingTasks(prev => {
      const updated = prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      localStorage.setItem(`onboarding_tasks_${user?.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const getOnboardingProgress = () => {
    const completed = onboardingTasks.filter(task => task.completed).length;
    return Math.round((completed / onboardingTasks.length) * 100);
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      setError(null);
      
      const loadDashboardData = async () => {
        try {
          await fetchDashboardStats();
          initializeOnboardingTasks();
        } catch (err) {
          console.error('Error loading dashboard data:', err);
        } finally {
          setLoading(false);
        }
      };

      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    stats,
    onboardingTasks,
    loading,
    error,
    toggleTaskCompletion,
    getOnboardingProgress,
    refreshStats: fetchDashboardStats
  };
};