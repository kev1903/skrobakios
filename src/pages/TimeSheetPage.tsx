import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const TimeSheetPage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/tasks" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm">Back to Tasks</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TimeSheet</h1>
              <p className="text-muted-foreground">Time tracking has been removed</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">Time Tracking Removed</h2>
            <p className="text-muted-foreground">
              The time tracking feature has been removed from the application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSheetPage;