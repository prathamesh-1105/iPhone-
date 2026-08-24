import React from 'react';
import { Card } from '../ui/Card';
import { useSavings } from '../../context/SavingsContext';
import { formatINR, formatDate } from '../../lib/formatters';
import { Activity, ArrowUpRight, ArrowRight } from 'lucide-react';
import { ViewTab } from '../../types';

interface RecentActivityProps {
  onNavigateToHistory: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ onNavigateToHistory }) => {
  const { entries } = useSavings();
  const recentList = entries.slice(0, 5);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider m-0">
            RECENT SAVINGS ACTIVITY
          </h3>
        </div>
        <button
          onClick={onNavigateToHistory}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recentList.length === 0 ? (
        <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs">
          <p className="font-semibold">Your iPhone fund starts today.</p>
          <p className="text-[11px] mt-1">Save your first ₹200 and begin the journey together.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {recentList.map((entry) => (
            <div key={entry.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    entry.partnerRole === 'partner1'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {entry.userName.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {entry.userName}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                    {formatDate(entry.date, { relative: true })} {entry.note ? `• ${entry.note}` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                <ArrowUpRight className="w-4 h-4 shrink-0" />
                <span>+{formatINR(entry.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
