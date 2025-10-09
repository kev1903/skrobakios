import { supabase } from '@/integrations/supabase/client';
import { Task } from './types';

export const taskService = {
  async loadTasksAssignedToUser(): Promise<Task[]> {
    try {
      // Get current user's profile to match against assigned_to_name
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, user_id, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (!profile) return [];

      const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      if (!userName) return [];

      // Get tasks assigned to the current user by name
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*, assigned_to_user_id')
        .eq('assigned_to_name', userName)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      if (!tasksData || tasksData.length === 0) return [];

      // Get unique project IDs
      const projectIds = Array.from(new Set(
        tasksData
          .map(task => task.project_id)
          .filter(id => id)
      ));
      
      // Fetch project names if we have project IDs
      let projectMap = new Map<string, string>();
      if (projectIds.length > 0) {
        const { data: projectsData } = await supabase
          .from('projects')
          .select('id, name')
          .in('id', projectIds);

        if (projectsData) {
          projectsData.forEach(project => {
            projectMap.set(project.id, project.name);
          });
        }
      }
      
      // Map database fields to component interface with current user profile data
      return tasksData.map(task => ({
        id: task.id,
        project_id: task.project_id || '',
        projectName: projectMap.get(task.project_id) || 'No Project',
        taskName: task.task_name,
        task_number: task.task_number || '',
        taskType: (task.task_type as 'Task' | 'Bug' | 'Feature') || 'Task',
        category: task.category || 'General',
        priority: task.priority as 'High' | 'Medium' | 'Low',
        assignedTo: {
          name: task.assigned_to_name || '',
          avatar: profile.avatar_url || task.assigned_to_avatar || '',
          userId: profile.user_id
        },
        dueDate: task.due_date || '', // Now contains full datetime
        status: task.status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
        progress: task.progress || 0,
        description: task.description,
        duration: Number(task.duration) || 0,
        is_milestone: task.is_milestone || false,
        is_critical_path: task.is_critical_path || false,
        created_at: task.created_at,
        updated_at: task.updated_at
      }));
    } catch (error) {
      console.error('Error loading tasks for user:', error);
      return [];
    }
  },

  async loadTasksForProject(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, assigned_to_user_id')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Get unique assigned user names to fetch their profiles
    const assignedUserNames = Array.from(new Set(
      (data || [])
        .map(task => task.assigned_to_name)
        .filter(name => name && name.trim())
    ));

    // Fetch user profiles for assigned users
    let userProfileMap = new Map<string, any>();
    if (assignedUserNames.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url, professional_title, email')
        .or(
          assignedUserNames
            .map(name => `first_name.ilike.%${name.split(' ')[0]}%,last_name.ilike.%${name.split(' ').slice(1).join(' ')}%`)
            .join(',')
        );

      if (profilesData) {
        profilesData.forEach(profile => {
          const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
          userProfileMap.set(fullName, profile);
        });
      }
    }
    
    // Map database fields to component interface with enhanced user data
    return (data || []).map(task => {
      const assignedUserProfile = userProfileMap.get(task.assigned_to_name || '');
      
      return {
        id: task.id,
        project_id: task.project_id,
        taskName: task.task_name,
        task_number: task.task_number || '',
        taskType: (task.task_type as 'Task' | 'Bug' | 'Feature') || 'Task',
        category: task.category || 'General',
        priority: task.priority as 'High' | 'Medium' | 'Low',
        assignedTo: {
          name: task.assigned_to_name || '',
          avatar: assignedUserProfile?.avatar_url || task.assigned_to_avatar || '',
          userId: task.assigned_to_user_id || assignedUserProfile?.user_id || undefined
        },
        dueDate: task.due_date || '', // Now contains full datetime
        status: task.status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
        progress: task.progress,
        description: task.description,
        duration: Number(task.duration) || 0,
        is_milestone: task.is_milestone,
        is_critical_path: task.is_critical_path,
        created_at: task.created_at,
        updated_at: task.updated_at
      };
    });
  },

  async updateTask(taskId: string, updates: Partial<Task>, userProfile: any): Promise<void> {
    // Map component fields to database fields
    const dbUpdates: any = {};
    if (updates.taskName !== undefined) dbUpdates.task_name = updates.taskName;
    if (updates.taskType !== undefined) dbUpdates.task_type = updates.taskType;
    if (updates.assignedTo !== undefined) {
      dbUpdates.assigned_to_name = updates.assignedTo.name;
      dbUpdates.assigned_to_avatar = updates.assignedTo.avatar;
      
      // If we have a userId, also store that for better data consistency
      if (updates.assignedTo.userId) {
        dbUpdates.assigned_to_user_id = updates.assignedTo.userId;
        
        // Fetch the user's current profile data to ensure we have the latest info
        const { data: assigneeProfile } = await supabase
          .from('profiles')
          .select('avatar_url, first_name, last_name')
          .eq('user_id', updates.assignedTo.userId)
          .single();
        
        if (assigneeProfile) {
          dbUpdates.assigned_to_avatar = assigneeProfile.avatar_url || updates.assignedTo.avatar;
          // Ensure name consistency with database profile
          const profileName = `${assigneeProfile.first_name || ''} ${assigneeProfile.last_name || ''}`.trim();
          if (profileName) {
            dbUpdates.assigned_to_name = profileName;
          }
        }
      } else {
        // Clear the user_id if no userId is provided
        dbUpdates.assigned_to_user_id = null;
      }
    }
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.duration !== undefined) dbUpdates.estimated_duration = updates.duration;
    if (updates.is_milestone !== undefined) dbUpdates.is_milestone = updates.is_milestone;
    if (updates.is_critical_path !== undefined) dbUpdates.is_critical_path = updates.is_critical_path;

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', taskId);

    if (error) throw error;

    // Log activity for significant changes
    await this.logTaskActivity(taskId, updates, userProfile);
  },

  async addTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    // Map component fields to database fields
    const dbTask = {
      project_id: taskData.project_id,
      task_name: taskData.taskName,
      task_type: taskData.taskType || 'Task',
      priority: taskData.priority,
      assigned_to_name: taskData.assignedTo?.name || null,
      assigned_to_avatar: taskData.assignedTo?.avatar || null,
      assigned_to_user_id: taskData.assignedTo?.userId || null,
      due_date: taskData.dueDate || null,
      status: taskData.status,
      progress: taskData.progress,
      description: taskData.description || null,
      estimated_duration: taskData.duration || null,
      is_milestone: taskData.is_milestone || false,
      is_critical_path: taskData.is_critical_path || false
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([dbTask])
      .select()
      .single();

    if (error) throw error;

    // Map response back to component interface
    return {
      id: data.id,
      project_id: data.project_id,
      taskName: data.task_name,
      task_number: data.task_number,
      taskType: (data.task_type as 'Task' | 'Bug' | 'Feature') || 'Task',
      priority: data.priority as 'High' | 'Medium' | 'Low',
      assignedTo: {
        name: data.assigned_to_name || '',
        avatar: data.assigned_to_avatar || '',
        userId: data.assigned_to_user_id || undefined
      },
      dueDate: data.due_date || '', // Now contains full datetime
      status: data.status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
      progress: data.progress,
      description: data.description,
      duration: Number(data.duration) || 0,
      is_milestone: data.is_milestone,
      is_critical_path: data.is_critical_path,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },

  async logTaskActivity(taskId: string, updates: Partial<Task>, userProfile: any): Promise<void> {
    const activityPromises = [];
    const userName = `${userProfile.firstName} ${userProfile.lastName}`.trim() || 'Anonymous User';
    const userAvatar = userProfile.avatarUrl || '';
    
    if (updates.status !== undefined) {
      activityPromises.push(
        supabase.from('task_activity_log').insert({
          task_id: taskId,
          user_name: userName,
          user_avatar: userAvatar,
          action_type: 'status_change',
          action_description: `changed status to ${updates.status}`
        })
      );
    }
    if (updates.assignedTo !== undefined) {
      activityPromises.push(
        supabase.from('task_activity_log').insert({
          task_id: taskId,
          user_name: userName,
          user_avatar: userAvatar,
          action_type: 'assignment_change',
          action_description: `assigned to ${updates.assignedTo.name}`
        })
      );
    }
    if (updates.progress !== undefined && updates.progress === 100) {
      activityPromises.push(
        supabase.from('task_activity_log').insert({
          task_id: taskId,
          user_name: userName,
          user_avatar: userAvatar,
          action_type: 'task_completed',
          action_description: 'completed this task'
        })
      );
    }
    if (updates.taskName !== undefined) {
      activityPromises.push(
        supabase.from('task_activity_log').insert({
          task_id: taskId,
          user_name: userName,
          user_avatar: userAvatar,
          action_type: 'task_updated',
          action_description: 'updated task name'
        })
      );
    }
    if (updates.description !== undefined) {
      activityPromises.push(
        supabase.from('task_activity_log').insert({
          task_id: taskId,
          user_name: userName,
          user_avatar: userAvatar,
          action_type: 'task_updated',
          action_description: 'updated task description'
        })
      );
    }
    if (updates.dueDate !== undefined) {
      activityPromises.push(
        supabase.from('task_activity_log').insert({
          task_id: taskId,
          user_name: userName,
          user_avatar: userAvatar,
          action_type: 'task_updated',
          action_description: 'updated due date'
        })
      );
    }
    if (updates.taskType !== undefined) {
      activityPromises.push(
        supabase.from('task_activity_log').insert({
          task_id: taskId,
          user_name: userName,
          user_avatar: userAvatar,
          action_type: 'task_updated',
          action_description: `changed task type to ${updates.taskType}`
        })
      );
    }
    
    // Execute activity logging (don't await to avoid blocking UI)
    if (activityPromises.length > 0) {
      Promise.all(activityPromises).catch(console.error);
    }
  }
};