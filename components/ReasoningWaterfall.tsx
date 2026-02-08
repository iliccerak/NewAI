
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

interface ReasoningWaterfallProps {
  thought: string;
}

export const ReasoningWaterfall: React.FC<ReasoningWaterfallProps> = ({ thought }) => {
  const [isOpen, setIsOpen] = useState(false);
  const steps = thought.split('\n').filter(s => s.trim().length > 0);

  if (!thought) return null;

  return (
    <div className="mb-6 border border-white/5 bg-black/40 rounded-2xl overflow-hidden transition-all duration-500">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Icons.Brain />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Unutrašnja Logika Dešifrovana</span>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <Icons.ChevronDown />
        </div>
      </button>

      {isOpen && (
        <div className="p-5 pt-0 space-y-3 max-h-60 overflow-y-auto scrollbar-hide">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-[9px] font-mono text-zinc-700 pt-1">0{i+1}</div>
              <p className="text-[11px] text-zinc-400 font-medium leading-relaxed font-mono italic">
                {step.replace(/^[*-]\s*/, '')}
              </p>
            </div>
          ))}
          <div className="pt-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Sinteza Rešenja Završena</span>
          </div>
        </div>
      )}
    </div>
  );
};
