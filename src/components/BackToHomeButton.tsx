import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export const BackToHomeButton: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/?page=home');
  };

  return (
    <Button
      onClick={handleBackToHome}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Home className="h-4 w-4" />
      Back to Home
    </Button>
  );
};