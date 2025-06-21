import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TermsModal } from '../../components/TermsModal';
import { Linking, Alert } from 'react-native';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [language, setLanguage] = React.useState('English');

  const [showTerms, setShowTerms] = React.useState(false);

  const NON_ELIGIBLE_URL = 'https://drive.google.com/file/d/1-GnUsKkGo-Rs343UxrmNgBpnA4hRwtZc/view?usp=drive_link';

  const handleOpenNonEligible = async () => {
    try {
      const supported = await Linking.canOpenURL(NON_ELIGIBLE_URL);
      if (supported) {
        Linking.openURL(NON_ELIGIBLE_URL);
      } else {
        Alert.alert('Unable to open link');
      }
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {/* Non-Eligible Items - Moved to top with badge */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <TouchableOpacity style={styles.settingItem} onPress={handleOpenNonEligible}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Icon name="alert-circle-outline" size={24} color={colors.error} />
                <View style={[styles.badge, { backgroundColor: colors.error }]} />
              </View>
              <View>
                <Text style={[styles.settingText, { color: colors.text }]}>Non-Eligible Items</Text>
                <Text style={[styles.settingSubtext, { color: colors.text }]}>View restricted items list</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

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

        <View style={[styles.section, { borderColor: colors.border }]}>
          <TouchableOpacity style={styles.settingItem} onPress={() => setShowTerms(true)}>
            <View style={styles.settingLeft}>
              <Icon name="file-document-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Terms & Conditions</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Terms Modal */}
      <TermsModal
        visible={showTerms}
        onAccept={() => setShowTerms(false)}
        onClose={() => setShowTerms(false)}
        buttonLabel="Close"
      />
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
  settingSubtext: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  iconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
}); 