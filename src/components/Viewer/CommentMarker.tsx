import { useEffect, useRef } from "react";
import { MessageSquare, X, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
      const camera = viewer.scene.camera;
      
      // Manually project world coordinates to canvas coordinates
      // Using xeokit's camera view and projection matrices
      const viewMat = camera.viewMatrix;
      const projMat = camera.projMatrix;
      
      // Transform world to view space
      const viewPos = [
        viewMat[0] * worldPos[0] + viewMat[4] * worldPos[1] + viewMat[8] * worldPos[2] + viewMat[12],
        viewMat[1] * worldPos[0] + viewMat[5] * worldPos[1] + viewMat[9] * worldPos[2] + viewMat[13],
        viewMat[2] * worldPos[0] + viewMat[6] * worldPos[1] + viewMat[10] * worldPos[2] + viewMat[14],
        viewMat[3] * worldPos[0] + viewMat[7] * worldPos[1] + viewMat[11] * worldPos[2] + viewMat[15]
      ];
      
      // Transform view to clip space
      const clipPos = [
        projMat[0] * viewPos[0] + projMat[4] * viewPos[1] + projMat[8] * viewPos[2] + projMat[12] * viewPos[3],
        projMat[1] * viewPos[0] + projMat[5] * viewPos[1] + projMat[9] * viewPos[2] + projMat[13] * viewPos[3],
        projMat[2] * viewPos[0] + projMat[6] * viewPos[1] + projMat[10] * viewPos[2] + projMat[14] * viewPos[3],
        projMat[3] * viewPos[0] + projMat[7] * viewPos[1] + projMat[11] * viewPos[2] + projMat[15] * viewPos[3]
      ];
      
      // Perspective divide
      const ndc = [
        clipPos[0] / clipPos[3],
        clipPos[1] / clipPos[3],
        clipPos[2] / clipPos[3]
      ];
      
      // Check if behind camera or outside frustum
      if (ndc[2] < -1 || ndc[2] > 1 || ndc[0] < -1 || ndc[0] > 1 || ndc[1] < -1 || ndc[1] > 1) {
        markerRef.current.style.display = 'none';
        return;
      }
      
      // Convert NDC to canvas coordinates
      const canvasWidth = canvas.width / window.devicePixelRatio;
      const canvasHeight = canvas.height / window.devicePixelRatio;
      const canvasX = (ndc[0] + 1) * 0.5 * canvasWidth;
      const canvasY = (1 - ndc[1]) * 0.5 * canvasHeight;
      
      const rect = canvas.getBoundingClientRect();
      markerRef.current.style.left = `${rect.left + canvasX}px`;
      markerRef.current.style.top = `${rect.top + canvasY}px`;
      markerRef.current.style.display = 'block';
    };

    // Update position on camera changes
    viewer.scene.camera.on("viewMatrix", updateMarkerPosition);
    viewer.scene.camera.on("projMatrix", updateMarkerPosition);
    
    // Initial position update
    updateMarkerPosition();

    return () => {
      // Check if viewer and camera still exist before cleaning up
      if (viewer?.scene?.camera) {
        viewer.scene.camera.off("viewMatrix", updateMarkerPosition);
        viewer.scene.camera.off("projMatrix", updateMarkerPosition);
      }
    };
  }, [viewer, comment.position]);

  if (!comment.position) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const highlightMentions = (text: string) => {
    // Match @FirstName LastName pattern
    const parts = text.split(/(@[A-Za-z]+\s+[A-Za-z]+)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="inline-flex items-center gap-1 bg-luxury-gold/10 text-luxury-gold px-1.5 py-0.5 rounded font-medium">
            <AtSign className="h-3 w-3" />
            {part.slice(1)}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      ref={markerRef}
      className="fixed z-50 pointer-events-auto"
      style={{ transform: 'translate(-50%, -100%)' }}
    >
      <div className="relative group">
        <button
          onClick={() => onSelect?.(comment)}
          className="block rounded-full hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl ring-2 ring-luxury-gold/50 hover:ring-luxury-gold"
        >
          <Avatar className="h-8 w-8 border-2 border-white">
            {comment.avatar_url && (
              <AvatarImage src={comment.avatar_url} alt={comment.user_name} />
            )}
            <AvatarFallback className="bg-luxury-gold text-white text-xs font-semibold">
              {getInitials(comment.user_name)}
            </AvatarFallback>
          </Avatar>
        </button>

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
            <p className="text-sm text-foreground">{highlightMentions(comment.comment)}</p>
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
