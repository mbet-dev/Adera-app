import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <ScreenLayout>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            Dark Mode
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <TouchableOpacity
          style={[styles.row, { borderBottomColor: colors.border }]}
          onPress={() => {}}
        >
          <Text style={[styles.label, { color: colors.text }]}>
            Notifications
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            Enabled
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.row, { borderBottomColor: colors.border }]}
          onPress={() => {}}
        >
          <Text style={[styles.label, { color: colors.text }]}>
            Language
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            English
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => {}}
        >
          <Text style={[styles.label, { color: colors.text }]}>
            About
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            v1.0.0
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1
  },
  label: {
    fontSize: 16
  },
  value: {
    fontSize: 16,
    opacity: 0.7
  }
}); 