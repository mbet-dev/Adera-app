import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../components/ui/Text';

export const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="h1">Settings</Text>
      <Text>Settings screen coming soon...</Text>
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