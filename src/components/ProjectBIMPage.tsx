import { useState, useCallback, useRef, useEffect } from "react";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import { ThreeIFCViewer } from "@/components/Viewer/ThreeIFCViewer";
import { ViewerToolbar } from "@/components/Viewer/ViewerToolbar";
import { ObjectTree } from "@/components/Viewer/ObjectTree";
import { PropertiesPanel } from "@/components/Viewer/PropertiesPanel";
import { toast } from "sonner";

interface ProjectBIMPageProps {
  project: any;
  onNavigate: (page: string) => void;
}

export const ProjectBIMPage = ({ project, onNavigate }: ProjectBIMPageProps) => {
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.Camera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [components, setComponents] = useState<OBC.Components | null>(null);
  const [activeMode, setActiveMode] = useState<"select" | "measure" | "pan">("select");
  const [loadedModel, setLoadedModel] = useState<THREE.Object3D | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const measurementClickCount = useRef<number>(0);
  const firstPoint = useRef<THREE.Vector3 | null>(null);
  const raycaster = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouse = useRef<THREE.Vector2>(new THREE.Vector2());

  const handleViewerReady = useCallback((
    sceneInstance: THREE.Scene,
    cameraInstance: THREE.Camera,
    rendererInstance: THREE.WebGLRenderer,
    componentsInstance: OBC.Components
  ) => {
    setScene(sceneInstance);
    setCamera(cameraInstance);
    setRenderer(rendererInstance);
    setComponents(componentsInstance);
  }, []);

  const handleZoomIn = () => {
    if (camera && camera instanceof THREE.PerspectiveCamera) {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      camera.position.add(direction.multiplyScalar(2));
    }
  };

  const handleZoomOut = () => {
    if (camera && camera instanceof THREE.PerspectiveCamera) {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      camera.position.add(direction.multiplyScalar(-2));
    }
  };

  const handleFitView = () => {
    if (loadedModel && camera && camera instanceof THREE.PerspectiveCamera) {
      const box = new THREE.Box3().setFromObject(loadedModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5; // Add some padding
      
      camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
      camera.lookAt(center);
      camera.updateProjectionMatrix();
      
      toast.success("View fitted to model");
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      console.log("No file selected");
      return;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    console.log("File selected:", file.name, "Extension:", fileExtension);
    
    if (fileExtension !== 'ifc') {
      toast.error("Please upload an IFC file");
      return;
    }
    
    if (!scene || !components || !camera) {
      console.error("Viewer not initialized", { scene: !!scene, components: !!components, camera: !!camera });
      toast.error("Viewer not initialized. Please wait and try again.");
      return;
    }

    // Clear previous model
    if (loadedModel) {
      console.log("Clearing previous model");
      scene.remove(loadedModel);
      setLoadedModel(null);
      setSelectedObject(null);
    }

    const loadingToast = toast.loading("Loading IFC model... This may take a moment");
    
    try {
      console.log("Loading IFC file:", file.name);
      
      // Get the IFC fragments manager
      const fragments = components.get(OBC.FragmentsManager);
      const fragmentIfcLoader = components.get(OBC.IfcLoader);
      
      // Load IFC file using That Open Components
      const url = URL.createObjectURL(file);
      const data = await fetch(url);
      const buffer = await data.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      const model = await fragmentIfcLoader.load(uint8Array);
      
      console.log("IFC model loaded successfully");
      console.log("Model:", model);
      
      // Add model fragments to scene
      const meshGroup = new THREE.Group();
      fragments.meshes.forEach(mesh => meshGroup.add(mesh));
      scene.add(meshGroup);
      setLoadedModel(meshGroup);
      
      // Fit camera to model
      const box = new THREE.Box3().setFromObject(meshGroup);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5;
      
      (camera as THREE.PerspectiveCamera).position.set(
        center.x + cameraZ,
        center.y + cameraZ,
        center.z + cameraZ
      );
      camera.lookAt(center);
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      
      URL.revokeObjectURL(url);
      
      toast.dismiss(loadingToast);
      toast.success(`Model "${file.name}" loaded successfully`);
      
      console.log("Model bounding box:", { center, size });
    } catch (error) {
      console.error("IFC loading error:", error);
      toast.dismiss(loadingToast);
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.error("Failed to load IFC model: " + errorMsg);
    }
  };

  const handleMeasure = () => {
    if (activeMode === "measure") {
      // Clear measurements - remove all measurement lines from scene
      if (scene) {
        const measurementObjects = scene.children.filter(child => child.name.startsWith('measurement-'));
        measurementObjects.forEach(obj => scene.remove(obj));
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
    if (!scene || !camera || !renderer || !components) return;

    const handleCanvasClick = async (event: MouseEvent) => {
      if (!renderer.domElement) return;
      
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.current.setFromCamera(mouse.current, camera);
      
      if (!loadedModel) return;
      
      const intersects = raycaster.current.intersectObject(loadedModel, true);

      if (activeMode === "select" && intersects.length > 0) {
        const intersect = intersects[0];
        const object = intersect.object;
        
        try {
          console.log("Selected object:", object);
          
          // Get basic object properties
          const propertyGroups: any[] = [];
          
          // Entity information
          const entityProps: any[] = [
            { name: "Object ID", value: object.id.toString() },
            { name: "Type", value: object.type },
            { name: "UUID", value: object.uuid }
          ];
          
          if (object.userData && Object.keys(object.userData).length > 0) {
            Object.entries(object.userData).forEach(([key, value]) => {
              entityProps.push({
                name: key,
                value: String(value)
              });
            });
          }
          
          propertyGroups.push({
            title: "Entity Information",
            properties: entityProps
          });
          
          setSelectedObject({
            name: object.name || `Object ${object.id}`,
            type: object.type || "3D Object",
            tag: "",
            propertyGroups
          });
          
          toast.success(`Selected: ${object.name || object.type}`);
        } catch (error) {
          console.error("Error getting object properties:", error);
          toast.error("Failed to get element properties");
        }
        return;
      }

      if (activeMode !== "measure") return;

      if (intersects.length > 0) {
        const point = intersects[0].point;
        measurementClickCount.current++;
        
        if (measurementClickCount.current === 1) {
          firstPoint.current = point.clone();
          toast.info("Click second point to complete measurement");
        } else if (measurementClickCount.current === 2) {
          if (firstPoint.current) {
            const distance = firstPoint.current.distanceTo(point);
            const distanceInMM = distance * 1000;
            
            // Create measurement line
            const geometry = new THREE.BufferGeometry().setFromPoints([firstPoint.current, point]);
            const material = new THREE.LineBasicMaterial({ color: 0x2D3748 });
            const line = new THREE.Line(geometry, material);
            line.name = `measurement-${Date.now()}`;
            scene.add(line);
            
            toast.success(`Distance: ${distanceInMM.toFixed(4)} mm`);
          }
          measurementClickCount.current = 0;
          firstPoint.current = null;
        }
      } else {
        toast.error("Please click on the model surface");
      }
    };

    const canvas = renderer.domElement;
    if (!canvas) return;

    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [scene, camera, renderer, components, loadedModel, activeMode]);

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
            <ObjectTree model={loadedModel} components={components} />
          </div>
        </div>

        {/* Viewer Canvas */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <ThreeIFCViewer onViewerReady={handleViewerReady} />
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
