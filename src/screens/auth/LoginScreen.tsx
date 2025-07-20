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
import { useAuthStore } from '../../store/useAuthStore';
import { useBiometric } from '../../hooks/useBiometric';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface LoginScreenProps {
  onSignupPress: () => void;
  onForgotPasswordPress: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSignupPress,
  onForgotPasswordPress,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showBiometricOption, setShowBiometricOption] = useState(false);

  const { signIn, isLoading, error, clearError } = useAuthStore();
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
    clearError();

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
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Login Error', 'Failed to sign in. Please try again.');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const credentials = await authenticate();
      
      if (credentials) {
        await signIn(credentials.email, credentials.password);
      } else {
        Alert.alert('Biometric Login Failed', 'Please try again or use your password.');
      }
    } catch (error) {
      Alert.alert('Biometric Error', 'Biometric authentication failed. Please use your password.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
              <Text style={styles.title}>Welcome to Adera</Text>
              <Text style={styles.subtitle}>
                Sign in to your account to continue
              </Text>
            </View>

            {/* Biometric Login Option */}
            {showBiometricOption && Platform.OS !== 'web' && (
              <Card style={styles.biometricCard}>
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                  disabled={biometricLoading || isLoading}
                >
                  <Icon 
                    name="fingerprint" 
                    size={24} 
                    color={Colors.primaryBlue} 
                  />
                  <Text style={styles.biometricButtonText}>
                    {biometricLoading ? 'Authenticating...' : 'Login with Biometrics'}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.divider} />
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
                <Text style={styles.errorText}>
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
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>
            </Card>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>
                Don't have an account?{' '}
                <TouchableOpacity onPress={onSignupPress}>
                  <Text style={styles.signUpLink}>
                    Sign up
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    color: '#111827',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
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
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  biometricButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primaryBlue,
  },
  
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
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
    color: Colors.primaryBlue,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'none',
  },
  
  signUpContainer: {
    alignItems: 'center',
  },
  
  signUpText: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  signUpLink: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
  },
}); 