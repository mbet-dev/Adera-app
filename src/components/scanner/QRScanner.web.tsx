import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

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
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      // For web, we'll show a message that camera scanning is not available
      // In a real implementation, you would integrate with a web QR scanner library
      setError('QR scanning is not available on web. Please use the mobile app for scanning QR codes.');
    }
  }, [visible]);

  const handleManualInput = () => {
    // For better compatibility, we'll use a custom input approach
    // since Alert.prompt might not work consistently across platforms
    Alert.alert(
      'Enter QR Code',
      'Please enter the QR code manually:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Test ADERA Code', 
          onPress: () => handleQRCodeDetected('ADERA123456')
        },
        { 
          text: 'Test PICKUP Code', 
          onPress: () => handleQRCodeDetected('PICKUP789')
        },
        { 
          text: 'Test Partner ID', 
          onPress: () => handleQRCodeDetected('550e8400-e29b-41d4-a716-446655440000')
        },
        { 
          text: 'Test General Code', 
          onPress: () => handleQRCodeDetected('TEST123')
        }
      ]
    );
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
          // Parcel tracking codes should be alphanumeric and 8-12 characters
          return /^[A-Z0-9]{8,12}$/.test(data);
        
        case 'pickup':
          // Pickup codes should be alphanumeric and 6-10 characters
          return /^[A-Z0-9]{6,10}$/.test(data);
        
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

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#000000', '#1D3557']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Feather name="x" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
          </View>

          {/* Web Scanner Content */}
          <View style={styles.webContainer}>
            <View style={styles.webContent}>
              <Feather name="camera-off" size={64} color="#FFFFFF" />
              <Text style={styles.webTitle}>
                QR Code Scanner
              </Text>
              <Text style={styles.webSubtitle}>
                                 For now, please test the QR code functionality with sample codes. Camera scanning will be available in the full app version.
              </Text>
              
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {error}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.manualButton, { backgroundColor: colors.primary }]}
                onPress={handleManualInput}
              >
                <Feather name="edit-3" size={20} color="#FFFFFF" />
                                 <Text style={styles.manualButtonText}>Test QR Code Functionality</Text>
              </TouchableOpacity>
            </View>
          </View>

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
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
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
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  webContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  webTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  webSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    opacity: 0.8,
  },
  errorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  manualButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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