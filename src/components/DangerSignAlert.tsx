import React from 'react';
import { AlertTriangle, PhoneCall, Building2, Volume2, ShieldAlert, ArrowRight } from 'lucide-react';
import { DangerSignItem } from '../types';

interface DangerSignAlertProps {
  dangerSigns: DangerSignItem[];
  beneficiaryName: string;
  onReadAloud?: () => void;
  onReferralInitiated?: () => void;
}

export const DangerSignAlert: React.FC<DangerSignAlertProps> = ({
  dangerSigns,
  beneficiaryName,
  onReadAloud,
  onReferralInitiated,
}) => {
  if (!dangerSigns || dangerSigns.length === 0) return null;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 shadow-xl shadow-red-900/20 border-2 border-red-500 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
          <AlertTriangle className="w-7 h-7 text-white animate-bounce" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase bg-white text-red-700 px-2 py-0.5 rounded-md shadow-sm">
                CRITICAL EMERGENCY PROTOCOL
              </span>
              <span className="text-xs text-red-100 font-medium">NHM / WHO IMNCI Guideline</span>
            </div>
            {onReadAloud && (
              <button
                onClick={onReadAloud}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-semibold backdrop-blur-sm transition-all"
                title="Read referral warning aloud"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Spoken Warning</span>
              </button>
            )}
          </div>

          <h2 className="text-lg font-bold text-white mt-1.5 leading-snug">
            DANGER SIGN DETECTED: Immediate PHC Referral Required
          </h2>
          <p className="text-sm text-red-100 mt-1 leading-relaxed">
            A predefined high-risk clinical danger sign was identified during the home visit for{' '}
            <strong className="text-white underline">{beneficiaryName || 'the beneficiary'}</strong>.
            Please refer to the nearest Primary Health Centre immediately.
          </p>

          {/* List of detected danger signs */}
          <div className="mt-3.5 space-y-2">
            {dangerSigns.map((sign, idx) => (
              <div
                key={idx}
                className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/20 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0" />
                    <span className="font-bold text-white text-sm">{sign.sign}</span>
                    <span className="text-[11px] bg-red-950/60 text-amber-200 px-2 py-0.5 rounded">
                      {sign.guidelineCategory}
                    </span>
                  </div>
                  <p className="text-xs text-red-100 mt-1">
                    <strong className="text-white">Action Protocol:</strong> {sign.actionRequired}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Direct Urgent Action Buttons for ASHA worker */}
          <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center gap-2.5">
            <a
              href="tel:108"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-red-700 font-bold text-sm shadow-md hover:bg-red-50 active:scale-95 transition-all"
            >
              <PhoneCall className="w-4 h-4 text-red-700" />
              <span>Call 108 Ambulance</span>
            </a>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-medium border border-white/20">
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Nearest: Doddaballapur Taluk Hospital PHC (4.2 km)</span>
            </div>
            {onReferralInitiated && (
              <button
                onClick={onReferralInitiated}
                className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all"
              >
                <span>Log PHC Referral Task</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
