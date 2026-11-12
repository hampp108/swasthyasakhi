import React, { useState } from 'react';
import {
  Check,
  Edit3,
  Mic,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertTriangle,
  Calendar,
  User,
  Heart,
  Baby,
  Syringe,
  ClipboardList,
  Sparkles,
  ArrowLeft,
  Send,
  HelpCircle,
} from 'lucide-react';
import { StructuredRecord } from '../types';
import { DangerSignAlert } from './DangerSignAlert';
import { ttsService } from '../services/ttsService';

interface VisitRecordSummaryProps {
  record: StructuredRecord;
  onConfirm: () => void;
  onVoiceCorrect: (correctionText: string) => Promise<void>;
  onManualUpdate: (updatedRecord: StructuredRecord) => void;
  onBackToCapture: () => void;
  isCorrecting: boolean;
  selectedLanguageCode: string;
}

export const VisitRecordSummary: React.FC<VisitRecordSummaryProps> = ({
  record,
  onConfirm,
  onVoiceCorrect,
  onManualUpdate,
  onBackToCapture,
  isCorrecting,
  selectedLanguageCode,
}) => {
  const [isVoiceCorrectionOpen, setIsVoiceCorrectionOpen] = useState(false);
  const [correctionInput, setCorrectionInput] = useState('');
  const [isManualReviewOpen, setIsManualReviewOpen] = useState(false);
  const [editedRecord, setEditedRecord] = useState<StructuredRecord>(record);
  const [isReadingAloud, setIsReadingAloud] = useState(false);

  // Play spoken summary aloud
  const handleReadAloud = async () => {
    setIsReadingAloud(true);
    await ttsService.speak(record.spokenSummary, selectedLanguageCode);
    setIsReadingAloud(false);
  };

  const handleStopSpeaking = () => {
    ttsService.cancel();
    setIsReadingAloud(false);
  };

  const handleApplyVoiceCorrection = async (text: string) => {
    if (!text.trim()) return;
    await onVoiceCorrect(text.trim());
    setCorrectionInput('');
    setIsVoiceCorrectionOpen(false);
  };

  const handleSaveManualReview = () => {
    onManualUpdate(editedRecord);
    setIsManualReviewOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 px-4 sm:px-6 animate-in fade-in duration-300">
      {/* Top Navigation & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToCapture}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#16866A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dictation</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Record Status:</span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              record.confirmed
                ? 'bg-emerald-100 text-emerald-800'
                : record.isEmergency
                ? 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {record.confirmed ? 'Confirmed & Saved' : record.isEmergency ? 'Urgent Review' : 'Pending Confirmation'}
          </span>
        </div>
      </div>

      {/* Emergency Danger Sign Banner if detected */}
      {record.isEmergency && record.dangerSigns && record.dangerSigns.length > 0 && (
        <DangerSignAlert
          dangerSigns={record.dangerSigns}
          beneficiaryName={record.visitInfo.beneficiaryName}
          onReadAloud={() => {
            ttsService.speak(
              record.emergencyAlertMessage ||
                `DANGER SIGN DETECTED. Please refer ${record.visitInfo.beneficiaryName} to the nearest Primary Health Centre immediately.`,
              selectedLanguageCode
            );
          }}
        />
      )}

      {/* Voice Read-back Box (Spoken Read-back to ASHA Worker) */}
      <div className="rounded-3xl bg-gradient-to-br from-[#E5F4ED] to-white p-5 border border-[#16866A]/20 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#16866A] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#16866A]">
                  SwasthyaSakhi Voice Read-back
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const current = ttsService.getPersona();
                    const next = current === 'woman' ? 'child' : 'woman';
                    ttsService.setPersona(next);
                    handleReadAloud();
                  }}
                  title="Tap to toggle between Woman and Child voice"
                  className="text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 hover:border-[#16866A] shadow-2xs"
                >
                  Voice: {ttsService.getSelectedGnaniVoice()} (Gnani AI) ⇄
                </button>
              </div>
              <p className="text-[11px] text-slate-500">Audio verification in your selected language</p>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-2">
            {isReadingAloud ? (
              <button
                onClick={handleStopSpeaking}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Speaking (Barge-in)</span>
              </button>
            ) : (
              <button
                onClick={handleReadAloud}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16866A] text-white text-xs font-bold shadow-sm hover:bg-[#13745c] active:scale-95 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Read Aloud</span>
              </button>
            )}
            <button
              onClick={handleReadAloud}
              title="Repeat audio summary"
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#16866A] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Read-back quote */}
        <p className="text-sm font-medium text-[#243B35] bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/60 leading-relaxed italic">
          "{record.spokenSummary}"
        </p>

        {/* Confidence Check Warning if any uncertain medical items */}
        {record.confidence && record.confidence.uncertainFields && record.confidence.uncertainFields.length > 0 && (
          <div className="mt-3 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Confidence Check:</span> Please verify{' '}
              {record.confidence.uncertainFields.join(', ')} before confirming.
            </div>
          </div>
        )}
      </div>

      {/* Structured Visit Summary Cards */}
      <div className="space-y-4">
        {/* Section 1: Visit & Beneficiary Info */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-[#16866A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              1. Visit & Beneficiary Information
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Beneficiary Name</span>
              <span className="text-sm font-bold text-slate-800">{record.visitInfo.beneficiaryName || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Beneficiary ID</span>
              <span className="text-sm font-mono font-bold text-slate-800">{record.visitInfo.beneficiaryId || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Village / Household</span>
              <span className="text-sm font-semibold text-slate-800">{record.visitInfo.village || 'Doddaballapur Sector 2'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Visit Date & Type</span>
              <span className="text-sm font-bold text-[#16866A]">
                {record.visitInfo.visitDate} · {record.visitInfo.visitType}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Maternal & Pregnancy Details (if applicable) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Heart className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              2. Maternal & Pregnancy Observations
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Gestational Month</span>
              <span className="text-sm font-bold text-slate-800">{record.pregnancyInfo.pregnancyMonth || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">ANC Checkup Status</span>
              <span className="text-sm font-bold text-slate-800">{record.pregnancyInfo.ancCheckupStatus || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Blood Pressure (BP)</span>
              <span className="text-sm font-bold text-slate-800">{record.pregnancyInfo.bloodPressure || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">TT / Td Vaccination</span>
              <span className="text-sm font-bold text-slate-800">{record.pregnancyInfo.ttVaccineStatus || 'Not recorded'}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">IFA Tablets Distributed</span>
              <span className="text-sm font-semibold text-slate-800">{record.pregnancyInfo.ifaTabletStatus || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Original Field Observation</span>
              <span className="text-xs text-slate-600 italic">{record.pregnancyInfo.observations || record.originalTranscript}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Newborn Health (if applicable) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Baby className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              3. Newborn Health Status
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Baby Name / Relation</span>
              <span className="text-sm font-bold text-slate-800">{record.newbornInfo.babyName || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Baby Age</span>
              <span className="text-sm font-bold text-slate-800">{record.newbornInfo.babyAge || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Current Weight</span>
              <span className="text-sm font-bold text-slate-800">{record.newbornInfo.currentWeight || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Breastfeeding Status</span>
              <span className="text-sm font-bold text-slate-800">{record.newbornInfo.breastfeedingStatus || 'Not recorded'}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Immunisation & Follow-Up */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Syringe className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              4. Immunisation & Next Follow-Up Schedule
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Vaccines Recorded</span>
              <span className="text-sm font-bold text-slate-800">{record.immunisationInfo.vaccineName || 'None recorded'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Vaccination Status</span>
              <span className="text-sm font-bold text-slate-800">{record.immunisationInfo.vaccinationStatus || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Next Scheduled Visit</span>
              <span className="text-sm font-bold text-[#16866A]">{record.followUp.nextVisitDate || record.followUp.nextVisitDays || '15 days later'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Pending Tasks</span>
              <span className="text-sm font-semibold text-slate-800">{record.followUp.otherActions || 'Routine checkup'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Correction Sub-Dialog (if open) */}
      {isVoiceCorrectionOpen && (
        <div className="rounded-3xl bg-amber-50 p-5 border-2 border-amber-300 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-amber-700 animate-pulse" />
              <h4 className="text-sm font-bold text-amber-900">Voice Correction Engine</h4>
            </div>
            <button
              onClick={() => setIsVoiceCorrectionOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-amber-800 mb-3">
            Speak or enter the correction (e.g. <em>"No, baby weight is 2.8 kilo, not 2.5"</em> or{' '}
            <em>"Change BP to 110/70"</em> or <em>"Next visit after 10 days"</em>):
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={correctionInput}
              onChange={(e) => setCorrectionInput(e.target.value)}
              placeholder="e.g. No, baby weight is 2.8 kilo, not 2.5"
              className="flex-1 bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyVoiceCorrection(correctionInput);
              }}
            />
            <button
              onClick={() => handleApplyVoiceCorrection(correctionInput)}
              disabled={!correctionInput.trim() || isCorrecting}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isCorrecting ? (
                <span>Updating...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Apply Correction</span>
                </>
              )}
            </button>
          </div>

          {/* Quick preset correction chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[11px] font-semibold text-amber-800 self-center">Try quick phrases:</span>
            {[
              'No, baby weight is 2.8 kilo, not 2.5',
              'BP was 110/70 mmHg',
              'Next visit scheduled in 10 days',
              'ANC checkup is completed',
            ].map((phrase, i) => (
              <button
                key={i}
                onClick={() => handleApplyVoiceCorrection(phrase)}
                className="text-[11px] bg-white border border-amber-300 text-amber-900 rounded-lg px-2 py-1 hover:bg-amber-100/70 transition-colors"
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual Details Review Modal (if open) */}
      {isManualReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-bold text-slate-900">Review & Fine-Tune Visit Fields</h3>
            <p className="text-xs text-slate-500">Manual review fallback as per ASHA protocol</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  value={editedRecord.visitInfo.beneficiaryName}
                  onChange={(e) =>
                    setEditedRecord({
                      ...editedRecord,
                      visitInfo: { ...editedRecord.visitInfo, beneficiaryName: e.target.value },
                    })
                  }
                  className="w-full border rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={editedRecord.pregnancyInfo.bloodPressure}
                    onChange={(e) =>
                      setEditedRecord({
                        ...editedRecord,
                        pregnancyInfo: { ...editedRecord.pregnancyInfo, bloodPressure: e.target.value },
                      })
                    }
                    className="w-full border rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Baby Weight</label>
                  <input
                    type="text"
                    value={editedRecord.newbornInfo.currentWeight}
                    onChange={(e) =>
                      setEditedRecord({
                        ...editedRecord,
                        newbornInfo: { ...editedRecord.newbornInfo, currentWeight: e.target.value },
                      })
                    }
                    className="w-full border rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">IFA Tablets</label>
                  <input
                    type="text"
                    value={editedRecord.pregnancyInfo.ifaTabletStatus}
                    onChange={(e) =>
                      setEditedRecord({
                        ...editedRecord,
                        pregnancyInfo: { ...editedRecord.pregnancyInfo, ifaTabletStatus: e.target.value },
                      })
                    }
                    className="w-full border rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Next Visit Schedule</label>
                  <input
                    type="text"
                    value={editedRecord.followUp.nextVisitDays}
                    onChange={(e) =>
                      setEditedRecord({
                        ...editedRecord,
                        followUp: {
                          ...editedRecord.followUp,
                          nextVisitDays: e.target.value,
                          nextVisitDate: e.target.value + ' later',
                        },
                      })
                    }
                    className="w-full border rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsManualReviewOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveManualReview}
                className="px-4 py-2 rounded-xl bg-[#16866A] text-white text-xs font-bold hover:bg-[#13745c]"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3 Prominent Action Buttons required by spec:
          1. CONFIRM RECORD
          2. CORRECT BY VOICE
          3. REVIEW DETAILS
      */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          {/* Button 2: CORRECT BY VOICE */}
          <button
            onClick={() => setIsVoiceCorrectionOpen(!isVoiceCorrectionOpen)}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border-2 border-amber-500 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Mic className="w-4 h-4 text-amber-700" />
            <span>CORRECT BY VOICE</span>
          </button>

          {/* Button 3: REVIEW DETAILS */}
          <button
            onClick={() => setIsManualReviewOpen(true)}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Edit3 className="w-4 h-4 text-slate-600" />
            <span>REVIEW DETAILS</span>
          </button>

          {/* Button 1: CONFIRM RECORD */}
          <button
            onClick={onConfirm}
            className="w-full sm:flex-1 py-3.5 rounded-2xl bg-[#16866A] hover:bg-[#13745c] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#16866A]/25 active:scale-98 transition-all"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>CONFIRM & SAVE RECORD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
