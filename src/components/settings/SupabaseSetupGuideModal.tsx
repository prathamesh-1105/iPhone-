import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Database, CheckCircle2, Copy, ExternalLink, Code } from 'lucide-react';

interface SupabaseSetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupGuideModal: React.FC<SupabaseSetupGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const envExample = `VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Real Supabase Backend" maxWidth="lg">
      <div className="space-y-4 text-xs font-medium text-slate-700 dark:text-slate-300">
        <p>
          "Our iPhone Fund" includes a complete PostgreSQL schema with Row Level Security (RLS) and real-time WebSocket subscriptions.
        </p>

        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
            Create Supabase Project & Tables
          </h4>
          <p className="text-slate-500 dark:text-slate-400">
            Open your Supabase SQL Editor and run the included <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">supabase/schema.sql</code> script.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
            Configure Environment Variables
          </h4>
          <p className="text-slate-500 dark:text-slate-400">
            Create a <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.env.local</code> file in your project root:
          </p>

          <div className="relative bg-slate-900 text-slate-200 p-3 rounded-2xl font-mono text-[11px]">
            <pre>{envExample}</pre>
            <button
              onClick={() => copyToClipboard(envExample)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Copy snippet"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
            Deploy to Vercel
          </h4>
          <p className="text-slate-500 dark:text-slate-400">
            Add the same environment variables under Vercel Project Settings → Environment Variables.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </Modal>
  );
};
