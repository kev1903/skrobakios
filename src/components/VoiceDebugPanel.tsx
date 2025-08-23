import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { invokeEdge } from '@/lib/invokeEdge';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  duration?: number;
}

export function VoiceDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runSystemTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    const tests: TestResult[] = [
      { name: 'AI Chat Function', status: 'pending' },
      { name: 'Voice Transcribe Function', status: 'pending' },
      { name: 'Text-to-Speech Function', status: 'pending' },
      { name: 'Microphone Access', status: 'pending' }
    ];
    
    setResults([...tests]);

    // Test AI Chat
    try {
      const startTime = Date.now();
      console.log('🧪 Testing ai-chat function...');
      
      const response = await invokeEdge('ai-chat', {
        message: 'Hello, this is a test message. Please respond with "Test successful".',
        conversationHistory: []
      });
      
      const duration = Date.now() - startTime;
      
      if (response?.response || response?.message) {
        tests[0] = { 
          name: 'AI Chat Function', 
          status: 'success', 
          message: `Response received in ${duration}ms`,
          duration 
        };
        console.log('✅ AI Chat test passed:', response);
      } else {
        tests[0] = { 
          name: 'AI Chat Function', 
          status: 'error', 
          message: 'No response received',
          duration 
        };
        console.log('❌ AI Chat test failed:', response);
      }
    } catch (error) {
      tests[0] = { 
        name: 'AI Chat Function', 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
      console.log('❌ AI Chat test error:', error);
    }
    
    setResults([...tests]);

    // Test Voice Transcribe (with dummy data)
    try {
      const startTime = Date.now();
      console.log('🧪 Testing voice-transcribe function...');
      
      // Create a small dummy audio blob (empty but valid base64)
      const dummyAudio = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      
      const response = await invokeEdge('voice-transcribe', {
        audio: dummyAudio
      });
      
      const duration = Date.now() - startTime;
      
      // Even if transcription is empty (expected for dummy data), function should respond
      tests[1] = { 
        name: 'Voice Transcribe Function', 
        status: 'success', 
        message: `Function responded in ${duration}ms`,
        duration 
      };
      console.log('✅ Voice Transcribe test passed:', response);
    } catch (error) {
      tests[1] = { 
        name: 'Voice Transcribe Function', 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
      console.log('❌ Voice Transcribe test error:', error);
    }
    
    setResults([...tests]);

    // Test Text-to-Speech
    try {
      const startTime = Date.now();
      console.log('🧪 Testing text-to-speech function...');
      
      const response = await invokeEdge('text-to-speech', {
        text: 'Test',
        voice: 'alloy'
      });
      
      const duration = Date.now() - startTime;
      
      if (response?.audioContent) {
        tests[2] = { 
          name: 'Text-to-Speech Function', 
          status: 'success', 
          message: `Audio generated in ${duration}ms`,
          duration 
        };
        console.log('✅ Text-to-Speech test passed');
      } else {
        tests[2] = { 
          name: 'Text-to-Speech Function', 
          status: 'error', 
          message: 'No audio content received',
          duration 
        };
        console.log('❌ Text-to-Speech test failed:', response);
      }
    } catch (error) {
      tests[2] = { 
        name: 'Text-to-Speech Function', 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
      console.log('❌ Text-to-Speech test error:', error);
    }
    
    setResults([...tests]);

    // Test Microphone Access
    try {
      const startTime = Date.now();
      console.log('🧪 Testing microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const duration = Date.now() - startTime;
      
      // Stop the stream immediately after testing
      stream.getTracks().forEach(track => track.stop());
      
      tests[3] = { 
        name: 'Microphone Access', 
        status: 'success', 
        message: `Access granted in ${duration}ms`,
        duration 
      };
      console.log('✅ Microphone test passed');
    } catch (error) {
      tests[3] = { 
        name: 'Microphone Access', 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Permission denied' 
      };
      console.log('❌ Microphone test error:', error);
    }
    
    setResults([...tests]);
    setIsRunning(false);

    // Show summary toast
    const successCount = tests.filter(t => t.status === 'success').length;
    const totalTests = tests.length;
    
    if (successCount === totalTests) {
      toast.success('All tests passed!', {
        description: 'SkAi voice system is ready to use'
      });
    } else {
      toast.error(`${totalTests - successCount} test(s) failed`, {
        description: 'Check the debug panel for details'
      });
    }
  };

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50"
      >
        <TestTube className="h-4 w-4 mr-2" />
        Debug SkAi
      </Button>
    );
  }

  return (
    <Card className="fixed top-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          SkAi System Diagnostics
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={runSystemTests} 
          disabled={isRunning}
          className="w-full"
          size="sm"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4 mr-2" />
              Run System Tests
            </>
          )}
        </Button>
        
        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 p-2 bg-muted rounded text-sm"
              >
                {result.status === 'pending' && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {result.status === 'success' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {result.status === 'error' && (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                
                <div className="flex-1">
                  <div className="font-medium">{result.name}</div>
                  {result.message && (
                    <div className="text-xs text-muted-foreground">
                      {result.message}
                    </div>
                  )}
                </div>
                
                {result.duration && (
                  <div className="text-xs text-muted-foreground">
                    {result.duration}ms
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}