export interface DigitalObjectsTab {
  id: string;
  name: string;
}

export interface DigitalObjectsTabsProps {
  children: (activeTabId: string) => React.ReactNode;
  onClearTableData?: (tabId: string) => void;
}

export interface TabState {
  tabs: DigitalObjectsTab[];
  activeTab: string;
  previousTab: string | null;
  isAnimating: boolean;
  editingTabId: string | null;
  editingName: string;
  deleteConfirmTab: string | null;
  clearConfirmTab: string | null;
}