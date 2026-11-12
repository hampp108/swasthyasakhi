import React from 'react';
import {
  Mic,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  PhoneCall,
  User,
  Heart,
  Baby,
  Activity,
  Check,
} from 'lucide-react';
import { Beneficiary, DemoScenario, FollowUpTask, StructuredRecord } from '../types';
import { DEMO_SCENARIOS } from '../constants/data';

interface DashboardProps {
  onStartVoiceVisit: (beneficiary?: Beneficiary) => void;
  onSelectScenario: (scenario: DemoScenario) => void;
  onViewRecord: (record: StructuredRecord) => void;
  onNavigateToFollowUps: () => void;
  recentVisits: StructuredRecord[];
  followUpTasks: FollowUpTask[];
  beneficiaries: Beneficiary[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartVoiceVisit,
  onSelectScenario,
  onViewRecord,
  onNavigateToFollowUps,
  recentVisits,
  followUpTasks,
  beneficiaries,
}) => {
  // Statistics calculations
  const todayVisitsCount = 4;
  const completedVisitsCount = recentVisits.length;
  const pendingFollowUpsCount = followUpTasks.filter((t) => !t.completed).length;
  const highPriorityAlertCount = followUpTasks.filter(
    (t) => !t.completed && (t.priority === 'EMERGENCY' || t.priority === 'HIGH')
  ).length;

  const urgentAlerts = followUpTasks.filter(
    (t) => !t.completed && (t.priority === 'EMERGENCY' || t.priority === 'HIGH')
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-28 px-4 sm:px-6 animate-in fade-in duration-200">
      {/* Visual Welcome Banner with Rich Healthcare Imagery & Mission Badges */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg shadow-emerald-950/5 border border-emerald-100 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="p-6 sm:p-8 md:col-span-7 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#16866A] bg-[#E5F4ED] px-2.5 py-1 rounded-lg border border-[#16866A]/20">
                National Health Mission (NHM)
              </span>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Sub-Centre Field Register
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#243B35] tracking-tight leading-tight">
              Voice-First Field Documentation for ASHA Community Workers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              Eliminate manual paper registers during household visits. Speak naturally in Kannada,
              Hindi, or English—SwasthyaSakhi structures observations, detects maternal & newborn danger
              signs, and schedules follow-ups with voice confirmations.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onStartVoiceVisit()}
                className="px-5 py-3 rounded-2xl bg-[#16866A] hover:bg-[#13745c] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#16866A]/25 active:scale-95 transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Start Voice Visit</span>
              </button>
              <button
                onClick={() => onSelectScenario(DEMO_SCENARIOS[0])}
                className="px-4 py-3 rounded-2xl bg-[#E5F4ED] hover:bg-[#d6ede2] text-[#16866A] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all border border-[#16866A]/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try Sample Voice Visit</span>
              </button>
            </div>
          </div>

          <div className="hidden md:block md:col-span-5 h-full min-h-[250px] relative">
            <img
              src="/assets/images/field_health_visit_1794328374926.jpg"
              alt="ASHA worker conducting home visit in Indian village"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* 4 Rich Statistics Metric Cards with Subtle Trends */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Today's Assigned Visits */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E5F4ED] text-[#16866A] flex items-center justify-center shrink-0 shadow-xs">
            <Calendar className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Today's Visits</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {todayVisitsCount} <span className="text-xs font-medium text-slate-400">assigned</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
              Doddaballapur Sector
            </span>
          </div>
        </div>

        {/* Stat 2: Verified Completed Visits */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Completed Visits</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {completedVisitsCount} <span className="text-xs font-medium text-slate-400">logged</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
              Voice Verified
            </span>
          </div>
        </div>

        {/* Stat 3: Pending Follow-ups */}
        <div
          onClick={onNavigateToFollowUps}
          className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#16866A] transition-all cursor-pointer flex items-center gap-3.5 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Pending Follow-ups</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-[#16866A] transition-colors">
              {pendingFollowUpsCount} <span className="text-xs font-medium text-slate-400">actions</span>
            </div>
            <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block flex items-center gap-1">
              <span>View list</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* Stat 4: High Priority Referral Alerts */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-red-200 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3.5 bg-gradient-to-br from-red-50/60 to-white">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldAlert className="w-6 h-6 animate-pulse stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-bold text-red-800 block">High Priority Alerts</span>
            <div className="text-2xl font-black text-red-600 tracking-tight">
              {highPriorityAlertCount} <span className="text-xs font-medium text-red-700/60">referrals</span>
            </div>
            <span className="text-[10px] text-red-600 font-bold mt-0.5 block">
              PHC Escalate Ready
            </span>
          </div>
        </div>
      </div>

      {/* Main Section: "Ready for your next home visit?" Card with Prominent HUGE Green Microphone Button */}
      <div className="rounded-3xl bg-gradient-to-b from-[#16866A] via-[#147a60] to-[#0f5c49] text-white p-7 sm:p-10 shadow-2xl shadow-[#16866A]/25 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -bottom-12 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-28 -top-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-100">
              Active Household Visit Workflow
            </span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready for your next home visit?
          </h3>
          <p className="text-sm sm:text-base text-emerald-100 max-w-lg mx-auto leading-relaxed">
            Simply speak your observations. I'll take care of the documentation.
          </p>

          {/* HUGE GREEN MICROPHONE BUTTON */}
          <div className="pt-4 pb-2 flex flex-col items-center">
            <button
              onClick={() => onStartVoiceVisit()}
              className="group relative flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white text-[#16866A] hover:bg-emerald-50 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ring-8 ring-white/20"
              aria-label="Start Voice Visit"
            >
              <span className="absolute -inset-4 rounded-full bg-white/25 group-hover:bg-white/35 animate-ping opacity-60" />
              <div className="flex flex-col items-center justify-center text-center">
                <Mic className="w-11 h-11 sm:w-14 sm:h-14 text-[#16866A] group-hover:scale-110 transition-transform stroke-[2.2]" />
                <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase mt-1 text-[#16866A]">
                  START
                </span>
              </div>
            </button>
            <span className="text-xs sm:text-sm font-black text-white mt-3.5 uppercase tracking-wider">
              START VOICE VISIT
            </span>
          </div>

          <p className="text-xs text-emerald-100/90 font-medium">
            Natural speech with code-mixing: ANC checkup, TT injection, IFA goli, BP check, baby weight, PHC
          </p>
        </div>
      </div>

      {/* Demo Mode: 3 Preset Demonstration Scenarios */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#16866A]" /> Demo Mode: Try Sample Voice Visits
            </h3>
            <p className="text-xs text-slate-500">
              Evaluate real Gemini speech extraction, danger-sign detection, and follow-up generation
            </p>
          </div>
          <span className="text-xs font-bold text-[#16866A] bg-[#E5F4ED] px-3 py-1 rounded-xl border border-[#16866A]/20">
            Interactive Test Suite
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {DEMO_SCENARIOS.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className="p-4 rounded-2xl border border-slate-200 hover:border-[#16866A] hover:shadow-md bg-white hover:bg-slate-50/70 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                      scenario.id === 'SCENARIO_C'
                        ? 'bg-red-100 text-red-700'
                        : scenario.id === 'SCENARIO_B'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {scenario.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {scenario.beneficiaryId}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#16866A] transition-colors">
                  {scenario.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#16866A]">
                <span>Run voice extraction</span>
                <Play className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Grid: Recent Visits & Urgent Alerts / Upcoming Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Visits */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#16866A]" /> Recent Visit Registers
            </h3>
            <span className="text-xs font-semibold text-slate-400">{recentVisits.length} visits logged</span>
          </div>

          <div className="space-y-2.5">
            {recentVisits.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onViewRecord(rec)}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 cursor-pointer transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      rec.isEmergency ? 'bg-red-100 text-red-700' : 'bg-[#E5F4ED] text-[#16866A]'
                    }`}
                  >
                    {rec.visitInfo.visitType === 'Newborn' ? (
                      <Baby className="w-5 h-5" />
                    ) : (
                      <Heart className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm group-hover:text-[#16866A] transition-colors">
                        {rec.visitInfo.beneficiaryName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {rec.visitInfo.beneficiaryId}
                      </span>
                      {rec.isEmergency && (
                        <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.2 rounded">
                          EMERGENCY
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {rec.visitInfo.visitType} · {rec.spokenSummary}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#16866A] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Urgent Alerts & Upcoming Follow-ups */}
        <div className="space-y-4">
          {/* Urgent Alerts section */}
          {urgentAlerts.length > 0 && (
            <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" /> High Priority Referral Alerts
                </span>
                <span className="text-xs text-red-600 font-bold">Immediate action</span>
              </div>
              <div className="space-y-2">
                {urgentAlerts.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-2xl bg-white border border-red-200 flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">{task.beneficiaryName}</span>
                        <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.2 rounded">
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-red-700 font-medium mt-0.5">{task.title}</p>
                    </div>
                    <a
                      href="tel:108"
                      className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                    >
                      <PhoneCall className="w-3 h-3" /> Call 108
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Follow-ups */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Upcoming Follow-up Schedule
              </h3>
              <button
                onClick={onNavigateToFollowUps}
                className="text-xs font-bold text-[#16866A] hover:underline"
              >
                View All ({followUpTasks.length})
              </button>
            </div>

            <div className="space-y-2">
              {followUpTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{task.beneficiaryName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {task.beneficiaryId}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{task.title}</p>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-[11px] whitespace-nowrap ${
                      task.dueDate.includes('overdue')
                        ? 'bg-rose-100 text-rose-700'
                        : task.dueDate === 'Today'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {task.dueDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
