import React from 'react';
import { Sparkles, Trash2 } from 'lucide-react';

interface HeaderProps {
    onClearChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onClearChat }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/60">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-emerald-400 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Lumina Chat
          </h1>
        </div>
        
        <button 
            onClick={onClearChat}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Clear Chat"
        >
            <Trash2 size={18} />
        </button>
      </div>
    </header>
  );
};