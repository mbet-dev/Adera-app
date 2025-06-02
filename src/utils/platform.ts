import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const isWeb = Platform.OS === 'web';
export const isNative = !isWeb;
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const getPlatform = () => {
  if (isWeb) return 'web';
  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  return 'unknown';
};

export const getPlatformSpecific = <T>({
  web,
  ios,
  android,
  default: defaultValue,
}: {
  web?: T;
  ios?: T;
  android?: T;
  default: T;
}): T => {
  if (isWeb && web !== undefined) return web;
  if (isIOS && ios !== undefined) return ios;
  if (isAndroid && android !== undefined) return android;
  return defaultValue;
}; 