import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

export type MapType = 'standard' | 'satellite' | 'hybrid';

interface MapControlsProps {
  mapType: MapType;
  onRecenter: () => void;
  onToggleMapType: () => void;
  onOpenInMaps: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ 
  mapType,
  onRecenter, 
  onToggleMapType,
  onOpenInMaps
}) => {
  const getMapTypeIcon = () => {
    switch (mapType) {
      case 'standard':
        return 'layers';
      case 'satellite':
        return 'map';
      default:
        return 'map';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onRecenter} style={styles.button}>
        <Feather name="crosshair" size={22} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onToggleMapType} style={styles.button}>
        <Feather name={getMapTypeIcon() as any} size={22} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onOpenInMaps} style={styles.button}>
        <Feather name="navigation" size={22} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  button: {
    padding: 8,
    marginVertical: 4,
  },
});

export default MapControls;
