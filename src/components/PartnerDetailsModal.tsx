import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export interface PartnerDetails {
  id: string;
  businessName?: string;
  location?: string; // human-readable address or neighbourhood
  address?: string; // full address
  locationPicUrl?: string;
  galleryUrls?: string[];
  workingHours?: string;
  contactPerson?: string;
  contactPhone?: string;
  acceptsCash?: boolean;
  acceptsCard?: boolean;
  allowsPaymentProcessing?: boolean; // whether partner accepts to handle payment transactions
  allowsProxyPayment?: boolean; // whether partner can pay on behalf of customer (COD proxy)
  paymentMethods?: string[]; // additional methods e.g. telebirr, chapa
}

interface Props {
  visible: boolean;
  onClose: () => void;
  partner: PartnerDetails | null;
}

const { width } = Dimensions.get('window');

const PartnerDetailsModal: React.FC<Props> = ({ visible, onClose, partner }) => {
  const { colors } = useTheme();

  if (!partner) return null;

  const {
    businessName,
    location,
    address,
    locationPicUrl,
    galleryUrls = [],
    workingHours,
    contactPerson,
    contactPhone,
    acceptsCash = true,
    acceptsCard = false,
    allowsPaymentProcessing = false,
    allowsProxyPayment = false,
    paymentMethods = [],
  } = partner;

  const renderPaymentBadge = (label: string) => (
    <View style={[styles.paymentBadge, { backgroundColor: colors.primary + '33', borderColor: colors.primary }]}> 
      <Text style={[styles.paymentBadgeText, { color: colors.text }]}>{label}</Text>
    </View>
  );

  const renderGalleryItem = ({ item }: { item: string }) => (
    <Image source={{ uri: item }} style={styles.galleryImage} resizeMode="cover" />
  );

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>  
          {/* Header image */}
          {locationPicUrl && (
            <Image source={{ uri: locationPicUrl }} style={styles.headerImage} resizeMode="cover" />
          )}

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
            {/* Business Name */}
            {businessName && (
              <Text style={[styles.title, { color: colors.text }]}>{businessName}</Text>
            )}

            {/* Address */}
            {(address || location) && (
              <Text style={[styles.subTitle, { color: colors.text }]}>{address ?? location}</Text>
            )}

            {/* Working Hours */}
            {workingHours && (
              <Text style={[styles.sectionHeader, { color: colors.text }]}>Working Hours</Text>
            )}
            {workingHours && (
              <Text style={[styles.sectionContent, { color: colors.text }]}>{workingHours}</Text>
            )}

            {/* Contact */}
            {(contactPerson || contactPhone) && (
              <Text style={[styles.sectionHeader, { color: colors.text }]}>Contact</Text>
            )}
            {contactPerson && (
              <Text style={[styles.sectionContent, { color: colors.text }]}>Person: {contactPerson}</Text>
            )}
            {contactPhone && (
              <Text style={[styles.sectionContent, { color: colors.text }]}>Phone: {contactPhone}</Text>
            )}

            {/* Payment Capabilities */}
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Payment Options</Text>
            <View style={styles.paymentRow}>
              {acceptsCash && renderPaymentBadge('Cash')}
              {acceptsCard && renderPaymentBadge('Card')}
              {allowsPaymentProcessing && renderPaymentBadge('In-Store Pay')}
              {allowsProxyPayment && renderPaymentBadge('Proxy Pay')}
              {paymentMethods.map((m) => renderPaymentBadge(m))}
            </View>

            {/* Gallery */}
            {galleryUrls.length > 0 && (
              <>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Gallery</Text>
                <FlatList
                  data={galleryUrls}
                  keyExtractor={(item) => item}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={renderGalleryItem}
                  contentContainerStyle={{ paddingVertical: 8 }}
                />
              </>
            )}

          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.primary }]}> 
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxHeight: '85%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: 180,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
  subTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  sectionContent: {
    fontSize: 14,
    marginTop: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  paymentBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  paymentBadgeText: {
    fontSize: 12,
  },
  galleryImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 8,
  },
  closeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PartnerDetailsModal; 