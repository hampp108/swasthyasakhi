import React, { useState, useEffect } from 'react';
import {
  Volume2,
  X,
  Play,
  Check,
  Sparkles,
  Baby,
  User,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { VoicePersona } from '../types';
import { ttsService, TTSState, GNANI_VOICES } from '../services/ttsService';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voicePersona: VoicePersona;
  onVoicePersonaChange: (persona: VoicePersona) => void;
  languageCode: string;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  voicePersona,
  onVoicePersonaChange,
  languageCode,
}) => {
  const [ttsState, setTtsState] = useState<TTSState>(ttsService.getState());
  const [selectedGnaniVoice, setSelectedGnaniVoice] = useState<string>(
    ttsService.getSelectedGnaniVoice() || 'Shivani'
  );
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  useEffect(() => {
    const unsub = ttsService.subscribe((state) => {
      setTtsState(state);
      setSelectedGnaniVoice(state.selectedGnaniVoice);
      setIsPlayingSample(state.isSpeaking);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleSelectPersona = (persona: VoicePersona) => {
    onVoicePersonaChange(persona);
    ttsService.preview(persona, languageCode);
  };

  const handleSelectVoice = (voiceId: string) => {
    setSelectedGnaniVoice(voiceId);
    ttsService.setGnaniVoice(voiceId);
    ttsService.preview(voicePersona, languageCode);
  };

  const handleTestCurrentVoice = () => {
    ttsService.preview(voicePersona, languageCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#E5F4ED] to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#16866A] text-white flex items-center justify-center font-bold shadow-sm shadow-[#16866A]/20">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#243B35]">
                  Voice Read-Back Settings
                </h2>
                <span className="text-[10px] font-black bg-emerald-100 text-[#16866A] px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <Zap className="w-2.5 h-2.5 fill-current" />
                  <span>Gnani.ai Timbre v3.0</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Connected to Gnani Voice AI · Studio Indian Voice Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Active Engine Badge */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-emerald-950 block">
                  Active Voice Model: Gnani Voice AI
                </span>
                <span className="text-[11px] text-emerald-700">
                  Model: Timbre v3.0 · High-accuracy Indic Speech
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold bg-white px-2 py-1 rounded-md text-emerald-800 border border-emerald-200">
              API: Connected
            </span>
          </div>

          {/* Section 1: Choose Persona */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
              1. Choose Assistant Persona
            </span>

            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Woman's Voice */}
              <button
                type="button"
                onClick={() => handleSelectPersona('woman')}
                className={`p-3.5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                  voicePersona === 'woman'
                    ? 'border-[#16866A] bg-[#E5F4ED]/60 shadow-sm ring-2 ring-[#16866A]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#16866A] text-white flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  {voicePersona === 'woman' && (
                    <span className="w-5 h-5 rounded-full bg-[#16866A] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Woman's Voice
                  </h3>
                  <span className="text-[11px] font-semibold text-[#16866A] block mt-0.5">
                    "Didi" · Elder Sister (Shivani)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    Warm, maternal, compassionate Indian healthcare voice.
                  </p>
                </div>
              </button>

              {/* Option 2: Small Child's Voice */}
              <button
                type="button"
                onClick={() => handleSelectPersona('child')}
                className={`p-3.5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                  voicePersona === 'child'
                    ? 'border-[#16866A] bg-[#E5F4ED]/60 shadow-sm ring-2 ring-[#16866A]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                    <Baby className="w-4 h-4" />
                  </div>
                  {voicePersona === 'child' && (
                    <span className="w-5 h-5 rounded-full bg-[#16866A] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Child's Voice
                  </h3>
                  <span className="text-[11px] font-semibold text-amber-700 block mt-0.5">
                    "Chhoti Sakhi" · Little Helper (Riyaa)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    Bright, cheerful, clear young voice, sweet and lively.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Gnani Female Voices List */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
              2. Select Gnani Indic Voice Model
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GNANI_VOICES.map((v) => {
                const isSelected = selectedGnaniVoice === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVoice(v.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'border-[#16866A] bg-emerald-50/70 shadow-xs ring-1 ring-[#16866A]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">
                          {v.name}
                        </span>
                        {v.isDefaultWoman && (
                          <span className="text-[9px] bg-[#16866A] text-white px-1.5 py-0.2 rounded font-bold">
                            Default Woman
                          </span>
                        )}
                        {v.isDefaultChild && (
                          <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-bold">
                            Default Child
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                        {v.description}
                      </p>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-[#16866A] bg-[#16866A] text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instant Test Button */}
          <div className="pt-2">
            <button
              onClick={handleTestCurrentVoice}
              className="w-full py-3.5 rounded-2xl bg-[#16866A] hover:bg-[#13745c] text-white font-extrabold text-sm shadow-md shadow-[#16866A]/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {isPlayingSample
                  ? 'Playing Gnani Voice Sample...'
                  : `Hear Sample: ${selectedGnaniVoice} (${voicePersona === 'child' ? "Child" : "Woman"})`}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16866A]" />
            <span>Gnani Vachana AI Model Active</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
