import React from 'react';

export const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto shadow-lg"></div>
        <div className="text-white text-xl font-semibold tracking-wide">Loading 3D Environment...</div>
        <div className="text-slate-300 text-sm">Initializing Mapbox Globe</div>
      </div>
    </div>
  );
};