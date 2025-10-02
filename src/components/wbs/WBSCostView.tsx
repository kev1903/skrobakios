import React, { useState, useRef, useCallback } from 'react';
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
      console.log('🔵 Starting cascade indent operation for items:', selectedItems);
      
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
        if (!item) continue;
        
        // Find the item directly above this one in the flat list
        const currentIndex = items.findIndex(i => i.id === itemId);
        if (currentIndex <= 0) continue; // Can't indent the first item
        
        const itemAbove = items[currentIndex - 1];
        
        // Check maximum level restriction (allow up to level 4, since we start from 0)
        if (item.level >= 4) {
          console.log(`🚫 Cannot indent ${item.name || item.id} - maximum level (4) reached`);
          continue;
        }
        
        console.log(`🔄 Indenting parent item ${item.name || item.id} under ${itemAbove.name || itemAbove.id}`);
        
        // Indent the parent item
        await onItemUpdate(itemId, {
          parent_id: itemAbove.id,
          level: item.level + 1
        });
        
        // Get all descendants and indent them too
        const descendants = getAllDescendants(itemId);
        console.log(`📂 Found ${descendants.length} descendants to cascade indent:`, descendants);
        
        for (const descendantId of descendants) {
          const descendant = items.find(i => i.id === descendantId);
          if (descendant) {
            console.log(`🔄 Cascading indent to ${descendant.name || descendant.id} (level ${descendant.level} → ${descendant.level + 1})`);
            await onItemUpdate(descendantId, {
              level: descendant.level + 1
            });
          }
        }
      }
      
      // Auto-renumber WBS after indent operations
      const updates = renumberAllWBSItems(items as WBSItem[]);
      for (const update of updates) {
        await onItemUpdate(update.item.id, { wbs_id: update.newWbsId });
      }
      
      // Clear selection after indent
      setSelectedItems([]);
      console.log('✅ Cascade indent operation completed with WBS renumbering');
    } catch (error) {
      console.error('❌ Error in cascade indent operation:', error);
    }
  }, [selectedItems, items, onItemUpdate]);

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
        
        console.log(`🔄 Outdenting parent item ${item.name || item.id} from level ${item.level} to ${item.level - 1}`);
        
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
            console.log(`🔄 Cascading outdent to ${descendant.name || descendant.id} (level ${descendant.level} → ${Math.max(0, descendant.level - 1)})`);
            await onItemUpdate(descendantId, {
              level: Math.max(0, descendant.level - 1)
            });
          }
        }
      }
      
      // Auto-renumber WBS after outdent operations
      const updates = renumberAllWBSItems(items as WBSItem[]);
      for (const update of updates) {
        await onItemUpdate(update.item.id, { wbs_id: update.newWbsId });
      }
      
      // Clear selection after outdent
      setSelectedItems([]);
      console.log('✅ Cascade outdent operation completed with WBS renumbering');
    } catch (error) {
      console.error('❌ Error in cascade outdent operation:', error);
    }
  }, [selectedItems, items, onItemUpdate]);

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
                items={items.map(item => {
                  const mappedItem = {
                    id: item.id,
                    name: item.title || item.name || '',
                    level: item.level || 0,
                    parent_id: item.parent_id,
                    wbs_id: item.wbs_id,
                    isExpanded: item.is_expanded !== false,
                    hasChildren: items.some(child => child.parent_id === item.id)
                  };
                  console.log('🟢 WBSCostView mapping item:', item.id, 'is_expanded:', item.is_expanded, 'mapped isExpanded:', mappedItem.isExpanded);
                  return mappedItem;
                })}
                onToggleExpanded={onToggleExpanded}
                onDragEnd={onDragEnd}
                onItemEdit={onItemUpdate}
                onAddChild={onAddChild}
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
                  <div className="px-2 font-semibold text-right">BUDGET</div>
                  <div className="px-2 font-semibold text-right">VARIATIONS</div>
                  <div className="px-2 font-semibold text-right">NEW BUDGET</div>
                  <div className="px-2 font-semibold text-right">COMMITTED</div>
                  <div className="px-2 font-semibold text-right">PAID</div>
                  <div className="px-2 font-semibold text-right">REMAINING</div>
                  <div className="px-2 font-semibold text-right">FORECAST FINAL</div>
                  <div className="px-2 font-semibold text-right">VARIANCE</div>
                  <div className="px-2 font-semibold">NOTES</div>
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