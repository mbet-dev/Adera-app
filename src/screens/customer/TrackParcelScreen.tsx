import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share,
  Platform,
  Linking,
  RefreshControl,
  Animated,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { CustomerStackParamList } from '../../types/navigation';
import { Parcel, Partner, ParcelEvent } from '../../types';
import { getParcelDetails, getParcelEvents } from '../../services/api';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingIndicator } from '../../components/ui/LoadingIndicator';
import QRCode from 'react-native-qrcode-svg';
import DeliveryMapView from '../../components/map/DeliveryMapView';
import TrackingInput from '../../components/ui/TrackingInput';

const { width, height } = Dimensions.get('window');

type TrackParcelNavigationProp = StackNavigationProp<CustomerStackParamList, 'TrackParcel'>;
type TrackParcelRouteProp = RouteProp<CustomerStackParamList, 'TrackParcel'>;

interface TrackingData {
  parcel: Parcel & {
    dropoff_partner?: Partner;
    pickup_partner?: Partner;
    assigned_driver?: {
      user_id: string;
      current_latitude: number | null;
      current_longitude: number | null;
      users: {
        first_name: string;
        last_name: string;
        phone: string;
      };
    };
  } | null;
  events: ParcelEvent[];
  driverLocation: { latitude: number; longitude: number } | null;
  estimatedDelivery: string | null;
}

