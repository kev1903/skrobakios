import { useState } from "react";
import { DigitalObjectsTab, TabState } from "./types";

export const useTabState = () => {
  const [tabs, setTabs] = useState<DigitalObjectsTab[]>([
    { id: "breakdown-cost", name: "BREAKDOWN COST" },
    { id: "invoice-tracker", name: "INVOICE TRACKER" },
    { id: "variation", name: "VARIATION" }
  ]);
  const [activeTab, setActiveTab] = useState("breakdown-cost");
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteConfirmTab, setDeleteConfirmTab] = useState<string | null>(null);
  const [clearConfirmTab, setClearConfirmTab] = useState<string | null>(null);

  const handleTabSwitch = (newTabId: string) => {
    if (newTabId === activeTab || isAnimating) return;
    
    setIsAnimating(true);
    setPreviousTab(activeTab);
    
    // Start slide out animation, then switch after 150ms
    setTimeout(() => {
      setActiveTab(newTabId);
      // Reset animation state after slide in completes
      setTimeout(() => {
        setIsAnimating(false);
        setPreviousTab(null);
      }, 300);
    }, 150);
  };

  const addNewTab = () => {
    const newId = `table-${Date.now()}`;
    const newTab = { id: newId, name: `Table ${tabs.length + 1}` };
    setTabs([...tabs, newTab]);
    handleTabSwitch(newId);
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

  return {
    // State
    tabs,
    activeTab,
    previousTab,
    isAnimating,
    editingTabId,
    editingName,
    deleteConfirmTab,
    clearConfirmTab,
    
    // Setters
    setEditingName,
    setDeleteConfirmTab,
    setClearConfirmTab,
    
    // Actions
    handleTabSwitch,
    addNewTab,
    removeTab,
    startEditingTab,
    saveTabName,
    cancelEditingTab
  };
};