import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression, LatLng } from 'leaflet';
import { LocationObjectCoords } from 'expo-location';
import { Partner } from '../../types/database';
import { Region } from 'react-native-maps';
import MapControls, { MapType } from './MapControls/index.web';

const ADERA_RED = '#E63946';

// A robust, SVG-based custom icon that does not depend on external image files.
const partnerIcon = L.divIcon({
  html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="${ADERA_RED}" stroke="white" stroke-width="2"/></svg>`,
  className: 'custom-leaflet-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const userIcon = L.divIcon({
    html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#4285F4" stroke="white" stroke-width="2"/></svg>`,
    className: 'custom-leaflet-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const selectedPartnerIcon = L.divIcon({
  html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#2ECC71" stroke="white" stroke-width="2"/></svg>`,
  className: 'custom-leaflet-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface DeliveryMapViewProps {
  partners: Partner[];
  mapRegion: Region;
  userLocation?: LocationObjectCoords;
  selectedPartner: Partner | null;
  onMarkerPress: (partner: Partner) => void;
  mapType: MapType;
}

// A component to sync the map's view with our state
const ChangeView = ({ center, zoom }: { center: LatLngExpression; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function DeliveryMapView({
  partners,
  mapRegion,
  userLocation,
  selectedPartner,
  onMarkerPress,
  mapType,
}: DeliveryMapViewProps) {

  const position: LatLngExpression = [mapRegion.latitude, mapRegion.longitude];
  const [zoom, setZoom] = useState(13);

  return (
    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 0 }}>
      <MapContainer 
          center={position} 
          zoom={zoom} 
          style={{ 
              height: '100%',
              width: '100%',
          }}
          zoomControl={false}
          >
        <ChangeView center={position} zoom={zoom} />
        <ZoomControl position="bottomleft" />
        
        {mapType === 'standard' && (
          <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        )}
        {mapType === 'satellite' && (
          <TileLayer
              url='https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
              maxZoom={20}
              subdomains={['mt0','mt1','mt2','mt3']}
              attribution='&copy; Google'
          />
        )}
        
        {userLocation && (
            <Marker
                position={[userLocation.latitude, userLocation.longitude]}
                icon={userIcon}
            >
                <Popup>Your Location</Popup>
            </Marker>
        )}
        {partners.map((partner) => (
            <Marker
            key={partner.id}
            position={[Number(partner.latitude), Number(partner.longitude)]}
            icon={selectedPartner?.id === partner.id ? selectedPartnerIcon : partnerIcon}
            eventHandlers={{
                click: () => {
                onMarkerPress(partner);
                },
            }}
            >
            <Popup>
                {partner.profile[0]?.full_name || 'Partner'} <br />
                {partner.location}
            </Popup>
            </Marker>
        ))}
    </MapContainer>
    </div>
  );
} 