import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { View } from 'react-native';
import { LoadingIndicator } from '../components/ui/LoadingIndicator';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/core';

// Customer Screens
import HomeScreen from '../screens/customer/HomeScreen';
import CreateDeliveryScreen from '../screens/customer/CreateDeliveryScreen';
import DeliveryParametersScreen from '../screens/customer/DeliveryParametersScreen';
import TrackParcelScreen from '../screens/customer/TrackParcelScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import WalletScreen from '../screens/customer/WalletScreen';
import DeliveryHistoryScreen from '../screens/customer/DeliveryHistoryScreen';
import RecentParcelsScreen from '../screens/customer/RecentParcelsScreen';
// E-commerce screens
import ShopHomeScreen from '../screens/shop/HomeScreen';
import ProductDetailScreen from '../screens/shop/ProductDetailScreen';
import CartScreen from '../screens/shop/CartScreen';
import CheckoutScreen from '../screens/shop/CheckoutScreen';
import WishlistScreen from '../screens/shop/WishlistScreen';
import OrderHistoryScreen from '../screens/shop/OrderHistoryScreen';

// Partner Screens
import PartnerHomeScreen from '../screens/partner/HomeScreen';
import ScanProcessScreen from '../screens/partner/ScanProcessScreen';
import InventoryScreen from '../screens/partner/InventoryScreen';
import ReportsScreen from '../screens/partner/ReportsScreen';
import ManageDeliveriesScreen from '../screens/partner/ManageDeliveriesScreen';
import StatisticsScreen from '../screens/partner/StatisticsScreen';

// Driver Screens
import DriverHomeScreen from '../screens/driver/HomeScreen';
import ActiveDeliveriesScreen from '../screens/driver/ActiveDeliveriesScreen';
import RouteMapScreen from '../screens/driver/RouteMapScreen';
import DriverHistoryScreen from '../screens/driver/DeliveryHistoryScreen';
import EarningsScreen from '../screens/driver/EarningsScreen';
import ScheduleScreen from '../screens/driver/ScheduleScreen';

// Admin Screens
import DashboardScreen from '../screens/admin/DashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import SystemConfigScreen from '../screens/admin/SystemConfigScreen';
import AuditLogsScreen from '../screens/admin/AuditLogsScreen';
import AdminReportsScreen from '../screens/admin/ReportsScreen';

import {
  CustomerStackParamList,
  PartnerStackParamList,
  DriverStackParamList,
  AdminStackParamList,
} from '../types/navigation';
import { Partner } from '../types/index';

// New Stack for Delivery Flow
type DeliveryStackParamList = {
    CreateDeliveryHome: undefined;
    DeliveryParameters: { partner: Partner };
};
const DeliveryStack = createStackNavigator<DeliveryStackParamList>();

// New Stack for E-commerce Flow
type EcommerceStackParamList = {
    ShopHome: undefined;
    ProductDetail: { itemId: string };
    Cart: undefined;
    Checkout: undefined;
    Wishlist: undefined;
    OrderHistory: undefined;
};
const EcommerceStack = createStackNavigator<EcommerceStackParamList>();

const DeliveryStackNavigator = () => (
    <DeliveryStack.Navigator screenOptions={{ headerShown: false }}>
        <DeliveryStack.Screen name="CreateDeliveryHome" component={CreateDeliveryScreen} />
        <DeliveryStack.Screen name="DeliveryParameters" component={DeliveryParametersScreen} />
    </DeliveryStack.Navigator>
);

const EcommerceStackNavigator = () => (
    <EcommerceStack.Navigator screenOptions={{ headerShown: false }}>
        <EcommerceStack.Screen name="ShopHome" component={ShopHomeScreen} />
        <EcommerceStack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <EcommerceStack.Screen name="Cart" component={CartScreen} />
        <EcommerceStack.Screen name="Checkout" component={CheckoutScreen} />
        <EcommerceStack.Screen name="Wishlist" component={WishlistScreen} />
        <EcommerceStack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    </EcommerceStack.Navigator>
);

type TabIconProps = {
  color: string;
  size: number;
};

const CustomerTab = createBottomTabNavigator<CustomerStackParamList>();
const PartnerTab = createBottomTabNavigator<PartnerStackParamList>();
const DriverTab = createBottomTabNavigator<DriverStackParamList>();
const AdminTab = createBottomTabNavigator<AdminStackParamList>();

