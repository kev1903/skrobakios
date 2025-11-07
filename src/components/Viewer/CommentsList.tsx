import { useState } from "react";
import { X, Search, MessageSquare } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IfcComment } from "@/hooks/useIfcComments";
import { formatDistanceToNow } from "date-fns";

interface CommentsListProps {
  comments: IfcComment[];
  onCommentSelect?: (comment: IfcComment) => void;
  onClose: () => void;
}

export const CommentsList = ({ comments, onCommentSelect, onClose }: CommentsListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredComments = comments.filter(comment =>
    comment.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort comments by most recent first and add numbering
  const sortedComments = [...filteredComments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="h-full flex flex-col bg-white/95 backdrop-blur-xl border-l border-border/30 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-luxury-gold" />
          <h3 className="text-sm font-semibold text-foreground">
            Comments ({comments.length})
          </h3>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="h-8 w-8 rounded-full hover:bg-muted/50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-background/60 border-border/30 focus:border-luxury-gold"
          />
        </div>
      </div>

      {/* Comments List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sortedComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No comments found" : "No comments yet"}
              </p>
            </div>
          ) : (
            sortedComments.map((comment, index) => (
              <button
                key={comment.id}
                onClick={() => onCommentSelect?.(comment)}
                className="w-full p-3 rounded-lg hover:bg-accent/30 transition-colors text-left group mb-1"
              >
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm flex-shrink-0">
                    {comment.avatar_url && (
                      <AvatarImage src={comment.avatar_url} alt={comment.user_name} />
                    )}
                    <AvatarFallback className="bg-luxury-gold text-white text-xs font-semibold">
                      {getInitials(comment.user_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        #{sortedComments.length - index}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {comment.user_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 break-words line-clamp-2">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
