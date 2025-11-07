import { useEffect, useRef } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IfcComment } from "@/hooks/useIfcComments";

interface CommentMarkerProps {
  comment: IfcComment;
  viewer: any;
  onDelete?: (commentId: string) => void;
  onSelect?: (comment: IfcComment) => void;
}

export const CommentMarker = ({ comment, viewer, onDelete, onSelect }: CommentMarkerProps) => {
  const markerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewer || !markerRef.current || !comment.position) return;

    const updateMarkerPosition = () => {
      if (!markerRef.current || !comment.position) return;

      const worldPos = [comment.position.x, comment.position.y, comment.position.z];
      const canvas = viewer.scene.canvas.canvas;
      const canvasPos = viewer.scene.camera.project.worldToCanvas(worldPos);

      if (canvasPos) {
        const rect = canvas.getBoundingClientRect();
        markerRef.current.style.left = `${rect.left + canvasPos[0]}px`;
        markerRef.current.style.top = `${rect.top + canvasPos[1]}px`;
        markerRef.current.style.display = 'block';
      } else {
        markerRef.current.style.display = 'none';
      }
    };

    // Update position on camera changes
    viewer.scene.camera.on("viewMatrix", updateMarkerPosition);
    viewer.scene.camera.on("projMatrix", updateMarkerPosition);
    
    // Initial position update
    updateMarkerPosition();

    return () => {
      viewer.scene.camera.off("viewMatrix", updateMarkerPosition);
      viewer.scene.camera.off("projMatrix", updateMarkerPosition);
    };
  }, [viewer, comment.position]);

  if (!comment.position) return null;

  return (
    <div
      ref={markerRef}
      className="fixed z-50 pointer-events-auto"
      style={{ transform: 'translate(-50%, -100%)' }}
    >
      <div className="relative group">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onSelect?.(comment)}
          className="h-8 w-8 rounded-full bg-luxury-gold/90 backdrop-blur-xl border border-white/30 shadow-lg hover:bg-luxury-gold hover:scale-110 transition-all duration-200"
        >
          <MessageSquare className="h-4 w-4 text-white" />
        </Button>

        {/* Tooltip on hover */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl border border-border/30 rounded-lg shadow-xl p-3 min-w-[200px] max-w-[300px]">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-xs font-semibold text-luxury-gold uppercase tracking-wider">
                {comment.user_name}
              </p>
              {onDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(comment.id);
                  }}
                  className="h-5 w-5 rounded-full hover:bg-rose-500/20 text-rose-600 pointer-events-auto"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <p className="text-sm text-foreground">{comment.comment}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(comment.created_at).toLocaleDateString()}
            </p>
            {comment.object_id && (
              <p className="text-xs font-mono text-muted-foreground mt-1">
                Object: {comment.object_id}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
