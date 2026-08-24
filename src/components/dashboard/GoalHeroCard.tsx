import React from 'react';
import { Card } from '../ui/Card';
import { useSavings } from '../../context/SavingsContext';
import { formatINR, formatDate } from '../../lib/formatters';
import { Sparkles, Calendar, Target, Heart } from 'lucide-react';

export const GoalHeroCard: React.FC = () => {
  const { group } = useSavings();

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[#0b0f19] via-[#11192e] to-[#070a12] text-white border border-blue-500/20 shadow-2xl shadow-blue-950/40 p-6 sm:p-8 rounded-[2.5rem]">
      {/* Background Decorative Mesh Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
        <div className="flex-1 text-center sm:text-left space-y-4">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-heading font-extrabold uppercase tracking-widest backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>PRIVATE COUPLE SAVINGS FUND</span>
          </div>

          {/* Goal Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-white tracking-tight m-0 leading-none drop-shadow-sm">
            {group.goalName}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-lg leading-relaxed">
            Saving together, one day at a time. Built for{' '}
            <span className="font-extrabold text-white underline decoration-blue-500 decoration-2 underline-offset-4">{group.partner1Name}</span> &{' '}
            <span className="font-extrabold text-white underline decoration-indigo-500 decoration-2 underline-offset-4">{group.partner2Name}</span>{' '}
            <Heart className="inline w-4 h-4 text-rose-500 fill-current ml-0.5" />
          </p>

          {/* Key Metrics Chips */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-slate-300">
              <Target className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Target: <strong className="text-white font-extrabold font-heading text-sm">{formatINR(group.targetAmount)}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-slate-300">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Goal Date: <strong className="text-white font-extrabold font-heading text-sm">{formatDate(group.targetDate)}</strong></span>
            </div>
          </div>
        </div>

        {/* iPhone Flagship Graphic Mockup */}
        <div className="relative shrink-0 group">
          <div className="w-40 h-52 sm:w-44 sm:h-56 rounded-[2rem] bg-gradient-to-b from-slate-800 to-slate-950 p-3 border border-slate-700/80 shadow-2xl shadow-blue-500/20 flex flex-col items-center justify-between overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:border-blue-500/50">
            {/* Dynamic Island Notch */}
            <div className="w-12 h-3.5 bg-black rounded-full mb-1 border border-slate-800 shadow-inner z-10" />

            <img
              src={group.goalImageUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'}
              alt={group.goalName}
              className="w-full h-36 object-cover rounded-xl opacity-95 group-hover:opacity-100 transition-opacity"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80';
              }}
            />

            {/* Bottom Flagship Tag */}
            <div className="w-full text-center py-1 bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-800">
              <span className="text-[10px] font-heading font-black uppercase tracking-widest text-slate-300">
                TITANIUM PRO
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
