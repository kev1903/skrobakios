import React, { useState, useRef, useCallback, useEffect } from 'react';
import { WBSLeftPanel } from './WBSLeftPanel';
import { WBSRightPanel } from './WBSRightPanel';
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
}
interface WBSSplitViewProps {
  items: ExtendedWBSItem[];
  onToggleExpanded: (itemId: string) => void;
  onDragEnd: (result: DropResult) => void;
  onDragUpdate?: (update: any) => void;
  onItemUpdate: (itemId: string, updates: any) => void;
  onAddChild?: (parentId: string) => void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
  onAddRow?: () => void;
  onReloadItems?: () => Promise<void>;
  dragIndicator: any;
  EditableCell: any;
  StatusSelect: any;
  ProgressInput: any;
  ProgressDisplay: any;
  getProgressColor: (progress: number) => string;
  generateWBSNumber: (phaseIndex: number, componentIndex?: number, elementIndex?: number) => string;
  projectId?: string;
}
export const WBSSplitView = ({
  items,
  onToggleExpanded,
  onDragEnd,
  onDragUpdate,
  onItemUpdate,
  onAddChild,
  onContextMenuAction,
  onOpenNotesDialog,
  onAddRow,
  onReloadItems,
  dragIndicator,
  EditableCell,
  StatusSelect,
  ProgressInput,
  ProgressDisplay,
  getProgressColor,
  generateWBSNumber,
  projectId
}: WBSSplitViewProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentFormatting, setCurrentFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontSize: "12"
  });
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  // Toolbar handlers
  const handleAddRow = useCallback(() => {
    if (onAddRow) {
      onAddRow();
      // Clear selection after adding new row
      setSelectedItems([]);
    }
  }, [onAddRow]);

  // Helper functions to check indent/outdent availability
  const canIndent = useCallback(() => {
    if (selectedItems.length === 0) return false;
    
    // Check if any selected item can be indented
    return selectedItems.some(itemId => {
      const itemIndex = items.findIndex(i => i.id === itemId);
      if (itemIndex <= 0) return false;
      
      const item = items[itemIndex];
      const prevItem = items[itemIndex - 1];
      
      // Can indent if previous item exists and is same or higher level
      return prevItem && prevItem.level >= item.level;
    });
  }, [selectedItems, items]);

  const canOutdent = useCallback(() => {
    if (selectedItems.length === 0) return false;
    
    // Check if any selected item can be outdented (level > 0)
    return selectedItems.some(itemId => {
      const item = items.find(i => i.id === itemId);
      return item && item.level > 0;
    });
  }, [selectedItems, items]);
  const handleIndent = useCallback(async () => {
    if (selectedItems.length === 0) return;
    try {
      console.log('🔵 Starting optimized indent operation for items:', selectedItems);
      console.log('📋 Current items state:', items.map(i => ({ id: i.id, name: i.name || i.title, level: i.level, isExpanded: i.isExpanded, parent_id: i.parent_id })));

      // Collect all updates to batch them
      const batchUpdates: Array<{ id: string; updates: Partial<WBSItem> }> = [];

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
        for (let i = currentIndex - 1; i >= 0; i--) {
          const potentialParent = items[i];
          if (potentialParent.level === targetLevel - 1) {
            console.log(`🎯 Found parent for level ${targetLevel}: ${potentialParent.name || potentialParent.title}`);
            return potentialParent.id;
          }
        }
        return null;
      };

      // Collect all ancestors that need expansion - ALWAYS expand parent chain
      const parentsToExpand = new Set<string>();
      
      // Process each selected item to collect updates
      for (const itemId of selectedItems) {
        const item = items.find(i => i.id === itemId);
        if (!item) continue;

        const currentIndex = items.findIndex(i => i.id === itemId);
        if (currentIndex < 0) continue;

        if (item.level >= 4) {
          console.log(`🚫 Cannot indent ${item.title || item.id} - maximum level (4) reached`);
          continue;
        }

        const newLevel = item.level + 1;
        const newParentId = findParentForLevel(currentIndex, newLevel);

        console.log(`📍 Indenting ${item.name || item.title} from level ${item.level} to ${newLevel}, parent: ${newParentId}`);

        // ALWAYS collect all ancestors to ensure they're expanded
        if (newParentId) {
          let currentParentId: string | null | undefined = newParentId;
          while (currentParentId) {
            parentsToExpand.add(currentParentId);
            const parent = items.find(i => i.id === currentParentId);
            console.log(`📂 Will expand ancestor: ${parent?.name || parent?.title || currentParentId}`);
            currentParentId = parent?.parent_id;
          }
        }

        // Collect main item update
        batchUpdates.push({
          id: itemId,
          updates: { parent_id: newParentId, level: newLevel }
        });

        // Collect descendant updates
        const descendants = getAllDescendants(itemId);
        descendants.forEach(descendantId => {
          const descendant = items.find(i => i.id === descendantId);
          if (descendant) {
            batchUpdates.push({
              id: descendantId,
              updates: { level: descendant.level + 1 }
            });
          }
        });
      }

      // CRITICAL: Expand parents FIRST, before indenting
      console.log(`📂 Expanding ${parentsToExpand.size} parent items to ensure visibility:`, Array.from(parentsToExpand));
      if (parentsToExpand.size > 0) {
        const expandPromises = Array.from(parentsToExpand).map(async parentId => {
          console.log(`🔓 Expanding parent: ${parentId}`);
          await onItemUpdate(parentId, { is_expanded: true });
          console.log(`✅ Expanded parent: ${parentId}`);
        });
        await Promise.all(expandPromises);
        console.log('✅ All parents expanded');
        
        // Wait for database propagation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // CRITICAL: Reload items to get updated expansion states BEFORE indenting
        if (onReloadItems) {
          console.log('🔄 Reloading items after parent expansion to sync UI state');
          await onReloadItems();
          console.log('✅ Parent expansion reload completed, items refreshed from database');
        }
      }

      // Then execute indent updates in parallel
      console.log(`⚡ Executing ${batchUpdates.length} indent updates in parallel`);
      await Promise.all(
        batchUpdates.map(({ id, updates }) => {
          console.log(`  💾 Updating ${id}:`, updates);
          return onItemUpdate(id, updates);
        })
      );
      console.log('✅ All indent updates completed');

      // Clear selection
      setSelectedItems([]);
      
      // Final reload to rebuild hierarchy and renumber
      if (onReloadItems) {
        console.log('🔄 Final reload to rebuild hierarchy and renumber');
        await onReloadItems();
        console.log('✅ Final reload completed');
      }
      
      console.log('✅ Optimized indent completed with parent expansion');
    } catch (error) {
      console.error('❌ Error in indent operation:', error);
    }
  }, [selectedItems, items, onItemUpdate, onReloadItems]);
  const handleOutdent = useCallback(async () => {
    if (selectedItems.length === 0) return;
    try {
      console.log('🟡 Starting optimized outdent operation for items:', selectedItems);

      // Collect all updates to batch them
      const batchUpdates: Array<{ id: string; updates: Partial<WBSItem> }> = [];

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

      // Process each selected item to collect updates
      for (const itemId of selectedItems) {
        const item = items.find(i => i.id === itemId);
        if (!item || item.level <= 0) continue;

        const currentParent = items.find(i => i.id === item.parent_id);

        // Collect main item update
        batchUpdates.push({
          id: itemId,
          updates: {
            parent_id: currentParent?.parent_id || null,
            level: Math.max(0, item.level - 1)
          }
        });

        // Collect descendant updates
        const descendants = getAllDescendants(itemId);
        descendants.forEach(descendantId => {
          const descendant = items.find(i => i.id === descendantId);
          if (descendant) {
            batchUpdates.push({
              id: descendantId,
              updates: { level: Math.max(0, descendant.level - 1) }
            });
          }
        });
      }

      // Execute all updates in parallel
      console.log(`⚡ Executing ${batchUpdates.length} updates in parallel`);
      await Promise.all(
        batchUpdates.map(({ id, updates }) => onItemUpdate(id, updates))
      );

      // Clear selection
      setSelectedItems([]);
      
      // Single reload to rebuild hierarchy and renumber
      if (onReloadItems) {
        await onReloadItems();
      }
      
      console.log('✅ Optimized outdent completed');
    } catch (error) {
      console.error('❌ Error in outdent operation:', error);
    }
  }, [selectedItems, items, onItemUpdate, onReloadItems]);
  const handleBold = useCallback(async () => {
    if (selectedItems.length === 0) return;
    
    const newBoldState = !currentFormatting.bold;
    setCurrentFormatting(prev => ({
      ...prev,
      bold: newBoldState
    }));
    
    // Apply bold formatting to all selected items
    try {
      await Promise.all(
        selectedItems.map(itemId => {
          const item = items.find(i => i.id === itemId);
          if (!item) return Promise.resolve();
          
          const currentFormatting = item.text_formatting || {};
          return onItemUpdate(itemId, {
            text_formatting: {
              ...currentFormatting,
              bold: newBoldState
            }
          });
        })
      );
      console.log('✅ Bold formatting applied to', selectedItems.length, 'items');
      
      // Reload items to reflect the formatting changes
      if (onReloadItems) {
        await onReloadItems();
      }
    } catch (error) {
      console.error('❌ Error applying bold formatting:', error);
    }
  }, [selectedItems, currentFormatting.bold, items, onItemUpdate, onReloadItems]);
  const handleItalic = useCallback(async () => {
    if (selectedItems.length === 0) return;
    
    const newItalicState = !currentFormatting.italic;
    setCurrentFormatting(prev => ({
      ...prev,
      italic: newItalicState
    }));
    
    try {
      await Promise.all(
        selectedItems.map(itemId => {
          const item = items.find(i => i.id === itemId);
          if (!item) return Promise.resolve();
          
          const currentFormatting = item.text_formatting || {};
          return onItemUpdate(itemId, {
            text_formatting: {
              ...currentFormatting,
              italic: newItalicState
            }
          });
        })
      );
      console.log('✅ Italic formatting applied to', selectedItems.length, 'items');
      
      // Reload items to reflect the formatting changes
      if (onReloadItems) {
        await onReloadItems();
      }
    } catch (error) {
      console.error('❌ Error applying italic formatting:', error);
    }
  }, [selectedItems, currentFormatting.italic, items, onItemUpdate, onReloadItems]);
  const handleUnderline = useCallback(async () => {
    if (selectedItems.length === 0) return;
    
    const newUnderlineState = !currentFormatting.underline;
    setCurrentFormatting(prev => ({
      ...prev,
      underline: newUnderlineState
    }));
    
    try {
      await Promise.all(
        selectedItems.map(itemId => {
          const item = items.find(i => i.id === itemId);
          if (!item) return Promise.resolve();
          
          const currentFormatting = item.text_formatting || {};
          return onItemUpdate(itemId, {
            text_formatting: {
              ...currentFormatting,
              underline: newUnderlineState
            }
          });
        })
      );
      console.log('✅ Underline formatting applied to', selectedItems.length, 'items');
      
      // Reload items to reflect the formatting changes
      if (onReloadItems) {
        await onReloadItems();
      }
    } catch (error) {
      console.error('❌ Error applying underline formatting:', error);
    }
  }, [selectedItems, currentFormatting.underline, items, onItemUpdate, onReloadItems]);
  const handleFontSizeChange = useCallback(async (size: string) => {
    if (selectedItems.length === 0) return;
    
    setCurrentFormatting(prev => ({
      ...prev,
      fontSize: size
    }));
    
    try {
      await Promise.all(
        selectedItems.map(itemId => {
          const item = items.find(i => i.id === itemId);
          if (!item) return Promise.resolve();
          
          const currentFormatting = item.text_formatting || {};
          return onItemUpdate(itemId, {
            text_formatting: {
              ...currentFormatting,
              fontSize: size
            }
          });
        })
      );
      console.log('✅ Font size changed to', size, 'for', selectedItems.length, 'items');
      
      // Reload items to reflect the formatting changes
      if (onReloadItems) {
        await onReloadItems();
      }
    } catch (error) {
      console.error('❌ Error changing font size:', error);
    }
  }, [selectedItems, items, onItemUpdate, onReloadItems]);
  const handleRowClick = useCallback((itemId: string, ctrlKey: boolean = false) => {
    if (ctrlKey) {
      setSelectedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
    } else {
      setSelectedItems([itemId]);
    }
  }, []);

  // Update formatting state when selection changes
  useEffect(() => {
    if (selectedItems.length === 1) {
      const selectedItem = items.find(i => i.id === selectedItems[0]);
      if (selectedItem?.text_formatting) {
        setCurrentFormatting({
          bold: selectedItem.text_formatting.bold || false,
          italic: selectedItem.text_formatting.italic || false,
          underline: selectedItem.text_formatting.underline || false,
          fontSize: selectedItem.text_formatting.fontSize || "12"
        });
      } else {
        setCurrentFormatting({
          bold: false,
          italic: false,
          underline: false,
          fontSize: "12"
        });
      }
    } else if (selectedItems.length === 0) {
      setCurrentFormatting({
        bold: false,
        italic: false,
        underline: false,
        fontSize: "12"
      });
    }
  }, [selectedItems, items]);

  // Keyboard navigation and shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditingText = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      // Only handle if we have items
      if (items.length === 0) return;

      // Tab - Indent (only when not editing text)
      if (e.key === 'Tab' && !e.shiftKey && selectedItems.length > 0 && !isEditingText) {
        e.preventDefault();
        if (canIndent()) {
          handleIndent();
        }
        return;
      }
      
      // Shift+Tab - Outdent (only when not editing text)
      if (e.key === 'Tab' && e.shiftKey && selectedItems.length > 0 && !isEditingText) {
        e.preventDefault();
        if (canOutdent()) {
          handleOutdent();
        }
        return;
      }

      // Delete - Delete selected rows (only when not editing text)
      if (e.key === 'Delete' && selectedItems.length > 0 && !isEditingText) {
        e.preventDefault();
        const itemToDelete = items.find(i => i.id === selectedItems[0]);
        if (itemToDelete) {
          const itemType = itemToDelete.level === 0 ? 'phase' : 
                          itemToDelete.level === 1 ? 'component' : 
                          itemToDelete.level === 2 ? 'element' : 'task';
          onContextMenuAction('delete', selectedItems[0], itemType);
        }
        return;
      }

      // Arrow navigation and Enter (don't handle when editing text)
      if (isEditingText) return;

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

      // Enter - Insert row below selected item
      if (e.key === 'Enter' && selectedItems.length > 0) {
        e.preventDefault();
        const selectedItem = items.find(i => i.id === selectedItems[0]);
        if (selectedItem) {
          const itemType = selectedItem.level === 0 ? 'phase' : 
                          selectedItem.level === 1 ? 'component' : 
                          selectedItem.level === 2 ? 'element' : 'task';
          onContextMenuAction('insert-below', selectedItems[0], itemType);
        }
        return;
      }

      // Ctrl+Shift+Enter - Insert row above selected item
      if (e.key === 'Enter' && e.ctrlKey && e.shiftKey && selectedItems.length > 0) {
        e.preventDefault();
        const selectedItem = items.find(i => i.id === selectedItems[0]);
        if (selectedItem) {
          const itemType = selectedItem.level === 0 ? 'phase' : 
                          selectedItem.level === 1 ? 'component' : 
                          selectedItem.level === 2 ? 'element' : 'task';
          onContextMenuAction('insert-above', selectedItems[0], itemType);
        }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        
        const currentSelectedId = selectedItems.length > 0 ? selectedItems[selectedItems.length - 1] : null;
        const currentIndex = currentSelectedId ? visibleItems.findIndex(item => item.id === currentSelectedId) : -1;

        let newIndex = -1;
        
        if (e.key === 'ArrowDown') {
          // Move down
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
  }, [items, selectedItems, handleIndent, handleOutdent, handleAddRow, canIndent, canOutdent, onContextMenuAction]);

  // Synchronize scrolling between left and right panels
  const handleLeftScroll = useCallback(() => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (leftScrollRef.current && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
    }
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, []);
  const handleRightScroll = useCallback(() => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    }
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, []);
  return <div className="h-full w-full bg-white flex flex-col">
      {/* WBS Toolbar */}
      <WBSToolbar onAddRow={handleAddRow} onIndent={handleIndent} onOutdent={handleOutdent} onBold={handleBold} onItalic={handleItalic} onUnderline={handleUnderline} onFontSizeChange={handleFontSizeChange} selectedItems={selectedItems} canIndent={selectedItems.length > 0 && selectedItems.some(id => {
      const item = items.find(i => i.id === id);
      return item && item.level < 4; // Can only indent if not at max level (4)
    })} canOutdent={selectedItems.length > 0 && selectedItems.some(id => {
      const item = items.find(i => i.id === id);
      return item && item.level > 0; // Can only outdent if not at root level (0)
    })} currentFormatting={currentFormatting} />
      
      {/* Single ResizablePanelGroup controlling both header and content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Column (WBS + Names) */}
        <ResizablePanel defaultSize={25} minSize={15} maxSize={45}>
          <div className="h-full flex flex-col">
            {/* Left Header */}
            <div className="h-8 bg-slate-100/70 border-b border-slate-200 border-r border-gray-200 sticky top-0 z-40">
              <div className="px-2 py-1 text-xs font-medium text-slate-700 h-full">
                <div className="grid items-center h-full" style={{
                gridTemplateColumns: '32px 70px 1fr 40px'
              }}>
                  <div></div>
                  <div className="px-3 font-semibold text-[10px] uppercase tracking-wider text-slate-600">WBS</div>
                  <div className="px-2 font-semibold text-[10px] uppercase tracking-wider text-slate-600">ACTIVITY</div>
                  <div></div>
                </div>
              </div>
            </div>
            
            {/* Left Content with synchronized scrolling */}
            <div ref={leftScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide" onScroll={handleLeftScroll}>
              <WBSLeftPanel 
                items={items.map(item => {
                  const mappedItem = {
                    id: item.id,
                    name: item.title || item.name || '',
                    wbs_id: item.wbs_id || '',
                    level: item.level || 0,
                    parent_id: item.parent_id,
                    isExpanded: item.isExpanded !== false,
                    hasChildren: items.some(child => child.parent_id === item.id),
                    text_formatting: item.text_formatting
                  };
                  return mappedItem;
                })}
                onToggleExpanded={onToggleExpanded} 
                onDragEnd={onDragEnd}
                onDragUpdate={onDragUpdate}
                onItemEdit={onItemUpdate} 
                onAddChild={onAddChild}
                onContextMenuAction={onContextMenuAction}
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
        
        {/* Right Column (Status, Progress, etc.) */}
        <ResizablePanel defaultSize={75} minSize={55} maxSize={85}>
          <div className="h-full flex flex-col">
            {/* Right Header */}
            <div className="h-8 bg-slate-100/70 border-b border-slate-200 sticky top-0 z-40">
              <div className="px-2 py-1 text-xs font-medium text-slate-700 h-full">
                <div className="grid items-center h-full" style={{
                gridTemplateColumns: '140px 120px 160px 60px 40px 40px 84px'
              }}>
                  <div className="px-2 font-semibold flex items-center justify-start h-full">STATUS</div>
                  <div className="px-2 font-semibold flex items-center justify-start h-full">PROGRESS</div>
                  <div className="px-2 font-semibold flex items-center justify-start h-full">ASSIGNED TO</div>
                  <div className="px-2 font-semibold flex items-center justify-center h-full">RFQ</div>
                  <div className="px-1 font-semibold flex items-center justify-center h-full">NOTE</div>
                  <div className="px-1 font-semibold flex items-center justify-center h-full">TASK</div>
                  <div className="px-2 font-semibold flex items-center justify-center h-full">ACTIONS</div>
                </div>
              </div>
            </div>
            
            {/* Right Content with synchronized scrolling */}
            <div ref={rightScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin" onScroll={handleRightScroll}>
              <WBSRightPanel items={items as any} onItemUpdate={onItemUpdate} onContextMenuAction={onContextMenuAction} onOpenNotesDialog={onOpenNotesDialog} EditableCell={EditableCell} StatusSelect={StatusSelect} ProgressInput={ProgressInput} ProgressDisplay={ProgressDisplay} getProgressColor={getProgressColor} hoveredId={hoveredId} onRowHover={setHoveredId} selectedItems={selectedItems} onRowClick={handleRowClick} projectId={projectId} />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>;
};