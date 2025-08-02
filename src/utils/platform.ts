import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Web-specific shadow styles
export const getWebShadow = (opacity: number = 0.1, radius: number = 4, offset: number = 2) => {
  if (isWeb) {
    return {
      boxShadow: `0px ${offset}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    };
  }
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: offset },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.ceil(radius / 2),
  };
};

// Platform-specific styles
export const getPlatformStyles = () => {
  if (isWeb) {
    return {
      // Web-specific overrides
      webContainer: {
        minHeight: '100vh' as any,
        overflow: 'hidden' as any,
        position: 'relative' as any,
        display: 'flex' as any,
        flexDirection: 'column' as any,
      },
      webScrollView: {
        overflow: 'auto' as any,
        height: '100%' as any,
        flex: 1 as any,
      },
    };
  }
  return {};
}; 