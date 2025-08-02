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
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { UserRole } from '../../types/index';

interface SignupScreenProps {
  onLoginPress: () => void;
}

// Define roles for selection
const ROLES = [UserRole.CUSTOMER, UserRole.PARTNER, UserRole.DRIVER];

export const SignupScreen: React.FC<SignupScreenProps> = ({ onLoginPress }) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CUSTOMER);

  const [otp, setOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [roleError, setRoleError] = useState('');
  const [otpError, setOtpError] = useState('');

  const { signUp, isLoading, error, message, clearError, setLoading, setMessage } = useAuthStore();

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setFirstNameError('');
    setLastNameError('');
    setPhoneNumberError('');
    setRoleError('');
    setOtpError('');
    clearError();
    setMessage(null);

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    if (!firstName) {
      setFirstNameError('First name is required');
      isValid = false;
    }

    if (!lastName) {
      setLastNameError('Last name is required');
      isValid = false;
    }

    // Phone number validation: starts with +251 and has 9 more digits or new formatted string
    const phoneRegex = /^(?:\+251\d{9}|\+251-9\d{2}-\d{2}\s\d{2}\s\d{2})$/;
    if (!phoneNumber) {
      setPhoneNumberError('Phone number is required');
      isValid = false;
    } else if (!phoneRegex.test(phoneNumber)) {
      setPhoneNumberError('Phone number must be in the format +2519XXXXXXXX or +251-9XX-XX XX XX');
      isValid = false;
    }

    if (!selectedRole) {
      setRoleError('Please select a role');
      isValid = false;
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userData = {
        first_name: firstName,
        last_name: lastName,
        phone: phoneNumber,
        role: selectedRole,
      };

      await signUp(email, password, userData);
      
      if (useAuthStore.getState().message) {
        setShowOtpModal(true);
        console.log("OTP/Verification Email Sent:", useAuthStore.getState().message);
      } else if (useAuthStore.getState().user) {
        Alert.alert("Signup Successful", "You have been signed up and logged in!");
      }
    } catch (err) {
      Alert.alert('Signup Error', 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError('OTP is required');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) {
        setOtpError(error.message);
        Alert.alert('Verification Error', error.message);
        console.error("OTP Verification Error:", error.message);
        return;
      }

      if (data.user) {
        await useAuthStore.getState().signIn(email, password); 
        Alert.alert('Verification Successful', 'Your account has been verified!');
        setShowOtpModal(false);
      } else {
        setOtpError('Invalid OTP or email.');
        Alert.alert('Verification Error', 'Invalid OTP or email.');
      }
    } catch (err) {
      setOtpError('An unexpected error occurred during OTP verification.');
      Alert.alert('Verification Error', 'An unexpected error occurred during OTP verification.');
      console.error("OTP Verification Caught Error:", err);
    } finally {
      setLoading(false);
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
              <Text style={[styles.title, { color: colors.text }]}>Create Your Adera Account</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Join us and start sending parcels or opening your e-shop!
              </Text>
            </View>

            {/* Signup Form */}
            <Card style={styles.formCard}>
              <Input
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                autoCapitalize="words"
                autoCorrect={false}
                error={firstNameError}
              />
              <Input
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                autoCapitalize="words"
                autoCorrect={false}
                error={lastNameError}
              />
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
                label="Phone Number"
                value={phoneNumber}
                onChangeText={(text) => {
                  let formattedText = text.replace(/[^0-9]/g, ''); // Remove all non-digits first
                  if (!formattedText.startsWith('2519')) {
                    formattedText = '2519' + formattedText.substring(4); // Ensure it starts with 2519
                  }

                  // Apply formatting: +251-9XX-XX XX XX
                  let displayValue = '+251-' + formattedText.substring(3, 4); // The '9'

                  let remainingDigits = formattedText.substring(4); // The rest of the digits after '2519'

                  if (remainingDigits.length > 0) {
                    displayValue += remainingDigits.substring(0, 2); // First two after '9'
                  }
                  if (remainingDigits.length > 2) {
                    displayValue += '-' + remainingDigits.substring(2, 4); // Next two
                  }
                  if (remainingDigits.length > 4) {
                    displayValue += ' ' + remainingDigits.substring(4, 6); // Next two
                  }
                  if (remainingDigits.length > 6) {
                    displayValue += ' ' + remainingDigits.substring(6, 8); // Last two
                  }
                  
                  setPhoneNumber(displayValue);
                }}
                placeholder="+251-9XX-XX XX XX"
                keyboardType="phone-pad"
                maxLength={19} // +251-9XX-XX XX XX is 19 characters
                error={phoneNumberError}
                helperText="Please enter your 9-digit phone number after +251-9, e.g., +251-912-34 56 78"
              />

              <View style={styles.roleSelectionContainer}>
                <Text style={[styles.roleLabel, { color: colors.text }]}>Select Your Role:</Text>
                <View style={styles.roleButtonsContainer}>
                  {ROLES.map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleButton,
                        { borderColor: colors.border },
                        selectedRole === role && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => setSelectedRole(role)}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        { color: colors.text },
                        selectedRole === role && { color: '#FFFFFF' },
                      ]}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {roleError && <Text style={[styles.errorText, { color: colors.error }]}>{roleError}</Text>}
              </View>

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
                error={passwordError}
              />

              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
                error={confirmPasswordError}
              />

              {error && error.length > 0 && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              )}
              {message && message.length > 0 && !error && (
                <Text style={[styles.messageText, { color: colors.success }]}>
                  {message}
                </Text>
              )}

              <Button
                title="Sign Up"
                onPress={handleSignUp}
                loading={isLoading}
                fullWidth
                style={styles.signupButton}
              />
            </Card>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already have an account?{' '}
                <TouchableOpacity onPress={onLoginPress}>
                  <Text style={[styles.loginLink, { color: colors.primary }]}>
                    Log In
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Verification Modal */}
      <Modal
        visible={showOtpModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOtpModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Enter Verification Code</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              A verification code has been sent to your email. Please enter it below.
            </Text>
            <Input
              label="Verification Code"
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP"
              keyboardType="number-pad"
              maxLength={6}
              error={otpError}
            />
            <Button
              title="Verify"
              onPress={handleVerifyOtp}
              loading={isLoading}
              fullWidth
            />
            <TouchableOpacity onPress={() => setShowOtpModal(false)} style={styles.modalCloseButton}>
              <Text style={[styles.modalCloseButtonText, { color: colors.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  formCard: {
    marginBottom: 24,
  },
  signupButton: {
    marginTop: 8,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  roleSelectionContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 