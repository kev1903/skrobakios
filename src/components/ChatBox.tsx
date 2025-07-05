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
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 sm:px-0">
      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 sm:px-4 py-2 shadow-xl hover:bg-white/25 transition-all duration-200">
        <div className="relative flex-shrink-0">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
          {isProcessing && (
            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse" />
          )}
        </div>
        <Input
          type="text"
          placeholder={isProcessing ? "AI is thinking..." : "Ask Skai anything..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isProcessing}
          className="border-none bg-transparent text-white placeholder-white focus:ring-0 focus:outline-none text-sm flex-1 disabled:opacity-70"
        />
        <Button
          onClick={handleSend}
          disabled={isProcessing || !message.trim()}
          size="sm"
          variant="ghost"
          className="p-1.5 sm:p-2 h-auto text-white/70 hover:text-white hover:bg-white/10 rounded-full disabled:opacity-50 flex-shrink-0"
        >
          <Send className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
};