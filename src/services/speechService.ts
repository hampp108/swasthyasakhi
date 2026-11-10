/**
 * Speech Recognition and Audio Waveform Capture Engine
 * Connects to Web Speech API and Web Audio API AnalyserNode
 * Features real-time waveform levels, noise detection, and simulated audio fallbacks
 */

export interface SpeechListenerCallbacks {
  onTranscriptChange: (transcript: string, isFinal: boolean) => void;
  onAudioLevelChange: (level: number) => void; // 0 to 1
  onStatusChange: (status: 'idle' | 'listening' | 'processing' | 'error', errorMessage?: string) => void;
}

export class SpeechEngine {
  private recognition: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private isListening = false;
  private currentLanguage = 'en-IN';
  private callbacks: SpeechListenerCallbacks | null = null;
  private simulationInterval: any = null;

  constructor() {
    // Check Web Speech API availability
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  public setLanguage(langCode: string) {
    this.currentLanguage = langCode;
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  public async start(callbacks: SpeechListenerCallbacks): Promise<boolean> {
    this.callbacks = callbacks;
    this.isListening = true;

    // Start Audio Analyser for real-time waveform
    await this.initAudioAnalyser();

    if (this.recognition) {
      try {
        this.recognition.lang = this.currentLanguage;

        let accumulatedFinal = '';

        this.recognition.onstart = () => {
          this.callbacks?.onStatusChange('listening');
        };

        this.recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedFinal += (accumulatedFinal ? ' ' : '') + transcript;
            } else {
              interim += transcript;
            }
          }
          const fullText = (accumulatedFinal + (interim ? ' ' + interim : '')).trim();
          this.callbacks?.onTranscriptChange(fullText, !interim);
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            this.callbacks?.onStatusChange('error', 'Microphone permission denied. You can also use Sample Scenarios or type your notes.');
          } else if (event.error === 'no-speech') {
            // Keep listening or ignore
          } else {
            this.callbacks?.onStatusChange('error', `Voice recognition: ${event.error}`);
          }
        };

        this.recognition.onend = () => {
          if (this.isListening) {
            // Auto restart for continuous ASHA field dictation
            try {
              this.recognition.start();
            } catch {
              // Ignore already running error
            }
          }
        };

        this.recognition.start();
        return true;
      } catch (err: any) {
        console.warn('Could not start Web Speech Recognition:', err);
        this.callbacks?.onStatusChange('error', err?.message || 'Could not start voice recognition');
        return false;
      }
    } else {
      // Speech recognition API not supported in this browser
      this.callbacks?.onStatusChange(
        'error',
        'Speech recognition API is unavailable in this browser. You can use the "Try Sample Voice Visit" scenarios or type observations.'
      );
      return false;
    }
  }

  public stop() {
    this.isListening = false;
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Safe ignore
      }
    }

    this.stopAudioAnalyser();
    this.callbacks?.onStatusChange('idle');
  }

  // Simulated typing stream for demo/testing or fallback
  public simulateSpokenStream(
    fullText: string,
    callbacks: SpeechListenerCallbacks,
    onComplete?: () => void
  ) {
    this.stop();
    this.callbacks = callbacks;
    this.isListening = true;
    callbacks.onStatusChange('listening');

    // Simulate audio wave bounce
    const waveSimulator = setInterval(() => {
      const simulatedLevel = 0.2 + Math.random() * 0.7;
      callbacks.onAudioLevelChange(simulatedLevel);
    }, 80);

    const words = fullText.split(' ');
    let currentWordIdx = 0;
    let accumulated = '';

    this.simulationInterval = setInterval(() => {
      if (currentWordIdx < words.length) {
        accumulated += (accumulated ? ' ' : '') + words[currentWordIdx];
        callbacks.onTranscriptChange(accumulated, currentWordIdx === words.length - 1);
        currentWordIdx++;
      } else {
        clearInterval(this.simulationInterval);
        clearInterval(waveSimulator);
        this.simulationInterval = null;
        callbacks.onAudioLevelChange(0);
        callbacks.onStatusChange('idle');
        this.isListening = false;
        if (onComplete) onComplete();
      }
    }, 180);
  }

  private async initAudioAnalyser() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        const updateLevel = () => {
          if (!this.isListening || !this.analyser) return;
          this.analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const normalized = Math.min(1, Math.max(0, average / 128));

          this.callbacks?.onAudioLevelChange(normalized);
          this.animFrameId = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      }
    } catch (err) {
      console.warn('Microphone stream could not be opened for waveform:', err);
      // Fallback synthetic wave animation
      const syntheticInterval = setInterval(() => {
        if (!this.isListening) {
          clearInterval(syntheticInterval);
          return;
        }
        const level = 0.25 + Math.random() * 0.5;
        this.callbacks?.onAudioLevelChange(level);
      }, 100);
    }
  }

  private stopAudioAnalyser() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.callbacks?.onAudioLevelChange(0);
  }
}

export const speechEngine = new SpeechEngine();
