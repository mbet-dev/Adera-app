import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface TermsModalProps {
  visible: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export function TermsModal({ visible, onAccept, onClose }: TermsModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.modalBackground }]}>
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Terms & Conditions
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Delivery Service Terms
            </Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              1. By using our delivery service, you agree to these terms and conditions.
            </Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              2. We only accept items that comply with our eligible items policy.
            </Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              3. The delivery fee will be calculated based on distance and package size.
            </Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              4. Payment must be made before the delivery is initiated.
            </Text>

            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>
              Package Requirements
            </Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              1. Packages must be properly sealed and labeled.
            </Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              2. Maximum package weight: 20kg
            </Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              3. Maximum package dimensions: 100cm x 100cm x 100cm
            </Text>

            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20 }]}>
              Liability
            </Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              1. We are not responsible for any damage to improperly packaged items.
            </Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              2. Insurance is available for valuable items.
            </Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              3. Claims must be filed within 24 hours of delivery.
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={onAccept}
            >
              <Text style={styles.buttonText}>Accept & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: Platform.select({ web: '80%', default: '90%' }),
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 