import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GuestStackParamList } from '../../types/navigation';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<GuestStackParamList, 'AuthPrompt'>;

interface FeatureInfo {
  title: string;
  description: string;
  icon: string;
  benefits: string[];
}

const FEATURE_INFO: Record<string, FeatureInfo> = {
  wallet: {
    title: 'Unlock Your Digital Wallet',
    description: 'Sign up to access your secure in-app wallet and make instant purchases',
    icon: 'credit-card',
    benefits: [
      'Secure payment processing',
      'Instant transactions',
      'Purchase history tracking',
      'Wallet balance management',
    ],
  },
  delivery: {
    title: 'Create Delivery Orders',
    description: 'Sign up to access our comprehensive delivery network',
    icon: 'truck',
    benefits: [
      'Send parcels anywhere',
      'Real-time tracking',
      'Flexible pickup points',
      'Reliable delivery network',
    ],
  },
  purchase: {
    title: 'Complete Your Purchase',
    description: 'Sign up to buy this item with your secure wallet',
    icon: 'shopping-bag',
    benefits: [
      'Secure checkout process',
      'Order tracking',
      'Purchase protection',
      'Easy returns',
    ],
  },
};

export default function AuthPromptScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { feature } = route.params;
  const featureInfo = FEATURE_INFO[feature] || FEATURE_INFO.wallet;

  const handleSignUp = () => {
    // Navigate to root stack for registration
    (navigation as any).navigate('Register');
  };

  const handleSignIn = () => {
    // Navigate to root stack for authentication
    (navigation as any).navigate('Auth');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Feature Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Feather name={featureInfo.icon as any} size={64} color={colors.primary} />
        </View>

        {/* Title and Description */}
        <Text style={[styles.title, { color: colors.text }]}>
          {featureInfo.title}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {featureInfo.description}
        </Text>

        {/* Benefits List */}
        <View style={styles.benefitsContainer}>
          <Text style={[styles.benefitsTitle, { color: colors.text }]}>
            What you'll get:
          </Text>
          {featureInfo.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Feather name="check-circle" size={20} color={colors.success || colors.primary} />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleSignUp}
          >
            <Text style={styles.primaryButtonText}>Sign Up Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={handleSignIn}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Continue Browsing Option */}
        <TouchableOpacity onPress={handleGoBack} style={styles.continueBrowsingButton}>
          <Text style={[styles.continueBrowsingText, { color: colors.textSecondary }]}>
            Continue browsing without account
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  actionContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueBrowsingButton: {
    marginTop: 24,
    padding: 12,
  },
  continueBrowsingText: {
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
