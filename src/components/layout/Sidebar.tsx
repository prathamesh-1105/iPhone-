import React from 'react';
import { ViewTab } from '../../types';
import { Home, Calendar, BarChart3, History, Settings, HeartHandshake } from 'lucide-react';
import { useSavings } from '../../context/SavingsContext';
import { formatINR } from '../../lib/formatters';

interface SidebarProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { entries, group } = useSavings();
  const totalSaved = entries.reduce((sum, e) => sum + e.amount, 0);
  const progressPercent = Math.min(100, Math.round((totalSaved / group.targetAmount) * 100));

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 p-4 border-r border-slate-200/80 dark:border-slate-800/80 min-h-[calc(100vh-61px)] bg-slate-50/50 dark:bg-[#090d16]/50">
      {/* Navigation List */}
      <div className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as ViewTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sidebar Mini Progress Summary Card */}
      <div className="mt-auto p-4 rounded-3xl bg-gradient-to-br from-blue-900/10 via-indigo-900/10 to-purple-900/10 border border-blue-500/20 dark:border-blue-500/30">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">
          <HeartHandshake className="w-4 h-4" />
          <span>{group.partner1Name} & {group.partner2Name}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Saved so far</p>
        <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{formatINR(totalSaved)}</p>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-right text-slate-500 dark:text-slate-400 mt-1 font-semibold">
          {progressPercent}% of {formatINR(group.targetAmount)}
        </p>
      </div>
    </aside>
  );
};
