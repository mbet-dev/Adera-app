import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';

export default function AuditLogsScreen() {
  const { colors } = useTheme();

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Audit Logs</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
}); 