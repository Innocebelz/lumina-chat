import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Header } from './components/Header';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { geminiService } from './services/geminiService';
import { Message, Role } from './types';
import { GenerateContentResponse } from '@google/genai';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat session on mount
  useEffect(() => {
    try {
      geminiService.initChat();
      
      // Add initial greeting
      const initialMessage: Message = {
        id: 'init-1',
        role: Role.MODEL,
        text: "Hello! I'm Lumina. How can I assist you today?",
        timestamp: Date.now()
      };
      setMessages([initialMessage]);
    } catch (e) {
      console.error("Failed to init chat", e);
    }
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: Role.USER,
      text: text,
      timestamp: Date.now(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
        // Create a placeholder for the bot response
        const botMessageId = crypto.randomUUID();
        const botMessagePlaceholder: Message = {
            id: botMessageId,
            role: Role.MODEL,
            text: '', // Starts empty
            timestamp: Date.now(),
            isStreaming: true
        };

        setMessages((prev) => [...prev, botMessagePlaceholder]);

        const stream = await geminiService.sendMessageStream(text);
        
        let fullText = '';

        for await (const chunk of stream) {
            const contentResponse = chunk as GenerateContentResponse;
            const chunkText = contentResponse.text; // Access .text directly property
            
            if (chunkText) {
                fullText += chunkText;
                setMessages((prev) => 
                    prev.map(msg => 
                        msg.id === botMessageId 
                        ? { ...msg, text: fullText } 
                        : msg
                    )
                );
            }
        }

        // Finalize message state
        setMessages((prev) => 
            prev.map(msg => 
                msg.id === botMessageId 
                ? { ...msg, isStreaming: false, text: fullText } // Ensure final text matches
                : msg
            )
        );

    } catch (error) {
        console.error("Chat error:", error);
        
        // Add error message
        const errorMessage: Message = {
            id: crypto.randomUUID(),
            role: Role.MODEL,
            text: "I'm sorry, I encountered an issue connecting to the service. Please try again.",
            timestamp: Date.now(),
            isError: true
        };
        setMessages((prev) => {
            // Remove the loading placeholder if it exists and is empty
            const filtered = prev.filter(msg => !(msg.role === Role.MODEL && msg.isStreaming && msg.text === ''));
            return [...filtered, errorMessage];
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleClearChat = () => {
      setMessages([]);
      geminiService.resetChat();
      // Add initial greeting again
      const initialMessage: Message = {
        id: crypto.randomUUID(),
        role: Role.MODEL,
        text: "Chat cleared. How can I help you now?",
        timestamp: Date.now()
      };
      setMessages([initialMessage]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      <Header onClearChat={handleClearChat} />

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto w-full relative scroll-smooth">
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-32 min-h-full flex flex-col justify-end">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50 mt-20">
                    <div className="text-center">
                        <p>No messages yet.</p>
                        <p className="text-sm">Start the conversation!</p>
                    </div>
                </div>
            )}
            
            {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area - Fixed at bottom */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pb-2 pt-6">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
};

export default App;