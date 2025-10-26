import { useEffect, useRef, useState } from "react";
import { Viewer, WebIFCLoaderPlugin } from "@xeokit/xeokit-sdk";
import * as WebIFC from "web-ifc";
import { toast } from "sonner";

interface ViewerCanvasProps {
  onViewerReady?: (viewer: Viewer, ifcLoader: WebIFCLoaderPlugin) => void;
}

export const ViewerCanvas = ({ onViewerReady }: ViewerCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("ViewerCanvas useEffect starting...");
    console.log("Canvas ref exists:", !!canvasRef.current);

    if (!canvasRef.current) {
      console.log("No canvas ref, returning");
      return;
    }

    console.log("Initializing xeokit viewer...");

    // Initialize xeokit viewer with realistic rendering
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

    // Configure realistic camera
    viewer.scene.camera.eye = [-3.933, 2.855, 27.018];
    viewer.scene.camera.look = [4.400, 3.724, 8.899];
    viewer.scene.camera.up = [-0.018, 0.999, 0.039];
    viewer.scene.camera.projection = "perspective";

    // Configure strong ambient occlusion for realistic shadows and depth
    const sao = viewer.scene.sao;
    sao.enabled = true;
    sao.numSamples = 60;            // Maximum samples for smoothest shadows
    sao.kernelRadius = 250;          // Wider radius for better shadow spread
    sao.intensity = 0.55;            // Enhanced shadow intensity for depth
    sao.bias = 0.1;                  // Low bias for tight contact shadows
    sao.scale = 100.0;               // More pronounced depth effect
    sao.minResolution = 0.0;
    sao.blendCutoff = 0.05;          // Lower cutoff for more visible shadows
    sao.blendFactor = 1.2;           // Higher blend for stronger effect
    sao.blur = true;                 // Enable blur for smoother shadows

    // Configure crisp edge rendering for better definition
    const edgeMaterial = viewer.scene.edgeMaterial;
    edgeMaterial.edges = true;
    edgeMaterial.edgeAlpha = 0.25;
    edgeMaterial.edgeColor = [0.0, 0.0, 0.0];
    edgeMaterial.edgeWidth = 1.5;

    console.log("Viewer created successfully");

    // Initialize web-ifc API
    console.log("Creating WebIFC API instance...");
    const ifcAPI = new WebIFC.IfcAPI();

    // Set WASM path and initialize
    console.log("Setting WASM path...");
    ifcAPI.SetWasmPath("https://cdn.jsdelivr.net/npm/web-ifc@0.0.51/");

    console.log("Initializing WebIFC...");
    ifcAPI.Init().then(() => {
      console.log("WebIFC initialized successfully!");
      // Initialize WebIFC loader plugin for loading IFC models directly
      console.log("Creating WebIFCLoaderPlugin...");
      const ifcLoader = new WebIFCLoaderPlugin(viewer, {
        WebIFC,
        IfcAPI: ifcAPI
      });

      console.log("WebIFCLoaderPlugin created successfully");

      viewerRef.current = viewer;

      console.log("Calling onViewerReady callback...");
      if (onViewerReady) {
        onViewerReady(viewer, ifcLoader);
        console.log("onViewerReady callback completed");
      } else {
        console.log("No onViewerReady callback provided!");
      }

      setIsLoading(false);
      toast.success("IFC Viewer Ready - Upload an IFC file to begin");
      console.log("Viewer initialization complete!");
    }).catch((error) => {
      console.error("Failed to initialize WebIFC:", error);
      console.error("Error details:", error.message, error.stack);
      toast.error("Failed to initialize IFC loader: " + error.message);
      setIsLoading(false);
    });

    return () => {
      viewer.destroy();
    };
  }, [onViewerReady]);

  return (
    <canvas
      id="xeokit-canvas"
      ref={canvasRef}
      className="w-full h-full bg-[hsl(var(--viewer-bg))]"
    />
  );
};
