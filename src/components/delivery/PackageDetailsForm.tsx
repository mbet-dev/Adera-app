import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { PackageSize, useDeliveryCreation } from '../../contexts/DeliveryCreationContext';
import { Button } from '../ui/Button';

const PACKAGE_SIZES: { label: string; value: PackageSize }[] = [
  { label: 'Document', value: 'document' },
  { label: 'Small Package', value: 'small' },
  { label: 'Medium Package', value: 'medium' },
  { label: 'Big Package', value: 'big' },
];

interface PackageDetailsFormProps {
  onNext: () => void;
  onBack: () => void;
}

export function PackageDetailsForm({ onNext, onBack }: PackageDetailsFormProps) {
  const theme = useTheme();
  const { state, setPackageDetails } = useDeliveryCreation();
  const { packageDetails } = state;

  const [errors, setErrors] = React.useState<{
    size?: string;
    weight?: string;
  }>({});

  const handleSizeSelect = React.useCallback((size: PackageSize) => {
    setPackageDetails({ size });
    setErrors(prev => ({ ...prev, size: undefined }));
  }, [setPackageDetails]);

  const handleWeightChange = React.useCallback((text: string) => {
    const weight = parseFloat(text);
    setPackageDetails({ weight: isNaN(weight) ? 0 : weight });
    setErrors(prev => ({ ...prev, weight: undefined }));
  }, [setPackageDetails]);

  const handleSpecialHandlingChange = React.useCallback((value: boolean) => {
    setPackageDetails({ specialHandling: value });
  }, [setPackageDetails]);

  const handleDescriptionChange = React.useCallback((text: string) => {
    setPackageDetails({ description: text });
  }, [setPackageDetails]);

  const validate = React.useCallback(() => {
    const newErrors: { size?: string; weight?: string } = {};

    if (!packageDetails.size) {
      newErrors.size = 'Please select a package size';
    }

    if (!packageDetails.weight || packageDetails.weight <= 0) {
      newErrors.weight = 'Please enter a valid weight';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [packageDetails]);

  const handleNext = React.useCallback(() => {
    if (validate()) {
      onNext();
    }
  }, [validate, onNext]);

  return (
    <View style={styles.outerContainer}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Package Details
      </Text>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Package Size
          </Text>
          <View style={styles.sizeButtons}>
            {PACKAGE_SIZES.map(({ label, value }) => (
              <Button
                key={value}
                title={label}
                onPress={() => handleSizeSelect(value)}
                variant={packageDetails.size === value ? 'primary' : 'secondary'}
                style={styles.sizeButton}
              />
            ))}
          </View>
          {errors.size && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {errors.size}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Weight (kg)
          </Text>
          <TextInput
            style={[
              styles.input,
              { 
                color: theme.colors.text,
                borderColor: errors.weight ? theme.colors.error : theme.colors.border,
                backgroundColor: theme.colors.background,
              },
            ]}
            value={packageDetails.weight?.toString() || ''}
            onChangeText={handleWeightChange}
            keyboardType="decimal-pad"
            placeholder="Enter package weight"
            placeholderTextColor={theme.colors.placeholder}
          />
          {errors.weight && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {errors.weight}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.switchContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Requires Special Handling
            </Text>
            <Switch
              value={packageDetails.specialHandling || false}
              onValueChange={handleSpecialHandlingChange}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Description (Optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                color: theme.colors.text,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background,
              },
            ]}
            value={packageDetails.description || ''}
            onChangeText={handleDescriptionChange}
            placeholder="Enter package description"
            placeholderTextColor={theme.colors.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
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
  sizeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  sizeButton: {
    flex: 1,
    minWidth: 120,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 8,
    paddingBottom: 8,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  error: {
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
    gap: 16,
  },
  button: {
    flex: 1,
    height: 48,
  },
}); 