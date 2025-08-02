import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ParcelCard } from '../../components/ui/ParcelCard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../types/navigation';

// Type definitions
interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
}

interface Parcel {
  id: string;
  trackingNumber: string;
  status: 'delivered' | 'in_transit' | 'pending' | 'cancelled';
  recipient: string;
  deliveryAddress: string;
  amount: number;
  createdAt: string;
}

interface Partner {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  image: string;
}

// Mock data for demonstration
const mockRecentParcels: Parcel[] = [
  {
    id: '1',
    trackingNumber: 'ADERA001',
    status: 'delivered',
    recipient: 'Abebe Kebede',
    deliveryAddress: 'Kazanchis, Addis Ababa',
    amount: 150.00,
    createdAt: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    trackingNumber: 'ADERA002',
    status: 'in_transit',
    recipient: 'Sara Mohammed',
    deliveryAddress: 'Bole, Addis Ababa',
    amount: 75.00,
    createdAt: '2025-01-14T09:15:00Z'
  }
];

const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'Bole Electronics',
    category: 'Electronics',
    rating: 4.8,
    distance: '2.3km',
    image: '🖥️'
  },
  {
    id: '2',
    name: 'Kazanchis Fashion',
    category: 'Clothing',
    rating: 4.6,
    distance: '1.8km',
    image: '👕'
  },
  {
    id: '3',
    name: 'Piassa Books',
    category: 'Books',
    rating: 4.9,
    distance: '3.1km',
    image: '📚'
  }
];

const quickActions: QuickAction[] = [
  {
    id: 'create-delivery',
    title: 'Create Delivery',
    icon: 'plus-box',
    color: '#E63946',
    route: 'CreateDelivery'
  },
  {
    id: 'track-parcel',
    title: 'Track Parcel',
    icon: 'map-marker-path',
    color: '#1D3557',
    route: 'TrackParcel'
  },
  {
    id: 'scan-qr',
    title: 'Scan QR',
    icon: 'qrcode-scan',
    color: '#2ECC71',
    route: 'QRScanner'
  },
  {
    id: 'shop',
    title: 'Shop',
    icon: 'shopping',
    color: '#9B59B6',
    route: 'Shop'
  },
  {
    id: 'recent-parcels',
    title: 'Recent Parcels',
    icon: 'package-variant',
    color: '#F39C12',
    route: 'RecentParcels'
  }
];

