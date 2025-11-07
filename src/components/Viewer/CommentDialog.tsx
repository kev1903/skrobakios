import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { MentionInput } from "./MentionInput";
import { useCompanyMembers } from "@/hooks/useCompanyMembers";
import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/contexts/AuthContext";

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
    mentionedUserIds?: string[];
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
  const { currentCompany } = useCompany();
  const { user } = useAuth();
  const { data: companyMembers = [] } = useCompanyMembers(currentCompany?.id || '');

  // Transform company members for MentionInput
  const users = companyMembers
    .filter(member => member.user_id)
    .map(member => ({
      user_id: member.user_id!,
      first_name: member.profile?.first_name || '',
      last_name: member.profile?.last_name || '',
      email: member.email || '',
      avatar_url: member.profile?.avatar_url
    }));

  const extractMentions = (text: string): string[] => {
    // Match @FirstName LastName pattern
    const mentionRegex = /@([A-Za-z]+)\s+([A-Za-z]+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const firstName = match[1];
      const lastName = match[2];
      
      // Find the user ID for this mention
      const mentionedUser = users.find(
        u => u.first_name.toLowerCase() === firstName.toLowerCase() && 
             u.last_name.toLowerCase() === lastName.toLowerCase()
      );
      
      if (mentionedUser) {
        mentions.push(mentionedUser.user_id);
      }
    }

    return [...new Set(mentions)]; // Remove duplicates
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const mentionedUserIds = extractMentions(commentText);

    onSave({
      text: commentText,
      userName: user?.email || "User",
      objectId: selectedObject,
      position,
      mentionedUserIds,
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
        <form onSubmit={handleSubmit} className="flex items-start gap-2 p-4">
          <div className="flex-1">
            <MentionInput
              value={commentText}
              onChange={setCommentText}
              users={users}
              placeholder="Add a comment (use @ to mention)"
              className="bg-muted/30 border-border/30 rounded-lg text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-luxury-gold resize-none"
            />
          </div>
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
