import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useSavings } from '../../context/SavingsContext';
import { formatINR, formatDate } from '../../lib/formatters';
import { Compass, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const GoalProjection: React.FC = () => {
  const { paceProjection } = useSavings();
  const {
    currentPacePerDay,
    estimatedCompletionDate,
    status,
    dailyDiffMessage,
  } = paceProjection;

  const isAhead = status === 'ahead' || status === 'on_track';

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-purple-500" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider m-0">
            ARE WE ON TRACK?
          </h3>
        </div>

        <Badge variant={isAhead ? 'emerald' : 'amber'} size="md" className="gap-1">
          {isAhead ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          <span>{isAhead ? 'Ahead of Schedule' : 'Needs Boost'}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
            Current Savings Pace
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">
            {formatINR(currentPacePerDay)}
            <span className="text-xs font-normal text-slate-400">/day</span>
          </span>
        </div>

        <div className="bg-purple-500/10 p-3.5 rounded-2xl border border-purple-500/20">
          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium block">
            Estimated Completion Date
          </span>
          <span className="text-xl font-black text-purple-600 dark:text-purple-300 block mt-0.5">
            {formatDate(estimatedCompletionDate)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
        <span>{dailyDiffMessage}</span>
      </div>
    </Card>
  );
};
