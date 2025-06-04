import { useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

      setIsAvailable(hasHardware);
      setIsEnrolled(isEnrolled);

      if (!hasHardware) {
        throw new Error('Device does not support biometric authentication');
      }

      if (!isEnrolled) {
        throw new Error('No biometrics enrolled on this device');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const enableBiometric = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Store biometric preference
      await AsyncStorage.setItem(`@biometric_${userId}`, 'enabled');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkBiometricEnabled = async (userId: string) => {
    try {
      const status = await AsyncStorage.getItem(`@biometric_${userId}`);
      return status === 'enabled';
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const disableBiometric = async (userId: string) => {
    try {
      await AsyncStorage.removeItem(`@biometric_${userId}`);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    isAvailable,
    isEnrolled,
    loading,
    error,
    checkBiometricAvailability,
    authenticate,
    enableBiometric,
    checkBiometricEnabled,
    disableBiometric,
  };
}; 