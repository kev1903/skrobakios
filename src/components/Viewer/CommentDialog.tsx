import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedObject?: string;
  position?: { x: number; y: number; z: number };
  onSave: (comment: {
    text: string;
    userName: string;
    objectId?: string;
    position?: { x: number; y: number; z: number };
  }) => void;
}

export const CommentDialog = ({
  open,
  onOpenChange,
  selectedObject,
  position,
  onSave,
}: CommentDialogProps) => {
  const [commentText, setCommentText] = useState("");
  const [userName, setUserName] = useState("");

  const handleSave = () => {
    if (!commentText.trim()) return;

    onSave({
      text: commentText,
      userName: userName || "Anonymous",
      objectId: selectedObject,
      position,
    });

    // Reset form
    setCommentText("");
    setUserName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/95 backdrop-blur-xl border-border/30 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Comment</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {selectedObject
              ? `Add a note to the selected object`
              : "Add a note to the current view"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {selectedObject && (
            <div className="p-3 bg-accent/30 rounded-lg border border-border/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                Selected Object
              </p>
              <p className="text-sm font-mono text-foreground">{selectedObject}</p>
            </div>
          )}

          {position && (
            <div className="p-3 bg-accent/30 rounded-lg border border-border/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                Position
              </p>
              <p className="text-sm font-mono text-foreground">
                X: {position.x.toFixed(2)}, Y: {position.y.toFixed(2)}, Z:{" "}
                {position.z.toFixed(2)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="userName" className="text-sm font-semibold text-foreground">
              Your Name
            </Label>
            <Input
              id="userName"
              placeholder="Enter your name (optional)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="bg-white/80 backdrop-blur-sm border-border/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-semibold text-foreground">
              Comment *
            </Label>
            <Textarea
              id="comment"
              placeholder="Enter your comment or note..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[120px] bg-white/80 backdrop-blur-sm border-border/30"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="bg-background/60 backdrop-blur-md border-border/30"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!commentText.trim()}
            className="bg-luxury-gold text-white hover:bg-luxury-gold/90 shadow-md"
          >
            Save Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
