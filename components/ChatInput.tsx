import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false; // Only capture final results to avoid text jumping
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let newTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            newTranscript += event.results[i][0].transcript;
          }
        }
        
        if (newTranscript) {
            setInput(prev => {
                // Add a space if the previous input didn't end with one
                const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
                return prev + spacer + newTranscript;
            });
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
    // Stop listening if user sends the message
    if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
      <div className={`relative flex items-end gap-2 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border transition-all duration-300 shadow-2xl ${isListening ? 'border-red-500/50 shadow-red-500/10' : 'border-slate-700'}`}>
        
        <div className="flex-1 min-h-[44px] flex items-center">
            <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Ask Lumina something..."}
            className="w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500 resize-none py-3 px-4 max-h-[200px] overflow-y-auto scrollbar-hide"
            rows={1}
            disabled={isLoading}
            />
        </div>

        {isSupported && (
            <button
                onClick={toggleListening}
                disabled={isLoading}
                className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200 relative ${
                    isListening 
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                        : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={isListening ? "Stop recording" : "Use voice input"}
            >
                {isListening ? (
                    <>
                        <span className="absolute inset-0 rounded-xl bg-red-500/20 animate-ping pointer-events-none"></span>
                        <MicOff size={20} />
                    </>
                ) : (
                    <Mic size={20} />
                )}
            </button>
        )}

        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200 ${
            !input.trim() || isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? (
            <Sparkles className="animate-spin" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
      <div className="text-center mt-2">
        <p className="text-[10px] text-slate-500">
            AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
};