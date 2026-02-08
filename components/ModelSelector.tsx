
import React from 'react';
import { Icons } from './Icons';
import { MODEL_LIST } from '../constants';
import { ModelConfig } from '../types';

interface ModelSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedId, onSelect, onClose }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'gemini': return <Icons.GeminiLogo />;
      case 'openai': return <Icons.OpenAILogo />;
      case 'anthropic': return <Icons.AnthropicLogo />;
      case 'xai': return <Icons.XaiLogo />;
      case 'kimi': return <Icons.MoonshotLogo />;
      case 'sonar': return <Icons.SonarIcon />;
      case 'image': return <Icons.Image />;
      default: return <Icons.Bot />;
    }
  };

  return (
    <div className="absolute bottom-full left-0 mb-3 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-[60]">
      <div className="p-4 border-b border-zinc-800/50">
        <h3 className="text-sm font-bold text-white tracking-tight">Upgrade for best models</h3>
      </div>
      
      <div className="py-2 max-h-[400px] overflow-y-auto scrollbar-hide">
        {MODEL_LIST.map((model) => (
          <button
            key={model.id}
            onClick={() => {
              onSelect(model.id);
              onClose();
            }}
            className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left group ${selectedId === model.id ? 'bg-zinc-800/50' : ''}`}
          >
            <div className={`mt-0.5 shrink-0 ${selectedId === model.id ? 'text-blue-500' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
              {getIcon(model.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold truncate ${selectedId === model.id ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                  {model.name}
                </span>
                {model.badge && (
                  <span className="px-1.5 py-0.5 rounded bg-white text-black text-[9px] font-black uppercase">
                    {model.badge}
                  </span>
                )}
                {model.isNew && (
                  <span className="px-1.5 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-tighter">
                    new
                  </span>
                )}
              </div>
              {model.subtext && (
                <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                  {model.subtext}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