// New Stack for Customer Flow
type CustomerStackParamListLocal = {
  CustomerMainTabs: undefined;
  RecentParcels: undefined;
  DeliveryHistory: undefined;
};
const CustomerStack = createStackNavigator<CustomerStackParamListLocal>();

const CustomerStackNavigator = () => (
  <CustomerStack.Navigator screenOptions={{ headerShown: false }}>
    <CustomerStack.Screen name="CustomerMainTabs" component={CustomerTabNavigator} />
    <CustomerStack.Screen name="RecentParcels" component={RecentParcelsScreen} />
    <CustomerStack.Screen name="DeliveryHistory" component={DeliveryHistoryScreen} />
  </CustomerStack.Navigator>
);

const CustomerTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <CustomerTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
      }}
    >
      <CustomerTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <CustomerTab.Screen
        name="Shop"
        component={EcommerceStackNavigator}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="shopping-bag" size={size} color={color} />
          ),
        }}
      />
      <CustomerTab.Screen
        name="CreateDelivery"
        component={DeliveryStackNavigator}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="plus" size={size} color={color} />
          ),
        }}
      />
      <CustomerTab.Screen
        name="TrackParcel"
        component={TrackParcelScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="map-pin" size={size} color={color} />
          ),
        }}
      />
      <CustomerTab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="credit-card" size={size} color={color} />
          ),
        }}
      />
      <CustomerTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
      <CustomerTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </CustomerTab.Navigator>
  );
};

export const CustomerNavigator = () => {
  return <CustomerStackNavigator />;
};

export const PartnerNavigator = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [hasShop, setHasShop] = useState<boolean | null>(null);

  // Check if partner has a shop
  useEffect(() => {
    const checkShopStatus = async () => {
      if (user?.id) {
        try {
          const shopResponse = await ApiService.getShopByPartnerId(user.id);
          setHasShop(shopResponse.success && !!shopResponse.data);
        } catch (error) {
          console.error('Error checking shop status:', error);
          setHasShop(false);
        }
      }
    };
    checkShopStatus();
  }, [user?.id]);

  // Show loading while checking shop status
  if (hasShop === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingIndicator />
      </View>
    );
  }

  return (
    <PartnerTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
      }}
    >
      <PartnerTab.Screen
        name="Home"
        component={PartnerHomeScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <PartnerTab.Screen
        name="ScanProcess"
        component={ScanProcessScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="search" size={size} color={color} />
          ),
        }}
      />
      {/* Only show shop-related tabs if partner has a shop */}
      {hasShop && (
        <>
          <PartnerTab.Screen
            name="Inventory"
            component={InventoryScreen}
            options={{
              tabBarIcon: ({ color, size }: TabIconProps) => (
                <Feather name="package" size={size} color={color} />
              ),
            }}
          />
          <PartnerTab.Screen
            name="Reports"
            component={ReportsScreen}
            options={{
              tabBarIcon: ({ color, size }: TabIconProps) => (
                <Feather name="bar-chart-2" size={size} color={color} />
              ),
            }}
          />
        </>
      )}
      <PartnerTab.Screen
        name="ManageDeliveries"
        component={ManageDeliveriesScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="truck" size={size} color={color} />
          ),
        }}
      />
      <PartnerTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
      <PartnerTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </PartnerTab.Navigator>
  );
};

export const DriverNavigator = () => {
  const { colors } = useTheme();

  return (
    <DriverTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
      }}
    >
      <DriverTab.Screen
        name="Home"
        component={DriverHomeScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <DriverTab.Screen
        name="ActiveDeliveries"
        component={ActiveDeliveriesScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="truck" size={size} color={color} />
          ),
        }}
      />
      <DriverTab.Screen
        name="RouteMap"
        component={RouteMapScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="map" size={size} color={color} />
          ),
        }}
      />
      <DriverTab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="dollar-sign" size={size} color={color} />
          ),
        }}
      />
      <DriverTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
      <DriverTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </DriverTab.Navigator>
  );
};

export const AdminNavigator = () => {
  const { colors } = useTheme();

  return (
    <AdminTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
      }}
    >
      <AdminTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="grid" size={size} color={color} />
          ),
        }}
      />
      <AdminTab.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="users" size={size} color={color} />
          ),
        }}
      />
      <AdminTab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
      <AdminTab.Screen
        name="SystemConfig"
        component={SystemConfigScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="file-text" size={size} color={color} />
          ),
        }}
      />
      <AdminTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
      <AdminTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </AdminTab.Navigator>
  );
}; 