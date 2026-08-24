import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSavings } from '../../context/SavingsContext';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Smartphone, UserCheck, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { user, activeRole, switchActiveRole, isDemoMode } = useAuth();
  const { group } = useSavings();
  const { isDark, setTheme } = useTheme();

  const partner1Name = group.partner1Name;
  const partner2Name = group.partner2Name;

  const currentUserName = activeRole === 'partner1' ? partner1Name : partner2Name;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-[#07090e]/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-heading font-black tracking-tight text-slate-900 dark:text-white uppercase m-0 leading-none">
                OUR iPHONE FUND
              </h1>
              {isDemoMode && (
                <Badge variant="amber" size="sm" className="hidden sm:inline-flex gap-1 font-heading font-extrabold">
                  <Sparkles className="w-3 h-3" /> Demo Mode
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 hidden sm:block">
              Saving together, one day at a time.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Partner Identity Switcher pill */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
            <button
              onClick={() => switchActiveRole('partner1')}
              className={`px-3 py-1.5 rounded-xl font-heading font-extrabold transition-all cursor-pointer ${
                activeRole === 'partner1'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={`Switch identity to ${partner1Name}`}
            >
              {partner1Name}
            </button>
            <button
              onClick={() => switchActiveRole('partner2')}
              className={`px-3 py-1.5 rounded-xl font-heading font-extrabold transition-all cursor-pointer ${
                activeRole === 'partner2'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={`Switch identity to ${partner2Name}`}
            >
              {partner2Name}
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/60 dark:border-slate-800 cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Account / Auth Trigger */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-heading font-bold rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors border border-slate-200/80 dark:border-slate-700 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="max-w-[80px] sm:max-w-[120px] truncate">{user ? user.name : currentUserName}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
