import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Scissors,
  Copy,
  Clipboard,
  Trash2,
  PlusCircle,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  FileText,
  User,
  MoreHorizontal,
} from 'lucide-react';

interface WBSRowContextMenuProps {
  children: React.ReactNode;
  itemId: string;
  itemName: string;
  hasChildren: boolean;
  level: number;
  onAction: (action: string, itemId: string) => void;
}

export const WBSRowContextMenu = ({
  children,
  itemId,
  itemName,
  hasChildren,
  level,
  onAction,
}: WBSRowContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64 bg-white/95 backdrop-blur-sm border-slate-200 shadow-lg z-[100]">
        <ContextMenuItem onClick={() => onAction('cut', itemId)} className="cursor-pointer">
          <Scissors className="w-4 h-4 mr-2" />
          Cut
          <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction('copy', itemId)} className="cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Copy
          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction('paste', itemId)} className="cursor-pointer">
          <Clipboard className="w-4 h-4 mr-2" />
          Paste
          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={() => onAction('insert-below', itemId)} className="cursor-pointer">
          <PlusCircle className="w-4 h-4 mr-2" />
          Insert Row
        </ContextMenuItem>
        
        <ContextMenuItem 
          onClick={() => onAction('delete', itemId)} 
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Row
          <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => onAction('add-comment', itemId)} className="cursor-pointer">
          <MessageSquare className="w-4 h-4 mr-2" />
          Add a Row Comment
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem 
          onClick={() => onAction('indent', itemId)} 
          disabled={level >= 4}
          className="cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 mr-2" />
          Indent
          <ContextMenuShortcut>Ctrl+]</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuItem 
          onClick={() => onAction('outdent', itemId)} 
          disabled={level <= 0}
          className="cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Outdent
          <ContextMenuShortcut>Ctrl+[</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={() => onAction('view-details', itemId)} className="cursor-pointer">
          <FileText className="w-4 h-4 mr-2" />
          View Details
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => onAction('assign-to', itemId)} className="cursor-pointer">
          <User className="w-4 h-4 mr-2" />
          Assign To...
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={() => onAction('row-actions', itemId)} className="cursor-pointer">
          <MoreHorizontal className="w-4 h-4 mr-2" />
          More Actions...
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
