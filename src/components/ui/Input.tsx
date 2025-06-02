import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { Text } from './Text';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: any;
  inputStyle?: any;
  labelStyle?: any;
  errorStyle?: any;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[
            styles.input,
            Platform.OS === 'web' && styles.webInput,
            inputStyle,
          ]}
        />
        {rightIcon && (
          <Icon
            name={rightIcon}
            size={24}
            color="#666"
            onPress={onRightIconPress}
            style={styles.icon}
          />
        )}
      </View>
      {error && (
        <Text style={[styles.error, errorStyle]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  webInput: {
    outlineStyle: 'none' as const,
  },
  icon: {
    padding: 12,
  },
  error: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 4,
  },
}); 