export default function TrackParcelScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<TrackParcelNavigationProp>();
  const route = useRoute<TrackParcelRouteProp>();
  const { trackingId } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData>({
    parcel: null,
    events: [],
    driverLocation: null,
    estimatedDelivery: null
  });
  const [showQRCode, setShowQRCode] = useState(false);
  const [region, setRegion] = useState({
    latitude: 9.005401,
    longitude: 38.763611,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0922 * (width / height),
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trackingId) {
      loadTrackingData(trackingId);
    } else {
      setLoading(false);
    }
  }, [trackingId]);

  useEffect(() => {
    if (trackingData.parcel) {
      // Enhanced animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate progress bar
      const progress = getStatusProgress(trackingData.parcel.status);
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [trackingData.parcel]);

  const loadTrackingData = async (trackingId: string) => {
    try {
      setLoading(true);
      console.log('Loading tracking data for:', trackingId);
      
      // Fetch real data from database
      const parcelData = await getParcelDetails(trackingId);
      console.log('Parcel data loaded:', parcelData);
      
      const eventsData = await getParcelEvents(parcelData.id);
      console.log('Events data loaded:', eventsData);

      const estimatedDelivery = calculateEstimatedDelivery(parcelData, eventsData);
      const driverLocation = parcelData.assigned_driver ? {
        latitude: parcelData.assigned_driver.current_latitude || 0,
        longitude: parcelData.assigned_driver.current_longitude || 0
      } : null;

      console.log('Setting tracking data:', {
        parcel: parcelData,
        events: eventsData,
        driverLocation,
        estimatedDelivery
      });

      setTrackingData({
        parcel: parcelData,
        events: eventsData || [],
        driverLocation,
        estimatedDelivery
      });

      if (parcelData.dropoff_partner && parcelData.pickup_partner) {
        updateMapRegion(parcelData.dropoff_partner, parcelData.pickup_partner);
      }

    } catch (error) {
      console.error('Error loading tracking data:', error);
      Alert.alert(
        'Tracking Error', 
        'Failed to load tracking information. Please check the tracking number and try again.',
        [
          { text: 'Try Again', onPress: () => setShowTrackingInput(true) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (trackingData.parcel?.tracking_id) {
      await loadTrackingData(trackingData.parcel.tracking_id);
    }
    setRefreshing(false);
  };

  const handleTrackNewParcel = async (newTrackingId: string) => {
    await loadTrackingData(newTrackingId);
  };

  const calculateEstimatedDelivery = (parcel: Parcel, events: ParcelEvent[]): string => {
    const now = new Date();
    const createdDate = new Date(parcel.created_at);
    const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
    
    let estimatedHours = 24;
    
    switch (parcel.status) {
      case 'delivered':
        return 'Delivered';
      case 'pickup_ready':
        estimatedHours = 2;
        break;
      case 'in_transit_to_pickup_point':
        estimatedHours = 4;
        break;
      case 'facility_received':
        estimatedHours = 8;
        break;
      case 'dropoff':
        estimatedHours = 12;
        break;
      default:
        estimatedHours = Math.max(2, 24 - hoursSinceCreation);
    }
    
    const estimatedDate = new Date(now.getTime() + estimatedHours * 60 * 60 * 1000);
    
    return estimatedDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateMapRegion = (dropoff: any, pickup: any) => {
    const midLat = (dropoff.latitude + pickup.latitude) / 2;
    const midLng = (dropoff.longitude + pickup.longitude) / 2;
    const latDelta = Math.abs(dropoff.latitude - pickup.latitude) * 1.5;
    const lngDelta = Math.abs(dropoff.longitude - pickup.longitude) * 1.5;

    setRegion({
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    });
  };

  const handleShare = async () => {
    if (!trackingData.parcel) return;

    try {
      const shareMessage = `Track my parcel: ${trackingData.parcel.tracking_id}\n\nStatus: ${trackingData.parcel.status}\n\nDownload Adera app to track your parcels!`;
      
      await Share.share({
        message: shareMessage,
        title: 'Track Parcel - Adera'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Need help with your delivery?',
      [
        { text: 'Call Support', onPress: () => Linking.openURL('tel:+251911234567') },
        { text: 'Email Support', onPress: () => Linking.openURL('mailto:support@adera.et') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'delivered':
        return '#2ECC71';
      case 'in_transit_to_pickup_point':
      case 'in_transit_to_facility_hub':
        return '#3498DB';
      case 'pickup_ready':
        return '#F39C12';
      case 'facility_received':
        return '#9B59B6';
      case 'dropoff':
        return '#E67E22';
      case 'created':
        return '#95A5A6';
      default:
        return '#95A5A6';
    }
  };

  const getStatusIcon = (status: string): keyof typeof Feather.glyphMap => {
    switch (status) {
      case 'delivered':
        return 'check-circle';
      case 'in_transit_to_pickup_point':
      case 'in_transit_to_facility_hub':
        return 'truck';
      case 'pickup_ready':
        return 'package';
      case 'facility_received':
        return 'home';
      case 'dropoff':
        return 'map-pin';
      case 'created':
        return 'file-text';
      default:
        return 'circle';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (amount: number): string => {
    return `ETB ${amount.toLocaleString()}`;
  };

  const getStatusProgress = (status: string): number => {
    const statusOrder = [
      'created', 'dropoff', 'facility_received', 
      'in_transit_to_facility_hub', 'in_transit_to_pickup_point', 
      'pickup_ready', 'delivered'
    ];
    const currentIndex = statusOrder.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  };

  if (loading) {
    return (
      <ScreenLayout>
        <StatusBar barStyle="light-content" backgroundColor="#1D3557" />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <LinearGradient
            colors={['#1D3557', '#2C3E50']}
            style={styles.loadingGradient}
          >
            <Feather name="package" size={80} color="#FFFFFF" />
            <LoadingIndicator />
            <Text style={styles.loadingText}>
              Loading tracking information...
            </Text>
          </LinearGradient>
        </View>
      </ScreenLayout>
    );
  }

  if (!trackingData.parcel) {
    return (
      <ScreenLayout>
        <StatusBar barStyle="light-content" backgroundColor="#1D3557" />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#1D3557', '#2C3E50']}
              style={styles.emptyGradient}
            >
              <View style={styles.emptyContent}>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Feather name="package" size={100} color="#FFFFFF" />
                </Animated.View>
                <Text style={styles.emptyTitle}>
                  Track Your Parcel
                </Text>
                <Text style={styles.emptySubtitle}>
                  Enter your tracking number to see real-time updates and delivery status
                </Text>
                
                <TouchableOpacity
                  style={[styles.trackButton, { backgroundColor: colors.primary }]}
                  onPress={() => setShowTrackingInput(true)}
                >
                  <Feather name="search" size={20} color="#FFFFFF" />
                  <Text style={styles.trackButtonText}>Enter Tracking Number</Text>
                </TouchableOpacity>

                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <Feather name="map-pin" size={16} color="#FFFFFF" />
                    <Text style={styles.featureText}>Real-time location tracking</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Feather name="clock" size={16} color="#FFFFFF" />
                    <Text style={styles.featureText}>Estimated delivery times</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Feather name="share-2" size={16} color="#FFFFFF" />
                    <Text style={styles.featureText}>Share tracking updates</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Feather name="help-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.featureText}>Get support when needed</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          <TrackingInput
            visible={showTrackingInput}
            onClose={() => setShowTrackingInput(false)}
            onTrack={handleTrackNewParcel}
            title="Track Your Parcel"
            placeholder="Enter tracking number"
          />
        </SafeAreaView>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <StatusBar barStyle="light-content" backgroundColor="#1D3557" />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            {/* Enhanced Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={['#1D3557', '#2C3E50']}
                style={styles.headerGradient}
              >
                <View style={styles.headerContent}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                  >
                    <Feather name="arrow-left" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.headerInfo}>
                    <Text style={styles.trackingId}>
                      #{trackingData.parcel.tracking_id}
                    </Text>
                    <Text style={styles.recipientName}>
                      To: {trackingData.parcel.recipient_name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShare}
                  >
                    <Feather name="share-2" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            {/* Enhanced Status Progress */}
            <View style={styles.progressSection}>
              <Card style={{ ...styles.progressCard, backgroundColor: colors.card }}>
                <View style={styles.progressHeader}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(trackingData.parcel.status) }
                  ]}>
                    <Feather 
                      name={getStatusIcon(trackingData.parcel.status)} 
                      size={20} 
                      color="#FFFFFF" 
                    />
                  </View>
                  <View style={styles.statusInfo}>
                    <Text style={[styles.statusText, { color: colors.text }]}>
                      {trackingData.parcel.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                    {trackingData.estimatedDelivery && (
                      <Text style={[styles.estimatedDelivery, { color: colors.textSecondary }]}>
                        Estimated delivery: {trackingData.estimatedDelivery}
                      </Text>
                    )}
                  </View>
                </View>
                
                {/* Animated Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <Animated.View 
                      style={[
                        styles.progressFill, 
                        { 
                          backgroundColor: getStatusColor(trackingData.parcel.status),
                          width: progressAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                          })
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                    {Math.round(getStatusProgress(trackingData.parcel.status))}% Complete
                  </Text>
                </View>
              </Card>
            </View>

            {/* Enhanced Map Section */}
            <View style={styles.mapSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Delivery Route
              </Text>
              <View style={{ ...styles.mapContainer, backgroundColor: colors.card }}>
                {trackingData.parcel?.dropoff_partner && trackingData.parcel?.pickup_partner ? (
                  <DeliveryMapView
                    partners={[
                      ...(trackingData.parcel?.dropoff_partner ? [trackingData.parcel.dropoff_partner] : []),
                      ...(trackingData.parcel?.pickup_partner ? [trackingData.parcel.pickup_partner] : [])
                    ]}
                    mapRegion={region}
                    userLocation={trackingData.driverLocation ? {
                      latitude: trackingData.driverLocation.latitude,
                      longitude: trackingData.driverLocation.longitude
                    } : undefined}
                    selectedPartner={null}
                    onMarkerPress={() => {}}
                    mapType="standard"
                  />
                ) : (
                  <View style={styles.mapFallback}>
                    <Feather name="map" size={48} color={colors.textSecondary} />
                    <Text style={[styles.mapFallbackText, { color: colors.textSecondary }]}>
                      Map loading...
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Enhanced QR Code Section */}
            <View style={styles.qrSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Pickup Code
              </Text>
              <Card style={{ ...styles.qrCard, backgroundColor: colors.card }}>
                <View style={styles.qrContent}>
                  <QRCode
                    value={trackingData.parcel.pickup_code || trackingData.parcel.tracking_id}
                    size={120}
                    color="#000000"
                    backgroundColor="#FFFFFF"
                  />
                  <Text style={[styles.qrLabel, { color: colors.textSecondary }]}>
                    Show this code to pickup your parcel
                  </Text>
                </View>
              </Card>
            </View>

            {/* Enhanced Timeline Section */}
            <View style={styles.timelineSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Delivery Timeline
              </Text>
              <View style={styles.timeline}>
                {trackingData.events.map((event, index) => (
                  <View key={event.id} style={styles.timelineItem}>
                    <View style={styles.timelineDot}>
                      <View style={[
                        styles.timelineDotInner,
                        { backgroundColor: getStatusColor(event.event_type) }
                      ]} />
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.timelineTitle, { color: colors.text }]}>
                        {event.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                      <Text style={[styles.timelineTime, { color: colors.textSecondary }]}>
                        {formatDate(event.created_at)}
                      </Text>
                      {event.notes && (
                        <Text style={[styles.timelineNotes, { color: colors.textSecondary }]}>
                          {event.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Enhanced Parcel Details */}
            <View style={styles.detailsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Parcel Details
              </Text>
              <Card style={{ ...styles.detailsCard, backgroundColor: colors.card }}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Package Type
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {trackingData.parcel.package_type.replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Weight
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {trackingData.parcel.package_weight ? `${trackingData.parcel.package_weight} kg` : 'Not specified'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Total Amount
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {formatPrice(trackingData.parcel.total_amount)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Payment Status
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {trackingData.parcel.payment_status.replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
              </Card>
            </View>

            {/* Enhanced Action Buttons */}
            <View style={styles.actionsSection}>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={{ ...styles.actionButton, backgroundColor: colors.card }}
                  onPress={handleContactSupport}
                >
                  <Feather name="help-circle" size={20} color={colors.primary} />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>Get Help</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ ...styles.actionButton, backgroundColor: colors.card }}
                  onPress={() => setShowTrackingInput(true)}
                >
                  <Feather name="search" size={20} color={colors.primary} />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>Track Another</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <TrackingInput
          visible={showTrackingInput}
          onClose={() => setShowTrackingInput(false)}
          onTrack={handleTrackNewParcel}
          title="Track Your Parcel"
          placeholder="Enter tracking number"
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
  content: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyGradient: {
    width: '100%',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    opacity: 0.9,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    marginBottom: 30,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  trackingId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recipientName: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  shareButton: {
    padding: 8,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressCard: {
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  estimatedDelivery: {
    fontSize: 14,
  },
  progressBarContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  mapSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  qrCard: {
    padding: 20,
    alignItems: 'center',
  },
  qrContent: {
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  timelineSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timeline: {
    paddingLeft: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  timelineDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 14,
    marginBottom: 4,
  },
  timelineNotes: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  detailsCard: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapFallbackText: {
    marginTop: 10,
  },
}); 