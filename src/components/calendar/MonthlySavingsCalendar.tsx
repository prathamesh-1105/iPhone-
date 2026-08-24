import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { useSavings } from '../../context/SavingsContext';
import { getTodayDateString, formatINR } from '../../lib/formatters';
import { DayDetailsModal } from './DayDetailsModal';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';

export const MonthlySavingsCalendar: React.FC = () => {
  const { entries, group } = useSavings();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const todayStr = getTodayDateString();

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar Math
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map entries for rapid lookup by date
  const dateEntriesMap = new Map<string, { partner1: boolean; partner2: boolean; total: number }>();

  for (const entry of entries) {
    const existing = dateEntriesMap.get(entry.date) || { partner1: false, partner2: false, total: 0 };
    if (entry.partnerRole === 'partner1') existing.partner1 = true;
    if (entry.partnerRole === 'partner2') existing.partner2 = true;
    existing.total += entry.amount;
    dateEntriesMap.set(entry.date, existing);
  }

  // Generate day cells
  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6 space-y-4">
        {/* Header & Month Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight m-0">
                {monthNames[month]} {year}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tap any date to view breakdown or edit historical entries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Both Saved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>One Saved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>Neither Saved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-500/30" />
            <span>Today</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {/* Day of Week Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-xs font-bold text-slate-400 py-2">
              {day}
            </div>
          ))}

          {/* Day Cells */}
          {daysGrid.map((dayNumber, idx) => {
            if (dayNumber === null) {
              return <div key={`empty-${idx}`} className="h-16 rounded-2xl bg-transparent" />;
            }

            const formattedDay = String(dayNumber).padStart(2, '0');
            const formattedMonth = String(month + 1).padStart(2, '0');
            const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

            const isToday = dateStr === todayStr;
            const entryInfo = dateEntriesMap.get(dateStr);

            let statusColor = 'bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/50';
            if (entryInfo) {
              if (entryInfo.partner1 && entryInfo.partner2) {
                statusColor = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold';
              } else if (entryInfo.partner1 || entryInfo.partner2) {
                statusColor = 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold';
              }
            }

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`h-16 rounded-2xl border p-1.5 flex flex-col justify-between items-center transition-all hover:scale-105 active:scale-95 ${statusColor} ${
                  isToday ? 'ring-2 ring-blue-500 shadow-md shadow-blue-500/20' : ''
                }`}
              >
                <div className="w-full flex items-center justify-between text-[11px]">
                  <span className={`font-bold ${isToday ? 'text-blue-600 dark:text-blue-400 font-black' : ''}`}>
                    {dayNumber}
                  </span>
                  {entryInfo?.total ? (
                    <span className="text-[9px] font-extrabold truncate">
                      {formatINR(entryInfo.total)}
                    </span>
                  ) : null}
                </div>

                {/* Status Dot indicators */}
                <div className="flex items-center gap-1 mb-1">
                  {entryInfo?.partner1 && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  {entryInfo?.partner2 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Date detail popup */}
      <DayDetailsModal
        isOpen={Boolean(selectedDateStr)}
        onClose={() => setSelectedDateStr(null)}
        dateStr={selectedDateStr}
      />
    </div>
  );
};
