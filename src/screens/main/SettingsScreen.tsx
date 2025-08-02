import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { Card } from '../../components/ui/Card';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TermsModal } from '../../components/TermsModal';
import { Linking } from 'react-native';

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

  const handleLanguageChange = () => {
    Alert.alert(
      'Language Selection',
      'Language change functionality will be implemented soon.',
      [{ text: 'OK' }]
    );
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    Alert.alert(
      'Notifications',
      `Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`,
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Privacy policy will be implemented soon.');
  };

  const handleAboutApp = () => {
    Alert.alert(
      'About Adera',
      'Adera - Your trusted delivery partner in Addis Ababa\n\nVersion 1.0.0\n\nEmpowering local businesses and customers with reliable parcel delivery services.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScreenLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Customize your app experience
          </Text>
        </View>

        {/* Non-Eligible Items - Priority Section */}
        <Card padding="medium" style={styles.priorityCard}>
          <TouchableOpacity style={styles.settingItem} onPress={handleOpenNonEligible}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Icon name="alert-circle-outline" size={24} color={colors.error} />
                <View style={[styles.badge, { backgroundColor: colors.error }]} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Non-Eligible Items</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  View restricted items list
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Appearance Settings */}
        <Card padding="medium" style={styles.settingsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#9B59B6' }]}>
                <Icon name="theme-light-dark" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Theme</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Switch between light and dark modes
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={handleLanguageChange}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#3498DB' }]}>
                <Icon name="translate" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Language</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Choose your preferred language
                </Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{language}</Text>
              <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Notification Settings */}
        <Card padding="medium" style={styles.settingsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#F39C12' }]}>
                <Icon name="bell-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Push Notifications</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Receive updates about your deliveries
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
        </Card>

        {/* Legal & Support */}
        <Card padding="medium" style={styles.settingsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Legal & Support</Text>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={() => setShowTerms(true)}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#2ECC71' }]}>
                <Icon name="file-document-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Terms & Conditions</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Read our terms of service
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={handlePrivacyPolicy}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#E74C3C' }]}>
                <Icon name="shield-check-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Privacy Policy</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  How we protect your data
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={handleAboutApp}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#1D3557' }]}>
                <Icon name="information-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>About Adera</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  App version and information
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>
      </ScrollView>

      <TermsModal 
        visible={showTerms} 
        onAccept={() => setShowTerms(false)}
        onClose={() => setShowTerms(false)} 
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  priorityCard: {
    marginBottom: 20,
  },
  settingsCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 15,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 