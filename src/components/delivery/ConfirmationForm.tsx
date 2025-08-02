import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useDeliveryCreation } from '../../contexts/DeliveryCreationContext';
import { Button } from '../Button';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmationFormProps {
  onConfirm: () => void;
  onBack: () => void;
}

export function ConfirmationForm({ onConfirm, onBack }: ConfirmationFormProps) {
  const theme = useTheme();
  const { state } = useDeliveryCreation();
  const { packageDetails, recipient, dropoffPoint, pickupPoint, paymentMethod } = state;

  const renderDetailRow = (label: string, value: string) => (
    <View style={styles.detailRow}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );

  const handleSubmit = useCallback(() => {
    // Implementation of handleSubmit
  }, [onConfirm, state]);

  const submitting = false; // Replace with actual state
  const error = null; // Replace with actual error state

  return (
    <View style={styles.outerContainer}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Confirm Delivery
      </Text>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {renderDetailRow('Package Size', packageDetails.size || 'N/A')}
        {renderDetailRow('Package Weight', `${packageDetails.weight || 0} kg`)}
        {renderDetailRow('Recipient Name', recipient.name || 'N/A')}
        {renderDetailRow('Recipient Phone', recipient.phone || 'N/A')}
        {renderDetailRow('Pickup Point', pickupPoint?.profile?.[0]?.full_name || 'N/A')}
        {renderDetailRow('Dropoff Point', dropoffPoint?.profile?.[0]?.full_name || 'N/A')}
        {renderDetailRow('Payment Method', paymentMethod || 'N/A')}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <Button
            title="Back"
            onPress={onBack}
            variant="secondary"
            style={styles.button}
            disabled={submitting}
          />
          <Button
            title={submitting ? 'Submitting...' : 'Confirm & Submit'}
            onPress={handleSubmit}
            variant="primary"
            style={styles.button}
            disabled={submitting}
          />
        </View>
        {submitting && <ActivityIndicator style={styles.loader} color={theme.colors.primary} />}
        {error && <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'space-between',
    padding: 16,
  },
  container: {
    flex: 1,
  },
  content: {
    // No padding here
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  loader: {
    marginTop: 16,
  },
  error: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
}); 