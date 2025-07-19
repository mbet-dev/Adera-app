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
import { Colors } from '../../constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ForgotPasswordScreenProps {
  onLoginPress: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onLoginPress }) => {
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
    <LinearGradient
      colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.headerContainer}>
              <MaterialIcons name="lock-open" size={60} color={Colors.white} />
              <Text style={styles.headerTitle}>Forgot Password?</Text>
              <Text style={styles.headerSubtitle}>
                Enter your email address to receive a password reset link.
        </Text>
      </View>

            <Card style={styles.card}>
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

              {authError && <Text style={styles.authErrorText}>{authError}</Text>}
              {authMessage && <Text style={styles.authMessageText}>{authMessage}</Text>}

              <Button
                title={isLoading ? 'Sending...' : 'Send Reset Email'}
                onPress={handleSendResetEmail}
                disabled={isLoading}
              />

              <TouchableOpacity onPress={onLoginPress} style={styles.backToLoginButton}>
                <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
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
    color: Colors.white,
    marginTop: 15,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 300,
  },
  card: {
    width: '100%',
    maxWidth: 350, // Adjusted from 400
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    alignItems: 'center',
  },
  authErrorText: {
    color: Colors.errorRed,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  authMessageText: {
    color: Colors.successGreen,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  backToLoginButton: {
    marginTop: 20,
  },
  backToLoginText: {
    color: Colors.primaryBlue,
    fontSize: 16,
    fontWeight: '600',
  },
}); 