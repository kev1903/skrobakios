import { useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface DigitalObjectsTab {
  id: string;
  name: string;
}

interface DigitalObjectsTabsProps {
  children: (activeTabId: string) => React.ReactNode;
}

export const DigitalObjectsTabs = ({ children }: DigitalObjectsTabsProps) => {
  const [tabs, setTabs] = useState<DigitalObjectsTab[]>([
    { id: "breakdown-cost", name: "BREAKDOWN COST" },
    { id: "invoice-tracker", name: "INVOICE TRACKER" },
    { id: "variation", name: "VARIATION" }
  ]);
  const [activeTab, setActiveTab] = useState("breakdown-cost");
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const addNewTab = () => {
    const newId = `table-${Date.now()}`;
    const newTab = { id: newId, name: `Table ${tabs.length + 1}` };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
  };

  const removeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Don't allow removing the last tab
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
  };

  const startEditingTab = (tabId: string, currentName: string) => {
    setEditingTabId(tabId);
    setEditingName(currentName);
  };

  const saveTabName = () => {
    if (editingTabId && editingName.trim()) {
      setTabs(tabs.map(tab => 
        tab.id === editingTabId 
          ? { ...tab, name: editingName.trim() }
          : tab
      ));
    }
    setEditingTabId(null);
    setEditingName("");
  };

  const cancelEditingTab = () => {
    setEditingTabId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTabName();
    } else if (e.key === 'Escape') {
      cancelEditingTab();
    }
  };

  return (
    <div className="w-full">
      {/* Airtable-style tab navigation */}
      <div className="border-b border-white/10 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Main Tabs */}
            <div className="flex items-center bg-slate-800/50 rounded-lg p-1 mr-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-2 text-xs font-semibold tracking-wide rounded-md transition-all duration-200
                    ${activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {editingTabId === tab.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveTabName}
                      className="h-6 w-32 bg-white/10 border-white/20 text-white text-xs"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div 
                      className="flex items-center gap-2"
                      onDoubleClick={() => startEditingTab(tab.id, tab.name)}
                    >
                      <span>{tab.name}</span>
                      {tabs.length > 1 && activeTab === tab.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTab(tab.id);
                          }}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </button>
              ))}
              
              {/* Add new tab button */}
              <button
                onClick={addNewTab}
                className="px-3 py-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* View options dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
                >
                  Grid view <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-white/20">
                <DropdownMenuItem className="text-white hover:bg-white/10">
                  Grid view
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/10">
                  List view
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">3 hidden fields</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
            >
              Filter
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
            >
              Group
            </Button>
          </div>
        </div>
      </div>

      {/* Tab content */}
      {tabs.map((tab) => (
        <div key={tab.id} className={activeTab === tab.id ? 'block' : 'hidden'}>
          {children(tab.id)}
        </div>
      ))}
    </div>
  );
};