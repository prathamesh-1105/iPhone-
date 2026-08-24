import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useSavings } from '../../context/SavingsContext';
import { User, LogIn, UserPlus, KeyRound, Sparkles, LogOut } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, login, signUp, resetPassword, logout, isDemoMode, toggleDemoMode } = useAuth();
  const { group } = useSavings();

  const [tab, setTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<'partner1' | 'partner2'>('partner1');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (tab === 'login') {
      const res = await login(email, password, role);
      setIsSubmitting(false);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        onClose();
      }
    } else if (tab === 'signup') {
      const res = await signUp(email, password, name || (role === 'partner1' ? group.partner1Name : group.partner2Name), role);
      setIsSubmitting(false);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        onClose();
      }
    } else if (tab === 'reset') {
      const res = await resetPassword(email);
      setIsSubmitting(false);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage('Password reset link sent to your email.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'User Account & Identity' : 'Account Login / Sign Up'}>
      {user ? (
        <div className="space-y-4 pt-1">
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
              {user.name.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base m-0">
                {user.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {user.email} • Role: {user.partnerRole === 'partner1' ? group.partner1Name : group.partner2Name}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span>Demo Mode State</span>
            <button
              onClick={() => toggleDemoMode(!isDemoMode)}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              {isDemoMode ? 'Enabled (Switch to Supabase)' : 'Disabled'}
            </button>
          </div>

          <Button
            variant="danger"
            className="w-full"
            icon={<LogOut className="w-4 h-4" />}
            onClick={async () => {
              await logout();
              onClose();
            }}
          >
            Log Out Account
          </Button>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                tab === 'login'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setTab('signup')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                tab === 'signup'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setTab('reset')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                tab === 'reset'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Reset
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'signup' && (
              <Input
                label="Full Name"
                type="text"
                placeholder="e.g. Prathamesh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="partner@iphonefund.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {tab !== 'reset' && (
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}

            {tab !== 'reset' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Assign Partner Identity
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('partner1')}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all border ${
                      role === 'partner1'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Partner 1 ({group.partner1Name})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('partner2')}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all border ${
                      role === 'partner2'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Partner 2 ({group.partner2Name})
                  </button>
                </div>
              </div>
            )}

            {errorMessage && <p className="text-xs text-rose-500 font-semibold">{errorMessage}</p>}
            {successMessage && <p className="text-xs text-emerald-500 font-semibold">{successMessage}</p>}

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
              {tab === 'login' ? 'Login to Dashboard' : tab === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                toggleDemoMode(true);
                onClose();
              }}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Continue in Instant Demo Mode</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
