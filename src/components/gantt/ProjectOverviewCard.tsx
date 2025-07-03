import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/hooks/useProjects';

interface ProjectOverviewCardProps {
  project: Project;
}

export const ProjectOverviewCard = ({ project }: ProjectOverviewCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Project Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="text-lg font-semibold">{project.start_date}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">End Date</p>
            <p className="text-lg font-semibold">{project.deadline}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Tasks</p>
            <p className="text-lg font-semibold">18</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Completion</p>
            <p className="text-lg font-semibold">35%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};