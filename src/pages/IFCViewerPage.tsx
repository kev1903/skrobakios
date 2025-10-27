import { useState, useCallback, useRef, useEffect } from "react";
import { Viewer, WebIFCLoaderPlugin, DistanceMeasurementsPlugin } from "@xeokit/xeokit-sdk";
import { ViewerCanvas } from "@/components/Viewer/ViewerCanvas";
import { ViewerToolbar } from "@/components/Viewer/ViewerToolbar";
import { ObjectTree } from "@/components/Viewer/ObjectTree";
import { PropertiesPanel } from "@/components/Viewer/PropertiesPanel";
import { toast } from "sonner";

const IFCViewerPage = () => {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [activeMode, setActiveMode] = useState<"select" | "measure" | "pan">("select");
  const [loadedModel, setLoadedModel] = useState<any>(null);
  const [ifcLoader, setIfcLoader] = useState<WebIFCLoaderPlugin | null>(null);
  const [measurePlugin, setMeasurePlugin] = useState<DistanceMeasurementsPlugin | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [nameProperty] = useState<string>("id");
  const [isStructureCollapsed, setIsStructureCollapsed] = useState(true);
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(true);
  const [isStructurePinned, setIsStructurePinned] = useState(false);
  const [isPropertiesPinned, setIsPropertiesPinned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const measurementClickCount = useRef<number>(0);
  const firstPoint = useRef<{ entity: any; worldPos: number[] } | null>(null);
  const assemblyCache = useRef<Record<string, string[]>>({});

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

  // Helper: Find the IfcElementAssembly parent that contains the assembly mark
  const findAssemblyParent = useCallback((meta: any, viewerInstance: Viewer): any | null => {
    if (!meta) return null;
    
    // If this is already an IfcElementAssembly, return it
    if (meta.type === "IfcElementAssembly") {
      return meta;
    }
    
    // Traverse up to find IfcElementAssembly parent
    let current = meta;
    let depth = 0;
    while (current && current.parent && depth < 10) {
      const parentId = typeof current.parent === 'string' ? current.parent : current.parent.id;
      const parentMeta = viewerInstance.metaScene.metaObjects[parentId];
      
      if (parentMeta) {
        console.log(`Checking parent at depth ${depth + 1}: ${parentMeta.id}, type: ${parentMeta.type}`);
        
        if (parentMeta.type === "IfcElementAssembly") {
          console.log(`✅ Found IfcElementAssembly parent: ${parentMeta.id}`);
          return parentMeta;
        }
        current = parentMeta;
      } else {
        break;
      }
      depth++;
    }
    
    console.log('❌ No IfcElementAssembly parent found');
    return null;
  }, []);

  // Helper: Extract assembly mark from IfcElementAssembly metadata
  const extractAssemblyMark = useCallback((meta: any): string | null => {
    if (!meta || !meta.propertySets) return null;
    
    // For IfcElementAssembly, look for assembly properties
    if (Array.isArray(meta.propertySets)) {
      for (const ps of meta.propertySets) {
        if (ps.properties && Array.isArray(ps.properties)) {
          // Look for any property that might contain the assembly mark
          const assemblyProps = [
            "ASSEMBLY_POS",
            "Assembly mark", 
            "ASSEMBLY_POSITION_CODE",
            "Assembly/Cast unit Mark",
            "Pos",
            "Position",
            "Mark"
          ];
          
          for (const propName of assemblyProps) {
            const prop = ps.properties.find((p: any) => p.name === propName);
            if (prop && prop.value && String(prop.value).trim()) {
              return String(prop.value).trim();
            }
          }
        }
      }
    }
    
    // Fallback: use the assembly name or id
    return meta.name || meta.id;
  }, []);

  // Helper: Extract Reference property (part number like "1p.20")
  const extractReference = useCallback((meta: any): string | null => {
    if (!meta || !meta.propertySets) return null;
    
    if (Array.isArray(meta.propertySets)) {
      for (const ps of meta.propertySets) {
        if (ps.properties && Array.isArray(ps.properties)) {
          const refProp = ps.properties.find((p: any) => p.name === "Reference");
          if (refProp && refProp.value) {
            return String(refProp.value);
          }
        }
      }
    }
    return null;
  }, []);

  // Helper: Collect all children of an IfcElementAssembly
  const collectAssemblyChildren = useCallback((assemblyMeta: any, viewerInstance: Viewer): string[] => {
    const entityIds: string[] = [];
    
    const collectRecursive = (obj: any) => {
      // Add this object if it's renderable
      if (viewerInstance.scene.objects[obj.id]) {
        entityIds.push(obj.id);
      }
      
      // Recursively collect children
      if (obj.children && Array.isArray(obj.children)) {
        obj.children.forEach((childId: any) => {
          const childIdStr = typeof childId === 'string' ? childId : childId.id;
          const childMeta = viewerInstance.metaScene.metaObjects[childIdStr];
          if (childMeta) {
            collectRecursive(childMeta);
          }
        });
      }
    };
    
    collectRecursive(assemblyMeta);
    
    console.log(`Collected ${entityIds.length} entities from assembly ${assemblyMeta.id}`);
    return entityIds;
  }, []);

  // Helper: Build assembly cache - map each part to its parent assembly
  const buildAssemblyCache = useCallback((viewerInstance: Viewer) => {
    const cache: Record<string, string[]> = {};
    const partToAssemblyMap: Record<string, string> = {};
    
    const allMetaObjects = viewerInstance.metaScene.metaObjects;
    
    // Find all IfcElementAssembly objects
    const assemblies: any[] = [];
    Object.keys(allMetaObjects).forEach((id) => {
      const metaObject = allMetaObjects[id] as any;
      if (metaObject.type === "IfcElementAssembly") {
        assemblies.push(metaObject);
        console.log(`Found IfcElementAssembly: ${id}, name: ${metaObject.name}`);
        
        // Extract assembly mark
        const assemblyMark = extractAssemblyMark(metaObject);
        console.log(`Assembly mark: ${assemblyMark}`);
        
        // Collect all children
        const children = collectAssemblyChildren(metaObject, viewerInstance);
        cache[id] = children;
        
        // Map each child to this assembly
        children.forEach((childId) => {
          partToAssemblyMap[childId] = id;
        });
        
        console.log(`Assembly ${id} has ${children.length} children`);
      }
    });
    
    console.log(`Found ${assemblies.length} IfcElementAssembly objects`);
    
    assemblyCache.current = cache;
    (assemblyCache.current as any).partToAssemblyMap = partToAssemblyMap;
    
  }, [extractAssemblyMark, collectAssemblyChildren]);

  // Helper: Get selectable root - now returns the IfcElementAssembly parent
  const getSelectableRoot = useCallback((metaObject: any, viewerInstance: Viewer): any => {
    // Try to find IfcElementAssembly parent
    const assemblyParent = findAssemblyParent(metaObject, viewerInstance);
    
    if (assemblyParent) {
      return assemblyParent;
    }
    
    // Fallback: return the original object
    return metaObject;
  }, [findAssemblyParent]);

  // Helper: Collect all entity IDs for selection
  const collectAssemblyEntities = useCallback((metaObject: any, viewerInstance: Viewer): string[] => {
    // If this is an IfcElementAssembly, get all its children from cache
    if (metaObject.type === "IfcElementAssembly") {
      const cached = assemblyCache.current[metaObject.id];
      if (cached && cached.length > 0) {
        console.log(`Using cached children for IfcElementAssembly: ${cached.length} objects`);
        return cached;
      }
      
      // If not cached, collect children directly
      return collectAssemblyChildren(metaObject, viewerInstance);
    }
    
    // If this is a part, find its parent assembly and select all siblings
    const partToAssemblyMap = (assemblyCache.current as any).partToAssemblyMap;
    if (partToAssemblyMap && partToAssemblyMap[metaObject.id]) {
      const assemblyId = partToAssemblyMap[metaObject.id];
      const cached = assemblyCache.current[assemblyId];
      if (cached && cached.length > 0) {
        console.log(`Part belongs to assembly ${assemblyId}: selecting ${cached.length} objects`);
        return cached;
      }
    }
    
    // Fallback: return just this object
    console.log('No assembly found, selecting single object');
    return viewerInstance.scene.objects[metaObject.id] ? [metaObject.id] : [];
  }, [collectAssemblyChildren]);

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
        
        if (!metaObject) {
          return;
        }
        
        console.log('===== CLICKED OBJECT =====');
        console.log('ID:', entity.id);
        console.log('Type:', metaObject.type);
        console.log('Parent:', metaObject.parent);
        console.log('Full metadata:', metaObject);
        
        // Extract ALL properties to find assembly identifiers
        const allProperties: Record<string, any> = {};
        if (metaObject.propertySets && Array.isArray(metaObject.propertySets)) {
          metaObject.propertySets.forEach((ps: any) => {
            if (ps.properties && Array.isArray(ps.properties)) {
              ps.properties.forEach((p: any) => {
                allProperties[p.name] = p.value;
              });
            }
          });
        }
        
        console.log('ALL PROPERTIES:', allProperties);
        console.log('Assembly Mark (ASSEMBLY_POS):', allProperties['ASSEMBLY_POS'] || allProperties['Assembly mark']);
        console.log('Reference (Part):', allProperties['Reference']);
        console.log('Preliminary mark:', allProperties['Preliminary mark']);
        console.log('Position:', allProperties['Position']);
        
        // Find the selectable root (assembly or parent)
        const rootMeta = getSelectableRoot(metaObject, viewerInstance);
        
        console.log('===== SELECTABLE ROOT =====');
        console.log('Root ID:', rootMeta.id);
        console.log('Root Type:', rootMeta.type);
        console.log('Root Name:', rootMeta.name);
        
        // Collect all entity IDs for this assembly
        const assemblyObjectIds = collectAssemblyEntities(rootMeta, viewerInstance);
        
        console.log('===== ASSEMBLY SELECTION =====');
        console.log('Total objects:', assemblyObjectIds.length);
        console.log('Object IDs:', assemblyObjectIds);
        
        const assemblyParent = rootMeta;
        
        // Deselect all and select assembly objects
        viewerInstance.scene.setObjectsSelected(viewerInstance.scene.selectedObjectIds, false);
        viewerInstance.scene.setObjectsSelected(assemblyObjectIds, true);
        
        // Get IFC properties from the assembly parent metadata
        
        if (assemblyParent) {
          // Collect IFC properties from assembly
          const properties: any = {
            id: String(assemblyParent.id),
            type: assemblyParent.type || "Unknown",
            name: assemblyParent.name || String(assemblyParent.id),
            assemblyObjectCount: assemblyObjectIds.length,
            
            // Viewer state properties
            isObject: entity.isObject,
            isEntity: entity.isEntity,
            visible: entity.visible,
            xrayed: entity.xrayed,
            highlighted: entity.highlighted,
            selected: entity.selected,
            colorize: entity.colorize,
            opacity: entity.opacity,
          };

          // Add IFC property sets from metadata
          if (assemblyParent.propertySets && Array.isArray(assemblyParent.propertySets)) {
            properties.propertySets = assemblyParent.propertySets.map((ps: any) => ({
              name: ps.name || ps.type || 'Property Set',
              type: ps.type,
              properties: ps.properties || {}
            }));
          }

          // Try to get properties from children metadata
          if (!properties.propertySets || properties.propertySets.length === 0) {
            const allMeta = viewerInstance.metaScene.metaObjects;
            const relatedProps: any[] = [];
            
            Object.keys(allMeta).forEach((key: string) => {
              const meta = allMeta[key] as any;
              if (meta.type === 'IfcPropertySet' || meta.type === 'IfcElementQuantity') {
                // Check if this property set is related to our object
                if (meta.properties) {
                  relatedProps.push({
                    name: meta.name || meta.type,
                    type: meta.type,
                    properties: meta.properties
                  });
                }
              }
            });
            
            if (relatedProps.length > 0) {
              properties.propertySets = relatedProps;
            }
          }

          // Add transform properties if available
          if (entity.matrix) {
            properties.position = entity.matrix.slice(12, 15);
          }

          // Add AABB (bounding box) if available
          if (entity.aabb) {
            properties.boundingBox = {
              min: entity.aabb.slice(0, 3),
              max: entity.aabb.slice(3, 6)
            };
          }

          console.log('Selected assembly metadata:', assemblyParent);
          console.log('Assembly object IDs:', assemblyObjectIds);
          console.log('Extracted properties:', properties);

          setSelectedObject(properties);
          setIsPropertiesCollapsed(false);
          toast.success(`Selected assembly: ${properties.name} (${assemblyObjectIds.length} objects)`);
        } else {
          // Fallback to basic entity properties if no metadata
          const properties: any = {
            id: String(entity.id),
            type: entity.type || "Unknown",
            name: entity.name || String(entity.id),
            isObject: entity.isObject,
            isEntity: entity.isEntity,
            visible: entity.visible,
            xrayed: entity.xrayed,
            highlighted: entity.highlighted,
            selected: entity.selected,
            colorize: entity.colorize,
            opacity: entity.opacity,
          };

          if (entity.aabb) {
            properties.boundingBox = {
              min: entity.aabb.slice(0, 3),
              max: entity.aabb.slice(3, 6)
            };
          }

          setSelectedObject(properties);
          setIsPropertiesCollapsed(false);
          toast.success(`Selected: ${properties.name}`);
        }
      } else {
        // Deselect all if clicking on empty space
        viewerInstance.scene.setObjectsSelected(viewerInstance.scene.selectedObjectIds, false);
        setSelectedObject(null);
      }
    });

    setMeasurePlugin(distanceMeasurements);
    setViewer(viewerInstance);
    setIfcLoader(loaderInstance);
  }, [getSelectableRoot, collectAssemblyEntities, extractReference, extractAssemblyMark, findAssemblyParent, collectAssemblyChildren]);

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
          
          // Build assembly cache for performance
          if (viewer) {
            setTimeout(() => {
              buildAssemblyCache(viewer);
            }, 500);
          }
          
          // Fit view to model with slight delay
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
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex-shrink-0">
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
        {/* Project Structure Panel - Collapsible */}
        <div 
          className={`absolute left-0 top-0 bottom-0 glass-panel flex-shrink-0 z-10 overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ${
            isStructureCollapsed ? 'w-0 opacity-0' : 'w-80 opacity-100'
          }`}
        >
          <ObjectTree 
            model={loadedModel} 
            ifcLoader={ifcLoader}
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
        
        {/* Properties Panel - Collapsible */}
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

export default IFCViewerPage;
