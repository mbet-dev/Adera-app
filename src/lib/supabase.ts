import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Supabase configuration with fallbacks for development
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Check if we're in a web environment and log configuration
if (typeof window !== 'undefined') {
  console.log('Web environment detected');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key configured:', !!supabaseAnonKey);
}

// Create Supabase client with enhanced error handling
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'adera-app-web',
    },
  },
});

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error.message || 'Unknown error');
  } else {
    console.log('Supabase connected successfully');
  }
});

// =====================================================
// AUTHENTICATION HELPERS
// =====================================================

export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Reset password
  resetPassword: async (email: string, options?: { redirectTo?: string }) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: options?.redirectTo || 'adera://reset-password',
    });
    return { data, error };
  },

  // Update password
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return { data, error };
  },

  // Update user profile
  updateProfile: async (updates: any) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });
    return { data, error };
  },
};

// =====================================================
// DATABASE HELPERS
// =====================================================

export const db = {
  // Users
  users: {
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    getByEmail: async (email: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      return { data, error };
    },

    create: async (userData: any) => {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      return { data, error };
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // Parcels
  parcels: {
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('parcels')
        .select(`
          *,
          sender:users!parcels_sender_id_fkey(*),
          dropoff_partner:partners!parcels_dropoff_partner_id_fkey(*),
          pickup_partner:partners!parcels_pickup_partner_id_fkey(*),
          assigned_driver:drivers!parcels_assigned_driver_id_fkey(*)
        `)
        .eq('id', id)
        .single();
      return { data, error };
    },

    getByTrackingId: async (trackingId: string) => {
      const { data, error } = await supabase
        .from('parcels')
        .select(`
          *,
          sender:users!parcels_sender_id_fkey(*),
          dropoff_partner:partners!parcels_dropoff_partner_id_fkey(*),
          pickup_partner:partners!parcels_pickup_partner_id_fkey(*),
          assigned_driver:drivers!parcels_assigned_driver_id_fkey(*)
        `)
        .eq('tracking_id', trackingId)
        .single();
      return { data, error };
    },

    getByUser: async (userId: string) => {
      const { data, error } = await supabase
        .from('parcels')
        .select(`
          *,
          dropoff_partner:partners!parcels_dropoff_partner_id_fkey(*),
          pickup_partner:partners!parcels_pickup_partner_id_fkey(*),
          assigned_driver:drivers!parcels_assigned_driver_id_fkey(*)
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    create: async (parcelData: any) => {
      const { data, error } = await supabase
        .from('parcels')
        .insert(parcelData)
        .select()
        .single();
      return { data, error };
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('parcels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    updateStatus: async (id: string, status: string, actorId: string, actorRole: string, notes?: string) => {
      // Call the database function to update status and create event
      const { data, error } = await supabase.rpc('update_parcel_status', {
        p_parcel_id: id,
        p_new_status: status,
        p_actor_id: actorId,
        p_actor_role: actorRole,
        p_notes: notes
      });
      return { data, error };
    },
  },

  // Parcel Events
  parcelEvents: {
    getByParcelId: async (parcelId: string) => {
      const { data, error } = await supabase
        .from('parcel_events')
        .select(`
          *,
          actor:users!parcel_events_actor_id_fkey(*)
        `)
        .eq('parcel_id', parcelId)
        .order('created_at', { ascending: true });
      return { data, error };
    },

    create: async (eventData: any) => {
      const { data, error } = await supabase
        .from('parcel_events')
        .insert(eventData)
        .select()
        .single();
      return { data, error };
    },
  },

  // Partners
  partners: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_approved', true)
        .eq('is_active', true);
      return { data, error };
    },

    getNearby: async (latitude: number, longitude: number, radiusKm: number = 10) => {
      const { data, error } = await supabase.rpc('get_nearby_partners', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_radius_km: radiusKm
      });
      return { data, error };
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('partners')
        .select(`
          *,
          user:users!partners_user_id_fkey(*)
        `)
        .eq('id', id)
        .single();
      return { data, error };
    },

    create: async (partnerData: any) => {
      const { data, error } = await supabase
        .from('partners')
        .insert(partnerData)
        .select()
        .single();
      return { data, error };
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // Drivers
  drivers: {
    getAvailable: async () => {
      const { data, error } = await supabase
        .from('drivers')
        .select(`
          *,
          user:users!drivers_user_id_fkey(*)
        `)
        .eq('is_available', true)
        .eq('is_approved', true)
        .eq('is_active', true);
      return { data, error };
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('drivers')
        .select(`
          *,
          user:users!drivers_user_id_fkey(*)
        `)
        .eq('id', id)
        .single();
      return { data, error };
    },

    updateLocation: async (id: string, latitude: number, longitude: number) => {
      const { data, error } = await supabase
        .from('drivers')
        .update({
          current_latitude: latitude,
          current_longitude: longitude,
          last_location_update: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // Transactions
  transactions: {
    getByParcelId: async (parcelId: string) => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('parcel_id', parcelId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    create: async (transactionData: any) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();
      return { data, error };
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // Shops
  shops: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          partner:partners!shops_partner_id_fkey(*)
        `)
        .eq('is_approved', true)
        .eq('is_active', true);
      return { data, error };
    },

    getByPartnerId: async (partnerId: string) => {
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          partner:partners!shops_partner_id_fkey(*)
        `)
        .eq('partner_id', partnerId)
        .single();
      return { data, error };
    },

    create: async (shopData: any) => {
      const { data, error } = await supabase
        .from('shops')
        .insert(shopData)
        .select()
        .single();
      return { data, error };
    },
  },

  // Shop Items
  shopItems: {
    getByShopId: async (shopId: string) => {
      const { data, error } = await supabase
        .from('shop_items')
        .select(`
          *,
          category:shop_categories!shop_items_category_id_fkey(*)
        `)
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('shop_items')
        .select(`
          *,
          category:shop_categories!shop_items_category_id_fkey(*),
          shop:shops!shop_items_shop_id_fkey(*)
        `)
        .eq('id', id)
        .single();
      return { data, error };
    },

    create: async (itemData: any) => {
      const { data, error } = await supabase
        .from('shop_items')
        .insert(itemData)
        .select()
        .single();
      return { data, error };
    },
  },

  // Messages
  messages: {
    getByParcelId: async (parcelId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(*),
          receiver:users!messages_receiver_id_fkey(*)
        `)
        .eq('parcel_id', parcelId)
        .order('created_at', { ascending: true });
      return { data, error };
    },

    create: async (messageData: any) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
      return { data, error };
    },
  },

  // Notifications
  notifications: {
    getByUserId: async (userId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    markAsRead: async (id: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    create: async (notificationData: any) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();
      return { data, error };
    },
  },
};

// =====================================================
// REALTIME SUBSCRIPTIONS
// =====================================================

export const realtime = {
  // Subscribe to parcel status changes
  subscribeToParcel: (parcelId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`parcel:${parcelId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'parcels',
          filter: `id=eq.${parcelId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to new parcel events
  subscribeToParcelEvents: (parcelId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`parcel_events:${parcelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'parcel_events',
          filter: `parcel_id=eq.${parcelId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to new messages
  subscribeToMessages: (parcelId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`messages:${parcelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `parcel_id=eq.${parcelId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to notifications
  subscribeToNotifications: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};

// =====================================================
// STORAGE HELPERS
// =====================================================

export const storage = {
  // Upload image
  uploadImage: async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
    return { data, error };
  },

  // Get public URL
  getPublicUrl: (path: string) => {
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete image
  deleteImage: async (path: string) => {
    const { data, error } = await supabase.storage
      .from('images')
      .remove([path]);
    return { data, error };
  },
};

export default supabase; 