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
    console.log('🔍 ==== EXTRACT ASSEMBLY MARK ====');
    console.log('🔍 meta object keys:', meta ? Object.keys(meta) : 'NULL');
    
    if (!meta) {
      console.log('❌ meta is null/undefined');
      return null;
    }
    
    // Log all available fields
    console.log('🔍 meta.id:', meta.id);
    console.log('🔍 meta.type:', meta.type);
    console.log('🔍 meta.name:', meta.name);
    console.log('🔍 meta.attributes:', meta.attributes);
    console.log('🔍 meta.tag:', meta.tag);
    
    // FIRST: Check attributes.Tag (this is where xeokit stores IFC attributes)
    if (meta.attributes) {
      console.log('✅ attributes object exists, keys:', Object.keys(meta.attributes));
      if (meta.attributes.Tag) {
        const value = String(meta.attributes.Tag).trim();
        console.log(`✅ Found Tag in attributes: "${value}"`);
        if (value) {
          return value;
        }
      } else {
        console.log('❌ No Tag field in attributes');
      }
    } else {
      console.log('❌ No attributes object on metaObject');
    }
    
    // SECOND: Check the tag field directly
    if (meta.tag && typeof meta.tag === 'string') {
      const value = String(meta.tag).trim();
      console.log(`✅ Found tag field: "${value}"`);
      if (value) {
        return value;
      }
    }
    
    // THIRD: Check propertySets for Tag, ASSEMBLY_POS, or Assembly mark properties
    if (meta.propertySets && Array.isArray(meta.propertySets)) {
      console.log(`🔍 Checking ${meta.propertySets.length} property sets`);
      for (const ps of meta.propertySets) {
        if (ps.properties && Array.isArray(ps.properties)) {
          for (const prop of ps.properties) {
            if ((prop.name === 'Tag' || prop.name === 'ASSEMBLY_POS' || prop.name === 'Assembly mark') && prop.value) {
              const value = String(prop.value).trim();
              console.log(`✅ Found "${prop.name}" in property set: "${value}"`);
              if (value) {
                return value;
              }
            }
          }
          
          for (const prop of ps.properties) {
            if (prop.value && typeof prop.value === 'string') {
              const value = String(prop.value).trim();
              if (value.match(/^\d*[A-Z]+\d+(\.\d+)?$/i)) {
                console.log(`✅ Found assembly pattern "${value}" in property "${prop.name}"`);
                return value;
              }
            }
          }
        }
      }
    }
    
    console.log('❌ No assembly mark found anywhere');
    return null;
  }, []);

  // Helper: Build assembly cache
  const buildAssemblyCache = useCallback((viewerInstance: Viewer) => {
    const assemblyMarkCache: Record<string, string[]> = {};
    const allMetaObjects = viewerInstance.metaScene.metaObjects;
    
    console.log('🔨 === BUILDING ASSEMBLY CACHE ===');
    console.log('🔨 Total meta objects:', Object.keys(allMetaObjects).length);
    
    let processedCount = 0;
    let withTagCount = 0;
    
    Object.keys(allMetaObjects).forEach((id) => {
      const metaObject = allMetaObjects[id] as any;
      if (!viewerInstance.scene.objects[id]) return;
      
      processedCount++;
      const assemblyMark = extractAssemblyMark(metaObject);
      
      if (processedCount <= 5) {
        console.log(`🔍 Object ${processedCount}:`, {
          id,
          type: metaObject.type,
          tag: metaObject.tag,
          name: metaObject.name,
          extractedMark: assemblyMark
        });
      }
      
      if (assemblyMark) {
        withTagCount++;
        if (!assemblyMarkCache[assemblyMark]) {
          assemblyMarkCache[assemblyMark] = [];
        }
        assemblyMarkCache[assemblyMark].push(id);
      }
    });
    
    console.log(`✅ Built assembly cache:`);
    console.log(`   - Processed: ${processedCount} renderable objects`);
    console.log(`   - With tags: ${withTagCount} objects`);
    console.log(`   - Unique assembly marks: ${Object.keys(assemblyMarkCache).length}`);
    
    const sortedMarks = Object.entries(assemblyMarkCache)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);
    
    console.log('🏆 Largest assemblies:');
    sortedMarks.forEach(([mark, ids]) => {
      console.log(`   "${mark}": ${ids.length} parts`);
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
        
        console.log('===== CLICKED OBJECT =====');
        console.log('Entity ID:', entity.id);
        console.log('Type:', metaObject.type);
        console.log('🔍 metaObject.attributes:', metaObject.attributes);
        console.log('🔍 metaObject.attributes.Tag:', metaObject.attributes?.Tag);
        console.log('🔍 metaObject.tag:', metaObject.tag);
        console.log('🔍 metaObject.name:', metaObject.name);
        
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
      
      {/* Close Button - Floating */}
      <button
        onClick={() => onNavigate(`project-detail?projectId=${project?.id}`)}
        className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-xl border border-border/30 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] hover:scale-110 transition-all duration-300"
        title="Close BIM Viewer"
      >
        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex-shrink-0">
        <ViewerToolbar
          onZoomIn={() => {
            if (viewer?.scene?.camera) {
              const camera = viewer.scene.camera as any;
              const currentEye = camera.eye;
              const currentLook = camera.look;
              const direction = [
                currentEye[0] - currentLook[0],
                currentEye[1] - currentLook[1],
                currentEye[2] - currentLook[2]
              ];
              const length = Math.sqrt(direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2);
              const zoomFactor = 0.9;
              camera.eye = [
                currentLook[0] + (direction[0] / length) * length * zoomFactor,
                currentLook[1] + (direction[1] / length) * length * zoomFactor,
                currentLook[2] + (direction[2] / length) * length * zoomFactor
              ];
            }
          }}
          onZoomOut={() => {
            if (viewer?.scene?.camera) {
              const camera = viewer.scene.camera as any;
              const currentEye = camera.eye;
              const currentLook = camera.look;
              const direction = [
                currentEye[0] - currentLook[0],
                currentEye[1] - currentLook[1],
                currentEye[2] - currentLook[2]
              ];
              const length = Math.sqrt(direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2);
              const zoomFactor = 1.1;
              camera.eye = [
                currentLook[0] + (direction[0] / length) * length * zoomFactor,
                currentLook[1] + (direction[1] / length) * length * zoomFactor,
                currentLook[2] + (direction[2] / length) * length * zoomFactor
              ];
            }
          }}
          onFitView={() => {
            if (viewer?.cameraFlight) {
              viewer.cameraFlight.flyTo({
                aabb: viewer.scene.aabb
              });
            }
          }}
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
