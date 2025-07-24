import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';

// Customer Screens
import EShopHomeScreen from '../screens/HomeScreen'; // Use the new E-Shop Home
import CreateDeliveryScreen from '../screens/customer/CreateDeliveryScreen';
import DeliveryParametersScreen from '../screens/customer/DeliveryParametersScreen';
import TrackParcelScreen from '../screens/customer/TrackParcelScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import WalletScreen from '../screens/customer/WalletScreen';
import DeliveryHistoryScreen from '../screens/customer/DeliveryHistoryScreen';
import ShopDetailScreen from '../screens/shop/ShopDetailScreen';
import ProductDetailScreen from '../screens/shop/ProductDetailScreen';
import CartScreen from '../screens/shop/CartScreen';
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

import AppHeader from '../components/ui/AppHeader';

// New Stack for Delivery Flow
const DeliveryStack = createStackNavigator();

function DeliveryStackNavigator() {
  return (
    <DeliveryStack.Navigator screenOptions={{ headerShown: false }}>
        <DeliveryStack.Screen name="CreateDeliveryHome" component={CreateDeliveryScreen} />
        <DeliveryStack.Screen name="DeliveryParameters" component={DeliveryParametersScreen} />
    </DeliveryStack.Navigator>
);
}

type TabIconProps = {
  color: string;
  size: number;
};

const CustomerStack = createStackNavigator<CustomerStackParamList>();
const CustomerTab = createBottomTabNavigator<CustomerStackParamList>();
const PartnerTab = createBottomTabNavigator<PartnerStackParamList>();
const DriverTab = createBottomTabNavigator<DriverStackParamList>();
const AdminTab = createBottomTabNavigator<AdminStackParamList>();

const CustomerTabs = () => {
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
        component={EShopHomeScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="store" size={size} color={color} />
          ),
        }}
      />
      <CustomerTab.Screen
        name="CreateDelivery"
        component={DeliveryStackNavigator}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="plus-box" size={size} color={color} />
          ),
        }}
      />
      <CustomerTab.Screen
        name="TrackParcel"
        component={TrackParcelScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="map-marker-path" size={size} color={color} />
          ),
        }}
      />
      <CustomerTab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="wallet" size={size} color={color} />
          ),
        }}
      />
      <CustomerTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
      <CustomerTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="cog" size={size} color={color} />
          ),
        }}
      />
    </CustomerTab.Navigator>
  );
};

export const CustomerNavigator = () => {
  return (
    <CustomerStack.Navigator 
      screenOptions={{
        header: ({ navigation, route, options, back }) => (
          <AppHeader navigation={navigation} route={route} options={options} back={back} />
        ),
      }}
    >
      <CustomerStack.Screen name="HomeTabs" component={CustomerTabs} options={{ headerShown: false }} />
      <CustomerStack.Screen name="ShopDetail" component={ShopDetailScreen} />
      <CustomerStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <CustomerStack.Screen name="Cart" component={CartScreen} />
      <CustomerStack.Screen name="Wishlist" component={WishlistScreen} />
      <CustomerStack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    </CustomerStack.Navigator>
  );
};

export const PartnerNavigator = () => {
  const { colors } = useTheme();

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
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <PartnerTab.Screen
        name="ScanProcess"
        component={ScanProcessScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="qrcode-scan" size={size} color={color} />
          ),
        }}
      />
      <PartnerTab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="package-variant" size={size} color={color} />
          ),
        }}
      />
      <PartnerTab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="file-chart" size={size} color={color} />
          ),
        }}
      />
      <PartnerTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
      <PartnerTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="cog" size={size} color={color} />
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
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <DriverTab.Screen
        name="ActiveDeliveries"
        component={ActiveDeliveriesScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="truck-delivery" size={size} color={color} />
          ),
        }}
      />
      <DriverTab.Screen
        name="RouteMap"
        component={RouteMapScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="map-marker-radius" size={size} color={color} />
          ),
        }}
      />
      <DriverTab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="cash-multiple" size={size} color={color} />
          ),
        }}
      />
      <DriverTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
      <DriverTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="cog" size={size} color={color} />
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
            <Icon name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <AdminTab.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="account-group" size={size} color={color} />
          ),
        }}
      />
      <AdminTab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="chart-bar" size={size} color={color} />
          ),
        }}
      />
      <AdminTab.Screen
        name="Reports"
        component={AdminReportsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="file-document" size={size} color={color} />
          ),
        }}
      />
      <AdminTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
      <AdminTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Icon name="cog" size={size} color={color} />
          ),
        }}
      />
    </AdminTab.Navigator>
  );
}; 