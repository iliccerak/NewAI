
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { IntelligenceMode, SupportedLanguage } from '../types';
import { ModelSelector } from './ModelSelector';
import { MODEL_LIST } from '../constants';
import { i18n } from '../services/i18nService';

interface ChatInputProps {
  onSendMessage: (text: string, mode: IntelligenceMode, attachment?: { mimeType: string, data: string }) => void;
  disabled: boolean;
  activeMode: IntelligenceMode;
  onModeChange: (mode: IntelligenceMode) => void;
  selectedModelId: string;
  onModelChange: (id: string) => void;
  initialValue?: string;
  language: SupportedLanguage;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, disabled, activeMode, onModeChange, selectedModelId, onModelChange, initialValue = '', language
}) => {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<{ mimeType: string, data: string, preview: string } | null>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      setTimeout(() => {
        textareaRef.current?.focus();
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.value.length;
          textareaRef.current.selectionEnd = textareaRef.current.value.length;
        }
      }, 100);
    }
  }, [initialValue]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || attachment) && !disabled) {
      onSendMessage(input.trim(), activeMode, attachment ? { mimeType: attachment.mimeType, data: attachment.data } : undefined);
      setInput('');
      setAttachment(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setAttachment({
          mimeType: file.type,
          data: base64,
          preview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const activeModel = MODEL_LIST.find(m => m.id === selectedModelId) || MODEL_LIST[0];

  return (
    <div className="max-w-4xl mx-auto w-full px-4">
      {attachment && (
        <div className="mb-4 animate-fade-in flex items-center gap-4 px-6 py-4 bg-white/[0.03] border border-white/5 rounded-[2rem] backdrop-blur-xl">
          <img src={attachment.preview} className="w-12 h-12 rounded-lg object-cover" />
          <p className="text-[10px] font-black text-white uppercase tracking-widest flex-1">Attachment ready</p>
          <button onClick={() => setAttachment(null)} className="text-zinc-500 hover:text-white"><Icons.X /></button>
        </div>
      )}

      <div className="bg-[#0c0c0c] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-visible">
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.03] relative">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-zinc-500 hover:text-white hover:bg-white/5"
            >
              <Icons.GeminiLogo />
              {activeModel.name}
              <Icons.ChevronDown />
            </button>
            {showModelSelector && (
              <div className="absolute bottom-full left-0 mb-3 z-[70]">
                <ModelSelector selectedId={selectedModelId} onSelect={onModelChange} onClose={() => setShowModelSelector(false)} />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {[IntelligenceMode.DEFAULT, IntelligenceMode.RESEARCH, IntelligenceMode.REASONING, IntelligenceMode.CODE, IntelligenceMode.IMAGE_GEN, IntelligenceMode.ARCADE_ENGINE].map((mode) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${activeMode === mode ? 'bg-white text-black' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`}
              >
                {mode === IntelligenceMode.DEFAULT ? 'Auto' : mode}
              </button>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="relative flex items-end p-6 gap-4">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-zinc-500 hover:text-white transition-all"><Icons.Paperclip /></button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={i18n.t('askOmni', language)}
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-zinc-100 placeholder-zinc-800 py-3 resize-none text-[15px] scrollbar-hide font-medium"
            disabled={disabled}
          />
          <button
            type="submit"
            disabled={(!input.trim() && !attachment) || disabled}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-xl active:scale-90 shrink-0 ${(input.trim() || attachment) && !disabled ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-zinc-800'}`}
          >
            <Icons.Send />
          </button>
        </form>
      </div>
    </div>
  );
};
