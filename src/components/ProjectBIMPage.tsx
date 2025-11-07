import { useState, useCallback, useRef, useEffect } from "react";
import { Viewer, WebIFCLoaderPlugin, DistanceMeasurementsPlugin } from "@xeokit/xeokit-sdk";
import { ViewerCanvas } from "@/components/Viewer/ViewerCanvas";
import { ViewerToolbar } from "@/components/Viewer/ViewerToolbar";
import { ObjectTree } from "@/components/Viewer/ObjectTree";
import { PropertiesPanel } from "@/components/Viewer/PropertiesPanel";
import { toast } from "sonner";
import { ArrowLeft, Package, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface ProjectBIMPageProps {
  project: any;
  onNavigate: (page: string) => void;
}

export const ProjectBIMPage = ({ project, onNavigate }: ProjectBIMPageProps) => {
  const { currentCompany } = useCompany();
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
  const [savedModels, setSavedModels] = useState<any[]>([]);
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

  // Load saved IFC models on mount
  useEffect(() => {
    const loadSavedModels = async () => {
      if (!project?.id || !currentCompany?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('ifc_models')
          .select('*')
          .eq('project_id', project.id)
          .eq('company_id', currentCompany.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSavedModels(data || []);
      } catch (error) {
        console.error('Error loading saved models:', error);
      }
    };

    loadSavedModels();
  }, [project?.id, currentCompany?.id]);

  const handleUpload = () => fileInputRef.current?.click();

  const uploadToStorage = async (file: File) => {
    console.log('🔍 Upload to storage - Company ID:', currentCompany?.id);
    console.log('🔍 Upload to storage - Project ID:', project?.id);
    
    if (!currentCompany?.id || !project?.id) {
      const error = `Company or project not found. Company: ${currentCompany?.id}, Project: ${project?.id}`;
      console.error('❌', error);
      throw new Error(error);
    }

    const uploadToast = toast.loading("Uploading IFC file...");
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error('❌ User not authenticated');
        throw new Error('User not authenticated');
      }
      console.log('✅ User authenticated:', userData.user.id);

      // Create unique file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${currentCompany.id}/${project.id}/${timestamp}-${sanitizedFileName}`;
      console.log('📁 File path:', filePath);

      // Upload to storage
      console.log('⬆️ Uploading to storage bucket: ifc-models');
      const { error: uploadError } = await supabase.storage
        .from('ifc-models')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw uploadError;
      }
      console.log('✅ File uploaded to storage');

      // Save metadata to database
      console.log('💾 Saving metadata to database...');
      const { data: modelData, error: dbError } = await supabase
        .from('ifc_models')
        .insert({
          project_id: project.id,
          company_id: currentCompany.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          uploaded_by: userData.user.id,
          metadata: {
            original_name: file.name,
            mime_type: file.type,
            upload_date: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database insert error:', dbError);
        throw dbError;
      }
      console.log('✅ Metadata saved to database:', modelData);

      toast.dismiss(uploadToast);
      toast.success("IFC file uploaded successfully");
      
      // Refresh saved models list
      setSavedModels(prev => [modelData, ...prev]);
      
      return { filePath, modelData };
    } catch (error: any) {
      toast.dismiss(uploadToast);
      console.error('❌ Upload failed:', error);
      toast.error(`Upload failed: ${error.message}`);
      throw error;
    }
  };

  const loadModelFromStorage = async (filePath: string, fileName: string) => {
    if (!viewer || !ifcLoader) return;

    const loadingToast = toast.loading(`Loading ${fileName}...`);

    try {
      // Download file from storage
      const { data, error } = await supabase.storage
        .from('ifc-models')
        .download(filePath);

      if (error) throw error;

      // Convert blob to array buffer
      const arrayBuffer = await data.arrayBuffer();

      if (loadedModel) {
        loadedModel.destroy();
        setLoadedModel(null);
      }

      const model = ifcLoader.load({
        id: fileName,
        ifc: arrayBuffer,
        edges: true,
        excludeTypes: ["IfcSpace"]
      });

      model.on("loaded", () => {
        toast.dismiss(loadingToast);
        toast.success(`Model loaded: ${fileName}`);
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
      toast.error(`Failed to load model: ${error.message}`);
      console.error("Error loading model:", error);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !viewer || !ifcLoader) return;

    console.log('📁 File selected:', file.name, 'Size:', file.size);
    console.log('🏢 Current Company:', currentCompany?.id);
    console.log('📋 Project:', project?.id);

    // Check if we have required data
    if (!currentCompany?.id) {
      toast.error('Company information not available. Please refresh the page.');
      console.error('❌ Missing company ID');
      return;
    }

    if (!project?.id) {
      toast.error('Project information not available. Please refresh the page.');
      console.error('❌ Missing project ID');
      return;
    }

    try {
      console.log('⬆️ Starting upload to storage...');
      // Upload to storage and database
      const { filePath } = await uploadToStorage(file);
      console.log('✅ Upload successful, file path:', filePath);

      console.log('📥 Loading model from storage...');
      // Load the uploaded model
      await loadModelFromStorage(filePath, file.name);
      
      // Clear the file input
      event.target.value = '';
    } catch (error: any) {
      console.error('❌ Error handling file upload:', error);
      toast.error(`Failed to save model: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="fixed inset-0 top-[var(--header-height)] w-full flex overflow-hidden bg-background">
      <input ref={fileInputRef} type="file" accept=".ifc" onChange={handleFileChange} className="hidden" />
      
      {/* Saved Models Sidebar */}
      <div className="w-80 border-r border-border/30 bg-white/80 backdrop-blur-xl flex flex-col">
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Saved IFC Models</h3>
            <button
              onClick={() => onNavigate(`project-detail?projectId=${project?.id}`)}
              className="p-1.5 rounded-lg hover:bg-accent/50 transition-colors"
              title="Back to Project"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {savedModels.length} model{savedModels.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {savedModels.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No models uploaded yet</p>
              </div>
            ) : (
              savedModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => loadModelFromStorage(model.file_path, model.file_name)}
                  className="w-full p-3 rounded-lg border border-border/30 bg-background/60 hover:bg-accent/50 text-left transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {model.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(model.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(model.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Package className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-border/30">
          <Button onClick={handleUpload} className="w-full" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload New Model
          </Button>
        </div>
      </div>
      
      {/* Main Viewer Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
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
              savedModels={savedModels}
              onModelLoad={loadModelFromStorage}
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
    </div>
  );
};
