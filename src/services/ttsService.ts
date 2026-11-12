/**
 * Text-to-Speech service powered by Gnani.ai / Vachana Voice AI
 * Features studio-quality Indian female voices:
 * - 'Shivani': Compassionate, warm Indian healthcare sister (Didi)
 * - 'Lakshmi': Gentle, maternal Indian female voice
 * - 'Riyaa': Bright, playful young assistant (Chhoti Sakhi)
 * - 'Kalpana', 'Chetana', 'Vasudha', 'Tarika'
 * Supports instant playback via HTML5 Audio, barge-in interruption, and fallback to Web SpeechSynthesis
 */

import { VoicePersona } from '../types';
import { safeStorage } from '../utils/safeStorage';

export interface GnaniVoiceOption {
  id: string;
  name: string;
  gender: 'female' | 'child';
  description: string;
  isDefaultWoman?: boolean;
  isDefaultChild?: boolean;
}

export const GNANI_VOICES: GnaniVoiceOption[] = [
  {
    id: 'Shivani',
    name: 'Shivani',
    gender: 'female',
    description: 'Warm, compassionate Indian healthcare sister (Didi)',
    isDefaultWoman: true,
  },
  {
    id: 'Lakshmi',
    name: 'Lakshmi',
    gender: 'female',
    description: 'Gentle, maternal Indian voice (Soothing cadence)',
  },
  {
    id: 'Riyaa',
    name: 'Riyaa',
    gender: 'child',
    description: 'Bright, cheerful young assistant (Chhoti Sakhi)',
    isDefaultChild: true,
  },
  {
    id: 'Kalpana',
    name: 'Kalpana',
    gender: 'female',
    description: 'Articulate Hindi / Indian English female voice',
  },
  {
    id: 'Chetana',
    name: 'Chetana',
    gender: 'female',
    description: 'Clear, modern Indic female voice',
  },
  {
    id: 'Vasudha',
    name: 'Vasudha',
    gender: 'female',
    description: 'Traditional, empathetic elder voice',
  },
  {
    id: 'Tarika',
    name: 'Tarika',
    gender: 'female',
    description: 'Soft-spoken, melodic Indic female voice',
  },
];

export interface TTSState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentText: string;
  persona: VoicePersona;
  selectedGnaniVoice: string;
  engine: 'Gnani.ai Voice AI' | 'Browser Synthesizer';
  availableVoices: { name: string; lang: string; isFemale: boolean }[];
}

type TTSListener = (state: TTSState) => void;

class TTSService {
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<TTSListener> = new Set();
  private persona: VoicePersona = 'woman';
  private selectedGnaniVoice = 'Shivani';
  private activeEngine: 'Gnani.ai Voice AI' | 'Browser Synthesizer' = 'Gnani.ai Voice AI';

