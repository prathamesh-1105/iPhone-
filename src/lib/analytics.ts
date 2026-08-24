import {
  SavingsEntry,
  GroupContributionSummary,
  StreakStats,
  PaceProjection,
  SavingsGroup,
} from '../types';
import { getDaysRemaining, getTodayDateString, formatINR } from './formatters';

/**
 * Computes partner contribution breakdown and balance difference.
 */
export function calculateContributionSummary(
  entries: SavingsEntry[],
  partner1Name: string,
  partner2Name: string
): GroupContributionSummary {
  let partner1Total = 0;
  let partner2Total = 0;

  for (const entry of entries) {
    if (entry.partnerRole === 'partner1') {
      partner1Total += entry.amount;
    } else if (entry.partnerRole === 'partner2') {
      partner2Total += entry.amount;
    }
  }

  const combinedTotal = partner1Total + partner2Total;
  const partner1Percentage = combinedTotal > 0 ? Math.round((partner1Total / combinedTotal) * 100) : 50;
  const partner2Percentage = combinedTotal > 0 ? 100 - partner1Percentage : 50;

  const diff = Math.abs(partner1Total - partner2Total);
  let differenceLeader: 'partner1' | 'partner2' | 'equal' = 'equal';
  if (partner1Total > partner2Total) {
    differenceLeader = 'partner1';
  } else if (partner2Total > partner1Total) {
    differenceLeader = 'partner2';
  }

  return {
    partner1Total,
    partner2Total,
    combinedTotal,
    partner1Percentage,
    partner2Percentage,
    differenceAmount: diff,
    differenceLeader,
  };
}

/**
 * Calculates current saving streak and best streak.
 * A streak day is counted if at least one partner saved (or combined daily target was met).
 */
export function calculateStreakStats(
  entries: SavingsEntry[],
  dailyTargetPerPerson: number = 200
): StreakStats {
  if (entries.length === 0) {
    return { currentStreak: 0, bestStreak: 0, totalSavingDays: 0 };
  }

  // Group entries by date
  const dateTotalsMap = new Map<string, number>();
  for (const entry of entries) {
    const current = dateTotalsMap.get(entry.date) || 0;
    dateTotalsMap.set(entry.date, current + entry.amount);
  }

  const totalSavingDays = dateTotalsMap.size;
  const sortedDates = Array.from(dateTotalsMap.keys()).sort();

  if (sortedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0, totalSavingDays: 0 };
  }

  // Minimum savings to count a valid streak day (e.g. at least half daily target)
  const minStreakThreshold = dailyTargetPerPerson;

  let currentStreak = 0;
  let bestStreak = 0;
  let runningStreak = 0;

  // Generate date range map for quick lookup
  const todayStr = getTodayDateString();
  const todayDate = new Date(todayStr + 'T00:00:00');

  // Check past 365 days backwards to calculate current streak
  let checkDate = new Date(todayDate);
  
  // If nothing saved today, check if yesterday was saved to preserve streak
  const todaySaved = (dateTotalsMap.get(todayStr) || 0) >= minStreakThreshold;
  if (!todaySaved) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const savedAmount = dateTotalsMap.get(dateStr) || 0;
    if (savedAmount >= minStreakThreshold) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate best streak historically across sorted dates
  let tempStreak = 0;
  let prevDateObj: Date | null = null;

  for (const dateStr of sortedDates) {
    const savedAmount = dateTotalsMap.get(dateStr) || 0;
    if (savedAmount >= minStreakThreshold) {
      const curDateObj = new Date(dateStr + 'T00:00:00');
      if (prevDateObj) {
        const diffDays = Math.round((curDateObj.getTime() - prevDateObj.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDateObj = curDateObj;
      bestStreak = Math.max(bestStreak, tempStreak);
    }
  }

  bestStreak = Math.max(bestStreak, currentStreak);

  return {
    currentStreak,
    bestStreak,
    totalSavingDays,
  };
}

/**
 * Calculates smart goal projection ("ARE WE ON TRACK?").
 */
export function calculatePaceProjection(
  group: SavingsGroup,
  entries: SavingsEntry[]
): PaceProjection {
  const daysRemaining = getDaysRemaining(group.targetDate);
  const totalSaved = entries.reduce((sum, e) => sum + e.amount, 0);
  const remainingAmount = Math.max(0, group.targetAmount - totalSaved);

  const combinedDailyTarget = group.dailyTargetPerPerson * 2;

  // Calculate required daily amounts from now to target date
  const safeDays = Math.max(1, daysRemaining);
  const requiredDailyCombined = Math.ceil(remainingAmount / safeDays);
  const requiredDailyPerPerson = Math.ceil(requiredDailyCombined / 2);

  // Calculate current actual average daily savings pace
  // Look at total days elapsed or total saving days
  const dateTotalsMap = new Map<string, number>();
  for (const entry of entries) {
    const current = dateTotalsMap.get(entry.date) || 0;
    dateTotalsMap.set(entry.date, current + entry.amount);
  }

  const activeDays = dateTotalsMap.size;
  let currentPacePerDay = combinedDailyTarget; // default fallback pace

  if (activeDays >= 3) {
    currentPacePerDay = Math.round(totalSaved / activeDays);
  }

  // Calculate estimated completion date
  const today = new Date();
  let daysToFinish = safeDays;

  if (remainingAmount <= 0) {
    daysToFinish = 0;
  } else if (currentPacePerDay > 0) {
    daysToFinish = Math.ceil(remainingAmount / currentPacePerDay);
  }

  const estimatedDateObj = new Date(today);
  estimatedDateObj.setDate(estimatedDateObj.getDate() + daysToFinish);
  const estimatedCompletionDate = estimatedDateObj.toISOString().split('T')[0];

  // Determine status
  const targetDateObj = new Date(group.targetDate + 'T00:00:00');
  let status: 'ahead' | 'on_track' | 'behind' = 'on_track';
  let dailyDiffMessage = '';

  if (remainingAmount <= 0) {
    status = 'ahead';
    dailyDiffMessage = 'Goal already achieved! 🎉';
  } else if (estimatedDateObj <= targetDateObj) {
    status = 'ahead';
    dailyDiffMessage = "You're ahead of schedule! 🎉";
  } else {
    status = 'behind';
    const diffDaily = requiredDailyCombined - currentPacePerDay;
    dailyDiffMessage = `Need to save ${formatINR(Math.max(0, diffDaily))} more per day combined to reach your January goal.`;
  }

  return {
    currentPacePerDay,
    requiredDailyCombined,
    requiredDailyPerPerson,
    daysRemaining,
    estimatedCompletionDate,
    status,
    dailyDiffMessage,
  };
}
