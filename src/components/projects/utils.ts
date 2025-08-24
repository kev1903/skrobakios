export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500/20 text-green-700 border-green-500/30";
    case "running":
      return "bg-blue-500/20 text-blue-700 border-blue-500/30";
    case "pending":
      return "bg-orange-500/20 text-orange-700 border-orange-500/30";
    case "upcoming":
      return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
    case "cancelled":
      return "bg-gray-500/20 text-gray-700 border-gray-500/30";
    default:
      return "bg-gray-500/20 text-gray-700 border-gray-500/30";
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "running":
      return "In Progress";
    case "pending":
      return "On Hold";
    case "upcoming":
      return "Upcoming";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};