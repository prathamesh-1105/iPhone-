import React from 'react';
import { Card } from '../ui/Card';
import { useSavings } from '../../context/SavingsContext';
import { formatINR, formatDate } from '../../lib/formatters';
import { Clock, Calculator, Users, User } from 'lucide-react';

export const TargetCountdownCard: React.FC = () => {
  const { group, paceProjection } = useSavings();
  const {
    daysRemaining,
    requiredDailyCombined,
    requiredDailyPerPerson,
  } = paceProjection;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider m-0">
            TARGET COUNTDOWN
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Target: {formatDate(group.targetDate, { short: true })}
        </span>
      </div>

      {/* Days Left Hero Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
            TIME REMAINING
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 block">
            🎯 {daysRemaining} {daysRemaining === 1 ? 'day left' : 'days left'}
          </span>
        </div>
        <Calculator className="w-8 h-8 text-amber-500/80 shrink-0" />
      </div>

      {/* Required Daily Breakdown Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>Combined Daily</span>
          </div>
          <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block">
            {formatINR(requiredDailyCombined)}<span className="text-xs font-medium text-slate-400">/day</span>
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <User className="w-3.5 h-3.5 text-indigo-500" />
            <span>Per Person</span>
          </div>
          <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block">
            {formatINR(requiredDailyPerPerson)}<span className="text-xs font-medium text-slate-400">/day</span>
          </span>
        </div>
      </div>
    </Card>
  );
};
