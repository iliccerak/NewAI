
import React, { useState } from 'react';
import { Icons } from './Icons';
import { User, UserPreferences, SupportedLanguage } from '../types';
import { i18n } from '../services/i18nService';

interface SettingsModalProps {
  user: User;
  onClose: () => void;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onUpdateUser?: (updates: Partial<User>) => void;
}

const COUNTRIES = [
  { code: 'RS', name: 'Srbija', flag: '🇷🇸', lang: 'sr' },
  { code: 'US', name: 'USA', flag: '🇺🇸', lang: 'en' },
  { code: 'GB', name: 'UK', flag: '🇬🇧', lang: 'en' },
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪', lang: 'de' },
  { code: 'FR', name: 'France', flag: '🇫🇷', lang: 'fr' },
  { code: 'ES', name: 'España', flag: '🇪🇸', lang: 'es' }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ user, onClose, onUpdatePreferences, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'security'>('profile');
  const [nameInput, setNameInput] = useState(user.name);
  const [isLinking, setIsLinking] = useState(false);

  const lang = user.preferences.language || 'en';

  const handleUpdateName = () => {
    if (onUpdateUser && nameInput.trim()) {
      onUpdateUser({ name: nameInput.trim() });
    }
  };

  const handleLinkGoogle = () => {
    setIsLinking(true);
    setTimeout(() => {
      if (onUpdateUser) {
        onUpdateUser({ 
          googleConnected: true, 
          avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c' 
        });
      }
      setIsLinking(false);
    }, 1500);
  };

  const handleCountryChange = (countryCode: string) => {
    const selectedCountry = COUNTRIES.find(c => c.code === countryCode);
    if (selectedCountry) {
      onUpdatePreferences({ 
        ...user.preferences, 
        country: countryCode, 
        language: selectedCountry.lang as SupportedLanguage 
      });
    }
  };

  const THEMES = [
    { id: 'zinc', name: 'Zinc', desc: 'Modern Dark' },
    { id: 'onyx', name: 'Onyx', desc: 'OLED Black' },
    { id: 'cyber', name: 'Cyber', desc: 'Neon Future' },
    { id: 'custom', name: 'Custom', desc: 'Architect Mod' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-4">
      <div className="w-full max-w-4xl bg-zinc-950 border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex h-[650px]">
        {/* Sidebar Nav */}
        <div className="w-64 bg-black/40 border-r border-white/5 p-8 flex flex-col gap-3">
          <div className="mb-8 text-center">
             <div className="relative inline-block mb-4">
                {user.avatarUrl ? (
                   <img src={user.avatarUrl} className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-xl" />
                ) : (
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black border border-white/10"
                    style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-fg)' }}
                  >
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                {user.googleConnected && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-zinc-950 shadow-lg">
                    <Icons.Google />
                  </div>
                )}
             </div>
             <p className="text-white font-bold text-base tracking-tight truncate">{user.name}</p>
             <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1">Level {user.level} {user.tier}</p>
          </div>

          {[
            { id: 'profile', label: i18n.t('profile', lang) },
            { id: 'appearance', label: i18n.t('appearance', lang) },
            { id: 'security', label: i18n.t('security', lang) }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab === tab.id ? 'bg-white/5 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
          
          <div className="mt-auto">
            <button onClick={onClose} className="w-full py-3 border border-white/5 hover:bg-white/5 text-zinc-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all">
              {i18n.t('save', lang)}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-12 overflow-y-auto scrollbar-hide bg-zinc-900/10">
          {activeTab === 'profile' && (
            <div className="space-y-10 animate-fade-in">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Digitalni Identitet</h2>
                <p className="text-zinc-500 text-xs mt-2">Upravljajte svojim prisustvom i eksternim nalozima.</p>
              </div>

              <div className="space-y-8">
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                         <Icons.Google />
                      </div>
                      <div>
                         <h4 className="text-white font-black text-sm uppercase tracking-tight">Google Account</h4>
                         <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1">
                           {user.googleConnected ? 'Povezano sa google_user@gmail.com' : 'Nije povezano'}
                         </p>
                      </div>
                   </div>
                   <button 
                     disabled={isLinking}
                     onClick={user.googleConnected ? () => onUpdateUser?.({ googleConnected: false, avatarUrl: undefined }) : handleLinkGoogle}
                     className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.googleConnected ? 'bg-zinc-800 text-zinc-400 hover:bg-red-500/10 hover:text-red-500' : 'bg-white text-black hover:bg-zinc-200'}`}
                   >
                     {isLinking ? i18n.t('loading', lang) : user.googleConnected ? 'Otkači' : 'Poveži'}
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">Vaše Ime</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-white/10 outline-none"
                      />
                      <button onClick={handleUpdateName} className="p-3 bg-white/5 rounded-xl hover:text-blue-500 transition-colors">
                        <Icons.Zap />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">Država / Lokacija</label>
                    <div className="relative">
                      <select 
                        value={user.preferences.country || 'RS'}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-white/10 transition-all cursor-pointer"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code} className="bg-zinc-900 text-white">{c.flag} {c.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                        <Icons.ChevronDown />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-2">Iskustvo</p>
                      <p className="text-xl font-bold text-white">{user.xp} <span className="text-[10px] opacity-30 uppercase tracking-widest">XP</span></p>
                   </div>
                   <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-2">Korisnički Nivo</p>
                      <p className="text-xl font-bold text-white">{user.tier}</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-10 animate-fade-in">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Estetika Interfejsa</h2>
                <p className="text-zinc-500 text-xs mt-2">Prilagodite NewAI svom vizuelnom stilu.</p>
              </div>
              
              <div className="space-y-6">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Izbor Teme</label>
                <div className="grid grid-cols-2 gap-4">
                  {THEMES.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => onUpdatePreferences({ ...user.preferences, theme: t.id as any })}
                      className={`p-6 rounded-2xl border transition-all text-left relative group ${user.preferences.theme === t.id ? 'bg-white/5 border-white/20 scale-[1.02]' : 'bg-transparent border-white/5 hover:border-white/10'}`}
                    >
                      <p className={`text-xs font-black uppercase tracking-tight ${user.preferences.theme === t.id ? 'text-white' : 'text-zinc-600'}`}>{t.name}</p>
                      <p className="text-[8px] text-zinc-700 font-black uppercase tracking-[0.1em] mt-1">{t.desc}</p>
                      {user.preferences.theme === t.id && (
                        <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {user.preferences.theme === 'custom' && (
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6 animate-fade-in">
                  <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Architect Palette</h4>
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-3">
                       <label className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Akcent Boja</label>
                       <div className="flex items-center gap-4">
                          <input 
                            type="color" 
                            value={user.preferences.accentColor}
                            onChange={(e) => onUpdatePreferences({ ...user.preferences, accentColor: e.target.value })}
                            className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer outline-none"
                          />
                          <span className="text-[10px] font-mono text-zinc-500 tracking-widest">{user.preferences.accentColor}</span>
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Boja Pozadine</label>
                       <div className="flex items-center gap-4">
                          <input 
                            type="color" 
                            value={user.preferences.backgroundColor}
                            onChange={(e) => onUpdatePreferences({ ...user.preferences, backgroundColor: e.target.value })}
                            className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer outline-none"
                          />
                          <span className="text-[10px] font-mono text-zinc-500 tracking-widest">{user.preferences.backgroundColor}</span>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-10 animate-fade-in">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Enkripcija i Sigurnost</h2>
              <div className="p-10 bg-white/[0.01] border border-white/5 rounded-3xl space-y-8">
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Sve sesije su izolovane i enkriptovane. Vaš digitalni otisak je zaštićen u lokalnom sefu vašeg uređaja. Povezivanjem Google naloga, koristimo samo osnovne podatke (ime, sliku, jezik) radi personalizacije iskustva.
                </p>
                <div className="flex justify-between py-5 border-b border-white/5">
                  <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Vault Status</span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Aktivna Zaštita</span>
                </div>
                <div className="flex justify-between py-5 border-b border-white/5">
                  <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Identity Sync</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${user.googleConnected ? 'text-blue-500' : 'text-zinc-800'}`}>
                    {user.googleConnected ? 'Google Cloud Active' : 'Local Only'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
