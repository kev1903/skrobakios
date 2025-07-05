import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatBoxProps {
  onNavigate?: (page: string) => void;
  onSpeakingChange?: (speaking: boolean) => void;
}

export const ChatBox = ({ onNavigate, onSpeakingChange }: ChatBoxProps) => {
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const simulateAIResponse = async () => {
    // Simulate AI thinking/processing
    setIsProcessing(true);
    onSpeakingChange?.(false);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate AI speaking
    onSpeakingChange?.(true);
    setIsProcessing(false);
    
    // Simulate speaking duration (3-5 seconds)
    const speakingDuration = 3000 + Math.random() * 2000;
    setTimeout(() => {
      onSpeakingChange?.(false);
    }, speakingDuration);
  };

  const handleSend = async () => {
    if (message.trim()) {
      console.log('Chat message:', message);
      setMessage('');
      await simulateAIResponse();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 shadow-xl hover:bg-white/25 transition-all duration-200">
        <div className="relative">
          <MessageCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
          {isProcessing && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
          )}
        </div>
        <Input
          type="text"
          placeholder={isProcessing ? "AI is thinking..." : "Type your message here..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isProcessing}
          className="border-none bg-transparent text-white placeholder-white/60 focus:ring-0 focus:outline-none text-sm min-w-[300px] disabled:opacity-70"
        />
        <Button
          onClick={handleSend}
          disabled={isProcessing || !message.trim()}
          size="sm"
          variant="ghost"
          className="p-2 h-auto text-white/70 hover:text-white hover:bg-white/10 rounded-full disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};