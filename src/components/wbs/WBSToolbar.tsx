import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Indent, 
  Outdent, 
  Bold, 
  Italic, 
  Underline,
  Type,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenSize } from '@/hooks/use-mobile';

interface WBSToolbarProps {
  onAddRow?: () => void;
  onIndent?: () => void;
  onOutdent?: () => void;
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onFontSizeChange?: (size: string) => void;
  selectedItems?: string[];
  canIndent?: boolean;
  canOutdent?: boolean;
  currentFormatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontSize?: string;
  };
}

export const WBSToolbar = ({
  onAddRow,
  onIndent,
  onOutdent,
  onBold,
  onItalic,
  onUnderline,
  onFontSizeChange,
  selectedItems = [],
  canIndent = false,
  canOutdent = false,
  currentFormatting = {}
}: WBSToolbarProps) => {
  const hasSelection = selectedItems.length > 0;
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile' || screenSize === 'mobile-small';
  const isTablet = screenSize === 'tablet';

  return (
    <div className={`h-12 bg-white border-b border-gray-200 flex items-center gap-2 ${
      isMobile ? 'px-2' : 'px-4'
    }`}>
      {/* Row Management - More Prominent */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          onClick={onAddRow}
          className={`h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 ${
            isMobile ? 'px-3' : 'px-4 gap-2'
          }`}
          title="Add new row (Enter when row selected)"
        >
          <Plus className="w-4 h-4" />
          {!isMobile && 'Add Row'}
        </Button>
      </div>

      {!isMobile && <Separator orientation="vertical" className="h-6" />}

      {/* Indentation Controls - With Keyboard Hints */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onOutdent}
          disabled={!hasSelection || !canOutdent}
          className={cn(
            "h-9 gap-1.5 hover:bg-primary/10 hover:border-primary/20 transition-all duration-200",
            (!hasSelection || !canOutdent) && "opacity-40",
            isMobile ? 'w-9 p-0' : 'px-3'
          )}
          title="Outdent (Shift+Tab)"
        >
          <Outdent className="w-4 h-4" />
          {!isMobile && !isTablet && <span className="text-xs">Outdent</span>}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onIndent}
          disabled={!hasSelection || !canIndent}
          className={cn(
            "h-9 gap-1.5 hover:bg-primary/10 hover:border-primary/20 transition-all duration-200",
            (!hasSelection || !canIndent) && "opacity-40",
            isMobile ? 'w-9 p-0' : 'px-3'
          )}
          title="Indent (Tab)"
        >
          <Indent className="w-4 h-4" />
          {!isMobile && !isTablet && <span className="text-xs">Indent</span>}
        </Button>
      </div>

      {/* Desktop/Tablet: Show all formatting options */}
      {!isMobile && (
        <>
          <Separator orientation="vertical" className="h-6" />

          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onBold}
              disabled={!hasSelection}
              className={cn(
                "h-8 w-8 p-0 transition-all duration-200",
                currentFormatting.bold 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "hover:bg-primary/10 hover:border-primary/20",
                !hasSelection && "opacity-40"
              )}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onItalic}
              disabled={!hasSelection}
              className={cn(
                "h-8 w-8 p-0 transition-all duration-200",
                currentFormatting.italic 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "hover:bg-primary/10 hover:border-primary/20",
                !hasSelection && "opacity-40"
              )}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onUnderline}
              disabled={!hasSelection}
              className={cn(
                "h-8 w-8 p-0 transition-all duration-200",
                currentFormatting.underline 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "hover:bg-primary/10 hover:border-primary/20",
                !hasSelection && "opacity-40"
              )}
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Font Size */}
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-muted-foreground" />
            <Select
              value={currentFormatting.fontSize || "12"}
              onValueChange={onFontSizeChange}
              disabled={!hasSelection}
            >
              <SelectTrigger className={cn(
                "h-8 w-16 text-xs",
                !hasSelection && "opacity-40"
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10px</SelectItem>
                <SelectItem value="11">11px</SelectItem>
                <SelectItem value="12">12px</SelectItem>
                <SelectItem value="14">14px</SelectItem>
                <SelectItem value="16">16px</SelectItem>
                <SelectItem value="18">18px</SelectItem>
                <SelectItem value="20">20px</SelectItem>
                <SelectItem value="24">24px</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Mobile: Dropdown menu for text formatting */}
      {isMobile && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasSelection}
              className={cn(
                "h-8 w-8 p-0",
                !hasSelection && "opacity-40"
              )}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onBold} disabled={!hasSelection}>
              <Bold className="w-4 h-4 mr-2" />
              Bold
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onItalic} disabled={!hasSelection}>
              <Italic className="w-4 h-4 mr-2" />
              Italic
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onUnderline} disabled={!hasSelection}>
              <Underline className="w-4 h-4 mr-2" />
              Underline
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={!hasSelection}>
              <Type className="w-4 h-4 mr-2" />
              Font Size: {currentFormatting.fontSize || '12'}px
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Selection Info */}
      {hasSelection && !isMobile && (
        <>
          <Separator orientation="vertical" className="h-6 ml-auto" />
          <div className="text-xs text-muted-foreground">
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
          </div>
        </>
      )}
    </div>
  );
};