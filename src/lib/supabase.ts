import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Prefer process.env (during build-time) but fall back to Expo constants at runtime (web/native)
const envSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const envSupabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const consts = Constants?.expoConfig ?? Constants?.manifest; // manifest for classic build, expoConfig for EAS dev/build
const extra = consts?.extra as Record<string, any> | undefined;

const supabaseUrl = envSupabaseUrl || extra?.supabaseUrl || 'https://placeholder.supabase.co';
const supabaseAnonKey = envSupabaseAnon || extra?.supabaseAnonKey || 'public-anon-key';

// Debugging: Log the first few characters of the credentials so we can verify
// they are loaded on both web and native without leaking the full secret.
console.log('[supabase] Init', {
  url: supabaseUrl,
  anonKeyPreview: supabaseAnonKey ? supabaseAnonKey.slice(0, 6) + '...' : undefined,
  fromEnv: {
    url: !!envSupabaseUrl,
    anonKey: !!envSupabaseAnon
  },
  fromExtra: {
    url: !!extra?.supabaseUrl,
    anonKey: !!extra?.supabaseAnonKey
  },
});

if (!supabaseUrl || !supabaseAnonKey) {
  // During development we don't want the entire bundle to fail if env vars are missing. Instead, create
  // a disabled client and log a clear warning. Most Supabase calls will then fail gracefully at runtime.
  console.warn(
    '[supabase] Missing credentials: please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in a .env file or app.config extra. Using a disabled client for now.'
  );
}

// Use AsyncStorage (secure on native) and default localStorage on web
const authConfig = Platform.OS === 'web'
  ? {
      autoRefreshToken: true,
      persistSession: true,
    }
  : {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: authConfig }); 