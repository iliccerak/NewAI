
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { Role } from '../types';

interface AdminConsoleProps {
  onClose: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'users' | 'vault' | 'branding' | 'system'>('users');
  const [rawVault, setRawVault] = useState('');
  const [branding, setBranding] = useState(storageService.loadGlobalBranding());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(authService.getAllUsers());
    setRawVault(JSON.stringify(localStorage, null, 2));
    setBranding(storageService.loadGlobalBranding());
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newBranding = { ...branding, logo: reader.result as string };
        setBranding(newBranding);
        storageService.saveGlobalBranding(newBranding);
        window.dispatchEvent(new Event('branding-update'));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBrandingField = (field: string, value: string) => {
    const newBranding = { ...branding, [field]: value };
    setBranding(newBranding);
    storageService.saveGlobalBranding(newBranding);
    window.dispatchEvent(new Event('branding-update'));
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Jeste li sigurni da želite da obrišete ovaj identitet?')) {
      authService.deleteUser(id);
      refreshData();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8">
      <div className="w-full max-w-6xl h-full bg-[#050505] border border-yellow-500/20 rounded-[3rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(234,179,8,0.05)]">
        <div className="h-24 px-12 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-yellow-500/5 to-transparent">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 shadow-xl border border-yellow-500/20">
               <Icons.Shield />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase">Architect Command Center</h1>
              <p className="text-yellow-500/50 text-[10px] font-black uppercase tracking-[0.4em]">Master Control Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-xl hover:bg-yellow-500 transition-all">
             <Icons.X />
          </button>
        </div>

        <div className="flex border-b border-white/5 px-12 py-2 gap-8">
          {[
            { id: 'users', label: 'Identity Vault' },
            { id: 'branding', label: 'Branding & UI' },
            { id: 'vault', label: 'Local DB Explorer' },
            { id: 'system', label: 'Diagnostics' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeView === tab.id ? 'text-yellow-500' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              {tab.label}
              {activeView === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500"></div>}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
          {activeView === 'branding' && (
            <div className="space-y-12 animate-fade-in">
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Aplikativni Logo</h3>
                  <div className="flex flex-col items-center gap-6 p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                    <div className="w-32 h-32 bg-zinc-900 rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl overflow-hidden">
                      {branding.logo ? (
                        <img src={branding.logo} className="w-full h-full object-contain p-4" />
                      ) : (
                        <div className="text-zinc-700 scale-150"><Icons.Bot /></div>
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-yellow-500 transition-all"
                    >
                      Promeni Logo
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Ime Aplikacije</label>
                    <input 
                      type="text" 
                      value={branding.appName || 'NewAI'} 
                      onChange={(e) => updateBrandingField('appName', e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-4 text-white font-bold outline-none focus:border-yellow-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Globalna Akcentna Boja</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={branding.primaryColor || '#3b82f6'} 
                        onChange={(e) => updateBrandingField('primaryColor', e.target.value)}
                        className="w-16 h-16 bg-transparent border-none outline-none cursor-pointer"
                      />
                      <span className="font-mono text-zinc-500">{branding.primaryColor || '#3b82f6'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'users' && (
            <div className="space-y-6 animate-fade-in">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-left text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                    <th className="py-4">User Identity</th>
                    <th className="py-4">Tier</th>
                    <th className="py-4">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {users.map((user: any) => (
                    <tr key={user.id} className="group">
                      <td className="py-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs">{user.name[0]}</div>
                        <div>
                           <p className="text-sm font-bold text-white">{user.name}</p>
                           <p className="text-[10px] text-zinc-600">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-6 text-[10px] font-black text-zinc-500 uppercase">{user.tier}</td>
                      <td className="py-6 text-right">
                        {user.role !== Role.ADMIN && (
                          <button onClick={() => handleDeleteUser(user.id)} className="p-3 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Icons.Trash /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* ... Ostali tabovi ostaju isti ... */}
        </div>
      </div>
    </div>
  );
};
