import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { useSavings } from '../../context/SavingsContext';
import { formatINR } from '../../lib/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, Flame, DollarSign, PieChart } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { entries, group, streakStats, contributionSummary } = useSavings();

  const totalSaved = entries.reduce((sum, e) => sum + e.amount, 0);

  // Calculate Averages
  const { dailyAvg, weeklyAvg, monthlyAvg } = useMemo(() => {
    if (entries.length === 0) return { dailyAvg: 0, weeklyAvg: 0, monthlyAvg: 0 };

    const dateSet = new Set(entries.map((e) => e.date));
    const daysCount = Math.max(1, dateSet.size);

    const dAvg = Math.round(totalSaved / daysCount);
    const wAvg = Math.round(dAvg * 7);
    const mAvg = Math.round(dAvg * 30);

    return { dailyAvg: dAvg, weeklyAvg: wAvg, monthlyAvg: mAvg };
  }, [entries, totalSaved]);

  // Chart 1: Savings Over Time (Cumulative)
  const cumulativeData = useMemo(() => {
    if (entries.length === 0) return [];

    // Sort entries ascending by date
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const map = new Map<string, number>();

    for (const e of sorted) {
      const cur = map.get(e.date) || 0;
      map.set(e.date, cur + e.amount);
    }

    let runningTotal = 0;
    const result: { date: string; cumulative: number; target: number }[] = [];

    // Group into 10-15 data points for clean rendering if there are many entries
    const dateArray = Array.from(map.entries());
    const step = Math.max(1, Math.floor(dateArray.length / 15));

    for (let i = 0; i < dateArray.length; i += step) {
      const [dStr, amt] = dateArray[i];
      // Sum up to index i
      let sum = 0;
      for (let j = 0; j <= i; j++) {
        sum += dateArray[j][1];
      }
      result.push({
        date: dStr.substring(5), // MM-DD
        cumulative: sum,
        target: group.targetAmount,
      });
    }

    return result;
  }, [entries, group.targetAmount]);

  // Chart 2: Monthly Breakdown Data
  const monthlyData = useMemo(() => {
    if (entries.length === 0) return [];
    const map = new Map<string, { partner1: number; partner2: number; total: number }>();

    for (const e of entries) {
      const monthKey = e.date.substring(0, 7); // YYYY-MM
      const cur = map.get(monthKey) || { partner1: 0, partner2: 0, total: 0 };
      if (e.partnerRole === 'partner1') cur.partner1 += e.amount;
      if (e.partnerRole === 'partner2') cur.partner2 += e.amount;
      cur.total += e.amount;
      map.set(monthKey, cur);
    }

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([monthKey, val]) => ({
        month: monthKey,
        [group.partner1Name]: val.partner1,
        [group.partner2Name]: val.partner2,
        Total: val.total,
      }));
  }, [entries, group.partner1Name, group.partner2Name]);

  // Chart 3: Partner Comparison Data
  const partnerComparisonData = [
    {
      name: group.partner1Name,
      Amount: contributionSummary.partner1Total,
      Percentage: contributionSummary.partner1Percentage,
    },
    {
      name: group.partner2Name,
      Amount: contributionSummary.partner2Total,
      Percentage: contributionSummary.partner2Percentage,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight m-0">
              Savings Analytics & Insights
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Real-time performance metrics and progress charts
            </p>
          </div>
        </div>
      </Card>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Total Saved</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
            {formatINR(totalSaved)}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 block">
            {streakStats.totalSavingDays} active saving days
          </span>
        </Card>

        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Daily Average</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
            {formatINR(dailyAvg)}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 block">
            Target: {formatINR(group.dailyTargetPerPerson * 2)}/day
          </span>
        </Card>

        <Card className="p-4 bg-indigo-500/5 border-indigo-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <Calendar className="w-4 h-4" />
            <span>Monthly Avg Pace</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
            {formatINR(monthlyAvg)}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 block">
            Weekly: {formatINR(weeklyAvg)}
          </span>
        </Card>

        <Card className="p-4 bg-amber-500/5 border-amber-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
            <Flame className="w-4 h-4" />
            <span>Best Streak</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block">
            {streakStats.bestStreak} Days
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 block">
            Current: {streakStats.currentStreak} Days
          </span>
        </Card>
      </div>

      {/* Chart 1: Savings Over Time */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider m-0">
            SAVINGS OVER TIME (CUMULATIVE PROGRESS)
          </h3>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            Target: {formatINR(group.targetAmount)}
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulativeData}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip
                formatter={(val: any) => [formatINR(Number(val)), 'Total Saved']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '16px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCumulative)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Grid: Partner Comparison & Monthly Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Partner Contribution Comparison */}
        <Card className="p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider m-0">
            PARTNER CONTRIBUTION COMPARISON
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partnerComparisonData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), 'Contribution']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '16px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="Amount" fill="#3b82f6" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Monthly Savings Breakdown */}
        <Card className="p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider m-0">
            MONTHLY SAVINGS COMPARISON
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val: any, name: any) => [formatINR(Number(val)), name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '16px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey={group.partner1Name} fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey={group.partner2Name} fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
