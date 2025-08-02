import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../types/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type OrderHistoryNavigationProp = StackNavigationProp<CustomerStackParamList, 'OrderHistory'>;

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_urls?: string[];
}

export default function OrderHistoryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<OrderHistoryNavigationProp>();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const formatPrice = (price: number): string => {
    return price.toLocaleString('en-ET');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return colors.success || '#28a745';
      case 'pending':
        return colors.warning || '#ffc107';
      case 'cancelled':
        return colors.error || '#dc3545';
      default:
        return colors.primary || '#E63946';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'check-circle';
      case 'pending':
        return 'clock';
      case 'cancelled':
        return 'x-circle';
      default:
        return 'package';
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // For now, we'll use mock data since we don't have the orders table yet
      const mockOrders: Order[] = [
        {
          id: '1',
          created_at: new Date().toISOString(),
          total_amount: 2500,
          status: 'completed',
          items: [
            {
              id: '1',
              name: 'Smartphone Case',
              price: 1500,
              quantity: 1,
              image_urls: ['https://via.placeholder.com/100']
            },
            {
              id: '2',
              name: 'Wireless Earbuds',
              price: 1000,
              quantity: 1,
              image_urls: ['https://via.placeholder.com/100']
            }
          ]
        },
        {
          id: '2',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          total_amount: 3500,
          status: 'pending',
          items: [
            {
              id: '3',
              name: 'Laptop Stand',
              price: 3500,
              quantity: 1,
              image_urls: ['https://via.placeholder.com/100']
            }
          ]
        }
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPress = (order: Order) => {
    Alert.alert(
      'Order Details',
      `Order #${order.id}\nStatus: ${order.status}\nTotal: ETB ${formatPrice(order.total_amount)}`,
      [
        { text: 'OK' },
        { text: 'Track Order', onPress: () => navigation.navigate('TrackParcel') }
      ]
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={[styles.orderItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={[styles.orderId, { color: colors.text }]}>Order #{item.id}</Text>
          <Text style={[styles.orderDate, { color: colors.border }]}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Feather 
            name={getStatusIcon(item.status) as any} 
            size={16} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.itemsContainer}>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <View key={orderItem.id} style={styles.itemRow}>
            {orderItem.image_urls && orderItem.image_urls.length > 0 ? (
              <Image source={{ uri: orderItem.image_urls[0] }} style={styles.itemImage} />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
                <Feather name="image" size={16} color={colors.text} />
              </View>
            )}
            <View style={styles.itemDetails}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                {orderItem.name}
              </Text>
              <Text style={[styles.itemQuantity, { color: colors.border }]}>
                Qty: {orderItem.quantity}
              </Text>
            </View>
            <Text style={[styles.itemPrice, { color: colors.primary || '#E63946' }]}>
              ETB {formatPrice(orderItem.price)}
            </Text>
          </View>
        ))}
        {item.items.length > 2 && (
          <Text style={[styles.moreItems, { color: colors.border }]}>
            +{item.items.length - 2} more items
          </Text>
        )}
      </View>

      <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
        <Text style={[styles.totalAmount, { color: colors.primary || '#E63946' }]}>
          ETB {formatPrice(item.total_amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const filteredOrders = selectedFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === selectedFilter);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Order History</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchOrders}
        >
          <Feather name="refresh-cw" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'pending', 'completed', 'cancelled'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedFilter === filter 
                  ? colors.primary || '#E63946' 
                  : colors.card,
                borderColor: colors.border
              }
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              { 
                color: selectedFilter === filter 
                  ? '#fff' 
                  : colors.text 
              }
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Feather name="loader" size={32} color={colors.primary || '#E63946'} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading orders...</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="package" size={64} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.border }]}>
            {selectedFilter === 'all' 
              ? 'You haven\'t placed any orders yet'
              : `No ${selectedFilter} orders found`
            }
          </Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.primary || '#E63946' }]}
            onPress={() => navigation.navigate('ShopHome')}
          >
            <Text style={styles.browseButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  refreshButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  orderItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 8,
  },
  imagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  moreItems: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
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