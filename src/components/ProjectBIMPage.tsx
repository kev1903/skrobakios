import { useState, useCallback, useRef, useEffect } from "react";
import { Viewer, WebIFCLoaderPlugin, DistanceMeasurementsPlugin } from "@xeokit/xeokit-sdk";
import { ViewerCanvas } from "@/components/Viewer/ViewerCanvas";
import { ViewerToolbar } from "@/components/Viewer/ViewerToolbar";
import { ObjectTree } from "@/components/Viewer/ObjectTree";
import { PropertiesPanel } from "@/components/Viewer/PropertiesPanel";
import { CommentDialog } from "@/components/Viewer/CommentDialog";
import { CommentMarker } from "@/components/Viewer/CommentMarker";
import { CommentsList } from "@/components/Viewer/CommentsList";
import { useIfcComments } from "@/hooks/useIfcComments";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ProjectBIMPageProps {
  project: any;
  onNavigate: (page: string) => void;
}

export const ProjectBIMPage = ({ project, onNavigate }: ProjectBIMPageProps) => {
  const { currentCompany } = useCompany();
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [activeMode, setActiveMode] = useState<"select" | "measure" | "pan" | "comment">("select");
  const activeModeRef = useRef<"select" | "measure" | "pan" | "comment">("select");
  const [loadedModels, setLoadedModels] = useState<Map<string, any>>(new Map()); // Map of modelDbId -> model instance
  const [visibleModels, setVisibleModels] = useState<Set<string>>(new Set()); // Set of visible modelDbIds
  const [loadedModelDbId, setLoadedModelDbId] = useState<string | null>(null); // For comments, tracks active model
  const [ifcLoader, setIfcLoader] = useState<WebIFCLoaderPlugin | null>(null);
  const [measurePlugin, setMeasurePlugin] = useState<DistanceMeasurementsPlugin | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [isStructureCollapsed, setIsStructureCollapsed] = useState(true);
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(true);
  const [isStructurePinned, setIsStructurePinned] = useState(false);
  const [isPropertiesPinned, setIsPropertiesPinned] = useState(false);
  const [savedModels, setSavedModels] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [viewStateLoaded, setViewStateLoaded] = useState(false);
  
  
  // Dialog states
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; modelId: string; currentName: string }>({ open: false, modelId: '', currentName: '' });
  const [newModelName, setNewModelName] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; modelId: string; fileName: string }>({ open: false, modelId: '', fileName: '' });
  const [replaceModelId, setReplaceModelId] = useState<string | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [pendingCommentData, setPendingCommentData] = useState<{
    objectId?: string;
    position?: { x: number; y: number; z: number };
  } | null>(null);

  // Comments
  const { comments, addComment: addIfcComment, deleteComment, loadComments } = useIfcComments(
    project?.id,
    loadedModelDbId || undefined
  );

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

  // Helper: Find the top-level parent of an assembly (traverse up the parent chain)
  const findAssemblyRoot = useCallback((metaObject: any): any => {
    if (!metaObject) return null;
    
    // Traverse up to find a meaningful parent that represents the assembly
    // Stop at IfcBuildingElementPart, IfcElementAssembly, or other assembly types
    let current = metaObject;
    let potentialRoot = metaObject;
    
    while (current.parent) {
      const parentType = current.parent.type;
      
      // If parent is a spatial structure (building, storey, etc.), stop here
      if (parentType && (
        parentType.includes('IfcBuilding') ||
        parentType.includes('IfcSite') ||
        parentType.includes('IfcStorey') ||
        parentType.includes('IfcSpace')
      )) {
        break;
      }
      
      potentialRoot = current.parent;
      current = current.parent;
    }
    
    return potentialRoot;
  }, []);

  // Helper: Collect all entity IDs in the assembly subtree
  const collectAssemblyEntities = useCallback((metaObject: any, viewerInstance: Viewer): string[] => {
    if (!metaObject) return [];
    
    // Find the assembly root
    const assemblyRoot = findAssemblyRoot(metaObject);
    
    if (!assemblyRoot) {
      return viewerInstance.scene.objects[metaObject.id] ? [metaObject.id] : [];
    }
    
    // Use xeokit's built-in method to get all IDs in the subtree
    const objectIds = assemblyRoot.getObjectIDsInSubtree?.() || [];
    
    // Filter to only include renderable objects
    const renderableIds = objectIds.filter((id: string) => viewerInstance.scene.objects[id]);
    
    console.log('🔍 Assembly selection:', {
      clickedObject: metaObject.id,
      clickedType: metaObject.type,
      assemblyRoot: assemblyRoot.id,
      assemblyRootType: assemblyRoot.type,
      totalInSubtree: objectIds.length,
      renderableObjects: renderableIds.length
    });
    
    return renderableIds;
  }, [findAssemblyRoot]);

  const handleViewerReady = useCallback((viewerInstance: Viewer, loaderInstance: WebIFCLoaderPlugin) => {
    const distanceMeasurements = new DistanceMeasurementsPlugin(viewerInstance, {
      defaultVisible: true,
      defaultColor: "#3B82F6",
      defaultLabelsOnWires: true,
      zIndex: 10000
    });
    
    // Listen for measurement creation and override label to show millimeters
    distanceMeasurements.on("measurementCreated", (measurement: any) => {
      measurement.axisVisible = false; // Hide axes to prevent overlap
      
      // Override the label's setText method to always convert meters to millimeters
      if (measurement.label) {
        const originalSetText = measurement.label.setText.bind(measurement.label);
        measurement.label.setText = function(text: string) {
          // Extract numeric value from the text (e.g., "~ 0.10m" -> 0.10)
          const match = text.match(/[\d.]+/);
          if (match) {
            const valueInMeters = parseFloat(match[0]);
            const valueInMm = (valueInMeters * 1000).toFixed(0);
            const prefix = text.includes('~') ? '~ ' : '';
            return originalSetText(`${prefix}${valueInMm}mm`);
          }
          return originalSetText(text);
        };
      }
    });

    // Set up click event for assembly-based object selection and comment placement
    viewerInstance.scene.input.on("mouseclicked", (coords: number[]) => {
      const hit = viewerInstance.scene.pick({
        canvasPos: coords,
        pickSurface: true
      });

      // Check if we're in comment mode
      if (activeModeRef.current === "comment") {
        if (hit && hit.worldPos) {
          // Store the clicked position and object for comment
          const commentData = {
            objectId: hit.entity?.id ? String(hit.entity.id) : undefined,
            position: {
              x: hit.worldPos[0],
              y: hit.worldPos[1],
              z: hit.worldPos[2]
            }
          };
          setPendingCommentData(commentData);
          setCommentDialogOpen(true);
          // Stay in comment mode
        }
        return;
      }

      // Skip selection when in measurement mode
      if (activeModeRef.current === "measure") {
        return;
      }

      // Normal selection behavior for other modes
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

        if (metaObject.attributes) {
          properties.attributes = metaObject.attributes;
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

  // Save view state to localStorage
  const saveViewState = useCallback((cameraState?: any, visibleModelIds?: string[]) => {
    if (!project?.id) return;
    
    const viewState = {
      camera: cameraState || (viewer?.scene?.camera ? {
        eye: (viewer.scene.camera as any).eye,
        look: (viewer.scene.camera as any).look,
        up: (viewer.scene.camera as any).up
      } : null),
      visibleModels: visibleModelIds || Array.from(visibleModels),
      timestamp: Date.now()
    };
    
    localStorage.setItem(`bim-view-${project.id}`, JSON.stringify(viewState));
    console.log('💾 Saved view state:', viewState);
  }, [project?.id, viewer, visibleModels]);

  // Load view state from localStorage
  const loadViewState = useCallback(() => {
    if (!project?.id || !viewer) return null;
    
    const stored = localStorage.getItem(`bim-view-${project.id}`);
    if (stored) {
      try {
        const viewState = JSON.parse(stored);
        console.log('📂 Loaded view state:', viewState);
        return viewState;
      } catch (error) {
        console.error('Error parsing view state:', error);
      }
    }
    return null;
  }, [project?.id, viewer]);

  // Restore view state after models are loaded
  useEffect(() => {
    if (!viewer || !ifcLoader || viewStateLoaded || savedModels.length === 0) return;
    
    const viewState = loadViewState();
    if (viewState && viewState.visibleModels && viewState.visibleModels.length > 0) {
      console.log('🔄 Restoring view state...');
      
      // Load models that were visible
      const loadPromises = viewState.visibleModels.map(async (modelId: string) => {
        const modelData = savedModels.find(m => m.id === modelId);
        if (modelData && !loadedModels.has(modelId)) {
          return loadModelFromStorage(modelData.file_path, modelData.file_name, modelData.id, true);
        }
        return Promise.resolve();
      });
      
      Promise.all(loadPromises).then(() => {
        // Restore camera position after all models are loaded
        if (viewState.camera && viewer.scene?.camera) {
          setTimeout(() => {
            const camera = viewer.scene.camera as any;
            camera.eye = viewState.camera.eye;
            camera.look = viewState.camera.look;
            camera.up = viewState.camera.up;
            console.log('📷 Camera position restored');
          }, 500);
        }
        setViewStateLoaded(true);
      });
    } else {
      setViewStateLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer, ifcLoader, savedModels, loadViewState, viewStateLoaded, loadedModels]);

  // Save camera position when it changes
  useEffect(() => {
    if (!viewer || !viewStateLoaded) return;
    
    const camera = viewer.scene?.camera as any;
    if (!camera) return;
    
    let saveTimeout: NodeJS.Timeout;
    const handleCameraChange = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveViewState();
      }, 1000); // Save 1 second after camera stops moving
    };
    
    camera.on('viewMatrix', handleCameraChange);
    
    return () => {
      clearTimeout(saveTimeout);
      camera.off('viewMatrix', handleCameraChange);
    };
  }, [viewer, saveViewState, viewStateLoaded]);

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

  const handleModelRename = (modelId: string, currentName: string) => {
    setRenameDialog({ open: true, modelId, currentName });
    setNewModelName(currentName);
  };

  const handleModelReplace = (modelId: string) => {
    setReplaceModelId(modelId);
    replaceFileInputRef.current?.click();
  };

  const handleModelDelete = (modelId: string, fileName: string) => {
    setDeleteDialog({ open: true, modelId, fileName });
  };

  const confirmRename = async () => {
    if (!newModelName.trim()) {
      toast.error('Model name cannot be empty');
      return;
    }

    try {
      const { error } = await supabase
        .from('ifc_models')
        .update({ file_name: newModelName.trim() })
        .eq('id', renameDialog.modelId);

      if (error) throw error;

      // Update local state
      setSavedModels(prev => prev.map(m => 
        m.id === renameDialog.modelId ? { ...m, file_name: newModelName.trim() } : m
      ));

      toast.success('Model renamed successfully');
      setRenameDialog({ open: false, modelId: '', currentName: '' });
      setNewModelName('');
    } catch (error: any) {
      console.error('Error renaming model:', error);
      toast.error(`Failed to rename model: ${error.message}`);
    }
  };

  const confirmDelete = async () => {
    try {
      const modelToDelete = savedModels.find(m => m.id === deleteDialog.modelId);
      if (!modelToDelete) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('ifc-models')
        .remove([modelToDelete.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('ifc_models')
        .delete()
        .eq('id', deleteDialog.modelId);

      if (dbError) throw dbError;

      // Update local state
      setSavedModels(prev => prev.filter(m => m.id !== deleteDialog.modelId));

      // If this was a loaded model, remove it from loaded models
      const model = loadedModels.get(deleteDialog.modelId);
      if (model) {
        try {
          if (model.destroyed === false) {
            model.destroy();
          }
        } catch (destroyError) {
          console.warn("Error destroying model during delete:", destroyError);
        }
        setLoadedModels(prev => {
          const newMap = new Map(prev);
          newMap.delete(deleteDialog.modelId);
          return newMap;
        });
        setVisibleModels(prev => {
          const newSet = new Set(prev);
          newSet.delete(deleteDialog.modelId);
          return newSet;
        });
      }

      toast.success('Model deleted successfully');
      setDeleteDialog({ open: false, modelId: '', fileName: '' });
    } catch (error: any) {
      console.error('Error deleting model:', error);
      toast.error(`Failed to delete model: ${error.message}`);
    }
  };

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

  const loadModelFromStorage = useCallback(async (filePath: string, fileName: string, modelDbId?: string, skipFlyTo?: boolean) => {
    if (!viewer || !ifcLoader || !modelDbId) return;

    // Check if model is already loaded
    if (loadedModels.has(modelDbId)) {
      // Model already loaded, just toggle visibility will be handled by the eye icon
      toast.info(`Model ${fileName} is already loaded`);
      return;
    }

    const loadingToast = toast.loading(`Loading ${fileName}...`);

    try {
      // Download file from storage
      const { data, error } = await supabase.storage
        .from('ifc-models')
        .download(filePath);

      if (error) throw error;

      // Convert blob to array buffer
      const arrayBuffer = await data.arrayBuffer();

      const model = ifcLoader.load({
        id: fileName,
        ifc: arrayBuffer,
        edges: true,
        excludeTypes: ["IfcSpace"]
      });

      model.on("loaded", () => {
        toast.dismiss(loadingToast);
        toast.success(`Model loaded: ${fileName}`);
        
        // Wait a bit for objects to populate in the scene
        setTimeout(() => {
          // Add to loaded models
          setLoadedModels(prev => {
            const newMap = new Map(prev);
            newMap.set(modelDbId, model);
            return newMap;
          });

          // Make visible
          setVisibleModels(prev => {
            const newSet = new Set([...prev, modelDbId]);
            saveViewState(undefined, Array.from(newSet));
            return newSet;
          });
          setLoadedModelDbId(modelDbId);
          
          // Fly to show all visible models (unless restoring view state)
          if (!skipFlyTo) {
            setTimeout(() => {
              if (viewer?.scene?.aabb) {
                viewer.cameraFlight.flyTo({ 
                  aabb: viewer.scene.aabb, 
                  duration: 1 
                });
                saveViewState();
              }
            }, 300);
          }
        }, 200);
      });

      model.on("error", (error: any) => {
        toast.dismiss(loadingToast);
        toast.error(`Failed to load model: ${error.message || "Unknown error"}`);
        console.error("Model loading error:", error);
      });
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Failed to load model: ${error.message}`);
      console.error("Error in loadModelFromStorage:", error);
    }
  }, [viewer, ifcLoader, loadedModels, saveViewState]);

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

  const handleReplaceFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !replaceModelId) return;

    try {
      const modelToReplace = savedModels.find(m => m.id === replaceModelId);
      if (!modelToReplace) return;

      const replacingToast = toast.loading('Replacing model...');

      // Delete old file from storage
      const { error: deleteError } = await supabase.storage
        .from('ifc-models')
        .remove([modelToReplace.file_path]);

      if (deleteError) {
        console.warn('Warning: Could not delete old file:', deleteError);
      }

      // Upload new file
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${currentCompany.id}/${project.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ifc-models')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Update database record
      const { error: updateError } = await supabase
        .from('ifc_models')
        .update({
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          metadata: {
            original_name: file.name,
            mime_type: file.type,
            upload_date: new Date().toISOString(),
            replaced_at: new Date().toISOString()
          }
        })
        .eq('id', replaceModelId);

      if (updateError) throw updateError;

      // Update local state
      setSavedModels(prev => prev.map(m => 
        m.id === replaceModelId 
          ? { ...m, file_name: file.name, file_path: filePath, file_size: file.size }
          : m
      ));

      toast.dismiss(replacingToast);
      toast.success('Model replaced successfully');

      // If this was a loaded model, reload it
      const model = loadedModels.get(replaceModelId);
      if (model) {
        try {
          if (model.destroyed === false) {
            model.destroy();
          }
        } catch (destroyError) {
          console.warn("Error destroying model during replace:", destroyError);
        }
        setLoadedModels(prev => {
          const newMap = new Map(prev);
          newMap.delete(replaceModelId);
          return newMap;
        });
        setVisibleModels(prev => {
          const newSet = new Set(prev);
          newSet.delete(replaceModelId);
          return newSet;
        });
        
        // Load the new model
        await loadModelFromStorage(filePath, file.name, replaceModelId);
      }

      // Clear states
      setReplaceModelId(null);
      event.target.value = '';
    } catch (error: any) {
      console.error('Error replacing model:', error);
      toast.error(`Failed to replace model: ${error.message}`);
      setReplaceModelId(null);
      event.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 top-[var(--header-height)] w-full flex overflow-hidden bg-background">
      <input ref={fileInputRef} type="file" accept=".ifc" onChange={handleFileChange} className="hidden" />
      <input ref={replaceFileInputRef} type="file" accept=".ifc" onChange={handleReplaceFileChange} className="hidden" />
      
      {/* Comment Dialog */}
      <CommentDialog
        open={commentDialogOpen}
        onOpenChange={(open) => {
          setCommentDialogOpen(open);
          if (!open) {
            setPendingCommentData(null);
          }
        }}
        selectedObject={pendingCommentData?.objectId}
        position={pendingCommentData?.position}
        onSave={async (comment) => {
          if (!currentCompany?.id || !project?.id) {
            toast.error('Company or project not found');
            return;
          }

          try {
            // Save the comment
            const savedComment = await addIfcComment({
              project_id: project.id,
              company_id: currentCompany.id,
              ifc_model_id: loadedModelDbId || undefined,
              object_id: comment.objectId,
              position: comment.position,
              comment: comment.text,
              user_name: comment.userName,
            });

            // Save mentions if any
            if (comment.mentionedUserIds && comment.mentionedUserIds.length > 0 && savedComment) {
              const { data: { user } } = await supabase.auth.getUser();
              
              // Insert mentions
              const mentionInserts = comment.mentionedUserIds.map(userId => ({
                comment_id: savedComment.id,
                mentioned_user_id: userId
              }));

              const { error: mentionError } = await supabase
                .from('comment_mentions')
                .insert(mentionInserts);

              if (mentionError) {
                console.error('Error saving mentions:', mentionError);
              }

              // Create notifications for mentioned users
              const notificationInserts = comment.mentionedUserIds.map(userId => ({
                user_id: userId,
                type: 'comment_mention',
                title: 'You were mentioned in a comment',
                message: `${comment.userName} mentioned you in a comment: "${comment.text.substring(0, 100)}${comment.text.length > 100 ? '...' : ''}"`,
                related_id: savedComment.id,
                read: false
              }));

              const { error: notifError } = await supabase
                .from('notifications')
                .insert(notificationInserts);

              if (notifError) {
                console.error('Error creating notifications:', notifError);
              }
            }

            toast.success('Comment added successfully');
            setCommentDialogOpen(false);
            setPendingCommentData(null);
          } catch (error) {
            console.error('Error saving comment:', error);
            toast.error('Failed to save comment');
          }
        }}
      />

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => !open && setRenameDialog({ open: false, modelId: '', currentName: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Model</DialogTitle>
            <DialogDescription>
              Enter a new name for the model
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="modelName">Model Name</Label>
              <Input
                id="modelName"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="Enter model name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmRename();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog({ open: false, modelId: '', currentName: '' })}>
              Cancel
            </Button>
            <Button onClick={confirmRename}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, modelId: '', fileName: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.fileName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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
            onMeasure={() => {
              if (measurePlugin) {
                measurePlugin.control.activate();
              }
            }}
            onClearMeasurements={() => {
              if (measurePlugin) {
                measurePlugin.clear();
                toast.success("All measurements cleared");
              }
            }}
            activeMode={activeMode}
            onModeChange={(mode) => {
              setActiveMode(mode);
              activeModeRef.current = mode;
              
              // Handle measurement mode
              if (mode === "measure" && measurePlugin) {
                measurePlugin.control.activate();
                toast.info("Click to start measuring. Cursor will snap to vertices and edges.");
              } else if (measurePlugin) {
                measurePlugin.control.deactivate();
              }
              
              if (mode === "comment") {
                toast.info("Click on the model to place your comment");
              }
            }}
            onBack={() => onNavigate(`project-detail?projectId=${project?.id}`)}
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
              loadedModels={loadedModels}
              visibleModels={visibleModels}
              ifcLoader={ifcLoader}
              viewer={viewer}
              isPinned={isStructurePinned}
              onPinToggle={() => setIsStructurePinned(!isStructurePinned)}
              savedModels={savedModels}
              onModelLoad={loadModelFromStorage}
              onModelToggleVisibility={(modelDbId) => {
                const model = loadedModels.get(modelDbId);
                if (!model || !viewer) return;

                try {
                  setVisibleModels(prev => {
                    const newSet = new Set(prev);
                    const isVisible = newSet.has(modelDbId);
                    
                    // Check if model is destroyed or not ready
                    if (model.destroyed || !model.scene) {
                      console.warn('Model not ready for visibility toggle');
                      return prev;
                    }
                    
                    if (isVisible) {
                      newSet.delete(modelDbId);
                      // Hide the model using xeokit's built-in method
                      model.visible = false;
                      toast.success("Model hidden");
                    } else {
                      newSet.add(modelDbId);
                      // Show the model using xeokit's built-in method
                      model.visible = true;
                      toast.success("Model shown");
                    }
                    
                    // Save view state after visibility change
                    saveViewState(undefined, Array.from(newSet));
                    return newSet;
                  });
                  setLoadedModelDbId(modelDbId);
                } catch (error) {
                  console.error('Error toggling model visibility:', error);
                  toast.error('Failed to toggle model visibility');
                }
              }}
              onModelRename={handleModelRename}
              onModelReplace={handleModelReplace}
              onModelDelete={handleModelDelete}
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
            <div className={`h-full w-full ${activeMode === "comment" ? "cursor-crosshair" : ""}`}>
              <ViewerCanvas onViewerReady={handleViewerReady} />
            </div>
            
            {/* Comment Markers */}
            {viewer && comments.map(comment => (
              <CommentMarker
                key={comment.id}
                comment={comment}
                viewer={viewer}
                onDelete={async (commentId) => {
                  try {
                    await deleteComment(commentId);
                    toast.success('Comment deleted');
                  } catch (error) {
                    console.error('Error deleting comment:', error);
                    toast.error('Failed to delete comment');
                  }
                }}
                onSelect={(comment) => {
                  console.log('Comment selected:', comment);
                  if (comment.object_id && viewer) {
                    const entity = viewer.scene.objects[comment.object_id];
                    if (entity) {
                      viewer.scene.setObjectsSelected(viewer.scene.selectedObjectIds, false);
                      viewer.scene.setObjectsSelected([comment.object_id], true);
                    }
                  }
                }}
              />
            ))}
          </div>
          
          {/* Comments List Panel (shows when comment mode is active) */}
          {activeMode === "comment" && (
            <div className="absolute right-0 top-0 bottom-0 w-80 flex-shrink-0 z-10">
              <CommentsList
                comments={comments}
                onCommentSelect={(comment) => {
                  console.log('Comment selected from list:', comment);
                  if (comment.object_id && viewer) {
                    const entity = viewer.scene.objects[comment.object_id];
                    if (entity) {
                      viewer.scene.setObjectsSelected(viewer.scene.selectedObjectIds, false);
                      viewer.scene.setObjectsSelected([comment.object_id], true);
                    }
                  }
                  // Zoom to comment position if available
                  if (comment.position && viewer) {
                    viewer.cameraFlight.flyTo({
                      eye: [
                        comment.position.x + 5,
                        comment.position.y + 5,
                        comment.position.z + 5
                      ],
                      look: [comment.position.x, comment.position.y, comment.position.z],
                      up: [0, 0, 1],
                      duration: 1.0
                    });
                  }
                }}
                onClose={() => setActiveMode("select")}
              />
            </div>
          )}

          {/* Properties Panel (shows when not in comment mode) */}
          {activeMode !== "comment" && (
            <div 
              className={`absolute right-0 top-0 bottom-0 glass-panel flex-shrink-0 z-10 overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ${
                isPropertiesCollapsed ? 'w-0 opacity-0' : 'w-80 opacity-100'
              }`}
            >
              <PropertiesPanel 
                selectedObject={selectedObject}
                isPinned={isPropertiesPinned}
                onPinToggle={() => setIsPropertiesPinned(!isPropertiesPinned)}
                viewer={viewer}
                onElementSelect={(elementId) => {
                  if (!viewer) return;
                  
                  const metaObject = viewer.metaScene.metaObjects[elementId] as any;
                  if (!metaObject) return;
                  
                  // Collect assembly entities
                  const assemblyObjectIds = collectAssemblyEntities(metaObject, viewer);
                  
                  // Select the assembly
                  viewer.scene.setObjectsSelected(viewer.scene.selectedObjectIds, false);
                  viewer.scene.setObjectsSelected(assemblyObjectIds, true);
                  
                  // Create properties object
                  const entity = viewer.scene.objects[elementId];
                  const properties: any = {
                    id: String(metaObject.id),
                    type: metaObject.type || "Unknown",
                    name: metaObject.name || String(metaObject.id),
                    assemblyObjectCount: assemblyObjectIds.length,
                    isObject: entity?.isObject,
                    isEntity: entity?.isEntity,
                    visible: entity?.visible,
                    xrayed: entity?.xrayed,
                    highlighted: entity?.highlighted,
                    selected: entity?.selected,
                    colorize: entity?.colorize,
                    opacity: entity?.opacity,
                  };

                  if (metaObject.propertySets && Array.isArray(metaObject.propertySets)) {
                    properties.propertySets = metaObject.propertySets.map((ps: any) => ({
                      name: ps.name || ps.type || 'Property Set',
                      type: ps.type,
                      properties: ps.properties || {}
                    }));
                  }

                  if (metaObject.attributes) {
                    properties.attributes = metaObject.attributes;
                  }

                  setSelectedObject(properties);
                  setIsPropertiesCollapsed(false);
                }}
              />
            </div>
          )}
          
          {/* Toggle Button for Properties (hide when in comment mode) */}
          {activeMode !== "comment" && (
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
          )}
        </div>
      </div>
    </div>
  );
};
