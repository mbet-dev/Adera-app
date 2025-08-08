import type { NavigatorScreenParams } from '@react-navigation/native';
import { Partner } from './index';

export type AuthStackParamList = {
  Auth: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTP: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Parcels: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type CustomerStackParamList = {
  CustomerMainTabs: undefined;
  Home: undefined;
  Shop: undefined;
  CreateDelivery: undefined;
  DeliveryParameters: { partner: Partner };
  TrackParcel: { trackingId?: string };
  Profile: undefined;
  Settings: undefined;
  Wallet: undefined;
  DeliveryHistory: undefined;
  RecentParcels: undefined;
  ParcelDetails: { parcelId: string };
  // E-commerce screens
  ShopHome: undefined;
  ProductDetail: { itemId: string };
  Cart: undefined;
  Checkout: undefined;
  Wishlist: undefined;
  OrderHistory: undefined;
  QRScanner: undefined;
};

export type PartnerStackParamList = {
  Home: undefined;
  ScanProcess: undefined;
  Inventory: undefined;
  Reports: undefined;
  Profile: undefined;
  Settings: undefined;
  ManageDeliveries: undefined;
  Statistics: undefined;
  Business: { screen: 'Inventory' | 'Reports' | 'Statistics' } | undefined;
  Deliveries: undefined;
  Scan: undefined;
  ShopSetup: undefined;
};

export type DriverStackParamList = {
  Home: undefined;
  ActiveDeliveries: undefined;
  RouteMap: undefined;
  DeliveryHistory: undefined;
  Profile: undefined;
  Settings: undefined;
  Earnings: undefined;
  Schedule: undefined;
};

export type AdminStackParamList = {
  Dashboard: undefined;
  UserManagement: undefined;
  Analytics: undefined;
  Profile: undefined;
  Settings: undefined;
  SystemConfig: undefined;
  AuditLogs: undefined;
  Reports: undefined;
};

export type GuestStackParamList = {
  ShopHome: undefined;
  ProductDetail: { itemId: string };
  Cart: undefined;
  Wishlist: undefined;
  OrderHistory: undefined;
  AuthPrompt: { feature?: 'wallet' | 'delivery' | 'purchase' | 'wishlist' | 'order history' };
};

export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTP: { email: string };
  Main: undefined;
  GuestTabs: NavigatorScreenParams<GuestStackParamList>;
  CustomerMainTabs: NavigatorScreenParams<CustomerStackParamList>;
  PartnerTabs: NavigatorScreenParams<PartnerStackParamList>;
  DriverTabs: NavigatorScreenParams<DriverStackParamList>;
  AdminTabs: NavigatorScreenParams<AdminStackParamList>;
};
