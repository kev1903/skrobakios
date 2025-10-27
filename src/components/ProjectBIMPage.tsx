import { useState, useCallback, useRef, useEffect } from "react";
import { Viewer, WebIFCLoaderPlugin, DistanceMeasurementsPlugin } from "@xeokit/xeokit-sdk";
import { ViewerCanvas } from "@/components/Viewer/ViewerCanvas";
import { ViewerToolbar } from "@/components/Viewer/ViewerToolbar";
import { ObjectTree } from "@/components/Viewer/ObjectTree";
import { PropertiesPanel } from "@/components/Viewer/PropertiesPanel";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface ProjectBIMPageProps {
  project: any;
  onNavigate: (page: string) => void;
}

export const ProjectBIMPage = ({ project, onNavigate }: ProjectBIMPageProps) => {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [activeMode, setActiveMode] = useState<"select" | "measure" | "pan">("select");
  const [loadedModel, setLoadedModel] = useState<any>(null);
  const [ifcLoader, setIfcLoader] = useState<WebIFCLoaderPlugin | null>(null);
  const [measurePlugin, setMeasurePlugin] = useState<DistanceMeasurementsPlugin | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [isStructureCollapsed, setIsStructureCollapsed] = useState(true);
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(true);
  const [isStructurePinned, setIsStructurePinned] = useState(false);
  const [isPropertiesPinned, setIsPropertiesPinned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const assemblyCache = useRef<Record<string, any>>({});

  // Auto-collapse Project Structure after 5 seconds (unless pinned)
  useEffect(() => {
    if (!isStructureCollapsed && !isStructurePinned) {
      const timer = setTimeout(() => {
        setIsStructureCollapsed(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isStructureCollapsed, isStructurePinned]);

  // Auto-collapse Properties after 5 seconds (unless pinned)
  useEffect(() => {
    if (!isPropertiesCollapsed && !isPropertiesPinned) {
      const timer = setTimeout(() => {
        setIsPropertiesCollapsed(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isPropertiesCollapsed, isPropertiesPinned]);

  // Helper: Extract assembly mark from Tag property or other fields
  const extractAssemblyMark = useCallback((meta: any): string | null => {
    if (!meta) return null;
    
    // FIRST: Check the Tag field
    if (meta.tag && typeof meta.tag === 'string') {
      const value = String(meta.tag).trim();
      if (value) {
        return value;
      }
    }
    
    // SECOND: Check propertySets
    if (meta.propertySets && Array.isArray(meta.propertySets)) {
      for (const ps of meta.propertySets) {
        if (ps.properties && Array.isArray(ps.properties)) {
          for (const prop of ps.properties) {
            if ((prop.name === 'Tag' || prop.name === 'ASSEMBLY_POS' || prop.name === 'Assembly mark') && prop.value) {
              const value = String(prop.value).trim();
              if (value) return value;
            }
          }
          
          for (const prop of ps.properties) {
            if (prop.value && typeof prop.value === 'string') {
              const value = String(prop.value).trim();
              if (value.match(/^\d*[A-Z]+\d+(\.\d+)?$/i)) {
                return value;
              }
            }
          }
        }
      }
    }
    
    return null;
  }, []);

  // Helper: Build assembly cache
  const buildAssemblyCache = useCallback((viewerInstance: Viewer) => {
    const assemblyMarkCache: Record<string, string[]> = {};
    const allMetaObjects = viewerInstance.metaScene.metaObjects;
    
    Object.keys(allMetaObjects).forEach((id) => {
      const metaObject = allMetaObjects[id] as any;
      if (!viewerInstance.scene.objects[id]) return;
      
      const assemblyMark = extractAssemblyMark(metaObject);
      if (assemblyMark) {
        if (!assemblyMarkCache[assemblyMark]) {
          assemblyMarkCache[assemblyMark] = [];
        }
        assemblyMarkCache[assemblyMark].push(id);
      }
    });
    
    (assemblyCache.current as any).assemblyMarkCache = assemblyMarkCache;
  }, [extractAssemblyMark]);

  // Helper: Collect assembly entities
  const collectAssemblyEntities = useCallback((metaObject: any, viewerInstance: Viewer): string[] => {
    const assemblyMark = extractAssemblyMark(metaObject);
    
    if (!assemblyMark) {
      return viewerInstance.scene.objects[metaObject.id] ? [metaObject.id] : [];
    }
    
    const assemblyMarkCache = (assemblyCache.current as any).assemblyMarkCache;
    
    if (assemblyMarkCache && assemblyMarkCache[assemblyMark]) {
      return assemblyMarkCache[assemblyMark];
    }
    
    return viewerInstance.scene.objects[metaObject.id] ? [metaObject.id] : [];
  }, [extractAssemblyMark]);

  const handleViewerReady = useCallback((viewerInstance: Viewer, loaderInstance: WebIFCLoaderPlugin) => {
    const distanceMeasurements = new DistanceMeasurementsPlugin(viewerInstance, {
      defaultVisible: true,
      defaultColor: "#2D3748",
      zIndex: 10000,
      defaultLabelsOnWires: true
    });

    // Set up click event for assembly-based object selection
    viewerInstance.scene.input.on("mouseclicked", (coords: number[]) => {
      const hit = viewerInstance.scene.pick({
        canvasPos: coords,
        pickSurface: true
      });

      if (hit && hit.entity) {
        const entity = hit.entity as any;
        const metaObject = viewerInstance.metaScene.metaObjects[entity.id] as any;
        
        if (!metaObject) return;
        
        const assemblyObjectIds = collectAssemblyEntities(metaObject, viewerInstance);
        
        viewerInstance.scene.setObjectsSelected(viewerInstance.scene.selectedObjectIds, false);
        viewerInstance.scene.setObjectsSelected(assemblyObjectIds, true);
        
        const properties: any = {
          id: String(metaObject.id),
          type: metaObject.type || "Unknown",
          name: metaObject.name || String(metaObject.id),
          assemblyObjectCount: assemblyObjectIds.length,
          isObject: entity.isObject,
          isEntity: entity.isEntity,
          visible: entity.visible,
          xrayed: entity.xrayed,
          highlighted: entity.highlighted,
          selected: entity.selected,
          colorize: entity.colorize,
          opacity: entity.opacity,
        };

        if (metaObject.propertySets && Array.isArray(metaObject.propertySets)) {
          properties.propertySets = metaObject.propertySets.map((ps: any) => ({
            name: ps.name || ps.type || 'Property Set',
            type: ps.type,
            properties: ps.properties || {}
          }));
        }

        if (entity.matrix) {
          properties.position = entity.matrix.slice(12, 15);
        }

        if (entity.aabb) {
          properties.boundingBox = {
            min: entity.aabb.slice(0, 3),
            max: entity.aabb.slice(3, 6)
          };
        }

        setSelectedObject(properties);
        setIsPropertiesCollapsed(false);
        toast.success(`Selected assembly: ${properties.name} (${assemblyObjectIds.length} objects)`);
      } else {
        viewerInstance.scene.setObjectsSelected(viewerInstance.scene.selectedObjectIds, false);
        setSelectedObject(null);
      }
    });

    setMeasurePlugin(distanceMeasurements);
    setViewer(viewerInstance);
    setIfcLoader(loaderInstance);
  }, [collectAssemblyEntities]);

  const handleUpload = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !viewer || !ifcLoader) return;

    if (loadedModel) {
      loadedModel.destroy();
      setLoadedModel(null);
    }

    const loadingToast = toast.loading("Loading IFC model...");
    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) {
        toast.dismiss(loadingToast);
        toast.error("Failed to read file");
        return;
      }

      try {
        const model = ifcLoader.load({
          id: file.name,
          ifc: arrayBuffer,
          edges: true,
          excludeTypes: ["IfcSpace"]
        });

        model.on("loaded", () => {
          toast.dismiss(loadingToast);
          toast.success(`Model loaded: ${file.name}`);
          setLoadedModel(model);
          
          if (viewer) {
            setTimeout(() => {
              buildAssemblyCache(viewer);
            }, 500);
          }
          
          setTimeout(() => {
            if (viewer?.scene?.aabb) {
              viewer.cameraFlight.flyTo({ 
                aabb: viewer.scene.aabb, 
                duration: 1 
              });
            }
          }, 300);
        });

        model.on("error", (error: any) => {
          toast.dismiss(loadingToast);
          toast.error(`Failed to load model: ${error.message || "Unknown error"}`);
          console.error("Model loading error:", error);
        });
      } catch (error: any) {
        toast.dismiss(loadingToast);
        toast.error(`Failed to load model: ${error.message || "Unknown error"}`);
        console.error("Model loading error:", error);
      }
    };

    reader.onerror = () => {
      toast.dismiss(loadingToast);
      toast.error("Failed to read file");
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 top-[var(--header-height)] w-full flex flex-col overflow-hidden bg-background">
      <input ref={fileInputRef} type="file" accept=".ifc" onChange={handleFileChange} className="hidden" />
      
      {/* Header with Back Button */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("projects")}
            className="p-2 hover:bg-accent/50 rounded-full transition-all duration-200"
            title="Back to Projects"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{project?.name || "Project"}</h2>
            <p className="text-xs text-muted-foreground">BIM Viewer</p>
          </div>
        </div>
      </div>

      <div className="absolute top-[73px] left-1/2 -translate-x-1/2 z-10 flex-shrink-0">
        <ViewerToolbar
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onFitView={() => {}}
          onUpload={handleUpload}
          onMeasure={() => {}}
          activeMode={activeMode}
          onModeChange={setActiveMode}
        />
      </div>

      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Project Structure Panel */}
        <div 
          className={`absolute left-0 top-0 bottom-0 glass-panel flex-shrink-0 z-10 overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ${
            isStructureCollapsed ? 'w-0 opacity-0' : 'w-80 opacity-100'
          }`}
        >
          <ObjectTree 
            model={loadedModel} 
            ifcLoader={ifcLoader}
            viewer={viewer}
            isPinned={isStructurePinned}
            onPinToggle={() => setIsStructurePinned(!isStructurePinned)}
          />
        </div>
        
        {/* Toggle Button for Project Structure */}
        <button
          onClick={() => setIsStructureCollapsed(!isStructureCollapsed)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-xl border border-border/30 rounded-full p-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] hover:scale-110 transition-all duration-300"
          title={isStructureCollapsed ? "Show Project Structure" : "Hide Project Structure"}
        >
          {isStructureCollapsed ? (
            <svg className="h-5 w-5 text-luxury-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-luxury-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
        
        <div className="absolute inset-0 overflow-hidden">
          <ViewerCanvas onViewerReady={handleViewerReady} />
        </div>
        
        {/* Properties Panel */}
        <div 
          className={`absolute right-0 top-0 bottom-0 glass-panel flex-shrink-0 z-10 overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ${
            isPropertiesCollapsed ? 'w-0 opacity-0' : 'w-80 opacity-100'
          }`}
        >
          <PropertiesPanel 
            selectedObject={selectedObject}
            isPinned={isPropertiesPinned}
            onPinToggle={() => setIsPropertiesPinned(!isPropertiesPinned)}
          />
        </div>
        
        {/* Toggle Button for Properties */}
        <button
          onClick={() => setIsPropertiesCollapsed(!isPropertiesCollapsed)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-xl border border-border/30 rounded-full p-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] hover:scale-110 transition-all duration-300"
          title={isPropertiesCollapsed ? "Show Properties" : "Hide Properties"}
        >
          {isPropertiesCollapsed ? (
            <svg className="h-5 w-5 text-luxury-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-luxury-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};
