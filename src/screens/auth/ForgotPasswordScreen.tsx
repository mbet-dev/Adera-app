import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ForgotPasswordScreenProps {
  onLoginPress: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onLoginPress }) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { sendPasswordResetEmail, isLoading, error: authError, message: authMessage } = useAuthStore();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required.';
    } else if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const handleSendResetEmail = async () => {
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }
    setEmailError('');

    await sendPasswordResetEmail(email);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.headerContainer}>
            <MaterialIcons name="lock-open" size={60} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Forgot Password?</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Enter your email address to receive a password reset link.
            </Text>
          </View>

          <Card style={{ ...styles.card, backgroundColor: colors.card }}>
            <Input
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            {authError && <Text style={[styles.authErrorText, { color: colors.error }]}>{authError}</Text>}
            {authMessage && <Text style={[styles.authMessageText, { color: colors.success }]}>{authMessage}</Text>}

            <Button
              title={isLoading ? 'Sending...' : 'Send Reset Email'}
              onPress={handleSendResetEmail}
              disabled={isLoading}
            />

            <TouchableOpacity onPress={onLoginPress} style={styles.backToLoginButton}>
              <Text style={[styles.backToLoginText, { color: colors.primary }]}>Back to Login</Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 15,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 300,
  },
  card: {
    width: '100%',
    maxWidth: 350,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  authErrorText: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  authMessageText: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  backToLoginButton: {
    marginTop: 20,
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 