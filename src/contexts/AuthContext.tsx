import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

type UserRole = 'CUSTOMER' | 'PARTNER' | 'DRIVER' | 'ADMIN';

// This combines Supabase user data with our custom profile data
interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phoneNumber: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: { email: string; password: string; role: string; fullName: string; phoneNumber: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);

        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error fetching initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, role, phone_number')
        .eq('id', supabaseUser.id)
        .single();
      
      if (error) throw error;

      if (profile) {
        const fullUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          fullName: profile.full_name,
          role: profile.role.toUpperCase() as UserRole,
          phoneNumber: profile.phone_number,
        };
        console.log('[AuthContext] User profile loaded:', fullUser);
        setUser(fullUser);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null); // Clear user data on profile load failure
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // The onAuthStateChange listener will handle loading the profile
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const register = async (userData: { email: string; password: string; role: string; fullName: string; phoneNumber: string }) => {
    const { error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.fullName,
          role: userData.role.toLowerCase(),
          phone_number: userData.phoneNumber,
        }
      }
    });
    if (error) throw error;
    // The onAuthStateChange listener will handle setting the session
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session?.user,
        isLoading,
        userRole: user?.role || null,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 