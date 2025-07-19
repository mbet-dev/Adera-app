import { create } from 'zustand';
import { User } from '../types';
import { auth, db } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  message: string | null; // Added for success messages, e.g., OTP sent
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setMessage: (message: string | null) => void; // Added action to set messages
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  message: null,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null, message: null });
    
    try {
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      if (data.user) {
        // Get user profile from our users table
        const { data: userProfile, error: profileError } = await db.users.getById(data.user.id);
        
        if (profileError) {
          set({ error: profileError.message, isLoading: false });
          return;
        }

        set({
          user: userProfile,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          message: 'Sign in successful!',
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during sign in',
        isLoading: false,
        message: null,
      });
    }
  },

  signUp: async (email: string, password: string, userData: Partial<User>) => {
    set({ isLoading: true, error: null, message: null });
    
    try {
      const { data, error } = await auth.signUp(email, password, userData);
      
      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      if (data.user) {
        // If email confirmation is required, Supabase sends an email.
        // The user will be null until email is confirmed.
        // We still create the profile but mark them as unverified if needed.

        // Create user profile in our users table
        const profileData = {
          id: data.user.id,
          email: email,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          role: userData.role || 'customer',
          phone: userData.phone,
          language: userData.language || 'en',
        };

        const { data: userProfile, error: profileError } = await db.users.create(profileData);
        
        if (profileError) {
          set({ error: profileError.message, isLoading: false });
          return;
        }

        set({
          user: userProfile, // Correctly setting the user with the full profile
          isAuthenticated: false, // Set to false until email is confirmed
          isLoading: false,
          error: null,
          message: 'Verification email sent! Please check your inbox and spam folder.',
        });
      } else if (data.session === null) {
        // This case indicates that an email confirmation is pending.
        set({
          isLoading: false,
          error: null,
          message: 'Confirmation email sent. Please check your inbox to verify your account.',
        });
      } else {
        // Handle other successful sign-up scenarios where session might be immediately available
        // This path might be taken if email confirmation is off.
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          message: 'Sign up successful!',
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during sign up',
        isLoading: false,
        message: null,
      });
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null, message: null });
    
    try {
      const { error } = await auth.signOut();
      
      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        message: 'Signed out successfully.',
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during sign out',
        isLoading: false,
        message: null,
      });
    }
  },

  getCurrentUser: async () => {
    set({ isLoading: true, error: null, message: null });
    
    try {
      const { user, error } = await auth.getCurrentUser();
      
      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      if (user) {
        // Get user profile from our users table
        const { data: userProfile, error: profileError } = await db.users.getById(user.id);
        
        if (profileError) {
          set({ error: profileError.message, isLoading: false });
          return;
        }

        set({
          user: userProfile,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          message: null,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          message: null,
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred while getting current user',
        isLoading: false,
        message: null,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setMessage: (message: string | null) => {
    set({ message });
  },
  
  sendPasswordResetEmail: async (email: string) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const { error } = await auth.resetPassword(email, {
        redirectTo: window.location.origin + '/reset-password', // Ensure this URL is configured in Supabase Auth Redirect URLs
      });

      if (error) {
        set({ isLoading: false, error: error.message });
        return;
      }

      set({
        isLoading: false,
        error: null,
        message: 'Password reset email sent! Check your inbox.',
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'An unexpected error occurred.' });
    }
  },
})); 