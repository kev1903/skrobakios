import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatBoxProps {
  onNavigate?: (page: string) => void;
}

export const ChatBox = ({ onNavigate }: ChatBoxProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      // Handle chat message logic here
      console.log('Chat message:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 shadow-xl hover:bg-white/25 transition-all duration-200">
        <MessageCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
        <Input
          type="text"
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="border-none bg-transparent text-white placeholder-white/60 focus:ring-0 focus:outline-none text-sm min-w-[300px]"
        />
        <Button
          onClick={handleSend}
          size="sm"
          variant="ghost"
          className="p-2 h-auto text-white/70 hover:text-white hover:bg-white/10 rounded-full"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};