import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useProjectNetwork } from '@/hooks/useProjectNetwork';
import { 
  Send, 
  Mic, 
  MicOff, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Loader2,
  Brain,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  action?: string;
  data?: any;
}

interface SkaiChatInterfaceProps {
  projectId: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const SkaiChatInterface: React.FC<SkaiChatInterfaceProps> = ({
  projectId,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm Skai, your AI project orchestrator. I can help you plan, optimize, and manage your construction project network. Try commands like:\n\n• 'Plan construction: site prep (3d), foundation (5d, FS on prep)'\n• 'Simulate 2-day delay on foundation'\n• 'Optimize critical path'\n• 'Add weather buffer for exterior work'",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendAICommand } = useProjectNetwork(projectId);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice recognition error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message
    addMessage({
      type: 'user',
      content: userMessage,
    });

    setIsLoading(true);

    try {
      // Determine AI action based on message content
      let action = 'parse_prompt';
      let aiResponse = '';

      if (userMessage.toLowerCase().includes('simulate') || userMessage.toLowerCase().includes('delay')) {
        action = 'simulate_changes';
        const result = await sendAICommand(action, { 
          simulationData: { 
            description: userMessage,
            type: 'delay_simulation' 
          } 
        });
        aiResponse = `Simulation completed! ${JSON.stringify(result.simulation, null, 2)}`;
      } else if (userMessage.toLowerCase().includes('optimize')) {
        action = 'optimize_network';
        const result = await sendAICommand(action);
        aiResponse = `Network optimization completed! ${JSON.stringify(result.optimization, null, 2)}`;
      } else if (userMessage.toLowerCase().includes('suggest')) {
        action = 'generate_suggestions';
        const result = await sendAICommand(action);
        aiResponse = `Here are my suggestions: ${JSON.stringify(result.suggestions, null, 2)}`;
      } else {
        // Parse as new network structure
        const result = await sendAICommand(action, { message: userMessage });
        aiResponse = `I've created ${result.nodes?.length || 0} tasks and ${result.dependencies?.length || 0} dependencies based on your request. The network has been updated in the 3D view.`;
      }

      // Add AI response
      addMessage({
        type: 'ai',
        content: aiResponse,
        action,
      });

    } catch (error: any) {
      addMessage({
        type: 'system',
        content: `Error: ${error.message}. Please try a different command or check your connection.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      toast({
        title: "Voice not supported",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const quickCommands = [
    { 
      label: "Plan Project", 
      command: "Plan construction project with typical phases",
      icon: Brain 
    },
    { 
      label: "Optimize", 
      command: "Optimize the current network for efficiency",
      icon: Zap 
    },
    { 
      label: "Simulate Delay", 
      command: "Simulate a 2-day delay on the current critical path",
      icon: TrendingUp 
    },
  ];

  const handleQuickCommand = (command: string) => {
    setInputMessage(command);
  };

  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggleCollapse}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg border-2 border-white/20"
          size="lg"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Skai AI</div>
            <div className="text-white/60 text-xs">Project Orchestrator</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : message.type === 'ai'
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-red-500/20 text-red-200 border border-red-500/30'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                {message.action && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {message.action}
                  </Badge>
                )}
                <div className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl px-3 py-2 border border-white/20">
                <div className="flex items-center gap-2 text-white">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Skai is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Quick Commands */}
      <div className="px-4 py-2 border-t border-white/20">
        <div className="text-xs text-white/60 mb-2">Quick Commands</div>
        <div className="flex gap-1 flex-wrap">
          {quickCommands.map((cmd, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => handleQuickCommand(cmd.command)}
              className="text-xs text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-1"
            >
              <cmd.icon className="w-3 h-3" />
              {cmd.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/20">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Skai to plan, optimize, or simulate..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none min-h-[40px] max-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleVoiceInput}
              variant={isListening ? "destructive" : "secondary"}
              size="sm"
              className={isListening ? "animate-pulse" : ""}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};