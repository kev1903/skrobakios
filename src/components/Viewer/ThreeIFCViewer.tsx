import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";

interface ThreeIFCViewerProps {
  onViewerReady: (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, components: OBC.Components) => void;
}

export const ThreeIFCViewer = ({ onViewerReady }: ThreeIFCViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;
    let animationId: number;

    const initViewer = async () => {
      try {
        console.log("=== That Open Components BIM Viewer Initialization Started ===");

        const container = containerRef.current!;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf2f2f6);

        // Create camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Create components instance
        const components = new OBC.Components();

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        scene.add(directionalLight);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(50, 50, 0xcccccc, 0xeeeeee);
        scene.add(gridHelper);

        // Add orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Initialize components
        await components.init();
        
        // Initialize FragmentsManager with worker
        const fragments = components.get(OBC.FragmentsManager);
        const workerUrl = "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
        fragments.init(workerUrl);
        
        // Add loaded fragments to scene automatically
        fragments.list.onItemSet.add(({ value: model }) => {
          model.useCamera(camera);
          scene.add(model.object);
        });

        // Animation loop
        const animate = () => {
          if (!mounted) return;
          animationId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
          if (!container) return;
          const width = container.clientWidth;
          const height = container.clientHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };
        window.addEventListener("resize", handleResize);

        if (mounted) {
          setIsInitializing(false);
          setError(null);
          console.log("=== That Open Components BIM Viewer Initialization Complete ===");
          onViewerReady(scene, camera, renderer, components);
        }

        // Cleanup
        return () => {
          mounted = false;
          cancelAnimationFrame(animationId);
          window.removeEventListener("resize", handleResize);
          renderer.dispose();
          controls.dispose();
          components.dispose();
          if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        };
      } catch (err) {
        console.error("=== BIM Viewer Initialization Failed ===");
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setIsInitializing(false);
      }
    };

    initViewer();
  }, [onViewerReady]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-background">
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
