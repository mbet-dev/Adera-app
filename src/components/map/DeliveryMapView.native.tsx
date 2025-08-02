import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Region, LatLng } from 'react-native-maps';
import { Partner } from '../../types/index';
import { MapType } from '../../components/map/MapControls/index.native';

const ADERA_RED = '#E63946';

interface DeliveryMapViewProps {
  partners: Partner[];
  mapRegion: Region;
  userLocation?: LatLng;
  selectedPartner: Partner | null;
  onMarkerPress: (partner: Partner) => void;
  mapType: MapType;
}

export default function DeliveryMapView({
  partners,
  mapRegion,
  userLocation,
  selectedPartner,
  onMarkerPress,
  mapType,
}: DeliveryMapViewProps) {
  const mapRef = useRef<MapView>(null);

  // Guard: If mapRegion is undefined/null, render nothing (or a fallback UI)
  if (!mapRegion || typeof mapRegion.latitude !== 'number' || typeof mapRegion.longitude !== 'number') {
    return null;
  }

  // Guard: If partners is not an array, default to empty array
  const safePartners = Array.isArray(partners) ? partners : [];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={mapRegion}
        mapType={mapType}
        showsUserLocation={false} // We use a custom marker
        showsPointsOfInterest={false}
        showsCompass={true}
      >
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="blue"
          />
        )}
        {safePartners.map((partner) => (
          <Marker
            key={partner.id}
            coordinate={{
              latitude: Number(partner.latitude),
              longitude: Number(partner.longitude),
            }}
            title={partner.business_name || 'Partner'}
            description={partner.address || ''}
            pinColor={ADERA_RED}
            onPress={() => onMarkerPress(partner)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
