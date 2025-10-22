import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MyTasksPage } from '@/components/MyTasksPage';

export const MyTasksPageWrapper = () => {
  const navigate = useNavigate();
  
  const handleNavigate = (page: string) => {
    if (page === 'tasks') {
      navigate('/tasks');
    } else if (page === 'home') {
      navigate('/');
    } else {
      navigate(`/?page=${page}`);
    }
  };

  return <MyTasksPage onNavigate={handleNavigate} />;
};
