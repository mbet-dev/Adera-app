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
      // First, try to get existing user profile from the users table
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('first_name, last_name, role, phone')
        .eq('id', supabaseUser.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // User profile doesn't exist, create a default one
        console.log('[AuthContext] User profile not found, creating default profile for user:', supabaseUser.id);
        
        const fullName = supabaseUser.user_metadata?.full_name || 'Unknown User';
        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ') || 'User';
        
        const defaultProfile = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          first_name: firstName,
          last_name: lastName,
          role: supabaseUser.user_metadata?.role || 'customer',
          phone: supabaseUser.user_metadata?.phone_number || '',
        };
        
        const { error: insertError } = await supabase
          .from('users')
          .insert(defaultProfile);
        
        if (insertError) {
          console.error('Error creating default user profile:', insertError);
          // Still create user object with default values
          const fullUser: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            fullName: fullName,
            role: (supabaseUser.user_metadata?.role || 'customer').toUpperCase() as UserRole,
            phoneNumber: supabaseUser.user_metadata?.phone_number || '',
          };
          setUser(fullUser);
          return;
        }
        
        // Use the default profile we just created
        const fullUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          fullName: fullName,
          role: (supabaseUser.user_metadata?.role || 'customer').toUpperCase() as UserRole,
          phoneNumber: supabaseUser.user_metadata?.phone_number || '',
        };
        console.log('[AuthContext] Default user profile created and loaded:', fullUser);
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
        const fullUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          fullName: fullName,
          role: userProfile.role.toUpperCase() as UserRole,
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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

    // Create a matching user profile row immediately so that first login can succeed
    const userId = data?.user?.id;
    if (userId) {
      const [firstName, ...lastNameParts] = userData.fullName.split(' ');
      const lastName = lastNameParts.join(' ') || 'User';
      
      const { error: userError } = await supabase.from('users').insert({
        id: userId,
        email: userData.email,
        first_name: firstName,
        last_name: lastName,
        role: userData.role.toLowerCase(),
        phone: userData.phoneNumber,
      });

      if (userError && userError.code !== '23505') { // Ignore duplicate inserts
        throw userError;
      }
    }
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