import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useDeliveryCreation } from '../../contexts/DeliveryCreationContext';
import { Button } from '../Button';
import { PaymentMethod } from '../../types/database';

interface PaymentMethodFormProps {
  onNext: () => void;
  onBack: () => void;
}

const PAYMENT_METHODS: { label: string; value: PaymentMethod; icon: string }[] = [
  { label: 'Sender Wallet', value: 'sender_wallet', icon: 'wallet' },
  { label: 'Sender Bank', value: 'sender_bank', icon: 'card' },
  { label: 'Dropoff Partner', value: 'dropoff_partner', icon: 'business' },
  { label: 'Receiver Wallet', value: 'receiver_wallet', icon: 'wallet' },
  { label: 'Receiver Bank', value: 'receiver_bank', icon: 'card' },
  { label: 'Cash on Delivery', value: 'cash_on_delivery', icon: 'cash' },
];

export function PaymentMethodForm({ onNext, onBack }: PaymentMethodFormProps) {
  const theme = useTheme();
  const { state, setPaymentMethod } = useDeliveryCreation();
  const { paymentMethod, dropoffPoint } = state;

  const [error, setError] = React.useState<string>();

  const handleMethodSelect = React.useCallback((method: PaymentMethod) => {
    setPaymentMethod(method);
    setError(undefined);
  }, [setPaymentMethod]);

  const validate = React.useCallback(() => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return false;
    }

    if (paymentMethod === 'dropoff_partner' && !dropoffPoint?.accepts_proxy_payment) {
      setError('Selected dropoff point does not accept proxy payments');
      return false;
    }

    return true;
  }, [paymentMethod, dropoffPoint]);

  const handleNext = React.useCallback(() => {
    if (validate()) {
      onNext();
    }
  }, [validate, onNext]);

  const isMethodAvailable = React.useCallback((method: PaymentMethod) => {
    if (method === 'dropoff_partner') {
      return dropoffPoint?.accepts_proxy_payment;
    }
    return true;
  }, [dropoffPoint]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Payment Method
        </Text>

        <View style={styles.methodsGrid}>
          {PAYMENT_METHODS.map(method => {
            const isAvailable = isMethodAvailable(method.value);
            const isSelected = paymentMethod === method.value;

            return (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.methodCard,
                  {
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    opacity: isAvailable ? 1 : 0.5,
                  },
                ]}
                onPress={() => isAvailable && handleMethodSelect(method.value)}
                disabled={!isAvailable}
              >
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={isSelected ? theme.colors.primary : theme.colors.text}
                />
                <Text
                  style={[
                    styles.methodLabel,
                    {
                      color: isSelected ? theme.colors.primary : theme.colors.text,
                    },
                  ]}
                >
                  {method.label}
                </Text>
                {!isAvailable && (
                  <Text style={[styles.unavailableText, { color: theme.colors.error }]}>
                    Not Available
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {error && (
          <Text style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Back"
            onPress={onBack}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title="Next"
            onPress={handleNext}
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
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  methodCard: {
    width: '48%',
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  unavailableText: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
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