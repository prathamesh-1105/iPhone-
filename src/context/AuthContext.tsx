import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  activeRole: 'partner1' | 'partner2';
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, pass: string, role?: 'partner1' | 'partner2') => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, name: string, role: 'partner1' | 'partner2') => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  switchActiveRole: (role: 'partner1' | 'partner2') => void;
  toggleDemoMode: (enabled: boolean) => void;
}

const DEFAULT_PARTNER1: UserProfile = {
  id: 'demo-user-1',
  email: 'partner1@fund.app',
  name: 'Prathamesh',
  partnerRole: 'partner1',
  createdAt: new Date().toISOString(),
};

const DEFAULT_PARTNER2: UserProfile = {
  id: 'demo-user-2',
  email: 'mahek@fund.app',
  name: 'Mahek',
  partnerRole: 'partner2',
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('iphone_fund_active_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return DEFAULT_PARTNER1;
  });

  const [activeRole, setActiveRole] = useState<'partner1' | 'partner2'>(() => {
    return (localStorage.getItem('iphone_fund_active_role') as 'partner1' | 'partner2') || 'partner1';
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return !isSupabaseConfigured() || localStorage.getItem('iphone_fund_demo_mode') === 'true';
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Auth listeners
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      if (isSupabaseConfigured() && supabase && !isDemoMode) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              const u: UserProfile = {
                id: profile.id,
                email: profile.email,
                name: profile.name,
                partnerRole: profile.partner_role as 'partner1' | 'partner2',
                avatarUrl: profile.avatar_url,
                createdAt: profile.created_at,
              };
              setUser(u);
              setActiveRole(u.partnerRole);
            }
          }
        } catch (err) {
          console.warn('Supabase auth fetch error, falling back to local mode:', err);
        }
      }
      setIsLoading(false);
    };

    initAuth();

    if (isSupabaseConfigured() && supabase) {
      const client = supabase;
      const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user && !isDemoMode) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const u: UserProfile = {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              partnerRole: profile.partner_role as 'partner1' | 'partner2',
              avatarUrl: profile.avatar_url,
              createdAt: profile.created_at,
            };
            setUser(u);
            setActiveRole(u.partnerRole);
          }
        } else if (!session && !isDemoMode) {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isDemoMode]);

  // Save state changes locally
  useEffect(() => {
    if (user) {
      localStorage.setItem('iphone_fund_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('iphone_fund_active_user');
    }
    localStorage.setItem('iphone_fund_active_role', activeRole);
    localStorage.setItem('iphone_fund_demo_mode', String(isDemoMode));
  }, [user, activeRole, isDemoMode]);

  const switchActiveRole = (role: 'partner1' | 'partner2') => {
    setActiveRole(role);
    if (isDemoMode) {
      const selectedUser = role === 'partner1' ? DEFAULT_PARTNER1 : DEFAULT_PARTNER2;
      setUser(selectedUser);
    }
  };

  const login = async (email: string, pass: string, role: 'partner1' | 'partner2' = 'partner1') => {
    if (isSupabaseConfigured() && supabase && !isDemoMode) {
      const client = supabase;
      const { error } = await client.auth.signInWithPassword({ email, password: pass });
      if (error) return { error: error.message };
      return {};
    }

    // Local / Demo Login fallback
    const loggedUser = role === 'partner1' ? DEFAULT_PARTNER1 : DEFAULT_PARTNER2;
    setUser({ ...loggedUser, email: email || loggedUser.email });
    setActiveRole(role);
    return {};
  };

  const signUp = async (email: string, pass: string, name: string, role: 'partner1' | 'partner2') => {
    if (isSupabaseConfigured() && supabase && !isDemoMode) {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            name,
            partner_role: role,
          },
        },
      });
      if (error) return { error: error.message };
      return {};
    }

    // Local / Demo Sign Up fallback
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      name: name || (role === 'partner1' ? 'Prathamesh' : 'Partner'),
      partnerRole: role,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setActiveRole(role);
    return {};
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase && !isDemoMode) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured() && supabase && !isDemoMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { error: error.message };
      return { success: true };
    }
    return { success: true };
  };

  const toggleDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    if (enabled && !user) {
      setUser(DEFAULT_PARTNER1);
      setActiveRole('partner1');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        isLoading,
        isDemoMode,
        login,
        signUp,
        logout,
        resetPassword,
        switchActiveRole,
        toggleDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
