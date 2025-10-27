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

  // Helper: Extract Reference property from IFC metadata (used in Tekla models)
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

  // Helper: Build assembly cache for performance (Reference-based AND hierarchy-based)
  const buildAssemblyCache = useCallback((viewerInstance: Viewer) => {
    const cache: Record<string, string[]> = {};
    const referenceCache: Record<string, string[]> = {};
    
    const allMetaObjects = viewerInstance.metaScene.metaObjects;
    
    // Build Reference-based cache (for Tekla models)
    Object.keys(allMetaObjects).forEach((id) => {
      const metaObject = allMetaObjects[id] as any;
      const reference = extractReference(metaObject);
      
      if (reference && viewerInstance.scene.objects[id]) {
        if (!referenceCache[reference]) {
          referenceCache[reference] = [];
        }
        referenceCache[reference].push(id);
      }
    });
    
    console.log(`Built Reference cache with ${Object.keys(referenceCache).length} unique references`);
    
    // Store reference cache
    (assemblyCache.current as any).referenceCache = referenceCache;
    
    const collectDescendants = (metaObject: any, result: string[]) => {
      if (metaObject.children && Array.isArray(metaObject.children)) {
        for (const childId of metaObject.children) {
          const childIdStr = typeof childId === 'string' ? childId : childId.id;
          result.push(childIdStr);
          const childMeta = viewerInstance.metaScene.metaObjects[childIdStr];
          if (childMeta) {
            collectDescendants(childMeta, result);
          }
        }
      }
    };
    
    // Find all IfcElementAssembly objects and cache their descendants
    Object.keys(allMetaObjects).forEach((id) => {
      const metaObject = allMetaObjects[id] as any;
      if (metaObject.type === "IfcElementAssembly") {
        const descendants: string[] = [];
        collectDescendants(metaObject, descendants);
        cache[id] = descendants;
        console.log(`Cached assembly ${id} with ${descendants.length} descendants`);
      }
    });
    
    assemblyCache.current = cache;
    console.log(`Built IfcElementAssembly cache with ${Object.keys(cache).length} assemblies`);
  }, [extractReference]);

  // Helper: Find the selectable root (assembly or parent)
  const getSelectableRoot = useCallback((metaObject: any, viewerInstance: Viewer): any => {
    let current = metaObject;
    
    // Traverse up to find IfcElementAssembly parent
    while (current && current.parent) {
      const parentId = typeof current.parent === 'string' ? current.parent : current.parent.id;
      const parentMeta = viewerInstance.metaScene.metaObjects[parentId];
      
      if (parentMeta && parentMeta.type === "IfcElementAssembly") {
        return parentMeta;
      }
      
      current = parentMeta;
    }
    
    // If no assembly found, return the original object
    return metaObject;
  }, []);

  // Helper: Collect all entity IDs for a meta object using Reference or hierarchy
  const collectAssemblyEntities = useCallback((metaObject: any, viewerInstance: Viewer): string[] => {
    const entityIds: string[] = [];
    
    // PRIORITY 1: Try Reference-based selection (for Tekla models)
    const reference = extractReference(metaObject);
    if (reference) {
      const referenceCache = (assemblyCache.current as any).referenceCache;
      if (referenceCache && referenceCache[reference]) {
        console.log(`Using Reference cache for "${reference}": ${referenceCache[reference].length} objects`);
        return referenceCache[reference];
      }
    }
    
    // PRIORITY 2: Check if we have cached descendants for IfcElementAssembly
    if (assemblyCache.current[metaObject.id]) {
      assemblyCache.current[metaObject.id].forEach((descendantId) => {
        if (viewerInstance.scene.objects[descendantId]) {
          entityIds.push(descendantId);
        }
      });
    }
    
    // Always add the root entity if it exists
    if (viewerInstance.scene.objects[metaObject.id]) {
      entityIds.push(metaObject.id);
    }
    
    // PRIORITY 3: If no cached data, traverse recursively
    if (entityIds.length <= 1 && metaObject.children && Array.isArray(metaObject.children)) {
      const collectRecursive = (obj: any) => {
        if (viewerInstance.scene.objects[obj.id]) {
          entityIds.push(obj.id);
        }
        
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
      
      collectRecursive(metaObject);
    }
    
    return entityIds;
  }, [extractReference]);

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
  }, [getSelectableRoot, collectAssemblyEntities, extractReference]);

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
