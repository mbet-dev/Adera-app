import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../types/navigation';
import { useCart } from '../../contexts/CartContext';
import PickupPointSelector from '../../components/ecommerce/PickupPointSelector';
import { PaymentMethod } from '../../types';

type CheckoutNavigationProp = StackNavigationProp<CustomerStackParamList, 'Checkout'>;

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<CheckoutNavigationProp>();
  const { state: cartState, clearCart, setDeliveryFee } = useCart();
  
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<any>(null);
  const [showPickupSelector, setShowPickupSelector] = useState(false);
  const [useDeliveryService, setUseDeliveryService] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.WALLET);

  const formatPrice = (price: number): string => {
    return price.toLocaleString('en-ET');
  };

  const calculateSubtotal = () => {
    return cartState.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateDeliveryFee = () => {
    if (!useDeliveryService || !selectedPickupPoint) return 0;

    // Base fee + distance-based fee
    const baseFee = 125;
    const perKmFee = 25;
    const distance = selectedPickupPoint.distance || 5; // Default 5km if no distance

    return baseFee + (distance * perKmFee);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee();
  };

  const handlePickupPointSelect = (point: any) => {
    setSelectedPickupPoint(point);
    const fee = calculateDeliveryFee();
    setDeliveryFee(fee);
  };

  const handlePayment = () => {
    if (useDeliveryService && !selectedPickupPoint) {
      Alert.alert('Error', 'Please select a pickup point for delivery service.');
      return;
    }

    // Validate recipient info if delivery service is enabled
    if (useDeliveryService) {
      if (!recipientName.trim()) {
        Alert.alert('Error', 'Please enter recipient name.');
        return;
      }
      if (!recipientPhone.trim()) {
        Alert.alert('Error', 'Please enter recipient phone number.');
        return;
      }
    }

    Alert.alert(
      'Confirm Payment',
      `Total Amount: ETB ${formatPrice(calculateTotal())}\nPayment Method: ${paymentMethod}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Now', 
          onPress: () => {
            Alert.alert('Success', 'Payment successful! Your order has been placed.');
            clearCart();
            navigation.navigate('ShopHome');
          }
        }
      ]
    );
  };

  if (cartState.items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.emptyContainer}>
          <Feather name="shopping-cart" size={64} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.border }]}>
            Add some products to your cart to continue
          </Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.primary || '#E63946' }]}
            onPress={() => navigation.navigate('ShopHome')}
          >
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          {cartState.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={[styles.itemQuantity, { color: colors.border }]}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: colors.primary || '#E63946' }]}>
                ETB {formatPrice(item.product.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery Options */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Options</Text>
          
          <TouchableOpacity
            style={styles.deliveryToggle}
            onPress={() => setUseDeliveryService(!useDeliveryService)}
          >
            <View style={styles.toggleContainer}>
              <Feather 
                name={useDeliveryService ? "check-square" : "square"} 
                size={20} 
                color={colors.primary || '#E63946'} 
              />
              <Text style={[styles.toggleText, { color: colors.text }]}>
                Use Adera's Delivery for the purchased items
              </Text>
            </View>
            <Text style={[styles.deliveryFee, { color: colors.primary || '#E63946' }]}>
              Base Fee: ETB 125
            </Text>
          </TouchableOpacity>

          {useDeliveryService && (
            <>
              {/* Recipient Information */}
              <View style={styles.recipientContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Recipient Name (Optional)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    }
                  ]}
                  value={recipientName}
                  onChangeText={setRecipientName}
                  placeholder="Enter recipient name"
                  placeholderTextColor={colors.border}
                />
              </View>

              <View style={styles.recipientContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Recipient Phone (Optional)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    }
                  ]}
                  value={recipientPhone}
                  onChangeText={setRecipientPhone}
                  placeholder="Enter recipient phone number"
                  placeholderTextColor={colors.border}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Pickup Point Selection */}
              <View style={styles.pickupPointContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Pickup Point:</Text>
                <TouchableOpacity
                  style={[styles.pickupPointButton, {
                    backgroundColor: colors.background,
                    borderColor: colors.border
                  }]}
                  onPress={() => setShowPickupSelector(true)}
                >
                  <Text style={[styles.pickupPointText, { color: colors.text }]}>
                    {selectedPickupPoint ? selectedPickupPoint.business_name : 'Select pickup point'}
                  </Text>
                  <Feather name="chevron-down" size={16} color={colors.border} />
                </TouchableOpacity>
              </View>

              {selectedPickupPoint && (
                <View style={styles.distanceInfo}>
                  <Text style={[styles.distanceText, { color: colors.border }]}>
                    Distance: {selectedPickupPoint.distance?.toFixed(1) || '5.0'} km
                  </Text>
                  <Text style={[styles.deliveryFeeText, { color: colors.primary || '#E63946' }]}>
                    Delivery Fee: ETB {formatPrice(calculateDeliveryFee())}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          
          {['wallet', 'telebirr', 'chapa', 'cash'].map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentOption,
                {
                  borderColor: paymentMethod === method ? colors.primary || '#E63946' : colors.border
                }
              ]}
              onPress={() => setPaymentMethod(method as PaymentMethod)}
            >
              <View style={styles.paymentInfo}>
                <Feather 
                  name={
                    method === 'wallet' ? 'credit-card' :
                    method === 'telebirr' ? 'smartphone' :
                    method === 'chapa' ? 'globe' : 'dollar-sign'
                  } 
                  size={20} 
                  color={paymentMethod === method ? colors.primary || '#E63946' : colors.text} 
                />
                <Text style={[
                  styles.paymentText, 
                  { color: paymentMethod === method ? colors.primary || '#E63946' : colors.text }
                ]}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Text>
              </View>
              {paymentMethod === method && (
                <Feather name="check" size={20} color={colors.primary || '#E63946'} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Breakdown */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Breakdown</Text>
          
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.text }]}>Subtotal:</Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              ETB {formatPrice(calculateSubtotal())}
            </Text>
          </View>
          
          {useDeliveryService && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.text }]}>Delivery Fee:</Text>
              <Text style={[styles.priceValue, { color: colors.primary || '#E63946' }]}>
                ETB {formatPrice(calculateDeliveryFee())}
              </Text>
            </View>
          )}
          
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
            <Text style={[styles.totalValue, { color: colors.primary || '#E63946' }]}>
              ETB {formatPrice(calculateTotal())}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={[styles.paymentButtonContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.paymentButton, { backgroundColor: colors.primary || '#E63946' }]}
          onPress={handlePayment}
        >
          <Text style={styles.paymentButtonText}>
            Pay ETB {formatPrice(calculateTotal())}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pickup Point Selector Modal */}
      <PickupPointSelector
        visible={showPickupSelector}
        onClose={() => setShowPickupSelector(false)}
        onSelect={handlePickupPointSelect}
        selectedPoint={selectedPickupPoint}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  deliveryToggle: {
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  deliveryFee: {
    fontSize: 12,
    fontWeight: '500',
  },
  recipientContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickupPointContainer: {
    marginBottom: 16,
  },
  pickupPointButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  pickupPointText: {
    fontSize: 16,
    flex: 1,
  },
  distanceInfo: {
    marginTop: 8,
  },
  distanceText: {
    fontSize: 12,
    marginBottom: 4,
  },
  deliveryFeeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 16,
    marginLeft: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  paymentButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 