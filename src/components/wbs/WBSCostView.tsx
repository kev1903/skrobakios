import React, { useState, useRef, useCallback, useEffect } from 'react';
import { WBSLeftPanel } from './WBSLeftPanel';
import { WBSCostRightPanel } from './WBSCostRightPanel';
import { WBSToolbar } from './WBSToolbar';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { DropResult } from 'react-beautiful-dnd';
import { WBSItem } from '@/types/wbs';
import { renumberAllWBSItems } from '@/utils/wbsUtils';


// Extended WBS Item interface that includes legacy properties
interface ExtendedWBSItem extends Omit<WBSItem, 'start_date' | 'end_date'> {
  name: string;
  wbsNumber: string;
  assignedTo?: string;
  isExpanded?: boolean;
  hasChildren?: boolean;
  start_date?: string | Date | null;
  end_date?: string | Date | null;
  duration?: number;
}

interface WBSCostViewProps {
  items: ExtendedWBSItem[];
  onToggleExpanded: (itemId: string) => void;
  onDragEnd: (result: DropResult) => void;
  onItemUpdate: (itemId: string, updates: any) => void;
  onAddChild?: (parentId: string) => void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
  onAddRow?: () => void;
  onReloadItems?: () => Promise<void>;
  dragIndicator: any;
  EditableCell: any;
  StatusSelect: any;
  generateWBSNumber: (phaseIndex: number, componentIndex?: number, elementIndex?: number) => string;
}

