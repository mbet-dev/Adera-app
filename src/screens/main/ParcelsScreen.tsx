import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';

export const ParcelsScreen = ({ navigation }: any) => {
  const { user } = useAuth();

  const renderCustomerContent = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>My Parcels</Text>
      <Button
        title="Create New Parcel"
        onPress={() => navigation.navigate('CreateParcel')}
        style={styles.button}
      />
      <Button
        title="Track Parcel"
        onPress={() => navigation.navigate('TrackParcel')}
        variant="outline"
        style={styles.button}
      />
    </View>
  );

  const renderDriverContent = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Available Deliveries</Text>
      <Button
        title="View Active Deliveries"
        onPress={() => navigation.navigate('ActiveDeliveries')}
        style={styles.button}
      />
      <Button
        title="Update Delivery Status"
        onPress={() => navigation.navigate('UpdateStatus')}
        variant="outline"
        style={styles.button}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Parcels</Text>
        <Text style={styles.subtitle}>
          {user?.role === 'customer'
            ? 'Manage your parcels'
            : 'Manage your deliveries'}
        </Text>
      </View>

      {user?.role === 'customer' && renderCustomerContent()}
      {user?.role === 'driver' && renderDriverContent()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
}); 