import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';

export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <ScreenLayout>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Welcome to Adera
        </Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  }
}); 