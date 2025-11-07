import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, EyeOff, Pin, Package, MoreVertical, Edit, Upload, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ObjectTreeProps {
  loadedModels: Map<string, any>;
  visibleModels: Set<string>;
  ifcLoader: any;
  isPinned?: boolean;
  onPinToggle?: () => void;
  viewer?: any;
  savedModels?: any[];
  onModelLoad?: (filePath: string, fileName: string, modelDbId?: string) => void;
  onModelToggleVisibility?: (modelDbId: string) => void;
  onModelRename?: (modelId: string, currentName: string) => void;
  onModelReplace?: (modelId: string) => void;
  onModelDelete?: (modelId: string, fileName: string) => void;
}

export const ObjectTree = ({ 
  loadedModels,
  visibleModels,
  isPinned = false, 
  onPinToggle, 
  savedModels = [], 
  onModelLoad,
  onModelToggleVisibility,
  onModelRename,
  onModelReplace,
  onModelDelete
}: ObjectTreeProps) => {
  
  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-xl border-r border-border/30">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-luxury-gold" />
          <h3 className="text-xs font-semibold text-luxury-gold uppercase tracking-wider">
            Project Models
          </h3>
        </div>
        {onPinToggle && (
          <button
            onClick={onPinToggle}
            className={`transition-all duration-200 p-1.5 hover:bg-accent/50 rounded-full ${
              isPinned ? 'text-luxury-gold' : 'text-muted-foreground'
            }`}
            title={isPinned ? "Unpin (auto-collapse)" : "Pin (keep open)"}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Models List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {savedModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No models uploaded yet
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Upload an IFC model to get started
              </p>
            </div>
          ) : (
            savedModels.map((savedModel) => {
              const modelDbId = savedModel.id;
              const isLoaded = loadedModels.has(modelDbId);
              const isVisible = visibleModels.has(modelDbId);
              
              return (
                <div
                  key={modelDbId}
                  className={`flex items-center gap-2 px-4 py-3 mb-1 rounded-lg hover:bg-accent/30 transition-all duration-200 group ${
                    isLoaded && isVisible ? 'bg-luxury-gold/10 border border-luxury-gold/30' : ''
                  }`}
                >
                  <Package className={`h-4 w-4 flex-shrink-0 ${isLoaded ? 'text-luxury-gold' : 'text-muted-foreground'}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium truncate ${isLoaded ? 'text-luxury-gold' : 'text-foreground'}`}>
                        {savedModel.file_name}
                      </span>
                      {isLoaded && isVisible && (
                        <span className="text-xs bg-luxury-gold/20 text-luxury-gold px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                          Visible
                        </span>
                      )}
                      {isLoaded && !isVisible && (
                        <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Eye icon for show/hide */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isLoaded && onModelToggleVisibility) {
                          onModelToggleVisibility(modelDbId);
                        } else if (!isLoaded && onModelLoad) {
                          onModelLoad(savedModel.file_path, savedModel.file_name, modelDbId);
                        }
                      }}
                      className="transition-all duration-200 p-1.5 hover:bg-accent/50 rounded-full flex-shrink-0"
                      title={isLoaded ? (isVisible ? "Hide model" : "Show model") : "Load model"}
                    >
                      {isLoaded && isVisible ? (
                        <Eye className="h-3.5 w-3.5 text-luxury-gold" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                    
                    {/* More options menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="transition-all duration-200 p-1.5 hover:bg-accent/50 rounded-full flex-shrink-0 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onModelRename && (
                          <DropdownMenuItem
                            onClick={() => onModelRename(modelDbId, savedModel.file_name)}
                          >
                            <Edit className="h-3.5 w-3.5 mr-2" />
                            Rename
                          </DropdownMenuItem>
                        )}
                        {onModelReplace && (
                          <DropdownMenuItem
                            onClick={() => onModelReplace(modelDbId)}
                          >
                            <Upload className="h-3.5 w-3.5 mr-2" />
                            Replace
                          </DropdownMenuItem>
                        )}
                        {onModelDelete && (
                          <DropdownMenuItem
                            onClick={() => onModelDelete(modelDbId, savedModel.file_name)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