  private state: TTSState = {
    isSpeaking: false,
    isPaused: false,
    currentText: '',
    persona: 'woman',
    selectedGnaniVoice: 'Shivani',
    engine: 'Gnani.ai Voice AI',
    availableVoices: [],
  };

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }

      // Load stored preferences
      try {
        const savedPersona = safeStorage.getItem('swasthya_sakhi_voice_persona');
        if (savedPersona === 'child' || savedPersona === 'woman') {
          this.persona = savedPersona;
          this.state.persona = savedPersona;
        }

        const savedVoice = safeStorage.getItem('swasthya_sakhi_gnani_voice');
        if (savedVoice) {
          this.selectedGnaniVoice = savedVoice;
          this.state.selectedGnaniVoice = savedVoice;
        } else {
          this.selectedGnaniVoice = this.persona === 'child' ? 'Riyaa' : 'Shivani';
          this.state.selectedGnaniVoice = this.selectedGnaniVoice;
        }
      } catch {}

      this.populateBrowserVoices();
      if (this.synth && this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.populateBrowserVoices();
        };
      }
    }
  }

  private populateBrowserVoices() {
    if (!this.synth) return;
    try {
      const voices = this.synth.getVoices();
      this.state.availableVoices = voices.map((v) => ({
        name: v.name,
        lang: v.lang,
        isFemale: !v.name.toLowerCase().includes('male') && !v.name.toLowerCase().includes('david'),
      }));
      this.notify();
    } catch {}
  }

  public setPersona(persona: VoicePersona) {
    this.persona = persona;
    this.state.persona = persona;
    // Set matching Gnani voice
    this.selectedGnaniVoice = persona === 'child' ? 'Riyaa' : 'Shivani';
    this.state.selectedGnaniVoice = this.selectedGnaniVoice;

    try {
      safeStorage.setItem('swasthya_sakhi_voice_persona', persona);
      safeStorage.setItem('swasthya_sakhi_gnani_voice', this.selectedGnaniVoice);
    } catch {}
    this.notify();
  }

  public getPersona(): VoicePersona {
    return this.persona;
  }

  public setGnaniVoice(voiceName: string) {
    this.selectedGnaniVoice = voiceName;
    this.state.selectedGnaniVoice = voiceName;
    try {
      safeStorage.setItem('swasthya_sakhi_gnani_voice', voiceName);
    } catch {}
    this.notify();
  }

  public getSelectedGnaniVoice(): string {
    return this.selectedGnaniVoice;
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

  /**
   * Main Speak Method
   * Synthesizes audio using Gnani.ai Voice AI (Timbre v3.0 model),
   * with seamless fallback to browser speech synthesis if offline
   */
  public async speak(text: string, languageCode = 'en-IN'): Promise<void> {
    // Barge-in: Cancel any currently active audio immediately
    this.cancel();

    if (!text || text.trim() === '') return;

    const cleanText = text.replace(/[*_#`~]/g, '').trim();

    try {
      // 1. Try Gnani.ai Voice AI Server-side proxy
      const voiceToUse =
        this.selectedGnaniVoice || (this.persona === 'child' ? 'Riyaa' : 'Shivani');

      const response = await fetch('/api/gnani-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          persona: this.persona,
          voice: voiceToUse,
        }),
      });

      if (!response.ok) {
        throw new Error(`Gnani API responded with status ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      this.currentAudioUrl = audioUrl;

      return new Promise((resolve) => {
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;
        this.activeEngine = 'Gnani.ai Voice AI';

        audio.onplay = () => {
          this.state = {
            ...this.state,
            isSpeaking: true,
            isPaused: false,
            currentText: cleanText,
            engine: 'Gnani.ai Voice AI',
          };
          this.notify();
        };

        audio.onended = () => {
          this.cleanupAudio();
          resolve();
        };

        audio.onerror = (e) => {
          console.warn('Audio playback error, falling back to browser speech:', e);
          this.cleanupAudio();
          this.speakWithBrowserFallback(cleanText, languageCode).then(resolve);
        };

        audio.play().catch((err) => {
          console.warn('Audio play auto-policy warning:', err);
          this.cleanupAudio();
          this.speakWithBrowserFallback(cleanText, languageCode).then(resolve);
        });
      });
    } catch (err) {
      console.warn('Gnani Voice AI unavailable, falling back to local synthesizer:', err);
      return this.speakWithBrowserFallback(cleanText, languageCode);
    }
  }

  // Fallback to browser SpeechSynthesis
  private speakWithBrowserFallback(text: string, languageCode: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) return resolve();

      this.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;
      this.activeEngine = 'Browser Synthesizer';

      const voices = this.synth.getVoices();
      const femaleVoice =
        voices.find(
          (v) =>
            v.lang.toLowerCase().includes('in') &&
            !v.name.toLowerCase().includes('david') &&
            !v.name.toLowerCase().includes('male')
        ) ||
        voices.find(
          (v) =>
            (v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('zira') ||
              v.name.toLowerCase().includes('samantha')) &&
            !v.name.toLowerCase().includes('david')
        ) ||
        voices[0];

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      if (this.persona === 'child') {
        utterance.pitch = 1.45;
        utterance.rate = 1.0;
      } else {
        utterance.pitch = 1.08;
        utterance.rate = 0.88;
      }

      utterance.onstart = () => {
        this.state = {
          ...this.state,
          isSpeaking: true,
          isPaused: false,
          currentText: text,
          engine: 'Browser Synthesizer',
        };
        this.notify();
      };

      utterance.onend = () => {
        this.cleanupUtterance();
        resolve();
      };

      utterance.onerror = () => {
        this.cleanupUtterance();
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  private cleanupAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
    this.state = {
      ...this.state,
      isSpeaking: false,
      isPaused: false,
      currentText: '',
    };
    this.notify();
  }

  private cleanupUtterance() {
    this.currentUtterance = null;
    this.state = {
      ...this.state,
      isSpeaking: false,
      isPaused: false,
      currentText: '',
    };
    this.notify();
  }

  // Barge-in / interruption: immediately stops speaking
  public cancel() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
    this.state = {
      ...this.state,
      isSpeaking: false,
      isPaused: false,
      currentText: '',
    };
    this.notify();
  }

  public pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.state.isPaused = true;
      this.notify();
    } else if (this.synth && this.synth.speaking) {
      this.synth.pause();
      this.state.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
      this.state.isPaused = false;
      this.notify();
    } else if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.state.isPaused = false;
      this.notify();
    }
  }

  public getState(): TTSState {
    return { ...this.state };
  }

  // Test sample speech with Gnani Voice AI
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
