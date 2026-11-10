import React, { useState } from 'react';
import {
  Activity,
  Globe,
  Volume2,
  ShieldAlert,
  LogOut,
  Sparkles,
  Baby,
  User,
  ChevronDown,
} from 'lucide-react';
import { AshaUser, LanguageOption, VoicePersona } from '../types';
import { LANGUAGES } from '../constants/data';
import { ttsService } from '../services/ttsService';

interface HeaderProps {
  currentUser: AshaUser;
  selectedLanguage: LanguageOption;
  onLanguageChange: (lang: LanguageOption) => void;
  voicePersona: VoicePersona;
  onVoicePersonaChange: (persona: VoicePersona) => void;
  isSpeaking: boolean;
  onStopSpeech: () => void;
  highPriorityAlertCount: number;
  onLogout: () => void;
  onOpenVoiceSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  selectedLanguage,
  onLanguageChange,
  voicePersona,
  onVoicePersonaChange,
  isSpeaking,
  onStopSpeech,
  highPriorityAlertCount,
  onLogout,
  onOpenVoiceSettings,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleVoicePersona = () => {
    const nextPersona: VoicePersona = voicePersona === 'woman' ? 'child' : 'woman';
    onVoicePersonaChange(nextPersona);
    ttsService.preview(nextPersona, selectedLanguage.speechCode);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 px-3.5 py-2.5 sm:px-6 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#16866A] to-[#0f5c49] flex items-center justify-center text-white shadow-md shadow-[#16866A]/25 ring-2 ring-white">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg font-black text-[#243B35] tracking-tight leading-none">
                SwasthyaSakhi
              </h1>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#16866A] bg-[#E5F4ED] px-2 py-0.5 rounded-md">
                ASHA Register
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Namaste, <span className="font-bold text-slate-800">{currentUser.name}</span> · {currentUser.subCentre}
            </p>
          </div>
        </div>

        {/* Right Controls: Voice Persona Switcher, Language Selector, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Active Speaking / Barge-in Indicator */}
          {isSpeaking && (
            <button
              onClick={onStopSpeech}
              title="Interrupt assistant voice"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold animate-pulse shadow-sm hover:bg-amber-600 active:scale-95 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5 animate-bounce" />
              <span className="hidden sm:inline">Speaking</span> (Stop)
            </button>
          )}

          {/* Voice Persona Button with Quick Test & Settings Trigger */}
          <button
            onClick={onOpenVoiceSettings}
            title="Configure & Test Natural Woman's Voice"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 shadow-xs ${
              voicePersona === 'child'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            {voicePersona === 'child' ? (
              <>
                <Baby className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Child Voice</span>
                <span className="sm:hidden">Child</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-[#16866A]" />
                <span className="hidden sm:inline">Woman's Voice</span>
                <span className="sm:hidden">Woman</span>
              </>
            )}
            <Volume2 className="w-3 h-3 text-slate-400" />
          </button>

          {/* Emergency Alert Indicator */}
          {highPriorityAlertCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-100 text-red-700 border border-red-200 text-xs font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>{highPriorityAlertCount} Alert</span>
            </div>
          )}

          {/* Language Selector */}
          <div className="relative flex items-center bg-[#E5F4ED] rounded-xl px-2 py-1 sm:px-2.5 sm:py-1.5 border border-[#16866A]/20">
            <Globe className="w-3.5 h-3.5 text-[#16866A] mr-1" />
            <select
              value={selectedLanguage.code}
              onChange={(e) => {
                const found = LANGUAGES.find((l) => l.code === e.target.value);
                if (found) onLanguageChange(found);
              }}
              aria-label="Select spoken language"
              className="bg-transparent text-xs font-bold text-[#16866A] focus:outline-none cursor-pointer pr-1"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-slate-800 bg-white">
                  {lang.nativeLabel} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          {/* Profile Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full ring-2 ring-[#16866A]/20 hover:ring-[#16866A]/40 transition-all bg-white"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200">
                <img
                  src={currentUser.avatarUrl || '/src/assets/images/asha_worker_profile_1794328374007.jpg'}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500 mr-1" />
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="pb-2.5 border-b border-slate-100">
                  <p className="font-extrabold text-sm text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] font-semibold text-[#16866A]">{currentUser.role}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{currentUser.ashaId}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{currentUser.subCentre}</p>
                </div>

                <div className="pt-2 space-y-1.5 text-xs">
                  <button
                    onClick={() => {
                      toggleVoicePersona();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between font-medium text-slate-700"
                  >
                    <span>Assistant Voice:</span>
                    <span className="font-bold text-[#16866A]">
                      {voicePersona === 'child' ? "Child (Chhoti Sakhi)" : "Woman (Didi)"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out / Switch Worker</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
