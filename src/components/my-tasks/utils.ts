export const getTaskPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "medium":
      return "bg-warning/10 text-warning border-warning/20";
    case "low":
      return "bg-success/10 text-success border-success/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export const getTaskStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-success/10 text-success border-success/20";
    case "in progress":
      return "bg-primary/10 text-primary border-primary/20";
    case "pending":
      return "bg-warning/10 text-warning border-warning/20";
    case "not started":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};