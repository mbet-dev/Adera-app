import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Sign in error:', error.message || 'Unknown error');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: { [key: string]: any }) => {
    console.log('Auth hook signUp called with metadata:', metadata);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            phone_number: metadata?.phone_number ? 
              (metadata.phone_number.startsWith('+251') ? metadata.phone_number : '+251' + metadata.phone_number) : 
              null
          }
        }
      });

      if (error) {
        console.error('Auth signUp error:', error.message || 'Unknown error');
        throw error;
      }
      
      if (!data.user) {
        throw new Error('No user data returned from signup');
      }

      console.log('Auth signUp successful:', {
        user: data.user.id,
        metadata: data.user.user_metadata
      });
      
      return data;
    } catch (error: any) {
      console.error('Detailed signup error:', {
        message: error.message || 'Unknown error',
        code: error.code,
        status: error.status
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign out error:', error.message || 'Unknown error');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'adera://reset-password'
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Reset password error:', error.message || 'Unknown error');
      throw error;
    }
  };

  const verifyOTP = async (email: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Verify OTP error:', error.message || 'Unknown error');
      throw error;
    }
  };

  const resendOTP = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: 'adera://auth/callback'
        }
      });

      if (error) throw error;

      console.log('Resend OTP Response:', JSON.stringify(data, null, 2));
    } catch (error: any) {
      console.error('Resend OTP error:', error.message || 'Unknown error');
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    verifyOTP,
    resendOTP
  };
}; 