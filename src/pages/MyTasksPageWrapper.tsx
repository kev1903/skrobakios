import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MyTasksPage } from '@/components/MyTasksPage';

const MyTasksPageWrapper = () => {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    // Map page identifiers to routes
    switch (page) {
      case 'home':
      case 'dashboard':
        navigate('/');
        break;
      case 'my-tasks':
        navigate('/tasks');
        break;
      case 'task-create':
        navigate('/tasks/new');
        break;
      case 'task-edit':
        // This will be handled by the task edit component with task ID
        break;
      case 'milestones':
        // Navigate to milestones if route exists
        navigate('/');
        break;
      default:
        navigate('/');
    }
  };

  return <MyTasksPage onNavigate={handleNavigate} />;
};

export default MyTasksPageWrapper;
