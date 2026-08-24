import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSavings } from '../../context/SavingsContext';
import { formatINR, formatDate } from '../../lib/formatters';
import { CheckCircle2, Circle, Edit2, Plus, Trash2 } from 'lucide-react';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string | null;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  onClose,
  dateStr,
}) => {
  const { group, entries, addOrUpdateEntry, deleteEntry } = useSavings();

  const [editingRole, setEditingRole] = useState<'partner1' | 'partner2' | null>(null);
  const [amountInput, setAmountInput] = useState<string>('');
  const [noteInput, setNoteInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!dateStr) return null;

  const dateEntries = entries.filter((e) => e.date === dateStr);
  const entry1 = dateEntries.find((e) => e.partnerRole === 'partner1');
  const entry2 = dateEntries.find((e) => e.partnerRole === 'partner2');

  const amount1 = entry1 ? entry1.amount : 0;
  const amount2 = entry2 ? entry2.amount : 0;
  const combined = amount1 + amount2;

  const startEdit = (role: 'partner1' | 'partner2', currentAmount?: number, currentNote?: string) => {
    setEditingRole(role);
    setAmountInput(currentAmount ? String(currentAmount) : String(group.dailyTargetPerPerson));
    setNoteInput(currentNote || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    const parsed = parseFloat(amountInput);
    if (isNaN(parsed) || parsed <= 0) return;

    setIsSubmitting(true);
    await addOrUpdateEntry(parsed, editingRole, dateStr, noteInput);
    setIsSubmitting(false);
    setEditingRole(null);
  };

  const handleDelete = async (entryId: string) => {
    if (window.confirm('Delete this savings entry?')) {
      await deleteEntry(entryId);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Savings on ${formatDate(dateStr)}`}>
      <div className="space-y-5">
        {/* Combined Summary Card */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider block">
              Combined Total
            </span>
            <span className="text-2xl font-black text-white block mt-0.5">
              {formatINR(combined)}
            </span>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
            {formatDate(dateStr, { short: true })}
          </span>
        </div>

        {/* Partner Breakdown List */}
        <div className="space-y-3">
          {/* Partner 1 Row */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {entry1 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400" />
                )}
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {group.partner1Name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {entry1 ? formatINR(entry1.amount) : '₹0'}
                </span>
                {entry1 ? (
                  <>
                    <button
                      onClick={() => startEdit('partner1', entry1.amount, entry1.note)}
                      className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry1.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => startEdit('partner1')}
                  >
                    Add
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Partner 2 Row */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {entry2 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400" />
                )}
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {group.partner2Name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {entry2 ? formatINR(entry2.amount) : '₹0'}
                </span>
                {entry2 ? (
                  <>
                    <button
                      onClick={() => startEdit('partner2', entry2.amount, entry2.note)}
                      className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry2.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => startEdit('partner2')}
                  >
                    Add
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Editing Inline Form */}
        {editingRole && (
          <form onSubmit={handleSave} className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-3">
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider m-0">
              Edit Contribution for {editingRole === 'partner1' ? group.partner1Name : group.partner2Name}
            </h4>
            <Input
              label="Amount (₹)"
              prefixSymbol="₹"
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              required
            />
            <Input
              label="Note (Optional)"
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />
            <div className="flex items-center gap-2 pt-1">
              <Button type="button" size="sm" variant="ghost" className="w-full" onClick={() => setEditingRole(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary" className="w-full" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
