import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { supabase } from '../services/supabase';

export const useAuth = () => {
  const { user, session, isLoading, error, signIn, signUp, signOut, resetPassword, updateUser } = useAuthStore();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        useAuthStore.setState({ session });
        // Fetch user data
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              useAuthStore.setState({ user: data });
            }
          });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        useAuthStore.setState({ session });
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (!error && data) {
          useAuthStore.setState({ user: data });
        }
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({ user: null, session: null });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUser,
    isAuthenticated: !!session,
  };
}; 