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
import { DriverStackParamList } from '../../types/navigation';
import { ApiService } from '../../services/core';
import { ParcelStatus, UserRole } from '../../types';

const { width } = Dimensions.get('window');

// Type definitions
interface DriverStats {
  activeDeliveries: number;
  completedToday: number;
  totalEarnings: number;
  todayEarnings: number;
  averageRating: number;
  totalDeliveries: number;
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

interface ActiveDelivery {
  id: string;
  tracking_id: string;
  status: ParcelStatus;
  recipient_name: string;
  recipient_phone: string;
  delivery_address: string;
  pickup_address: string;
  total_amount: number;
  created_at: string;
  estimated_delivery: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecentEarning {
  id: string;
  amount: number;
  delivery_id: string;
  tracking_id: string;
  created_at: string;
  type: 'delivery_fee' | 'tip' | 'bonus';
}

export default function DriverHomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<DriverStackParamList>>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<DriverStats>({
    activeDeliveries: 0,
    completedToday: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    averageRating: 0,
    totalDeliveries: 0
  });
  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDelivery[]>([]);
  const [recentEarnings, setRecentEarnings] = useState<RecentEarning[]>([]);
  const [error, setError] = useState<string | null>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'active-deliveries',
      title: 'Active Deliveries',
      subtitle: 'View current assignments',
      icon: 'truck-delivery',
      color: '#2196F3',
      route: 'ActiveDeliveries',
      badge: stats.activeDeliveries
    },
    {
      id: 'qr-scan',
      title: 'QR Scan',
      subtitle: 'Pickup & dropoff',
      icon: 'qrcode-scan',
      color: '#4CAF50',
      route: 'QRScan'
    },
    {
      id: 'route-map',
      title: 'Route Map',
      subtitle: 'Navigation & optimization',
      icon: 'map-marker-path',
      color: '#FF9800',
      route: 'RouteMap'
    },
    {
      id: 'earnings',
      title: 'Earnings',
      subtitle: 'Income & analytics',
      icon: 'currency-usd',
      color: '#9C27B0',
      route: 'Earnings'
    }
  ];

  useEffect(() => {
    loadDriverData();
  }, []);

  const loadDriverData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Load driver's active deliveries
      const deliveriesResponse = await ApiService.getRecentParcels(user.id, 10);
      const deliveries = deliveriesResponse.success ? deliveriesResponse.data || [] : [];

      // Filter active deliveries (assigned to this driver)
      const activeDeliveries = deliveries.filter(delivery => 
        [ParcelStatus.ASSIGNED_TO_DRIVER, ParcelStatus.IN_TRANSIT_TO_PICKUP_POINT, ParcelStatus.OUT_FOR_DELIVERY].includes(delivery.status)
      );

      // Calculate stats
      const completedToday = deliveries.filter(delivery => 
        delivery.status === ParcelStatus.DELIVERED && 
        new Date(delivery.created_at).toDateString() === new Date().toDateString()
      ).length;

      // Mock earnings data (in real app, this would come from transactions)
      const todayEarnings = completedToday * 150; // ETB 150 per delivery
      const totalEarnings = deliveries.filter(d => d.status === ParcelStatus.DELIVERED).length * 150;

      setStats({
        activeDeliveries: activeDeliveries.length,
        completedToday,
        totalEarnings,
        todayEarnings,
        averageRating: 4.8, // Mock rating
        totalDeliveries: deliveries.length
      });

      // Transform Parcel[] to ActiveDelivery[] with mock data
      const transformedDeliveries: ActiveDelivery[] = activeDeliveries.slice(0, 5).map(delivery => ({
        id: delivery.id,
        tracking_id: delivery.tracking_id,
        status: delivery.status,
        recipient_name: delivery.recipient_name,
        recipient_phone: delivery.recipient_phone,
        delivery_address: 'Mock delivery address', // Mock data
        pickup_address: 'Mock pickup address', // Mock data
        total_amount: delivery.total_amount,
        created_at: delivery.created_at,
        estimated_delivery: delivery.estimated_delivery_time || new Date(Date.now() + 3600000).toISOString(),
        priority: 'medium' as const // Mock priority
      }));

      setActiveDeliveries(transformedDeliveries);

      // Mock recent earnings
      const mockEarnings: RecentEarning[] = [
        {
          id: '1',
          amount: 150,
          delivery_id: 'delivery1',
          tracking_id: 'AD123456',
          created_at: new Date().toISOString(),
          type: 'delivery_fee'
        },
        {
          id: '2',
          amount: 50,
          delivery_id: 'delivery2',
          tracking_id: 'AD123457',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          type: 'tip'
        }
      ];
      setRecentEarnings(mockEarnings);

    } catch (err) {
      console.error('Error loading driver data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load driver data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDriverData();
    setIsRefreshing(false);
  };

  const handleQuickAction = (action: QuickAction) => {
    navigation.navigate(action.route as any);
  };

  const handleDeliveryPress = (delivery: ActiveDelivery) => {
    // Navigate to delivery details
    Alert.alert('Delivery Details', `Tracking ID: ${delivery.tracking_id}`);
  };

  const handleStartShift = () => {
    Alert.alert(
      'Start Shift',
      'Are you ready to start your delivery shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Shift', 
          onPress: () => {
            // Update driver status to active
            Alert.alert('Success', 'Shift started! You can now receive deliveries.');
          }
        }
      ]
    );
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
      case ParcelStatus.OUT_FOR_DELIVERY:
        return colors.warning;
      case ParcelStatus.ASSIGNED_TO_DRIVER:
      case ParcelStatus.IN_TRANSIT_TO_PICKUP_POINT:
        return colors.primary;
      default:
        return colors.text;
    }
  };

  const getStatusText = (status: ParcelStatus) => {
    return status.replace(/_/g, ' ').toLowerCase();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.text;
    }
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

  const renderDeliveryItem = ({ item }: { item: ActiveDelivery }) => (
    <TouchableOpacity
      style={[styles.deliveryItem, { backgroundColor: colors.card }]}
      onPress={() => handleDeliveryPress(item)}
    >
      <View style={styles.deliveryHeader}>
        <Text style={[styles.trackingId, { color: colors.primary }]}>
          {item.tracking_id}
        </Text>
        <View style={styles.deliveryMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
              {item.priority}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={[styles.recipientName, { color: colors.text }]}>
        {item.recipient_name}
      </Text>
      
      <View style={styles.addressContainer}>
        <View style={styles.addressRow}>
          <Icon name="map-marker" size={16} color={colors.textSecondary} />
          <Text style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.delivery_address}
          </Text>
        </View>
      </View>

      <View style={styles.deliveryFooter}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(item.total_amount)}
        </Text>
        <Text style={[styles.estimatedTime, { color: colors.textSecondary }]}>
          Est: {formatDate(item.estimated_delivery)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEarningItem = ({ item }: { item: RecentEarning }) => (
    <TouchableOpacity
      style={[styles.earningItem, { backgroundColor: colors.card }]}
    >
      <View style={styles.earningHeader}>
        <Text style={[styles.earningAmount, { color: colors.success }]}>
          +{formatCurrency(item.amount)}
        </Text>
        <View style={[styles.earningType, { backgroundColor: colors.success + '20' }]}>
          <Text style={[styles.earningTypeText, { color: colors.success }]}>
            {item.type.replace('_', ' ')}
          </Text>
        </View>
      </View>
      <Text style={[styles.trackingId, { color: colors.textSecondary }]}>
        {item.tracking_id}
      </Text>
      <Text style={[styles.earningDate, { color: colors.textSecondary }]}>
        {formatDate(item.created_at)}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <LoadingIndicator />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading driver dashboard...
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
            onPress={loadDriverData}
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
              Welcome back, {user?.fullName?.split(' ')[0] || 'Driver'}!
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Ready to deliver? Start your shift
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="account-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Start Shift Button */}
        <View style={styles.startShiftContainer}>
          <Button
            title="Start Shift"
            onPress={handleStartShift}
            style={{ backgroundColor: colors.success }}
            textStyle={{ color: colors.card }}
          />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Card style={{ backgroundColor: colors.card, flex: 1, marginHorizontal: 6, padding: 16, alignItems: 'center' }}>
              <Icon name="truck-delivery" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.activeDeliveries}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Active
              </Text>
            </Card>
            <Card style={{ backgroundColor: colors.card, flex: 1, marginHorizontal: 6, padding: 16, alignItems: 'center' }}>
              <Icon name="check-circle" size={24} color={colors.success} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.completedToday}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Today
              </Text>
            </Card>
          </View>
          <View style={styles.statsRow}>
            <Card style={{ backgroundColor: colors.card, flex: 1, marginHorizontal: 6, padding: 16, alignItems: 'center' }}>
              <Icon name="currency-usd" size={24} color={colors.success} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatCurrency(stats.todayEarnings)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Today's Earnings
              </Text>
            </Card>
            <Card style={{ backgroundColor: colors.card, flex: 1, marginHorizontal: 6, padding: 16, alignItems: 'center' }}>
              <Icon name="star" size={24} color={colors.warning} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.averageRating}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Rating
              </Text>
            </Card>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <FlatList
            data={quickActions}
            renderItem={renderQuickAction}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsList}
          />
        </View>

        {/* Active Deliveries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Active Deliveries
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ActiveDeliveries')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          {activeDeliveries.length > 0 ? (
            <FlatList
              data={activeDeliveries}
              renderItem={renderDeliveryItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.deliveriesList}
            />
          ) : (
            <Card style={{ backgroundColor: colors.card, marginHorizontal: 16, padding: 32, alignItems: 'center' }}>
              <Icon name="truck-delivery-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No active deliveries
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Start your shift to receive deliveries
              </Text>
            </Card>
          )}
        </View>

        {/* Recent Earnings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Earnings
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Earnings')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          {recentEarnings.length > 0 ? (
            <FlatList
              data={recentEarnings}
              renderItem={renderEarningItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.earningsList}
            />
          ) : (
            <Card style={{ backgroundColor: colors.card, marginHorizontal: 16, padding: 32, alignItems: 'center' }}>
              <Icon name="currency-usd-off" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No recent earnings
              </Text>
            </Card>
          )}
        </View>
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
  startShiftContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
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
  deliveriesList: {
    paddingHorizontal: 16,
  },
  earningsList: {
    paddingHorizontal: 16,
  },
  deliveryItem: {
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  earningItem: {
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  earningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingId: {
    fontSize: 14,
    fontWeight: '600',
  },
  deliveryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priorityText: {
    fontSize: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  addressContainer: {
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 14,
    marginLeft: 4,
    flex: 1,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  estimatedTime: {
    fontSize: 12,
  },
  earningAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  earningType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  earningTypeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  earningDate: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
}); 