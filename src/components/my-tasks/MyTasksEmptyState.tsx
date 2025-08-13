import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus } from "lucide-react";

interface MyTasksEmptyStateProps {
  onNavigate: (page: string) => void;
}

export const MyTasksEmptyState = ({ onNavigate }: MyTasksEmptyStateProps) => {
  return (
    <div className="glass-card p-16 text-center max-w-2xl mx-auto">
      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center">
          <CheckSquare className="w-10 h-10 text-muted-foreground" />
        </div>
      </div>
      
      <h3 className="heading-md text-foreground mb-4 font-playfair">
        No Tasks Assigned
      </h3>
      
      <p className="body-md text-muted-foreground mb-12 max-w-lg mx-auto">
        You don't have any tasks assigned to you yet. Create a new project or ask a team member to assign you some tasks.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          onClick={() => onNavigate("projects")}
          className="button-blue"
        >
          <Plus className="w-4 h-4 mr-2" />
          View Projects
        </Button>
        <Button 
          variant="outline"
          onClick={() => onNavigate("home")}
          className="button-ghost"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};