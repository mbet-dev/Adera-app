// =====================================================
// ADERA APP - TYPE DEFINITIONS
// Comprehensive TypeScript interfaces matching database schema
// =====================================================

// =====================================================
// ENUM TYPES
// =====================================================

export enum UserRole {
  CUSTOMER = 'customer',
  PARTNER = 'partner',
  DRIVER = 'driver',
  STAFF = 'staff',
  ADMIN = 'admin'
}

export enum ParcelStatus {
  CREATED = 'created',
  DROPOFF = 'dropoff',
  FACILITY_RECEIVED = 'facility_received',
  IN_TRANSIT_TO_FACILITY_HUB = 'in_transit_to_facility_hub',
  IN_TRANSIT_TO_PICKUP_POINT = 'in_transit_to_pickup_point',
  PICKUP_READY = 'pickup_ready',
  ASSIGNED_TO_DRIVER = 'assigned_to_driver',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  TELEBIRR = 'telebirr',
  CHAPA = 'chapa',
  ARIFPAY = 'arifpay',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  WALLET = 'wallet',
  RECIPIENT_PAYS = 'recipient_pays',
  CARD_PAYMENT = 'card_payment',
  MOBILE_BANKING = 'mobile_banking'
}

// Export as type union for compatibility
export type PaymentMethodType = 'telebirr' | 'chapa' | 'arifpay' | 'cash_on_delivery' | 'wallet' | 'recipient_pays' | 'card_payment' | 'mobile_banking';

