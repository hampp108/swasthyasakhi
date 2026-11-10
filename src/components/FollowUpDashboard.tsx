import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Mic,
  Calendar,
  Filter,
  Search,
  Plus,
  ShieldAlert,
  ArrowRight,
  PhoneCall,
  Check,
} from 'lucide-react';
import { FollowUpTask } from '../types';
import { ttsService } from '../services/ttsService';

interface FollowUpDashboardProps {
  tasks: FollowUpTask[];
  onToggleComplete: (taskId: string) => void;
  onVoiceComplete: (voiceCommand: string) => void;
  onStartVisitForBeneficiary: (beneficiaryId: string, name: string) => void;
}

export const FollowUpDashboard: React.FC<FollowUpDashboardProps> = ({
  tasks,
  onToggleComplete,
  onVoiceComplete,
  onStartVisitForBeneficiary,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TODAY' | 'OVERDUE' | 'HIGH_PRIORITY' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceInput, setVoiceInput] = useState('');
  const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false);

  // Categorized tasks
  const overdueTasks = tasks.filter((t) => !t.completed && t.daysRemaining < 0);
  const todayTasks = tasks.filter((t) => !t.completed && t.daysRemaining === 0);
  const upcomingTasks = tasks.filter((t) => !t.completed && t.daysRemaining > 0);
  const highPriorityTasks = tasks.filter(
    (t) => !t.completed && (t.priority === 'EMERGENCY' || t.priority === 'HIGH')
  );
  const completedTasks = tasks.filter((t) => t.completed);

  // Filter list
  const filteredTasks = tasks.filter((task) => {
    // Search match
    const matchesSearch =
      task.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.beneficiaryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'TODAY') return !task.completed && task.daysRemaining === 0;
    if (activeFilter === 'OVERDUE') return !task.completed && task.daysRemaining < 0;
    if (activeFilter === 'HIGH_PRIORITY')
      return !task.completed && (task.priority === 'EMERGENCY' || task.priority === 'HIGH');
    if (activeFilter === 'COMPLETED') return task.completed;
    return true;
  });

  const handleApplyVoiceComplete = (command: string) => {
    if (!command.trim()) return;
    onVoiceComplete(command.trim());
    setVoiceInput('');
    setIsVoiceInputOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-28 px-4 sm:px-6 animate-in fade-in duration-200">
      {/* Top Banner & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#243B35]">
            ASHA Follow-Up & Referral Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generated from voice visit records · Track maternal checkups, vaccines & PHC referrals
          </p>
        </div>

        {/* Voice Command Completion Trigger */}
        <button
          onClick={() => setIsVoiceInputOpen(!isVoiceInputOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#16866A] text-[#16866A] hover:bg-[#E5F4ED] text-xs font-bold shadow-sm transition-all active:scale-95"
        >
          <Mic className="w-4 h-4 text-[#16866A]" />
          <span>Voice Task Update</span>
        </button>
      </div>

      {/* Voice Complete Bar if toggled */}
      {isVoiceInputOpen && (
        <div className="p-4 rounded-3xl bg-[#E5F4ED] border border-[#16866A]/30 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#16866A] flex items-center gap-1.5">
              <Mic className="w-4 h-4" /> Spoken Follow-up Command
            </span>
            <button
              onClick={() => setIsVoiceInputOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-slate-700">
            Speak or type: <em>"Lakshmi's follow-up completed"</em> or{' '}
            <em>"Radha 14-day visit completed"</em>
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={voiceInput}
              onChange={(e) => setVoiceInput(e.target.value)}
              placeholder="e.g. Lakshmi's follow-up completed"
              className="flex-1 bg-white border border-[#16866A]/30 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16866A]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyVoiceComplete(voiceInput);
              }}
            />
            <button
              onClick={() => handleApplyVoiceComplete(voiceInput)}
              className="px-4 py-2 rounded-xl bg-[#16866A] text-white font-bold text-xs hover:bg-[#13745c]"
            >
              Update Task
            </button>
          </div>
          {/* Preset voice shortcuts */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-600">Quick speech:</span>
            {[
              "Lakshmi's follow-up completed",
              "Radha's visit completed",
              "Savitri's BP check done",
            ].map((shortcut, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyVoiceComplete(shortcut)}
                className="text-[11px] bg-white border border-slate-200 text-[#16866A] px-2 py-0.5 rounded-md hover:bg-slate-50"
              >
                "{shortcut}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeFilter === 'ALL'
              ? 'bg-[#16866A] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Tasks ({tasks.length})
        </button>

        <button
          onClick={() => setActiveFilter('HIGH_PRIORITY')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeFilter === 'HIGH_PRIORITY'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>High Priority ({highPriorityTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('TODAY')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeFilter === 'TODAY'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          Today's ({todayTasks.length})
        </button>

        <button
          onClick={() => setActiveFilter('OVERDUE')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeFilter === 'OVERDUE'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          Overdue ({overdueTasks.length})
        </button>

        <button
          onClick={() => setActiveFilter('COMPLETED')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeFilter === 'COMPLETED'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Completed ({completedTasks.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by beneficiary name (Lakshmi, Radha...), ID, or task..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16866A]"
        />
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No matching follow-up tasks</h4>
            <p className="text-xs text-slate-500 mt-1">All designated tasks in this category are up to date.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-3xl bg-white border transition-all flex items-start justify-between gap-3 shadow-xs ${
                task.completed
                  ? 'opacity-60 bg-slate-50/80 border-slate-200'
                  : task.priority === 'EMERGENCY'
                  ? 'border-red-300 bg-red-50/30'
                  : task.priority === 'HIGH'
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200 hover:border-[#16866A]'
              }`}
            >
              {/* Checkbox toggle */}
              <button
                onClick={() => onToggleComplete(task.id)}
                className={`w-6 h-6 rounded-lg mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                  task.completed
                    ? 'bg-emerald-600 text-white'
                    : 'border-2 border-slate-300 hover:border-[#16866A]'
                }`}
              >
                {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
              </button>

              {/* Task Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">
                    {task.beneficiaryName}
                  </span>
                  <span className="font-mono text-xs text-slate-400">{task.beneficiaryId}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.priority === 'EMERGENCY'
                        ? 'bg-red-600 text-white'
                        : task.priority === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Due: <strong>{task.dueDate}</strong>
                  </span>
                </div>

                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    task.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'
                  }`}
                >
                  {task.title}
                </p>

                {/* Direct quick action for emergency tasks */}
                {task.priority === 'EMERGENCY' && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <a
                      href="tel:108"
                      className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                    >
                      <PhoneCall className="w-3 h-3" /> Call 108
                    </a>
                    <span className="text-[11px] text-red-700 font-medium">
                      Immediate Primary Health Centre transfer required
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button: Start Voice Visit for this beneficiary */}
              {!task.completed && (
                <button
                  onClick={() => onStartVisitForBeneficiary(task.beneficiaryId, task.beneficiaryName)}
                  title="Start voice visit for this beneficiary"
                  className="px-3 py-1.5 rounded-xl bg-[#E5F4ED] hover:bg-[#16866A] text-[#16866A] hover:text-white text-xs font-bold flex items-center gap-1 transition-all shrink-0"
                >
                  <Mic className="w-3 h-3" />
                  <span className="hidden sm:inline">Conduct Visit</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
