import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [language, setLanguage] = React.useState('English');

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="theme-light-dark" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Dark Theme</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="translate" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Language</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.text }]}>{language}</Text>
              <Icon name="chevron-right" size={24} color={colors.text} />
            </View>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="bell-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
        </View>
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
    marginBottom: 24,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingText: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
    opacity: 0.7,
  },
}); 