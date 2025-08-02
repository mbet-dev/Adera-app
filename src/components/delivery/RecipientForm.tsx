import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useDeliveryCreation } from '../../contexts/DeliveryCreationContext';
import { Button } from '../Button';
import { supabase } from '../../lib/supabase';

interface RecipientFormProps {
  onNext: () => void;
  onBack: () => void;
}

export function RecipientForm({ onNext, onBack }: RecipientFormProps) {
  const theme = useTheme();
  const { state, setRecipient } = useDeliveryCreation();
  const { recipient } = state;

  const [errors, setErrors] = React.useState<{
    name?: string;
    phone?: string;
  }>({});

  const [phoneCheck, setPhoneCheck] = React.useState<{
    checking: boolean;
    isNewUser: boolean;
    message?: string;
    checkedPhone?: string;
  }>({ checking: false, isNewUser: false });

  const handleNameChange = React.useCallback((text: string) => {
    setRecipient({ name: text });
    setErrors(prev => ({ ...prev, name: undefined }));
  }, [setRecipient]);

  const handlePhoneChange = React.useCallback((text: string) => {
    // only allow digits, max 9
    const numericValue = text.replace(/\D/g, '');
    if (numericValue.length <= 9) {
      setRecipient({ phone: `+251${numericValue}` });
      setErrors(prev => ({ ...prev, phone: undefined }));
      setPhoneCheck({ checking: false, isNewUser: false, message: undefined, checkedPhone: undefined });
    }
  }, [setRecipient]);

  const checkUserExists = React.useCallback(async () => {
    if (!recipient.phone || !/^\+251[0-9]{9}$/.test(recipient.phone)) {
      setErrors(prev => ({ ...prev, phone: 'Please enter a valid 9-digit number.' }));
      return;
    }

    setPhoneCheck({ checking: true, isNewUser: false, message: undefined, checkedPhone: recipient.phone });
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('phone', recipient.phone)
        .maybeSingle();

      if (error) {
        setPhoneCheck({ checking: false, isNewUser: false, message: 'Error checking phone number.', checkedPhone: recipient.phone });
        return;
      }

      if (!data) {
        setPhoneCheck({ checking: false, isNewUser: true, message: 'This is a new recipient. They will be registered.', checkedPhone: recipient.phone });
      } else {
        setPhoneCheck({ checking: false, isNewUser: false, message: 'Recipient found.', checkedPhone: recipient.phone });
      }

    } catch (e) {
      setPhoneCheck({ checking: false, isNewUser: false, message: 'Error checking phone number.', checkedPhone: recipient.phone });
    }
  }, [recipient.phone]);

  const validate = React.useCallback(() => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!recipient.name?.trim()) {
      newErrors.name = 'Please enter recipient name';
    }

    if (!recipient.phone?.trim()) {
      newErrors.phone = 'Please enter recipient phone number';
    } else if (!/^\+251[0-9]{9}$/.test(recipient.phone)) {
      newErrors.phone = 'Please enter a valid 9-digit number after +251.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [recipient]);

  const handleNext = React.useCallback(async () => {
    if (validate()) {
      // The existence check is now informational, so we don't need to await it here.
      // The check onBlur is sufficient for user feedback.
      onNext();
    }
  }, [validate, onNext]);

  return (
    <View style={styles.outerContainer}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Recipient Details
      </Text>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Full Name
          </Text>
          <TextInput
            style={[
              styles.input,
              { 
                borderColor: errors.name ? theme.colors.error : theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="Enter recipient's full name"
            placeholderTextColor={theme.colors.text + '80'}
            value={recipient.name}
            onChangeText={handleNameChange}
          />
          {errors.name && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {errors.name}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Phone Number
          </Text>
          <View style={[
            styles.phoneInputContainer,
            {
              borderColor: errors.phone ? theme.colors.error : theme.colors.border,
            }
          ]}>
            <Text style={[styles.phonePrefix, { color: theme.colors.text }]}>+251</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                },
              ]}
              placeholder="912345678"
              placeholderTextColor={theme.colors.text + '80'}
              value={recipient.phone?.substring(4)}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={9}
              onBlur={checkUserExists}
            />
          </View>

          {errors.phone && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {errors.phone}
            </Text>
          )}
          {phoneCheck.checking && (
            <Text style={[styles.checking, { color: theme.colors.primary }]}>
              Checking...
            </Text>
          )}
          {phoneCheck.message && phoneCheck.checkedPhone === recipient.phone && (
             <Text style={[styles.info, { color: phoneCheck.isNewUser ? theme.colors.success : theme.colors.text  }]}>
               {phoneCheck.message}
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  phonePrefix: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingHorizontal: 0, // already have padding in container
    borderWidth: 0, // container has border
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  info: {
    fontSize: 12,
    marginTop: 4,
  },
  checking: {
    fontSize: 12,
    marginTop: 4,
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