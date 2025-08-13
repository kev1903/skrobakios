import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const MyTasksLoadingState = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-48" />
        </div>

        {/* Content Skeleton */}
        <div className="glass-card p-8">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-6">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};