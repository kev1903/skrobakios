export interface ActivityData {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  duration?: number | null | unknown; // Duration in days (flexible type for DB compatibility)
  cost_est: number | null;
  cost_actual: number | null;
  parent_id: string | null;
  level: number;
  is_expanded: boolean;
  stage: string | null;
  
  // Standardized fields matching Gantt chart requirements
  assigned_to?: string | null; // Assigned team member
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Delayed' | null; // Status
  progress?: number | null; // % Complete (0-100)
  health?: 'Good' | 'At Risk' | 'Critical' | 'Unknown' | null; // Health status
  progress_status?: 'On Track' | 'Behind' | 'Ahead' | 'Blocked' | null; // Progress status
  at_risk?: boolean | null; // At Risk flag
  priority?: 'High' | 'Medium' | 'Low' | null; // Priority
  
  created_at: string;
  updated_at: string;
  children?: ActivityData[];
}

export const buildActivityHierarchy = (flatActivities: ActivityData[]): ActivityData[] => {
  const activityMap = new Map<string, ActivityData>();
  const rootActivities: ActivityData[] = [];

  // First, create a map of all activities and initialize children arrays
  flatActivities.forEach(activity => {
    activityMap.set(activity.id, { ...activity, children: [] });
  });

  // Then, build the hierarchy
  flatActivities.forEach(activity => {
    const activityWithChildren = activityMap.get(activity.id)!;
    
    if (activity.parent_id) {
      const parent = activityMap.get(activity.parent_id);
      if (parent) {
        parent.children!.push(activityWithChildren);
      }
    } else {
      rootActivities.push(activityWithChildren);
    }
  });

  // Sort children by creation date
  const sortChildren = (activities: ActivityData[]) => {
    activities.forEach(activity => {
      if (activity.children && activity.children.length > 0) {
        activity.children.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        sortChildren(activity.children);
      }
    });
  };

  sortChildren(rootActivities);
  return rootActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const flattenActivityHierarchy = (activities: ActivityData[]): ActivityData[] => {
  const flattened: ActivityData[] = [];
  
  const addActivity = (activity: ActivityData) => {
    flattened.push(activity);
    if (activity.children && activity.children.length > 0) {
      activity.children.forEach(addActivity);
    }
  };

  activities.forEach(addActivity);
  return flattened;
};