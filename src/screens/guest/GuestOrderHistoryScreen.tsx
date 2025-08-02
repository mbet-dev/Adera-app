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

type Props = NativeStackScreenProps<GuestStackParamList, 'OrderHistory'>;

export default function GuestOrderHistoryScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const handleSignUp = () => {
    navigation.navigate('AuthPrompt', { feature: 'order history' });
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Order History</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="clock" size={100} color={colors.textSecondary} />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>Track Your Orders</Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>          Sign up to access your order history and track past purchases.
        </Text>

        <TouchableOpacity
          style={[styles.signUpButton, { backgroundColor: colors.primary }]}
          onPress={handleSignUp}
        >
          <Feather name="user-plus" size={20} color="#FFFFFF" />
          <Text style={styles.signUpButtonText}>Sign Up to View Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.browseButton, { borderColor: colors.border }]}
          onPress={() => navigation.navigate('ShopHome')}
        >
          <Text style={[styles.browseButtonText, { color: colors.text }]}>            Continue Browsing
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
