import React from 'react';
import { Card } from '../ui/Card';
import { useSavings } from '../../context/SavingsContext';
import { formatINR } from '../../lib/formatters';
import { Award, Lock, CheckCircle2, PartyPopper } from 'lucide-react';

export const MilestoneGrid: React.FC = () => {
  const { milestones, entries } = useSavings();
  const totalSaved = entries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-500" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider m-0">
            SAVINGS MILESTONES
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {milestones.filter((m) => totalSaved >= m.amount).length} of {milestones.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {milestones.map((m) => {
          const isUnlocked = totalSaved >= m.amount;
          const progress = Math.min(100, Math.round((totalSaved / m.amount) * 100));

          return (
            <div
              key={m.id}
              className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                isUnlocked
                  ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30 text-slate-900 dark:text-white'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isUnlocked
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {isUnlocked ? <PartyPopper className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {m.title || `Milestone ${formatINR(m.amount)}`}
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
                      {formatINR(m.amount)}
                    </span>
                  </div>
                </div>

                {isUnlocked && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                    Unlocked
                  </span>
                )}
              </div>

              {m.description && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-3">
                  {m.description}
                </p>
              )}

              {/* Progress bar inside milestone card */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isUnlocked ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
