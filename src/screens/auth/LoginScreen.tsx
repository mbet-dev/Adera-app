import React, { useState } from 'react';
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
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';

interface LoginScreenProps {
  onSignupPress: () => void;
  onForgotPasswordPress: () => void; // New prop
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSignupPress,
  onForgotPasswordPress, // Destructure new prop
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { signIn, isLoading, error, clearError } = useAuthStore();

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