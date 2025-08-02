import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { shadowStyles } from '../../utils/shadowStyles';

interface CardProps {
  children: React.ReactNode;
  variant?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'medium', 
  style,
  onPress 
}) => {
  const { colors } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    shadowStyles[variant],
    style,
  ];

  if (onPress) {
    return (
      <View style={cardStyle} onTouchEnd={onPress}>
        {children}
      </View>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
}); 