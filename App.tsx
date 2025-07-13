import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/useAuthStore';
import { LoginScreen } from './src/screens/auth/LoginScreen';

export default function App() {
  const { getCurrentUser, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Check for existing session on app start
    getCurrentUser();
  }, [getCurrentUser]);

  if (isLoading) {
    // You can add a proper loading screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {isAuthenticated ? (
        // TODO: Add main app navigation here
        <LoginScreen />
      ) : (
        <LoginScreen />
      )}
    </SafeAreaProvider>
  );
}
 