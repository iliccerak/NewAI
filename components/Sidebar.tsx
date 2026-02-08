
import React from 'react';
import { Conversation, AppState, Role } from '../types';
import { Icons } from './Icons';
import { i18n } from '../services/i18nService';

interface SidebarProps {
  state: AppState;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenTemplates: () => void;
  onOpenAdmin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  state, onNewChat, onSelectChat, onDeleteChat, onLogout, onOpenSettings, onOpenTemplates, onOpenAdmin 
}) => {
  const conversations = (Object.values(state.conversations) as Conversation[]).sort((a, b) => b.updatedAt - a.updatedAt);
  const user = state.currentUser;
  const lang = user?.preferences.language || 'en';

  return (
    <aside 
      className={`${state.isSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 flex flex-col h-full overflow-hidden shrink-0 bg-[#050505] border-r border-white/5 z-20`}
    >
      <div className="p-6 space-y-4">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/5 transition-all hover:opacity-90 active:scale-[0.98] group"
          style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-fg)' }}
        >
          <div className="group-hover:rotate-90 transition-transform duration-300">
            <Icons.Plus />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] ml-1">{i18n.t('newChat', lang)}</span>
        </button>
        
        <button 
          onClick={onOpenTemplates}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[#111] hover:bg-[#1a1a1a] text-zinc-400 hover:text-white rounded-xl transition-all border border-white/5 group"
        >
          <Icons.Layout />
          <span className="text-[10px] font-black uppercase tracking-[0.1em]">Prompt Library</span>
        </button>

        {user?.role === Role.ADMIN && (
          <button 
            onClick={onOpenAdmin}
            className="w-full flex items-center gap-3 px-4 py-3 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-500 rounded-xl transition-all border border-yellow-500/10 group"
          >
            <Icons.Shield />
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">Admin Console</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">{i18n.t('history', lang)}</h3>
          <div className="w-8 h-px bg-zinc-900"></div>
        </div>
        
        <div className="space-y-1">
          {conversations.length > 0 ? conversations.map((conv) => (
            <div 
              key={conv.id}
              className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${state.activeConversationId === conv.id ? 'bg-[#111] text-white border border-white/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
              onClick={() => onSelectChat(conv.id)}
            >
              <div className={`w-1 h-1 rounded-full shrink-0 ${state.activeConversationId === conv.id ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-zinc-800'}`}></div>
              <span className="truncate text-[11px] font-bold uppercase tracking-tighter flex-1">{conv.title}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteChat(conv.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
              >
                <Icons.Trash />
              </button>
            </div>
          )) : (
            <div className="px-2 py-10 text-center">
               <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em]">{i18n.t('noHistory', lang)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-white/5 bg-black/40">
        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 rounded-full shrink-0 shadow-lg flex items-center justify-center font-black text-[10px] overflow-hidden"
            style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-fg)' }}
          >
            {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user?.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate uppercase tracking-tighter">{user?.name}</p>
            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest truncate">{user?.tier || i18n.t('proAccount', lang)}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button onClick={onOpenSettings} title="Podešavanja" className="p-2 text-zinc-600 hover:text-white transition-colors">
              <Icons.Settings />
            </button>
            <button onClick={onLogout} title="Odjavi se" className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
              <Icons.LogOut />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
