import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onSave({
      text: commentText,
      userName: "User", // You can get this from auth context if available
      objectId: selectedObject,
      position,
    });

    setCommentText("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-white/95 backdrop-blur-xl border-border/30 shadow-xl max-w-md p-0 gap-0"
        hideCloseButton
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment"
            className="flex-1 bg-muted/30 border-border/30 rounded-full px-6 py-5 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-luxury-gold"
            autoFocus
          />
          <Button
            type="submit"
            size="icon"
            disabled={!commentText.trim()}
            className="h-10 w-10 rounded-full bg-luxury-gold hover:bg-luxury-gold/90 text-white shadow-md disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
