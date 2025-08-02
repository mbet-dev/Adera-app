import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      try {
        // First try to get session from AsyncStorage for persistence
        const storedSession = await AsyncStorage.getItem('adera_session');
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          setSession(parsedSession);
          
          if (parsedSession?.user) {
            await loadUserProfile(parsedSession.user);
            return;
          }
        }

        // Fallback to Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);

        if (session?.user) {
          await loadUserProfile(session.user);
          // Store session for persistence
          await AsyncStorage.setItem('adera_session', JSON.stringify(session));
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
        console.log('[AuthContext] Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setSession(session);
          await loadUserProfile(session.user);
          // Store session for persistence
          await AsyncStorage.setItem('adera_session', JSON.stringify(session));
        } else if (event === 'SIGNED_OUT') {
          console.log('[AuthContext] User signed out, clearing all state');
          setUser(null);
          setSession(null);
          // Clear stored session
          await AsyncStorage.removeItem('adera_session');
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('[AuthContext] Token refreshed, maintaining session');
          setSession(session);
          // Update stored session with refreshed token
          await AsyncStorage.setItem('adera_session', JSON.stringify(session));
        } else {
          // Handle other events (like initial session check)
          setSession(session);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log('[AuthContext] Authentication state changed:', {
      isAuthenticated: !!session?.user,
      hasUser: !!user,
      hasSession: !!session,
      userRole: user?.role,
      sessionUserId: session?.user?.id
    });
  }, [session, user]);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // First, try to get existing user profile from the users table
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('first_name, last_name, role, phone')
        .eq('id', supabaseUser.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // User profile doesn't exist - DON'T try to create it due to RLS issues
        // Instead, create user object with metadata values only
        console.log('[AuthContext] User profile not found, using metadata for user:', supabaseUser.id);
        
        const fullName = supabaseUser.user_metadata?.full_name || 'Unknown User';
        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ') || 'User';
        
        // Create user object without database insert
        const fullUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          fullName: fullName,
          role: (supabaseUser.user_metadata?.role || 'customer').toUpperCase() as UserRole,
          phoneNumber: supabaseUser.user_metadata?.phone_number || '',
        };
        
        console.log('[AuthContext] User created from metadata:', fullUser);
        setUser(fullUser);
        return;
      }
      
      if (error) {
        console.error('Error loading user profile:', error);
        // Create user with fallback values
        const fullUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          fullName: supabaseUser.user_metadata?.full_name || 'Unknown User',
          role: (supabaseUser.user_metadata?.role || 'customer').toUpperCase() as UserRole,
          phoneNumber: supabaseUser.user_metadata?.phone_number || '',
        };
        setUser(fullUser);
        return;
      }

      if (userProfile) {
        const fullName = `${userProfile.first_name} ${userProfile.last_name}`.trim();
        const role = userProfile.role?.toUpperCase() as UserRole || 'CUSTOMER';
        const fullUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          fullName: fullName,
          role: role,
          phoneNumber: userProfile.phone || '',
        };
        console.log('[AuthContext] User profile loaded:', fullUser);
        setUser(fullUser);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Create user with fallback values on any error
      const fullUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        fullName: supabaseUser.user_metadata?.full_name || 'Unknown User',
        role: (supabaseUser.user_metadata?.role || 'customer').toUpperCase() as UserRole,
        phoneNumber: supabaseUser.user_metadata?.phone_number || '',
      };
      setUser(fullUser);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // The onAuthStateChange listener will handle loading the profile
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Starting logout process');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthContext] Error during logout:', error);
        throw error;
      }
      console.log('[AuthContext] Logout successful');
    } catch (error) {
      console.error('[AuthContext] Logout failed:', error);
      throw error;
    }
  };

  const register = async (userData: { email: string; password: string; role: string; fullName: string; phoneNumber: string }) => {
    const { data, error } = await supabase.auth.signUp({
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

    // Don't try to create user profile due to RLS issues
    // The user will be created from metadata when they first sign in
    console.log('[AuthContext] User registered successfully, profile will be created from metadata on first login');
    
    // The onAuthStateChange listener will handle setting the session
  };

  const verifyOTP = async (email: string, otp: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });
    if (error) throw error;
  };

  const resendOTP = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });
    if (error) throw error;
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
        verifyOTP,
        resendOTP,
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