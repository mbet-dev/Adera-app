import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useBiometric } from '../../hooks/useBiometric';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface LoginScreenProps {
  onSignupPress: () => void;
  onForgotPasswordPress: () => void;
  onGuestBrowsePress?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSignupPress,
  onForgotPasswordPress,
  onGuestBrowsePress,
}) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showBiometricOption, setShowBiometricOption] = useState(false);

  const { login, isLoading } = useAuth();
  const [error, setError] = useState('');
  const { 
    isAvailable, 
    isEnrolled, 
    authenticate, 
    hasBiometricCredentials,
    loading: biometricLoading 
  } = useBiometric();

  // Check for biometric availability and stored credentials on mount
  useEffect(() => {
    const checkBiometricSetup = async () => {
      if (isAvailable && isEnrolled) {
        const hasCredentials = await hasBiometricCredentials();
        setShowBiometricOption(hasCredentials);
      }
    };
    
    checkBiometricSetup();
  }, [isAvailable, isEnrolled, hasBiometricCredentials]);

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setError('');

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login(email, password);
      // Navigation will be handled automatically by AppNavigator based on auth state
    } catch (error: any) {
      setError(error.message || 'Failed to sign in. Please try again.');
      Alert.alert('Login Error', error.message || 'Failed to sign in. Please try again.');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const credentials = await authenticate();
      
      if (credentials) {
        await login(credentials.email, credentials.password);
      } else {
        Alert.alert('Biometric Login Failed', 'Please try again or use your password.');
      }
    } catch (error) {
      Alert.alert('Biometric Error', 'Biometric authentication failed. Please use your password.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Welcome to Adera</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Sign in to your account to continue
              </Text>
            </View>

            {/* Biometric Login Option */}
            {showBiometricOption && Platform.OS !== 'web' && (
              <Card style={styles.biometricCard}>
                <TouchableOpacity
                  style={[styles.biometricButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={handleBiometricLogin}
                  disabled={biometricLoading || isLoading}
                >
                  <Icon 
                    name="fingerprint" 
                    size={24} 
                    color={colors.primary} 
                  />
                  <Text style={[styles.biometricButtonText, { color: colors.primary }]}>
                    {biometricLoading ? 'Authenticating...' : 'Login with Biometrics'}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.dividerContainer}>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                </View>
              </Card>
            )}

            {/* Login Form */}
            <Card style={styles.formCard}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={emailError}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                error={passwordError}
              />

              {error && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              )}

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
                style={styles.loginButton}
              />

              <TouchableOpacity onPress={onForgotPasswordPress} style={styles.forgotPasswordButton}>
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot your password?</Text>
              </TouchableOpacity>
            </Card>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={[styles.signUpText, { color: colors.textSecondary }]}>
                Don't have an account?{' '}
                <TouchableOpacity onPress={onSignupPress}>
                  <Text style={[styles.signUpLink, { color: colors.primary }]}>
                    Sign up
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>

            {/* Browse as Guest Option */}
            {onGuestBrowsePress && (
              <View style={styles.guestBrowseContainer}>
                <TouchableOpacity 
                  onPress={onGuestBrowsePress}
                  style={[styles.guestBrowseButton, { borderColor: colors.border }]}
                >
                  <Icon name="eye" size={20} color={colors.textSecondary} />
                  <Text style={[styles.guestBrowseText, { color: colors.textSecondary }]}>
                    Browse as Guest
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.guestBrowseSubtext, { color: colors.textSecondary }]}>
                  Explore our marketplace without signing in
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  keyboardAvoidingView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  
  content: {
    padding: 24,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  
  biometricCard: {
    marginBottom: 16,
  },
  
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  
  biometricButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  
  divider: {
    flex: 1,
    height: 1,
  },
  
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  
  formCard: {
    marginBottom: 24,
  },
  
  loginButton: {
    marginTop: 8,
  },
  
  forgotPasswordButton: {
    marginTop: 15,
    alignSelf: 'center',
  },
  
  forgotPasswordText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'none',
  },
  
  signUpContainer: {
    alignItems: 'center',
  },
  
  signUpText: {
    fontSize: 14,
  },
  
  signUpLink: {
    fontWeight: '600',
  },
  
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  
  guestBrowseContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  
  guestBrowseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  
  guestBrowseText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  
  guestBrowseSubtext: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});
