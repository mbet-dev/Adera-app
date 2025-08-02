import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface TrackingInputProps {
  visible: boolean;
  onClose: () => void;
  onTrack: (trackingId: string) => void;
  title?: string;
  placeholder?: string;
}

export default function TrackingInput({
  visible,
  onClose,
  onTrack,
  title = 'Track Your Parcel',
  placeholder = 'Enter tracking number'
}: TrackingInputProps) {
  const { colors } = useTheme();
  const [trackingId, setTrackingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      Alert.alert('Error', 'Please enter a tracking number');
      return;
    }

    setIsLoading(true);
    try {
      if (!validateTrackingId(trackingId.trim())) {
        Alert.alert(
          'Invalid Tracking Number',
          'Please enter a valid tracking number. It should follow the format: ADE20250719-0186 or similar.',
          [{ text: 'OK' }]
        );
        return;
      }

      await onTrack(trackingId.trim());
      setTrackingId('');
      onClose();
    } catch (error) {
      console.error('Error tracking parcel:', error);
      Alert.alert('Error', 'Failed to track parcel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateTrackingId = (id: string): boolean => {
    return /^[A-Z0-9\-_\.]{8,25}$/.test(id.toUpperCase());
  };

  const handleClose = () => {
    setTrackingId('');
    onClose();
  };

  const formatTrackingId = (text: string) => {
    const formatted = text.toUpperCase().replace(/\s+/g, '');
    setTrackingId(formatted);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <StatusBar barStyle="light-content" backgroundColor="#1D3557" />
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1D3557', '#2C3E50']}
            style={styles.gradient}
          >
            <SafeAreaView style={styles.container}>
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.header}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                  >
                    <Feather name="x" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <Text style={styles.headerSubtitle}>
                      Enter your tracking number to see real-time updates
                    </Text>
                  </View>
                </View>
                
                <View style={styles.inputSection}>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <Feather name="search" size={20} color={colors.textSecondary} />
                      <TextInput
                        style={[styles.textInput, { color: colors.text }]}
                        placeholder={placeholder}
                        placeholderTextColor={colors.placeholder}
                        value={trackingId}
                        onChangeText={formatTrackingId}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        maxLength={25}
                        returnKeyType="search"
                        onSubmitEditing={handleTrack}
                        autoFocus={true}
                      />
                      {trackingId.length > 0 && (
                        <TouchableOpacity
                          style={styles.clearButton}
                          onPress={() => setTrackingId('')}
                        >
                          <Feather name="x" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.formatInfo}>
                    <Feather name="info" size={16} color={colors.textSecondary} />
                    <Text style={[styles.formatText, { color: colors.textSecondary }]}>
                      Tracking numbers can contain letters, numbers, hyphens, and underscores
                    </Text>
                  </View>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[
                        styles.trackButton,
                        { 
                          backgroundColor: trackingId.trim() ? colors.primary : colors.border,
                          opacity: trackingId.trim() ? 1 : 0.6
                        }
                      ]}
                      onPress={handleTrack}
                      disabled={!trackingId.trim() || isLoading}
                    >
                      <Feather 
                        name={isLoading ? "loader" : "search"} 
                        size={20} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.trackButtonText}>
                        {isLoading ? 'Tracking...' : 'Track Parcel'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.examplesSection}>
                    <Text style={[styles.examplesTitle, { color: colors.textSecondary }]}>
                      Example tracking numbers:
                    </Text>
                    <View style={styles.examplesList}>
                      {['ADE20250719-0186', 'ADE20250720-1234', 'ADE20250719-4051'].map((example) => (
                        <TouchableOpacity
                          key={example}
                          style={[styles.exampleButton, { borderColor: colors.border }]}
                          onPress={() => setTrackingId(example)}
                        >
                          <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
                            {example}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                
                <View style={styles.featuresSection}>
                  <Text style={[styles.featuresTitle, { color: colors.text }]}>
                    Track with confidence
                  </Text>
                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <Feather name="map-pin" size={16} color={colors.primary} />
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                        Real-time location tracking
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Feather name="clock" size={16} color={colors.primary} />
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                        Estimated delivery times
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Feather name="share-2" size={16} color={colors.primary} />
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                        Share tracking updates
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Feather name="help-circle" size={16} color={colors.primary} />
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                        Get support when needed
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradient: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    minHeight: height * 0.8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  closeButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  inputSection: {
    flex: 1,
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  formatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  formatText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    marginBottom: 30,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  examplesSection: {
    marginBottom: 30,
  },
  examplesTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  examplesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  exampleText: {
    fontSize: 12,
  },
  featuresSection: {
    paddingVertical: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
}); 