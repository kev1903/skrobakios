
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

const FloatingVoiceButton = () => {
  return (
    <Button
      className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-primary hover:opacity-90 text-white shadow-lg z-50"
      size="icon"
    >
      <Mic className="w-5 h-5" />
    </Button>
  );
};

export default FloatingVoiceButton;
