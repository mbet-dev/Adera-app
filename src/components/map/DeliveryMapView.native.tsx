import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Region, LatLng } from 'react-native-maps';
import { Partner } from '../../types/database';
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
        {partners.map((partner) => (
          <Marker
            key={partner.id}
            coordinate={{
              latitude: Number(partner.latitude),
              longitude: Number(partner.longitude),
            }}
            title={partner.profile[0]?.full_name || 'Partner'}
            description={partner.location}
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
