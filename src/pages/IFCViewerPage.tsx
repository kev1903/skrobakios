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

  const handleViewerReady = useCallback((viewerInstance: Viewer, loaderInstance: WebIFCLoaderPlugin) => {
    const distanceMeasurements = new DistanceMeasurementsPlugin(viewerInstance, {
      defaultVisible: true,
      defaultColor: "#2D3748",
      zIndex: 10000,
      defaultLabelsOnWires: true
    });

    // Set up click event for object selection
    viewerInstance.scene.input.on("mouseclicked", (coords: number[]) => {
      const hit = viewerInstance.scene.pick({
        canvasPos: coords,
        pickSurface: true
      });

      if (hit && hit.entity) {
        const entity = hit.entity as any;
        const metaObject = viewerInstance.metaScene.metaObjects[entity.id] as any;
        
        if (!metaObject) {
          console.log("No metadata found for entity:", entity.id);
          return;
        }

        console.log("Clicked metaObject:", metaObject);
        
        // Get assembly reference from property sets to find related parts
        let assemblyReference = null;
        let assemblyMark = null;
        
        // Try to find assembly reference from property sets
        if (metaObject.propertySets && Array.isArray(metaObject.propertySets)) {
          for (const ps of metaObject.propertySets) {
            if (ps.properties) {
              // Check for Tekla reference or assembly mark
              for (const prop of ps.properties) {
                if (prop.name === 'Reference' && prop.value) {
                  assemblyReference = String(prop.value);
                }
                if (prop.name === 'ASSEMBLY_MARK' && prop.value) {
                  assemblyMark = String(prop.value);
                }
              }
            }
          }
        }
        
        console.log("Assembly reference:", assemblyReference);
        console.log("Assembly mark:", assemblyMark);
        
        // Collect all objects with the same assembly reference or parent
        const assemblyObjectIds: string[] = [];
        let assemblyParent = metaObject;
        
        // Method 1: Find by assembly reference/mark
        if (assemblyReference || assemblyMark) {
          const allMetaObjects = viewerInstance.metaScene.metaObjects;
          Object.keys(allMetaObjects).forEach((objId: string) => {
            const obj = allMetaObjects[objId] as any;
            if (obj.propertySets && Array.isArray(obj.propertySets)) {
              for (const ps of obj.propertySets) {
                if (ps.properties) {
                  for (const prop of ps.properties) {
                    if ((prop.name === 'Reference' && prop.value === assemblyReference) ||
                        (prop.name === 'ASSEMBLY_MARK' && prop.value === assemblyMark)) {
                      if (viewerInstance.scene.objects[objId]) {
                        assemblyObjectIds.push(objId);
                      }
                    }
                  }
                }
              }
            }
          });
        }
        
        // Method 2: If no assembly reference found, try parent-child hierarchy
        if (assemblyObjectIds.length === 0) {
          // Find parent assembly
          if (metaObject.parent) {
            const parentMeta = viewerInstance.metaScene.metaObjects[metaObject.parent] as any;
            if (parentMeta) {
              assemblyParent = parentMeta;
            }
          }
          
          // Recursively collect all children
          const collectChildren = (metaObj: any) => {
            if (metaObj.id && viewerInstance.scene.objects[metaObj.id]) {
              assemblyObjectIds.push(metaObj.id);
            }
            
            if (metaObj.children && Array.isArray(metaObj.children)) {
              metaObj.children.forEach((child: any) => {
                const childMeta = typeof child === 'string' 
                  ? viewerInstance.metaScene.metaObjects[child]
                  : child;
                  
                if (childMeta) {
                  collectChildren(childMeta);
                }
              });
            }
          };
          
          collectChildren(assemblyParent);
        }
        
        // If still no objects found, just select the clicked object
        if (assemblyObjectIds.length === 0) {
          assemblyObjectIds.push(entity.id);
        }
        
        console.log("Assembly parent:", assemblyParent);
        console.log("Assembly object IDs to select:", assemblyObjectIds);
        
        // Highlight all objects in the assembly
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
  }, []);

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
