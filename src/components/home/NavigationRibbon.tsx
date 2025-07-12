import React from 'react';
import { Briefcase, Calendar, DollarSign, TrendingUp, Map, HelpCircle, Shield } from 'lucide-react';
import { CompanySwitcher } from '@/components/CompanySwitcher';

interface NavigationRibbonProps {
  isOpen: boolean;
  onSidePageSelect: (page: string) => void;
  onNavigate: (page: string) => void;
  onClose: () => void;
}
export const NavigationRibbon = ({
  isOpen,
  onSidePageSelect,
  onNavigate,
  onClose
}: NavigationRibbonProps) => {
  if (!isOpen) return null;
  return <div className="fixed left-0 top-0 w-48 h-full bg-white/10 backdrop-blur-md border-r border-white/20 shadow-2xl z-40 transition-all duration-300">
      <div className="flex flex-col h-full pt-20">
        {/* Company Swapper */}
        <div className="px-3 pb-4 border-b border-white/20">
          <CompanySwitcher onNavigate={onNavigate} />
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 flex flex-col py-4 space-y-1 overflow-y-auto px-3">
          <button onClick={() => {
          onNavigate('projects');
          onClose();
        }} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-medium">Projects</span>
          </button>
          <button onClick={() => {
          onNavigate('finance');
          onClose();
        }} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Finance</span>
          </button>
          <button onClick={() => {
          onNavigate('sales');
          onClose();
        }} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Sales</span>
          </button>
          <button onClick={() => {
          onNavigate('platform');
          onClose();
        }} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Platform</span>
          </button>
          
        </div>

        {/* Support Section */}
        <div className="border-t border-white/20 px-3 py-4 space-y-1">
          <div className="text-xs font-medium text-white uppercase tracking-wider px-3 py-2">
            Support
          </div>
          <button onClick={() => {
          onNavigate('support');
          onClose();
        }} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Help Center</span>
          </button>
        </div>
      </div>
    </div>;
};