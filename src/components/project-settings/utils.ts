export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-500/20 text-green-300 border-green-500/30";
    case "in_progress": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "pending": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "on_hold": return "bg-red-500/20 text-red-300 border-red-500/30";
    default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case "completed": return "Completed";
    case "in_progress": return "In Progress";
    case "pending": return "Pending";
    case "on_hold": return "On Hold";
    default: return "Active";
  }
};

export const validateSharePointLink = (url: string) => {
  return url.includes('sharepoint.com') || url.includes('onedrive.com') || url === '';
};