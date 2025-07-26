import React, { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../hooks/useCart';
import CartModalScreen from '../../screens/shop/CartModalScreen';
import CheckoutModalScreen from '../../screens/shop/CheckoutModalScreen';

interface ThemedProps {
  theme: {
    colors: {
      text: string;
      primary?: string;
    };
  };
}

const CartIcon = styled(Feather)<ThemedProps>`
  color: ${(props: ThemedProps) => props.theme.colors.text};
`;

const Badge = styled.View<{ theme: { colors: { primary?: string } } }>`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: ${(props: { theme: { colors: { primary?: string } } }) => props.theme.colors.primary || '#E63946'};
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
`;

const BadgeText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

interface CartButtonProps {
  badgeCount?: number;
}

export default function CartButton({ badgeCount = 0 }: CartButtonProps) {
  const { colors } = useTheme();
  const { getCartItemCount } = useCart();
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [selectedCartItems, setSelectedCartItems] = useState<any[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<any>(null);
  const [useDeliveryService, setUseDeliveryService] = useState(false);

  const cartItemCount = badgeCount > 0 ? badgeCount : getCartItemCount();

  const handleCartPress = () => {
    setCartModalVisible(true);
  };

  const handleProceedToCheckout = (cartItems: any[], pickupPoint: any, useDeliveryService: boolean) => {
    setSelectedCartItems(cartItems);
    setSelectedPickupPoint(pickupPoint);
    setUseDeliveryService(useDeliveryService);
    setCartModalVisible(false);
    setCheckoutModalVisible(true);
  };

  const handleOrderComplete = (orderId: string) => {
    setCheckoutModalVisible(false);
    // You can add navigation to order details or show success message
  };

  return (
    <>
      <TouchableOpacity onPress={handleCartPress}>
        <View style={{ position: 'relative' }}>
          <CartIcon name="shopping-cart" size={24} theme={{ colors }} />
          {cartItemCount > 0 && (
            <Badge theme={{ colors }}>
              <BadgeText>{cartItemCount > 99 ? '99+' : cartItemCount}</BadgeText>
            </Badge>
          )}
        </View>
      </TouchableOpacity>

      <CartModalScreen
        visible={cartModalVisible}
        onClose={() => setCartModalVisible(false)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModalScreen
        visible={checkoutModalVisible}
        onClose={() => setCheckoutModalVisible(false)}
        cartItems={selectedCartItems}
        pickupPoint={selectedPickupPoint}
        useDeliveryService={useDeliveryService}
        onOrderComplete={handleOrderComplete}
      />
    </>
  );
} 