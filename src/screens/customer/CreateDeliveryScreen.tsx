import React, { useState, useEffect, useRef } from 'react';
import type { FlatList as FlatListType } from 'react-native';
import { View, Text, StyleSheet, TextInput, Dimensions, TouchableOpacity, Platform, ActivityIndicator, Linking, Alert, FlatList } from 'react-native';
import { Region } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { Partner } from '../../types/index';
import { CustomerStackParamList } from '../../types/navigation';
import DeliveryMapView from '../../components/map/DeliveryMapView';
// For web, import useState for zoom management
import { Platform as RNPlatform } from 'react-native';
import MapControls, { MapType } from '../../components/map/MapControls';
import PartnerInfoModal from '../../components/PartnerInfoModal';
import CreateDeliveryFAB from '../../components/delivery/CreateDeliveryFAB';
import { DeliveryCreationProvider } from '../../contexts/DeliveryCreationContext';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Adera brand color
const ADERA_RED = '#E63946';

type CreateDeliveryNavigationProp = StackNavigationProp<CustomerStackParamList, 'CreateDelivery'>;

export default function CreateDeliveryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<CreateDeliveryNavigationProp>();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [mapType, setMapType] = useState<MapType>('standard');
  // For native, use 'hybrid' when 'satellite' is selected
  const effectiveMapType = Platform.OS !== 'web' && mapType === 'satellite' ? 'hybrid' : mapType;
  const [region, setRegion] = useState<Region>({
    latitude: 9.005401, // Default to Addis Ababa
    longitude: 38.763611,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  // For web, manage zoom state
  const [zoom, setZoom] = useState(13);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [partnerInfoVisible, setPartnerInfoVisible] = useState(false);
  // Ref for FlatList to enable programmatic scrolling
  const flatListRef = useRef<FlatListType<Partner>>(null);

  useEffect(() => {
    (async () => {
      await fetchPartners();
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied. Please enable it in your device settings to use this feature.');
        // Set a default region if permission is denied, so the map still works.
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      
      // Center the map on the user's location once we have it
      setRegion(prevRegion => ({
        ...prevRegion,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));

      setLoading(false); // Only set loading to false after everything is done
    })();
  }, []);

  const fetchPartners = async () => {
    const startTime = Date.now();
    console.log('[fetchPartners] Starting fetch…');
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('partners')
        .select(`
          id,
          business_name,
          address,
          latitude,
          longitude,
          accepted_payment_methods,
          operating_hours,
          phone,
          photos,
          photo_url,
          users (
            first_name,
            last_name
          )
        `);

      console.log('[fetchPartners] Supabase response', {
        durationMs: Date.now() - startTime,
        rows: data?.length,
        supabaseError,
      });

      if (supabaseError) throw supabaseError;
      
      const formattedData = (data || []) as Partner[];

      setPartners(formattedData);
      
      console.log('[fetchPartners] Partners state updated', { partnersCount: formattedData.length });
      
      if (formattedData.length > 0 && formattedData[0]) {
        setRegion(prevRegion => ({
          ...prevRegion,
          latitude: Number(formattedData[0].latitude),
          longitude: Number(formattedData[0].longitude),
        }));
      }

    } catch (err: unknown) {
        console.error('[fetchPartners] Error', err);
        if (err instanceof Error) {
            setError(`Failed to fetch partners. Please check your connection and Row Level Security policies in Supabase. \n\nError: ${err.message}`);
        } else {
            setError("An unknown error occurred while fetching partner data.");
        }
    }
  };

  const onRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
  };
  
  const handleMarkerPress = (partner: Partner) => {
    setSelectedPartner(partner);
    // Also move the map view to the selected partner
    setRegion({
      latitude: Number(partner.latitude),
      longitude: Number(partner.longitude),
      latitudeDelta: 0.04, // Zoom in closer
      longitudeDelta: 0.04 * ASPECT_RATIO,
    });
    // Scroll the FlatList to the selected partner
    const index = partners.findIndex((p) => p.id === partner.id);
    if (flatListRef.current && index !== -1) {
      (flatListRef.current as any).scrollToIndex({ index, animated: true });
    }
    // navigation.navigate('DeliveryParameters', { partner }); // We can re-enable this later
  };

  const handleRecenter = () => {
    if (userLocation) {
      setRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
      if (RNPlatform.OS === 'web') {
        setZoom(13); // Reset zoom to default on recenter
      }
    }
  };
  
  const handleToggleMapType = () => {
    setMapType((current: MapType) => (current === 'standard' ? 'satellite' : 'standard'));
  };

  const handleOpenInMaps = () => {
    if (!selectedPartner) {
        Alert.alert("No Partner Selected", "Please select a partner from the map or list to view the route.");
        return;
    }

    const { latitude, longitude } = selectedPartner;
    const userLat = userLocation?.coords.latitude;
    const userLng = userLocation?.coords.longitude;

    const scheme = Platform.select({ ios: 'maps:0,0?daddr=', android: 'geo:0,0?q=' });
    const destination = `${latitude},${longitude}(${selectedPartner?.users && selectedPartner.users.length > 0 ? `${selectedPartner.users[0].first_name} ${selectedPartner.users[0].last_name}` : ''})`;
    const userLocationQuery = userLat && userLng ? `&saddr=${userLat},${userLng}` : '';

    let url = '';
    if (Platform.OS === 'web') {
        url = `https://www.google.com/maps/dir/${userLat ? `${userLat},${userLng}` : ''}/${latitude},${longitude}`;
        window.open(url, '_blank');
        return;
    } else {
        url = Platform.select({
          ios: `${scheme}${destination}${userLocationQuery}`,
          android: `${scheme}${destination}`
        }) || '';
    }

    if (url) {
        Linking.openURL(url).catch(err => Alert.alert("Couldn't open maps", err.message));
    }
  };

  const handleShowPartnerInfo = (partner: Partner) => {
    setSelectedPartner(partner);
    setPartnerInfoVisible(true);
  };

  const handleModalClose = React.useCallback(() => {
    setPartnerInfoVisible(false);
  }, []);

  if (loading) {
      return (
          <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>Loading Partner Locations...</Text>
          </View>
      )
  }

  if (error) {
    return (
        <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>Oops! Something went wrong.</Text>
            <Text style={[styles.errorDetailText, { color: colors.textSecondary }]}>{error}</Text>
        </View>
    )
  }

  return (
    <DeliveryCreationProvider>
      <View style={styles.container}>
        <DeliveryMapView
          partners={partners}
          mapRegion={region}
          userLocation={userLocation?.coords}
          selectedPartner={selectedPartner}
          onMarkerPress={handleMarkerPress}
          mapType={effectiveMapType}
          {...(Platform.OS === 'web' && { zoom, setZoom })}
        />
        
        {/* HUD (Heads-Up Display) Elements */}
        <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]} pointerEvents="box-none">
          <View style={[styles.header, { backgroundColor: colors.card }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {Platform.OS === 'web' 
                  ? "ADERA partners" 
                  : (selectedPartner ? selectedPartner.business_name : 'Select a Partner')
              }
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>{selectedPartner ? selectedPartner.address : 'Choose a location from the map or list'}</Text>
            <TouchableOpacity style={styles.closeButton}>
                <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
              <Feather name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                placeholder="Search"
                placeholderTextColor={colors.placeholder}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>
            <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.primary }]}>
              <Feather name="filter" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.controlsContainer}>
              <MapControls
                  mapType={mapType}
                  onRecenter={handleRecenter}
                  onToggleMapType={handleToggleMapType}
                  onOpenInMaps={handleOpenInMaps}
              />
          </View>

          <View style={[styles.bottomListContainer, { backgroundColor: colors.card }]}>
            <FlatList
              ref={flatListRef}
              data={partners}
              keyExtractor={(item) => item.id}
              renderItem={({ item: partner }) => {
                const partnerName = partner.business_name || 'Partner Location';
                return (
                  <TouchableOpacity style={[styles.partnerItem, { backgroundColor: selectedPartner?.id === partner.id ? colors.primary + '20' : colors.card }]} onPress={() => handleMarkerPress(partner)}>
                    <View style={[styles.partnerIconContainer, { backgroundColor: colors.primary + '20' }]}>
                      <Feather name="map-pin" size={24} color={colors.primary} />
                    </View>
                    <View style={[styles.partnerInfo, selectedPartner?.id === partner.id && { opacity: 0.8 }]}>
                      <Text style={[styles.partnerName, { color: colors.text }]}>{partnerName}</Text>
                      <Text style={[styles.partnerAddress, { color: colors.textSecondary }]}>{partner.address}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleShowPartnerInfo(partner)} style={{ padding: 6 }}>
                      <Feather name="info" size={22} color={colors.primary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <CreateDeliveryFAB />
        </View>

        {/* Partner Details Modal */}
        <PartnerInfoModal
          visible={partnerInfoVisible}
          partner={selectedPartner}
          onClose={handleModalClose}
        />
      </View>
    </DeliveryCreationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deliveryCreationLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2, // Higher than map and HUD elements
    pointerEvents: 'box-none',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoText: {
      marginTop: 10,
      fontSize: 16,
  },
  errorText: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  errorDetailText: {
      marginTop: 10,
      fontSize: 14,
      textAlign: 'center',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginRight: 30, // Space for close button
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    marginRight: 30, // Space for close button
  },
  closeButton: {
      position: 'absolute',
      right: 15,
      top: '50%',
      transform: [{ translateY: -12 }],
  },
  searchContainer: {
    position: 'absolute',
    top: 135, // Adjusted for new header height and padding
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 50,
    justifyContent: 'center'
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    padding: 12,
    borderRadius: 10,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 50,
    justifyContent: 'center'
  },
  controlsContainer: {
    position: 'absolute',
    bottom: (height * 0.35) + 20, // Position above the bottom list
    right: 20,
  },
  bottomListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: height * 0.35, // Limit height to 35% of the screen
    zIndex: 10,
  },
  partnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
  },
  partnerIconContainer: {
    padding: 12,
    borderRadius: 10,
    marginRight: 15,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  partnerAddress: {
    fontSize: 14,
    marginTop: 2,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  markerPin: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'rgba(230, 57, 70, 0.3)',
      borderWidth: 1,
      borderColor: 'rgba(230, 57, 70, 0.7)',
  },
  markerPinSelected: {
    backgroundColor: 'rgba(230, 57, 70, 0.6)',
  },
  markerDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: ADERA_RED,
      position: 'absolute',
      borderWidth: 2,
      borderColor: '#fff',
  },
  markerDotSelected: {
      width: 14,
      height: 14,
      borderRadius: 7,
  },
  mapControls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
}); 