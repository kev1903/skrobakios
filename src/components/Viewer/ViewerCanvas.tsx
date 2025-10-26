import { useEffect, useRef, useState } from "react";
import { Viewer, WebIFCLoaderPlugin } from "@xeokit/xeokit-sdk";
import * as WebIFC from "web-ifc";

interface ViewerCanvasProps {
  onViewerReady: (viewer: Viewer, loader: WebIFCLoaderPlugin) => void;
}

export const ViewerCanvas = ({ onViewerReady }: ViewerCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initAttempted = useRef(false);

  useEffect(() => {
    if (initAttempted.current) return;
    initAttempted.current = true;

    let mounted = true;
    
    const initViewer = async () => {
      console.log("=== Viewer Initialization Started ===");
      
      if (!canvasRef.current) {
        const err = "Canvas element not found";
        console.error(err);
        setError(err);
        setIsInitializing(false);
        return;
      }

      console.log("Canvas element found:", canvasRef.current);

      try {
        // Initialize web-ifc WASM first
        console.log("Initializing web-ifc WASM...");
        const ifcAPI = new WebIFC.IfcAPI();
        
        // Set WASM path and initialize
        ifcAPI.SetWasmPath("https://cdn.jsdelivr.net/npm/web-ifc@0.0.51/");
        await ifcAPI.Init();
        console.log("web-ifc WASM initialized successfully");

        if (!mounted) {
          console.log("Component unmounted, aborting");
          return;
        }

        // Create viewer
        console.log("Creating Viewer instance...");
        const viewer = new Viewer({
          canvasId: "xeokit-canvas",
          transparent: false,
          backgroundColor: [0.95, 0.95, 0.98]
        });
        
        console.log("Viewer created successfully:", viewer);

        if (!mounted) {
          console.log("Component unmounted, aborting");
          return;
        }

        // Create IFC loader with initialized web-ifc
        console.log("Creating WebIFCLoaderPlugin with initialized WebIFC...");
        const ifcLoader = new WebIFCLoaderPlugin(viewer, {
          WebIFC: WebIFC,
          IfcAPI: ifcAPI
        });
        
        console.log("WebIFCLoaderPlugin created successfully");

        viewerRef.current = viewer;
        setIsInitializing(false);
        setError(null);
        
        console.log("Calling onViewerReady callback...");
        onViewerReady(viewer, ifcLoader);
        console.log("=== Viewer Initialization Complete ===");
        
      } catch (err) {
        console.error("=== Viewer Initialization Failed ===");
        console.error("Error type:", err?.constructor?.name);
        console.error("Error message:", err instanceof Error ? err.message : String(err));
        console.error("Error stack:", err instanceof Error ? err.stack : "No stack trace");
        console.error("Full error object:", err);
        
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setIsInitializing(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initViewer();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (viewerRef.current) {
        console.log("Cleaning up viewer...");
        try {
          viewerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying viewer:", e);
        }
      }
    };
  }, [onViewerReady]);

  return (
    <div className="relative w-full h-full bg-background">
      <canvas
        id="xeokit-canvas"
        ref={canvasRef}
        className="w-full h-full"
      />
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-50">
          <div className="text-center space-y-3 p-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-luxury-gold mx-auto" />
            <div>
              <p className="text-sm font-medium text-foreground">Initializing BIM Viewer...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait</p>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-50">
          <div className="text-center space-y-3 p-6 max-w-md">
            <div className="text-destructive text-4xl">⚠️</div>
            <div>
              <p className="text-sm font-medium text-destructive mb-2">Failed to initialize viewer</p>
              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded font-mono text-left overflow-auto max-h-32">
                {error}
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="text-xs text-luxury-gold hover:underline"
            >
              Reload page to retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
