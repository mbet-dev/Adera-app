import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GuestStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<GuestStackParamList, 'Cart'>;

export default function GuestCartScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { state: cartState, clearCart, removeItem, updateQuantity } = useCart();

  const handleSignUp = () => {
    navigation.navigate('AuthPrompt', { feature: 'purchase' });
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  const formatPrice = (price: number | undefined): string => {
    if (typeof price !== 'number' || isNaN(price)) {
      return '0 ETB';
    }
    return price.toLocaleString('en-ET') + ' ETB';
  };

  const totalAmount = cartState.items.reduce(
    (total, item) => {
      const price = item.product?.price || 0;
      return total + price * item.quantity;
    },
    0
  );

  if (cartState.items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Shopping Cart
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <Feather name="shopping-cart" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Your cart is empty
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Start browsing to add items to your cart
          </Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('ShopHome')}
          >
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Shopping Cart ({cartState.items.length})
        </Text>
        <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
          <Feather name="trash-2" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {cartState.items.map((item) => (
          <View
            key={item.id}
            style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                {item.product?.name || 'Unknown Product'}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.primary }]}>
                {formatPrice(item.product?.price)}
              </Text>
            </View>

            <View style={styles.itemActions}>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[styles.quantityButton, { borderColor: colors.border }]}
                  onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                >
                  <Feather name="minus" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.quantityText, { color: colors.text }]}>
                  {item.quantity}
                </Text>
                <TouchableOpacity
                  style={[styles.quantityButton, { borderColor: colors.border }]}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Feather name="plus" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
              >
                <Feather name="x" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Authentication Prompt */}
        <View style={[styles.authPrompt, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.authPromptContent}>
            <Feather name="lock" size={40} color={colors.primary} />
            <Text style={[styles.authPromptTitle, { color: colors.text }]}>
              Sign up to complete your purchase
            </Text>
            <Text style={[styles.authPromptText, { color: colors.textSecondary }]}>
              Create an account to access your secure wallet and complete this purchase
            </Text>
            <TouchableOpacity
              style={[styles.signUpButton, { backgroundColor: colors.primary }]}
              onPress={handleSignUp}
            >
              <Text style={styles.signUpButtonText}>Sign Up Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Cart Summary */}
      <View style={[styles.summary, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>
            Subtotal ({cartState.items.length} items)
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatPrice(totalAmount)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={handleSignUp}
        >
          <Feather name="credit-card" size={20} color="#FFFFFF" />
          <Text style={styles.checkoutButtonText}>Sign Up to Purchase</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  browseButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cartItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemInfo: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  authPrompt: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 20,
  },
  authPromptContent: {
    alignItems: 'center',
  },
  authPromptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  authPromptText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  signUpButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summary: {
    padding: 20,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
