import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  error
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format as +251-XXX-XXX-XXXX
    let formatted = '';
    if (cleaned.length > 0) {
      formatted = '+251-';
      if (cleaned.length > 3) {
        formatted += cleaned.slice(0, 3) + '-';
        if (cleaned.length > 6) {
          formatted += cleaned.slice(3, 6) + '-';
          if (cleaned.length > 9) {
            formatted += cleaned.slice(6, 10);
          } else {
            formatted += cleaned.slice(6);
          }
        } else {
          formatted += cleaned.slice(3);
        }
      } else {
        formatted += cleaned;
      }
    }
    return formatted;
  };

  const handleChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    onChange(formatted);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
            color: colors.text
          }
        ]}
        value={value}
        onChangeText={handleChange}
        placeholder="+251-XXX-XXX-XXXX"
        placeholderTextColor={colors.placeholder}
        keyboardType="phone-pad"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16
  },
  error: {
    marginTop: 4,
    fontSize: 12
  }
}); 