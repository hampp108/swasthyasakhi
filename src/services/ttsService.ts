/**
 * Text-to-Speech service using Web SpeechSynthesis API
 * Dedicated High-Quality Natural Female Voice Synthesizer
 * Rigorously filters out male voices and prioritizes gentle, warm maternal/sister voices (Didi)
 * Supports real-time barge-in interruption, pitch/rate controls, and voice selection
 */

import { VoicePersona } from '../types';

export interface TTSState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentText: string;
  persona: VoicePersona;
  selectedVoiceName?: string;
  availableVoices: { name: string; lang: string; isFemale: boolean }[];
}

type TTSListener = (state: TTSState) => void;

// Strict exclusion list of known male voice indicators
const MALE_VOICE_KEYWORDS = [
  'david',
  'mark',
  'george',
  'james',
  'richard',
  'ravi',
  'prabhat',
  'guy',
  'brian',
  'daniel',
  'alex',
  'fred',
  'male',
  'stefan',
  'oliver',
  'diego',
  'jorge',
  'thomas',
  'sin-ji',
  'russell',
  'sean',
  'paul',
  'arthur',
  'reed',
  'bruce',
  'ralph',
  'junior',
];

// Priority list of known high-quality female voice names (Indian, UK, US, Global)
const FEMALE_VOICE_PRIORITY = [
  'heera',          // Microsoft Heera (Indian English Female)
  'kalpana',        // Microsoft Kalpana (Hindi Female)
  'veena',          // Apple Veena (Indian English Female)
  'neerja',         // Indian Female
  'sangeeta',       // Indian Female
  'kavya',          // Indian Female
  'swara',          // Indian Female
  'google हिन्दी', // Google Hindi (Natural Female)
  'google uk english female',
  'google us english',
  'samantha',       // Apple Samantha (Warm Female)
  'zira',           // Microsoft Zira (Female)
  'victoria',       // Apple Victoria
  'karen',          // Apple Karen (Australian/Global Female)
  'moira',          // Apple Moira
  'tessa',          // Apple Tessa
  'hazel',          // Microsoft Hazel (UK Female)
  'susan',          // Microsoft Susan
  'catherine',      // Microsoft Catherine
  'fiona',          // Apple Fiona
  'female',
];

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<TTSListener> = new Set();
  private persona: VoicePersona = 'woman';
  private customVoiceName: string | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  private state: TTSState = {
    isSpeaking: false,
    isPaused: false,
    currentText: '',
    persona: 'woman',
    availableVoices: [],
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;

      // Load stored preferences
      try {
        const savedPersona = localStorage.getItem('swasthya_sakhi_voice_persona');
        if (savedPersona === 'child' || savedPersona === 'woman') {
          this.persona = savedPersona;
          this.state.persona = savedPersona;
        }

        const savedVoice = localStorage.getItem('swasthya_sakhi_custom_voice');
        if (savedVoice) {
          this.customVoiceName = savedVoice;
          this.state.selectedVoiceName = savedVoice;
        }
      } catch {}

      // Populate voices when loaded
      this.populateVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.populateVoices();
        };
      }
    }
  }

  private populateVoices() {
    if (!this.synth) return;
    this.cachedVoices = this.synth.getVoices();

    const formatted = this.cachedVoices.map((v) => ({
      name: v.name,
      lang: v.lang,
      isFemale: this.isLikelyFemale(v),
    }));

    this.state.availableVoices = formatted;

    // Pick best default female voice if none set
    if (!this.customVoiceName) {
      const bestFemale = this.findBestFemaleVoice('en-IN');
      if (bestFemale) {
        this.customVoiceName = bestFemale.name;
        this.state.selectedVoiceName = bestFemale.name;
      }
    }

    this.notify();
  }

  private isLikelyFemale(voice: SpeechSynthesisVoice): boolean {
    const nameLower = voice.name.toLowerCase();

    // If explicit male keyword, reject
    if (MALE_VOICE_KEYWORDS.some((kw) => nameLower.includes(kw))) {
      return false;
    }

    // Check if voice name matches female priority list
    if (FEMALE_VOICE_PRIORITY.some((kw) => nameLower.includes(kw))) {
      return true;
    }

    // Check voice gender attribute if present
    if ((voice as any).gender === 'female') {
      return true;
    }

    // Default: if it does NOT match any male keywords and is Indian or Google, favor it
    if (nameLower.includes('india') || nameLower.includes('hindi') || nameLower.includes('natural')) {
      return true;
    }

    return false;
  }

  private findBestFemaleVoice(languageCode = 'en-IN'): SpeechSynthesisVoice | null {
    if (this.cachedVoices.length === 0 && this.synth) {
      this.cachedVoices = this.synth.getVoices();
    }

    if (this.cachedVoices.length === 0) return null;

    // If user explicitly picked a custom voice that exists, use it
    if (this.customVoiceName) {
      const explicit = this.cachedVoices.find((v) => v.name === this.customVoiceName);
      if (explicit) return explicit;
    }

    const langLower = languageCode.toLowerCase();
    const langPrefix = langLower.split('-')[0];

    // Priority 1: Indian English or Hindi Female Voice
    const indianFemale = this.cachedVoices.find(
      (v) =>
        (v.lang.toLowerCase().includes('in') || v.name.toLowerCase().includes('india')) &&
        this.isLikelyFemale(v)
    );
    if (indianFemale) return indianFemale;

    // Priority 2: Exact language code female voice
    const exactLangFemale = this.cachedVoices.find(
      (v) => v.lang.toLowerCase() === langLower && this.isLikelyFemale(v)
    );
    if (exactLangFemale) return exactLangFemale;

    // Priority 3: Language prefix female voice (e.g. en-US, en-GB)
    const prefixFemale = this.cachedVoices.find(
      (v) => v.lang.toLowerCase().startsWith(langPrefix) && this.isLikelyFemale(v)
    );
    if (prefixFemale) return prefixFemale;

    // Priority 4: Any verified female voice
    const anyFemale = this.cachedVoices.find((v) => this.isLikelyFemale(v));
    if (anyFemale) return anyFemale;

    // Priority 5: Fallback to non-male voice
    const nonMale = this.cachedVoices.find(
      (v) => !MALE_VOICE_KEYWORDS.some((kw) => v.name.toLowerCase().includes(kw))
    );
    if (nonMale) return nonMale;

    return this.cachedVoices[0];
  }

  public setPersona(persona: VoicePersona) {
    this.persona = persona;
    this.state.persona = persona;
    try {
      localStorage.setItem('swasthya_sakhi_voice_persona', persona);
    } catch {}
    this.notify();
  }

  public getPersona(): VoicePersona {
    return this.persona;
  }

  public setCustomVoice(voiceName: string) {
    this.customVoiceName = voiceName;
    this.state.selectedVoiceName = voiceName;
    try {
      localStorage.setItem('swasthya_sakhi_custom_voice', voiceName);
    } catch {}
    this.notify();
  }

  public getSelectedVoiceName(): string | undefined {
    return this.customVoiceName || this.state.selectedVoiceName;
  }

  public subscribe(listener: TTSListener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  public speak(text: string, languageCode = 'en-IN'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        console.warn('SpeechSynthesis is not supported in this browser environment');
        return resolve();
      }

      // Barge-in: Cancel any active speech immediately
      this.cancel();

      if (!text || text.trim() === '') {
        return resolve();
      }

      const cleanText = text.replace(/[*_#]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.currentUtterance = utterance;

      // Select female voice
      const chosenVoice = this.findBestFemaleVoice(languageCode);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
        this.state.selectedVoiceName = chosenVoice.name;
      }

      // Authentic Female Tone Tuning:
      if (this.persona === 'child') {
        // Child's Voice ("Chhoti Sakhi"): Elevated pitch, lively cadence
        utterance.pitch = 1.45;
        utterance.rate = 1.0;
      } else {
        // Woman's Voice ("Didi / Healthcare Sister"):
        // Soft, warm, compassionate, calm cadence
        utterance.pitch = 1.08; // Clear natural feminine register
        utterance.rate = 0.88;  // Measured cadence so medical instructions are reassuring and crisp
      }

      utterance.onstart = () => {
        this.state = {
          ...this.state,
          isSpeaking: true,
          isPaused: false,
          currentText: cleanText,
          persona: this.persona,
        };
        this.notify();
      };

      utterance.onend = () => {
        this.state = {
          ...this.state,
          isSpeaking: false,
          isPaused: false,
          currentText: '',
          persona: this.persona,
        };
        this.currentUtterance = null;
        this.notify();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('TTS error or cancelled:', e);
        this.state = {
          ...this.state,
          isSpeaking: false,
          isPaused: false,
          currentText: '',
          persona: this.persona,
        };
        this.currentUtterance = null;
        this.notify();
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  // Barge-in / interruption: immediately stops speaking
  public cancel() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.state = {
      ...this.state,
      isSpeaking: false,
      isPaused: false,
      currentText: '',
      persona: this.persona,
    };
    this.currentUtterance = null;
    this.notify();
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
      this.state.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.state.isPaused = false;
      this.notify();
    }
  }

  public getState(): TTSState {
    return { ...this.state };
  }

  // Test sample speech
  public preview(persona: VoicePersona, languageCode = 'en-IN') {
    this.setPersona(persona);
    const sample =
      persona === 'child'
        ? 'Namaste Didi! I am your small assistant Chhoti Sakhi. I am happy to help you with Lakshmi and Radha’s home visit.'
        : 'Namaste Anjali Didi! I am your health companion. I have recorded Lakshmi’s ANC checkup, TT injection, and IFA tablets. Everything is safe and normal.';
    return this.speak(sample, languageCode);
  }
}

export const ttsService = new TTSService();
