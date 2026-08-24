export type UserRole = 'partner1' | 'partner2' | 'member';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  partnerRole: 'partner1' | 'partner2';
  createdAt: string;
}

export interface SavingsGroup {
  id: string;
  name: string;
  partner1Name: string;
  partner2Name: string;
  partner1Avatar?: string;
  partner2Avatar?: string;
  goalName: string;
  targetAmount: number;
  targetDate: string; // YYYY-MM-DD
  dailyTargetPerPerson: number;
  goalImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsEntry {
  id: string;
  groupId: string;
  userId: string;
  partnerRole: 'partner1' | 'partner2';
  userName: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  groupId: string;
  title?: string;
  amount: number;
  achievedAt?: string | null;
  description?: string;
}

export interface StreakStats {
  currentStreak: number;
  bestStreak: number;
  totalSavingDays: number;
}

export interface PaceProjection {
  currentPacePerDay: number;
  requiredDailyCombined: number;
  requiredDailyPerPerson: number;
  daysRemaining: number;
  estimatedCompletionDate: string;
  status: 'ahead' | 'on_track' | 'behind';
  dailyDiffMessage: string;
}

export interface GroupContributionSummary {
  partner1Total: number;
  partner2Total: number;
  combinedTotal: number;
  partner1Percentage: number;
  partner2Percentage: number;
  differenceAmount: number;
  differenceLeader: 'partner1' | 'partner2' | 'equal';
}

export type ViewTab = 'dashboard' | 'calendar' | 'history' | 'analytics' | 'settings';