export enum PackageType {
  DOCUMENT = 'document',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

export enum NotificationType {
  PARCEL_CREATED = 'parcel_created',
  STATUS_UPDATE = 'status_update',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  DELIVERY_READY = 'delivery_ready',
  DISPUTE_CREATED = 'dispute_created',
  SYSTEM_ALERT = 'system_alert'
}

// =====================================================
// CORE ENTITY TYPES
// =====================================================

export interface User {
  id: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  language: string;
  is_verified: boolean;
  is_active: boolean;
  profile_image_url?: string;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  business_name: string;
  address: string;
  latitude: number;
  longitude: number;
  accepted_payment_methods: PaymentMethod[];
  operating_hours?: OperatingHours;
  phone: string;
  // URL for the main photo of the business location
  photo_url?: string;
  // Array of additional photo URLs for the business location
  photos?: string[];
  // Array of users associated with the partner (from Supabase join)
  users: {
    first_name: string;
    last_name: string;
  }[];
  // Additional properties for compatibility
  profile?: {
    business_name: string;
    address: string;
  };
  accepts_proxy_payment?: boolean;
  is_approved?: boolean;
  is_active?: boolean;
}

export interface Driver {
  id: string;
  user_id: string;
  vehicle_type?: string;
  vehicle_number?: string;
  license_number?: string;
  is_available: boolean;
  current_latitude?: number;
  current_longitude?: number;
  last_location_update?: string;
  total_deliveries: number;
  total_earnings: number;
  rating: number;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Parcel {
  id: string;
  tracking_id: string;
  sender_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string;
  package_type: PackageType;
  package_weight?: number;
  package_dimensions?: PackageDimensions;
  package_description?: string;
  package_images?: string[];
  pickup_code?: string;
  delivery_fee: number;
  insurance_fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: ParcelStatus;
  dropoff_partner_id?: string;
  pickup_partner_id?: string;
  assigned_driver_id?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  created_at: string;
  updated_at: string;
}

export interface ParcelEvent {
  id: string;
  parcel_id: string;
  event_type: ParcelStatus;
  actor_id?: string;
  actor_role: UserRole;
  location_latitude?: number;
  location_longitude?: number;
  location_address?: string;
  notes?: string;
  images?: string[];
  created_at: string;
}

export interface Transaction {
  id: string;
  parcel_id: string;
  user_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  gateway_transaction_id?: string;
  gateway_response?: any;
  commission_amount: number;
  partner_commission: number;
  driver_commission: number;
  created_at: string;
  updated_at: string;
}

// =====================================================
// E-COMMERCE TYPES
// =====================================================

export interface Shop {
  id: string;
  partner_id: string;
  shop_name: string;
  description?: string;
  banner_url?: string;
  logo_url?: string;
  template_type: string;
  primary_color: string;
  is_approved: boolean;
  is_active: boolean;
  total_sales: number;
  total_orders: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface ShopCategory {
  id: string;
  shop_id: string;
  name: string;
  icon_url?: string;
  sort_order: number;
  created_at: string;
}

export interface ShopItem {
  id: string;
  shop_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  quantity: number;
  image_urls?: string[];
  delivery_supported: boolean;
  delivery_fee: number;
  is_active: boolean;
  is_featured: boolean;
  views_count: number;
  sales_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
  // Joined data from database queries
  shop?: {
    shop_name: string;
    description?: string;
    is_approved: boolean;
    is_active: boolean;
  };
  category?: {
    name: string;
  };
}

export interface ShopOrder {
  id: string;
  shop_id: string;
  buyer_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  delivery_fee: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  delivery_method: string;
  delivery_status: ParcelStatus;
  parcel_id?: string;
  order_date: string;
  updated_at: string;
}

export interface ShopTransaction {
  id: string;
  shop_id: string;
  order_id: string;
  amount: number;
  commission_amount: number;
  status: PaymentStatus;
  payout_date?: string;
  created_at: string;
}

// =====================================================
// COMMUNICATION TYPES
// =====================================================

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  parcel_id: string;
  message: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  related_id?: string;
  related_type?: string;
  is_read: boolean;
  is_sent: boolean;
  sent_at?: string;
  created_at: string;
}

// =====================================================
// SYSTEM TYPES
// =====================================================

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Dispute {
  id: string;
  parcel_id: string;
  reporter_id: string;
  dispute_type: string;
  description: string;
  evidence_images?: string[];
  status: string;
  resolution?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export interface OperatingHours {
  [key: string]: {
    open: string;
    close: string;
    is_open: boolean;
  };
}

export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'inch';
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface DeliveryFee {
  base_fee: number;
  distance_fee: number;
  type_multiplier: number;
  total_fee: number;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateParcelRequest {
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string;
  package_type: PackageType;
  package_weight?: number;
  package_dimensions?: PackageDimensions;
  package_description?: string;
  package_images?: string[];
  dropoff_partner_id: string;
  pickup_partner_id: string;
  payment_method: PaymentMethod;
  delivery_fee: number;
  insurance_fee?: number;
}

export interface UpdateParcelStatusRequest {
  parcel_id: string;
  status: ParcelStatus;
  notes?: string;
  location?: Location;
  images?: string[];
}

export interface CreatePartnerRequest {
  business_name: string;
  business_license?: string;
  business_category?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  operating_hours?: OperatingHours;
  accepted_payment_methods?: PaymentMethod[];
}

export interface CreateDriverRequest {
  vehicle_type?: string;
  vehicle_number?: string;
  license_number?: string;
}

export interface PaymentRequest {
  amount: number;
  payment_method: PaymentMethod;
  parcel_id?: string;
  order_id?: string;
  user_id: string;
}

export interface PaymentResponse {
  success: boolean;
  transaction_id?: string;
  gateway_transaction_id?: string;
  message?: string;
  error?: string;
}

// =====================================================
// FORM VALIDATION TYPES
// =====================================================

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
}

export interface ParcelForm {
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string;
  package_type: PackageType;
  package_weight?: number;
  package_dimensions?: PackageDimensions;
  package_description?: string;
  dropoff_partner_id: string;
  pickup_partner_id: string;
  payment_method: PaymentMethod;
}

export interface PartnerForm {
  business_name: string;
  business_license?: string;
  business_category?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  operating_hours?: OperatingHours;
  accepted_payment_methods?: PaymentMethod[];
}

// =====================================================
// STATE MANAGEMENT TYPES
// =====================================================

export interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Parcel state
  parcels: Parcel[];
  activeParcel: Parcel | null;
  parcelEvents: ParcelEvent[];
  
  // Partner state
  partners: Partner[];
  nearbyPartners: Partner[];
  
  // Driver state
  drivers: Driver[];
  availableDrivers: Driver[];
  
  // E-commerce state
  shops: Shop[];
  shopItems: ShopItem[];
  cart: ShopOrder[];
  
  // Communication state
  messages: Message[];
  notifications: Notification[];
  unreadCount: number;
  
  // UI state
  currentLanguage: string;
  isOnline: boolean;
  currentLocation?: Location;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ParcelState {
  parcels: Parcel[];
  activeParcel: Parcel | null;
  parcelEvents: ParcelEvent[];
  isLoading: boolean;
  error: string | null;
}

// =====================================================
// NAVIGATION TYPES
// =====================================================

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Customer: undefined;
  Partner: undefined;
  Driver: undefined;
  Admin: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type CustomerStackParamList = {
  Dashboard: undefined;
  CreateParcel: undefined;
  TrackParcel: { trackingId?: string };
  ParcelDetails: { parcelId: string };
  Profile: undefined;
  Wallet: undefined;
  History: undefined;
};

export type PartnerStackParamList = {
  Dashboard: undefined;
  ScanParcel: undefined;
  Inventory: undefined;
  Earnings: undefined;
  Profile: undefined;
  ShopSetup: undefined;
};

export type DriverStackParamList = {
  Dashboard: undefined;
  Route: undefined;
  ScanParcel: undefined;
  Earnings: undefined;
  Profile: undefined;
};

export type AdminStackParamList = {
  Dashboard: undefined;
  UserManagement: undefined;
  PartnerManagement: undefined;
  Analytics: undefined;
  SystemSettings: undefined;
};

 