import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Bot, LogIn, User } from 'lucide-react';

interface AiChatAuthProps {
  onNavigateToAuth: () => void;
}

export const AiChatAuth = ({ onNavigateToAuth }: AiChatAuthProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-sm border-dashed border-2 border-muted-foreground/30">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center items-center space-x-2 text-muted-foreground mb-4">
            <Bot className="h-8 w-8" />
            <User className="h-6 w-6" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Welcome to Grok AI</h3>
            <p className="text-sm text-muted-foreground">
              Sign in to chat with your AI construction management assistant
            </p>
          </div>
          
          <Button 
            onClick={onNavigateToAuth}
            className="w-full"
            size="sm"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In to Chat
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Get help with projects, tasks, scheduling, and more
          </p>
        </CardContent>
      </Card>
    </div>
  );
};