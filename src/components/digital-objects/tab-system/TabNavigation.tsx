import { Plus, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { DigitalObjectsTab } from "./types";

interface TabNavigationProps {
  tabs: DigitalObjectsTab[];
  activeTab: string;
  editingTabId: string | null;
  editingName: string;
  onTabSwitch: (tabId: string) => void;
  onAddNewTab: () => void;
  onStartEditingTab: (tabId: string, currentName: string) => void;
  onSaveTabName: () => void;
  onCancelEditingTab: () => void;
  onEditingNameChange: (name: string) => void;
  onDeleteConfirm: (tabId: string) => void;
  onClearConfirm: (tabId: string) => void;
}

export const TabNavigation = ({
  tabs,
  activeTab,
  editingTabId,
  editingName,
  onTabSwitch,
  onAddNewTab,
  onStartEditingTab,
  onSaveTabName,
  onCancelEditingTab,
  onEditingNameChange,
  onDeleteConfirm,
  onClearConfirm
}: TabNavigationProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveTabName();
    } else if (e.key === 'Escape') {
      onCancelEditingTab();
    }
  };

  return (
    <div className="flex items-center bg-slate-800/50 rounded-lg p-1 mr-4">
      {tabs.map((tab) => (
        <div key={tab.id} className="flex items-center">
          <button
            onClick={() => onTabSwitch(tab.id)}
            className={`
              px-4 py-2 text-xs font-semibold tracking-wide rounded-l-md transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-300 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {editingTabId === tab.id ? (
              <Input
                value={editingName}
                onChange={(e) => onEditingNameChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={onSaveTabName}
                className="h-6 w-32 bg-white/10 border-white/20 text-white text-xs"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span 
                onDoubleClick={() => onStartEditingTab(tab.id, tab.name)}
              >
                {tab.name}
              </span>
            )}
          </button>
          
          {/* Tab dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`
                  px-2 py-2 text-xs transition-all duration-200 rounded-r-md border-l border-white/20
                  ${activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }
                `}
                onClick={(e) => e.stopPropagation()}
              >
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="bg-slate-800 border-white/20 z-50"
              align="start"
            >
              <DropdownMenuItem 
                className="text-white hover:bg-white/10 cursor-pointer"
                onClick={() => onClearConfirm(tab.id)}
              >
                Clear table data
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-white hover:bg-white/10 cursor-pointer"
                onClick={() => onStartEditingTab(tab.id, tab.name)}
              >
                Rename table
              </DropdownMenuItem>
              {tabs.length > 1 && (
                <>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem 
                    className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                    onClick={() => onDeleteConfirm(tab.id)}
                  >
                    Delete table
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
      
      {/* Add new tab button */}
      <button
        onClick={onAddNewTab}
        className="px-3 py-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors ml-2"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};