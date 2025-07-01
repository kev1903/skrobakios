
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Contacted': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Qualified': return 'bg-green-100 text-green-700 border-green-200';
    case 'Quoted': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Won': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Lost': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'text-red-600';
    case 'Medium': return 'text-yellow-600';
    case 'Low': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

export const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'High': return 'fill-current';
    case 'Medium': return '';
    case 'Low': return '';
    default: return '';
  }
};
