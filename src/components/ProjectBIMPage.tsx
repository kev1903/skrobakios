import { useState, useCallback, useRef, useEffect } from "react";
import { Viewer, WebIFCLoaderPlugin, DistanceMeasurementsPlugin } from "@xeokit/xeokit-sdk";
import { ViewerCanvas } from "@/components/Viewer/ViewerCanvas";
import { ViewerToolbar } from "@/components/Viewer/ViewerToolbar";
import { ObjectTree } from "@/components/Viewer/ObjectTree";
import { PropertiesPanel } from "@/components/Viewer/PropertiesPanel";
import { toast } from "sonner";

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
  const [nameProperty] = useState<string>("id");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const measurementClickCount = useRef<number>(0);
  const firstPoint = useRef<{ entity: any; worldPos: number[] } | null>(null);

  const handleViewerReady = useCallback((viewerInstance: Viewer, loaderInstance: WebIFCLoaderPlugin) => {
    const distanceMeasurements = new DistanceMeasurementsPlugin(viewerInstance, {
      defaultVisible: true,
      defaultOriginVisible: true,
      defaultTargetVisible: true,
      defaultWireVisible: true,
      defaultAxisVisible: true,
      defaultColor: "#2D3748",
      zIndex: 10000,
      defaultLabelsOnWires: true
    });
    
    const originalUpdate = (distanceMeasurements as any)._onSceneTick;
    (distanceMeasurements as any)._onSceneTick = function(...args: any[]) {
      if (originalUpdate) originalUpdate.apply(this, args);
      
      Object.values(distanceMeasurements.measurements).forEach((measurement: any) => {
        if (measurement && measurement.length !== undefined) {
          const distanceInMM = measurement.length * 1000;
          if (measurement._label) {
            measurement._label.text = `${distanceInMM.toFixed(4)} mm`;
          }
        }
      });
    };
    
    setMeasurePlugin(distanceMeasurements);
    setViewer(viewerInstance);
    setIfcLoader(loaderInstance);
  }, []);

  const handleZoomIn = () => {
    if (viewer) {
      const camera = viewer.scene.camera;
      const eye = camera.eye;
      const look = camera.look;
      const eyeLookVec = [look[0] - eye[0], look[1] - eye[1], look[2] - eye[2]];
      const dist = Math.sqrt(eyeLookVec[0] ** 2 + eyeLookVec[1] ** 2 + eyeLookVec[2] ** 2);
      const newDist = dist * 0.8;
      const normVec = eyeLookVec.map(v => v / dist);
      camera.eye = [
        look[0] - normVec[0] * newDist,
        look[1] - normVec[1] * newDist,
        look[2] - normVec[2] * newDist,
      ];
    }
  };

  const handleZoomOut = () => {
    if (viewer) {
      const camera = viewer.scene.camera;
      const eye = camera.eye;
      const look = camera.look;
      const eyeLookVec = [look[0] - eye[0], look[1] - eye[1], look[2] - eye[2]];
      const dist = Math.sqrt(eyeLookVec[0] ** 2 + eyeLookVec[1] ** 2 + eyeLookVec[2] ** 2);
      const newDist = dist * 1.2;
      const normVec = eyeLookVec.map(v => v / dist);
      camera.eye = [
        look[0] - normVec[0] * newDist,
        look[1] - normVec[1] * newDist,
        look[2] - normVec[2] * newDist,
      ];
    }
  };

  const handleFitView = () => {
    if (viewer) {
      viewer.cameraFlight.flyTo({
        aabb: viewer.scene.aabb,
        duration: 0.5,
      });
      toast.success("View fitted to model");
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension !== 'ifc') {
      toast.error("Please upload an IFC file");
      return;
    }
    
    if (!viewer || !ifcLoader) {
      toast.error("Viewer not initialized. Please wait and try again.");
      return;
    }

    if (loadedModel) {
      loadedModel.destroy();
    }

    const loadingToast = toast.loading("Loading IFC model... This may take a moment");
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      
      if (!arrayBuffer) {
        toast.dismiss(loadingToast);
        toast.error("Failed to read file");
        return;
      }

      try {
        const fileId = file.name;
        
        const model = ifcLoader.load({
          id: fileId,
          ifc: arrayBuffer,
          edges: true,
          excludeTypes: ["IfcSpace"]
        });

        model.on("loaded", () => {
          toast.dismiss(loadingToast);
          toast.success(`Model "${file.name}" loaded successfully`);
          
          setLoadedModel(model);
          
          setTimeout(() => {
            viewer.cameraFlight.flyTo({
              aabb: viewer.scene.aabb,
              duration: 1,
            });
          }, 200);
        });

        model.on("error", (error: any) => {
          toast.dismiss(loadingToast);
          toast.error("Failed to load model: " + (error?.message || "Unknown error"));
        });
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Failed to load model: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    };
    
    reader.onerror = () => {
      toast.dismiss(loadingToast);
      toast.error("Failed to read file");
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleMeasure = () => {
    if (activeMode === "measure") {
      if (measurePlugin) {
        measurePlugin.clear();
      }
      measurementClickCount.current = 0;
      firstPoint.current = null;
      setActiveMode("select");
      toast.info("Measurement mode disabled");
    } else {
      setActiveMode("measure");
      toast.info("Click two points to measure distance");
    }
  };

  useEffect(() => {
    if (!viewer || !measurePlugin) return;

    const handleCanvasClick = (event: any) => {
      const pickResult = viewer.scene.pick({
        canvasPos: [event.offsetX, event.offsetY],
        pickSurface: true
      });

      if (activeMode === "select" && pickResult && pickResult.entity) {
        let entity = pickResult.entity;
        let entityId = String(entity.id || "");
        
        const metaModels = (viewer.metaScene as any).metaModels || {};
        const metaModelIds = Object.keys(metaModels);
        const metaModel = metaModelIds.length > 0 ? metaModels[metaModelIds[0]] : null;
        
        let assemblyEntityIds = [entityId];
        
        if (metaModel) {
          let metaObject = (metaModel as any).metaObjects?.[entityId];
          
          if (metaObject) {
            let currentMeta = metaObject;
            let assemblyMeta = null;
            let depth = 0;
            
            while (currentMeta && depth < 10) {
              const currentType = currentMeta.type || "";
              
              if (currentType === "IfcElementAssembly") {
                assemblyMeta = currentMeta;
                break;
              }
              
              const parentRef = currentMeta.parent;
              if (parentRef) {
                if (typeof parentRef === 'object' && parentRef.id) {
                  currentMeta = parentRef;
                  depth++;
                } else {
                  const parentId = typeof parentRef === 'string' ? parentRef : String(parentRef);
                  const parentMeta = (metaModel as any).metaObjects?.[parentId];
                  if (parentMeta) {
                    currentMeta = parentMeta;
                    depth++;
                  } else {
                    break;
                  }
                }
              } else {
                break;
              }
            }
            
            if (assemblyMeta) {
              assemblyEntityIds = [];
              
              const collectAllChildren = (parentId: string) => {
                Object.entries((metaModel as any).metaObjects || {}).forEach(([id, obj]: [string, any]) => {
                  const objParentId = typeof obj.parent === 'object' && obj.parent?.id 
                    ? obj.parent.id 
                    : (typeof obj.parent === 'string' ? obj.parent : String(obj.parent || ''));
                  
                  if (objParentId === parentId) {
                    assemblyEntityIds.push(id);
                    collectAllChildren(id);
                  }
                });
              };
              
              assemblyEntityIds.push(assemblyMeta.id);
              collectAllChildren(assemblyMeta.id);
            }
          }
        }
        
        viewer.scene.setObjectsSelected(viewer.scene.selectedObjectIds, false);
        viewer.scene.setObjectsSelected(assemblyEntityIds, true);
        
        let displayEntityId = entityId;
        let displayEntity = entity;
        let displayMetaObject = null;
        
        if (metaModel) {
          const clickedMetaObject = (metaModel as any).metaObjects?.[entityId];
          if (clickedMetaObject) {
            let currentMeta = clickedMetaObject;
            let assemblyMeta = null;
            let depth = 0;
            
            while (currentMeta && depth < 10) {
              const currentType = currentMeta.type || "";
              if (currentType === "IfcElementAssembly") {
                assemblyMeta = currentMeta;
                break;
              }
              
              const parentRef = currentMeta.parent;
              if (parentRef) {
                if (typeof parentRef === 'object' && parentRef.id) {
                  currentMeta = parentRef;
                  depth++;
                } else {
                  const parentId = typeof parentRef === 'string' ? parentRef : String(parentRef);
                  const parentMeta = (metaModel as any).metaObjects?.[parentId];
                  if (parentMeta) {
                    currentMeta = parentMeta;
                    depth++;
                  } else {
                    break;
                  }
                }
              } else {
                break;
              }
            }
            
            if (assemblyMeta) {
              displayEntityId = assemblyMeta.id;
              displayEntity = viewer.scene.objects[assemblyMeta.id] || entity;
              displayMetaObject = assemblyMeta;
            } else {
              displayMetaObject = clickedMetaObject;
            }
          }
        }
        
        const propertyGroups: any[] = [];
        let tagValue = "";
        let nameValue = displayEntityId;
        let typeValue = (displayEntity as any).type || "IFC Element";

        if (metaModel && displayMetaObject) {
          if (displayMetaObject.name) nameValue = displayMetaObject.name;
          if (displayMetaObject.type) typeValue = displayMetaObject.type;
          
          if (displayMetaObject.propertySets) {
            displayMetaObject.propertySets.forEach((propSet: any) => {
              if (propSet.properties && propSet.properties.length > 0) {
                propSet.properties.forEach((prop: any) => {
                  if (prop.name === "Tag" || prop.name === "TAG") {
                    tagValue = prop.value !== undefined ? String(prop.value) : "";
                  }
                });
              }
            });
          }
          
          const entityProps: any[] = [
            { name: "GUID", value: displayEntityId }
          ];
          if (displayMetaObject.type) {
            entityProps.push({ name: "IFC Element", value: displayMetaObject.type });
          }
          propertyGroups.push({
            title: "Entity Information",
            properties: entityProps
          });

          if (displayMetaObject.propertySets) {
            displayMetaObject.propertySets.forEach((propSet: any) => {
              if (propSet.properties && propSet.properties.length > 0) {
                const properties = propSet.properties.map((prop: any) => ({
                  name: prop.name || "Unknown",
                  value: prop.value !== undefined ? String(prop.value) : "N/A"
                }));
                
                propertyGroups.push({
                  title: propSet.name || "Properties",
                  properties
                });
              }
            });
          }
        } else {
          propertyGroups.push({
            title: "Entity Information",
            properties: [
              { name: "GUID", value: displayEntityId },
              { name: "Visible", value: displayEntity.visible ? "Yes" : "No" }
            ]
          });
        }
        
        setSelectedObject({
          name: nameValue,
          type: typeValue,
          tag: tagValue,
          propertyGroups
        });
        
        toast.success(`Selected: ${entityId}`);
        return;
      }

      if (activeMode !== "measure") return;

      if (pickResult && pickResult.worldPos) {
        measurementClickCount.current++;
        
        if (measurementClickCount.current === 1) {
          firstPoint.current = {
            entity: viewer.scene.objects[pickResult.entity.id],
            worldPos: [...pickResult.worldPos]
          };
          toast.info("Click second point to complete measurement");
        } else if (measurementClickCount.current === 2) {
          if (firstPoint.current) {
            const dx = pickResult.worldPos[0] - firstPoint.current.worldPos[0];
            const dy = pickResult.worldPos[1] - firstPoint.current.worldPos[1];
            const dz = pickResult.worldPos[2] - firstPoint.current.worldPos[2];
            const distanceInMeters = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const distanceInMM = distanceInMeters * 1000;
            
            const measurementId = `measurement-${Date.now()}`;
            const measurement = measurePlugin.createMeasurement({
              id: measurementId,
              origin: {
                entity: firstPoint.current.entity,
                worldPos: firstPoint.current.worldPos
              },
              target: {
                entity: viewer.scene.objects[pickResult.entity.id],
                worldPos: pickResult.worldPos
              },
              visible: true,
              originVisible: true,
              targetVisible: true,
              wireVisible: true,
              axisVisible: true,
              labelsOnWires: true,
              color: "#2D3748"
            });
            
            if (measurement && (measurement as any).label) {
              (measurement as any).label.text = `${distanceInMM.toFixed(4)} mm`;
            }
            
            toast.success(`Distance: ${distanceInMM.toFixed(4)} mm`);
          }
          measurementClickCount.current = 0;
          firstPoint.current = null;
        }
      } else {
        toast.error("Please click on the model surface");
      }
    };

    const canvas = (viewer.scene as any).canvas?.canvas;
    if (!canvas) return;

    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [viewer, measurePlugin, activeMode]);

  useEffect(() => {
    if (activeMode !== "measure") {
      measurementClickCount.current = 0;
      firstPoint.current = null;
    }
  }, [activeMode]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept=".ifc"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/5 via-background to-accent/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--luxury-gold)/0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.06),transparent_50%)]" />

      {/* Toolbar */}
      <div className="relative z-10 m-4 mb-2">
        <div className="bg-white/80 backdrop-blur-xl border border-border/30 rounded-2xl p-3 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <ViewerToolbar
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitView={handleFitView}
            onUpload={handleUpload}
            onMeasure={handleMeasure}
            activeMode={activeMode}
            onModeChange={setActiveMode}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative gap-2 px-4 pb-4">
        {/* Object Tree Sidebar */}
        <div className="w-80 flex-shrink-0 z-10">
          <div className="h-full bg-white/80 backdrop-blur-xl border border-border/30 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden">
            <ObjectTree model={loadedModel} viewer={viewer} nameProperty={nameProperty} />
          </div>
        </div>

        {/* Viewer Canvas */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <ViewerCanvas onViewerReady={handleViewerReady} />
        </div>

        {/* Properties Panel */}
        <div className="w-80 flex-shrink-0 z-10">
          <div className="h-full bg-white/80 backdrop-blur-xl border border-border/30 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden">
            <PropertiesPanel selectedObject={selectedObject} />
          </div>
        </div>
      </div>
    </div>
  );
};
