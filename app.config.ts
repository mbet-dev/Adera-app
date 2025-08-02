import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Adera',
  slug: 'adera-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.adera.app',
    infoPlist: {
      NSCameraUsageDescription: 'This app uses the camera to scan QR codes for parcel tracking and pickup verification.',
      NSMicrophoneUsageDescription: 'This app uses the microphone for video calls and voice messages.'
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.adera.app',
    permissions: [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS'
    ]
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
    output: 'static',
    build: {
      babel: {
        include: ['@expo/vector-icons']
      }
    }
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    telebirrApiKey: process.env.EXPO_PUBLIC_TELEBIRR_API_KEY,
    chapaPublicKey: process.env.EXPO_PUBLIC_CHAPA_PUBLIC_KEY,
    arifpayPublicKey: process.env.EXPO_PUBLIC_ARIFPAY_PUBLIC_KEY,
    platform: process.env.EXPO_PUBLIC_PLATFORM,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    apiVersion: process.env.EXPO_PUBLIC_API_VERSION,
    mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
    osmUrl: process.env.EXPO_PUBLIC_OSM_URL,
    eas: {
      projectId: 'your-project-id'
    }
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-localization',
    'expo-notifications',
    'expo-barcode-scanner',
    'expo-camera',
    'expo-image-picker'
  ]
}); 