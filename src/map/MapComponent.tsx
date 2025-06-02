import React from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, Dimensions } from 'react-native';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    title?: string;
  }>;
}

const MapComponent: React.FC<MapComponentProps> = ({
  latitude,
  longitude,
  zoom = 15,
  markers = [],
}) => {
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${latitude}, ${longitude}], ${zoom});
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          ${markers.map(marker => `
            L.marker([${marker.lat}, ${marker.lng}])
              ${marker.title ? `.bindPopup('${marker.title}')` : ''}
              .addTo(map);
          `).join('')}
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      source={{ html: mapHtml }}
      style={styles.map}
      scrollEnabled={false}
      zoomable={false}
    />
  );
};

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: 300,
  },
});

export default MapComponent; 