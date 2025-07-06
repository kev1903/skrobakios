import { useState } from "react";
import { Plus, ChevronDown, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DigitalObjectsTab {
  id: string;
  name: string;
}

interface DigitalObjectsTabsProps {
  children: (activeTabId: string) => React.ReactNode;
  onClearTableData?: (tabId: string) => void;
}

export const DigitalObjectsTabs = ({ children, onClearTableData }: DigitalObjectsTabsProps) => {
  const [tabs, setTabs] = useState<DigitalObjectsTab[]>([
    { id: "breakdown-cost", name: "BREAKDOWN COST" },
    { id: "invoice-tracker", name: "INVOICE TRACKER" },
    { id: "variation", name: "VARIATION" }
  ]);
  const [activeTab, setActiveTab] = useState("breakdown-cost");
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteConfirmTab, setDeleteConfirmTab] = useState<string | null>(null);
  const [clearConfirmTab, setClearConfirmTab] = useState<string | null>(null);

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
    setDeleteConfirmTab(null);
  };

  const clearTableData = (tabId: string) => {
    onClearTableData?.(tabId);
    setClearConfirmTab(null);
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
                <div key={tab.id} className="flex items-center">
                  <button
                    onClick={() => setActiveTab(tab.id)}
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
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveTabName}
                        className="h-6 w-32 bg-white/10 border-white/20 text-white text-xs"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span 
                        onDoubleClick={() => startEditingTab(tab.id, tab.name)}
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
                        onClick={() => setClearConfirmTab(tab.id)}
                      >
                        Clear table data
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-white hover:bg-white/10 cursor-pointer"
                        onClick={() => startEditingTab(tab.id, tab.name)}
                      >
                        Rename table
                      </DropdownMenuItem>
                      {tabs.length > 1 && (
                        <>
                          <DropdownMenuSeparator className="bg-white/20" />
                          <DropdownMenuItem 
                            className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                            onClick={() => setDeleteConfirmTab(tab.id)}
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
                onClick={addNewTab}
                className="px-3 py-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors ml-2"
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmTab} onOpenChange={() => setDeleteConfirmTab(null)}>
        <AlertDialogContent className="bg-slate-800 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Table</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Are you sure you want to delete this table? This action cannot be undone and all data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setDeleteConfirmTab(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteConfirmTab && removeTab(deleteConfirmTab)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Data Confirmation Dialog */}
      <AlertDialog open={!!clearConfirmTab} onOpenChange={() => setClearConfirmTab(null)}>
        <AlertDialogContent className="bg-slate-800 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Clear Table Data</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Are you sure you want to clear all data from this table? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setClearConfirmTab(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => clearConfirmTab && clearTableData(clearConfirmTab)}
            >
              Clear Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};