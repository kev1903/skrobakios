
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserEditHeaderProps {
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
}

export const UserEditHeader = ({ onCancel, onSave, saving }: UserEditHeaderProps) => {
  return (
    <div className="relative backdrop-blur-xl bg-white/60 border-b border-white/20 shadow-sm">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                Time Management Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">Track, analyze, and optimize how you spend your time</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={saving}
              className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-white/80 text-slate-600 hover:text-slate-800 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={onSave}
              disabled={saving}
              className="backdrop-blur-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
