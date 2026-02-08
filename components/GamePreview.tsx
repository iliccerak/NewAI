
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';

interface GamePreviewProps {
  code: string;
  onClose: () => void;
}

export const GamePreview: React.FC<GamePreviewProps> = ({ code, onClose }) => {
  const [isReady, setIsReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Extract pure HTML from the code block if it has markdown formatting
  const cleanCode = code.replace(/```html|```/g, '').trim();

  const handleFocus = () => {
    if (iframeRef.current) {
      iframeRef.current.focus();
      setIsReady(true);
    }
  };

  useEffect(() => {
    // Attempt to focus after a short delay once iframe is potentially loaded
    const timer = setTimeout(() => {
      handleFocus();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-fade-in px-4">
      <div className="w-full max-w-5xl bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col h-[85vh] relative">
        
        {/* Header */}
        <div className="h-16 px-8 flex items-center justify-between border-b border-white/5 bg-zinc-900/50 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
              <Icons.Gamepad />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-widest uppercase">Arcade Sandbox</h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Active Runtime 1.0</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 mr-4">
                <Icons.Keyboard />
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Controls Active</span>
             </div>
             <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-white hover:text-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                Close Session
              </button>
          </div>
        </div>
        
        {/* Game Area */}
        <div className="flex-1 bg-black relative group overflow-hidden">
          {!isReady && (
            <div 
              onClick={handleFocus}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer group-hover:bg-black/60 transition-all"
            >
              <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] mb-6 animate-bounce">
                <Icons.Play />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Initialize System</h3>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em]">Click to focus controls & audio</p>
            </div>
          )}

          <iframe 
            ref={iframeRef}
            srcDoc={cleanCode}
            title="Arcade Game"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-modals allow-popups"
            onLoad={handleFocus}
          />
        </div>

        {/* Footer info */}
        <div className="p-4 bg-zinc-950/80 border-t border-white/5 text-center flex justify-between px-10">
          <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.3em]">Isolated Execution Environment</p>
          <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.3em]">NewAI Core v1.2</p>
        </div>
      </div>
    </div>
  );
};
