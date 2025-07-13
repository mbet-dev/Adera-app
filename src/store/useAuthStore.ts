import { create } from 'zustand';
import { User } from '../types';
import { auth, db } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
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
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during sign in',
        isLoading: false 
      });
    }
  },

  signUp: async (email: string, password: string, userData: Partial<User>) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await auth.signUp(email, password, userData);
      
      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      if (data.user) {
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
          user: userProfile,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during sign up',
        isLoading: false 
      });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    
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
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during sign out',
        isLoading: false 
      });
    }
  },

  getCurrentUser: async () => {
    set({ isLoading: true });
    
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
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred while getting current user',
        isLoading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
})); 