import { Platform } from 'react-native';

export interface ShadowStyle {
  shadowColor?: string;
  shadowOffset?: {
    width: number;
    height: number;
  };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
  boxShadow?: string;
}

export const createShadowStyle = (
  shadowColor: string = '#000',
  shadowOffset: { width: number; height: number } = { width: 0, height: 2 },
  shadowOpacity: number = 0.1,
  shadowRadius: number = 4,
  elevation: number = 2
): ShadowStyle => {
  if (Platform.OS === 'web') {
    // For web, use boxShadow with proper alpha calculation
    const alpha = Math.round(shadowOpacity * 255);
    const hexAlpha = alpha.toString(16).padStart(2, '0');
    const colorWithAlpha = shadowColor + hexAlpha;
    const boxShadow = `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${colorWithAlpha}`;
    return {
      boxShadow,
    };
  } else {
    // For mobile, use shadow props
    return {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
      elevation,
    };
  }
};

// Predefined shadow styles
export const shadowStyles = {
  none: createShadowStyle('#000', { width: 0, height: 0 }, 0, 0, 0),
  small: createShadowStyle('#000', { width: 0, height: 1 }, 0.05, 2, 1),
  medium: createShadowStyle('#000', { width: 0, height: 2 }, 0.1, 4, 2),
  large: createShadowStyle('#000', { width: 0, height: 4 }, 0.15, 8, 4),
  extraLarge: createShadowStyle('#000', { width: 0, height: 8 }, 0.2, 16, 8),
}; 