import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GuestStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<GuestStackParamList, 'Wishlist'>;

export default function GuestWishlistScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const handleSignUp = () => {
    navigation.navigate('AuthPrompt', { feature: 'wishlist' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Wishlist
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="heart" size={100} color={colors.textSecondary} />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          Save Your Favorites
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Sign up to create your wishlist and save products you love for later
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Feather name="heart" size={20} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Save products you love
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Feather name="bell" size={20} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Get notified about price drops
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Feather name="smartphone" size={20} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Access across all devices
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.signUpButton, { backgroundColor: colors.primary }]}
          onPress={handleSignUp}
        >
          <Feather name="user-plus" size={20} color="#FFFFFF" />
          <Text style={styles.signUpButtonText}>Sign Up to Start Saving</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.browseButton, { borderColor: colors.border }]}
          onPress={() => navigation.navigate('ShopHome')}
        >
          <Text style={[styles.browseButtonText, { color: colors.text }]}>
            Continue Browsing
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 32,
    opacity: 0.6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  featuresList: {
    alignSelf: 'stretch',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: 'stretch',
    gap: 8,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  browseButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'stretch',
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
