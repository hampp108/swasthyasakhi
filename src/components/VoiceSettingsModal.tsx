import React, { useState, useEffect } from 'react';
import {
  Volume2,
  X,
  Play,
  Check,
  Sparkles,
  Baby,
  User,
  Sliders,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { VoicePersona } from '../types';
import { ttsService, TTSState } from '../services/ttsService';

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
  const [selectedVoice, setSelectedVoice] = useState<string>(
    ttsService.getSelectedVoiceName() || ''
  );
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  useEffect(() => {
    const unsub = ttsService.subscribe((state) => {
      setTtsState(state);
      if (state.selectedVoiceName) {
        setSelectedVoice(state.selectedVoiceName);
      }
      setIsPlayingSample(state.isSpeaking);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleSelectPersona = (persona: VoicePersona) => {
    onVoicePersonaChange(persona);
    ttsService.preview(persona, languageCode);
  };

  const handleSelectCustomVoice = (voiceName: string) => {
    setSelectedVoice(voiceName);
    ttsService.setCustomVoice(voiceName);
    ttsService.preview(voicePersona, languageCode);
  };

  const handleTestCurrentVoice = () => {
    ttsService.preview(voicePersona, languageCode);
  };

  // Filter voices that are female or recommended
  const femaleVoices = ttsState.availableVoices.filter((v) => v.isFemale);
  const displayVoices = femaleVoices.length > 0 ? femaleVoices : ttsState.availableVoices;

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
              <h2 className="text-base font-extrabold text-[#243B35]">
                Voice Read-Back Settings
              </h2>
              <p className="text-xs text-slate-500">
                Natural Indian healthcare voice synthesizer
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
                    "Didi" · Elder Sister
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    Warm, maternal, calm, compassionate tone for healthcare visits.
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
                    "Chhoti Sakhi" · Little Helper
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    Bright, cheerful, clear young voice, sweet and encouraging.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Active System Synthesizer Voice */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Selected Device Voice:
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Verified Female Register
              </span>
            </div>

            {displayVoices.length > 0 ? (
              <select
                value={selectedVoice}
                onChange={(e) => handleSelectCustomVoice(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16866A]"
              >
                {displayVoices.map((v, i) => (
                  <option key={i} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Using built-in natural female synthesizer
              </p>
            )}

            <p className="text-[11px] text-slate-500">
              Male voices are strictly excluded to guarantee a pleasant, warm woman's voice.
            </p>
          </div>

          {/* Instant Test Button */}
          <div className="pt-1">
            <button
              onClick={handleTestCurrentVoice}
              className="w-full py-3.5 rounded-2xl bg-[#16866A] hover:bg-[#13745c] text-white font-extrabold text-sm shadow-md shadow-[#16866A]/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {isPlayingSample
                  ? 'Playing Voice Sample...'
                  : `Hear Sample: ${voicePersona === 'child' ? "Child's Voice" : "Woman's Voice"}`}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Preferences saved automatically</span>
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
