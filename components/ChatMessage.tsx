import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Role } from '../types';
import { User, Bot, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-lg ${
          isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>

        {/* Bubble */}
        <div
          className={`flex flex-col px-5 py-3.5 rounded-2xl shadow-md text-sm md:text-base leading-relaxed ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : message.isError 
                ? 'bg-red-900/50 border border-red-700 text-red-100 rounded-tl-none'
                : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
          }`}
        >
          {message.isError ? (
             <div className="flex items-center gap-2">
               <AlertCircle size={16} className="text-red-400" />
               <span>{message.text}</span>
             </div>
          ) : (
            <div className={`markdown-content ${isUser ? 'text-indigo-50' : 'text-slate-200'}`}>
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    return isInline ? (
                      <code className="bg-slate-900/50 px-1.5 py-0.5 rounded font-mono text-xs md:text-sm" {...props}>
                        {children}
                      </code>
                    ) : (
                      <div className="relative my-3 rounded-md overflow-hidden bg-slate-950 border border-slate-700">
                         <div className="flex justify-between items-center px-3 py-1 bg-slate-900/80 border-b border-slate-700">
                            <span className="text-xs text-slate-400 font-mono">{match?.[1] || 'code'}</span>
                         </div>
                         <div className="p-3 overflow-x-auto">
                           <code className={`font-mono text-xs md:text-sm block whitespace-pre`} {...props}>
                             {children}
                           </code>
                         </div>
                      </div>
                    );
                  },
                  ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                  h1: ({ children }) => <h1 className="text-xl font-bold my-3 pb-2 border-b border-slate-600">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold my-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-md font-semibold my-1">{children}</h3>,
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">{children}</a>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-slate-500 pl-4 italic my-2 text-slate-400">{children}</blockquote>
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          )}
          
          {/* Timestamp / Status */}
          <div className={`text-[10px] mt-1 opacity-60 flex items-center gap-1 ${isUser ? 'text-indigo-200 justify-end' : 'text-slate-400 justify-start'}`}>
            {message.isStreaming && !message.isError && (
               <span className="flex gap-0.5">
                 <span className="typing-dot w-1 h-1 bg-current rounded-full"></span>
                 <span className="typing-dot w-1 h-1 bg-current rounded-full"></span>
                 <span className="typing-dot w-1 h-1 bg-current rounded-full"></span>
               </span>
            )}
            {!message.isStreaming && new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};