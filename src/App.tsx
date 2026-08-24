import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SavingsProvider, useSavings } from './context/SavingsContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Sidebar } from './components/layout/Sidebar';
import { GoalHeroCard } from './components/dashboard/GoalHeroCard';
import { ProgressRing } from './components/dashboard/ProgressRing';
import { TargetCountdownCard } from './components/dashboard/TargetCountdownCard';
import { DailyCheckIn } from './components/dashboard/DailyCheckIn';
import { DailyStatusSummary } from './components/dashboard/DailyStatusSummary';
import { SavingsStreakCard } from './components/dashboard/SavingsStreakCard';
import { ContributionBalance } from './components/dashboard/ContributionBalance';
import { GoalProjection } from './components/dashboard/GoalProjection';
import { MilestoneGrid } from './components/dashboard/MilestoneGrid';
import { RecentActivity } from './components/dashboard/RecentActivity';
import { MonthlySavingsCalendar } from './components/calendar/MonthlySavingsCalendar';
import { TransactionHistory } from './components/history/TransactionHistory';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { Toast } from './components/ui/Toast';
import { ViewTab } from './types';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const { activeRole } = useAuth();
  const { group, lastAddedNotification, clearNotification } = useSavings();

  // Dynamic time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const currentName = activeRole === 'partner1' ? group.partner1Name : group.partner2Name;
    if (hour < 12) return `Good morning, ${currentName} 👋`;
    if (hour < 17) return `Good afternoon, ${currentName} 👋`;
    return `Good evening, ${currentName} 👋`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation Header */}
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto flex pb-20 md:pb-8">
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Dynamic Page View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* 1. Greeting */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight m-0">
                    {getGreeting()}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Here is your shared savings overview for today.
                  </p>
                </div>
              </div>

              {/* 2. Goal card */}
              <GoalHeroCard />

              {/* 3. Progress */}
              <ProgressRing />

              {/* 4. Countdown */}
              <TargetCountdownCard />

              {/* 5. Today's saving Check-in (< 5s action) */}
              <DailyCheckIn />

              {/* Today's Status Summary */}
              <DailyStatusSummary />

              {/* 6. Streak */}
              <SavingsStreakCard />

              {/* 7. Goal projection */}
              <GoalProjection />

              {/* 9. Recent activity */}
              <RecentActivity onNavigateToHistory={() => setActiveTab('history')} />

              {/* 10. Milestones */}
              <MilestoneGrid />
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="animate-in fade-in duration-300">
              <MonthlySavingsCalendar />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-in fade-in duration-300">
              <AnalyticsView />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in duration-300">
              <TransactionHistory />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-300">
              <SettingsView />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Bar Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Auth Account Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Toast Notification Banner */}
      <Toast message={lastAddedNotification} onClose={clearNotification} />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SavingsProvider>
          <MainLayout />
        </SavingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
