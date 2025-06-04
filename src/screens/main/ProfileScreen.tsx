import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { ScreenLayout } from '../../components/ui/ScreenLayout';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();

  return (
    <ScreenLayout>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.name, { color: colors.text }]}>
          {user?.user_metadata?.full_name || 'User'}
        </Text>
        <Text style={[styles.email, { color: colors.text }]}>
          {user?.email}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.button, { borderBottomColor: colors.border }]}
          onPress={() => {}}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { borderBottomColor: colors.border }]}
          onPress={() => {}}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Change Password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={signOut}
        >
          <Text style={[styles.buttonText, { color: colors.error }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    marginBottom: 20,
    borderRadius: 12
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  email: {
    fontSize: 16,
    opacity: 0.7
  },
  section: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  button: {
    padding: 16,
    borderBottomWidth: 1
  },
  buttonText: {
    fontSize: 16
  }
}); 