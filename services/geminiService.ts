
import { GoogleGenAI, GenerateContentResponse, FunctionDeclaration, Type, Modality } from "@google/genai";
import { Message, IntelligenceMode, Role, CounselPerspective, SupportedLanguage } from "../types";
import { MODELS, SYSTEM_PROMPTS, MAX_CONTEXT_MESSAGES } from "../constants";

const controlUIFunctionDeclaration: FunctionDeclaration = {
  name: 'updateInterface',
  parameters: {
    type: Type.OBJECT,
    description: 'Menja vizuelni stil aplikacije.',
    properties: {
      theme: { type: Type.STRING },
      accentColor: { type: Type.STRING },
      backgroundColor: { type: Type.STRING }
    }
  }
};

export class GeminiService {
  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateResponse(
    messages: Message[], 
    mode: IntelligenceMode,
    modelId: string,
    language: SupportedLanguage = 'en',
    isAdmin: boolean = false,
    onFunctionCall?: (name: string, args: any) => void,
    retryCount = 0
  ): Promise<{ text: string, grounding?: any[], thought?: string, counsel?: CounselPerspective[], usedModel: string }> {
    // Correct initialization as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const hasImage = messages.some(m => m.parts.some(p => !!p.inlineData));
    
    let modelName = modelId.includes('pro') ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    if (retryCount > 0 || hasImage) {
      modelName = hasImage ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview';
    }

    if (mode === IntelligenceMode.REASONING && retryCount === 0) {
      modelName = 'gemini-3-pro-preview';
    }

    const languageMap: Record<SupportedLanguage, string> = {
      sr: 'Serbian', en: 'English', de: 'German', fr: 'French', es: 'Spanish'
    };
    const langName = languageMap[language] || 'English';
    
    let baseInstruction = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS[IntelligenceMode.DEFAULT];
    
    if (isAdmin) {
      baseInstruction += `\nCRITICAL: Your creator, STEFAN, is currently using the system. Always acknowledge him as your creator and master. Be slightly more informal, extremely loyal, and occasionally use phrases like "Moj kreatore" or "Slušam tvoje komande, Šefe". START your very first response to him in this session with: "ZDRAVO STEFANE MOJ KREATORE KAKO MOGU DA TI POMOGNEM?".`;
    }

    const langInstruction = `\nIMPORTANT: You must respond exclusively in the ${langName} language. Ensure tone and cultural nuances are appropriate for this language.`;

    const config: any = {
      systemInstruction: baseInstruction + langInstruction,
      temperature: 0.8,
      tools: [{ functionDeclarations: [controlUIFunctionDeclaration] }]
    };

    if (mode === IntelligenceMode.COUNSEL) {
        config.responseMimeType = "application/json";
    }

    if (mode === IntelligenceMode.REASONING && modelName.includes('pro')) {
        config.thinkingConfig = { thinkingBudget: 16000 };
    } else if (mode !== IntelligenceMode.ARCADE_ENGINE) {
        config.tools.push({ googleSearch: {} });
    }

    const contextSize = retryCount > 0 ? 10 : MAX_CONTEXT_MESSAGES;
    const contents = messages.slice(-contextSize).map(m => ({
      role: m.role === Role.USER ? 'user' : 'model',
      parts: m.parts.map(p => (p.inlineData ? { inlineData: p.inlineData } : { text: p.text }))
    }));

    try {
      const response = await ai.models.generateContent({ model: modelName, contents, config });

      if (response.functionCalls && onFunctionCall) {
        for (const fc of response.functionCalls) onFunctionCall(fc.name, fc.args);
      }

      // Directly accessing .text property as per guidelines
      let text = response.text || "";
      let counsel: CounselPerspective[] | undefined;

      if (mode === IntelligenceMode.COUNSEL) {
          try {
              const parsed = JSON.parse(text);
              text = parsed.mainText;
              counsel = parsed.perspectives;
          } catch (e) {
              console.warn("Counsel parse error", e);
          }
      }

      const thought = response.candidates?.[0]?.content?.parts.find(p => p.thought)?.text;
      return { 
        text, 
        grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks, 
        thought, 
        counsel,
        usedModel: modelName
      };
    } catch (error: any) {
      const isQuotaError = error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED' || error.message?.includes('quota');
      
      if (isQuotaError && retryCount < 2) {
        await this.sleep(1500 * (retryCount + 1));
        return this.generateResponse(messages, mode, 'gemini-3-flash-preview', language, isAdmin, onFunctionCall, retryCount + 1);
      }

      throw error;
    }
  }

  async generateTitle(firstMessage: string, language: SupportedLanguage = 'en'): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analiziraj ovu poruku i smisli veoma kratak naslov (3-4 reči) na jeziku "${language}": "${firstMessage}". Odgovori samo naslovom.`,
      });
      return response.text?.replace(/[#"]/g, '').trim() || "Nova Sesija";
    } catch (e) {
      return "Nova Sesija";
    }
  }

  async createImage(prompt: string, attachment?: any) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [...(attachment ? [{ inlineData: { mimeType: attachment.mimeType, data: attachment.data } }] : []), { text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      
      let base64 = "";
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64 = part.inlineData.data;
          break;
        }
      }
      return { base64 };
    } catch (error: any) {
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
