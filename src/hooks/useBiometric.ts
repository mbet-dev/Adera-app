import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface StoredCredentials {
  e: string; // email
  p: string; // password
}

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export const useBiometric = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkBiometricAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);

      console.log('Biometric hardware check:', { hasHardware, isEnrolled });
      
      const available = hasHardware && isEnrolled;
      setIsAvailable(available);
      setIsEnrolled(isEnrolled);

      return available;
    } catch (err: any) {
      console.error('Biometric availability check error:', err.message || 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Run availability check on mount
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const authenticate = async (): Promise<{ email: string; password: string } | null> => {
    try {
      setLoading(true);
      setError(null);

      // First check if we have stored credentials
      const storedCredentials = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
      console.log('Checking stored credentials:', { hasCredentials: !!storedCredentials });

      if (!storedCredentials) {
        console.log('No stored credentials found');
        return null;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with biometrics',
        fallbackLabel: 'Use password instead',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      console.log('Biometric authentication result:', { success: result.success });

      if (result.success) {
        const { e, p } = JSON.parse(storedCredentials) as StoredCredentials;
        return { email: e, password: p };
      }
      return null;
    } catch (err: any) {
      console.error('Authentication error:', err.message || 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const enableBiometric = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // First verify biometric
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your fingerprint',
        fallbackLabel: 'Use password instead',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      console.log('Biometric verification result:', { success: result.success });

      if (!result.success) {
        throw new Error('Biometric verification failed');
      }

      // Store credentials in compressed format
      const credentials: StoredCredentials = { e: email, p: password };
      await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentials));
      console.log('Credentials stored successfully');
      return true;
    } catch (err: any) {
      console.error('Enable biometric error:', err.message || 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const hasBiometricCredentials = async () => {
    try {
      const credentials = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
      const hasCredentials = !!credentials;
      console.log('Checking biometric credentials:', { hasCredentials });
      return hasCredentials;
    } catch (err: any) {
      console.error('Check credentials error:', err.message || 'Unknown error');
      return false;
    }
  };

  const disableBiometric = async () => {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
      console.log('Biometric credentials removed');
      return true;
    } catch (err: any) {
      console.error('Disable biometric error:', err.message || 'Unknown error');
      return false;
    }
  };

  return {
    isAvailable,
    isEnrolled,
    loading,
    error,
    authenticate,
    enableBiometric,
    hasBiometricCredentials,
    disableBiometric,
  };
}; 