import { useEffect, useRef, useState } from "react";
import { Viewer, WebIFCLoaderPlugin } from "@xeokit/xeokit-sdk";

interface ViewerCanvasProps {
  onViewerReady: (viewer: Viewer, loader: WebIFCLoaderPlugin) => void;
}

export const ViewerCanvas = ({ onViewerReady }: ViewerCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const initViewer = async () => {
      if (!canvasRef.current) {
        console.error("Canvas ref not available");
        return;
      }

      try {
        console.log("Starting viewer initialization...");
        setIsInitializing(true);

        // Create viewer
        console.log("Creating xeokit viewer...");
        const viewer = new Viewer({
          canvasId: "xeokit-canvas",
          transparent: true,
          logarithmicDepthBufferEnabled: true,
        });

        console.log("Viewer created, initializing IFC loader...");
        
        // Create IFC loader plugin with wasmPath
        const ifcLoader = new WebIFCLoaderPlugin(viewer, {
          wasmPath: "https://cdn.jsdelivr.net/npm/web-ifc@0.0.51/"
        } as any);

        console.log("IFC loader initialized successfully");

        if (!mounted) return;

        viewerRef.current = viewer;
        setIsInitializing(false);
        onViewerReady(viewer, ifcLoader);
        console.log("Viewer ready callback executed");
      } catch (err) {
        console.error("Viewer initialization error:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize viewer");
        setIsInitializing(false);
      }
    };

    initViewer();

    return () => {
      mounted = false;
      if (viewerRef.current) {
        console.log("Destroying viewer...");
        viewerRef.current.destroy();
      }
    };
  }, [onViewerReady]);

  return (
    <div className="relative w-full h-full">
      <canvas
        id="xeokit-canvas"
        ref={canvasRef}
        className="w-full h-full"
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold mx-auto" />
            <p className="text-sm text-muted-foreground">Initializing viewer...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <div className="text-center space-y-2 p-6">
            <p className="text-sm text-destructive">Failed to initialize viewer</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
