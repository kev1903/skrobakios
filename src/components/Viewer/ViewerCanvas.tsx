import { useEffect, useRef, useState } from "react";
import { Viewer, WebIFCLoaderPlugin } from "@xeokit/xeokit-sdk";
import { IfcAPI } from "web-ifc";

interface ViewerCanvasProps {
  onViewerReady: (viewer: Viewer, loader: WebIFCLoaderPlugin) => void;
}

export const ViewerCanvas = ({ onViewerReady }: ViewerCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [ifcAPI, setIfcAPI] = useState<IfcAPI | null>(null);

  useEffect(() => {
    const initIfcAPI = async () => {
      const api = new IfcAPI();
      await api.Init();
      setIfcAPI(api);
    };
    
    initIfcAPI();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !ifcAPI) return;

    const viewer = new Viewer({
      canvasId: "xeokit-canvas",
      transparent: true,
      logarithmicDepthBufferEnabled: true,
    });

    const ifcLoader = new WebIFCLoaderPlugin(viewer, {
      WebIFC: { IfcAPI },
      IfcAPI: ifcAPI
    });

    viewerRef.current = viewer;
    onViewerReady(viewer, ifcLoader);

    return () => {
      viewer.destroy();
    };
  }, [onViewerReady, ifcAPI]);

  return (
    <canvas
      id="xeokit-canvas"
      ref={canvasRef}
      className="w-full h-full"
      style={{ position: "absolute", top: 0, left: 0 }}
    />
  );
};
