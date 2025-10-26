import { useEffect, useRef } from "react";
import { Viewer, WebIFCLoaderPlugin } from "@xeokit/xeokit-sdk";
import * as WebIFC from "web-ifc";

interface ViewerCanvasProps {
  onViewerReady: (viewer: Viewer, loader: WebIFCLoaderPlugin) => void;
}

export const ViewerCanvas = ({ onViewerReady }: ViewerCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const viewer = new Viewer({
      canvasId: "xeokit-canvas",
      transparent: true,
      logarithmicDepthBufferEnabled: true,
    });

    const ifcLoader = new WebIFCLoaderPlugin(viewer, {
      WebIFC: WebIFC as any,
      IfcAPI: WebIFC.IfcAPI as any
    });

    viewerRef.current = viewer;
    onViewerReady(viewer, ifcLoader);

    return () => {
      viewer.destroy();
    };
  }, [onViewerReady]);

  return (
    <canvas
      id="xeokit-canvas"
      ref={canvasRef}
      className="w-full h-full"
      style={{ position: "absolute", top: 0, left: 0 }}
    />
  );
};
