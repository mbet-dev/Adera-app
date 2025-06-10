import type { NavigatorScreenParams } from '@react-navigation/native';
import { Partner } from './database';

export type AuthStackParamList = {
  Auth: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTP: { email: string };
};

export type CustomerStackParamList = {
  Home: undefined;
  CreateDelivery: undefined;
  DeliveryParameters: { partner: Partner };
  TrackParcel: undefined;
  Profile: undefined;
  Settings: undefined;
  Wallet: undefined;
  DeliveryHistory: undefined;
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

export type RootStackParamList = {
  Auth: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTP: { email: string };
  CustomerTabs: NavigatorScreenParams<CustomerStackParamList>;
  PartnerTabs: NavigatorScreenParams<PartnerStackParamList>;
  DriverTabs: NavigatorScreenParams<DriverStackParamList>;
  AdminTabs: NavigatorScreenParams<AdminStackParamList>;
}; 