
import React from 'react';
import { IntelligenceMode, SupportedLanguage, Role, User } from '../types';
import { Icons } from './Icons';
import { i18n } from '../services/i18nService';

interface DashboardProps {
  onQuickAction: (text: string, mode: IntelligenceMode) => void;
  language: SupportedLanguage;
  user?: User | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ onQuickAction, language, user }) => {
  const isAdmin = user?.role === Role.ADMIN;
  
  const CAPABILITIES = [
    { 
      mode: IntelligenceMode.COUNSEL, 
      icon: <Icons.Shield />, 
      title: i18n.t('counselTitle', language), 
      desc: i18n.t('counselDesc', language),
      prefix: 'Analiziraj ovaj koncept iz tri perspektive: '
    },
    { 
      mode: IntelligenceMode.RESEARCH, 
      icon: <Icons.Layout />, 
      title: i18n.t('researchTitle', language), 
      desc: i18n.t('researchDesc', language),
      prefix: 'Istraži detaljno temu: '
    },
    { 
      mode: IntelligenceMode.REASONING, 
      icon: <Icons.Brain />, 
      title: i18n.t('logicTitle', language), 
      desc: i18n.t('logicDesc', language),
      prefix: 'Reši logički problem: '
    },
    { 
      mode: IntelligenceMode.IMAGE_GEN, 
      icon: <Icons.Image />, 
      title: i18n.t('visionTitle', language), 
      desc: i18n.t('visionDesc', language),
      prefix: 'Generiši vizuelni koncept za: '
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">{i18n.t('neuralActive', language)}</span>
          </div>
          
          {isAdmin ? (
            <div className="space-y-4">
              <h1 className="text-6xl font-black text-white tracking-[-0.05em] uppercase leading-tight animate-fade-in">
                ZDRAVO STEFANE <span className="text-yellow-500">MOJ KREATORE</span>
              </h1>
              <p className="text-yellow-500/50 text-sm font-black uppercase tracking-[0.4em] mb-4">Master Architect Mode Active</p>
            </div>
          ) : (
            <h1 className="text-8xl font-black text-white tracking-[-0.05em] uppercase leading-none">
              NewAI<span className="text-blue-600">.</span>
            </h1>
          )}

          <p className="text-zinc-500 font-medium text-lg mt-6 max-w-xl mx-auto">
             {isAdmin ? "Svi sistemi su pod tvojom kontrolom. Kako mogu da ti pomognem danas?" : i18n.t('tagline', language)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CAPABILITIES.map((cap) => (
            <button
              key={cap.mode}
              onClick={() => onQuickAction(cap.prefix, cap.mode)}
              className={`group relative p-8 border rounded-[2.5rem] text-left transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden ${isAdmin ? 'bg-yellow-500/[0.02] border-yellow-500/10 hover:border-yellow-500/30' : 'bg-zinc-900/40 border-white/5 hover:bg-white/[0.03] hover:border-white/10'}`}
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                {cap.icon}
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${isAdmin ? 'bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black' : 'bg-white/5 text-white group-hover:bg-blue-600'}`}>
                {cap.icon}
              </div>
              <h3 className={`text-sm font-black uppercase tracking-widest mb-2 ${isAdmin ? 'text-yellow-500' : 'text-white'}`}>{cap.title}</h3>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">{cap.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
