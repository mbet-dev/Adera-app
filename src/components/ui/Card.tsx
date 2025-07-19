import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
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
    const shadowStyles = {
      none: { shadowOpacity: 0, elevation: 0 },
      small: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      medium: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      large: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      },
    };

    const boxShadowStyles = {
      none: {},
      small: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      },
      medium: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      large: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
      },
    };

    return Platform.select({
      ios: shadowStyles[shadow],
      android: shadowStyles[shadow],
      web: boxShadowStyles[shadow],
      default: shadowStyles[shadow],
    });
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

  // Shadow variants handled by getShadowStyle
  shadowNone: {},
  shadowSmall: {},
  shadowMedium: {},
  shadowLarge: {},

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