import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Partner } from '../types/database';

interface PartnerInfoModalProps {
  visible: boolean;
  partner: Partner | null;
  onClose: () => void;
}

const PartnerInfoModal: React.FC<PartnerInfoModalProps> = ({ visible, partner, onClose }) => {
  if (!partner) return null;

  const workingHours = partner.working_hours as Record<string, string> | null;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={28} color="#333" />
          </TouchableOpacity>

          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Image */}
            {partner.image_url ? (
              <Image source={{ uri: partner.image_url }} style={styles.image} resizeMode="cover" />
            ) : (
              <Image source={require('../../assets/tentPlacesnOthersRes1x/images.jpeg')} style={styles.image} resizeMode="cover" />
            )}

            {/* Name & Address */}
            <Text style={styles.name}>{partner.profile[0]?.full_name || 'Partner'}</Text>
            <Text style={styles.address}>{partner.location}</Text>

            {/* Working Hours */}
            <Section title="Working Hours">
              {workingHours
                ? Object.entries(workingHours).map(([day, hours]) => (
                    <Text style={styles.sectionContent} key={day}>
                      {day}: {hours}
                    </Text>
                  ))
                : (
                  <Text style={styles.sectionContent}>Not Provided</Text>
                )}
            </Section>

            {/* Contact */}
            <Section title="Contact">
              {partner.contact_person && (
                <Text style={styles.sectionContent}>{partner.contact_person}</Text>
              )}
              {partner.contact_phone && (
                <Text style={styles.sectionContent}>{partner.contact_phone}</Text>
              )}
              {!partner.contact_person && !partner.contact_phone && (
                <Text style={styles.sectionContent}>Not Provided</Text>
              )}
            </Section>

            {/* Payment Methods */}
            <Section title="Payment Methods">
              {partner.payment_methods && partner.payment_methods.length > 0 ? (
                partner.payment_methods.map((pm) => (
                  <Text style={styles.sectionContent} key={pm}>• {pm}</Text>
                ))
              ) : (
                <Text style={styles.sectionContent}>Not Provided</Text>
              )}
            </Section>

            {/* POS & Proxy Payment */}
            <Section title="POS Available">
              <Text style={styles.sectionContent}>{partner.has_pos_machine ? 'Yes' : 'No'}</Text>
            </Section>
            <Section title="Proxy Payment Accepted">
              <Text style={styles.sectionContent}>{partner.accepts_proxy_payment ? 'Yes' : 'No'}</Text>
            </Section>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

interface SectionProps {
  title: string;
  children?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    padding: 20,
    maxHeight: Platform.select({ ios: '85%', android: '85%', default: '85%' }),
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  sectionContent: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
});

export default PartnerInfoModal; 