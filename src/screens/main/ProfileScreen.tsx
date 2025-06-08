import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Modal, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useBiometric } from '../../hooks/useBiometric';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const { isAvailable, hasBiometricCredentials, enableBiometric, disableBiometric } = useBiometric();
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const checkBiometrics = async () => {
      if (isAvailable) {
        const hasCredentials = await hasBiometricCredentials();
        setBiometricsEnabled(hasCredentials);
      }
    };
    checkBiometrics();
  }, [isAvailable]);

  const handleToggleBiometrics = async () => {
    if (biometricsEnabled) {
      try {
        setLoading(true);
        await disableBiometric();
        setBiometricsEnabled(false);
        Alert.alert('Success', 'Biometric login disabled');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to disable biometric login');
      } finally {
        setLoading(false);
      }
    } else {
      setShowPasswordModal(true);
    }
  };

  const handleEnableBiometrics = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      setLoading(true);
      if (user?.email) {
        await enableBiometric(user.email, password);
        setBiometricsEnabled(true);
        setShowPasswordModal(false);
        setPassword('');
        Alert.alert('Success', 'Biometric login enabled');
      } else {
        Alert.alert('Error', 'User email not found.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to enable biometric login');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignOut = () => {
    if (logout) {
      logout();
    }
  };

  if (!user) {
    // Render a loading state or a placeholder if the user is not available yet
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>Loading profile...</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.name, { color: colors.text }]}>
          {user.fullName || 'User'}
        </Text>
        <Text style={[styles.email, { color: colors.text }]}>
          {user.email}
        </Text>
        <Text style={[styles.role, { color: colors.text }]}>
          {(user.role?.charAt(0).toUpperCase() + user.role?.slice(1)) || 'User'}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.button, { borderBottomColor: colors.border }]}
        >
          <View style={styles.buttonContent}>
            <Icon name="account-edit" size={24} color={colors.text} />
            <Text style={[styles.buttonText, { color: colors.text }]}>
              Edit Profile
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { borderBottomColor: colors.border }]}
        >
          <View style={styles.buttonContent}>
            <Icon name="lock-reset" size={24} color={colors.text} />
            <Text style={[styles.buttonText, { color: colors.text }]}>
              Change Password
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>
        
        {Platform.OS !== 'web' && isAvailable && (
          <TouchableOpacity
            style={[styles.button, { borderBottomColor: colors.border }]}
            onPress={handleToggleBiometrics}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <Icon name="fingerprint" size={24} color={colors.text} />
              <Text style={[styles.buttonText, { color: colors.text }]}>
                {loading ? 'Updating...' : 'Biometric Login'}
              </Text>
            </View>
            <View style={styles.toggleContainer}>
              <Text style={[styles.toggleText, { color: colors.text }]}>
                {biometricsEnabled ? 'Enabled' : 'Disabled'}
              </Text>
              <Icon 
                name={biometricsEnabled ? 'toggle-switch' : 'toggle-switch-off'} 
                size={36} 
                color={biometricsEnabled ? colors.primary : colors.text} 
              />
            </View>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignOut}
        >
          <View style={styles.buttonContent}>
            <Icon name="logout" size={24} color={colors.error} />
            <Text style={[styles.buttonText, { color: colors.error }]}>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPasswordModal(false);
          setPassword('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Enable Biometric Login</Text>
            <Text style={[styles.modalDescription, { color: colors.text }]}>Please enter your password to enable biometric login</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={() => { setShowPasswordModal(false); setPassword(''); }}>
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleEnableBiometrics}
                disabled={loading}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>{loading ? 'Enabling...' : 'Enable'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    marginBottom: 20,
    borderRadius: 12
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  email: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 4
  },
  role: {
    fontSize: 14,
    opacity: 0.5,
    textTransform: 'capitalize'
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden'
  },
  button: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  buttonText: {
    fontSize: 16
  },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleText: { fontSize: 14, opacity: 0.7 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', padding: 24, borderRadius: 16, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalDescription: { fontSize: 16, textAlign: 'center', marginBottom: 24, opacity: 0.8 },
  modalInput: { width: '100%', height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 16, marginBottom: 24 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 12 },
  modalButton: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalCancelButton: { backgroundColor: 'transparent', borderWidth: 1 },
  modalButtonText: { fontSize: 16, fontWeight: '600' }
}); 