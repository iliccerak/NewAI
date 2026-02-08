
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { AuthScreen } from './components/AuthScreen';
import { SettingsModal } from './components/SettingsModal';
import { Dashboard } from './components/Dashboard';
import { ReasoningWaterfall } from './components/ReasoningWaterfall';
import { OmniVoiceOverlay } from './components/OmniVoiceOverlay';
import { GamePreview } from './components/GamePreview';
import { AdminConsole } from './components/AdminConsole';
import { Icons } from './components/Icons';
import { AppState, Message, Role, IntelligenceMode, UserPreferences } from './types';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import { authService } from './services/authService';
import { i18n } from './services/i18nService';
import { MAX_CONTEXT_MESSAGES, QUICK_ACTION_PREFIXES } from './constants';

const App: React.FC = () => {
  const [globalBranding, setGlobalBranding] = useState(storageService.loadGlobalBranding());
  const [state, setState] = useState<AppState>(() => ({
    currentUser: null,
    activeConversationId: null,
    conversations: {},
    isSidebarOpen: true,
    theme: 'dark',
    currentMode: IntelligenceMode.DEFAULT,
    selectedModelId: 'gemini-3-flash',
    isProcessing: false,
    showSettings: false,
    showAdminConsole: false,
    showTemplates: false,
    needsApiKey: false,
    liveSessionActive: false
  }));

  const [activeGameCode, setActiveGameCode] = useState<string | null>(null);
  const [pendingInitialInput, setPendingInitialInput] = useState('');
  const [notification, setNotification] = useState<{ message: string, type: 'error' | 'info' | 'recovery' } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentLang = state.currentUser?.preferences.language || i18n.detectLanguage();

  const applyTheme = useCallback((prefs: UserPreferences | undefined) => {
    const root = document.documentElement;
    let bg = '#09090b';
    let accent = globalBranding.primaryColor || '#3b82f6';

    if (prefs) {
      switch (prefs.theme) {
        case 'onyx': bg = '#000000'; break;
        case 'cyber': bg = '#020617'; break;
        case 'custom':
          bg = prefs.backgroundColor || '#09090b';
          accent = prefs.accentColor || accent;
          break;
        default: bg = '#09090b';
      }
    }

    root.style.setProperty('--bg-app', bg);
    root.style.setProperty('--accent-color', accent);
    document.body.style.backgroundColor = bg;
  }, [globalBranding]);

  useEffect(() => {
    const syncBranding = () => setGlobalBranding(storageService.loadGlobalBranding());
    window.addEventListener('branding-update', syncBranding);
    return () => window.removeEventListener('branding-update', syncBranding);
  }, []);

  useEffect(() => {
    applyTheme(state.currentUser?.preferences);
  }, [state.currentUser?.preferences, applyTheme, globalBranding]);

  useEffect(() => {
    authService.initialize();
    const user = authService.getCurrentUser();
    if (user) {
      handleAuthSuccess(user);
    }
  }, []);

  useEffect(() => {
    if (state.currentUser) {
      storageService.saveState({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        selectedModelId: state.selectedModelId,
        currentMode: state.currentMode
      }, state.currentUser.id);
    }
  }, [state.conversations, state.activeConversationId, state.selectedModelId, state.currentMode, state.currentUser]);

  const handleAuthSuccess = (u: any) => {
    const saved = storageService.loadState(u.id);
    setState(prev => ({ 
      ...prev, 
      currentUser: u,
      conversations: saved?.conversations || {},
      activeConversationId: saved?.activeConversationId || null,
      selectedModelId: saved?.selectedModelId || 'gemini-3-flash',
      currentMode: saved?.currentMode || IntelligenceMode.DEFAULT
    }));
  };

  const handleSendMessage = async (text: string, mode: IntelligenceMode, attachment?: any) => {
    let currentId = state.activeConversationId;
    if (!currentId) {
      currentId = uuidv4();
      const newConv = { 
        id: currentId, 
        title: i18n.t('newChat', currentLang), 
        messages: [], 
        updatedAt: Date.now(), 
        mode, 
        selectedModelId: state.selectedModelId 
      };
      setState(prev => ({
        ...prev,
        activeConversationId: currentId,
        conversations: { ...prev.conversations, [currentId!]: newConv }
      }));
    }
    // Logic for sending messages would go here
    // This is a truncated representation as per original structure
  };

  if (!state.currentUser) return <AuthScreen onAuthSuccess={handleAuthSuccess} />;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-app)] text-white transition-all duration-700">
      {state.showAdminConsole && state.currentUser.role === Role.ADMIN && (
        <AdminConsole onClose={() => setState(prev => ({ ...prev, showAdminConsole: false }))} />
      )}
      <Sidebar 
        state={state} 
        onNewChat={() => setState(prev => ({ ...prev, activeConversationId: null }))} 
        onSelectChat={(id) => setState(prev => ({ ...prev, activeConversationId: id }))} 
        onDeleteChat={(id) => storageService.deleteConversation(id, state.currentUser!.id)} 
        onLogout={() => { authService.logout(); window.location.reload(); }} 
        onOpenSettings={() => setState(prev => ({ ...prev, showSettings: true }))} 
        onOpenTemplates={() => {}} 
        onOpenAdmin={() => setState(prev => ({ ...prev, showAdminConsole: true }))} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-black/20 backdrop-blur-md z-10">
          <div className="flex items-center gap-6">
            <div className="w-8 h-8 flex items-center justify-center">
              {globalBranding.logo ? <img src={globalBranding.logo} className="w-full h-full object-contain" /> : <Icons.GeminiLogo />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--accent-color)' }}>{globalBranding.appName || 'NewAI'} Core</span>
          </div>
          <button onClick={() => setState(prev => ({ ...prev, liveSessionActive: true }))} className="flex items-center gap-3 px-5 py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-xl transition-all" style={{ backgroundColor: 'var(--accent-color)' }}>
            <Icons.Mic /> <span>{i18n.t('liveConnect', currentLang)}</span>
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
          {state.activeConversationId ? (
            <div className="max-w-4xl mx-auto py-20 px-8">
               {state.conversations[state.activeConversationId]?.messages.map((m: any) => (
                 <div key={m.id} className={`mb-8 ${m.role === Role.USER ? 'text-right' : 'text-left'}`}>
                    <p className="text-sm font-medium opacity-80">{m.parts[0]?.text}</p>
                 </div>
               ))}
            </div>
          ) : (
            <Dashboard 
              onQuickAction={(text, mode) => handleSendMessage(text, mode)} 
              language={currentLang} 
              user={state.currentUser} 
            />
          )}
        </div>
        
        <div className="pb-10 pt-4">
           <ChatInput 
              onSendMessage={handleSendMessage}
              disabled={state.isProcessing}
              activeMode={state.currentMode}
              onModeChange={(mode) => setState(prev => ({ ...prev, currentMode: mode }))}
              selectedModelId={state.selectedModelId}
              onModelChange={(id) => setState(prev => ({ ...prev, selectedModelId: id }))}
              language={currentLang}
           />
        </div>

        {state.showSettings && state.currentUser && (
          <SettingsModal 
            user={state.currentUser} 
            onClose={() => setState(prev => ({ ...prev, showSettings: false }))}
            onUpdatePreferences={(prefs) => authService.updateUser(state.currentUser!.id, { preferences: prefs })}
            onUpdateUser={(updates) => authService.updateUser(state.currentUser!.id, updates)}
          />
        )}

        <OmniVoiceOverlay 
          isActive={state.liveSessionActive} 
          onClose={() => setState(prev => ({ ...prev, liveSessionActive: false }))}
          user={state.currentUser}
        />
      </main>
    </div>
  );
};

// Fix for index.tsx: Export App as default
export default App;
