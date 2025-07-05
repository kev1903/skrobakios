export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "in_progress":
      return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    case "planning":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "planning":
      return "Planning";
    default:
      return "Active";
  }
};