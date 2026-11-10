import React, { useState } from 'react';
import { Users, Phone, MapPin, Calendar, Heart, Baby, Syringe, Mic, Search } from 'lucide-react';
import { Beneficiary } from '../types';

interface BeneficiaryDirectoryProps {
  beneficiaries: Beneficiary[];
  onStartVoiceVisit: (beneficiary: Beneficiary) => void;
}

export const BeneficiaryDirectory: React.FC<BeneficiaryDirectoryProps> = ({
  beneficiaries,
  onStartVoiceVisit,
}) => {
  const [search, setSearch] = useState('');

  const filtered = beneficiaries.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.village.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-28 px-4 sm:px-6 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#243B35]">
            Beneficiary Field Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synthetic household health registers for ASHA Sub-Centre · Doddaballapur Sector
          </p>
        </div>
        <span className="text-xs font-bold text-[#16866A] bg-[#E5F4ED] px-3 py-1.5 rounded-xl">
          {beneficiaries.length} Registered Mothers & Infants
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search beneficiaries by name, ID, or village..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16866A]"
        />
      </div>

      {/* Grid of Beneficiaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#16866A] transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${
                    b.category === 'Newborn'
                      ? 'bg-amber-100 text-amber-800'
                      : b.category === 'Immunisation'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-[#E5F4ED] text-[#16866A]'
                  }`}
                >
                  {b.category === 'Newborn' ? (
                    <Baby className="w-6 h-6" />
                  ) : b.category === 'Immunisation' ? (
                    <Syringe className="w-6 h-6" />
                  ) : (
                    <Heart className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">{b.name}</h3>
                    <span className="text-xs font-mono font-semibold text-slate-400">{b.id}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    Age: {b.age} yrs · {b.category}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  b.status === 'High Risk'
                    ? 'bg-red-100 text-red-700'
                    : b.status === 'Due Today'
                    ? 'bg-amber-100 text-amber-800'
                    : b.status === 'Overdue'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {b.status}
              </span>
            </div>

            {/* Household metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{b.village}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{b.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Last: {b.lastVisitDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#16866A] shrink-0" />
                <span className="font-semibold text-[#16866A]">Next: {b.nextScheduledDate}</span>
              </div>
            </div>

            {/* Category observations note */}
            {b.gestationalMonth && (
              <p className="text-xs font-medium text-slate-700">
                <strong>Pregnancy Stage:</strong> {b.gestationalMonth}
              </p>
            )}
            {b.babyAge && (
              <p className="text-xs font-medium text-slate-700">
                <strong>Infant Status:</strong> {b.babyAge} old
              </p>
            )}

            {/* Start Visit Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{b.ward}</span>
              <button
                onClick={() => onStartVoiceVisit(b)}
                className="px-4 py-2 rounded-xl bg-[#16866A] hover:bg-[#13745c] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Start Visit for {b.name}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
