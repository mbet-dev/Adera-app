import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { CustomerStackParamList } from '../../types/navigation';
import { Parcel, Partner } from '../../types';
import { getWalletBalance, getRecentParcels, getNearbyPartners, validateQRCode } from '../../services/api';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingIndicator } from '../../components/ui/LoadingIndicator';
import QRScanner from '../../components/scanner';

const { width } = Dimensions.get('window');

type HomeNavigationProp = StackNavigationProp<CustomerStackParamList, 'Home'>;

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  route: keyof CustomerStackParamList | 'QRScanner';
}

interface RecentParcel {
  id: string;
  tracking_id: string;
  status: string;
  recipient_name: string;
  created_at: string;
  total_amount: number;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { state: cartState } = useCart();
  const navigation = useNavigation<HomeNavigationProp>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentParcels, setRecentParcels] = useState<RecentParcel[]>([]);
  const [nearbyPartners, setNearbyPartners] = useState<Partner[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrScanMode, setQrScanMode] = useState<'parcel' | 'pickup' | 'partner' | 'general'>('general');

  const quickActions: QuickAction[] = [
    {
      id: 'create-delivery',
      title: 'Send Parcel',
      subtitle: 'Create new delivery',
      icon: 'package',
      color: '#E63946',
      route: 'CreateDelivery'
    },
    {
      id: 'scan-qr',
      title: 'Scan QR',
      subtitle: 'Scan QR codes',
      icon: 'camera',
      color: '#9B59B6',
      route: 'QRScanner'
    },
    {
      id: 'track-parcel',
      title: 'Track Parcel',
      subtitle: 'Check delivery status',
      icon: 'map-pin',
      color: '#1D3557',
      route: 'TrackParcel'
    },
    {
      id: 'shop',
      title: 'Shop',
      subtitle: 'Browse products',
      icon: 'shopping-bag',
      color: '#2ECC71',
      route: 'Shop'
    },
    {
      id: 'wallet',
      title: 'Wallet',
      subtitle: 'Manage balance',
      icon: 'credit-card',
      color: '#F39C12',
      route: 'Wallet'
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchWalletBalance(),
        fetchRecentParcels(),
        fetchNearbyPartners(),
        fetchUserLocation()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const fetchWalletBalance = async () => {
    try {
      if (!user?.id) return;
      const balance = await getWalletBalance(user.id);
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      // Keep the current balance if fetch fails
    }
  };

  const fetchRecentParcels = async () => {
    try {
      if (!user?.id) return;
      const parcels = await getRecentParcels(user.id, 5);
      setRecentParcels(parcels);
    } catch (error) {
      console.error('Error fetching recent parcels:', error);
      setRecentParcels([]);
    }
  };

  const fetchNearbyPartners = async () => {
    try {
      const partners = await getNearbyPartners(3);
      setNearbyPartners(partners);
    } catch (error) {
      console.error('Error fetching nearby partners:', error);
      setNearbyPartners([]);
    }
  };

  const fetchUserLocation = async () => {
    // Mock location - replace with actual location service
    setUserLocation({ latitude: 9.005401, longitude: 38.763611 });
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.route === 'QRScanner') {
      setQrScanMode('general');
      setShowQRScanner(true);
    } else {
      navigation.navigate(action.route as any);
    }
  };

  const handleQRScan = async (data: string) => {
    try {
      // Validate the QR code using the API service
      const validation = await validateQRCode(data);
      
      if (!validation.valid) {
        Alert.alert('Invalid QR Code', 'The scanned QR code is not recognized.');
        return;
      }

      // Handle different types of QR codes
      switch (validation.type) {
        case 'parcel':
          navigation.navigate('TrackParcel', { trackingId: validation.data });
          break;
        case 'pickup':
          Alert.alert(
            'Pickup Code Confirmed',
            `Pickup code: ${validation.data}\n\nThis code has been verified for parcel pickup.`,
            [{ text: 'OK' }]
          );
          break;
        case 'partner':
          Alert.alert(
            'Partner Found',
            `Partner ID: ${validation.data}\n\nWould you like to create a delivery with this partner?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Create Delivery', 
                onPress: () => navigation.navigate('CreateDelivery' as any)
              }
            ]
          );
          break;
        default:
          Alert.alert(
            'QR Code Detected',
            `Code: ${validation.data}\n\nThis appears to be a general QR code.`,
            [{ text: 'OK' }]
          );
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Error', 'Failed to process QR code. Please try again.');
    }
  };

  const handleParcelPress = (parcel: RecentParcel) => {
    navigation.navigate('ParcelDetails', { parcelId: parcel.id });
  };

  const handlePartnerPress = (partner: Partner) => {
    // Navigate to partner details or create delivery with this partner
    navigation.navigate('CreateDelivery');
  };

  const formatPrice = (amount: number): string => {
    return `ETB ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'delivered':
        return '#2ECC71';
      case 'in_transit':
        return '#3498DB';
      case 'pickup_ready':
        return '#F39C12';
      case 'created':
        return '#9B59B6';
      default:
        return '#95A5A6';
    }
  };

  const getStatusText = (status: string): string => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <ScreenLayout>
        <LoadingIndicator />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#1D3557', '#2C3E50']}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.greeting} numberOfLines={2}>
                    Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!
                  </Text>
                  <Text style={styles.subtitle}>
                    Ready to send your next parcel or shop with us?
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.cartButton}
                  onPress={() => navigation.navigate('Shop' as any)}
                >
                  <Feather name="shopping-cart" size={24} color="#E63946" />
                  {cartState.totalItems > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>
                        {cartState.totalItems}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Wallet Balance Card */}
          <View style={styles.walletSection}>
            <Card style={{ ...styles.walletCard, backgroundColor: colors.card }}>
              <LinearGradient
                colors={['#1D3557', '#2C3E50']}
                style={styles.walletGradient}
              >
                <View style={styles.walletContent}>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletLabel}>Wallet Balance</Text>
                    <Text style={styles.walletAmount}>
                      {formatPrice(walletBalance)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.topUpButton}
                    onPress={() => navigation.navigate('Wallet')}
                  >
                    <Feather name="plus" size={20} color="#FFFFFF" />
                    <Text style={styles.topUpText}>Top Up</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Card>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Actions
            </Text>
            <View style={styles.quickActionsContainer}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickActionCard, { backgroundColor: colors.card }]}
                  onPress={() => handleQuickAction(action)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                    <Feather name={action.icon} size={24} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>
                    {action.title}
                  </Text>
                  <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                    {action.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Parcels */}
          {recentParcels.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Recent Parcels
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('DeliveryHistory' as any)}
                >
                  <Text style={[styles.viewAllText, { color: colors.primary }]}>
                    View All
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.parcelsList}>
                {recentParcels.map((parcel) => (
                  <TouchableOpacity
                    key={parcel.id}
                    style={[styles.parcelCard, { backgroundColor: colors.card }]}
                    onPress={() => handleParcelPress(parcel)}
                  >
                    <View style={styles.parcelHeader}>
                      <Text style={[styles.trackingId, { color: colors.text }]}>
                        #{parcel.tracking_id}
                      </Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(parcel.status) }
                      ]}>
                        <Text style={styles.statusText}>
                          {getStatusText(parcel.status)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.recipientName, { color: colors.text }]}>
                      To: {parcel.recipient_name}
                    </Text>
                    <View style={styles.parcelFooter}>
                      <Text style={[styles.parcelDate, { color: colors.textSecondary }]}>
                        {formatDate(parcel.created_at)}
                      </Text>
                      <Text style={[styles.parcelAmount, { color: colors.text }]}>
                        {formatPrice(parcel.total_amount)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Nearby Partners */}
          {nearbyPartners.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Nearby Partners
              </Text>
              <View style={styles.partnersList}>
                {nearbyPartners.map((partner) => (
                  <TouchableOpacity
                    key={partner.id}
                    style={[styles.partnerCard, { backgroundColor: colors.card }]}
                    onPress={() => handlePartnerPress(partner)}
                  >
                    <View style={styles.partnerInfo}>
                      <View style={styles.partnerIcon}>
                        <Feather name="map-pin" size={20} color="#E63946" />
                      </View>
                      <View style={styles.partnerDetails}>
                        <Text style={[styles.partnerName, { color: colors.text }]}>
                          {partner.business_name}
                        </Text>
                        <Text style={[styles.partnerAddress, { color: colors.textSecondary }]}>
                          {partner.address}
                        </Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* QR Scanner Modal */}
        <QRScanner
          visible={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScan={handleQRScan}
          title="Scan QR Code"
          subtitle="Position the QR code within the frame"
          scanMode={qrScanMode}
        />
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 22,
  },
  cartButton: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  walletSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  walletCard: {
    overflow: 'hidden',
  },
  walletGradient: {
    padding: 20,
  },
  walletContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  walletAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topUpText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  parcelsList: {
    gap: 12,
  },
  parcelCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  parcelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingId: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  parcelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parcelDate: {
    fontSize: 12,
  },
  parcelAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  partnersList: {
    gap: 12,
  },
  partnerCard: {
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  partnerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  partnerAddress: {
    fontSize: 12,
  },
}); 