export const WBSCostView = ({
  items,
  onToggleExpanded,
  onDragEnd,
  onItemUpdate,
  onAddChild,
  onContextMenuAction,
  onOpenNotesDialog,
  onAddRow,
  onReloadItems,
  dragIndicator,
  EditableCell,
  StatusSelect,
  generateWBSNumber
}: WBSCostViewProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentFormatting, setCurrentFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontSize: "12"
  });
  const costHeaderScrollRef = useRef<HTMLDivElement>(null);
  const wbsContentScrollRef = useRef<HTMLDivElement>(null);
  const costContentScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  // Toolbar handlers
  const handleAddRow = useCallback(() => {
    if (onAddRow) {
      onAddRow();
    }
  }, [onAddRow]);

  const handleIndent = useCallback(async () => {
    if (selectedItems.length === 0) return;
    try {
      console.log('🔵 Starting progressive indent operation for items:', selectedItems);

      // Helper function to get all descendants of an item
      const getAllDescendants = (itemId: string): string[] => {
        const descendants: string[] = [];
        const children = items.filter(i => i.parent_id === itemId);
        children.forEach(child => {
          descendants.push(child.id);
          descendants.push(...getAllDescendants(child.id));
        });
        return descendants;
      };

      // Helper to find the appropriate parent for a given level
      const findParentForLevel = (currentIndex: number, targetLevel: number): string | null => {
        // Look backwards to find an item at level (targetLevel - 1)
        for (let i = currentIndex - 1; i >= 0; i--) {
          const potentialParent = items[i];
          if (potentialParent.level === targetLevel - 1) {
            return potentialParent.id;
          }
        }
        return null;
      };

      // Process each selected item and its descendants
      for (const itemId of selectedItems) {
        const item = items.find(i => i.id === itemId);
        if (!item) continue;

        const currentIndex = items.findIndex(i => i.id === itemId);
        if (currentIndex < 0) continue;

        // Check maximum level restriction (allow up to level 4, since we start from 0)
        if (item.level >= 4) {
          console.log(`🚫 Cannot indent ${item.title || item.name || item.id} - maximum level (4) reached`);
          continue;
        }

        const newLevel = item.level + 1;
        const newParentId = findParentForLevel(currentIndex, newLevel);

        console.log(`🔄 Progressive indent: ${item.title || item.name || item.id} from level ${item.level} to ${newLevel}, new parent: ${newParentId}`);

        // Indent the item by one level
        await onItemUpdate(itemId, {
          parent_id: newParentId,
          level: newLevel
        });

        // Get all descendants and indent them too (cascade)
        const descendants = getAllDescendants(itemId);
        console.log(`📂 Found ${descendants.length} descendants to cascade indent:`, descendants);
        for (const descendantId of descendants) {
          const descendant = items.find(i => i.id === descendantId);
          if (descendant) {
            console.log(`🔄 Cascading indent to ${descendant.title || descendant.name || descendant.id} (level ${descendant.level} → ${descendant.level + 1})`);
            await onItemUpdate(descendantId, {
              level: descendant.level + 1
            });
          }
        }
      }

      // Auto-renumber WBS after indent operations
      const updates = renumberAllWBSItems(items as WBSItem[]);
      for (const update of updates) {
        await onItemUpdate(update.item.id, {
          wbs_id: update.newWbsId
        });
      }

      // Clear selection after indent
      setSelectedItems([]);
      
      // Reload items from database to rebuild hierarchy
      if (onReloadItems) {
        await onReloadItems();
      }
      
      console.log('✅ Cascade indent operation completed with WBS renumbering');
    } catch (error) {
      console.error('❌ Error in cascade indent operation:', error);
    }
  }, [selectedItems, items, onItemUpdate, onReloadItems]);

  const handleOutdent = useCallback(async () => {
    if (selectedItems.length === 0) return;
    try {
      console.log('🟡 Starting cascade outdent operation for items:', selectedItems);

      // Helper function to get all descendants of an item
      const getAllDescendants = (itemId: string): string[] => {
        const descendants: string[] = [];
        const children = items.filter(i => i.parent_id === itemId);
        children.forEach(child => {
          descendants.push(child.id);
          descendants.push(...getAllDescendants(child.id));
        });
        return descendants;
      };

      // Process each selected item and its descendants
      for (const itemId of selectedItems) {
        const item = items.find(i => i.id === itemId);
        if (!item || item.level <= 0) continue; // Can't outdent beyond level 0

        // Find the current parent to get its parent
        const currentParent = items.find(i => i.id === item.parent_id);
        console.log(`🔄 Outdenting parent item ${item.title || item.name || item.id} from level ${item.level} to ${item.level - 1}`);

        // Outdent the parent item
        await onItemUpdate(itemId, {
          parent_id: currentParent?.parent_id || null,
          level: Math.max(0, item.level - 1)
        });

        // Get all descendants and outdent them too
        const descendants = getAllDescendants(itemId);
        console.log(`📂 Found ${descendants.length} descendants to cascade outdent:`, descendants);
        for (const descendantId of descendants) {
          const descendant = items.find(i => i.id === descendantId);
          if (descendant) {
            console.log(`🔄 Cascading outdent to ${descendant.title || descendant.name || descendant.id} (level ${descendant.level} → ${Math.max(0, descendant.level - 1)})`);
            await onItemUpdate(descendantId, {
              level: Math.max(0, descendant.level - 1)
            });
          }
        }
      }

      // Auto-renumber WBS after outdent operations
      const updates = renumberAllWBSItems(items as WBSItem[]);
      for (const update of updates) {
        await onItemUpdate(update.item.id, {
          wbs_id: update.newWbsId
        });
      }

      // Clear selection after outdent
      setSelectedItems([]);
      
      // Reload items from database to rebuild hierarchy
      if (onReloadItems) {
        await onReloadItems();
      }
      
      console.log('✅ Cascade outdent operation completed with WBS renumbering');
    } catch (error) {
      console.error('❌ Error in cascade outdent operation:', error);
    }
  }, [selectedItems, items, onItemUpdate, onReloadItems]);

  const handleBold = useCallback(() => {
    setCurrentFormatting(prev => ({ ...prev, bold: !prev.bold }));
    selectedItems.forEach(itemId => {
      console.log('Toggle bold for item:', itemId);
    });
  }, [selectedItems]);

  const handleItalic = useCallback(() => {
    setCurrentFormatting(prev => ({ ...prev, italic: !prev.italic }));
    selectedItems.forEach(itemId => {
      console.log('Toggle italic for item:', itemId);
    });
  }, [selectedItems]);

  const handleUnderline = useCallback(() => {
    setCurrentFormatting(prev => ({ ...prev, underline: !prev.underline }));
    selectedItems.forEach(itemId => {
      console.log('Toggle underline for item:', itemId);
    });
  }, [selectedItems]);

  const handleFontSizeChange = useCallback((size: string) => {
    setCurrentFormatting(prev => ({ ...prev, fontSize: size }));
    selectedItems.forEach(itemId => {
      console.log('Change font size for item:', itemId, 'to:', size);
    });
  }, [selectedItems]);

  const handleRowClick = useCallback((itemId: string, ctrlKey: boolean = false) => {
    if (ctrlKey) {
      setSelectedItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setSelectedItems([itemId]);
    }
  }, []);

  // Keyboard navigation for row selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if we have items and aren't in an input field
      if (items.length === 0 || (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      // Helper to check if item is visible (all ancestors are expanded)
      const isItemVisible = (itemId: string): boolean => {
        const item = items.find(i => i.id === itemId);
        if (!item) return false;
        
        // Check all ancestors are expanded
        let currentParentId = item.parent_id;
        while (currentParentId) {
          const parent = items.find(i => i.id === currentParentId);
          if (!parent) break;
          if (parent.is_expanded === false) return false;
          currentParentId = parent.parent_id;
        }
        return true;
      };

      // Get visible items
      const visibleItems = items.filter(item => isItemVisible(item.id));

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        
        const currentSelectedId = selectedItems.length > 0 ? selectedItems[selectedItems.length - 1] : null;
        const currentIndex = currentSelectedId ? visibleItems.findIndex(item => item.id === currentSelectedId) : -1;

        let newIndex = -1;
        
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          // Move down or Enter (next row)
          if (currentIndex === -1) {
            newIndex = 0; // Select first item if nothing selected
          } else if (currentIndex < visibleItems.length - 1) {
            newIndex = currentIndex + 1;
          }
        } else if (e.key === 'ArrowUp') {
          // Move up
          if (currentIndex === -1) {
            newIndex = 0; // Select first item if nothing selected
          } else if (currentIndex > 0) {
            newIndex = currentIndex - 1;
          }
        }

        if (newIndex >= 0 && newIndex < visibleItems.length) {
          const newSelectedItem = visibleItems[newIndex];
          setSelectedItems([newSelectedItem.id]);

          // Scroll selected item into view
          setTimeout(() => {
            const rowElement = document.querySelector(`[data-row-id="${newSelectedItem.id}"]`);
            if (rowElement) {
              rowElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedItems]);

  // Synchronize scrolling between left and right panels (matching Scope tab pattern)
  const handleWBSContentScroll = useCallback(() => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    
    if (wbsContentScrollRef.current && costContentScrollRef.current) {
      costContentScrollRef.current.scrollTop = wbsContentScrollRef.current.scrollTop;
    }
    
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, []);

  const handleCostContentScroll = useCallback(() => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    
    if (wbsContentScrollRef.current && costContentScrollRef.current) {
      wbsContentScrollRef.current.scrollTop = costContentScrollRef.current.scrollTop;
    }
    
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, []);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* WBS Toolbar */}
      <WBSToolbar
        onAddRow={handleAddRow}
        onIndent={handleIndent}
        onOutdent={handleOutdent}
        onBold={handleBold}
        onItalic={handleItalic}
        onUnderline={handleUnderline}
        onFontSizeChange={handleFontSizeChange}
        selectedItems={selectedItems}
        canIndent={selectedItems.length > 0 && selectedItems.some(id => {
          const item = items.find(i => i.id === id);
          return item && item.level < 4; // Can only indent if not at max level (4)
        })}
        canOutdent={selectedItems.length > 0 && selectedItems.some(id => {
          const item = items.find(i => i.id === id);
          return item && item.level > 0; // Can only outdent if not at root level (0)
        })}
        currentFormatting={currentFormatting}
      />
      
      {/* Single ResizablePanelGroup controlling both header and content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Column (WBS Structure) */}
        <ResizablePanel defaultSize={25} minSize={15} maxSize={45}>
          <div className="h-full flex flex-col">
            {/* Left Header */}
            <div className="h-8 bg-slate-100/70 border-b border-slate-200 border-r border-gray-200 sticky top-0 z-40">
              <div className="px-2 py-1 text-xs font-medium text-slate-700 h-full">
                <div className="grid items-center h-full" style={{
                  gridTemplateColumns: '32px 70px 1fr 40px',
                }}>
                  <div></div>
                  <div className="px-3 font-semibold text-[10px] uppercase tracking-wider text-slate-600">WBS</div>
                  <div className="px-3 font-semibold text-[10px] uppercase tracking-wider text-slate-600">ACTIVITY</div>
                  <div></div>
                </div>
              </div>
            </div>
            
            {/* Left Content with synchronized scrolling */}
            <div 
              ref={wbsContentScrollRef}
              className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
              onScroll={handleWBSContentScroll}
            >
              <WBSLeftPanel
                items={items.map(item => ({
                  id: item.id,
                  name: item.title || item.name || '',
                  level: item.level || 0,
                  parent_id: item.parent_id,
                  wbs_id: item.wbs_id,
                  isExpanded: item.is_expanded !== false, // Normalized at service level
                  hasChildren: items.some(child => child.parent_id === item.id)
                }))}
                onToggleExpanded={onToggleExpanded}
                onDragEnd={onDragEnd}
                onItemEdit={onItemUpdate}
                onAddChild={onAddChild}
                onContextMenuAction={(action, itemId) => {
                  const item = items.find(i => i.id === itemId);
                  const type = item?.level === 0 ? 'phase' : item?.level === 1 ? 'component' : item?.level === 2 ? 'element' : 'task';
                  onContextMenuAction(action, itemId, type);
                }}
                dragIndicator={dragIndicator}
                EditableCell={EditableCell}
                generateWBSNumber={generateWBSNumber}
                hoveredId={hoveredId}
                onRowHover={setHoveredId}
                selectedItems={selectedItems}
                onRowClick={handleRowClick}
              />
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle />
        
        {/* Right Column (Cost Data) */}
        <ResizablePanel defaultSize={75} minSize={55} maxSize={85}>
          <div className="h-full flex flex-col">
            {/* Right Header */}
            <div className="h-8 bg-slate-100/70 border-b border-slate-200 sticky top-0 z-40">
              <div 
                ref={costHeaderScrollRef}
                className="px-2 py-1 text-xs font-medium text-slate-700 h-full overflow-x-auto overflow-y-hidden scrollbar-hide"
              >
                <div 
                  className="grid items-center h-full min-w-fit" 
                  style={{
                    gridTemplateColumns: '100px 100px 100px 100px 100px 100px 120px 100px 1fr',
                    width: '100%',
                    minWidth: '820px'
                  }}
                >
                  <div className="px-2 font-semibold text-center">BUDGET</div>
                  <div className="px-2 font-semibold text-center">VARIATIONS</div>
                  <div className="px-2 font-semibold text-center">NEW BUDGET</div>
                  <div className="px-2 font-semibold text-center">COMMITTED</div>
                  <div className="px-2 font-semibold text-center">PAID</div>
                  <div className="px-2 font-semibold text-center">REMAINING</div>
                  <div className="px-2 font-semibold text-center">FORECAST FINAL</div>
                  <div className="px-2 font-semibold text-center">VARIANCE</div>
                  <div className="px-2 font-semibold text-center">NOTES</div>
                </div>
              </div>
            </div>
            
            {/* Right Content with synchronized scrolling */}
            <div 
              ref={costContentScrollRef}
              className="flex-1 overflow-y-auto overflow-x-auto scrollbar-thin"
              onScroll={handleCostContentScroll}
            >
              <WBSCostRightPanel
                items={items as any}
                onItemUpdate={onItemUpdate}
                onContextMenuAction={onContextMenuAction}
                onOpenNotesDialog={onOpenNotesDialog}
                EditableCell={EditableCell}
                StatusSelect={StatusSelect}
                hoveredId={hoveredId}
                onRowHover={setHoveredId}
                selectedItems={selectedItems}
                onRowClick={handleRowClick}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};