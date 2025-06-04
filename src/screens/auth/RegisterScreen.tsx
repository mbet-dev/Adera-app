import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

type UserRole = 'customer' | 'partner' | 'driver';

export default function RegisterScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^9\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid Ethiopian phone number (9XXXXXXXX)');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmSignUp = async () => {
    const formattedPhoneNumber = phoneNumber.trim().startsWith('+251') ? 
      phoneNumber.trim() : 
      phoneNumber.trim().startsWith('0') ? 
        '+251' + phoneNumber.trim().slice(1) : 
        '+251' + phoneNumber.trim();

    const userData = { 
      full_name: fullName.trim(),
      phone_number: formattedPhoneNumber,
      role: role.toLowerCase()
    };
    
    try {
      setLoading(true);
      console.log('Starting signup process with data:', {
        email: email.trim(),
        fullName: fullName.trim(),
        phoneNumber: formattedPhoneNumber,
        role: role.toLowerCase()
      });
      
      console.log('User data being sent:', userData);
      
      const result = await signUp(email.trim(), password, userData);
      console.log('Signup successful:', result);
      
      setShowConfirmation(false);
      navigation.navigate('OTP', { email: email.trim() });
    } catch (error: any) {
      console.error('Signup error details:', {
        message: error.message,
        code: error.code,
        fullError: error,
        userData
      });
      Alert.alert('Error', error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Create Account
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Sign up to get started
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border
          }]}
          placeholder="Full Name"
          placeholderTextColor={colors.placeholder}
          value={fullName}
          onChangeText={setFullName}
        />

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

        <View style={styles.phoneInputContainer}>
          <Text style={[styles.phonePrefix, { color: colors.text }]}>+251</Text>
          <TextInput
            style={[styles.phoneInput, { 
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border
            }]}
            placeholder="9XXXXXXXX"
            placeholderTextColor={colors.placeholder}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={9}
          />
        </View>

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

        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border
          }]}
          placeholder="Confirm Password"
          placeholderTextColor={colors.placeholder}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View style={styles.roleContainer}>
          <Text style={[styles.roleLabel, { color: colors.text }]}>Select Role:</Text>
          <View style={styles.roleButtons}>
            {(['customer', 'partner', 'driver'] as UserRole[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.roleButton,
                  { 
                    backgroundColor: role === r ? colors.primary : colors.card,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => setRole(r)}
              >
                <Text style={[
                  styles.roleButtonText,
                  { color: role === r ? '#FFFFFF' : colors.text }
                ]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.text }]}>
          Already have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.footerLink, { color: colors.primary }]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Confirm Registration
            </Text>
            <Text style={[styles.modalText, { color: colors.text }]}>
              Are you sure you want to create an account with the following details?
            </Text>
            <View style={styles.modalDetails}>
              <Text style={[styles.modalDetail, { color: colors.text }]}>
                Name: {fullName}
              </Text>
              <Text style={[styles.modalDetail, { color: colors.text }]}>
                Email: {email}
              </Text>
              <Text style={[styles.modalDetail, { color: colors.text }]}>
                Phone: +251{phoneNumber}
              </Text>
              <Text style={[styles.modalDetail, { color: colors.text }]}>
                Role: {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={confirmSignUp}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? 'Creating...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 16
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  phonePrefix: {
    fontSize: 16,
    fontWeight: '600'
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16
  },
  roleContainer: {
    gap: 8
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600'
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8
  },
  roleButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600'
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    gap: 16
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center'
  },
  modalDetails: {
    gap: 8
  },
  modalDetail: {
    fontSize: 16
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
}); 