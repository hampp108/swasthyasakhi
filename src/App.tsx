import React, { useState, useEffect } from 'react';
import {
  AshaUser,
  Beneficiary,
  DemoScenario,
  FollowUpTask,
  LanguageOption,
  StructuredRecord,
  VoicePersona,
} from './types';
import {
  LANGUAGES,
  PRESET_ASHA_USERS,
  SYNTHETIC_BENEFICIARIES,
  DEMO_SCENARIOS,
  INITIAL_FOLLOW_UPS,
  INITIAL_RECENT_VISITS,
} from './constants/data';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { VoiceCaptureModal } from './components/VoiceCaptureModal';
import { VisitRecordSummary } from './components/VisitRecordSummary';
import { FollowUpDashboard } from './components/FollowUpDashboard';
import { BeneficiaryDirectory } from './components/BeneficiaryDirectory';
import { BottomNavigation } from './components/BottomNavigation';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { extractVisitNotes, correctVisitRecord } from './services/apiService';
import { ttsService, TTSState } from './services/ttsService';
import { Check, Mic, Volume2, Sparkles, Trash2, ShieldAlert, Wifi, Cloud } from 'lucide-react';
import { safeStorage } from './utils/safeStorage';

const STORAGE_KEYS = {
  USER: 'swasthya_sakhi_user_v1',
  VISITS: 'swasthya_sakhi_visits_v1',
  FOLLOW_UPS: 'swasthya_sakhi_followups_v1',
  LANGUAGE: 'swasthya_sakhi_lang_v1',
  PERSONA: 'swasthya_sakhi_voice_persona',
};

