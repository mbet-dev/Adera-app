import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingIndicator } from '../../components/ui/LoadingIndicator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PartnerStackParamList } from '../../types/navigation';
import { ApiService } from '../../services/core';
import { ParcelStatus, PaymentStatus, UserRole } from '../../types';

const { width } = Dimensions.get('window');

// Type definitions
interface DashboardStats {
  totalParcels: number;
  pendingParcels: number;
  completedParcels: number;
  totalEarnings: number;
  todayEarnings: number;
  shopOrders: number;
  activeItems: number;
}

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
  badge?: number;
}

interface RecentParcel {
  id: string;
  tracking_id: string;
  status: ParcelStatus;
  recipient_name: string;
  total_amount: number;
  created_at: string;
  payment_status: PaymentStatus;
}

interface RecentOrder {
  id: string;
  item_name: string;
  buyer_name: string;
  total_amount: number;
  delivery_status: ParcelStatus;
  order_date: string;
}

export default function PartnerHomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<PartnerStackParamList>>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalParcels: 0,
    pendingParcels: 0,
    completedParcels: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    shopOrders: 0,
    activeItems: 0
  });
  const [recentParcels, setRecentParcels] = useState<RecentParcel[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'scan-process',
      title: 'Scan & Process',
      subtitle: 'QR Code scanning',
      icon: 'qrcode-scan',
      color: '#4CAF50',
      route: 'ScanProcess',
      badge: stats.pendingParcels
    },
    {
      id: 'inventory',
      title: 'Inventory',
      subtitle: 'Manage shop items',
      icon: 'package-variant',
      color: '#2196F3',
      route: 'Inventory',
      badge: stats.activeItems
    },
    {
      id: 'deliveries',
      title: 'Deliveries',
      subtitle: 'Manage parcels',
      icon: 'truck-delivery',
      color: '#FF9800',
      route: 'ManageDeliveries'
    },
    {
      id: 'reports',
      title: 'Reports',
      subtitle: 'Analytics & insights',
      icon: 'chart-line',
      color: '#9C27B0',
      route: 'Reports'
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Load shop data (optional)
      const shopResponse = await ApiService.getShopByPartnerId(user.id);
      const hasShop = shopResponse.success && shopResponse.data;
      const shop = hasShop ? shopResponse.data : null;

      // Load recent parcels (as partner)
      const parcelsResponse = await ApiService.getRecentParcels(user.id, 5);
      const parcels = parcelsResponse.success ? parcelsResponse.data || [] : [];

      // Load shop-related data only if partner has a shop
      let orders: any[] = [];
      let items: any[] = [];
      let analytics: any = null;

      if (hasShop && shop) {
        // Load shop orders
        const ordersResponse = await ApiService.getShopOrders(shop.id, undefined);
        orders = ordersResponse.success ? ordersResponse.data || [] : [];

        // Load shop items
        const itemsResponse = await ApiService.getShopItems(shop.id);
        items = itemsResponse.success ? itemsResponse.data || [] : [];

        // Load analytics
        const analyticsResponse = await ApiService.getShopAnalytics(shop.id, 'daily');
        analytics = analyticsResponse.success ? analyticsResponse.data : null;
      }

      // Calculate stats
      const pendingParcels = parcels.filter(p => 
        [ParcelStatus.CREATED, ParcelStatus.FACILITY_RECEIVED, ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB].includes(p.status)
      ).length;

      const completedParcels = parcels.filter(p => p.status === ParcelStatus.DELIVERED).length;

      setStats({
        totalParcels: parcels.length,
        pendingParcels,
        completedParcels,
        totalEarnings: hasShop ? (analytics?.totalSales || 0) : 0,
        todayEarnings: hasShop ? (analytics?.totalSales || 0) : 0,
        shopOrders: hasShop ? orders.length : 0,
        activeItems: hasShop ? items.length : 0
      });

      setRecentParcels(parcels);
      
      // Transform ShopOrder[] to RecentOrder[] only if partner has shop
      if (hasShop) {
        const transformedOrders: RecentOrder[] = orders.slice(0, 5).map(order => ({
          id: order.id,
          item_name: 'Product', // Mock data - in real app this would come from joined ShopItem
          buyer_name: 'Customer', // Mock data - in real app this would come from joined User
          total_amount: order.total_amount,
          delivery_status: order.delivery_status,
          order_date: order.order_date
        }));
        setRecentOrders(transformedOrders);
      } else {
        setRecentOrders([]);
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleQuickAction = (action: QuickAction) => {
    navigation.navigate(action.route as any);
  };

  const handleParcelPress = (parcel: RecentParcel) => {
    // Navigate to parcel details
    Alert.alert('Parcel Details', `Tracking ID: ${parcel.tracking_id}`);
  };

  const handleOrderPress = (order: RecentOrder) => {
    // Navigate to order details
    Alert.alert('Order Details', `Order ID: ${order.id}`);
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: ParcelStatus) => {
    switch (status) {
      case ParcelStatus.DELIVERED:
        return colors.success;
      case ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB:
      case ParcelStatus.IN_TRANSIT_TO_PICKUP_POINT:
        return colors.warning;
      case ParcelStatus.CREATED:
      case ParcelStatus.FACILITY_RECEIVED:
        return colors.primary;
      default:
        return colors.text;
    }
  };

  const getStatusText = (status: ParcelStatus) => {
    return status.replace(/_/g, ' ').toLowerCase();
  };

  const renderQuickAction = ({ item }: { item: QuickAction }) => (
    <TouchableOpacity
      style={[styles.quickActionCard, { backgroundColor: colors.card }]}
      onPress={() => handleQuickAction(item)}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: item.color + '20' }]}>
        <Icon name={item.icon} size={24} color={item.color} />
        {item.badge && item.badge > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.error }]}>
            <Text style={[styles.badgeText, { color: colors.card }]}>
              {item.badge > 99 ? '99+' : item.badge}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.quickActionTitle, { color: colors.text }]}>
        {item.title}
      </Text>
      <Text style={[styles.quickActionSubtitle, { color: colors.textSecondary }]}>
        {item.subtitle}
      </Text>
    </TouchableOpacity>
  );

  const renderParcelItem = ({ item }: { item: RecentParcel }) => (
    <TouchableOpacity
      style={[styles.parcelItem, { backgroundColor: colors.card }]}
      onPress={() => handleParcelPress(item)}
    >
      <View style={styles.parcelHeader}>
        <Text style={[styles.trackingId, { color: colors.primary }]}>
          {item.tracking_id}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <Text style={[styles.recipientName, { color: colors.text }]}>
        {item.recipient_name}
      </Text>
      <View style={styles.parcelFooter}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(item.total_amount)}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDate(item.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderOrderItem = ({ item }: { item: RecentOrder }) => (
    <TouchableOpacity
      style={[styles.orderItem, { backgroundColor: colors.card }]}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={[styles.itemName, { color: colors.text }]}>
          {item.item_name}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.delivery_status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.delivery_status) }]}>
            {getStatusText(item.delivery_status)}
          </Text>
        </View>
      </View>
      <Text style={[styles.buyerName, { color: colors.textSecondary }]}>
        Buyer: {item.buyer_name}
      </Text>
      <View style={styles.orderFooter}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(item.total_amount)}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDate(item.order_date)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <LoadingIndicator />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading dashboard...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Oops! Something went wrong
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <Button
            title="Try Again"
            onPress={loadDashboardData}
            style={styles.retryButton}
          />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.greeting, { color: colors.text }]} numberOfLines={2}>
              Welcome back, {user?.fullName?.split(' ')[0] || 'Partner'}!
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Manage your deliveries and shop
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="account-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Card style={{ ...styles.statCard, backgroundColor: colors.card }}>
              <Icon name="package-variant" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.totalParcels}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Parcels
              </Text>
            </Card>
            <Card style={{ ...styles.statCard, backgroundColor: colors.card }}>
              <Icon name="clock-outline" size={24} color={colors.warning} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.pendingParcels}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Pending
              </Text>
            </Card>
          </View>
          <View style={styles.statsRow}>
            <Card style={{ ...styles.statCard, backgroundColor: colors.card }}>
              <Icon name="check-circle" size={24} color={colors.success} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.completedParcels}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Completed
              </Text>
            </Card>
            {stats.shopOrders > 0 && (
              <Card style={{ ...styles.statCard, backgroundColor: colors.card }}>
                <Icon name="shopping" size={24} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.shopOrders}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Shop Orders
                </Text>
              </Card>
            )}
            {stats.shopOrders === 0 && (
              <Card style={{ ...styles.statCard, backgroundColor: colors.card }}>
                <Icon name="currency-usd" size={24} color={colors.success} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {formatCurrency(stats.todayEarnings)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Today's Earnings
                </Text>
              </Card>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <FlatList
            data={quickActions.filter(action => {
              // Hide shop-related actions for delivery-only partners
              if (stats.shopOrders === 0 && stats.activeItems === 0) {
                return !['inventory', 'reports'].includes(action.id);
              }
              return true;
            })}
            renderItem={renderQuickAction}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsList}
          />
        </View>

        {/* Recent Parcels */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Parcels
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ManageDeliveries')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          {recentParcels.length > 0 ? (
            <FlatList
              data={recentParcels}
              renderItem={renderParcelItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.parcelsList}
            />
          ) : (
            <Card style={{ ...styles.emptyCard, backgroundColor: colors.card }}>
              <Icon name="package-variant-closed" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No parcels yet
              </Text>
            </Card>
          )}
        </View>

        {/* Recent Shop Orders - Only show if partner has shop */}
        {stats.shopOrders > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Shop Orders
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            {recentOrders.length > 0 ? (
              <FlatList
                data={recentOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.ordersList}
              />
            ) : (
              <Card style={{ ...styles.emptyCard, backgroundColor: colors.card }}>
                <Icon name="shopping-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No shop orders yet
                </Text>
              </Card>
            )}
          </View>
        )}

        {/* Shop Setup Prompt for Delivery-Only Partners */}
        {stats.shopOrders === 0 && stats.activeItems === 0 && (
          <View style={styles.section}>
            <Card style={{ ...styles.setupCard, backgroundColor: colors.card }}>
              <Icon name="store-plus" size={48} color={colors.primary} />
              <Text style={[styles.setupTitle, { color: colors.text }]}>
                Expand Your Business
              </Text>
              <Text style={[styles.setupMessage, { color: colors.textSecondary }]}>
                Start selling products through your own shop and increase your earnings!
              </Text>
              <Button
                title="Set Up Shop"
                onPress={() => navigation.navigate('Inventory')}
                style={styles.setupButton}
              />
            </Card>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsList: {
    paddingHorizontal: 16,
  },
  quickActionCard: {
    width: width * 0.4,
    marginRight: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  parcelsList: {
    paddingHorizontal: 16,
  },
  ordersList: {
    paddingHorizontal: 16,
  },
  parcelItem: {
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  orderItem: {
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  parcelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingId: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  buyerName: {
    fontSize: 14,
    marginBottom: 8,
  },
  parcelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
  },
  emptyCard: {
    marginHorizontal: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  setupCard: {
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    borderRadius: 12,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  setupMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  setupButton: {
    width: '100%',
  },
}); 