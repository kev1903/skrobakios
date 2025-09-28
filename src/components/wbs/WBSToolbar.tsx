import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Indent, 
  Outdent, 
  Bold, 
  Italic, 
  Underline,
  Type
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  return (
    <div className="h-12 bg-white border-b border-gray-200 px-4 flex items-center gap-2">
      {/* Row Management */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddRow}
          className="h-8 px-3 hover:bg-primary/10 hover:border-primary/20 transition-all duration-200"
          title="Add new row"
        >
          <Plus className="w-4 h-4 mr-1" />
          Row
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Indentation Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onOutdent}
          disabled={!hasSelection || !canOutdent}
          className={cn(
            "h-8 w-8 p-0 hover:bg-primary/10 hover:border-primary/20 transition-all duration-200",
            (!hasSelection || !canOutdent) && "opacity-40"
          )}
          title="Decrease indent"
        >
          <Outdent className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onIndent}
          disabled={!hasSelection || !canIndent}
          className={cn(
            "h-8 w-8 p-0 hover:bg-primary/10 hover:border-primary/20 transition-all duration-200",
            (!hasSelection || !canIndent) && "opacity-40"
          )}
          title="Increase indent"
        >
          <Indent className="w-4 h-4" />
        </Button>
      </div>

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

      {/* Selection Info */}
      {hasSelection && (
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