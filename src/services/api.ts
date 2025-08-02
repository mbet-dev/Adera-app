import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Service for handling all data operations
export class ApiService {
  // Wallet operations
  static async getWalletBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (error) {
        // If user doesn't exist, return 0 and don't throw error
        if (error.code === 'PGRST116') {
          console.log('User not found in users table, returning default balance');
          return 0;
        }
        throw error;
      }
      return data?.wallet_balance || 0;
    } catch (error: any) {
      console.error('Error fetching wallet balance:', error.message || 'Unknown error');
      // Return cached balance if available
      const cachedBalance = await AsyncStorage.getItem(`wallet_balance_${userId}`);
      return cachedBalance ? parseFloat(cachedBalance) : 0;
    }
  }

  static async updateWalletBalance(userId: string, newBalance: number): Promise<void> {
    try {
      // First check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingUser) {
        // Create user record if it doesn't exist
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            wallet_balance: newBalance,
            created_at: new Date().toISOString()
          });

        if (createError) {
          console.error('Error creating user record:', createError);
          // Don't throw error, just cache the balance
          await AsyncStorage.setItem(`wallet_balance_${userId}`, newBalance.toString());
          return;
        }
      } else {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({ wallet_balance: newBalance })
          .eq('id', userId);

        if (error) throw error;
      }
      
      // Cache the new balance
      await AsyncStorage.setItem(`wallet_balance_${userId}`, newBalance.toString());
    } catch (error: any) {
      console.error('Error updating wallet balance:', error.message || 'Unknown error');
      // Cache the balance locally even if database update fails
      await AsyncStorage.setItem(`wallet_balance_${userId}`, newBalance.toString());
    }
  }

  // Parcel operations
  static async getRecentParcels(userId: string, limit: number = 5): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('parcels')
        .select(`
          id,
          tracking_id,
          status,
          recipient_name,
          created_at,
          total_amount
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent parcels:', error);
        return [];
      }
      return data || [];
    } catch (error: any) {
      console.error('Error fetching recent parcels:', error.message || 'Unknown error');
      return [];
    }
  }

  static async getParcelDetails(trackingId: string): Promise<any> {
    try {
      console.log('API: Fetching parcel details for tracking ID:', trackingId);
      
      const { data, error } = await supabase
        .from('parcels')
        .select(`
          *,
          dropoff_partner:partners!dropoff_partner_id(business_name, address, latitude, longitude),
          pickup_partner:partners!pickup_partner_id(business_name, address, latitude, longitude),
          assigned_driver:drivers!assigned_driver_id(
            user_id,
            current_latitude,
            current_longitude,
            users(first_name, last_name, phone)
          )
        `)
        .eq('tracking_id', trackingId)
        .single();

      if (error) {
        console.error('API: Supabase error:', error);
        if (error.code === 'PGRST116') {
          throw new Error('Parcel not found');
        }
        throw error;
      }
      
      console.log('API: Parcel data retrieved successfully:', data);
      return data;
    } catch (error: any) {
      console.error('API: Error fetching parcel details:', error.message || 'Unknown error');
      throw error;
    }
  }

  static async getParcelEvents(parcelId: string): Promise<any[]> {
    try {
      console.log('API: Fetching parcel events for parcel ID:', parcelId);
      
      const { data, error } = await supabase
        .from('parcel_events')
        .select('*')
        .eq('parcel_id', parcelId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('API: Error fetching parcel events:', error);
        return [];
      }
      
      console.log('API: Parcel events retrieved successfully:', data);
      return data || [];
    } catch (error: any) {
      console.error('API: Error fetching parcel events:', error.message || 'Unknown error');
      return [];
    }
  }

  // Partner operations
  static async getNearbyPartners(limit: number = 3): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select(`
          id,
          business_name,
          address,
          latitude,
          longitude,
          accepted_payment_methods,
          is_approved,
          is_active,
          phone,
          users(first_name, last_name)
        `)
        .eq('is_approved', true)
        .eq('is_active', true)
        .limit(limit);

      if (error) {
        console.error('Error fetching nearby partners:', error);
        return [];
      }
      return data || [];
    } catch (error: any) {
      console.error('Error fetching nearby partners:', error.message || 'Unknown error');
      return [];
    }
  }

  // Transaction operations
  static async getTransactions(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
      return data || [];
    } catch (error: any) {
      console.error('Error fetching transactions:', error.message || 'Unknown error');
      return [];
    }
  }

  static async addTransaction(transactionData: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert(transactionData);

      if (error) {
        console.error('Error adding transaction:', error);
        // Don't throw error, just log it
      }
    } catch (error: any) {
      console.error('Error adding transaction:', error.message || 'Unknown error');
      // Don't throw error, just log it
    }
  }

  // Payment operations
  static async processPayment(paymentData: any): Promise<any> {
    try {
      // This would integrate with actual payment gateways
      // For now, we'll simulate the payment process
      const { amount, paymentMethod, userId } = paymentData;
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      return {
        success: true,
        transactionId: `txn_${Date.now()}`,
        amount,
        paymentMethod
      };
    } catch (error: any) {
      console.error('Error processing payment:', error.message || 'Unknown error');
      throw error;
    }
  }

  // QR Code operations
  static async validateQRCode(qrData: string): Promise<any> {
    try {
      // Validate different types of QR codes
      if (qrData.startsWith('ADERA')) {
        // Parcel tracking code
        return {
          type: 'parcel',
          data: qrData,
          valid: true
        };
      } else if (qrData.startsWith('PICKUP')) {
        // Pickup code
        return {
          type: 'pickup',
          data: qrData,
          valid: true
        };
      } else if (qrData.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // Partner ID
        return {
          type: 'partner',
          data: qrData,
          valid: true
        };
      } else {
        // General QR code
        return {
          type: 'general',
          data: qrData,
          valid: true
        };
      }
    } catch (error: any) {
      console.error('Error validating QR code:', error.message || 'Unknown error');
      return {
        type: 'unknown',
        data: qrData,
        valid: false
      };
    }
  }

  // Offline support
  static async cacheData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error: any) {
      console.error('Error caching data:', error.message || 'Unknown error');
    }
  }

  static async getCachedData(key: string): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error: any) {
      console.error('Error getting cached data:', error.message || 'Unknown error');
      return null;
    }
  }

  static async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error: any) {
      console.error('Error clearing cache:', error.message || 'Unknown error');
    }
  }
}

// Export individual functions for easier use
export const {
  getWalletBalance,
  updateWalletBalance,
  getRecentParcels,
  getParcelDetails,
  getParcelEvents,
  getNearbyPartners,
  getTransactions,
  addTransaction,
  processPayment,
  validateQRCode,
  cacheData,
  getCachedData,
  clearCache
} = ApiService; 