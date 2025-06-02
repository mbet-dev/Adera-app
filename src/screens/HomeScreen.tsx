import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export const HomeScreen = () => {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text variant="h1">Home Screen</Text>
      <Button title="Sign Out" onPress={signOut} />
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