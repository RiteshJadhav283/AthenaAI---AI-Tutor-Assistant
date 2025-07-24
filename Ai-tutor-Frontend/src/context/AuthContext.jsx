import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ActivityService } from '@/lib/activityService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Record user login
  const recordUserLogin = async (userId) => {
    try {
      await ActivityService.recordLogin(userId);
    } catch (error) {
      console.error('Error recording login:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Helper to set user and loading
    const setAuthState = (session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        recordUserLogin(session.user.id);
      }
    };

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setAuthState(session);
      })
      .catch((err) => {
        console.error("AuthContext: getSession error", err);
        if (!mounted) return;
        setUser(null);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(session);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
