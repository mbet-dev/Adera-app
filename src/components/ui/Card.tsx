import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'medium',
  shadow = 'small',
  borderRadius = 'medium',
}) => {
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none': return styles.paddingNone;
      case 'small': return styles.paddingSmall;
      case 'large': return styles.paddingLarge;
      default: return styles.paddingMedium;
    }
  };

  const getShadowStyle = () => {
    switch (shadow) {
      case 'none': return styles.shadowNone;
      case 'medium': return styles.shadowMedium;
      case 'large': return styles.shadowLarge;
      default: return styles.shadowSmall;
    }
  };

  const getBorderRadiusStyle = () => {
    switch (borderRadius) {
      case 'none': return styles.borderRadiusNone;
      case 'small': return styles.borderRadiusSmall;
      case 'large': return styles.borderRadiusLarge;
      default: return styles.borderRadiusMedium;
    }
  };

  const cardStyle = [
    styles.base,
    getPaddingStyle(),
    getShadowStyle(),
    getBorderRadiusStyle(),
    style,
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Padding variants
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: 12,
  },
  paddingMedium: {
    padding: 16,
  },
  paddingLarge: {
    padding: 24,
  },

  // Shadow variants
  shadowNone: {
    shadowOpacity: 0,
    elevation: 0,
  },
  shadowSmall: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shadowMedium: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shadowLarge: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  // Border radius variants
  borderRadiusNone: {
    borderRadius: 0,
  },
  borderRadiusSmall: {
    borderRadius: 4,
  },
  borderRadiusMedium: {
    borderRadius: 8,
  },
  borderRadiusLarge: {
    borderRadius: 12,
  },
}); 