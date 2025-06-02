import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../components/ui/Text';
import { useAuth } from '../hooks/useAuth';

export const ProfileScreen = () => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text variant="h1">Profile</Text>
      <Text>Email: {user?.email}</Text>
      <Text>Role: {user?.role}</Text>
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
}); 