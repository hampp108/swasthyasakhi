import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  Volume2,
  X,
  Play,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { LanguageOption, DemoScenario } from '../types';
import { LANGUAGES, DEMO_SCENARIOS } from '../constants/data';
import { speechEngine, SpeechListenerCallbacks } from '../services/speechService';
import { ttsService } from '../services/ttsService';

interface VoiceCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: LanguageOption;
  onLanguageChange: (lang: LanguageOption) => void;
  onProcessTranscript: (transcript: string) => void;
  isProcessing: boolean;
  initialTranscript?: string;
}

// Indian healthcare terms for code-mixing highlighting
const HIGHLIGHT_TERMS = [
  'anc checkup',
  'anc',
  'tt injection',
  'tt',
  'td',
  'ifa goli',
  'ifa tablets',
  'ifa',
  'bp check',
  'blood pressure',
  'baby weight',
  'weight',
  'immunisation',
  'immunization',
  'opv',
  'bcg',
  'penta vaccine',
  'pentavalent',
  'phc',
  'fever',
  'bleeding',
  'convulsion',
  'fits',
  'breastfeed',
  'breastfeeding',
  'doddaballapur',
  'lakshmi',
  'radha',
  'meena',
  'savitri',
];

export const VoiceCaptureModal: React.FC<VoiceCaptureModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onLanguageChange,
  onProcessTranscript,
  isProcessing,
  initialTranscript = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const timerRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Sync initial transcript
  useEffect(() => {
    if (initialTranscript) {
      setTranscript(initialTranscript);
    }
  }, [initialTranscript]);

  // Handle timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Auto scroll transcript
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  // Clean up when closed
  useEffect(() => {
    if (!isOpen) {
      handleStopRecording();
    }
  }, [isOpen]);

  const handleStartRecording = async () => {
    setErrorMessage('');
    ttsService.cancel(); // Barge-in interruption: cancel assistant speech when worker speaks
    speechEngine.setLanguage(selectedLanguage.speechCode);

    const callbacks: SpeechListenerCallbacks = {
      onTranscriptChange: (text) => {
        setTranscript(text);
      },
      onAudioLevelChange: (level) => {
        setAudioLevel(level);
      },
      onStatusChange: (status, msg) => {
        setRecordingStatus(status);
        if (msg) setErrorMessage(msg);
      },
    };

    setIsRecording(true);
    const started = await speechEngine.start(callbacks);
    if (!started) {
      // Still show recording state if simulated or typing fallback is active
    }
  };

  const handleStopRecording = () => {
    speechEngine.stop();
    setIsRecording(false);
    setIsSimulating(false);
    setAudioLevel(0);
  };

  const handleRunSampleScenario = (scenario: DemoScenario) => {
    handleStopRecording();
    setTranscript('');
    setIsSimulating(true);
    setIsRecording(true);

    const callbacks: SpeechListenerCallbacks = {
      onTranscriptChange: (text) => {
        setTranscript(text);
      },
      onAudioLevelChange: (level) => {
        setAudioLevel(level);
      },
      onStatusChange: (status, msg) => {
        setRecordingStatus(status);
        if (msg) setErrorMessage(msg);
      },
    };

    speechEngine.simulateSpokenStream(scenario.transcript, callbacks, () => {
      setIsSimulating(false);
      setIsRecording(false);
    });
  };

  const handleProceedToExtraction = () => {
    if (!transcript.trim()) {
      setErrorMessage('Please speak or select a sample scenario first.');
      return;
    }
    handleStopRecording();
    onProcessTranscript(transcript);
  };

  // Format seconds to MM:SS
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Highlight healthcare terms in transcript
  const renderHighlightedTranscript = (text: string) => {
    if (!text) return null;
    const regex = new RegExp(`\\b(${HIGHLIGHT_TERMS.join('|')})\\b`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const isMatch = HIGHLIGHT_TERMS.some((term) => term.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <span
            key={index}
            className="font-bold text-[#16866A] bg-[#E5F4ED] px-1 py-0.5 rounded border border-[#16866A]/20"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-[#F7FAF8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#16866A]/10 text-[#16866A] flex items-center justify-center font-bold">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#243B35]">ASHA Voice Field Capture</h2>
              <p className="text-xs text-slate-500">Multilingual & English code-mixing active</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* Language Selector in recording screen */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#E5F4ED]/60 border border-[#16866A]/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#16866A]">Speaking Language:</span>
              <span className="text-[10px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                Voice: {ttsService.getPersona() === 'child' ? "Child (Chhoti Sakhi)" : "Woman (Didi)"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang);
                    speechEngine.setLanguage(lang.speechCode);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedLanguage.code === lang.code
                      ? 'bg-[#16866A] text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {lang.nativeLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Central Animated Mic & Live Audio Waveform */}
          <div className="flex flex-col items-center justify-center py-4 bg-slate-50/70 rounded-3xl border border-slate-100">
            {/* Pulsing Mic Button */}
            <div className="relative flex items-center justify-center">
              {isRecording && (
                <>
                  <div
                    className="absolute w-28 h-28 rounded-full bg-[#16866A]/15 animate-ping"
                    style={{ animationDuration: '2s' }}
                  />
                  <div
                    className="absolute w-36 h-36 rounded-full bg-[#16866A]/10 animate-pulse"
                    style={{ transform: `scale(${1 + audioLevel * 0.4})` }}
                  />
                </>
              )}

              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all shadow-xl active:scale-95 ${
                  isRecording
                    ? 'bg-red-500 text-white shadow-red-500/30'
                    : 'bg-[#16866A] text-white hover:bg-[#13745c] shadow-[#16866A]/30'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-8 h-8 fill-current" />
                    <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">STOP</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-9 h-9" />
                    <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">RECORD</span>
                  </>
                )}
              </button>
            </div>

            {/* Timer and Status */}
            <div className="mt-4 text-center">
              <div className="text-xl font-mono font-bold text-slate-800 tabular-nums">
                {isRecording ? formatTimer(recordingSeconds) : '00:00'}
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                {isRecording
                  ? isSimulating
                    ? 'Transcribing sample field visit notes...'
                    : 'Listening to your speech... Speak clearly'
                  : 'Tap the mic to start speaking or pick a sample scenario below'}
              </p>
            </div>

            {/* Live Audio Waveform Bars */}
            <div className="flex items-center gap-1.5 h-10 mt-3 px-6">
              {[40, 75, 50, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50, 70].map((h, i) => {
                const multiplier = isRecording ? Math.max(0.2, audioLevel * 1.5) : 0.15;
                const heightPercent = Math.min(100, Math.max(15, h * multiplier));
                return (
                  <span
                    key={i}
                    style={{ height: `${heightPercent}%` }}
                    className={`w-1.5 rounded-full transition-all duration-75 ${
                      isRecording ? 'bg-[#16866A]' : 'bg-slate-300'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Error notice if microphone not allowed */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMessage}</p>
                <p className="mt-0.5 text-amber-700">
                  Tip: You can use the quick sample scenario buttons below to test the full extraction workflow instantly!
                </p>
              </div>
            </div>
          )}

          {/* Live Transcription Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#243B35] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#16866A]" /> Spoken Visit Transcript
              </span>
              {transcript && (
                <button
                  onClick={() => setTranscript('')}
                  className="text-[11px] text-slate-500 hover:text-red-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="relative rounded-2xl border border-slate-200 bg-white p-3.5 min-h-[110px] max-h-[160px] overflow-y-auto text-sm leading-relaxed text-slate-800 shadow-inner">
              {transcript ? (
                <div className="whitespace-pre-wrap">{renderHighlightedTranscript(transcript)}</div>
              ) : (
                <p className="text-slate-400 italic text-xs">
                  "Today I visited Lakshmi, beneficiary ID 1024. She is 7 months pregnant. BP check madidvi, everything is normal..."
                </p>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>

          {/* Quick Sample Scenario Selector for Instant Hackathon Demonstration */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Instant Demo Scenarios:</span>
              <span className="text-[11px] text-slate-500">Tap to load & test</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => handleRunSampleScenario(scenario)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#16866A] hover:bg-[#E5F4ED]/40 text-left transition-all group active:scale-95"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#16866A] truncate">
                      {scenario.beneficiary}
                    </span>
                    <Play className="w-3 h-3 text-slate-400 group-hover:text-[#16866A]" />
                  </div>
                  <p className="text-xs font-medium text-slate-800 mt-0.5 line-clamp-1">
                    {scenario.badge}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleProceedToExtraction}
            disabled={!transcript.trim() || isProcessing}
            className="flex-1 min-h-[46px] rounded-xl bg-[#16866A] hover:bg-[#13745c] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-[#16866A]/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Extracting with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Process & Structure Visit Notes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
