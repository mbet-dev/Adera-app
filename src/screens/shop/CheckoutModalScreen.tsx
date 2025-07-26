import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { PaymentMethod, User } from '../../types';

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

interface CheckoutModalScreenProps {
  visible: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  pickupPoint: PickupPoint | null;
  useDeliveryService?: boolean;
  onOrderComplete: (orderId: string) => void;
}

export default function CheckoutModalScreen({ 
  visible, 
  onClose, 
  cartItems, 
  pickupPoint, 
  useDeliveryService = false,
  onOrderComplete 
}: CheckoutModalScreenProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('wallet');
  const [createDeliveryOrder, setCreateDeliveryOrder] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPoint | null>(pickupPoint);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [pickupSearchText, setPickupSearchText] = useState('');
  const [shopLocation, setShopLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isCalculatingDeliveryFee, setIsCalculatingDeliveryFee] = useState(false);

  React.useEffect(() => {
    // Fetch pickup points from backend (Supabase)
    const fetchPickupPoints = async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('id, business_name, address, latitude, longitude')
        .eq('is_facility', false)
        .eq('is_active', true)
        .not('business_name', 'is', null)
        .not('address', 'is', null);
      if (!error && data) {
        // Sort alphabetically by business name
        const sortedData = data.sort((a, b) => 
          a.business_name.localeCompare(b.business_name)
        );
        setPickupPoints(sortedData);
      }
    };
    fetchPickupPoints();
  }, []);

  // Fetch shop location when cart items change
  React.useEffect(() => {
    const fetchShopLocation = async () => {
      if (cartItems.length > 0) {
        console.log('Fetching shop location for shop_id:', cartItems[0].shop_id);
        
        const { data, error } = await supabase
          .from('shops')
          .select(`
            partner_id,
            partners!inner(latitude, longitude)
          `)
          .eq('id', cartItems[0].shop_id)
          .single();

        console.log('Shop location data:', data, 'Error:', error);

        if (!error && data?.partners && typeof data.partners === 'object' && 'latitude' in data.partners && 'longitude' in data.partners) {
          const location = {
            latitude: (data.partners as any).latitude as number,
            longitude: (data.partners as any).longitude as number
          };
          console.log('Setting shop location:', location);
          setShopLocation(location);
        } else {
          console.log('No shop location found or error occurred');
        }
      }
    };

    fetchShopLocation();
  }, [cartItems]);

  // Debug shop location changes and trigger delivery fee recalculation
  React.useEffect(() => {
    console.log('Shop location changed:', shopLocation);
    
    // If we have a shop location and delivery is enabled with a pickup point, recalculate
    if (shopLocation && createDeliveryOrder && selectedPickupPoint) {
      console.log('Triggering delivery fee recalculation due to shop location change');
      const distance = calculateDistance(
        shopLocation.latitude,
        shopLocation.longitude,
        selectedPickupPoint.latitude,
        selectedPickupPoint.longitude
      );
      const fee = calculateDeliveryFee(distance);
      console.log('Recalculated delivery fee after shop location change:', {
        distance: distance.toFixed(2) + ' km',
        fee: fee + ' ETB'
      });
      setDeliveryFee(fee);
    }
  }, [shopLocation, createDeliveryOrder, selectedPickupPoint]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate delivery fee based on distance
  const calculateDeliveryFee = (distance: number): number => {
    const baseFee = 125; // Base delivery fee in ETB
    const perKmFee = 25; // Additional fee per kilometer
    return baseFee + (distance * perKmFee);
  };

  // Update delivery fee when pickup point changes
  React.useEffect(() => {
    console.log('Delivery fee calculation triggered:', {
      createDeliveryOrder,
      selectedPickupPoint: selectedPickupPoint?.business_name,
      shopLocation,
      deliveryFee
    });

    if (createDeliveryOrder && selectedPickupPoint) {
      setIsCalculatingDeliveryFee(true);
      
      if (shopLocation) {
        const distance = calculateDistance(
          shopLocation.latitude,
          shopLocation.longitude,
          selectedPickupPoint.latitude,
          selectedPickupPoint.longitude
        );
        const fee = calculateDeliveryFee(distance);
        console.log('Calculated delivery fee with actual distance:', {
          shopLocation,
          selectedPickupPoint: {
            name: selectedPickupPoint.business_name,
            lat: selectedPickupPoint.latitude,
            lon: selectedPickupPoint.longitude
          },
          distance: distance.toFixed(2) + ' km',
          fee: fee + ' ETB',
          baseFee: 125,
          perKmFee: 25
        });
        setDeliveryFee(fee);
      } else {
        // Fallback: use a default distance if shop location is not available
        console.log('Shop location not available, using default distance calculation');
        const defaultDistance = 5.0; // Default 5km distance
        const fee = calculateDeliveryFee(defaultDistance);
        console.log('Using default delivery fee:', {
          distance: defaultDistance + ' km',
          fee: fee + ' ETB'
        });
        setDeliveryFee(fee);
      }
      
      setIsCalculatingDeliveryFee(false);
    } else {
      console.log('Resetting delivery fee to 0');
      setDeliveryFee(0);
      setIsCalculatingDeliveryFee(false);
    }
  }, [selectedPickupPoint, createDeliveryOrder, shopLocation]);

  // Only show early return for cart flow, not Buy Now flow
  const isBuyNowFlow = cartItems.length === 1 && cartItems[0].id.startsWith('buy-now-');
  
  // Remove the early return - pickup point is now optional and only required for delivery service

  const paymentMethods: { method: PaymentMethod; label: string; icon: string }[] = [
    { method: 'wallet', label: 'Adera Wallet', icon: 'credit-card' },
    { method: 'mobile_banking', label: 'Mobile Banking', icon: 'smartphone' },
  ];

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.item.price * item.quantity), 0);
  };

  const calculateCommission = () => {
    return calculateSubtotal() * 0.05; // 5% commission
  };

  const getDeliveryFee = () => {
    return deliveryFee;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateCommission() + getDeliveryFee();
  };

  const handlePayment = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to complete your order.');
      return;
    }

    // Check if delivery service is enabled but no pickup point selected
    if (createDeliveryOrder && !selectedPickupPoint) {
      Alert.alert('Error', 'Please select a pickup point for delivery service.');
      return;
    }

    setProcessing(true);

    try {
      // 1. Create shop orders for each item
      const orderPromises = cartItems.map(async (cartItem) => {
        const { data: orderData, error: orderError } = await supabase
          .from('shop_orders')
          .insert({
            shop_id: cartItem.shop_id,
            buyer_id: user.id,
            item_id: cartItem.item_id,
            quantity: cartItem.quantity,
            unit_price: cartItem.item.price,
            total_amount: cartItem.item.price * cartItem.quantity,
            delivery_fee: createDeliveryOrder ? deliveryFee : 0,
            payment_method: selectedPaymentMethod,
            payment_status: 'pending',
            delivery_method: 'pickup',
            delivery_status: 'created',
            pickup_partner_id: selectedPickupPoint?.id || null, // Allow null for Buy Now
          })
          .select()
          .single();

        if (orderError) throw orderError;
        return orderData;
      });

      const orders = await Promise.all(orderPromises);

      // 2. Create delivery order if requested
      let deliveryOrderId: string | null = null;
      if (createDeliveryOrder && selectedPickupPoint) {
        const { data: deliveryData, error: deliveryError } = await supabase
          .from('parcels')
          .insert({
            sender_id: user.id,
            recipient_name: (user?.user_metadata?.first_name || 'User') + ' ' + (user?.user_metadata?.last_name || ''), // Use user's name from metadata
            recipient_phone: user?.user_metadata?.phone_number || '',
            package_type: 'medium',
            package_description: `E-commerce order delivery - ${cartItems.length} items`,
            delivery_fee: deliveryFee,
            total_amount: deliveryFee,
            payment_method: selectedPaymentMethod,
            payment_status: 'pending',
            status: 'created',
            pickup_partner_id: selectedPickupPoint.id,
          })
          .select()
          .single();

        if (deliveryError) throw deliveryError;
        deliveryOrderId = deliveryData.id;
      }

      // 3. Clear cart (only for cart flow, not Buy Now)
      if (!isBuyNowFlow) {
        const { error: clearCartError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (clearCartError) {
          console.error('Clear cart error:', clearCartError);
          // Don't fail the order for cart clearing errors
        }
      }

      // 4. Update Adera's wallet with commission (simplified approach)
      const commissionAmount = calculateCommission();
      // For now, we'll skip the commission update to avoid SQL issues
      // This can be implemented later with proper RPC functions

      Alert.alert(
        'Order Complete!',
        `Your order has been placed successfully.${deliveryOrderId ? ' A delivery order has also been created.' : ''}`,
        [
          {
            text: 'OK',
            onPress: () => {
              onOrderComplete(orders[0].id);
              onClose();
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to process your order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentMethod = ({ method, label, icon }: { method: PaymentMethod; label: string; icon: string }) => (
    <TouchableOpacity
      key={method}
      style={[
        styles.paymentMethod,
        { 
          backgroundColor: colors.card, 
          borderColor: selectedPaymentMethod === method ? colors.primary || '#E63946' : colors.border 
        }
      ]}
      onPress={() => setSelectedPaymentMethod(method)}
    >
      <View style={styles.paymentMethodHeader}>
        <Feather 
          name={selectedPaymentMethod === method ? "check-circle" : "circle"} 
          size={20} 
          color={selectedPaymentMethod === method ? colors.primary || '#E63946' : colors.text} 
        />
        <Feather name={icon as any} size={20} color={colors.text} style={{ marginLeft: 8 }} />
        <Text style={[styles.paymentMethodLabel, { color: colors.text }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  // Filter pickup points based on search text
  const filteredPickupPoints = pickupPoints.filter(point =>
    point.business_name.toLowerCase().includes(pickupSearchText.toLowerCase()) ||
    point.address.toLowerCase().includes(pickupSearchText.toLowerCase())
  );

  const renderPickupDropdown = () => (
    <Modal
      visible={showPickupDropdown}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowPickupDropdown(false)}
    >
      <TouchableOpacity
        style={styles.dropdownOverlay}
        activeOpacity={1}
        onPress={() => setShowPickupDropdown(false)}
      >
        <View style={[styles.dropdownContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.dropdownTitle, { color: colors.text }]}>Select Pickup Point</Text>
          
          {/* Search Input */}
          <View style={[styles.searchContainer, { borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.border} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search pickup points..."
              placeholderTextColor={colors.border}
              value={pickupSearchText}
              onChangeText={setPickupSearchText}
            />
          </View>

          {/* Scrollable Pickup Points List */}
          <ScrollView style={styles.pickupPointsList} showsVerticalScrollIndicator={true}>
            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setSelectedPickupPoint(null);
                setShowPickupDropdown(false);
                setPickupSearchText('');
              }}
            >
              <Text style={{ color: colors.text }}>No Pickup Point (self pickup)</Text>
            </TouchableOpacity>
            
            {filteredPickupPoints.map((point) => (
              <TouchableOpacity
                key={point.id}
                style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setSelectedPickupPoint(point);
                  setShowPickupDropdown(false);
                  setPickupSearchText('');
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>{point.business_name}</Text>
                <Text style={{ color: colors.border, fontSize: 12, marginTop: 2 }}>{point.address}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}> 
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}> 
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isBuyNowFlow ? 'Buy Now' : 'Checkout'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView style={styles.content}>
          {/* Order Summary */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={[styles.orderItemName, { color: colors.text }]}>{item.item.name}</Text>
                <Text style={[styles.orderItemDetails, { color: colors.text }]}>
                  {item.quantity} × ETB {item.item.price.toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={[styles.summaryRow, { borderTopColor: colors.border }]}>
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
            {createDeliveryOrder && (
              <>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.text }]}>Delivery Fee:</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {isCalculatingDeliveryFee ? 'Calculating...' : deliveryFee > 0 ? `ETB ${deliveryFee.toLocaleString()}` : 'Select pickup point'}
                  </Text>
                </View>
                {deliveryFee > 0 && shopLocation && selectedPickupPoint && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.text, fontSize: 12 }]}>Distance:</Text>
                    <Text style={[styles.summaryValue, { color: colors.text, fontSize: 12 }]}>
                      {calculateDistance(
                        shopLocation.latitude,
                        shopLocation.longitude,
                        selectedPickupPoint.latitude,
                        selectedPickupPoint.longitude
                      ).toFixed(2)} km
                    </Text>
                  </View>
                )}
              </>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.summaryLabel, styles.totalLabel, { color: colors.text }]}>Total:</Text>
              <Text style={[styles.summaryValue, styles.totalValue, { color: colors.primary || '#E63946' }]}>
                ETB {calculateTotal().toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Pickup Point (only if delivery service is used and not Buy Now flow) */}
          {createDeliveryOrder && selectedPickupPoint && !isBuyNowFlow && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Pickup Point</Text>
              <View style={styles.pickupPointInfo}>
                <Feather name="map-pin" size={16} color={colors.text} />
                <Text style={[styles.pickupPointName, { color: colors.text }]}>{selectedPickupPoint.business_name}</Text>
              </View>
              <Text style={[styles.pickupPointAddress, { color: colors.text }]}>{selectedPickupPoint.address}</Text>
            </View>
          )}

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
            {paymentMethods.map(renderPaymentMethod)}
          </View>

          {/* Delivery Option */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <View style={styles.deliveryHeader}>
              <TouchableOpacity
                style={styles.deliveryToggle}
                onPress={() => setCreateDeliveryOrder(!createDeliveryOrder)}
              >
                <Feather 
                  name={createDeliveryOrder ? "check-square" : "square"} 
                  size={20} 
                  color={colors.primary || '#E63946'} 
                />
                <Text style={[styles.deliveryLabel, { color: colors.text }]}>Create delivery order for purchased items</Text>
              </TouchableOpacity>
            </View>
            {createDeliveryOrder && (
              <>
                {/* Pickup Point Dropdown */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Pickup Point (required for delivery)</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.background }]}
                  onPress={() => setShowPickupDropdown(true)}
                >
                  <Text style={{ color: colors.text }}>
                    {selectedPickupPoint ? selectedPickupPoint.business_name : 'Select a pickup point...'}
                  </Text>
                  <Feather name="chevron-down" size={16} color={colors.text} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
        {/* Payment Button */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}> 
          <TouchableOpacity
            style={[
              styles.payBtn,
              { 
                backgroundColor: processing ? colors.border : colors.primary || '#E63946',
                opacity: processing ? 0.5 : 1
              }
            ]}
            onPress={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.payBtnText}>
                Pay ETB {calculateTotal().toLocaleString()}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        {renderPickupDropdown()}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  orderItem: {
    marginBottom: 8,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderItemDetails: {
    fontSize: 12,
    opacity: 0.7,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    paddingTop: 8,
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
  pickupPointInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pickupPointName: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  pickupPointAddress: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 24,
  },
  paymentMethod: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  deliveryHeader: {
    marginBottom: 12,
  },
  deliveryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  payBtn: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  pickupPointsList: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
}); 