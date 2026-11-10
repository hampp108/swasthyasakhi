import React from 'react';
import { Home, Mic, Clock, Users } from 'lucide-react';

interface BottomNavigationProps {
  currentTab: 'home' | 'followups' | 'beneficiaries';
  onSelectTab: (tab: 'home' | 'followups' | 'beneficiaries') => void;
  onOpenVoiceCapture: () => void;
  pendingFollowUpsCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenVoiceCapture,
  pendingFollowUpsCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-2">
        {/* Tab 1: Home Dashboard */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === 'home' ? 'text-[#16866A]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-bold tracking-tight mt-1">Dashboard</span>
        </button>

        {/* Tab 2: Follow-ups */}
        <button
          onClick={() => onSelectTab('followups')}
          className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === 'followups' ? 'text-[#16866A]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Clock className={`w-5 h-5 ${currentTab === 'followups' ? 'stroke-[2.5]' : ''}`} />
          {pendingFollowUpsCount > 0 && (
            <span className="absolute top-1 right-5 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
              {pendingFollowUpsCount}
            </span>
          )}
          <span className="text-[10px] font-bold tracking-tight mt-1">Follow-ups</span>
        </button>

        {/* Tab 3: Central Primary Action: START VOICE VISIT */}
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={onOpenVoiceCapture}
            className="w-12 h-12 -mt-5 rounded-full bg-[#16866A] text-white flex items-center justify-center shadow-lg shadow-[#16866A]/30 hover:scale-105 active:scale-95 transition-all"
            aria-label="Start Voice Recording"
          >
            <Mic className="w-6 h-6" />
          </button>
          <span className="text-[10px] font-extrabold text-[#16866A] mt-0.5">Record</span>
        </div>

        {/* Tab 4: Beneficiaries */}
        <button
          onClick={() => onSelectTab('beneficiaries')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === 'beneficiaries' ? 'text-[#16866A]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className={`w-5 h-5 ${currentTab === 'beneficiaries' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-bold tracking-tight mt-1">Beneficiaries</span>
        </button>
      </div>
    </nav>
  );
};
