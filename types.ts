
export enum IntelligenceMode {
  DEFAULT = 'default',
  REASONING = 'reasoning',
  CODE = 'code',
  CREATIVE = 'creative',
  IMAGE_GEN = 'image_gen',
  ARCADE_ENGINE = 'arcade_engine',
  RESEARCH = 'research',
  LIVE = 'live',
  COUNSEL = 'counsel'
}

export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  ADMIN = 'admin'
}

export interface CounselPerspective {
  agent: 'Architect' | 'Critic' | 'Visionary';
  content: string;
}

export type SupportedLanguage = 'sr' | 'en' | 'de' | 'fr' | 'es';

export interface UserPreferences {
  theme: 'zinc' | 'onyx' | 'cyber' | 'custom';
  accentColor: string;
  backgroundColor: string;
  density: 'compact' | 'relaxed';
  language: SupportedLanguage;
  country: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  tier: 'Standard' | 'Professional' | 'Enterprise' | 'Owner';
  createdAt: number;
  xp: number;
  level: number;
  badges: any[];
  preferences: UserPreferences;
  googleConnected?: boolean;
  avatarUrl?: string;
}

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
  thought?: string;
}

export interface Message {
  id: string;
  role: Role;
  parts: MessagePart[];
  timestamp: number;
  modelUsed?: string;
  mode?: IntelligenceMode;
  groundingChunks?: any[];
  counsel?: CounselPerspective[];
  metadata?: {
    usedMemory?: boolean;
    isGame?: boolean;
    gameCode?: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  mode: IntelligenceMode;
  selectedModelId: string;
}

export interface AppState {
  currentUser: User | null;
  activeConversationId: string | null;
  conversations: Record<string, Conversation>;
  isSidebarOpen: boolean;
  theme: 'dark' | 'light';
  currentMode: IntelligenceMode;
  selectedModelId: string;
  isProcessing: boolean;
  showSettings: boolean;
  showAdminConsole: boolean;
  showTemplates: boolean;
  needsApiKey: boolean;
  liveSessionActive: boolean;
}

export type ModelConfig = {
  id: string;
  name: string;
  provider: string;
  icon: string;
  badge?: string;
  subtext?: string;
  isNew?: boolean;
};
