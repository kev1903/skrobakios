import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus } from "lucide-react";

interface MyTasksEmptyStateProps {
  onNavigate: (page: string) => void;
}

export const MyTasksEmptyState = ({ onNavigate }: MyTasksEmptyStateProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center max-w-2xl mx-auto shadow-sm">
      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <CheckSquare className="w-10 h-10 text-gray-500" />
        </div>
      </div>
      
      <h3 className="text-2xl font-semibold text-gray-900 mb-4 font-playfair">
        No Tasks Assigned
      </h3>
      
      <p className="text-lg text-gray-600 mb-12 max-w-lg mx-auto">
        You don't have any tasks assigned to you yet. Create a new project or ask a team member to assign you some tasks.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          onClick={() => onNavigate("projects")}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          View Projects
        </Button>
        <Button 
          variant="outline"
          onClick={() => onNavigate("home")}
          className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};