
import React, { useState } from 'react';
import { Icons } from './Icons';
import { authService } from '../services/authService';
import { User, SupportedLanguage } from '../types';
import { i18n } from '../services/i18nService';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

const COUNTRIES = [
  { code: 'RS', name: 'Srbija', flag: '🇷🇸', lang: 'sr' },
  { code: 'US', name: 'USA', flag: '🇺🇸', lang: 'en' },
  { code: 'GB', name: 'UK', flag: '🇬🇧', lang: 'en' },
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪', lang: 'de' },
  { code: 'FR', name: 'France', flag: '🇫🇷', lang: 'fr' },
  { code: 'ES', name: 'España', flag: '🇪🇸', lang: 'es' }
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState('RS');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleSim, setShowGoogleSim] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');

  const currentLang = (COUNTRIES.find(c => c.code === country)?.lang || 'en') as SupportedLanguage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const user = authService.login(email, password);
        onAuthSuccess(user);
      } else {
        if (!name) throw new Error('Full name is required.');
        const user = authService.register(name, email, password, country);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.includes('@')) {
      alert("Molimo unesite ispravan Google email.");
      return;
    }
    setIsLoading(true);
    setShowGoogleSim(false);
    try {
      const user = await authService.loginWithGoogle(googleEmailInput, '', country);
      onAuthSuccess(user);
    } catch (err: any) {
      setError("Google authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {showGoogleSim && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-black animate-fade-in">
            <div className="flex justify-center mb-6">
              <Icons.Google />
            </div>
            <h2 className="text-xl font-bold text-center mb-2">Sign in with Google</h2>
            <p className="text-zinc-500 text-xs text-center mb-6">to continue to NewAI</p>
            <form onSubmit={handleGoogleSubmit} className="space-y-4">
              <input 
                type="email" 
                autoFocus
                required
                placeholder="Email or phone"
                className="w-full border border-zinc-300 rounded px-4 py-3 outline-none focus:border-blue-500"
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
              />
              <div className="flex justify-between items-center pt-4">
                <button type="button" onClick={() => setShowGoogleSim(false)} className="text-blue-600 font-bold text-sm">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold text-sm">Next</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="w-full max-w-md p-8 bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] border border-zinc-800 shadow-2xl animate-fade-in relative">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 rotate-12">
            <Icons.Bot />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">NewAI</h1>
          <p className="text-zinc-500 text-sm font-medium">{i18n.t('tagline', currentLang)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            onClick={() => setShowGoogleSim(true)}
            className="flex items-center justify-center gap-3 py-3 px-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-xs font-bold text-white uppercase tracking-tighter"
          >
            <Icons.Google /> {i18n.t('googleLogin', currentLang)}
          </button>
          <div className="relative group">
            <select 
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full appearance-none bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-xs font-bold text-white uppercase tracking-tighter outline-none cursor-pointer focus:border-white/20 transition-all"
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code} className="bg-zinc-900 text-white">{c.flag} {c.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <Icons.ChevronDown />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-zinc-800 flex-1"></div>
          <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">{i18n.t('orEmail', currentLang)}</span>
          <div className="h-px bg-zinc-800 flex-1"></div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{i18n.t('identityLabel', currentLang)}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-0 transition-all text-white placeholder-zinc-700"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{i18n.t('emailLabel', currentLang)}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-0 transition-all text-white placeholder-zinc-700"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{i18n.t('vaultKey', currentLang)}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 pr-12 text-sm focus:border-blue-500 focus:ring-0 transition-all text-white placeholder-zinc-700"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                title={showPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
              >
                {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50 mt-4 uppercase text-xs tracking-widest"
          >
            {isLoading ? i18n.t('loading', currentLang) : (isLogin ? i18n.t('loginButton', currentLang) : i18n.t('registerButton', currentLang))}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            {isLogin ? i18n.t('noAccount', currentLang) : i18n.t('hasAccount', currentLang)}
          </button>
        </div>
      </div>
    </div>
  );
};
