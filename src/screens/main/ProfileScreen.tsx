import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Modal, Platform, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useBiometric } from '../../hooks/useBiometric';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { Card } from '../../components/ui/Card';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const { isAvailable, hasBiometricCredentials, enableBiometric, disableBiometric } = useBiometric();
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [password, setPassword] = useState('');
  const [editForm, setEditForm] = useState({
    firstName: user?.fullName?.split(' ')[0] || '',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phoneNumber || ''
  });

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

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update logic
    Alert.alert('Success', 'Profile updated successfully');
    setShowEditModal(false);
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change functionality will be implemented soon.');
  };

  const handleSignOut = async () => {
    console.log('[ProfileScreen] handleSignOut called');
    console.log('[ProfileScreen] logout function available:', !!logout);
    
    try {
      console.log('[ProfileScreen] Starting aggressive logout');
      
      // Method 1: Try the context logout function
      if (logout) {
        console.log('[ProfileScreen] Attempting context logout');
        await logout();
        console.log('[ProfileScreen] Context logout successful');
        return;
      }
      
      // Method 2: Direct supabase logout
      console.log('[ProfileScreen] Attempting direct supabase logout');
      const { supabase } = await import('../../lib/supabase');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[ProfileScreen] Direct logout error:', error);
      } else {
        console.log('[ProfileScreen] Direct logout successful');
        return;
      }
      
      // Method 3: Force clear session
      console.log('[ProfileScreen] Attempting session clear');
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.removeItem('adera_session');
      console.log('[ProfileScreen] Session cleared');
      
    } catch (error) {
      console.error('[ProfileScreen] All logout methods failed:', error);
    }
  };

  if (!user) {
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card padding="large" style={{ ...styles.profileHeader, borderBottomColor: colors.border }}>
          <View style={styles.avatarSection}>
            <ProfileAvatar
              uri={undefined} // No avatar URL in AuthContext User
              name={user.fullName}
              size={80}
              onPress={() => Alert.alert('Change Photo', 'Photo upload functionality will be implemented soon.')}
            />
            <TouchableOpacity
              style={[styles.changePhotoButton, { backgroundColor: colors.primary, borderColor: colors.card }]}
              onPress={() => Alert.alert('Change Photo', 'Photo upload functionality will be implemented soon.')}
            >
              <Icon name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user.fullName}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user.email}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.roleText}>
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1).toLowerCase()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Profile Actions */}
        <Card padding="medium" style={styles.actionsCard}>
          <TouchableOpacity
            style={[styles.actionButton, { borderBottomColor: colors.border }]}
            onPress={handleEditProfile}
          >
            <View style={styles.actionContent}>
              <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                <Icon name="account-edit" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Edit Profile</Text>
                <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Update your personal information</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderBottomColor: colors.border }]}
            onPress={handleChangePassword}
          >
            <View style={styles.actionContent}>
              <View style={[styles.actionIcon, { backgroundColor: '#F39C12' }]}>
                <Icon name="lock-reset" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Change Password</Text>
                <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Update your password</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          {Platform.OS !== 'web' && isAvailable && (
            <TouchableOpacity
              style={[styles.actionButton, { borderBottomColor: colors.border }]}
              onPress={handleToggleBiometrics}
              disabled={loading}
            >
              <View style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: '#9B59B6' }]}>
                  <Icon name="fingerprint" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.actionText}>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>
                    {loading ? 'Updating...' : 'Biometric Login'}
                  </Text>
                  <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                    {biometricsEnabled ? 'Currently enabled' : 'Use fingerprint or face ID'}
                  </Text>
                </View>
              </View>
              <View style={styles.toggleContainer}>
                <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                  {biometricsEnabled ? 'Enabled' : 'Disabled'}
                </Text>
                <Icon 
                  name={biometricsEnabled ? 'toggle-switch' : 'toggle-switch-off'} 
                  size={32} 
                  color={biometricsEnabled ? colors.primary : colors.textSecondary} 
                />
              </View>
            </TouchableOpacity>
          )}
        </Card>

        {/* Account Actions */}
        <Card padding="medium" style={styles.accountCard}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={handleSignOut}
            onPressIn={() => console.log('[ProfileScreen] Sign out button pressed')}
          >
            <View style={styles.actionContent}>
              <View style={[styles.actionIcon, { backgroundColor: colors.error }]}>
                <Icon name="logout" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.error }]}>Sign Out</Text>
                <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Log out of your account</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </Pressable>
        </Card>
      </ScrollView>

      {/* Biometric Password Modal */}
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
            <View style={[styles.modalIcon, { backgroundColor: colors.primary }]}>
              <Icon name="fingerprint" size={32} color="#FFFFFF" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Enable Biometric Login</Text>
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Please enter your password to enable biometric login
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
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
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  {loading ? 'Enabling...' : 'Enable'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.editModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.editModalHeader}>
              <Text style={[styles.editModalTitle, { color: colors.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>First Name</Text>
                <TextInput
                  style={[styles.editInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={editForm.firstName}
                  onChangeText={(text) => setEditForm({...editForm, firstName: text})}
                  placeholder="Enter first name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Last Name</Text>
                <TextInput
                  style={[styles.editInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={editForm.lastName}
                  onChangeText={(text) => setEditForm({...editForm, lastName: text})}
                  placeholder="Enter last name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
                <TextInput
                  style={[styles.editInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({...editForm, email: text})}
                  placeholder="Enter email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Phone</Text>
                <TextInput
                  style={[styles.editInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({...editForm, phone: text})}
                  placeholder="Enter phone number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            
            <View style={styles.editModalButtons}>
              <TouchableOpacity
                style={[styles.editModalButton, styles.editModalCancelButton, { borderColor: colors.border }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.editModalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editModalButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveProfile}
              >
                <Text style={[styles.editModalButtonText, { color: '#FFFFFF' }]}>Save Changes</Text>
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
  container: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  avatarSection: {
    position: 'relative',
    marginRight: 20,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 8,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  actionsCard: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountCard: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  editModalContent: {
    width: '90%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editForm: {
    width: '100%',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  editInput: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  editModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  editModalButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalCancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  editModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleText: { 
    fontSize: 14, 
    opacity: 0.7 
  },
}); 