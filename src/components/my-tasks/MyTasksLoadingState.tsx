import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const MyTasksLoadingState = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-12 w-64 mb-4 bg-gray-200" />
          <Skeleton className="h-6 w-48 bg-gray-200" />
        </div>

        {/* Content Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-6">
                <Skeleton className="h-5 w-5 bg-gray-200" />
                <Skeleton className="h-7 w-64 bg-gray-200" />
                <Skeleton className="h-7 w-32 bg-gray-200" />
                <Skeleton className="h-7 w-24 bg-gray-200" />
                <Skeleton className="h-7 w-32 bg-gray-200" />
                <Skeleton className="h-7 w-24 bg-gray-200" />
                <Skeleton className="h-7 w-20 bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};