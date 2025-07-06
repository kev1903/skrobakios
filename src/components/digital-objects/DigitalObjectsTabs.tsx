import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface DigitalObjectsTab {
  id: string;
  name: string;
}

interface DigitalObjectsTabsProps {
  children: (activeTabId: string) => React.ReactNode;
}

export const DigitalObjectsTabs = ({ children }: DigitalObjectsTabsProps) => {
  const [tabs, setTabs] = useState<DigitalObjectsTab[]>([
    { id: "table-1", name: "Digital Objects" }
  ]);
  const [activeTab, setActiveTab] = useState("table-1");
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between mb-6">
        <TabsList className="bg-white/10 border-white/20 h-10">
          {tabs.map((tab) => (
            <div key={tab.id} className="flex items-center group">
              <TabsTrigger 
                value={tab.id} 
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10 px-3 py-2 flex items-center gap-2"
              >
                {editingTabId === tab.id ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={saveTabName}
                    className="h-6 w-24 bg-white/10 border-white/20 text-white text-xs"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="cursor-pointer"
                    onDoubleClick={() => startEditingTab(tab.id, tab.name)}
                  >
                    {tab.name}
                  </span>
                )}
                {tabs.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(tab.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </TabsTrigger>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={addNewTab}
            className="text-white hover:bg-white/20 h-8 w-8 p-0 ml-2"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </TabsList>
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0">
          {children(tab.id)}
        </TabsContent>
      ))}
    </Tabs>
  );
};