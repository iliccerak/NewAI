
import { v4 as uuidv4 } from 'uuid';
import { User, UserPreferences, SupportedLanguage, Role } from '../types';

const ACCOUNTS_KEY = 'newai_iam_vault';
const SESSION_KEY = 'newai_active_session';

const MASTER_EMAIL = 'iliccerak@gmail.com';
const MASTER_PASS = 'Petefijeva9';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'zinc',
  accentColor: '#3b82f6',
  backgroundColor: '#09090b',
  density: 'relaxed',
  language: 'en',
  country: 'US'
};

const countryToLang: Record<string, SupportedLanguage> = {
  'RS': 'sr', 'US': 'en', 'GB': 'en', 'DE': 'de', 'FR': 'fr', 'ES': 'es', 'MX': 'es', 'ME': 'sr', 'BA': 'sr', 'HR': 'sr'
};

export const authService = {
  initialize: () => {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    
    // Seed Owner Account
    if (!accounts.find((a: any) => a.email === MASTER_EMAIL)) {
      const ownerUser: any = {
        id: 'owner-root-001',
        name: 'Stefan',
        email: MASTER_EMAIL,
        password: MASTER_PASS,
        role: Role.ADMIN,
        tier: 'Owner',
        createdAt: Date.now(),
        xp: 99999,
        level: 100,
        badges: ['Architect', 'Founder'],
        preferences: { ...DEFAULT_PREFERENCES, language: 'sr', country: 'RS' }
      };
      accounts.push(ownerUser);
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
  },

  getAllUsers: (): any[] => {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  },

  deleteUser: (userId: string) => {
    let accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    accounts = accounts.filter((a: any) => a.id !== userId);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  },

  updateUser: (userId: string, updates: Partial<User>) => {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    const index = accounts.findIndex((a: any) => a.id === userId);
    if (index !== -1) {
      accounts[index] = { ...accounts[index], ...updates };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      
      const session = sessionStorage.getItem(SESSION_KEY);
      if (session) {
        const currentUser = JSON.parse(session);
        if (currentUser.id === userId) {
          const updatedSessionUser = { ...currentUser, ...updates };
          delete (updatedSessionUser as any).password;
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedSessionUser));
        }
      }
    }
  },

  login: (email: string, password: string): User => {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    const user = accounts.find((a: any) => a.email === email && a.password === password);
    
    if (!user) {
      throw new Error('Identitet nije prepoznat. Pristup odbijen.');
    }

    const sessionUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || Role.USER,
      tier: user.tier || 'Professional',
      createdAt: user.createdAt,
      xp: user.xp || 0,
      level: user.level || 1,
      badges: user.badges || [],
      preferences: user.preferences || DEFAULT_PREFERENCES,
      googleConnected: user.googleConnected,
      avatarUrl: user.avatarUrl
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  loginWithGoogle: async (email: string, name: string, countryCode: string = 'US'): Promise<User> => {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    let user = accounts.find((a: any) => a.email === email);

    if (!user) {
      user = {
        id: uuidv4(),
        name: name || email.split('@')[0],
        email: email,
        role: Role.USER,
        tier: 'Professional',
        createdAt: Date.now(),
        xp: 0,
        level: 1,
        badges: [],
        googleConnected: true,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=random`,
        preferences: {
          ...DEFAULT_PREFERENCES,
          country: countryCode,
          language: countryToLang[countryCode] || 'en'
        }
      };
      accounts.push(user);
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }

    const sessionUser = { ...user };
    delete (sessionUser as any).password;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser as User;
  },

  register: (name: string, email: string, password: string, country: string = 'US'): User => {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    if (accounts.find((a: any) => a.email === email)) {
      throw new Error('Identitet već postoji u sistemu.');
    }

    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      role: Role.USER,
      tier: 'Professional',
      createdAt: Date.now(),
      xp: 0,
      level: 1,
      badges: [],
      preferences: {
        ...DEFAULT_PREFERENCES,
        country,
        language: countryToLang[country] || 'en'
      }
    };

    accounts.push({ ...newUser, password });
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    sessionStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const session = sessionStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
};
