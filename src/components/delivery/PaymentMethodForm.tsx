import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useDeliveryCreation } from '../../contexts/DeliveryCreationContext';
import { Button } from '../Button';
import type { PaymentMethod } from '../../types/index';

interface PaymentMethodFormProps {
  onNext: () => void;
  onBack: () => void;
}

const PAYMENT_METHODS: { label: string; value: PaymentMethod; icon: string }[] = [
  { label: 'Cash at DropOff', value: 'cash_at_dropoff', icon: 'cash' },
  { label: 'Adera Wallet', value: 'wallet', icon: 'wallet' },
  { label: 'Mobile Banking', value: 'mobile_banking', icon: 'phone-portrait' },
  { label: 'POS (Card Payment)', value: 'pos', icon: 'card' },
];

export function PaymentMethodForm({ onNext, onBack }: PaymentMethodFormProps) {
  const theme = useTheme();
  const { state, setPaymentMethod } = useDeliveryCreation();
  const { paymentMethod, dropoffPoint } = state;

  const [error, setError] = React.useState<string>();

  const handleMethodSelect = React.useCallback((method: PaymentMethod) => {
    setPaymentMethod(method as any); // Accepts PaymentMethod | null, but we only pass valid PaymentMethod
    setError(undefined);
  }, [setPaymentMethod]);

  const validate = React.useCallback(() => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return false;
    }
    return true;
  }, [paymentMethod]);

  const handleNext = React.useCallback(() => {
    if (validate()) {
      onNext();
    }
  }, [validate, onNext]);

  const isMethodAvailable = React.useCallback((method: PaymentMethod) => {
    if (!dropoffPoint || !dropoffPoint.accepted_payment_methods) return false;
    return (dropoffPoint.accepted_payment_methods as PaymentMethod[]).includes(method);
  }, [dropoffPoint]);

  return (
    <View style={styles.outerContainer}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Select Payment Method
      </Text>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          {PAYMENT_METHODS.map(method => {
            const isAvailable = isMethodAvailable(method.value);
            const isSelected = paymentMethod !== null && (paymentMethod as PaymentMethod) === method.value;

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
          {error && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {error}
            </Text>
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
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
    // No padding here, handled by outer container
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    // This style was missing
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
  paymentMethod: {
    borderWidth: 1,
  },
}); 