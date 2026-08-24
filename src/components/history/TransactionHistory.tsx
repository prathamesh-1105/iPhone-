import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useSavings } from '../../context/SavingsContext';
import { formatINR, formatDate, getTodayDateString } from '../../lib/formatters';
import { SavingsEntry } from '../../types';
import { History, Filter, Plus, Edit2, Trash2, ArrowUpRight, Search } from 'lucide-react';

export const TransactionHistory: React.FC = () => {
  const { group, entries, addOrUpdateEntry, deleteEntry } = useSavings();

  const [filterRole, setFilterRole] = useState<'all' | 'partner1' | 'partner2'>('all');
  const [filterRange, setFilterRange] = useState<'all' | 'week' | 'month'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<SavingsEntry | null>(null);
  const [inputRole, setInputRole] = useState<'partner1' | 'partner2'>('partner1');
  const [inputAmount, setInputAmount] = useState<string>('200');
  const [inputDate, setInputDate] = useState<string>(getTodayDateString());
  const [inputNote, setInputNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filter Logic
  const filteredEntries = useMemo(() => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    return entries.filter((e) => {
      // Role Filter
      if (filterRole !== 'all' && e.partnerRole !== filterRole) return false;

      // Range Filter
      if (filterRange === 'week') {
        const eDate = new Date(e.date + 'T00:00:00');
        if (eDate < oneWeekAgo) return false;
      } else if (filterRange === 'month') {
        const eDate = new Date(e.date + 'T00:00:00');
        if (eDate.getMonth() !== today.getMonth() || eDate.getFullYear() !== today.getFullYear()) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = e.userName.toLowerCase().includes(q);
        const matchesNote = (e.note || '').toLowerCase().includes(q);
        const matchesAmount = String(e.amount).includes(q);
        if (!matchesName && !matchesNote && !matchesAmount) return false;
      }

      return true;
    });
  }, [entries, filterRole, filterRange, searchQuery]);

  const openAddModal = () => {
    setEditingEntry(null);
    setInputRole('partner1');
    setInputAmount('200');
    setInputDate(getTodayDateString());
    setInputNote('');
    setModalOpen(true);
  };

  const openEditModal = (entry: SavingsEntry) => {
    setEditingEntry(entry);
    setInputRole(entry.partnerRole);
    setInputAmount(String(entry.amount));
    setInputDate(entry.date);
    setInputNote(entry.note || '');
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsSubmitting(true);
    await addOrUpdateEntry(amount, inputRole, inputDate, inputNote);
    setIsSubmitting(false);
    setModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteEntry(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6 space-y-4">
        {/* Header & Add Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight m-0">
                Transaction History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {filteredEntries.length} total savings entries logged
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={openAddModal}
          >
            Add New Entry
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Partner Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setFilterRole('all')}
              className={`flex-1 py-1.5 rounded-xl font-semibold transition-all ${
                filterRole === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              All Partners
            </button>
            <button
              onClick={() => setFilterRole('partner1')}
              className={`flex-1 py-1.5 rounded-xl font-semibold transition-all ${
                filterRole === 'partner1'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {group.partner1Name}
            </button>
            <button
              onClick={() => setFilterRole('partner2')}
              className={`flex-1 py-1.5 rounded-xl font-semibold transition-all ${
                filterRole === 'partner2'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {group.partner2Name}
            </button>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setFilterRange('all')}
              className={`flex-1 py-1.5 rounded-xl font-semibold transition-all ${
                filterRange === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setFilterRange('week')}
              className={`flex-1 py-1.5 rounded-xl font-semibold transition-all ${
                filterRange === 'week'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setFilterRange('month')}
              className={`flex-1 py-1.5 rounded-xl font-semibold transition-all ${
                filterRange === 'month'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              This Month
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search notes or amounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Transactions Table / List */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">
            <p className="font-bold text-sm">No entries match your selected filter.</p>
            <p className="mt-1">Try clearing filters or adding a new savings check-in.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="py-3.5 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                      entry.partnerRole === 'partner1'
                        ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                        : 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {entry.userName.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {entry.userName}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {entry.note}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    +{formatINR(entry.amount)}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(entry)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(entry.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add / Edit Entry Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEntry ? 'Edit Savings Entry' : 'Add New Savings Entry'}
      >
        <form onSubmit={handleModalSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Partner
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setInputRole('partner1')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all border ${
                  inputRole === 'partner1'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {group.partner1Name}
              </button>
              <button
                type="button"
                onClick={() => setInputRole('partner2')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all border ${
                  inputRole === 'partner2'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {group.partner2Name}
              </button>
            </div>
          </div>

          <Input
            label="Savings Amount (₹)"
            prefixSymbol="₹"
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            required
            min="1"
          />

          <Input
            label="Date"
            type="date"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            required
          />

          <Input
            label="Note"
            type="text"
            placeholder="e.g. Daily check-in"
            value={inputNote}
            onChange={(e) => setInputNote(e.target.value)}
          />

          <div className="flex items-center gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              {editingEntry ? 'Update Entry' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Confirm Delete"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            Are you sure you want to delete this savings entry? This action will update your total progress and streak.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" className="w-full" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" className="w-full" onClick={confirmDelete}>
              Delete Entry
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
