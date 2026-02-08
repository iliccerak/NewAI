
import { Conversation, AppState } from '../types';
import { STORAGE_KEY } from '../constants';

const GLOBAL_CONFIG_KEY = 'newai_global_branding';

export const storageService = {
  getStorageKey: (userId: string) => `${STORAGE_KEY}_${userId}`,

  saveState: (state: Partial<AppState>, userId: string) => {
    try {
      if (!userId) return;
      const storageKey = storageService.getStorageKey(userId);
      const existing = localStorage.getItem(storageKey);
      const data = existing ? JSON.parse(existing) : {};
      const newState = { ...data, ...state };

      if (newState.conversations) {
        const convIds = Object.keys(newState.conversations);
        if (convIds.length > 50) {
          const sortedIds = convIds.sort((a, b) => 
            newState.conversations[b].updatedAt - newState.conversations[a].updatedAt
          );
          const preservedIds = sortedIds.slice(0, 50);
          const prunedConversations: Record<string, Conversation> = {};
          preservedIds.forEach(id => {
            prunedConversations[id] = newState.conversations[id];
          });
          newState.conversations = prunedConversations;
        }
      }

      localStorage.setItem(storageKey, JSON.stringify(newState));
    } catch (e) {
      console.error('Persistence failure:', e);
    }
  },

  loadState: (userId: string): Partial<AppState> | null => {
    try {
      if (!userId) return null;
      const storageKey = storageService.getStorageKey(userId);
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  // Global Branding Storage
  saveGlobalBranding: (config: { logo?: string, appName?: string, primaryColor?: string }) => {
    localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify(config));
  },

  loadGlobalBranding: () => {
    const data = localStorage.getItem(GLOBAL_CONFIG_KEY);
    return data ? JSON.parse(data) : { appName: 'NewAI' };
  },

  deleteConversation: (id: string, userId: string) => {
    const state = storageService.loadState(userId);
    if (state && state.conversations) {
      delete state.conversations[id];
      storageService.saveState(state, userId);
    }
  }
};
