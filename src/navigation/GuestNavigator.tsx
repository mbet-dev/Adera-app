import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';

// Guest accessible screens
import ShopHomeScreen from '../screens/shop/HomeScreen';
import ProductDetailScreen from '../screens/shop/ProductDetailScreen';
import GuestCartScreen from '../screens/guest/GuestCartScreen';
import GuestWishlistScreen from '../screens/guest/GuestWishlistScreen';
import GuestOrderHistoryScreen from '../screens/guest/GuestOrderHistoryScreen';
import AuthPromptScreen from '../screens/auth/AuthPromptScreen';

import { GuestStackParamList } from '../types/navigation';

const Stack = createStackNavigator<GuestStackParamList>();

type TabIconProps = {
  color: string;
  size: number;
};

export const GuestNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShopHome" component={ShopHomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={GuestCartScreen} />
      <Stack.Screen name="Wishlist" component={GuestWishlistScreen} />
      <Stack.Screen name="OrderHistory" component={GuestOrderHistoryScreen} />
      <Stack.Screen name="AuthPrompt" component={AuthPromptScreen} />
    </Stack.Navigator>
  );
};