const statusConfig = {
  delivered: { color: '#2ECC71', icon: 'check-circle', label: 'Delivered' },
  in_transit: { color: '#F39C12', icon: 'truck-delivery', label: 'In Transit' },
  pending: { color: '#3498DB', icon: 'clock-outline', label: 'Pending' },
  cancelled: { color: '#E74C3C', icon: 'close-circle', label: 'Cancelled' }
} as const;

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [walletBalance, setWalletBalance] = useState(1250.75);
  const [recentParcels, setRecentParcels] = useState<Parcel[]>(mockRecentParcels);
  const [partners, setPartners] = useState<Partner[]>(mockPartners);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleQuickAction = (action: QuickAction) => {
    try {
      navigation.navigate(action.route);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Unable to navigate to this screen');
    }
  };

  const handlePartnerPress = (partner: Partner) => {
    Alert.alert(
      'Partner Details',
      `Would you like to view ${partner.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View', 
          onPress: () => {
            // TODO: Navigate to partner details
            console.log('Viewing partner:', partner.id);
          }
        }
      ]
    );
  };

  const handleParcelPress = (parcel: Parcel) => {
    Alert.alert(
      'Parcel Details',
      `Would you like to view details for ${parcel.trackingNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View', 
          onPress: () => {
            navigation.navigate('TrackParcel', { trackingId: parcel.trackingNumber });
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderQuickAction = ({ item }: { item: QuickAction }) => (
    <TouchableOpacity
      style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleQuickAction(item)}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: item.color }]}>
        <Icon name={item.icon} size={24} color="#FFFFFF" />
      </View>
      <Text style={[styles.quickActionTitle, { color: colors.text }]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderRecentParcel = ({ item }: { item: Parcel }) => {
    const status = statusConfig[item.status];
    return (
      <ParcelCard
        trackingNumber={item.trackingNumber}
        status={item.status}
        recipient={item.recipient}
        deliveryAddress={item.deliveryAddress}
        amount={item.amount}
        date={formatDate(item.createdAt)}
        statusConfig={statusConfig}
        onPress={() => handleParcelPress(item)}
        compact
      />
    );
  };

  const renderPartner = ({ item }: { item: Partner }) => (
    <TouchableOpacity
      style={[styles.partnerCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handlePartnerPress(item)}
    >
      <View style={styles.partnerHeader}>
        <Text style={styles.partnerEmoji}>{item.image}</Text>
        <View style={styles.partnerInfo}>
          <Text style={[styles.partnerName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.partnerCategory, { color: colors.textSecondary }]}>
            {item.category}
          </Text>
        </View>
        <View style={styles.partnerRating}>
          <Icon name="star" size={14} color="#F39C12" />
          <Text style={[styles.ratingText, { color: colors.text }]}>
            {item.rating}
          </Text>
        </View>
      </View>
      
      <View style={styles.partnerFooter}>
        <View style={styles.partnerDistance}>
          <Icon name="map-marker-distance" size={14} color={colors.textSecondary} />
          <Text style={[styles.distanceText, { color: colors.textSecondary }]}>
            {item.distance}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.viewButton, { backgroundColor: colors.primary }]}
          onPress={() => handlePartnerPress(item)}
        >
          <Text style={[styles.viewButtonText, { color: '#FFFFFF' }]}>View</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeTextContainer}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              Welcome back,
            </Text>
            <Text style={[styles.userName, { color: colors.text }]} numberOfLines={2}>
              {user?.fullName || 'User'}! 👋
            </Text>
          </View>
          <View style={[styles.walletCard, { backgroundColor: colors.primary }]}>
            <Icon name="wallet" size={24} color="#FFFFFF" />
            <Text style={styles.walletLabel}>Wallet Balance</Text>
            <Text style={styles.walletAmount}>{walletBalance.toFixed(2)} ETB</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <FlatList
            data={quickActions}
            renderItem={renderQuickAction}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContainer}
          />
        </View>

        {/* Recent Parcels */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Parcels</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RecentParcels')}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentParcels.length > 0 ? (
            <FlatList
              data={recentParcels.slice(0, 3)}
              renderItem={renderRecentParcel}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.parcelsContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="package-variant-closed" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No recent parcels
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Create your first delivery to get started
              </Text>
              <TouchableOpacity
                style={[styles.createFirstButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('CreateDelivery')}
              >
                <Icon name="plus-box" size={16} color="#FFFFFF" />
                <Text style={[styles.createFirstButtonText, { color: '#FFFFFF' }]}>
                  Create Delivery
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Partner Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Partners</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={partners}
            renderItem={renderPartner}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.partnersContainer}
          />
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Stats</Text>
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="package-variant" size={24} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.text }]}>12</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Deliveries</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="star" size={24} color="#F39C12" />
              <Text style={[styles.statNumber, { color: colors.text }]}>4.8</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Average Rating</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="map-marker-distance" size={24} color="#2ECC71" />
              <Text style={[styles.statNumber, { color: colors.text }]}>45km</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Distance Covered</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  welcomeTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
  walletCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
    maxWidth: 140,
    flexShrink: 0,
  },
  walletLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  walletAmount: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsContainer: {
    paddingHorizontal: 4,
  },
  quickActionCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
    minWidth: 100,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  parcelsContainer: {
    paddingHorizontal: 4,
  },
  parcelCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
    minWidth: 280,
    overflow: 'hidden',
  },
  parcelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  trackingNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  parcelBody: {
    padding: 12,
    gap: 6,
  },
  parcelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  parcelText: {
    fontSize: 12,
    flex: 1,
  },
  parcelDate: {
    fontSize: 10,
    marginLeft: 'auto',
  },
  partnersContainer: {
    paddingHorizontal: 4,
  },
  partnerCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
    minWidth: 200,
    padding: 12,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  partnerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  partnerCategory: {
    fontSize: 12,
  },
  partnerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  partnerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  createFirstButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 