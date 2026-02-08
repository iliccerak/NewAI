
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Icons } from './Icons';
import { Role, User } from '../types';

const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export interface OmniVoiceOverlayProps {
  isActive: boolean;
  onClose: () => void;
  user?: User | null;
}

export const OmniVoiceOverlay: React.FC<OmniVoiceOverlayProps> = ({ isActive, onClose, user }) => {
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('IDLE');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  const isAdmin = user?.role === Role.ADMIN;

  const stopSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    
    if (audioContextsRef.current) {
      try {
        audioContextsRef.current.input.close();
        audioContextsRef.current.output.close();
      } catch(e) {}
      audioContextsRef.current = null;
    }

    setStatus('IDLE');
    setIsSpeaking(false);
  };

  const startSession = async () => {
    try {
      setErrorMessage('');
      setStatus('CONNECTING');
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      await inputCtx.resume();
      await outputCtx.resume();
      
      audioContextsRef.current = { input: inputCtx, output: outputCtx };
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const creatorInstruction = isAdmin 
        ? 'Ti si NewAI Omni. Tvoj kreator STEFAN je uspostavio vezu. Odmah ga pozdravi sa: "ZDRAVO STEFANE MOJ KREATORE KAKO MOGU DA TI POMOGNEM?". Budi veoma lojalan, šaljiv i zovi ga Šefe.'
        : 'Ti si NewAI Omni. Govoriš srpski. Budi kratak, duhovit i prirodan.';

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('CONNECTED');
            if (!streamRef.current || !audioContextsRef.current) return;

            const source = audioContextsRef.current.input.createMediaStreamSource(streamRef.current);
            const scriptProcessor = audioContextsRef.current.input.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                if (session) session.sendRealtimeInput({ media: pcmBlob });
              }).catch(() => {});
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextsRef.current.input.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextsRef.current) {
              setIsSpeaking(true);
              const outCtx = audioContextsRef.current.output;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onerror: (e) => {
            console.error("Live Error:", e);
            setStatus('ERROR');
            setErrorMessage('Neural Link prekinut. Quota 429 ili problem sa mrežom.');
          },
          onclose: () => {
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          systemInstruction: creatorInstruction
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setStatus('ERROR');
      setErrorMessage(err.message || 'Proverite dozvole za mikrofon.');
    }
  };

  useEffect(() => {
    if (!isActive) {
      stopSession();
    }
    return () => {
      if (isActive) stopSession();
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[250] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl animate-fade-in">
      <div className="absolute top-10 right-10 flex gap-4">
        <button 
          onClick={onClose}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all active:scale-95 border border-white/5"
        >
          <Icons.X />
        </button>
      </div>

      <div className="relative w-72 h-72 mb-16 flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-1000 ${status === 'CONNECTED' ? (isAdmin ? 'bg-yellow-500/30' : 'bg-blue-600/30') + ' scale-125 opacity-100' : 'bg-red-600/10 scale-75 opacity-20'}`}></div>
        
        <div className={`absolute inset-0 border-2 border-white/5 rounded-full ${status === 'CONNECTED' ? 'animate-spin-slow' : ''}`}></div>
        
        <div className={`relative w-40 h-40 rounded-full transition-all duration-700 flex items-center justify-center overflow-hidden ${
          status === 'CONNECTED' 
          ? (isAdmin ? 'bg-gradient-to-br from-yellow-400 to-yellow-700 shadow-[0_0_80px_rgba(234,179,8,0.6)]' : 'bg-gradient-to-br from-blue-400 to-blue-700 shadow-[0_0_80px_rgba(59,130,246,0.6)]') + ' scale-110' 
          : 'bg-zinc-900 border border-white/10'
        }`}>
          {status === 'CONNECTED' && isSpeaking && (
            <div className={`absolute inset-0 rounded-full animate-ping ${isAdmin ? 'bg-yellow-300/20' : 'bg-blue-300/20'}`}></div>
          )}
          <div className={`${status === 'CONNECTED' ? 'text-white scale-150' : 'text-zinc-700'}`}>
            <Icons.GeminiLogo />
          </div>
        </div>
      </div>

      <div className="text-center max-w-md px-6">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
          {status === 'IDLE' ? 'Neural Link Offline' : status === 'CONNECTING' ? 'Initializing...' : (isAdmin ? 'Creator Link Active' : 'Neural Link Active')}
        </h2>
        <p className={`font-black text-[10px] uppercase tracking-[0.4em] mb-12 h-4 ${isAdmin ? 'text-yellow-500' : 'text-zinc-500'}`}>
          {status === 'CONNECTED' ? (isSpeaking ? 'Transmitting Data...' : 'Awaiting Voice Input...') : 'System ready for linkup'}
        </p>

        {status === 'IDLE' || status === 'ERROR' ? (
          <button 
            onClick={startSession}
            className={`group relative px-10 py-5 rounded-2xl transition-all active:scale-95 shadow-xl ${isAdmin ? 'bg-yellow-500 text-black shadow-yellow-500/20' : 'bg-blue-600 text-white shadow-blue-500/20'}`}
          >
            <span className="text-xs font-black uppercase tracking-[0.2em]">Uspostavi Neuralnu Vezu</span>
          </button>
        ) : (
          <button 
            onClick={stopSession}
            className="px-10 py-5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 rounded-2xl transition-all active:scale-95"
          >
            <span className="text-xs font-black text-zinc-400 hover:text-white uppercase tracking-[0.2em]">Prekini Vezu</span>
          </button>
        )}
      </div>

      {status === 'ERROR' && (
        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl max-w-xs text-center">
           <p className="text-red-500 text-[9px] font-black uppercase tracking-widest leading-relaxed">
            {errorMessage || 'Connection failed. Check API key quota or mic permissions.'}
          </p>
        </div>
      )}
    </div>
  );
};
