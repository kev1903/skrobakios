import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus } from "lucide-react";

interface MyTasksEmptyStateProps {
  onNavigate: (page: string) => void;
}

export const MyTasksEmptyState = ({ onNavigate }: MyTasksEmptyStateProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <CheckSquare className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No Tasks Assigned
      </h3>
      
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        You don't have any tasks assigned to you yet. Create a new project or ask a team member to assign you some tasks.
      </p>
      
      <div className="flex justify-center space-x-4">
        <Button 
          onClick={() => onNavigate("projects")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          View Projects
        </Button>
        <Button 
          variant="outline"
          onClick={() => onNavigate("home")}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};