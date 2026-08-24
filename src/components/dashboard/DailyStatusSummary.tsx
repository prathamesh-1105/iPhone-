import React from 'react';
import { Card } from '../ui/Card';
import { useSavings } from '../../context/SavingsContext';
import { formatINR } from '../../lib/formatters';
import { CheckCircle2, Circle, CalendarCheck } from 'lucide-react';

export const DailyStatusSummary: React.FC = () => {
  const { group, todayEntryPartner1, todayEntryPartner2 } = useSavings();

  const partner1Saved = Boolean(todayEntryPartner1);
  const partner2Saved = Boolean(todayEntryPartner2);

  const amount1 = todayEntryPartner1 ? todayEntryPartner1.amount : 0;
  const amount2 = todayEntryPartner2 ? todayEntryPartner2.amount : 0;

  const combinedToday = amount1 + amount2;
  const targetCombined = group.dailyTargetPerPerson * 2;

  return (
    <Card className="p-5 sm:p-6 bg-gradient-to-r from-[#0b0f19] via-[#0f172a] to-[#0b0f19] text-white border-slate-800/80 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Side: Status Items */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 text-xs font-heading font-extrabold uppercase tracking-widest text-slate-400">
            <CalendarCheck className="w-4 h-4 text-blue-400" />
            <span>TODAY'S STATUS SUMMARY</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            {/* Partner 1 Row */}
            <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-3 rounded-2xl border border-slate-800/80">
              {partner1Saved ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500 shrink-0" />
              )}
              <div className="truncate">
                <span className="text-xs font-heading font-bold text-slate-200 block truncate">
                  {group.partner1Name}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    partner1Saved ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {partner1Saved ? `Saved ${formatINR(amount1)}` : "Hasn't saved yet"}
                </span>
              </div>
            </div>

            {/* Partner 2 Row */}
            <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-3 rounded-2xl border border-slate-800/80">
              {partner2Saved ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500 shrink-0" />
              )}
              <div className="truncate">
                <span className="text-xs font-heading font-bold text-slate-200 block truncate">
                  {group.partner2Name}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    partner2Saved ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {partner2Saved ? `Saved ${formatINR(amount2)}` : "Hasn't saved yet"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Today Combined Total */}
        <div className="shrink-0 text-left sm:text-right bg-blue-950/50 p-4.5 rounded-2xl border border-blue-900/50 w-full sm:w-auto">
          <span className="text-[11px] font-heading font-extrabold uppercase tracking-widest text-blue-300 block">
            TODAY'S COMBINED
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white mt-1">
            {formatINR(combinedToday)}{' '}
            <span className="text-xs font-normal text-blue-300">/ {formatINR(targetCombined)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
