import React, { useState, useMemo } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SavingsProvider, useSavings } from './context/SavingsContext';
import { Toast } from './components/ui/Toast';
import { getTodayDateString, formatCurrency } from './lib/formatters';
import {
  Plus,
  Wallet,
  Trash2,
  Search,
  CheckCircle2,
  Database,
  Edit2,
  X,
  TrendingUp,
  History,
  UserCheck
} from 'lucide-react';

const MoneyTrackerMain: React.FC = () => {
  const { group, entries, addOrUpdateEntry, deleteEntry, updateGroupConfig, lastAddedNotification, clearNotification } = useSavings();
  const { activeRole, switchActiveRole } = useAuth();

  // Form State for Adding Money
  const [amount, setAmount] = useState<string>('');
  const [contributor, setContributor] = useState<'partner1' | 'partner2'>(activeRole);
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Search & Filter state for History
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterContributor, setFilterContributor] = useState<'all' | 'partner1' | 'partner2'>('all');

  // Edit Goal Modal state
  const [isEditGoalOpen, setIsEditGoalOpen] = useState<boolean>(false);
  const [editGoalName, setEditGoalName] = useState<string>(group.goalName);
  const [editTargetAmount, setEditTargetAmount] = useState<string>(group.targetAmount.toString());
  const [editP1Name, setEditP1Name] = useState<string>(group.partner1Name);
  const [editP2Name, setEditP2Name] = useState<string>(group.partner2Name);

  // Derived metrics
  const totalSaved = useMemo(() => entries.reduce((sum, e) => sum + e.amount, 0), [entries]);
  const progressPercent = useMemo(() => {
    if (group.targetAmount <= 0) return 0;
    return Math.min(100, Math.round((totalSaved / group.targetAmount) * 100));
  }, [totalSaved, group.targetAmount]);

  const remaining = useMemo(() => Math.max(0, group.targetAmount - totalSaved), [totalSaved, group.targetAmount]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const noteText = entry.note || '';
      const matchesSearch =
        noteText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.amount.toString().includes(searchTerm);
      const matchesContributor = filterContributor === 'all' || entry.partnerRole === filterContributor;
      return matchesSearch && matchesContributor;
    });
  }, [entries, searchTerm, filterContributor]);

  // Handle Add Money Form Submit
  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    await addOrUpdateEntry(numAmount, contributor, date, note.trim() || undefined);
    setAmount('');
    setNote('');
    setIsSubmitting(false);
  };

  // Quick preset button click
  const handleQuickAdd = (presetAmount: number) => {
    setAmount(presetAmount.toString());
  };

  // Save Goal Config
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTarget = parseFloat(editTargetAmount);
    if (!isNaN(newTarget) && newTarget > 0) {
      await updateGroupConfig({
        goalName: editGoalName,
        targetAmount: newTarget,
        partner1Name: editP1Name,
        partner2Name: editP2Name,
      });
      setIsEditGoalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      {/* Top Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold shadow-sm">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight leading-tight m-0">
                Money Tracker
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Simple & Clean Savings</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Supabase Status Indicator (Mobile & Desktop) */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-[11px] sm:text-xs text-gray-600 font-medium"
              title="Connected to Supabase Cloud Database"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Database className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
              <span className="hidden xs:inline">Synced</span>
            </div>

            {/* Edit Goal Button */}
            <button
              onClick={() => setIsEditGoalOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition apple-btn active:bg-gray-100"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Goal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 pb-8">
        {/* 1. Goal & Balance Card (Clean White Design) */}
        <section className="white-card p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-gray-100 pb-3.5">
            <div>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">Target Goal</span>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight m-0">
                {group.goalName}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">Total Saved</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {formatCurrency(totalSaved)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
              <span>{progressPercent}% Achieved</span>
              <span>Target: {formatCurrency(group.targetAmount)}</span>
            </div>
            <div className="w-full bg-gray-100 h-3 sm:h-3.5 rounded-full overflow-hidden border border-gray-200">
              <div
                className="bg-gray-900 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 sm:p-3">
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium block">Remaining</span>
              <span className="text-sm sm:text-base font-bold text-gray-900 block truncate">
                {formatCurrency(remaining)}
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 sm:p-3">
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium block">Total Entries</span>
              <span className="text-sm sm:text-base font-bold text-gray-900 block">
                {entries.length} records
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-gray-50 border border-gray-200 rounded-lg p-2.5 sm:p-3">
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium block">Contributors</span>
              <span className="text-xs font-semibold text-gray-800 truncate block">
                {group.partner1Name} & {group.partner2Name}
              </span>
            </div>
          </div>
        </section>

        {/* 2. Add Money Panel */}
        <section className="white-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gray-900 text-white flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 m-0">Add Money</h3>
            </div>
            <span className="text-[11px] sm:text-xs text-gray-500 font-medium">Quick Deposit</span>
          </div>

          <form onSubmit={handleAddMoney} className="space-y-4">
            {/* Quick Add Preset Buttons (Touch scrollable on small mobile screens) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Quick Presets
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {[100, 200, 500, 1000, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleQuickAdd(preset)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-lg border flex-shrink-0 transition apple-btn ${
                      amount === preset.toString()
                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    +₹{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Amount Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full h-11 sm:h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                />
              </div>

              {/* Contributor Person Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Added By
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setContributor('partner1');
                      switchActiveRole('partner1');
                    }}
                    className={`h-11 sm:h-10 px-3 text-xs font-semibold rounded-lg border text-center transition ${
                      contributor === 'partner1'
                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {group.partner1Name}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setContributor('partner2');
                      switchActiveRole('partner2');
                    }}
                    className={`h-11 sm:h-10 px-3 text-xs font-semibold rounded-lg border text-center transition ${
                      contributor === 'partner2'
                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {group.partner2Name}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Note Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Note / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Savings deposit, Bonus"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-11 sm:h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                />
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 sm:h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className="w-full h-12 sm:h-11 bg-gray-900 hover:bg-gray-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Money Now</span>
            </button>
          </form>
        </section>

        {/* 3. Transaction Log / History */}
        <section className="white-card p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gray-100 border border-gray-200 text-gray-800 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 m-0">Money Added Log</h3>
            </div>
            <span className="text-[11px] sm:text-xs text-gray-500 font-medium">
              Showing {filteredEntries.length} of {entries.length} entries
            </span>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3.5 sm:top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes or names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 sm:h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-900 transition"
              />
            </div>
            <div className="grid grid-cols-3 gap-1 sm:flex">
              <button
                onClick={() => setFilterContributor('all')}
                className={`py-2 sm:py-1.5 px-3 text-xs font-semibold rounded-lg border text-center transition ${
                  filterContributor === 'all'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterContributor('partner1')}
                className={`py-2 sm:py-1.5 px-3 text-xs font-semibold rounded-lg border text-center transition truncate ${
                  filterContributor === 'partner1'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {group.partner1Name}
              </button>
              <button
                onClick={() => setFilterContributor('partner2')}
                className={`py-2 sm:py-1.5 px-3 text-xs font-semibold rounded-lg border text-center transition truncate ${
                  filterContributor === 'partner2'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {group.partner2Name}
              </button>
            </div>
          </div>

          {/* Table / List */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">No money entries found yet.</p>
              <p className="text-xs text-gray-400 mt-1">Use the "Add Money" form above to start saving!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/60 px-2 rounded-lg transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      +
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(entry.amount)}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-full text-[10px] font-semibold">
                          {entry.userName}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {entry.note || 'Money deposit'} • <span className="text-gray-400">{entry.date}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Edit Goal Modal */}
      {isEditGoalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Edit Goal Settings</h3>
              <button
                onClick={() => setIsEditGoalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={editGoalName}
                  onChange={(e) => setEditGoalName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  value={editTargetAmount}
                  onChange={(e) => setEditTargetAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Person 1 Name
                  </label>
                  <input
                    type="text"
                    value={editP1Name}
                    onChange={(e) => setEditP1Name(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Person 2 Name
                  </label>
                  <input
                    type="text"
                    value={editP2Name}
                    onChange={(e) => setEditP2Name(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditGoalOpen(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast message={lastAddedNotification} onClose={clearNotification} />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SavingsProvider>
          <MoneyTrackerMain />
        </SavingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

