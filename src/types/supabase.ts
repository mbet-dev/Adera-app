// =====================================================
// SUPABASE DATABASE TYPES
// Generated TypeScript types for Supabase database schema
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          first_name: string
          last_name: string
          role: 'customer' | 'partner' | 'driver' | 'staff' | 'admin'
          language: string
          is_verified: boolean
          is_active: boolean
          profile_image_url: string | null
          wallet_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          phone?: string | null
          first_name: string
          last_name: string
          role?: 'customer' | 'partner' | 'driver' | 'staff' | 'admin'
          language?: string
          is_verified?: boolean
          is_active?: boolean
          profile_image_url?: string | null
          wallet_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          first_name?: string
          last_name?: string
          role?: 'customer' | 'partner' | 'driver' | 'staff' | 'admin'
          language?: string
          is_verified?: boolean
          is_active?: boolean
          profile_image_url?: string | null
          wallet_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      partners: {
        Row: {
          id: string
          user_id: string
          business_name: string
          business_license: string | null
          business_category: string | null
          address: string
          latitude: number
          longitude: number
          phone: string
          email: string | null
          operating_hours: Json | null
          accepted_payment_methods: ('telebirr' | 'chapa' | 'arifpay' | 'cash_on_delivery' | 'wallet' | 'recipient_pays' | 'card_payment')[]
          is_approved: boolean
          is_active: boolean
          commission_rate: number
          total_earnings: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          business_license?: string | null
          business_category?: string | null
          address: string
          latitude: number
          longitude: number
          phone: string
          email?: string | null
          operating_hours?: Json | null
          accepted_payment_methods?: ('telebirr' | 'chapa' | 'arifpay' | 'cash_on_delivery' | 'wallet' | 'recipient_pays' | 'card_payment')[]
          is_approved?: boolean
          is_active?: boolean
          commission_rate?: number
          total_earnings?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          business_license?: string | null
          business_category?: string | null
          address?: string
          latitude?: number
          longitude?: number
          phone?: string
          email?: string | null
          operating_hours?: Json | null
          accepted_payment_methods?: ('telebirr' | 'chapa' | 'arifpay' | 'cash_on_delivery' | 'wallet' | 'recipient_pays' | 'card_payment')[]
          is_approved?: boolean
          is_active?: boolean
          commission_rate?: number
          total_earnings?: number
          created_at?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          user_id: string
          vehicle_type: string | null
          vehicle_number: string | null
          license_number: string | null
          is_available: boolean
          current_latitude: number | null
          current_longitude: number | null
          last_location_update: string | null
          total_deliveries: number
          total_earnings: number
          rating: number
          is_approved: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_type?: string | null
          vehicle_number?: string | null
          license_number?: string | null
          is_available?: boolean
          current_latitude?: number | null
          current_longitude?: number | null
          last_location_update?: string | null
          total_deliveries?: number
          total_earnings?: number
          rating?: number
          is_approved?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_type?: string | null
          vehicle_number?: string | null
          license_number?: string | null
          is_available?: boolean
          current_latitude?: number | null
          current_longitude?: number | null
          last_location_update?: string | null
          total_deliveries?: number
          total_earnings?: number
          rating?: number
          is_approved?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      parcels: {
        Row: {
          id: string
          tracking_id: string
          sender_id: string
          recipient_name: string
          recipient_phone: string
          recipient_email: string | null
          package_type: 'document' | 'small' | 'medium' | 'large'
          package_weight: number | null
          package_dimensions: Json | null
          package_description: string | null
          package_images: string[] | null
          pickup_code: string | null
          delivery_fee: number
          insurance_fee: number
          total_amount: number
          payment_method: 'telebirr' | 'chapa' | 'arifpay' | 'cash_on_delivery' | 'wallet' | 'recipient_pays' | 'card_payment'
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          status: 'created' | 'dropoff' | 'facility_received' | 'in_transit_to_facility_hub' | 'in_transit_to_pickup_point' | 'pickup_ready' | 'delivered' | 'cancelled' | 'disputed'
          dropoff_partner_id: string | null
          pickup_partner_id: string | null
          assigned_driver_id: string | null
          estimated_delivery_time: string | null
          actual_delivery_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tracking_id?: string
          sender_id: string
          recipient_name: string
          recipient_phone: string
          recipient_email?: string | null
          package_type: 'document' | 'small' | 'medium' | 'large'
          package_weight?: number | null
          package_dimensions?: Json | null
          package_description?: string | null
          package_images?: string[] | null
          pickup_code?: string | null
          delivery_fee: number
          insurance_fee?: number
          total_amount: number
          payment_method: 'telebirr' | 'chapa' | 'arifpay' | 'cash_on_delivery' | 'wallet' | 'recipient_pays' | 'card_payment'
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          status?: 'created' | 'dropoff' | 'facility_received' | 'in_transit_to_facility_hub' | 'in_transit_to_pickup_point' | 'pickup_ready' | 'delivered' | 'cancelled' | 'disputed'
          dropoff_partner_id?: string | null
          pickup_partner_id?: string | null
          assigned_driver_id?: string | null
          estimated_delivery_time?: string | null
          actual_delivery_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tracking_id?: string
          sender_id?: string
          recipient_name?: string
          recipient_phone?: string
          recipient_email?: string | null
          package_type?: 'document' | 'small' | 'medium' | 'large'
          package_weight?: number | null
          package_dimensions?: Json | null
          package_description?: string | null
          package_images?: string[] | null
          pickup_code?: string | null
          delivery_fee?: number
          insurance_fee?: number
          total_amount?: number
          payment_method?: 'telebirr' | 'chapa' | 'arifpay' | 'cash_on_delivery' | 'wallet' | 'recipient_pays' | 'card_payment'
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          status?: 'created' | 'dropoff' | 'facility_received' | 'in_transit_to_facility_hub' | 'in_transit_to_pickup_point' | 'pickup_ready' | 'delivered' | 'cancelled' | 'disputed'
          dropoff_partner_id?: string | null
          pickup_partner_id?: string | null
          assigned_driver_id?: string | null
          estimated_delivery_time?: string | null
          actual_delivery_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parcel_events: {
        Row: {
          id: string
          parcel_id: string
          event_type: 'created' | 'dropoff' | 'facility_received' | 'in_transit_to_facility_hub' | 'in_transit_to_pickup_point' | 'pickup_ready' | 'delivered' | 'cancelled' | 'disputed'
          actor_id: string | null
          actor_role: 'customer' | 'partner' | 'driver' | 'staff' | 'admin'
          location_latitude: number | null
          location_longitude: number | null
          location_address: string | null
          notes: string | null
          images: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          parcel_id: string
          event_type: 'created' | 'dropoff' | 'facility_received' | 'in_transit_to_facility_hub' | 'in_transit_to_pickup_point' | 'pickup_ready' | 'delivered' | 'cancelled' | 'disputed'
          actor_id?: string | null
          actor_role: 'customer' | 'partner' | 'driver' | 'staff' | 'admin'
          location_latitude?: number | null
          location_longitude?: number | null
          location_address?: string | null
          notes?: string | null
          images?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          parcel_id?: string
          event_type?: 'created' | 'dropoff' | 'facility_received' | 'in_transit_to_facility_hub' | 'in_transit_to_pickup_point' | 'pickup_ready' | 'delivered' | 'cancelled' | 'disputed'
          actor_id?: string | null
          actor_role?: 'customer' | 'partner' | 'driver' | 'staff' | 'admin'
          location_latitude?: number | null
          location_longitude?: number | null
          location_address?: string | null
          notes?: string | null
          images?: string[] | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          parcel_id: string
          user_id: string
          amount: number
          payment_method: 'telebirr' | 'chapa' | 'arifpay' | 'cash_on_delivery' | 'wallet' | 'recipient_pays' | 'card_payment'
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          gateway_transaction_id: string | null
          gateway_response: Json | null
          commission_amount: number
          partner_commission: number
          driver_commission: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parcel_id: string
          user_id: string
          amount: number
          payment_method: 'telebirr' | 'chapa' | 'arifpay' | 'cash_on_delivery' | 'wallet' | 'recipient_pays' | 'card_payment'
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          gateway_transaction_id?: string | null
          gateway_response?: Json | null
          commission_amount?: number
          partner_commission?: number
          driver_commission?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parcel_id?: string
          user_id?: string
          amount?: number
          payment_method?: 'telebirr' | 'chapa' | 'arifpay' | 'cash_on_delivery' | 'wallet' | 'recipient_pays' | 'card_payment'
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          gateway_transaction_id?: string | null
          gateway_response?: Json | null
          commission_amount?: number
          partner_commission?: number
          driver_commission?: number
          created_at?: string
          updated_at?: string
        }
      }
      shops: {
        Row: {
          id: string
          partner_id: string
          shop_name: string
          description: string | null
          banner_url: string | null
          logo_url: string | null
          template_type: string
          primary_color: string
          is_approved: boolean
          is_active: boolean
          total_sales: number
          total_orders: number
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          partner_id: string
          shop_name: string
          description?: string | null
          banner_url?: string | null
          logo_url?: string | null
          template_type?: string
          primary_color?: string
          is_approved?: boolean
          is_active?: boolean
          total_sales?: number
          total_orders?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          partner_id?: string
          shop_name?: string
          description?: string | null
          banner_url?: string | null
          logo_url?: string | null
          template_type?: string
          primary_color?: string
          is_approved?: boolean
          is_active?: boolean
          total_sales?: number
          total_orders?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      shop_categories: {
        Row: {
          id: string
          shop_id: string
          name: string
          icon_url: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          name: string
          icon_url?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          name?: string
          icon_url?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      shop_items: {
        Row: {
          id: string
          shop_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          original_price: number | null
          quantity: number
          image_urls: string[] | null
          delivery_supported: boolean
          delivery_fee: number
          is_active: boolean
          is_featured: boolean
          views_count: number
          sales_count: number
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          original_price?: number | null
          quantity?: number
          image_urls?: string[] | null
          delivery_supported?: boolean
          delivery_fee?: number
          is_active?: boolean
          is_featured?: boolean
          views_count?: number
          sales_count?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          original_price?: number | null
          quantity?: number
          image_urls?: string[] | null
          delivery_supported?: boolean
          delivery_fee?: number
          is_active?: boolean
          is_featured?: boolean
          views_count?: number
          sales_count?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      shop_orders: {
        Row: {
          id: string
          shop_id: string
          buyer_id: string
          item_id: string
          quantity: number
          unit_price: number
          total_amount: number
          delivery_fee: number
          payment_method: 'telebirr' | 'chapa' | 'arifpay' | 'cash_on_delivery' | 'wallet' | 'recipient_pays' | 'card_payment'
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          delivery_method: string
          delivery_status: 'created' | 'dropoff' | 'facility_received' | 'in_transit_to_facility_hub' | 'in_transit_to_pickup_point' | 'pickup_ready' | 'delivered' | 'cancelled' | 'disputed'
          parcel_id: string | null
          order_date: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          buyer_id: string
          item_id: string
          quantity: number
          unit_price: number
          total_amount: number
          delivery_fee?: number
          payment_method: 'telebirr' | 'chapa' | 'arifpay' | 'cash_on_delivery' | 'wallet' | 'recipient_pays' | 'card_payment'
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          delivery_method?: string
          delivery_status?: 'created' | 'dropoff' | 'facility_received' | 'in_transit_to_facility_hub' | 'in_transit_to_pickup_point' | 'pickup_ready' | 'delivered' | 'cancelled' | 'disputed'
          parcel_id?: string | null
          order_date?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          buyer_id?: string
          item_id?: string
          quantity?: number
          unit_price?: number
          total_amount?: number
          delivery_fee?: number
          payment_method?: 'telebirr' | 'chapa' | 'arifpay' | 'cash_on_delivery' | 'wallet' | 'recipient_pays' | 'card_payment'
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          delivery_method?: string
          delivery_status?: 'created' | 'dropoff' | 'facility_received' | 'in_transit_to_facility_hub' | 'in_transit_to_pickup_point' | 'pickup_ready' | 'delivered' | 'cancelled' | 'disputed'
          parcel_id?: string | null
          order_date?: string
          updated_at?: string
        }
      }
      shop_transactions: {
        Row: {
          id: string
          shop_id: string
          order_id: string
          amount: number
          commission_amount: number
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          payout_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          order_id: string
          amount: number
          commission_amount?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          payout_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          order_id?: string
          amount?: number
          commission_amount?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          payout_date?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          parcel_id: string
          message: string
          message_type: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          parcel_id: string
          message: string
          message_type?: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          parcel_id?: string
          message?: string
          message_type?: string
          is_read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          notification_type: 'parcel_created' | 'status_update' | 'payment_confirmed' | 'delivery_ready' | 'dispute_created' | 'system_alert'
          related_id: string | null
          related_type: string | null
          is_read: boolean
          is_sent: boolean
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          notification_type: 'parcel_created' | 'status_update' | 'payment_confirmed' | 'delivery_ready' | 'dispute_created' | 'system_alert'
          related_id?: string | null
          related_type?: string | null
          is_read?: boolean
          is_sent?: boolean
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          notification_type?: 'parcel_created' | 'status_update' | 'payment_confirmed' | 'delivery_ready' | 'dispute_created' | 'system_alert'
          related_id?: string | null
          related_type?: string | null
          is_read?: boolean
          is_sent?: boolean
          sent_at?: string | null
          created_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      disputes: {
        Row: {
          id: string
          parcel_id: string
          reporter_id: string
          dispute_type: string
          description: string
          evidence_images: string[] | null
          status: string
          resolution: string | null
          resolved_by: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parcel_id: string
          reporter_id: string
          dispute_type: string
          description: string
          evidence_images?: string[] | null
          status?: string
          resolution?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parcel_id?: string
          reporter_id?: string
          dispute_type?: string
          description?: string
          evidence_images?: string[] | null
          status?: string
          resolution?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_parcel_delivery_fee: {
        Args: {
          p_package_type: 'document' | 'small' | 'medium' | 'large'
          p_distance_km: number
        }
        Returns: number
      }
      calculate_shop_delivery_fee: {
        Args: {
          p_distance_km: number
        }
        Returns: number
      }
      generate_pickup_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_tracking_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_nearby_partners: {
        Args: {
          p_latitude: number
          p_longitude: number
          p_radius_km: number
        }
        Returns: {
          id: string
          business_name: string
          address: string
          latitude: number
          longitude: number
          distance_km: number
        }[]
      }
      process_commission: {
        Args: {
          p_transaction_id: string
        }
        Returns: void
      }
      update_parcel_status: {
        Args: {
          p_parcel_id: string
          p_new_status: 'created' | 'dropoff' | 'facility_received' | 'in_transit_to_facility_hub' | 'in_transit_to_pickup_point' | 'pickup_ready' | 'delivered' | 'cancelled' | 'disputed'
          p_actor_id: string
          p_actor_role: 'customer' | 'partner' | 'driver' | 'staff' | 'admin'
          p_notes: string
        }
        Returns: void
      }
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      notification_type: 'parcel_created' | 'status_update' | 'payment_confirmed' | 'delivery_ready' | 'dispute_created' | 'system_alert'
      package_type: 'document' | 'small' | 'medium' | 'large'
      parcel_status: 'created' | 'dropoff' | 'facility_received' | 'in_transit_to_facility_hub' | 'in_transit_to_pickup_point' | 'pickup_ready' | 'delivered' | 'cancelled' | 'disputed'
      payment_method: 'telebirr' | 'chapa' | 'arifpay' | 'cash_on_delivery' | 'wallet' | 'recipient_pays' | 'card_payment'
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
      user_role: 'customer' | 'partner' | 'driver' | 'staff' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 