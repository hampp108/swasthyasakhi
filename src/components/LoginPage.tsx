import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  Lock,
  Phone,
  ArrowRight,
  Sparkles,
  Globe,
  Volume2,
  Check,
  Building2,
  Award,
  KeyRound,
  Users,
} from 'lucide-react';
import { AshaUser, LanguageOption, VoicePersona } from '../types';
import { PRESET_ASHA_USERS, LANGUAGES } from '../constants/data';
import { ttsService } from '../services/ttsService';

interface LoginPageProps {
  onLogin: (user: AshaUser) => void;
  selectedLanguage: LanguageOption;
  onLanguageChange: (lang: LanguageOption) => void;
  voicePersona: VoicePersona;
  onVoicePersonaChange: (persona: VoicePersona) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  selectedLanguage,
  onLanguageChange,
  voicePersona,
  onVoicePersonaChange,
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'mpin' | 'phone'>('demo');
  const [selectedUser, setSelectedUser] = useState<AshaUser>(PRESET_ASHA_USERS[0]);
  const [mpin, setMpin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('9845123410');
  const [ashaIdInput, setAshaIdInput] = useState('ASHA-KA-BLR-0412');
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickDemoLogin = (user: AshaUser) => {
    setSelectedUser(user);
    // Greet user aloud with chosen voice persona
    const greeting =
      voicePersona === 'child'
        ? `Namaste ${user.name.split(' ')[0]} Didi! I am your small assistant. Ready for your field visits!`
        : `Namaste ${user.name}. Welcome to SwasthyaSakhi. Your field register is loaded and ready.`;
    ttsService.speak(greeting, selectedLanguage.speechCode);
    onLogin(user);
  };

  const handleMpinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mpin.length < 4) {
      setErrorMsg('Please enter a 4-digit Sub-Centre MPIN (e.g. 1234)');
      return;
    }
    handleQuickDemoLogin(selectedUser);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit registered mobile number');
      return;
    }
    handleQuickDemoLogin(selectedUser);
  };

  const handleTestVoicePersona = (persona: VoicePersona) => {
    onVoicePersonaChange(persona);
    ttsService.preview(persona, selectedLanguage.speechCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FAF8] via-[#Eef6f2] to-[#E5F4ED] flex flex-col justify-between py-6 px-4 sm:px-6 font-sans">
      {/* Top Government Health Mission Ribbon */}
      <header className="max-w-4xl mx-auto w-full flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-950/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>राष्ट्रीय स्वास्थ्य मिशन · National Health Mission (NHM)</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center bg-white/90 backdrop-blur-md rounded-xl px-2.5 py-1 border border-slate-200 text-xs shadow-xs">
            <Globe className="w-3.5 h-3.5 text-[#16866A] mr-1.5" />
            <select
              value={selectedLanguage.code}
              onChange={(e) => {
                const found = LANGUAGES.find((l) => l.code === e.target.value);
                if (found) onLanguageChange(found);
              }}
              aria-label="App Language"
              className="bg-transparent font-bold text-[#16866A] focus:outline-none cursor-pointer text-xs"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeLabel} ({lang.label})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="max-w-md mx-auto w-full my-auto py-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-950/10 border border-emerald-100 overflow-hidden">
          {/* Card Top Brand Banner with Rich Emerald Gradient */}
          <div className="relative bg-gradient-to-b from-[#16866A] to-[#0f5c49] text-white p-7 text-center overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-white text-[#16866A] flex items-center justify-center mx-auto shadow-lg shadow-black/20 ring-4 ring-white/20">
                <Activity className="w-9 h-9 stroke-[2.2]" />
              </div>

              <h1 className="text-2xl font-black tracking-tight text-white mt-3">
                SwasthyaSakhi
              </h1>
              <p className="text-xs font-semibold text-emerald-100 tracking-wide uppercase">
                ASHA Voice Field Register · स्वास्थ्य सखी
              </p>
              <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-emerald-100 mt-1 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>MoHFW Verified Field Portal</span>
              </div>
            </div>
          </div>

          {/* Voice Persona Selector (Woman's Voice vs. Small Child's Voice) */}
          <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#16866A] flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" />
                <span>Assistant Voice Persona:</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Spoken Read-back</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Option 1: Woman's Voice */}
              <button
                type="button"
                onClick={() => handleTestVoicePersona('woman')}
                className={`p-2.5 rounded-2xl text-left border transition-all flex items-center justify-between ${
                  voicePersona === 'woman'
                    ? 'bg-white border-[#16866A] shadow-sm text-[#16866A] ring-2 ring-[#16866A]/20'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Woman's Voice</span>
                    {voicePersona === 'woman' && (
                      <Check className="w-3.5 h-3.5 text-[#16866A]" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    Warm elder sister (Didi)
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-[#16866A] font-semibold px-1.5 py-0.5 rounded">
                  Test
                </span>
              </button>

              {/* Option 2: Small Child's Voice */}
              <button
                type="button"
                onClick={() => handleTestVoicePersona('child')}
                className={`p-2.5 rounded-2xl text-left border transition-all flex items-center justify-between ${
                  voicePersona === 'child'
                    ? 'bg-white border-[#16866A] shadow-sm text-[#16866A] ring-2 ring-[#16866A]/20'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Child's Voice</span>
                    {voicePersona === 'child' && (
                      <Check className="w-3.5 h-3.5 text-[#16866A]" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    Bright Chhoti Sakhi
                  </span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                  Test
                </span>
              </button>
            </div>
          </div>

          {/* Login Tabs */}
          <div className="p-6 space-y-5">
            {/* Tab navigation */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                onClick={() => {
                  setActiveTab('demo');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  activeTab === 'demo'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ 1-Tap Login
              </button>
              <button
                onClick={() => {
                  setActiveTab('mpin');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  activeTab === 'mpin'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                4-Digit MPIN
              </button>
              <button
                onClick={() => {
                  setActiveTab('phone');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  activeTab === 'phone'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mobile OTP
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* TAB 1: 1-Tap Quick ASHA Demo Profiles */}
            {activeTab === 'demo' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Select Registered Health Worker Profile:
                </span>

                <div className="space-y-2">
                  {PRESET_ASHA_USERS.map((user) => {
                    const isSelected = selectedUser.id === user.id;
                    return (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/70 border-[#16866A] shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full ring-2 ring-[#16866A]/20 overflow-hidden shrink-0 bg-slate-100">
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-sm text-slate-900">{user.name}</h3>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#E5F4ED] text-[#16866A]">
                                {user.role}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {user.subCentre} · {user.assignedHouseholds} Households
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#16866A] bg-[#16866A] text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleQuickDemoLogin(selectedUser)}
                  className="w-full mt-2 py-3.5 rounded-2xl bg-[#16866A] hover:bg-[#13745c] text-white font-bold text-sm shadow-lg shadow-[#16866A]/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <span>Sign In as {selectedUser.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB 2: 4-Digit Sub-Centre MPIN */}
            {activeTab === 'mpin' && (
              <form onSubmit={handleMpinSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ASHA Registration ID
                  </label>
                  <input
                    type="text"
                    value={ashaIdInput}
                    onChange={(e) => setAshaIdInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16866A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    4-Digit Security MPIN
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      maxLength={4}
                      value={mpin}
                      onChange={(e) => setMpin(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16866A]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Default demo MPIN: <span className="font-mono font-bold">1234</span>
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#16866A] hover:bg-[#13745c] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>Verify MPIN & Enter Register</span>
                </button>
              </form>
            )}

            {/* TAB 3: Registered Mobile Number */}
            {activeTab === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16866A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#16866A] hover:bg-[#13745c] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Send OTP & Login</span>
                </button>
              </form>
            )}
          </div>

          {/* Footer Card Trust Badge */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#16866A]" />
              <span>Doddaballapur Taluk Sub-Centre</span>
            </div>
            <span className="font-semibold text-emerald-800">Offline-Ready v2.4</span>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 pt-4">
        SwasthyaSakhi · Government of India Accredited Field Assistant · Confidential Patient Data Guarded
      </footer>
    </div>
  );
};
