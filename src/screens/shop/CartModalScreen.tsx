import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Modal,
  FlatList,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface CartItem {
  id: string;
  item_id: string;
  shop_id: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    price: number;
    image_urls?: string[];
    shop: {
      shop_name: string;
    };
  };
}

interface PickupPoint {
  id: string;
  business_name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export default function CartModalScreen({ visible, onClose, onProceedToCheckout }: {
  visible: boolean;
  onClose: () => void;
  onProceedToCheckout: (cartItems: CartItem[], pickupPoint: PickupPoint | null, useDeliveryService: boolean) => void;
}) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && user) {
      fetchCartItems();
    }
  }, [visible, user]);

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          item_id,
          shop_id,
          quantity,
          item:shop_items(
            id,
            name,
            price,
            image_urls,
            shop:shops(shop_name)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: CartItem[] = (data || []).map((item: any) => ({
        id: item.id,
        item_id: item.item_id,
        shop_id: item.shop_id,
        quantity: item.quantity,
        item: {
          id: item.item.id,
          name: item.item.name,
          price: item.item.price,
          image_urls: item.item.image_urls,
          shop: {
            shop_name: item.item.shop?.shop_name || 'Unknown Shop'
          }
        }
      }));
      
      setCartItems(transformedData);
    } catch (err: any) {
      console.error('Error fetching cart items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;
      fetchCartItems(); // Refresh cart
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      fetchCartItems(); // Refresh cart
    } catch (err: any) {
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.item.price * item.quantity), 0);
  };

  const calculateCommission = () => {
    return calculateSubtotal() * 0.05; // 5% commission
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateCommission();
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }

    // Pass cart items without pickup point - pickup point selection will be handled in checkout
    onProceedToCheckout(cartItems, null, false);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View key={item.id} style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.itemImage}>
        {item.item.image_urls && item.item.image_urls.length > 0 ? (
          <Image source={{ uri: item.item.image_urls[0] }} style={styles.image} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
            <Feather name="image" size={24} color={colors.text} />
          </View>
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
          {item.item.name}
        </Text>
        <Text style={[styles.itemPrice, { color: colors.primary || '#E63946' }]}>
          ETB {item.item.price.toLocaleString()}
        </Text>
        <Text style={[styles.itemShop, { color: colors.border }]}>
          {item.item.shop.shop_name}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityBtn, { borderColor: colors.border }]}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Feather name="minus" size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.quantityBtn, { borderColor: colors.border }]}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Feather name="plus" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => removeFromCart(item.id)}
        >
          <Feather name="trash-2" size={16} color={colors.error || '#E63946'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary || '#E63946'} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading cart...</Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Cart</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView style={styles.content}>
          {/* Cart Items */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Cart Items ({cartItems.length})
            </Text>
            {cartItems.length > 0 ? (
              <FlatList
                data={cartItems}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyCart}>
                <Feather name="shopping-cart" size={48} color={colors.border} />
                <Text style={[styles.emptyCartText, { color: colors.text }]}>
                  Your cart is empty
                </Text>
                <Text style={[styles.emptyCartSubtext, { color: colors.border }]}>
                  Add some items to get started
                </Text>
              </View>
            )}
          </View>

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ETB {calculateSubtotal().toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>Commission (5%):</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ETB {calculateCommission().toLocaleString()}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={[styles.summaryLabel, styles.totalLabel, { color: colors.text }]}>Total:</Text>
                <Text style={[styles.summaryValue, styles.totalValue, { color: colors.primary || '#E63946' }]}>
                  ETB {calculateTotal().toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.checkoutBtn,
                { backgroundColor: colors.primary || '#E63946' }
              ]}
              onPress={handleProceedToCheckout}
            >
              <Text style={styles.checkoutBtnText}>
                Proceed to Checkout
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemShop: {
    fontSize: 12,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  removeBtn: {
    padding: 8,
  },
  emptyCart: {
    alignItems: 'center',
    padding: 40,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyCartSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  summary: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  checkoutBtn: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
  },
}); 