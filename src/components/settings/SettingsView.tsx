import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useSavings } from '../../context/SavingsContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseSetupGuideModal } from './SupabaseSetupGuideModal';
import { Settings, User, Target, Bell, Database, Moon, Sun, Monitor, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { group, updateGroupConfig, resetToFreshSlate, seedDemoData } = useSavings();
  const { user, activeRole, switchActiveRole, isDemoMode, toggleDemoMode, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Form State
  const [partner1Name, setPartner1Name] = useState<string>(group.partner1Name);
  const [partner2Name, setPartner2Name] = useState<string>(group.partner2Name);
  const [goalName, setGoalName] = useState<string>(group.goalName);
  const [targetAmount, setTargetAmount] = useState<string>(String(group.targetAmount));
  const [targetDate, setTargetDate] = useState<string>(group.targetDate);
  const [dailyTarget, setDailyTarget] = useState<string>(String(group.dailyTargetPerPerson));
  const [goalImageUrl, setGoalImageUrl] = useState<string>(group.goalImageUrl || '');

  // Reminder State
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState<boolean>(() => {
    return localStorage.getItem('iphone_fund_daily_reminder') === 'true';
  });

  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [guideModalOpen, setGuideModalOpen] = useState<boolean>(false);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await updateGroupConfig({
      partner1Name,
      partner2Name,
      goalName,
      targetAmount: parseFloat(targetAmount) || 150000,
      targetDate,
      dailyTargetPerPerson: parseFloat(dailyTarget) || 200,
      goalImageUrl,
    });

    setIsSubmitting(false);
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  const handleReminderToggle = (enabled: boolean) => {
    setDailyReminderEnabled(enabled);
    localStorage.setItem('iphone_fund_daily_reminder', String(enabled));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight m-0">
              Settings & Group Configuration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Manage partner names, savings goal, target dates, and appearance
            </p>
          </div>
        </div>
      </Card>

      {/* Goal & Partner Configuration Form */}
      <Card className="p-5 sm:p-6">
        <form onSubmit={handleSaveConfig} className="space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider m-0">
              SAVINGS GOAL CONFIGURATION
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Partner 1 Name"
              value={partner1Name}
              onChange={(e) => setPartner1Name(e.target.value)}
              required
            />
            <Input
              label="Partner 2 Name"
              value={partner2Name}
              onChange={(e) => setPartner2Name(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Goal Name"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              required
            />
            <Input
              label="Target Amount (INR ₹)"
              prefixSymbol="₹"
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Daily Target Per Person (₹)"
              prefixSymbol="₹"
              type="number"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(e.target.value)}
              required
            />
            <Input
              label="Target Completion Date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Goal Image URL (Optional Remote Image)"
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={goalImageUrl}
            onChange={(e) => setGoalImageUrl(e.target.value)}
            helperText="Custom image preview on dashboard hero card"
          />

          <div className="flex items-center justify-between pt-2">
            {isSavedSuccess ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Configuration saved successfully!
              </span>
            ) : <span />}

            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Configurations
            </Button>
          </div>
        </form>
      </Card>

      {/* Appearance & Theme */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Moon className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider m-0">
            APPEARANCE & THEME
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-2xl border text-center transition-all ${
              theme === 'light'
                ? 'bg-blue-600/10 border-blue-600 text-blue-600 dark:text-blue-400 font-bold ring-2 ring-blue-600/20'
                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sun className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <span className="text-xs">Light</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-2xl border text-center transition-all ${
              theme === 'dark'
                ? 'bg-blue-600/10 border-blue-600 text-blue-600 dark:text-blue-400 font-bold ring-2 ring-blue-600/20'
                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Moon className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
            <span className="text-xs">Dark</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`p-3.5 rounded-2xl border text-center transition-all ${
              theme === 'system'
                ? 'bg-blue-600/10 border-blue-600 text-blue-600 dark:text-blue-400 font-bold ring-2 ring-blue-600/20'
                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Monitor className="w-5 h-5 mx-auto mb-1 text-slate-400" />
            <span className="text-xs">System</span>
          </button>
        </div>
      </Card>

      {/* Daily Reminder UI */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider m-0">
                DAILY SAVINGS REMINDER
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                "Don't forget to save ₹{group.dailyTargetPerPerson} today ❤️"
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={dailyReminderEnabled}
              onChange={(e) => handleReminderToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-blue-600" />
          </label>
        </div>
      </Card>

      {/* Database & Data Management */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider m-0">
              DATABASE & STORAGE
            </h3>
          </div>

          <Badge variant={isSupabaseConfigured() ? 'emerald' : 'amber'}>
            {isSupabaseConfigured() ? 'Supabase Connected' : 'Local Demo Mode'}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Supabase PostgreSQL Integration
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Connect environment keys for production multi-device sync
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setGuideModalOpen(true)}
          >
            Setup Guide
          </Button>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {
              seedDemoData();
              alert('Sample demo entries re-loaded!');
            }}
          >
            Re-seed Sample Data
          </Button>

          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => {
              if (window.confirm('Reset all savings data to zero for a fresh new couple start?')) {
                resetToFreshSlate();
              }
            }}
          >
            Reset to Fresh Zero Slate
          </Button>
        </div>
      </Card>

      <SupabaseSetupGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </div>
  );
};
