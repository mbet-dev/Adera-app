import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { DeliveryCreationModal } from './DeliveryCreationModal';
import { useDeliveryCreation } from '../../contexts/DeliveryCreationContext';

export default function CreateDeliveryFAB() {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const { reset } = useDeliveryCreation();

  const handlePress = () => {
    reset(); // Reset state every time the FAB is clicked to ensure a fresh start
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    // The reset is now handled on open, so we don't need it here.
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: theme.colors.primary }
        ]}
        onPress={handlePress}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <DeliveryCreationModal
        visible={modalVisible}
        onClose={handleModalClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
      },
    }),
  },
}); 