import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  SavingsGroup,
  SavingsEntry,
  Milestone,
  StreakStats,
  PaceProjection,
  GroupContributionSummary,
} from '../types';
import { getTodayDateString } from '../lib/formatters';
import {
  calculateContributionSummary,
  calculateStreakStats,
  calculatePaceProjection,
} from '../lib/analytics';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface SavingsContextType {
  group: SavingsGroup;
  entries: SavingsEntry[];
  milestones: Milestone[];
  streakStats: StreakStats;
  paceProjection: PaceProjection;
  contributionSummary: GroupContributionSummary;
  todayEntryPartner1: SavingsEntry | undefined;
  todayEntryPartner2: SavingsEntry | undefined;
  isLoading: boolean;
  addOrUpdateEntry: (amount: number, role: 'partner1' | 'partner2', dateStr?: string, note?: string) => Promise<{ success: boolean; error?: string }>;
  deleteEntry: (entryId: string) => Promise<{ success: boolean; error?: string }>;
  updateGroupConfig: (updates: Partial<SavingsGroup>) => Promise<{ success: boolean; error?: string }>;
  resetToFreshSlate: () => void;
  seedDemoData: () => void;
  lastAddedNotification: string | null;
  clearNotification: () => void;
}

const DEFAULT_GROUP: SavingsGroup = {
  id: 'group-default-1',
  name: 'Our iPhone Fund',
  partner1Name: 'Prathamesh',
  partner2Name: 'Mahek',
  goalName: 'iPhone 17 Pro Max',
  targetAmount: 150000,
  targetDate: '2027-01-01',
  dailyTargetPerPerson: 200,
  goalImageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
  createdAt: '2026-08-01',
  updatedAt: new Date().toISOString(),
};

const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'm-10k', groupId: 'group-default-1', title: 'First Step', amount: 10000, description: '₹10,000 saved! Off to a great start.' },
  { id: 'm-25k', groupId: 'group-default-1', title: 'Quarter Way', amount: 25000, description: '₹25,000 reached! Building momentum.' },
  { id: 'm-50k', groupId: 'group-default-1', title: 'One Third Goal', amount: 50000, description: '₹50,000 reached! You are one-third of the way there.' },
  { id: 'm-75k', groupId: 'group-default-1', title: 'Halfway Mark', amount: 75000, description: 'Halfway to your brand new iPhone 17 Pro Max!' },
  { id: 'm-100k', groupId: 'group-default-1', title: 'Six-Figure Club', amount: 100000, description: '₹1,00,000! Two-thirds of the way there.' },
  { id: 'm-125k', groupId: 'group-default-1', title: 'Home Stretch', amount: 125000, description: '₹1,25,000! Almost in your hands.' },
  { id: 'm-150k', groupId: 'group-default-1', title: 'iPhone Unlocked', amount: 150000, description: '🎉 Target reached! Time to buy your iPhone 17 Pro Max!' },
];

/**
 * Generate sample demo entries if user manually requests re-seeding.
 */
function generateDemoEntries(): SavingsEntry[] {
  const list: SavingsEntry[] = [];
  const today = new Date();
  
  let idCount = 1;
  const numDays = 120;

  for (let i = numDays; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    if (i !== 3 && i !== 17) {
      list.push({
        id: `demo-entry-${idCount++}`,
        groupId: 'group-default-1',
        userId: 'demo-user-1',
        partnerRole: 'partner1',
        userName: 'Prathamesh',
        amount: (i % 7 === 0) ? 300 : 200,
        date: dateStr,
        note: (i % 7 === 0) ? 'Bonus daily save ✨' : 'Daily check-in',
        createdAt: d.toISOString(),
        updatedAt: d.toISOString(),
      });
    }

    if (i !== 5 && i !== 22) {
      list.push({
        id: `demo-entry-${idCount++}`,
        groupId: 'group-default-1',
        userId: 'demo-user-2',
        partnerRole: 'partner2',
        userName: 'Mahek',
        amount: 200,
        date: dateStr,
        note: 'Daily check-in',
        createdAt: d.toISOString(),
        updatedAt: d.toISOString(),
      });
    }
  }

  return list;
}

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

