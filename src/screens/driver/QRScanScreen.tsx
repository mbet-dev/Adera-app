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
  FlatList,
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
import { DriverStackParamList } from '../../types/navigation';
import { ApiService } from '../../services/core';
import { ParcelStatus, UserRole } from '../../types';

const { width, height } = Dimensions.get('window');

interface ScannedParcel {
  id: string;
  tracking_id: string;
  recipient_name: string;
  status: ParcelStatus;
  total_amount: number;
  pickup_address: string;
  delivery_address: string;
  pickup_code?: string;
  created_at: string;
  operation_type: 'pickup' | 'dropoff';
}

interface BulkScanResult {
  scanned: ScannedParcel[];
  expected: string[];
  missing: string[];
  extra: string[];
  success: boolean;
  message: string;
}

interface ScanOperation {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  type: 'pickup' | 'dropoff';
}

export default function QRScanScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<DriverStackParamList>>();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedParcels, setScannedParcels] = useState<ScannedParcel[]>([]);
  const [manualInput, setManualInput] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkInput, setBulkInput] = useState<string>('');
  const [selectedOperation, setSelectedOperation] = useState<ScanOperation | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanOperations: ScanOperation[] = [
    {
      id: 'pickup',
      title: 'Pickup Scan',
      description: 'Scan parcels for pickup at partner location',
      icon: 'package-variant-closed-plus',
      color: '#4CAF50',
      type: 'pickup'
    },
    {
      id: 'dropoff',
      title: 'Dropoff Scan',
      description: 'Scan parcels for delivery to recipients',
      icon: 'package-variant-closed-check',
      color: '#2196F3',
      type: 'dropoff'
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
    setManualInput('');
  };

  const handleBulkInput = () => {
    if (!bulkInput.trim()) {
      Alert.alert('Error', 'Please enter tracking IDs (one per line)');
      return;
    }
    
    const trackingIds = bulkInput.trim().split('\n').filter(id => id.trim());
    processBulkScan(trackingIds);
    setShowBulkInput(false);
    setBulkInput('');
  };

  const processQRCode = async (qrData: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ApiService.validateQRCode(qrData);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Invalid QR code');
      }

      const { parcel: scannedParcel } = response.data;
      
      if (!scannedParcel) {
        throw new Error('Parcel not found');
      }

      // Determine operation type based on parcel status
      const operationType: 'pickup' | 'dropoff' = 
        scannedParcel.status === ParcelStatus.ASSIGNED_TO_DRIVER ? 'pickup' : 'dropoff';

      const newScannedParcel: ScannedParcel = {
        ...scannedParcel,
        operation_type: operationType
      };

      // Check if already scanned
      const alreadyScanned = scannedParcels.find(p => p.tracking_id === newScannedParcel.tracking_id);
      if (alreadyScanned) {
        Alert.alert('Already Scanned', 'This parcel has already been scanned');
        return;
      }

      setScannedParcels(prev => [...prev, newScannedParcel]);

    } catch (err) {
      console.error('Error processing QR code:', err);
      setError(err instanceof Error ? err.message : 'Failed to process QR code');
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to process QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const processBulkScan = async (trackingIds: string[]) => {
    try {
      setIsLoading(true);
      setError(null);

      const scanned: ScannedParcel[] = [];
      const errors: string[] = [];

      // Process each tracking ID
      for (const trackingId of trackingIds) {
        try {
          const response = await ApiService.validateQRCode(trackingId);
          
          if (response.success && response.data?.parcel) {
            const parcel = response.data.parcel;
            const operationType: 'pickup' | 'dropoff' = 
              parcel.status === ParcelStatus.ASSIGNED_TO_DRIVER ? 'pickup' : 'dropoff';

            scanned.push({
              ...parcel,
              operation_type: operationType
            });
          } else {
            errors.push(`Invalid tracking ID: ${trackingId}`);
          }
        } catch (err) {
          errors.push(`Error processing ${trackingId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      // Mock expected parcels (in real app, this would come from assigned deliveries)
      const expectedTrackingIds = ['AD123456789ABC', 'AD123456789DEF', 'AD123456789GHI'];
      
      const scannedTrackingIds = scanned.map(p => p.tracking_id);
      const missing = expectedTrackingIds.filter(id => !scannedTrackingIds.includes(id));
      const extra = scannedTrackingIds.filter(id => !expectedTrackingIds.includes(id));

      const result: BulkScanResult = {
        scanned,
        expected: expectedTrackingIds,
        missing,
        extra,
        success: missing.length === 0 && extra.length === 0,
        message: errors.length > 0 ? `Processed ${scanned.length} parcels with ${errors.length} errors` : `Successfully processed ${scanned.length} parcels`
      };

      setBulkResult(result);
      setScannedParcels(prev => [...prev, ...scanned]);

      if (errors.length > 0) {
        Alert.alert('Bulk Scan Complete', result.message);
      }

    } catch (err) {
      console.error('Error processing bulk scan:', err);
      setError(err instanceof Error ? err.message : 'Failed to process bulk scan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOperation = async () => {
    if (!selectedOperation || scannedParcels.length === 0) return;

    Alert.alert(
      'Confirm Operation',
      `Are you sure you want to confirm ${selectedOperation.type} for ${scannedParcels.length} parcel(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => processOperation() }
      ]
    );
  };

  const processOperation = async () => {
    try {
      setIsProcessing(true);

      for (const parcel of scannedParcels) {
        const newStatus = selectedOperation?.type === 'pickup' 
          ? ParcelStatus.IN_TRANSIT_TO_PICKUP_POINT 
          : ParcelStatus.DELIVERED;

        await ApiService.updateParcelStatus({
          parcel_id: parcel.id,
          status: newStatus,
          notes: `Parcel ${selectedOperation?.type} confirmed by driver`,
          actor_id: user!.id,
          actor_role: UserRole.DRIVER
        });

        // Create parcel event
        await ApiService.createParcelEvent(
          parcel.id,
          newStatus,
          user!.id,
          UserRole.DRIVER,
          `Parcel ${selectedOperation?.type} confirmed by driver`
        );
      }

      Alert.alert(
        'Success',
        `Successfully processed ${scannedParcels.length} parcel(s)`,
        [
          {
            text: 'OK',
            onPress: () => {
              setScannedParcels([]);
              setSelectedOperation(null);
              setBulkResult(null);
            }
          }
        ]
      );

    } catch (err) {
      console.error('Error processing operation:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to process operation');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeScannedParcel = (trackingId: string) => {
    setScannedParcels(prev => prev.filter(p => p.tracking_id !== trackingId));
  };

  const clearAllScanned = () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all scanned parcels?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {
          setScannedParcels([]);
          setBulkResult(null);
        }}
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
      case ParcelStatus.IN_TRANSIT_TO_PICKUP_POINT:
      case ParcelStatus.OUT_FOR_DELIVERY:
        return colors.warning;
      case ParcelStatus.ASSIGNED_TO_DRIVER:
        return colors.primary;
      default:
        return colors.text;
    }
  };

  const getStatusText = (status: ParcelStatus) => {
    return status.replace(/_/g, ' ').toLowerCase();
  };

  const renderScanOperation = (operation: ScanOperation) => (
    <TouchableOpacity
      key={operation.id}
      style={[styles.operationCard, { backgroundColor: colors.card }]}
      onPress={() => setSelectedOperation(operation)}
    >
      <View style={[styles.operationIcon, { backgroundColor: operation.color + '20' }]}>
        <Icon name={operation.icon} size={24} color={operation.color} />
      </View>
      <View style={styles.operationContent}>
        <Text style={[styles.operationTitle, { color: colors.text }]}>
          {operation.title}
        </Text>
        <Text style={[styles.operationDescription, { color: colors.textSecondary }]}>
          {operation.description}
        </Text>
      </View>
      <Icon 
        name="chevron-right" 
        size={20} 
        color={colors.textSecondary} 
      />
    </TouchableOpacity>
  );

  const renderScannedParcel = ({ item }: { item: ScannedParcel }) => (
    <Card style={{ backgroundColor: colors.card, marginBottom: 8, padding: 16 }}>
      <View style={styles.parcelHeader}>
        <View style={styles.parcelInfo}>
          <Text style={[styles.trackingId, { color: colors.primary }]}>
            {item.tracking_id}
          </Text>
          <Text style={[styles.recipientName, { color: colors.text }]}>
            {item.recipient_name}
          </Text>
          <View style={styles.parcelMeta}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
            <View style={[styles.operationBadge, { backgroundColor: item.operation_type === 'pickup' ? colors.success + '20' : colors.primary + '20' }]}>
              <Text style={[styles.operationText, { color: item.operation_type === 'pickup' ? colors.success : colors.primary }]}>
                {item.operation_type}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: colors.error + '20' }]}
          onPress={() => removeScannedParcel(item.tracking_id)}
        >
          <Icon name="close" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <ScreenLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            QR Code Scanner
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Scan parcels for pickup and dropoff operations
          </Text>
        </View>

        {/* Scan Operations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Select Operation
          </Text>
          {scanOperations.map(renderScanOperation)}
        </View>

        {/* Scan Actions */}
        {selectedOperation && (
          <Card style={{ backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 16, padding: 20 }}>
            <View style={styles.scanHeader}>
              <Icon name={selectedOperation.icon} size={32} color={selectedOperation.color} />
              <Text style={[styles.scanTitle, { color: colors.text }]}>
                {selectedOperation.title}
              </Text>
            </View>
            
            <View style={styles.scanButtons}>
              <Button
                title="Scan QR Code"
                onPress={handleScanQR}
                style={{ ...styles.scanButton, backgroundColor: selectedOperation.color }}
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

            <Button
              title="Bulk Scan"
              onPress={() => setShowBulkInput(true)}
              style={{ ...styles.bulkButton, backgroundColor: colors.warning }}
              textStyle={{ color: colors.card }}
              disabled={isLoading}
            />
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card style={{ backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 16, padding: 32, alignItems: 'center' }}>
            <LoadingIndicator />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Processing scan...
            </Text>
          </Card>
        )}

        {/* Bulk Scan Results */}
        {bulkResult && (
          <Card style={{ backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 16, padding: 20 }}>
            <View style={styles.bulkHeader}>
              <Icon name="package-variant" size={24} color={colors.primary} />
              <Text style={[styles.bulkTitle, { color: colors.text }]}>
                Bulk Scan Results
              </Text>
            </View>

            <View style={styles.bulkStats}>
              <View style={styles.bulkStat}>
                <Text style={[styles.bulkStatValue, { color: colors.success }]}>
                  {bulkResult.scanned.length}
                </Text>
                <Text style={[styles.bulkStatLabel, { color: colors.textSecondary }]}>
                  Scanned
                </Text>
              </View>
              <View style={styles.bulkStat}>
                <Text style={[styles.bulkStatValue, { color: colors.warning }]}>
                  {bulkResult.missing.length}
                </Text>
                <Text style={[styles.bulkStatLabel, { color: colors.textSecondary }]}>
                  Missing
                </Text>
              </View>
              <View style={styles.bulkStat}>
                <Text style={[styles.bulkStatValue, { color: colors.error }]}>
                  {bulkResult.extra.length}
                </Text>
                <Text style={[styles.bulkStatLabel, { color: colors.textSecondary }]}>
                  Extra
                </Text>
              </View>
            </View>

            <Text style={[styles.bulkMessage, { color: colors.textSecondary }]}>
              {bulkResult.message}
            </Text>
          </Card>
        )}

        {/* Scanned Parcels */}
        {scannedParcels.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Scanned Parcels ({scannedParcels.length})
              </Text>
              <TouchableOpacity onPress={clearAllScanned}>
                <Text style={[styles.clearAllText, { color: colors.error }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={scannedParcels}
              renderItem={renderScannedParcel}
              keyExtractor={(item) => item.tracking_id}
              scrollEnabled={false}
              contentContainerStyle={styles.scannedList}
            />

            <View style={styles.confirmContainer}>
              <Button
                title={`Confirm ${selectedOperation?.type || 'Operation'}`}
                onPress={handleConfirmOperation}
                style={{ backgroundColor: colors.success }}
                textStyle={{ color: colors.card }}
                disabled={isProcessing}
              />
            </View>
          </View>
        )}

        {/* Processing State */}
        {isProcessing && (
          <Card style={{ backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 16, padding: 32, alignItems: 'center' }}>
            <LoadingIndicator />
            <Text style={[styles.processingText, { color: colors.textSecondary }]}>
              Processing operation...
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

      {/* Bulk Input Modal */}
      <Modal
        visible={showBulkInput}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBulkInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Bulk Scan Input
              </Text>
              <TouchableOpacity onPress={() => setShowBulkInput(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Enter tracking IDs (one per line)
            </Text>

            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border
              }]}
              placeholder="AD123456789ABC&#10;AD123456789DEF&#10;AD123456789GHI"
              placeholderTextColor={colors.textSecondary}
              value={bulkInput}
              onChangeText={setBulkInput}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowBulkInput(false)}
                style={{ ...styles.modalButton, backgroundColor: colors.card, borderColor: colors.border }}
                textStyle={{ color: colors.text }}
              />
              <Button
                title="Process Bulk"
                onPress={handleBulkInput}
                style={{ ...styles.modalButton, backgroundColor: colors.warning }}
                textStyle={{ color: colors.card }}
                disabled={!bulkInput.trim()}
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  operationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  operationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  operationContent: {
    flex: 1,
  },
  operationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  operationDescription: {
    fontSize: 14,
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
    marginBottom: 12,
  },
  scanButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  bulkButton: {
    marginTop: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
  },
  bulkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bulkTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  bulkStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  bulkStat: {
    alignItems: 'center',
  },
  bulkStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bulkStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  bulkMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  scannedList: {
    paddingHorizontal: 16,
  },
  parcelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  parcelInfo: {
    flex: 1,
  },
  trackingId: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  parcelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  operationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  operationText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
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
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
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