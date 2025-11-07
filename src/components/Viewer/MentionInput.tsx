import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  users: User[];
  placeholder?: string;
  className?: string;
}

export const MentionInput = ({
  value,
  onChange,
  users,
  placeholder = "Add a comment...",
  className = ""
}: MentionInputProps) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return fullName.includes(mentionSearch.toLowerCase()) || 
           user.email.toLowerCase().includes(mentionSearch.toLowerCase());
  });

  const getInitials = (user: User) => {
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Check for @ mentions
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      
      // Check if there's a space after @, if so, close mentions
      if (textAfterAt.includes(' ')) {
        setShowMentions(false);
      } else {
        setMentionSearch(textAfterAt);
        setShowMentions(true);
        setSelectedIndex(0);
        
        // Calculate position for dropdown
        if (textareaRef.current) {
          const rect = textareaRef.current.getBoundingClientRect();
          setMentionPosition({
            top: rect.bottom + 5,
            left: rect.left
          });
        }
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user: User) => {
    if (!textareaRef.current) return;

    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    const mention = `@${user.first_name} ${user.last_name}`;
    const newValue = 
      textBeforeCursor.slice(0, lastAtIndex) + 
      mention + 
      ' ' + 
      textAfterCursor;
    
    onChange(newValue);
    setShowMentions(false);
    
    // Set cursor position after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = lastAtIndex + mention.length + 1;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showMentions || filteredUsers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      insertMention(filteredUsers[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowMentions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        setShowMentions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={3}
      />

      {showMentions && filteredUsers.length > 0 && (
        <div
          className="fixed z-50 w-72 bg-white/95 backdrop-blur-xl border border-border/30 rounded-lg shadow-xl"
          style={{ top: mentionPosition.top, left: mentionPosition.left }}
        >
          <ScrollArea className="max-h-60">
            <div className="p-2">
              <div className="text-xs text-muted-foreground px-3 py-2 font-semibold uppercase tracking-wider">
                Mention someone
              </div>
              {filteredUsers.map((user, index) => (
                <button
                  key={user.user_id}
                  onClick={() => insertMention(user)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    index === selectedIndex
                      ? 'bg-luxury-gold/10 border border-luxury-gold/30'
                      : 'hover:bg-accent/30'
                  }`}
                >
                  <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                    {user.avatar_url && (
                      <AvatarImage src={user.avatar_url} alt={`${user.first_name} ${user.last_name}`} />
                    )}
                    <AvatarFallback className="bg-luxury-gold text-white text-xs font-semibold">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
