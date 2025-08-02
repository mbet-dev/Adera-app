import { useColorScheme } from 'react-native';

interface ThemeColors {
  primary: string;
  background: string;
  text: string;
  border: string;
  error: string;
  success: string;
  disabled: string;
  placeholder: string;
  modalBackground: string;
}

const lightTheme: ThemeColors = {
  primary: '#007AFF',
  background: '#FFFFFF',
  text: '#000000',
  border: '#E5E5E5',
  error: '#FF3B30',
  success: '#34C759',
  disabled: '#999999',
  placeholder: '#999999',
  modalBackground: 'rgba(0, 0, 0, 0.5)',
};

const darkTheme: ThemeColors = {
  primary: '#0A84FF',
  background: '#000000',
  text: '#FFFFFF',
  border: '#333333',
  error: '#FF453A',
  success: '#34C759',
  disabled: '#666666',
  placeholder: '#666666',
  modalBackground: 'rgba(0, 0, 0, 0.7)',
};

export function useTheme() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkTheme : lightTheme;

  return {
    colors,
    colorScheme,
  };
}