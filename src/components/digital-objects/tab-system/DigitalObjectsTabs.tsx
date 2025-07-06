import { DigitalObjectsTabsProps } from "./types";
import { useTabState } from "./useTabState";
import { TabNavigation } from "./TabNavigation";
import { ViewControlsDropdown } from "./ViewControlsDropdown";
import { TabControls } from "./TabControls";
import { TabContent } from "./TabContent";
import { TabConfirmDialogs } from "./TabConfirmDialogs";

export const DigitalObjectsTabs = ({ children, onClearTableData }: DigitalObjectsTabsProps) => {
  const {
    tabs,
    activeTab,
    previousTab,
    isAnimating,
    editingTabId,
    editingName,
    deleteConfirmTab,
    clearConfirmTab,
    setEditingName,
    setDeleteConfirmTab,
    setClearConfirmTab,
    handleTabSwitch,
    addNewTab,
    removeTab,
    startEditingTab,
    saveTabName,
    cancelEditingTab
  } = useTabState();

  const clearTableData = (tabId: string) => {
    onClearTableData?.(tabId);
    setClearConfirmTab(null);
  };

  return (
    <div className="w-full">
      {/* Airtable-style tab navigation */}
      <div className="border-b border-white/10 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Main Tabs */}
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              editingTabId={editingTabId}
              editingName={editingName}
              onTabSwitch={handleTabSwitch}
              onAddNewTab={addNewTab}
              onStartEditingTab={startEditingTab}
              onSaveTabName={saveTabName}
              onCancelEditingTab={cancelEditingTab}
              onEditingNameChange={setEditingName}
              onDeleteConfirm={setDeleteConfirmTab}
              onClearConfirm={setClearConfirmTab}
            />

            {/* View options dropdown */}
            <ViewControlsDropdown />
          </div>

          {/* Right side controls */}
          <TabControls />
        </div>
      </div>

      {/* Tab content with sliding animation */}
      <TabContent
        tabs={tabs}
        activeTab={activeTab}
        previousTab={previousTab}
        isAnimating={isAnimating}
        children={children}
      />

      {/* Confirmation Dialogs */}
      <TabConfirmDialogs
        deleteConfirmTab={deleteConfirmTab}
        clearConfirmTab={clearConfirmTab}
        onDeleteCancel={() => setDeleteConfirmTab(null)}
        onDeleteConfirm={removeTab}
        onClearCancel={() => setClearConfirmTab(null)}
        onClearConfirm={clearTableData}
      />
    </div>
  );
};