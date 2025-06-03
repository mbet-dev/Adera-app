import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return {
    colors: {
      primary: '#007AFF',
      background: isDark ? '#000000' : '#FFFFFF',
      card: isDark ? '#1C1C1E' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#000000',
      border: isDark ? '#38383A' : '#C6C6C8',
      notification: '#FF3B30',
      error: '#FF3B30',
      success: '#34C759',
      warning: '#FF9500',
      placeholder: isDark ? '#8E8E93' : '#C7C7CC'
    },
    isDark,
    toggleTheme
  };
}; 