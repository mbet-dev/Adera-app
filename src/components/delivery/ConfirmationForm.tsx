import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useDeliveryCreation } from '../../contexts/DeliveryCreationContext';
import { Button } from '../Button';

interface ConfirmationFormProps {
  onConfirm: () => void;
  onBack: () => void;
}

export function ConfirmationForm({ onConfirm, onBack }: ConfirmationFormProps) {
  const theme = useTheme();
  const { state } = useDeliveryCreation();
  const { packageDetails, recipient, dropoffPoint, pickupPoint, paymentMethod } = state;

  const renderSection = (title: string, content: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      {content}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Confirm Delivery
        </Text>

        {renderSection('Package Details', (
          <View>
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              Size: {packageDetails.size}
            </Text>
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              Weight: {packageDetails.weight} kg
            </Text>
            {packageDetails.description && (
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                Description: {packageDetails.description}
              </Text>
            )}
            {packageDetails.specialHandling && (
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                Special Handling Required
              </Text>
            )}
          </View>
        ))}

        {renderSection('Recipient', (
          <View>
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              Name: {recipient.name}
            </Text>
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              Phone: {recipient.phone}
            </Text>
          </View>
        ))}

        {renderSection('Dropoff Point', (
          <View>
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {dropoffPoint?.profile?.[0]?.full_name || 'Partner'}
            </Text>
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {dropoffPoint?.location}
            </Text>
          </View>
        ))}

        {renderSection('Pickup Point', (
          <View>
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {pickupPoint?.profile?.[0]?.full_name || 'Partner'}
            </Text>
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {pickupPoint?.location}
            </Text>
          </View>
        ))}

        {renderSection('Payment', (
          <View>
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              Method: {paymentMethod?.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              Estimated Cost: ETB 150.00
            </Text>
          </View>
        ))}

        <View style={styles.buttonContainer}>
          <Button
            title="Back"
            onPress={onBack}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title="Confirm"
            onPress={onConfirm}
            variant="primary"
            style={styles.button}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
  },
}); 