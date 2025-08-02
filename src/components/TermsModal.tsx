import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface TermsModalProps {
  visible: boolean;
  onAccept: () => void;
  onClose: () => void;
  buttonLabel?: string;
}

const NON_ELIGIBLE_ITEMS: string[] = [
  'Alcohol and illicit drugs',
  'Explosives, firearms or ammunition',
  'Flammable liquids or gases',
  'Perishable food without proper packaging',
  'Animals or live plants',
  'Cash, precious metals or stones',
  'Counterfeit or illegal goods',
  'Hazardous chemicals',
  'Human remains or body parts',
  'Any item prohibited by Ethiopian law',
];

const NON_ELIGIBLE_URL = 'https://drive.google.com/file/d/1-GnUsKkGo-Rs343UxrmNgBpnA4hRwtZc/view?usp=drive_link';

const DownloadNonEligibleButton = () => {
  const { colors } = useTheme();
  
  const handleDownload = async () => {
    const pdfUrl = 'https://drive.google.com/uc?export=download&id=1-GnUsKkGo-Rs343UxrmNgBpnA4hRwtZc';
    
    if (Platform.OS === 'web') {
      window.open(pdfUrl, '_blank');
    } else {
      try {
        await Linking.openURL(pdfUrl);
      } catch (error) {
        console.error('Error opening PDF:', error);
      }
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.downloadButton, { backgroundColor: colors.primary }]}
      onPress={handleDownload}
    >
      <Ionicons name="download-outline" size={20} color="white" style={styles.downloadIcon} />
      <Text style={styles.downloadText}>Download Terms & Conditions PDF</Text>
    </TouchableOpacity>
  );
};

export function TermsModal({ visible, onAccept, onClose, buttonLabel = 'Accept & Continue' }: TermsModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              Terms & Conditions
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Delivery Service Terms
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              1. By using our delivery service, you agree to these terms and conditions.
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              2. We only accept items that comply with our eligible items policy.
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              3. The delivery fee will be calculated based on distance and package size.
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              4. Payment must be made before the delivery is initiated.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
              Package Requirements
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              1. Packages must be properly sealed and labeled.
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              2. Maximum package weight: 20kg
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              3. Maximum package dimensions: 100cm x 100cm x 100cm
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
              Liability
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              1. We are not responsible for any damage to improperly packaged items.
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              2. Insurance is available for valuable items.
            </Text>
            <Text style={[styles.text, { color: colors.text }]}>
              3. Claims must be filed within 24 hours of delivery.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Non-Eligible Items</Text>
            {NON_ELIGIBLE_ITEMS.map(item => (
              <Text key={item} style={[styles.text, { color: colors.error }]}>• {item}</Text>
            ))}
            <DownloadNonEligibleButton />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onAccept}
            >
              <Text style={styles.buttonText}>{buttonLabel}</Text>
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
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  downloadIcon: {
    marginRight: 8,
  },
  downloadText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 