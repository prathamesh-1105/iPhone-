import React from 'react';
import { Card } from '../ui/Card';
import { useSavings } from '../../context/SavingsContext';
import { Flame, Trophy, Heart } from 'lucide-react';

export const SavingsStreakCard: React.FC = () => {
  const { streakStats } = useSavings();

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30 p-5">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Current Streak & Flame */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 shrink-0 glow-effect">
            <Flame className="w-8 h-8 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <span>CURRENT STREAK</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {streakStats.currentStreak} {streakStats.currentStreak === 1 ? 'day' : 'days'}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
              <span>{streakStats.currentStreak} days of saving together!</span>
              <Heart className="w-3 h-3 text-rose-500 fill-current" />
            </p>
          </div>
        </div>

        {/* Right Side: Best Streak */}
        <div className="shrink-0 bg-white/80 dark:bg-slate-900/80 px-4 py-3 rounded-2xl border border-amber-500/20 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>BEST STREAK</span>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {streakStats.bestStreak} {streakStats.bestStreak === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>
    </Card>
  );
};
