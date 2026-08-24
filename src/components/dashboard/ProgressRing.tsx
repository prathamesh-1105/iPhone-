import React from 'react';
import { Card } from '../ui/Card';
import { useSavings } from '../../context/SavingsContext';
import { formatINR, getMotivationalMessage } from '../../lib/formatters';
import { ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';

export const ProgressRing: React.FC = () => {
  const { group, entries } = useSavings();
  const totalSaved = entries.reduce((sum, e) => sum + e.amount, 0);
  const remaining = Math.max(0, group.targetAmount - totalSaved);
  const progressPercent = Math.min(100, Math.round((totalSaved / group.targetAmount) * 100));

  // Circular SVG Math
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const motivationMsg = getMotivationalMessage(progressPercent, remaining);

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
        {/* Left Side: Circular SVG Meter & Main Stat */}
        <div className="flex items-center gap-6 w-full md:w-auto">
          {/* Circular Progress Gauge */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90 filter drop-shadow-md">
              {/* Background ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-100 dark:text-slate-800/80"
                strokeWidth="14"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Progress ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-blue-600 dark:text-blue-500 transition-all duration-1000 ease-out"
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                {progressPercent}%
              </span>
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                COMPLETE
              </span>
            </div>
          </div>

          {/* Main Numbers */}
          <div className="space-y-1">
            <p className="text-xs font-heading font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
              SAVINGS PROGRESS
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                {formatINR(totalSaved)}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              out of <strong className="text-slate-900 dark:text-white font-extrabold">{formatINR(group.targetAmount)}</strong> goal
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold pt-1">
              <TrendingUp className="w-4 h-4" />
              <span>{progressPercent}% Achieved</span>
            </div>
          </div>
        </div>

        {/* Right Side: Key Metrics Breakdown Cards */}
        <div className="grid grid-cols-3 gap-3.5 w-full md:w-auto md:min-w-[360px]">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-[10px] font-heading font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
              TARGET
            </span>
            <span className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white mt-1 block truncate">
              {formatINR(group.targetAmount)}
            </span>
          </div>

          <div className="bg-blue-500/10 dark:bg-blue-500/15 p-4 rounded-2xl border border-blue-500/30 text-center">
            <span className="text-[10px] font-heading font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
              SAVED
            </span>
            <span className="text-base sm:text-lg font-heading font-black text-blue-600 dark:text-blue-400 mt-1 block truncate">
              {formatINR(totalSaved)}
            </span>
          </div>

          <div className="bg-amber-500/10 dark:bg-amber-500/15 p-4 rounded-2xl border border-amber-500/30 text-center">
            <span className="text-[10px] font-heading font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
              REMAINING
            </span>
            <span className="text-base sm:text-lg font-heading font-black text-amber-600 dark:text-amber-400 mt-1 block truncate">
              {formatINR(remaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Bar */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
        <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-3.5 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Motivational Banner */}
        <div className="flex items-center gap-2 mt-3.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
          <span>{motivationMsg}</span>
        </div>
      </div>
    </Card>
  );
};
