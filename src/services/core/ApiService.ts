import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  Parcel, 
  Partner, 
  Driver, 
  Transaction, 
  ParcelEvent, 
  CreateParcelRequest,
  UpdateParcelStatusRequest,
  PaymentRequest,
  PaymentResponse,
  ParcelStatus,
  PaymentStatus,
  UserRole,
  Shop,
  ShopItem,
  ShopOrder,
  ShopCategory,
  ShopTransaction
} from '../../types';

// API Response wrapper for consistent error handling
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
  cached?: boolean;
}

// API Error types
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  OFFLINE_ERROR = 'OFFLINE_ERROR'
}

export class ApiError extends Error {
  constructor(
    message: string,
    public type: ApiErrorType,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Enhanced API Service with comprehensive business logic
export class ApiService {
  private static readonly CACHE_PREFIX = 'adera_cache_';
  private static readonly CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private static async isOnline(): Promise<boolean> {
    try {
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private static async cacheData<T>(key: string, data: T): Promise<void> {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + this.CACHE_EXPIRY
      };
      await AsyncStorage.setItem(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  private static async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      if (Date.now() > cacheItem.expiry) {
        await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to get cached data:', error);
      return null;
    }
  }

  private static async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  private static handleApiError(error: any, operation: string): ApiError {
    console.error(`API Error in ${operation}:`, error.message || 'Unknown error');

    if (error.code === 'PGRST116') {
      return new ApiError('Resource not found', ApiErrorType.NOT_FOUND, 404, error);
    }

    if (error.code === 'PGRST301') {
      return new ApiError('Authentication required', ApiErrorType.AUTHENTICATION_ERROR, 401, error);
    }

    if (error.message?.includes('network')) {
      return new ApiError('Network connection failed', ApiErrorType.NETWORK_ERROR, 0, error);
    }

    return new ApiError(
      error.message || 'An unexpected error occurred',
      ApiErrorType.SERVER_ERROR,
      error.status || 500,
      error
    );
  }

  // =====================================================
  // USER OPERATIONS
  // =====================================================

  static async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    try {
      const isOnline = await this.isOnline();
      
      if (!isOnline) {
        const cached = await this.getCachedData<User>(`user_${userId}`);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      await this.cacheData(`user_${userId}`, data);
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getUserProfile');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      await this.cacheData(`user_${userId}`, data);
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'updateUserProfile');
      return { data: null, error: apiError.message, success: false };
    }
  }

  // =====================================================
  // WALLET OPERATIONS
  // =====================================================

  static async getWalletBalance(userId: string): Promise<ApiResponse<number>> {
    try {
      const isOnline = await this.isOnline();
      
      if (!isOnline) {
        const cached = await this.getCachedData<number>(`wallet_${userId}`);
        if (cached !== null) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

      const { data, error } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User doesn't exist, return 0
          await this.cacheData(`wallet_${userId}`, 0);
          return { data: 0, error: null, success: true };
        }
        throw error;
      }

      const balance = data?.wallet_balance || 0;
      await this.cacheData(`wallet_${userId}`, balance);
      return { data: balance, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getWalletBalance');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async updateWalletBalance(userId: string, newBalance: number): Promise<ApiResponse<void>> {
    try {
      // Check if user exists
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

        if (createError) throw createError;
      } else {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({ wallet_balance: newBalance })
          .eq('id', userId);

        if (error) throw error;
      }
      
      // Update cache
      await this.cacheData(`wallet_${userId}`, newBalance);
      return { data: null, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'updateWalletBalance');
      return { data: null, error: apiError.message, success: false };
    }
  }

  // =====================================================
  // PARCEL OPERATIONS
  // =====================================================

  static async createParcel(request: CreateParcelRequest, userId: string): Promise<ApiResponse<Parcel>> {
    try {
      // Generate tracking ID
      const trackingId = this.generateTrackingId();
      
      // Calculate total amount
      const totalAmount = request.delivery_fee + (request.insurance_fee || 0);

      const parcelData = {
        tracking_id: trackingId,
        sender_id: userId,
        recipient_name: request.recipient_name,
        recipient_phone: request.recipient_phone,
        recipient_email: request.recipient_email,
        package_type: request.package_type,
        package_weight: request.package_weight,
        package_dimensions: request.package_dimensions,
        package_description: request.package_description,
        package_images: request.package_images,
        dropoff_partner_id: request.dropoff_partner_id,
        pickup_partner_id: request.pickup_partner_id,
        delivery_fee: request.delivery_fee,
        insurance_fee: request.insurance_fee || 0,
        total_amount: totalAmount,
        payment_method: request.payment_method,
        payment_status: PaymentStatus.PENDING,
        status: ParcelStatus.CREATED,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('parcels')
        .insert(parcelData)
        .select()
        .single();

      if (error) throw error;

      // Create initial parcel event
      await this.createParcelEvent(data.id, ParcelStatus.CREATED, userId, UserRole.CUSTOMER);

      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'createParcel');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async getParcelDetails(trackingId: string): Promise<ApiResponse<Parcel>> {
    try {
      const isOnline = await this.isOnline();
      
      if (!isOnline) {
        const cached = await this.getCachedData<Parcel>(`parcel_${trackingId}`);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

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
        if (error.code === 'PGRST116') {
          throw new ApiError('Parcel not found', ApiErrorType.NOT_FOUND, 404);
        }
        throw error;
      }

      await this.cacheData(`parcel_${trackingId}`, data);
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getParcelDetails');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async getRecentParcels(userId: string, limit: number = 5): Promise<ApiResponse<Parcel[]>> {
    try {
      const isOnline = await this.isOnline();
      
      if (!isOnline) {
        const cached = await this.getCachedData<Parcel[]>(`recent_parcels_${userId}`);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

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

      if (error) throw error;

      // Cast to Parcel[] since we're only getting partial data
      const parcels = (data || []) as unknown as Parcel[];
      await this.cacheData(`recent_parcels_${userId}`, parcels);
      return { data: parcels, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getRecentParcels');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async updateParcelStatus(
    request: UpdateParcelStatusRequest & { actor_id?: string; actor_role?: UserRole }
  ): Promise<ApiResponse<void>> {
    try {
      const { data: parcel, error: parcelError } = await supabase
        .from('parcels')
        .select('id, tracking_id, status')
        .eq('id', request.parcel_id)
        .single();

      if (parcelError) throw parcelError;

      // Update parcel status
      const { error: updateError } = await supabase
        .from('parcels')
        .update({ 
          status: request.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.parcel_id);

      if (updateError) throw updateError;

      // Create parcel event
      await this.createParcelEvent(
        request.parcel_id,
        request.status,
        request.actor_id,
        request.actor_role,
        request.notes,
        request.location,
        request.images
      );

      // Clear cache for this parcel
      if (parcel.tracking_id) {
        await AsyncStorage.removeItem(`${this.CACHE_PREFIX}parcel_${parcel.tracking_id}`);
      }

      return { data: null, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'updateParcelStatus');
      return { data: null, error: apiError.message, success: false };
    }
  }

  // =====================================================
  // PARCEL EVENTS
  // =====================================================

  static async createParcelEvent(
    parcelId: string,
    eventType: ParcelStatus,
    actorId?: string,
    actorRole?: UserRole,
    notes?: string,
    location?: { latitude: number; longitude: number; address?: string },
    images?: string[]
  ): Promise<ApiResponse<ParcelEvent>> {
    try {
      const eventData = {
        parcel_id: parcelId,
        event_type: eventType,
        actor_id: actorId,
        actor_role: actorRole,
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        location_address: location?.address,
        notes,
        images,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('parcel_events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'createParcelEvent');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async getParcelEvents(parcelId: string): Promise<ApiResponse<ParcelEvent[]>> {
    try {
      const { data, error } = await supabase
        .from('parcel_events')
        .select('*')
        .eq('parcel_id', parcelId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { data: data || [], error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getParcelEvents');
      return { data: null, error: apiError.message, success: false };
    }
  }

  // =====================================================
  // PARTNER OPERATIONS
  // =====================================================

  static async getNearbyPartners(limit: number = 3): Promise<ApiResponse<Partner[]>> {
    try {
      const isOnline = await this.isOnline();
      
      if (!isOnline) {
        const cached = await this.getCachedData<Partner[]>(`nearby_partners`);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

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

      if (error) throw error;

      await this.cacheData(`nearby_partners`, data || []);
      return { data: data || [], error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getNearbyPartners');
      return { data: null, error: apiError.message, success: false };
    }
  }

  // =====================================================
  // TRANSACTION OPERATIONS
  // =====================================================

  static async getTransactions(userId: string, limit: number = 10): Promise<ApiResponse<Transaction[]>> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data: data || [], error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getTransactions');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async addTransaction(transactionData: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'addTransaction');
      return { data: null, error: apiError.message, success: false };
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private static generateTrackingId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `AD${timestamp}${random}`.toUpperCase();
  }

  static async validateQRCode(qrData: string): Promise<ApiResponse<any>> {
    try {
      // Parse QR data (format: ADERA:TRACKING_ID or ADERA:TRACKING_ID:PICKUP_CODE)
      const parts = qrData.split(':');
      
      if (parts.length < 2 || parts[0] !== 'ADERA') {
        throw new ApiError('Invalid QR code format', ApiErrorType.VALIDATION_ERROR);
      }

      const trackingId = parts[1];
      const pickupCode = parts[2];

      // Get parcel details
      const parcelResponse = await this.getParcelDetails(trackingId);
      if (!parcelResponse.success || !parcelResponse.data) {
        throw new ApiError('Parcel not found', ApiErrorType.NOT_FOUND);
      }

      const parcel = parcelResponse.data;

      // Validate pickup code if provided
      if (pickupCode && parcel.pickup_code !== pickupCode) {
        throw new ApiError('Invalid pickup code', ApiErrorType.VALIDATION_ERROR);
      }

      return {
        data: {
          parcel,
          isValid: true,
          pickupCodeValid: !pickupCode || parcel.pickup_code === pickupCode
        },
        error: null,
        success: true
      };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: error.message, success: false };
      }
      const apiError = this.handleApiError(error, 'validateQRCode');
      return { data: null, error: apiError.message, success: false };
    }
  }

  // =====================================================
  // CACHE MANAGEMENT
  // =====================================================

  static async clearAllCache(): Promise<void> {
    await this.clearCache();
  }

  static async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      return cacheKeys.length;
    } catch {
      return 0;
    }
  }

  // =====================================================
  // E-COMMERCE METHODS (PARTNER ROLE)
  // =====================================================

  // Shop Management
  static async getShopByPartnerId(partnerId: string): Promise<ApiResponse<Shop>> {
    try {
      const isOnline = await this.isOnline();
      if (!isOnline) {
        const cached = await this.getCachedData<Shop>(`shop_${partnerId}`);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

      // First get the partner record to find the partner_id
      const { data: partners, error: partnerError } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', partnerId);

      if (partnerError) throw partnerError;
      if (!partners || partners.length === 0) {
        throw new ApiError('Partner not found', ApiErrorType.NOT_FOUND);
      }

      // Use the first partner if multiple exist
      const partner = partners[0];

      // Now get the shop using the partner_id
      const { data: shops, error } = await supabase
        .from('shops')
        .select('*')
        .eq('partner_id', partner.id);

      if (error) throw error;
      if (!shops || shops.length === 0) {
        throw new ApiError('Shop not found for this partner', ApiErrorType.NOT_FOUND);
      }

      // Use the first shop if multiple exist (though ideally there should be only one)
      const shop = shops[0];
      
      await this.cacheData(`shop_${partnerId}`, shop);
      return { data: shop, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getShopByPartnerId');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async createShop(shopData: Partial<Shop>): Promise<ApiResponse<Shop>> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .insert(shopData)
        .select()
        .single();

      if (error) throw error;
      await this.clearCache(); // Clear shop-related cache
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'createShop');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async updateShop(shopId: string, updates: Partial<Shop>): Promise<ApiResponse<Shop>> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .update(updates)
        .eq('id', shopId)
        .select()
        .single();

      if (error) throw error;
      await this.clearCache(); // Clear shop-related cache
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'updateShop');
      return { data: null, error: apiError.message, success: false };
    }
  }

  // Shop Categories
  static async getShopCategories(shopId: string): Promise<ApiResponse<ShopCategory[]>> {
    try {
      const isOnline = await this.isOnline();
      if (!isOnline) {
        const cached = await this.getCachedData<ShopCategory[]>(`categories_${shopId}`);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

      const { data, error } = await supabase
        .from('shop_categories')
        .select('*')
        .eq('shop_id', shopId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      await this.cacheData(`categories_${shopId}`, data || []);
      return { data: data || [], error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getShopCategories');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async createShopCategory(categoryData: Partial<ShopCategory>): Promise<ApiResponse<ShopCategory>> {
    try {
      const { data, error } = await supabase
        .from('shop_categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;
      await this.clearCache(); // Clear category-related cache
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'createShopCategory');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async updateShopCategory(categoryId: string, updates: Partial<ShopCategory>): Promise<ApiResponse<ShopCategory>> {
    try {
      const { data, error } = await supabase
        .from('shop_categories')
        .update(updates)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      await this.clearCache(); // Clear category-related cache
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'updateShopCategory');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async deleteShopCategory(categoryId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('shop_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      await this.clearCache(); // Clear category-related cache
      return { data: null, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'deleteShopCategory');
      return { data: null, error: apiError.message, success: false };
    }
  }

  // Shop Items (Inventory)
  static async getShopItems(shopId: string, categoryId?: string): Promise<ApiResponse<ShopItem[]>> {
    try {
      const isOnline = await this.isOnline();
      const cacheKey = categoryId ? `items_${shopId}_${categoryId}` : `items_${shopId}`;
      
      if (!isOnline) {
        const cached = await this.getCachedData<ShopItem[]>(cacheKey);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

      let query = supabase
        .from('shop_items')
        .select(`
          *,
          shop:shops(shop_name, description, is_approved, is_active),
          category:shop_categories(name)
        `)
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      await this.cacheData(cacheKey, data || []);
      return { data: data || [], error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getShopItems');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async getShopItem(itemId: string): Promise<ApiResponse<ShopItem>> {
    try {
      const isOnline = await this.isOnline();
      if (!isOnline) {
        const cached = await this.getCachedData<ShopItem>(`item_${itemId}`);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

      const { data, error } = await supabase
        .from('shop_items')
        .select(`
          *,
          shop:shops(shop_name, description, is_approved, is_active),
          category:shop_categories(name)
        `)
        .eq('id', itemId)
        .single();

      if (error) throw error;
      await this.cacheData(`item_${itemId}`, data);
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getShopItem');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async createShopItem(itemData: Partial<ShopItem>): Promise<ApiResponse<ShopItem>> {
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .insert(itemData)
        .select()
        .single();

      if (error) throw error;
      await this.clearCache(); // Clear item-related cache
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'createShopItem');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async updateShopItem(itemId: string, updates: Partial<ShopItem>): Promise<ApiResponse<ShopItem>> {
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      await this.clearCache(); // Clear item-related cache
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'updateShopItem');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async deleteShopItem(itemId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('shop_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await this.clearCache(); // Clear item-related cache
      return { data: null, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'deleteShopItem');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async updateItemStock(itemId: string, quantity: number): Promise<ApiResponse<ShopItem>> {
    try {
      // Get current item
      const currentItem = await this.getShopItem(itemId);
      if (!currentItem.success || !currentItem.data) {
        throw new ApiError('Item not found', ApiErrorType.NOT_FOUND);
      }

      const newQuantity = Math.max(0, currentItem.data.quantity + quantity);
      
      const { data, error } = await supabase
        .from('shop_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      await this.clearCache(); // Clear item-related cache
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'updateItemStock');
      return { data: null, error: apiError.message, success: false };
    }
  }

  // Shop Orders
  static async getShopOrders(shopId: string, status?: ParcelStatus): Promise<ApiResponse<ShopOrder[]>> {
    try {
      const isOnline = await this.isOnline();
      const cacheKey = status ? `orders_${shopId}_${status}` : `orders_${shopId}`;
      
      if (!isOnline) {
        const cached = await this.getCachedData<ShopOrder[]>(cacheKey);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

      let query = supabase
        .from('shop_orders')
        .select(`
          *,
          item:shop_items(name, price, image_urls),
          buyer:users(first_name, last_name, phone)
        `)
        .eq('shop_id', shopId)
        .order('order_date', { ascending: false });

      if (status) {
        query = query.eq('delivery_status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      await this.cacheData(cacheKey, data || []);
      return { data: data || [], error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getShopOrders');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async getShopOrder(orderId: string): Promise<ApiResponse<ShopOrder>> {
    try {
      const isOnline = await this.isOnline();
      if (!isOnline) {
        const cached = await this.getCachedData<ShopOrder>(`order_${orderId}`);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

      const { data, error } = await supabase
        .from('shop_orders')
        .select(`
          *,
          item:shop_items(name, price, image_urls),
          buyer:users(first_name, last_name, phone)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      await this.cacheData(`order_${orderId}`, data);
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getShopOrder');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async createShopOrder(orderData: Partial<ShopOrder>): Promise<ApiResponse<ShopOrder>> {
    try {
      const { data, error } = await supabase
        .from('shop_orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;
      await this.clearCache(); // Clear order-related cache
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'createShopOrder');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async updateShopOrder(orderId: string, updates: Partial<ShopOrder>): Promise<ApiResponse<ShopOrder>> {
    try {
      const { data, error } = await supabase
        .from('shop_orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      await this.clearCache(); // Clear order-related cache
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'updateShopOrder');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async updateOrderStatus(orderId: string, status: ParcelStatus): Promise<ApiResponse<ShopOrder>> {
    try {
      const { data, error } = await supabase
        .from('shop_orders')
        .update({ delivery_status: status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      await this.clearCache(); // Clear order-related cache
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'updateOrderStatus');
      return { data: null, error: apiError.message, success: false };
    }
  }

  // Shop Transactions (Earnings)
  static async getShopTransactions(shopId: string, limit: number = 20): Promise<ApiResponse<ShopTransaction[]>> {
    try {
      const isOnline = await this.isOnline();
      if (!isOnline) {
        const cached = await this.getCachedData<ShopTransaction[]>(`shop_transactions_${shopId}`);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

      const { data, error } = await supabase
        .from('shop_transactions')
        .select(`
          *,
          order:shop_orders(id, total_amount, order_date)
        `)
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      await this.cacheData(`shop_transactions_${shopId}`, data || []);
      return { data: data || [], error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getShopTransactions');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async createShopTransaction(transactionData: Partial<ShopTransaction>): Promise<ApiResponse<ShopTransaction>> {
    try {
      const { data, error } = await supabase
        .from('shop_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;
      await this.clearCache(); // Clear transaction-related cache
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'createShopTransaction');
      return { data: null, error: apiError.message, success: false };
    }
  }

  // =====================================================
  // PARTNER-SPECIFIC ANALYTICS & PARCEL METHODS
  // =====================================================

  static async getPartnerParcels(partnerId: string, limit: number = 20, status?: ParcelStatus): Promise<ApiResponse<any[]>> {
    try {
      const isOnline = await this.isOnline();
      const cacheKey = status ? `partner_parcels_${partnerId}_${status}` : `partner_parcels_${partnerId}`;
      
      if (!isOnline) {
        const cached = await this.getCachedData<any[]>(cacheKey);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

      // Get parcels where this partner is either dropoff or pickup partner
      let query = supabase
        .from('parcels')
        .select(`
          id,
          tracking_id,
          status,
          recipient_name,
          recipient_phone,
          recipient_email,
          total_amount,
          payment_status,
          created_at,
          pickup_code,
          package_description,
          dropoff_partner:partners!dropoff_partner_id(business_name, address),
          pickup_partner:partners!pickup_partner_id(business_name, address),
          sender:users!sender_id(first_name, last_name, phone)
        `)
        .or(`dropoff_partner_id.eq.${partnerId},pickup_partner_id.eq.${partnerId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      await this.cacheData(cacheKey, data || []);
      return { data: data || [], error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getPartnerParcels');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async getPartnerAnalytics(partnerId: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<ApiResponse<any>> {
    try {
      const isOnline = await this.isOnline();
      const cacheKey = `partner_analytics_${partnerId}_${period}`;
      
      if (!isOnline) {
        const cached = await this.getCachedData<any>(cacheKey);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

      // Get date range for the period
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Get parcels data for analytics
      const { data: parcels, error: parcelsError } = await supabase
        .from('parcels')
        .select('*')
        .or(`dropoff_partner_id.eq.${partnerId},pickup_partner_id.eq.${partnerId}`)
        .gte('created_at', startDate.toISOString());

      if (parcelsError) throw parcelsError;

      // Calculate analytics
      const totalParcels = parcels?.length || 0;
      const deliveredParcels = parcels?.filter(p => p.status === ParcelStatus.DELIVERED).length || 0;
      const totalEarnings = parcels?.reduce((sum, p) => sum + (p.total_amount * 0.1), 0) || 0; // 10% commission
      const avgDeliveryTime = 24; // Mock data - would need actual calculation
      const successRate = totalParcels > 0 ? (deliveredParcels / totalParcels) * 100 : 0;

      // Group by status for distribution
      const parcelsByStatus = parcels?.reduce((acc: any[], parcel) => {
        const existingStatus = acc.find(item => item.status === parcel.status);
        if (existingStatus) {
          existingStatus.count += 1;
        } else {
          acc.push({ status: parcel.status, count: 1, percentage: 0 });
        }
        return acc;
      }, []) || [];

      // Calculate percentages
      parcelsByStatus.forEach(item => {
        item.percentage = totalParcels > 0 ? (item.count / totalParcels) * 100 : 0;
      });

      const analyticsData = {
        overview: {
          totalParcels,
          totalEarnings,
          avgDeliveryTime,
          successRate
        },
        parcelsByStatus,
        earningsOverTime: [] // Would need more complex query for time series data
      };

      await this.cacheData(cacheKey, analyticsData);
      return { data: analyticsData, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getPartnerAnalytics');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async getShopAnalytics(shopId: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<ApiResponse<any>> {
    try {
      const isOnline = await this.isOnline();
      const cacheKey = `shop_analytics_${shopId}_${period}`;
      
      if (!isOnline) {
        const cached = await this.getCachedData<any>(cacheKey);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

      // Get date range for the period
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Get shop orders and items for analytics
      const [ordersResponse, itemsResponse] = await Promise.all([
        supabase
          .from('shop_orders')
          .select(`
            *,
            item:shop_items(name, price)
          `)
          .eq('shop_id', shopId)
          .gte('order_date', startDate.toISOString()),
        
        supabase
          .from('shop_items')
          .select('*')
          .eq('shop_id', shopId)
      ]);

      if (ordersResponse.error) throw ordersResponse.error;
      if (itemsResponse.error) throw itemsResponse.error;

      const orders = ordersResponse.data || [];
      const items = itemsResponse.data || [];

      // Calculate analytics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get top products
      const productSales: { [itemId: string]: { name: string; orders: number; revenue: number } } = {};
      orders.forEach(order => {
        const itemName = order.item?.name || 'Unknown Product';
        if (!productSales[order.item_id]) {
          productSales[order.item_id] = { name: itemName, orders: 0, revenue: 0 };
        }
        productSales[order.item_id].orders += 1;
        productSales[order.item_id].revenue += order.total_amount;
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const analyticsData = {
        totalOrders,
        totalRevenue,
        avgOrderValue,
        topProducts,
        totalSales: totalRevenue // Alias for compatibility
      };

      await this.cacheData(cacheKey, analyticsData);
      return { data: analyticsData, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getShopAnalytics');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async createShopTransaction(transactionData: Partial<ShopTransaction>): Promise<ApiResponse<ShopTransaction>> {
    try {
      const { data, error } = await supabase
        .from('shop_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;
      await this.clearCache(); // Clear transaction-related cache
      return { data, error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'createShopTransaction');
      return { data: null, error: apiError.message, success: false };
    }
  }


  // Search and Discovery
  static async searchShopItems(query: string, shopId?: string): Promise<ApiResponse<ShopItem[]>> {
    try {
      const isOnline = await this.isOnline();
      const cacheKey = `search_${query}_${shopId || 'all'}`;
      
      if (!isOnline) {
        const cached = await this.getCachedData<ShopItem[]>(cacheKey);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

      let queryBuilder = supabase
        .from('shop_items')
        .select(`
          *,
          shop:shops(shop_name, description, is_approved, is_active),
          category:shop_categories(name)
        `)
        .ilike('name', `%${query}%`)
        .eq('is_active', true)
        .order('sales_count', { ascending: false });

      if (shopId) {
        queryBuilder = queryBuilder.eq('shop_id', shopId);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      await this.cacheData(cacheKey, data || []);
      return { data: data || [], error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'searchShopItems');
      return { data: null, error: apiError.message, success: false };
    }
  }

  static async getFeaturedItems(shopId?: string, limit: number = 10): Promise<ApiResponse<ShopItem[]>> {
    try {
      const isOnline = await this.isOnline();
      const cacheKey = `featured_${shopId || 'all'}_${limit}`;
      
      if (!isOnline) {
        const cached = await this.getCachedData<ShopItem[]>(cacheKey);
        if (cached) {
          return { data: cached, error: null, success: true, cached: true };
        }
        throw new ApiError('No internet connection', ApiErrorType.OFFLINE_ERROR);
      }

      let query = supabase
        .from('shop_items')
        .select(`
          *,
          shop:shops(shop_name, description, is_approved, is_active),
          category:shop_categories(name)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('sales_count', { ascending: false })
        .limit(limit);

      if (shopId) {
        query = query.eq('shop_id', shopId);
      }

      const { data, error } = await query;

      if (error) throw error;
      await this.cacheData(cacheKey, data || []);
      return { data: data || [], error: null, success: true };
    } catch (error) {
      const apiError = this.handleApiError(error, 'getFeaturedItems');
      return { data: null, error: apiError.message, success: false };
    }
  }
} 