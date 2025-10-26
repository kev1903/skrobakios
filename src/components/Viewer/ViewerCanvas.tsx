import { useEffect, useRef, useState } from "react";
// Temporarily disabled due to build issues
// import { Viewer, WebIFCLoaderPlugin } from "@xeokit/xeokit-sdk";
// import * as WebIFC from "web-ifc";
import { toast } from "sonner";

// Placeholder types until xeokit is properly configured
type Viewer = any;
type WebIFCLoaderPlugin = any;

interface ViewerCanvasProps {
  onViewerReady?: (viewer: Viewer, ifcLoader: WebIFCLoaderPlugin) => void;
}

export const ViewerCanvas = ({ onViewerReady }: ViewerCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Temporarily disabled - xeokit initialization will be added once properly configured
    console.warn("ViewerCanvas: xeokit initialization temporarily disabled");
    toast.info("BIM Viewer is being configured. Please check back soon.");
    setIsLoading(false);

    /* 
    const viewer = new Viewer({
      canvasId: "xeokit-canvas",
      transparent: false,
      antialias: true,
      saoEnabled: true,
      pbrEnabled: true,
      gammaOutput: true,
      gammaFactor: 2.2,
      logarithmicDepthBufferEnabled: true,
    });

    viewer.scene.camera.eye = [-3.933, 2.855, 27.018];
    viewer.scene.camera.look = [4.400, 3.724, 8.899];
    viewer.scene.camera.up = [-0.018, 0.999, 0.039];
    viewer.scene.camera.projection = "perspective";
    
    const sao = viewer.scene.sao;
    sao.enabled = true;
    sao.numSamples = 60;
    sao.kernelRadius = 250;
    sao.intensity = 0.55;
    sao.bias = 0.1;
    sao.scale = 100.0;
    sao.minResolution = 0.0;
    sao.blendCutoff = 0.05;
    sao.blendFactor = 1.2;
    sao.blur = true;
    
    const edgeMaterial = viewer.scene.edgeMaterial;
    edgeMaterial.edges = true;
    edgeMaterial.edgeAlpha = 0.25;
    edgeMaterial.edgeColor = [0.0, 0.0, 0.0];
    edgeMaterial.edgeWidth = 1.5;
    
    const ifcAPI = new WebIFC.IfcAPI();
    ifcAPI.SetWasmPath("https://cdn.jsdelivr.net/npm/web-ifc@0.0.51/");
    
    ifcAPI.Init().then(() => {
      const ifcLoader = new WebIFCLoaderPlugin(viewer, {
        WebIFC,
        IfcAPI: ifcAPI
      });
      
      viewerRef.current = viewer;
      
      if (onViewerReady) {
        onViewerReady(viewer, ifcLoader);
      }

      setIsLoading(false);
      toast.success("IFC Viewer Ready - Upload an IFC file to begin");
    }).catch((error) => {
      console.error("Failed to initialize WebIFC:", error);
      toast.error("Failed to initialize IFC loader: " + error.message);
      setIsLoading(false);
    });

    return () => {
      viewer.destroy();
    };
    */
  }, [onViewerReady]);

  return (
    <canvas
      id="xeokit-canvas"
      ref={canvasRef}
      className="w-full h-full bg-[hsl(var(--viewer-bg))]"
    />
  );
};
