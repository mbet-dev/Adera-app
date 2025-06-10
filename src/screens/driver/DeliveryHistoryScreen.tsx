import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DeliveryHistoryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery History</Text>
      <Text>View your completed deliveries here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default DeliveryHistoryScreen; 