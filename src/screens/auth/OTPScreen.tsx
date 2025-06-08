import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

export default function OTPScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { verifyOTP, resendOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      await verifyOTP(route.params.email, otp);
      Alert.alert(
        'Success',
        'Email verified successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }]
              });
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      await resendOTP(route.params.email);
      setResendDisabled(true);
      setCountdown(60);
      Alert.alert('Success', 'OTP has been resent to your email');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Verify Email
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Enter the 6-digit code sent to {route.params.email}
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border
          }]}
          placeholder="Enter OTP"
          placeholderTextColor={colors.placeholder}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: colors.text }]}>
            Didn't receive the code?{' '}
          </Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={resendDisabled || loading}
          >
            <Text style={[
              styles.resendButton,
              { 
                color: resendDisabled ? colors.placeholder : colors.primary,
                opacity: resendDisabled ? 0.5 : 1
              }
            ]}>
              {resendDisabled ? `Resend in ${countdown}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            Back to Register
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
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 8
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  resendText: {
    fontSize: 16
  },
  resendButton: {
    fontSize: 16,
    fontWeight: '600'
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16
  },
  backButtonText: {
    fontSize: 16
  }
}); 