import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useSavings } from '../../context/SavingsContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR, getTodayDateString } from '../../lib/formatters';
import { CheckCircle2, Edit2, Plus, Sparkles, UserCheck, Flame } from 'lucide-react';

export const DailyCheckIn: React.FC = () => {
  const { group, todayEntryPartner1, todayEntryPartner2, addOrUpdateEntry } = useSavings();
  const { activeRole } = useAuth();

  const [customModalOpen, setCustomModalOpen] = useState<boolean>(false);
  const [modalTargetRole, setModalTargetRole] = useState<'partner1' | 'partner2'>('partner1');
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  const [customNoteInput, setCustomNoteInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const defaultTarget = group.dailyTargetPerPerson;

  // Handle Quick Save button
  const handleQuickSave = async (role: 'partner1' | 'partner2', amount: number) => {
    setIsSubmitting(true);
    await addOrUpdateEntry(amount, role, getTodayDateString(), amount > defaultTarget ? 'Extra savings boost ✨' : 'Mandatory daily save');
    setIsSubmitting(false);
  };

  // Open custom modal
  const openCustomModal = (role: 'partner1' | 'partner2', currentAmount?: number) => {
    setModalTargetRole(role);
    setCustomAmountInput(currentAmount ? String(currentAmount) : String(defaultTarget));
    setCustomNoteInput('');
    setCustomModalOpen(true);
  };

  // Submit custom amount
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customAmountInput);
    if (isNaN(parsed) || parsed <= 0) return;

    setIsSubmitting(true);
    const result = await addOrUpdateEntry(
      parsed,
      modalTargetRole,
      getTodayDateString(),
      customNoteInput || 'Custom saving check-in'
    );
    setIsSubmitting(false);
    if (result.success) {
      setCustomModalOpen(false);
    }
  };

  const renderPartnerCard = (
    role: 'partner1' | 'partner2',
    name: string,
    todayEntry: typeof todayEntryPartner1
  ) => {
    const isCurrentActiveRole = activeRole === role;
    const hasSavedToday = Boolean(todayEntry);
    const currentSavedAmount = todayEntry ? todayEntry.amount : 0;

    return (
      <Card
        className={`relative transition-all duration-300 ${
          hasSavedToday
            ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/40 dark:border-emerald-500/40 shadow-lg shadow-emerald-500/5'
            : isCurrentActiveRole
            ? 'border-blue-500/60 dark:border-blue-500/50 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20'
            : 'border-slate-200/80 dark:border-slate-800'
        }`}
      >
        {/* Active User Identity Tag */}
        {isCurrentActiveRole && (
          <div className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-heading font-black uppercase tracking-widest shadow-md flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> ACTIVE LOGGED USER
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-black text-lg shadow-md ${
                role === 'partner1'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/20'
                  : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-indigo-500/20'
              }`}
            >
              {name.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-heading font-black text-slate-900 dark:text-white m-0 leading-tight">
                {name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Mandatory Target: <strong className="text-blue-600 dark:text-blue-400 font-extrabold">{formatINR(defaultTarget)}/day</strong>
              </p>
            </div>
          </div>

          {hasSavedToday && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-heading font-extrabold text-xs bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>SAVED</span>
            </div>
          )}
        </div>

        {/* Saving Controls */}
        {hasSavedToday ? (
          <div className="space-y-3.5 pt-1">
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-emerald-500/30 text-center shadow-inner">
              <span className="text-xs font-heading font-extrabold text-slate-400 uppercase tracking-widest block">
                CONTRIBUTED TODAY
              </span>
              <span className="text-3xl font-heading font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                {formatINR(currentSavedAmount)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold"
                icon={<Edit2 className="w-3.5 h-3.5" />}
                onClick={() => openCustomModal(role, currentSavedAmount)}
              >
                Edit Today's Amount
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 pt-1">
            {/* Main Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-heading font-black"
                icon={<Sparkles className="w-4 h-4" />}
                isLoading={isSubmitting}
                onClick={() => handleQuickSave(role, defaultTarget)}
              >
                Saved {formatINR(defaultTarget)}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full font-heading font-bold"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => openCustomModal(role)}
              >
                Custom
              </Button>
            </div>

            {/* Quick Extra Savings Row */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 pt-1 font-semibold">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Extra Savings:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSave(role, 300)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 font-heading font-extrabold transition-all"
                >
                  + ₹300
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSave(role, 500)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 font-heading font-extrabold transition-all"
                >
                  + ₹500
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSave(role, 1000)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 font-heading font-extrabold transition-all"
                >
                  + ₹1k
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-black text-slate-900 dark:text-white tracking-tight m-0 uppercase">
            DAILY SAVING CHECK-IN
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Mandatory target: <strong className="text-slate-900 dark:text-white">₹200/day</strong> per person • Save extra anytime!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {renderPartnerCard('partner1', group.partner1Name, todayEntryPartner1)}
        {renderPartnerCard('partner2', group.partner2Name, todayEntryPartner2)}
      </div>

      {/* Custom Amount Modal */}
      <Modal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        title={`Record Savings for ${
          modalTargetRole === 'partner1' ? group.partner1Name : group.partner2Name
        }`}
      >
        <form onSubmit={handleCustomSubmit} className="space-y-4 pt-2">
          <Input
            label="Savings Amount (INR ₹)"
            prefixSymbol="₹"
            type="number"
            placeholder="200"
            value={customAmountInput}
            onChange={(e) => setCustomAmountInput(e.target.value)}
            required
            autoFocus
            min="1"
          />

          {/* Quick chip selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-heading font-extrabold uppercase text-slate-400">
              Quick Presets
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {[200, 300, 500, 1000, 2000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCustomAmountInput(String(preset))}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-heading font-extrabold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  ₹{preset} {preset === 200 ? '(Mandatory)' : ''}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Note (Optional)"
            type="text"
            placeholder="e.g. Daily save, Coffee money saved"
            value={customNoteInput}
            onChange={(e) => setCustomNoteInput(e.target.value)}
          />

          <div className="flex items-center gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setCustomModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              Record Contribution
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
};
