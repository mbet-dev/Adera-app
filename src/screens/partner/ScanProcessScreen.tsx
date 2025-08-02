import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingIndicator } from '../../components/ui/LoadingIndicator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PartnerStackParamList } from '../../types/navigation';
import { ApiService } from '../../services/core';
import { ParcelStatus, UserRole } from '../../types';

const { width, height } = Dimensions.get('window');

interface ScannedParcel {
  id: string;
  tracking_id: string;
  recipient_name: string;
  status: ParcelStatus;
  total_amount: number;
  payment_status: string;
  pickup_code?: string;
  created_at: string;
}

interface ProcessingAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  status: ParcelStatus;
  requiresConfirmation: boolean;
}

export default function ScanProcessScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<PartnerStackParamList>>();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [manualInput, setManualInput] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [parcel, setParcel] = useState<ScannedParcel | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processingActions: ProcessingAction[] = [
    {
      id: 'facility_received',
      title: 'Facility Received',
      description: 'Confirm parcel received at facility',
      icon: 'package-variant-closed-check',
      color: '#4CAF50',
      status: ParcelStatus.FACILITY_RECEIVED,
      requiresConfirmation: false
    },
    {
      id: 'in_transit',
      title: 'In Transit',
      description: 'Parcel is in transit to hub',
      icon: 'truck-delivery',
      color: '#FF9800',
      status: ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB,
      requiresConfirmation: true
    },
    {
      id: 'pickup_ready',
      title: 'Pickup Ready',
      description: 'Parcel ready for pickup',
      icon: 'package-variant',
      color: '#2196F3',
      status: ParcelStatus.PICKUP_READY,
      requiresConfirmation: false
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Confirm parcel delivered',
      icon: 'check-circle',
      color: '#4CAF50',
      status: ParcelStatus.DELIVERED,
      requiresConfirmation: true
    }
  ];

  const handleScanQR = () => {
    // In a real implementation, this would open the camera
    // For now, we'll simulate scanning with a mock QR code
    const mockQRCode = 'ADERA:AD123456789ABC:1234';
    processQRCode(mockQRCode);
  };

  const handleManualInput = () => {
    if (!manualInput.trim()) {
      Alert.alert('Error', 'Please enter a tracking ID or QR code');
      return;
    }
    processQRCode(manualInput.trim());
    setShowManualInput(false);
  };

  const processQRCode = async (qrData: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setParcel(null);
      setShowActions(false);

      const response = await ApiService.validateQRCode(qrData);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Invalid QR code');
      }

      const { parcel: scannedParcel } = response.data;
      
      if (!scannedParcel) {
        throw new Error('Parcel not found');
      }

      setParcel(scannedParcel);
      setScannedData(qrData);
      setShowActions(true);

    } catch (err) {
      console.error('Error processing QR code:', err);
      setError(err instanceof Error ? err.message : 'Failed to process QR code');
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to process QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessAction = async (action: ProcessingAction) => {
    if (!parcel || !user?.id) return;

    const confirmMessage = action.requiresConfirmation 
      ? `Are you sure you want to mark this parcel as "${action.title.toLowerCase()}"?`
      : null;

    if (confirmMessage) {
      Alert.alert(
        'Confirm Action',
        confirmMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm', onPress: () => updateParcelStatus(action) }
        ]
      );
    } else {
      updateParcelStatus(action);
    }
  };

  const updateParcelStatus = async (action: ProcessingAction) => {
    try {
      setIsProcessing(true);

      const response = await ApiService.updateParcelStatus({
        parcel_id: parcel!.id,
        status: action.status,
        notes: `Status updated to ${action.title} by partner`,
        actor_id: user!.id,
        actor_role: UserRole.PARTNER
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to update parcel status');
      }

      // Create parcel event
      await ApiService.createParcelEvent(
        parcel!.id,
        action.status,
        user!.id,
        UserRole.PARTNER,
        `Parcel ${action.title.toLowerCase()} by partner`
      );

      Alert.alert(
        'Success',
        `Parcel status updated to ${action.title}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setParcel(null);
              setScannedData('');
              setShowActions(false);
              setManualInput('');
            }
          }
        ]
      );

    } catch (err) {
      console.error('Error updating parcel status:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update parcel status');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: ParcelStatus) => {
    switch (status) {
      case ParcelStatus.DELIVERED:
        return colors.success;
      case ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB:
      case ParcelStatus.IN_TRANSIT_TO_PICKUP_POINT:
        return colors.warning;
      case ParcelStatus.CREATED:
      case ParcelStatus.FACILITY_RECEIVED:
        return colors.primary;
      default:
        return colors.text;
    }
  };

  const getStatusText = (status: ParcelStatus) => {
    return status.replace(/_/g, ' ').toLowerCase();
  };

  const renderProcessingAction = (action: ProcessingAction) => (
    <TouchableOpacity
      key={action.id}
      style={[styles.actionCard, { backgroundColor: colors.card }]}
      onPress={() => handleProcessAction(action)}
      disabled={isProcessing}
    >
      <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
        <Icon name={action.icon} size={24} color={action.color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>
          {action.title}
        </Text>
        <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
          {action.description}
        </Text>
      </View>
      <Icon 
        name="chevron-right" 
        size={20} 
        color={colors.textSecondary} 
      />
    </TouchableOpacity>
  );

  return (
    <ScreenLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Scan & Process
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Scan QR codes or enter tracking IDs to process parcels
          </Text>
        </View>

        {/* Scan Section */}
        <Card style={{ backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 16, padding: 20 }}>
          <View style={styles.scanHeader}>
            <Icon name="qrcode-scan" size={32} color={colors.primary} />
            <Text style={[styles.scanTitle, { color: colors.text }]}>
              Scan QR Code
            </Text>
          </View>
          
          <View style={styles.scanButtons}>
            <Button
              title="Scan QR Code"
              onPress={handleScanQR}
              style={{ ...styles.scanButton, backgroundColor: colors.primary }}
              textStyle={{ color: colors.card }}
              disabled={isLoading}
            />
            <Button
              title="Manual Input"
              onPress={() => setShowManualInput(true)}
              style={{ ...styles.scanButton, backgroundColor: colors.card, borderColor: colors.border }}
              textStyle={{ color: colors.text }}
              disabled={isLoading}
            />
          </View>

          {scannedData && (
            <View style={styles.scannedData}>
              <Text style={[styles.scannedLabel, { color: colors.textSecondary }]}>
                Scanned Data:
              </Text>
              <Text style={[styles.scannedText, { color: colors.text }]}>
                {scannedData}
              </Text>
            </View>
          )}
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card style={{ ...styles.loadingCard, backgroundColor: colors.card }}>
            <LoadingIndicator />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Processing QR code...
            </Text>
          </Card>
        )}

        {/* Parcel Details */}
        {parcel && (
          <Card style={{ ...styles.parcelCard, backgroundColor: colors.card }}>
            <View style={styles.parcelHeader}>
              <Icon name="package-variant" size={24} color={colors.primary} />
              <Text style={[styles.parcelTitle, { color: colors.text }]}>
                Parcel Details
              </Text>
            </View>

            <View style={styles.parcelInfo}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Tracking ID:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {parcel.tracking_id}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Recipient:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {parcel.recipient_name}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Status:
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(parcel.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(parcel.status) }]}>
                    {getStatusText(parcel.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Amount:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatCurrency(parcel.total_amount)}
                </Text>
              </View>

              {parcel.pickup_code && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Pickup Code:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {parcel.pickup_code}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Created:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatDate(parcel.created_at)}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Processing Actions */}
        {showActions && parcel && (
          <View style={styles.actionsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Processing Actions
            </Text>
            {processingActions.map(renderProcessingAction)}
          </View>
        )}

        {/* Processing State */}
        {isProcessing && (
          <Card style={{ ...styles.processingCard, backgroundColor: colors.card }}>
            <LoadingIndicator />
            <Text style={[styles.processingText, { color: colors.textSecondary }]}>
              Updating parcel status...
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Manual Input Modal */}
      <Modal
        visible={showManualInput}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManualInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Manual Input
              </Text>
              <TouchableOpacity onPress={() => setShowManualInput(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Enter tracking ID or QR code data
            </Text>

            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border
              }]}
              placeholder="Enter tracking ID or QR code..."
              placeholderTextColor={colors.textSecondary}
              value={manualInput}
              onChangeText={setManualInput}
              autoFocus
              autoCapitalize="characters"
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowManualInput(false)}
                style={{ ...styles.modalButton, backgroundColor: colors.card, borderColor: colors.border }}
                textStyle={{ color: colors.text }}
              />
              <Button
                title="Process"
                onPress={handleManualInput}
                style={{ ...styles.modalButton, backgroundColor: colors.primary }}
                textStyle={{ color: colors.card }}
                disabled={!manualInput.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  scanCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  scanHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  scanButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scanButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  scannedData: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  scannedLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  scannedText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  loadingCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  parcelCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  parcelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  parcelTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  parcelInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actionsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
  },
  processingCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 32,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    padding: 24,
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
}); 