export const SavingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDemoMode } = useAuth();
  const [group, setGroup] = useState<SavingsGroup>(() => {
    const saved = localStorage.getItem('iphone_fund_group');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        // Force update default partner 2 name if it was previously set to Partner
        if (parsed.partner2Name === 'Partner') parsed.partner2Name = 'Mahek';
        return parsed;
      } catch (e) { console.error(e); }
    }
    return DEFAULT_GROUP;
  });

  const [entries, setEntries] = useState<SavingsEntry[]>(() => {
    const saved = localStorage.getItem('iphone_fund_entries');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Start cleanly from scratch (0 fake entries)
    return [];
  });

  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastAddedNotification, setLastAddedNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('iphone_fund_group', JSON.stringify(group));
  }, [group]);

  useEffect(() => {
    localStorage.setItem('iphone_fund_entries', JSON.stringify(entries));
  }, [entries]);

  // Load from Supabase if configured and not demo mode
  useEffect(() => {
    const loadSupabaseData = async () => {
      if (!isSupabaseConfigured() || !supabase || isDemoMode) return;
      setIsLoading(true);

      try {
        // Fetch group
        const { data: groupData } = await supabase
          .from('savings_groups')
          .select('*')
          .limit(1)
          .single();

        if (groupData) {
          setGroup({
            id: groupData.id,
            name: groupData.name,
            partner1Name: groupData.partner1_name,
            partner2Name: groupData.partner2_name,
            partner1Avatar: groupData.partner1_avatar,
            partner2Avatar: groupData.partner2_avatar,
            goalName: groupData.goal_name,
            targetAmount: Number(groupData.target_amount),
            targetDate: groupData.target_date,
            dailyTargetPerPerson: Number(groupData.daily_target_per_person),
            goalImageUrl: groupData.goal_image_url || DEFAULT_GROUP.goalImageUrl,
            createdAt: groupData.created_at,
            updatedAt: groupData.updated_at,
          });
        }

        // Fetch entries
        const { data: entriesData } = await supabase
          .from('savings_entries')
          .select('*')
          .order('date', { ascending: false });

        if (entriesData) {
          const mapped: SavingsEntry[] = entriesData.map((e) => ({
            id: e.id,
            groupId: e.group_id,
            userId: e.user_id,
            partnerRole: e.partner_role,
            userName: e.partner_role === 'partner1' ? (groupData?.partner1_name || 'Partner 1') : (groupData?.partner2_name || 'Partner 2'),
            amount: Number(e.amount),
            date: e.date,
            note: e.note,
            createdAt: e.created_at,
            updatedAt: e.updated_at,
          }));
          setEntries(mapped);
        }
      } catch (err) {
        console.warn('Error loading Supabase data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSupabaseData();

    // Heartbeat Keep-Alive ping to keep Supabase awake
    const keepAliveInterval = setInterval(async () => {
      if (isSupabaseConfigured() && supabase && !isDemoMode) {
        try {
          await supabase.from('savings_entries').select('id').limit(1);
        } catch {
          // Ignore ping errors
        }
      }
    }, 4 * 60 * 1000); // Every 4 minutes

    // Supabase Realtime Subscription setup
    if (isSupabaseConfigured() && supabase && !isDemoMode) {
      const client = supabase;
      const channel = client
        .channel('public:savings_entries')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'savings_entries' },
          () => {
            loadSupabaseData();
          }
        )
        .subscribe();

      return () => {
        clearInterval(keepAliveInterval);
        client.removeChannel(channel);
      };
    }

    return () => {
      clearInterval(keepAliveInterval);
    };
  }, [isDemoMode]);

  // Derived Analytics Data
  const streakStats = useMemo(
    () => calculateStreakStats(entries, group.dailyTargetPerPerson),
    [entries, group.dailyTargetPerPerson]
  );

  const paceProjection = useMemo(
    () => calculatePaceProjection(group, entries),
    [group, entries]
  );

  const contributionSummary = useMemo(
    () => calculateContributionSummary(entries, group.partner1Name, group.partner2Name),
    [entries, group.partner1Name, group.partner2Name]
  );

  // Today's entry detection
  const todayStr = getTodayDateString();
  const todayEntryPartner1 = useMemo(
    () => entries.find((e) => e.date === todayStr && e.partnerRole === 'partner1'),
    [entries, todayStr]
  );
  const todayEntryPartner2 = useMemo(
    () => entries.find((e) => e.date === todayStr && e.partnerRole === 'partner2'),
    [entries, todayStr]
  );

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
    });
  };

  const clearNotification = () => setLastAddedNotification(null);

  const addOrUpdateEntry = async (
    amount: number,
    role: 'partner1' | 'partner2',
    dateStr: string = getTodayDateString(),
    note?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, error: 'Please enter a valid positive savings amount.' };
    }

    const partnerName = role === 'partner1' ? group.partner1Name : group.partner2Name;

    const newEntry: SavingsEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      groupId: group.id,
      userId: role === 'partner1' ? 'user-p1' : 'user-p2',
      partnerRole: role,
      userName: partnerName,
      amount,
      date: dateStr,
      note: note || 'Added money',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedEntries = [newEntry, ...entries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setEntries(updatedEntries);

    // Supabase DB persist if connected
    if (isSupabaseConfigured() && supabase && !isDemoMode) {
      try {
        const client = supabase;
        const { error } = await client.from('savings_entries').insert([
          {
            id: newEntry.id,
            group_id: group.id,
            partner_role: role,
            amount,
            date: dateStr,
            note: newEntry.note,
          },
        ]);
        if (error) console.warn('Supabase entry write warning:', error.message);
      } catch (err) {
        console.warn('Supabase exception:', err);
      }
    }

    // Trigger celebration & notification
    triggerConfetti();
    setLastAddedNotification(`₹${amount.toLocaleString()} added for ${partnerName}!`);

    return { success: true };
  };

  const deleteEntry = async (entryId: string): Promise<{ success: boolean; error?: string }> => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));

    if (isSupabaseConfigured() && supabase && !isDemoMode) {
      await supabase.from('savings_entries').delete().eq('id', entryId);
    }

    return { success: true };
  };

  const updateGroupConfig = async (updates: Partial<SavingsGroup>): Promise<{ success: boolean; error?: string }> => {
    const updated = { ...group, ...updates, updatedAt: new Date().toISOString() };
    setGroup(updated);

    if (isSupabaseConfigured() && supabase && !isDemoMode) {
      await supabase
        .from('savings_groups')
        .update({
          name: updated.name,
          partner1_name: updated.partner1Name,
          partner2_name: updated.partner2Name,
          goal_name: updated.goalName,
          target_amount: updated.targetAmount,
          target_date: updated.targetDate,
          daily_target_per_person: updated.dailyTargetPerPerson,
          goal_image_url: updated.goalImageUrl,
        })
        .eq('id', group.id);
    }

    return { success: true };
  };

  const resetToFreshSlate = () => {
    setEntries([]);
    localStorage.removeItem('iphone_fund_entries');
  };

  const seedDemoData = () => {
    const sample = generateDemoEntries();
    setEntries(sample);
  };

  return (
    <SavingsContext.Provider
      value={{
        group,
        entries,
        milestones,
        streakStats,
        paceProjection,
        contributionSummary,
        todayEntryPartner1,
        todayEntryPartner2,
        isLoading,
        addOrUpdateEntry,
        deleteEntry,
        updateGroupConfig,
        resetToFreshSlate,
        seedDemoData,
        lastAddedNotification,
        clearNotification,
      }}
    >
      {children}
    </SavingsContext.Provider>
  );
};

export const useSavings = () => {
  const context = useContext(SavingsContext);
  if (!context) throw new Error('useSavings must be used within SavingsProvider');
  return context;
};
