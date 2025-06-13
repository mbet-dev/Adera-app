import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions, TouchableOpacity, Platform, ActivityIndicator, Linking, Alert, FlatList } from 'react-native';
import { Region } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { Partner } from '../../types/database';
import { CustomerStackParamList } from '../../types/navigation';
import DeliveryMapView from '../../components/map/DeliveryMapView';
import MapControls, { MapType } from '../../components/map/MapControls';
import PartnerDetailsModal from '../../components/PartnerDetailsModal';

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
  const [region, setRegion] = useState<Region>({
    latitude: 9.005401, // Default to Addis Ababa
    longitude: 38.763611,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [detailsPartner, setDetailsPartner] = useState<Partner | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

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
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('partners')
        .select(`
          id,
          location,
          latitude,
          longitude,
          profile:profiles (
            full_name
          )
        `);

      if (supabaseError) throw supabaseError;
      
      const formattedData = data
        .filter((p): p is Partner => p !== null && p.latitude !== null && p.longitude !== null && p.profile !== null);

      setPartners(formattedData);
      
      if (formattedData.length > 0 && formattedData[0]) {
        setRegion(prevRegion => ({
          ...prevRegion,
          latitude: Number(formattedData[0].latitude),
          longitude: Number(formattedData[0].longitude),
        }));
      }

    } catch (err: unknown) {
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
    const destination = `${latitude},${longitude}(${selectedPartner.profile[0]?.full_name})`;
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

  const openDetails = (partner: Partner) => {
    setDetailsPartner(partner);
    setDetailsVisible(true);
  };

  const closeDetails = () => setDetailsVisible(false);

  if (loading) {
      return (
          <View style={[styles.container, styles.centerContent]}>
              <ActivityIndicator size="large" color={ADERA_RED} />
              <Text style={styles.infoText}>Loading Partner Locations...</Text>
          </View>
      )
  }

  if (error) {
    return (
        <View style={[styles.container, styles.centerContent]}>
            <Text style={styles.errorText}>Oops! Something went wrong.</Text>
            <Text style={styles.errorDetailText}>{error}</Text>
        </View>
    )
  }

  return (
    <View style={styles.container}>
      <DeliveryMapView 
        partners={partners}
        mapRegion={region}
        userLocation={userLocation?.coords}
        selectedPartner={selectedPartner}
        onMarkerPress={handleMarkerPress}
        mapType={mapType}
      />
      
      {/* HUD (Heads-Up Display) Elements */}
      <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]} pointerEvents="box-none">

        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: '#333' }]} numberOfLines={1}>
            {Platform.OS === 'web' 
                ? "ADERA partners" 
                : (selectedPartner ? selectedPartner.profile[0]?.full_name : 'Select a Partner')
            }
          </Text>
          <Text style={[styles.headerSubtitle, { color: '#666' }]} numberOfLines={1}>{selectedPartner ? selectedPartner.location : 'Choose a location from the map or list'}</Text>
          <TouchableOpacity style={styles.closeButton}>
              <Feather name="x" size={24} color={'#333'} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#888"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
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

        <View style={styles.bottomListContainer}>
          <FlatList
            data={partners}
            keyExtractor={(item) => item.id}
            renderItem={({ item: partner }) => {
              const partnerName = partner.profile[0]?.full_name || 'Partner Location';
              return (
                  <TouchableOpacity style={[styles.partnerItem, selectedPartner?.id === partner.id && styles.partnerItemSelected]} onPress={() => handleMarkerPress(partner)}>
                      <View style={styles.partnerIconContainer}>
                          <Feather name="map-pin" size={24} color={ADERA_RED} />
                      </View>
                      <View style={styles.partnerInfo}>
                          <Text style={styles.partnerName}>{partnerName}</Text>
                          <Text style={styles.partnerAddress}>{partner.location}</Text>
                      </View>
                      <TouchableOpacity onPress={() => openDetails(partner)} style={styles.infoButton}>
                          <Feather name="info" size={20} color={ADERA_RED} />
                      </TouchableOpacity>
                      <Feather name="chevron-right" size={24} color="#ccc" />
                  </TouchableOpacity>
              )
            }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      {/* Partner Details Modal */}
      <PartnerDetailsModal
        visible={detailsVisible}
        partner={detailsPartner as any}
        onClose={closeDetails}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoText: {
      marginTop: 10,
      fontSize: 16,
      color: '#666'
  },
  errorText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: ADERA_RED,
      textAlign: 'center',
  },
  errorDetailText: {
      marginTop: 10,
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    color: '#666',
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
    backgroundColor: '#fff',
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
    color: '#000',
  },
  filterButton: {
    backgroundColor: ADERA_RED,
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
    backgroundColor: '#fff',
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
    backgroundColor: '#fff'
  },
  partnerIconContainer: {
    backgroundColor: '#fdecec',
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
    color: '#333',
  },
  partnerAddress: {
    fontSize: 14,
    color: '#666',
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
  partnerItemSelected: {
    backgroundColor: '#e6f7ff',
  },
  infoButton: {
    marginHorizontal: 8,
  },
}); 