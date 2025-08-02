import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

interface QRScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  title?: string;
  subtitle?: string;
  scanMode?: 'parcel' | 'pickup' | 'partner' | 'general';
}

export default function QRScanner({
  visible,
  onClose,
  onScan,
  title = 'Scan QR Code',
  subtitle = 'Position the QR code within the frame',
  scanMode = 'general'
}: QRScannerProps) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleManualInput = () => {
    setShowManualInput(true);
  };

  const handleManualSubmit = async () => {
    if (!manualInput.trim()) {
      Alert.alert('Error', 'Please enter a QR code or tracking number');
      return;
    }

    setIsLoading(true);
    try {
      // Validate the scanned data based on scan mode
      const isValid = validateScannedData(manualInput.trim(), scanMode);
      
      if (isValid) {
        // Process the scanned data
        await processScannedData(manualInput.trim(), scanMode);
      } else {
        Alert.alert(
          'Invalid QR Code',
          'The entered QR code is not valid for this operation. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert(
        'Error',
        'Failed to process the QR code. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRCodeDetected = async (data: string) => {
    setIsLoading(true);

    try {
      // Validate the scanned data based on scan mode
      const isValid = validateScannedData(data, scanMode);
      
      if (isValid) {
        // Process the scanned data
        await processScannedData(data, scanMode);
      } else {
        Alert.alert(
          'Invalid QR Code',
          'The entered QR code is not valid for this operation. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert(
        'Error',
        'Failed to process the QR code. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const validateScannedData = (data: string, mode: string): boolean => {
    try {
      // Basic validation - check if data is not empty
      if (!data || data.trim().length === 0) {
        return false;
      }

      // Mode-specific validation
      switch (mode) {
        case 'parcel':
          // Updated to accept database format like "ADE20250719-0186"
          // Accepts: letters, numbers, hyphens, underscores, and periods
          // Minimum 8 characters, maximum 25 characters
          return /^[A-Z0-9\-_\.]{8,25}$/.test(data.toUpperCase());
        
        case 'pickup':
          // Pickup codes should be alphanumeric and 6-10 characters
          return /^[A-Z0-9]{6,10}$/.test(data.toUpperCase());
        
        case 'partner':
          // Partner IDs should be UUID format
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data);
        
        case 'general':
        default:
          // Accept any non-empty string for general scanning
          return true;
      }
    } catch (error) {
      console.error('Error validating QR code:', error);
      return false;
    }
  };

  const processScannedData = async (data: string, mode: string) => {
    try {
      switch (mode) {
        case 'parcel':
          // Navigate to parcel tracking
          onScan(data);
          onClose();
          break;
        
        case 'pickup':
          // Process pickup code
          onScan(data);
          onClose();
          break;
        
        case 'partner':
          // Navigate to partner details or create delivery
          onScan(data);
          onClose();
          break;
        
        case 'general':
        default:
          // General processing
          onScan(data);
          onClose();
          break;
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      throw error;
    }
  };

  const formatInput = (text: string) => {
    // Convert to uppercase and remove spaces
    const formatted = text.toUpperCase().replace(/\s/g, '');
    setManualInput(formatted);
  };

  const handleClose = () => {
    setManualInput('');
    setShowManualInput(false);
    onClose();
  };

  if (!visible) return null;

      return (
      <Modal visible={visible} animationType="slide">
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
        <LinearGradient
          colors={['#000000', '#1D3557']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>{title}</Text>
                <Text style={styles.headerSubtitle}>{subtitle}</Text>
              </View>
            </View>

            {!showManualInput ? (
              /* Scanner Content */
              <View style={styles.scannerContainer}>
                <View style={styles.scannerContent}>
                  <Feather name="camera" size={64} color="#FFFFFF" />
                  <Text style={styles.scannerTitle}>
                    QR Code Scanner
                  </Text>
                  <Text style={styles.scannerSubtitle}>
                    For now, please use manual input to test the QR code functionality. Camera scanning will be available in the full app version.
                  </Text>
                  
                  <TouchableOpacity
                    style={[styles.manualButton, { backgroundColor: colors.primary }]}
                    onPress={handleManualInput}
                  >
                    <Feather name="edit-3" size={20} color="#FFFFFF" />
                    <Text style={styles.manualButtonText}>Enter QR Code Manually</Text>
                  </TouchableOpacity>

                  <View style={styles.infoContainer}>
                    <Text style={styles.infoTitle}>Supported QR Code Formats:</Text>
                    <Text style={styles.infoText}>• Parcel Tracking: ADE20250719-0186</Text>
                    <Text style={styles.infoText}>• Pickup Codes: PICKUP123</Text>
                    <Text style={styles.infoText}>• Partner IDs: UUID format</Text>
                    <Text style={styles.infoText}>• General: Any text</Text>
                  </View>
                </View>
              </View>
            ) : (
              /* Manual Input Content */
                              <ScrollView 
                  style={styles.scrollView}
                  contentContainerStyle={styles.inputContainer}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                <View style={styles.inputContent}>
                  <Text style={styles.inputTitle}>
                    Enter QR Code or Tracking Number
                  </Text>
                  <Text style={styles.inputSubtitle}>
                    Type the code manually to test the functionality
                  </Text>
                  
                  <View style={styles.inputWrapper}>
                    <Feather name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="Enter QR code or tracking number"
                      placeholderTextColor={colors.placeholder}
                      value={manualInput}
                      onChangeText={formatInput}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      maxLength={50}
                      returnKeyType="search"
                      onSubmitEditing={handleManualSubmit}
                      autoFocus={true}
                    />
                    {manualInput.length > 0 && (
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => setManualInput('')}
                      >
                        <Feather name="x" size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.examplesSection}>
                    <Text style={styles.examplesTitle}>Quick Examples:</Text>
                    <View style={styles.examplesList}>
                      {['ADE20250719-0186', 'ADE20250720-1234', 'ADE20250719-4051', '550e8400-e29b-41d4-a716-446655440000'].map((example) => (
                        <TouchableOpacity
                          key={example}
                          style={[styles.exampleButton, { borderColor: 'rgba(255, 255, 255, 0.3)' }]}
                          onPress={() => setManualInput(example)}
                        >
                          <Text style={styles.exampleText}>{example}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.submitButton, { backgroundColor: colors.primary }]}
                      onPress={handleManualSubmit}
                      disabled={!manualInput.trim() || isLoading}
                    >
                      <Feather 
                        name={isLoading ? "loader" : "search"} 
                        size={20} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.submitButtonText}>
                        {isLoading ? 'Processing...' : 'Process QR Code'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => setShowManualInput(false)}
                    >
                      <Text style={styles.backButtonText}>Back to Scanner</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Loading Overlay */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <View style={styles.loadingContent}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.loadingOverlayText}>
                    Processing QR code...
                  </Text>
                </View>
              </View>
            )}
          </SafeAreaView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  scannerContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  scannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  scannerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    opacity: 0.8,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    marginBottom: 30,
  },
  manualButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  inputTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  inputSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 30,
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
    marginBottom: 20,
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
  examplesSection: {
    marginBottom: 30,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  examplesList: {
    gap: 8,
  },
  exampleButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  exampleText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  actionButtons: {
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
  },
  loadingOverlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
  },
}); 