import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useBiometric } from '../../hooks/useBiometric';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { signIn } = useAuth();
  const { isAvailable, loading: biometricLoading, authenticate, hasBiometricCredentials } = useBiometric();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Check biometric status immediately on mount
  useEffect(() => {
    const initBiometrics = async () => {
      try {
        console.log('Starting biometric initialization...');
        if (isAvailable) {
          const hasCredentials = await hasBiometricCredentials();
          console.log('Initial biometric check:', { isAvailable, hasCredentials });
          setBiometricsEnabled(hasCredentials);
          
          if (hasCredentials) {
            // Trigger biometric auth immediately
            handleBiometricLogin();
          } else {
            setShowManualLogin(true);
          }
        } else {
          console.log('Biometrics not available');
          setShowManualLogin(true);
        }
      } catch (error) {
        console.error('Biometric initialization error:', error);
        setShowManualLogin(true);
      } finally {
        setInitialCheckDone(true);
      }
    };

    initBiometrics();
  }, [isAvailable]); // Re-run when isAvailable changes

  const handleBiometricLogin = async () => {
    try {
      console.log('Starting biometric login...');
      setLoading(true);
      const credentials = await authenticate();
      
      if (credentials) {
        console.log('Biometric authentication successful, signing in...');
        await signIn(credentials.email, credentials.password);
      } else {
        console.log('No credentials or authentication cancelled');
        setShowManualLogin(true);
      }
    } catch (error: any) {
      console.error('Biometric login error:', error);
      Alert.alert('Error', 'Biometric authentication failed. Please log in manually.');
      setShowManualLogin(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while initial check is in progress
  if (!initialCheckDone) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.biometricPrompt}>
          <Icon name="fingerprint" size={64} color={colors.primary} />
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Checking login options...
          </Text>
        </View>
      </View>
    );
  }

  // Show biometric prompt screen
  if (!showManualLogin && biometricsEnabled) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.biometricPrompt}>
          <Icon name="fingerprint" size={64} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            Login with Biometrics
          </Text>
          {loading && (
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Authenticating...
            </Text>
          )}
          <TouchableOpacity
            style={styles.switchToManual}
            onPress={() => setShowManualLogin(true)}
          >
            <Text style={[styles.switchToManualText, { color: colors.primary }]}>
              Use email and password instead
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show traditional login screen
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Welcome Back
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Sign in to continue
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border
          }]}
          placeholder="Email"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border
          }]}
          placeholder="Password"
          placeholderTextColor={colors.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {biometricsEnabled && (
          <TouchableOpacity
            style={[styles.biometricButton, { borderColor: colors.border }]}
            onPress={handleBiometricLogin}
            disabled={loading}
          >
            <Icon name="fingerprint" size={24} color={colors.primary} />
            <Text style={[styles.biometricText, { color: colors.text }]}>
              Use biometric login
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleManualLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotPassword}
        >
          <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.text }]}>
          Don't have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.footerLink, { color: colors.primary }]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  biometricPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20
  },
  switchToManual: {
    marginTop: 20
  },
  switchToManualText: {
    fontSize: 16
  },
  header: {
    marginTop: 60,
    marginBottom: 40
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7
  },
  form: {
    gap: 16
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  biometricButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '500'
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16
  },
  forgotPasswordText: {
    fontSize: 16
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 20
  },
  footerText: {
    fontSize: 16
  },
  footerLink: {
    fontSize: 16,
    fontWeight: '600'
  }
}); 