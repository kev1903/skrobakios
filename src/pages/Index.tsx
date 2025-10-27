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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const measurementClickCount = useRef<number>(0);
  const firstPoint = useRef<{ entity: any; worldPos: number[] } | null>(null);

  const handleViewerReady = useCallback((viewerInstance: Viewer, loaderInstance: WebIFCLoaderPlugin) => {
    const distanceMeasurements = new DistanceMeasurementsPlugin(viewerInstance, {
      defaultVisible: true,
      defaultColor: "#2D3748",
      zIndex: 10000,
      defaultLabelsOnWires: true
    });

    setMeasurePlugin(distanceMeasurements);
    setViewer(viewerInstance);
    setIfcLoader(loaderInstance);
  }, []);

  const handleUpload = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !viewer || !ifcLoader) return;

    if (loadedModel) loadedModel.destroy();

    const loadingToast = toast.loading("Loading IFC model...");
    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) return;

      try {
        const model = ifcLoader.load({
          id: file.name,
          ifc: arrayBuffer,
          edges: true,
          excludeTypes: ["IfcSpace"]
        });

        model.on("loaded", () => {
          toast.dismiss(loadingToast);
          toast.success(`Model loaded successfully`);
          setLoadedModel(model);
          setTimeout(() => viewer.cameraFlight.flyTo({ aabb: viewer.scene.aabb, duration: 1 }), 200);
        });
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Failed to load model");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 top-[var(--header-height)] w-full flex flex-col overflow-hidden bg-background p-4 gap-4">
      <input ref={fileInputRef} type="file" accept=".ifc" onChange={handleFileChange} className="hidden" />
      
      <div className="glass-panel rounded-2xl px-6 py-3 z-10 flex-shrink-0 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
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

      <div className="flex-1 flex overflow-hidden relative gap-4 min-h-0">
        <div className="w-80 glass-panel flex-shrink-0 z-10 rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <ObjectTree model={loadedModel} ifcLoader={ifcLoader} />
        </div>
        <div className="flex-1 relative overflow-hidden">
          <ViewerCanvas onViewerReady={handleViewerReady} />
        </div>
        <div className="w-80 glass-panel flex-shrink-0 z-10 rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <PropertiesPanel selectedObject={selectedObject} />
        </div>
      </div>
    </div>
  );
};

export default IFCViewerPage;
