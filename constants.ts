
import { IntelligenceMode, ModelConfig } from './types';

export const APP_VERSION = '2.1.0-counsel';
export const STORAGE_KEY = 'newai_vault_v2';

export const MODELS = {
  FLASH: 'gemini-3-flash-preview',
  PRO: 'gemini-3-pro-preview',
  IMAGE_PRO: 'gemini-3-pro-image-preview',
  IMAGE_FLASH: 'gemini-2.5-flash-image',
  MAPS_SUPPORT: 'gemini-2.5-flash',
};

export const QUICK_ACTION_PREFIXES = [
  'Analiziraj ovaj koncept iz tri perspektive: ',
  'Istraži detaljno temu: ',
  'Reši logički problem: ',
  'Generiši vizuelni koncept za: ',
  'Analiziraj ovaj koncept iz tri perspektive:'
];

export const MODEL_LIST: ModelConfig[] = [
  { id: 'gemini-3-pro', name: 'NewAI 3 Pro Ultra', provider: 'NewAI', icon: 'gemini', badge: 'Ultra' },
  { id: 'gemini-3-flash', name: 'NewAI 3 Flash', provider: 'NewAI', icon: 'gemini', subtext: 'Speed optimized' },
  { id: 'sonar', name: 'Sonar Search', provider: 'NewAI', icon: 'sonar' },
  { id: 'gpt-5-2', name: 'NewAI 5.2 Turbo', provider: 'NewAI', icon: 'openai' },
  { id: 'claude-opus-4-6', name: 'NewAI Opus Max', provider: 'NewAI', icon: 'anthropic', badge: 'Max' },
];

export const SYSTEM_PROMPTS = {
  [IntelligenceMode.DEFAULT]: `You are NewAI Omni, a high-performance intelligence system.`,
  [IntelligenceMode.REASONING]: `Deconstruct complex problems step-by-step using high-budget thinking.`,
  [IntelligenceMode.RESEARCH]: `Professional researcher. Use tools to find factual news.`,
  [IntelligenceMode.CODE]: `Senior software architect. Provide clean code.`,
  [IntelligenceMode.CREATIVE]: `Master of synthesis and metaphors.`,
  [IntelligenceMode.IMAGE_GEN]: `Creative director for high-fidelity visuals.`,
  [IntelligenceMode.ARCADE_ENGINE]: `Senior Game Developer. HTML5 expert.`,
  [IntelligenceMode.COUNSEL]: `Act as 'The Counsel'. Provide a primary response, then provide distinct perspectives from an 'Architect' (structure), 'Critic' (risks), and 'Visionary' (future potential).`
};

export const MAX_CONTEXT_MESSAGES = 30;