export default function App() {
  // Current logged in ASHA worker
  const [currentUser, setCurrentUser] = useState<AshaUser | null>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    // Default to Anjali Bai for instant testability
    return PRESET_ASHA_USERS[0];
  });

  // Voice Persona: 'woman' (Didi) or 'child' (Chhoti Sakhi)
  const [voicePersona, setVoicePersona] = useState<VoicePersona>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.PERSONA);
      if (saved === 'child' || saved === 'woman') {
        return saved;
      }
    } catch {}
    return 'woman';
  });

  // Navigation & Screen state
  const [currentTab, setCurrentTab] = useState<'home' | 'followups' | 'beneficiaries'>('home');
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'summary'>('dashboard');
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);

  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (saved) {
        const found = LANGUAGES.find((l) => l.code === saved);
        if (found) return found;
      }
    } catch {}
    return LANGUAGES[2]; // Default: Indian English
  });

  // Data state with LocalStorage persistence
  const [beneficiaries] = useState<Beneficiary[]>(SYNTHETIC_BENEFICIARIES);
  const [recentVisits, setRecentVisits] = useState<StructuredRecord[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.VISITS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_RECENT_VISITS;
  });

  const [followUpTasks, setFollowUpTasks] = useState<FollowUpTask[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_FOLLOW_UPS;
  });

  // Current active visit record under construction / review
  const [activeRecord, setActiveRecord] = useState<StructuredRecord | null>(null);

  // Voice capture modal state
  const [isVoiceCaptureOpen, setIsVoiceCaptureOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [activeTranscript, setActiveTranscript] = useState('');
  const [beneficiaryHint, setBeneficiaryHint] = useState<Beneficiary | null>(null);

  // Global Audio / TTS state
  const [ttsState, setTtsState] = useState<TTSState>(() => ttsService.getState());

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync Voice Persona with TTSService
  useEffect(() => {
    ttsService.setPersona(voicePersona);
  }, [voicePersona]);

  // Subscribe to TTS status changes
  useEffect(() => {
    const unsubscribe = ttsService.subscribe((state) => {
      setTtsState(state);
    });
    return () => unsubscribe();
  }, []);

  // Save changes to safeStorage
  useEffect(() => {
    if (currentUser) {
      safeStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      safeStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(recentVisits));
  }, [recentVisits]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(followUpTasks));
  }, [followUpTasks]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.LANGUAGE, selectedLanguage.code);
  }, [selectedLanguage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Login handler
  const handleLogin = (user: AshaUser) => {
    setCurrentUser(user);
    setActiveScreen('dashboard');
    showToast(`Signed in as ${user.name}`);
  };

  // Logout handler
  const handleLogout = () => {
    ttsService.cancel();
    setCurrentUser(null);
    setActiveRecord(null);
    setActiveScreen('dashboard');
    showToast('Logged out successfully');
  };

  // Voice persona switcher
  const handleVoicePersonaChange = (persona: VoicePersona) => {
    setVoicePersona(persona);
    ttsService.setPersona(persona);
    showToast(
      persona === 'child'
        ? "Switched to Small Child's Voice (Chhoti Sakhi)"
        : "Switched to Woman's Voice (Didi)"
    );
  };

  // 1. START VOICE VISIT
  const handleOpenVoiceVisit = (beneficiary?: Beneficiary) => {
    ttsService.cancel();
    setBeneficiaryHint(beneficiary || null);
    setActiveTranscript(
      beneficiary
        ? `Home visit for ${beneficiary.name}, beneficiary ID ${beneficiary.id}. `
        : ''
    );
    setIsVoiceCaptureOpen(true);
  };

  // 2. RUN PRESET DEMO SCENARIO
  const handleSelectScenario = (scenario: DemoScenario) => {
    ttsService.cancel();
    const b = beneficiaries.find((item) => item.id === scenario.beneficiaryId);
    setBeneficiaryHint(b || null);
    setActiveTranscript(scenario.transcript);
    setIsVoiceCaptureOpen(true);
  };

  // 3. EXTRACT AND POPULATE STRUCTURED RECORD (Gemini AI API + Fallback)
  const handleProcessTranscript = async (transcript: string) => {
    try {
      setIsProcessing(true);
      const res = await extractVisitNotes(transcript, selectedLanguage.label, beneficiaryHint);

      const generatedId = `REC-${Date.now().toString().slice(-4)}`;
      const newRecord: StructuredRecord = {
        id: generatedId,
        timestamp: 'Just now',
        visitInfo: res.data.visitInfo,
        pregnancyInfo: res.data.pregnancyInfo,
        newbornInfo: res.data.newbornInfo,
        immunisationInfo: res.data.immunisationInfo,
        followUp: res.data.followUp,
        dangerSigns: res.data.dangerSigns || [],
        isEmergency: !!res.data.isEmergency,
        spokenSummary: res.data.spokenSummary,
        emergencyAlertMessage: res.data.emergencyAlertMessage,
        originalTranscript: transcript,
        confirmed: false,
        confidence: res.data.confidence,
      };

      setActiveRecord(newRecord);
      setIsVoiceCaptureOpen(false);
      setActiveScreen('summary');

      // Auto read-back in worker's selected language using selected voice persona
      ttsService.speak(newRecord.spokenSummary, selectedLanguage.speechCode);
    } catch (err: any) {
      console.error('Failed to extract notes:', err);
      showToast('Extraction notice: ' + (err?.message || 'Server error, please retry'));
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. VOICE CORRECTION ("No, baby weight is 2.8 kilo, not 2.5")
  const handleVoiceCorrect = async (correctionText: string) => {
    if (!activeRecord) return;
    try {
      setIsCorrecting(true);
      const res = await correctVisitRecord(activeRecord, correctionText, selectedLanguage.label);

      const updated = {
        ...activeRecord,
        ...res.data.updatedRecord,
        spokenSummary: res.data.spokenSummary,
      };

      setActiveRecord(updated);
      showToast(res.data.explanation || 'Record updated successfully');

      // Read back the updated value
      ttsService.speak(res.data.spokenSummary, selectedLanguage.speechCode);
    } catch (err: any) {
      console.error('Correction failed:', err);
      showToast('Correction error: ' + (err?.message || 'Could not update record'));
    } finally {
      setIsCorrecting(false);
    }
  };

  // 5. MANUAL EDIT UPDATE
  const handleManualUpdate = (updated: StructuredRecord) => {
    setActiveRecord(updated);
    showToast('Record fields updated');
  };

  // 6. CONFIRM AND PERSIST VISIT RECORD & GENERATE FOLLOW-UPS
  const handleConfirmRecord = () => {
    if (!activeRecord) return;

    const confirmedRecord: StructuredRecord = {
      ...activeRecord,
      confirmed: true,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Auto-generate follow-up tasks from this confirmed visit
    const newTasks: FollowUpTask[] = [];

    // If emergency danger sign detected, create high-priority PHC referral task
    if (confirmedRecord.isEmergency && confirmedRecord.dangerSigns.length > 0) {
      newTasks.push({
        id: `TASK-${Date.now()}-EMERGENCY`,
        beneficiaryId: confirmedRecord.visitInfo.beneficiaryId || 'BEN-UNKNOWN',
        beneficiaryName: confirmedRecord.visitInfo.beneficiaryName,
        title: `URGENT PHC REFERRAL: ${confirmedRecord.dangerSigns[0].sign} (${confirmedRecord.dangerSigns[0].actionRequired})`,
        dueDate: 'Immediate (Today)',
        daysRemaining: 0,
        priority: 'EMERGENCY',
        actionType: 'PHC_REFERRAL',
        completed: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Schedule next home visit task
    const nextVisitText =
      confirmedRecord.followUp.nextVisitDays || confirmedRecord.followUp.nextVisitDate || '15 days';
    newTasks.push({
      id: `TASK-${Date.now()}-VISIT`,
      beneficiaryId: confirmedRecord.visitInfo.beneficiaryId || 'BEN-UNKNOWN',
      beneficiaryName: confirmedRecord.visitInfo.beneficiaryName,
      title: `Scheduled home visit & health check (${nextVisitText})`,
      dueDate: nextVisitText,
      daysRemaining: 15,
      priority: confirmedRecord.isEmergency ? 'HIGH' : 'NORMAL',
      actionType: 'HOME_VISIT',
      completed: false,
      createdAt: new Date().toISOString(),
    });

    // Check for medication compliance task (e.g. IFA)
    if (
      confirmedRecord.pregnancyInfo.ifaTabletStatus &&
      confirmedRecord.pregnancyInfo.ifaTabletStatus !== 'Not recorded'
    ) {
      newTasks.push({
        id: `TASK-${Date.now()}-MED`,
        beneficiaryId: confirmedRecord.visitInfo.beneficiaryId || 'BEN-UNKNOWN',
        beneficiaryName: confirmedRecord.visitInfo.beneficiaryName,
        title: `Verify IFA tablet compliance for ${confirmedRecord.visitInfo.beneficiaryName}`,
        dueDate: 'Next visit',
        daysRemaining: 15,
        priority: 'NORMAL',
        actionType: 'MEDICATION_CHECK',
        completed: false,
        createdAt: new Date().toISOString(),
      });
    }

    setRecentVisits((prev) => [confirmedRecord, ...prev]);
    setFollowUpTasks((prev) => [...newTasks, ...prev]);

    ttsService.cancel();
    ttsService.speak(
      `Visit confirmed for ${confirmedRecord.visitInfo.beneficiaryName}. Automated follow-up tasks have been scheduled.`,
      selectedLanguage.speechCode
    );

    setActiveRecord(null);
    setActiveScreen('dashboard');
    showToast(
      `Visit confirmed for ${confirmedRecord.visitInfo.beneficiaryName}! ${newTasks.length} follow-up tasks created.`
    );
  };

  // Toggle follow-up task completion
  const handleToggleTaskComplete = (taskId: string) => {
    setFollowUpTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
    showToast('Follow-up status updated');
  };

  // Complete follow-up task via voice command ("Lakshmi's follow-up completed")
  const handleVoiceCompleteTask = (voiceText: string) => {
    const lower = voiceText.toLowerCase();

    // Find matching beneficiary
    const matchedTask = followUpTasks.find(
      (t) =>
        !t.completed &&
        (lower.includes(t.beneficiaryName.toLowerCase()) ||
          lower.includes(t.beneficiaryId.toLowerCase()))
    );

    if (matchedTask) {
      handleToggleTaskComplete(matchedTask.id);
      ttsService.speak(
        `Marked follow-up task for ${matchedTask.beneficiaryName} as completed.`,
        selectedLanguage.speechCode
      );
      showToast(`Completed: ${matchedTask.title}`);
    } else {
      ttsService.speak(
        `I could not match a pending task with that name. Please verify the beneficiary name.`,
        selectedLanguage.speechCode
      );
      showToast('Could not find matching pending follow-up task.');
    }
  };

  // Reset demo records option (privacy / fresh demo start)
  const handleResetDemoData = () => {
    if (window.confirm('Reset all demo visits and tasks back to initial hackathon defaults?')) {
      setRecentVisits(INITIAL_RECENT_VISITS);
      setFollowUpTasks(INITIAL_FOLLOW_UPS);
      safeStorage.removeItem(STORAGE_KEYS.VISITS);
      safeStorage.removeItem(STORAGE_KEYS.FOLLOW_UPS);
      showToast('Demo registry reset to defaults');
    }
  };

  // If user is not logged in, render LoginPage!
  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        voicePersona={voicePersona}
        onVoicePersonaChange={handleVoicePersonaChange}
      />
    );
  }

  const highPriorityAlertCount = followUpTasks.filter(
    (t) => !t.completed && (t.priority === 'EMERGENCY' || t.priority === 'HIGH')
  ).length;

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#243B35] flex flex-col font-sans">
      {/* App Header with currentUser and Voice Persona switcher */}
      <Header
        currentUser={currentUser}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        voicePersona={voicePersona}
        onVoicePersonaChange={handleVoicePersonaChange}
        isSpeaking={ttsState.isSpeaking}
        onStopSpeech={() => ttsService.cancel()}
        highPriorityAlertCount={highPriorityAlertCount}
        onLogout={handleLogout}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 pt-3 sm:pt-5">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#243B35] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* View Routing */}
        {activeScreen === 'summary' && activeRecord ? (
          <VisitRecordSummary
            record={activeRecord}
            onConfirm={handleConfirmRecord}
            onVoiceCorrect={handleVoiceCorrect}
            onManualUpdate={handleManualUpdate}
            onBackToCapture={() => {
              setActiveScreen('dashboard');
              setIsVoiceCaptureOpen(true);
            }}
            isCorrecting={isCorrecting}
            selectedLanguageCode={selectedLanguage.speechCode}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <Dashboard
                onStartVoiceVisit={handleOpenVoiceVisit}
                onSelectScenario={handleSelectScenario}
                onViewRecord={(rec) => {
                  setActiveRecord(rec);
                  setActiveScreen('summary');
                }}
                onNavigateToFollowUps={() => setCurrentTab('followups')}
                recentVisits={recentVisits}
                followUpTasks={followUpTasks}
                beneficiaries={beneficiaries}
              />
            )}

            {currentTab === 'followups' && (
              <FollowUpDashboard
                tasks={followUpTasks}
                onToggleComplete={handleToggleTaskComplete}
                onVoiceComplete={handleVoiceCompleteTask}
                onStartVisitForBeneficiary={(bId, name) => {
                  const b = beneficiaries.find((item) => item.id === bId);
                  handleOpenVoiceVisit(b);
                }}
              />
            )}

            {currentTab === 'beneficiaries' && (
              <BeneficiaryDirectory
                beneficiaries={beneficiaries}
                onStartVoiceVisit={handleOpenVoiceVisit}
              />
            )}
          </>
        )}
      </main>

      {/* Subtle Bottom Field Status Bar */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-3 px-4 sm:px-6 text-center text-xs text-slate-500 mb-16">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-left">
            <span className="text-xs font-semibold text-[#16866A]">SwasthyaSakhi</span>
            <span className="hidden sm:inline">· Sub-Centre Field Register</span>
            <button
              onClick={() => setIsVoiceSettingsOpen(true)}
              title="Configure Voice Settings"
              className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-[#16866A] font-bold px-2 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Voice: {voicePersona === 'child' ? "Child (Chhoti Sakhi)" : "Woman (Didi)"}</span>
              <Volume2 className="w-3 h-3 text-[#16866A]" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline Cache Active</span>
            </span>
            <button
              onClick={handleResetDemoData}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Voice Settings & Customizer Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        voicePersona={voicePersona}
        onVoicePersonaChange={handleVoicePersonaChange}
        languageCode={selectedLanguage.speechCode}
      />

      {/* Voice Capture Modal Overlay */}
      <VoiceCaptureModal
        isOpen={isVoiceCaptureOpen}
        onClose={() => setIsVoiceCaptureOpen(false)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onProcessTranscript={handleProcessTranscript}
        isProcessing={isProcessing}
        initialTranscript={activeTranscript}
      />

      {/* Bottom Sticky Mobile Navigation */}
      <BottomNavigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setActiveScreen('dashboard');
          setCurrentTab(tab);
        }}
        onOpenVoiceCapture={() => handleOpenVoiceVisit()}
        pendingFollowUpsCount={followUpTasks.filter((t) => !t.completed).length}
      />
    </div>
  );
}
