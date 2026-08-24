import React from 'react';
import { Card } from '../ui/Card';
import { useSavings } from '../../context/SavingsContext';
import { formatINR } from '../../lib/formatters';
import { HeartHandshake, Scale, Heart } from 'lucide-react';

export const ContributionBalance: React.FC = () => {
  const { group, contributionSummary } = useSavings();
  const {
    partner1Total,
    partner2Total,
    combinedTotal,
    partner1Percentage,
    partner2Percentage,
    differenceAmount,
    differenceLeader,
  } = contributionSummary;

  let message = '';
  if (differenceLeader === 'equal') {
    message = 'Equal contribution! Perfect teamwork ❤️';
  } else if (differenceLeader === 'partner1') {
    message = `${group.partner1Name} is ${formatINR(differenceAmount)} ahead.`;
  } else {
    message = `${group.partner2Name} is ${formatINR(differenceAmount)} ahead.`;
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider m-0">
            OUR CONTRIBUTIONS
          </h3>
        </div>
        <span className="text-xs font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          Combined: {formatINR(combinedTotal)}
        </span>
      </div>

      {/* Visual Balance Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden flex p-0.5">
          <div
            className="bg-blue-600 h-full rounded-l-full transition-all duration-700 flex items-center justify-center text-[9px] font-black text-white"
            style={{ width: `${partner1Percentage}%` }}
          >
            {partner1Percentage > 15 ? `${partner1Percentage}%` : ''}
          </div>
          <div
            className="bg-indigo-600 h-full rounded-r-full transition-all duration-700 flex items-center justify-center text-[9px] font-black text-white"
            style={{ width: `${partner2Percentage}%` }}
          >
            {partner2Percentage > 15 ? `${partner2Percentage}%` : ''}
          </div>
        </div>

        {/* Partner Numbers */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {group.partner1Name}: <strong className="text-blue-600 dark:text-blue-400">{formatINR(partner1Total)}</strong> ({partner1Percentage}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-600 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {group.partner2Name}: <strong className="text-indigo-600 dark:text-indigo-400">{formatINR(partner2Total)}</strong> ({partner2Percentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Friendly Difference Note */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <HeartHandshake className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>{message}</span>
      </div>
    </Card>
  );
};
