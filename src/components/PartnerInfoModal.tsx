import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Partner } from '../types/index';
import { PARTNER_PHOTO_PLACEHOLDER } from '../constants/images';

interface PartnerInfoModalProps {
  visible: boolean;
  partner: Partner | null;
  onClose: () => void;
}

export default function PartnerInfoModal({
  visible,
  partner,
  onClose,
}: PartnerInfoModalProps) {
  const { colors } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (!partner) return null;

  const validPhotos = Array.isArray(partner.photos)
    ? partner.photos.filter((url) => typeof url === 'string' && url.trim() !== '')
    : [];

  const images =
    validPhotos.length > 0
      ? validPhotos
      : (partner.photo_url && typeof partner.photo_url === 'string' && partner.photo_url.trim() !== ''
          ? [partner.photo_url]
          : [PARTNER_PHOTO_PLACEHOLDER]);
  
  const formatWorkingHours = (hours: Record<string, { open: string; close: string }>) => {
    const days = [
      { short: 'Mon', full: 'monday' },
      { short: 'Tue', full: 'tuesday' },
      { short: 'Wed', full: 'wednesday' },
      { short: 'Thu', full: 'thursday' },
      { short: 'Fri', full: 'friday' },
      { short: 'Sat', full: 'saturday' },
      { short: 'Sun', full: 'sunday' }
    ];
    
    return days.map(({ short, full }) => {
      const dayHours = hours[full];
      let displayHours = 'Closed';
      
      if (dayHours) {
        if (dayHours.open === 'closed' || dayHours.close === 'closed') {
          displayHours = 'Closed';
        } else {
          displayHours = `${dayHours.open} - ${dayHours.close}`;
        }
      }
      
      return {
        day: short,
        hours: displayHours,
        isClosed: displayHours === 'Closed'
      };
    });
  };

  const renderPaymentMethods = (methods: string[]) => {
    return methods.map((method, index) => (
      <View key={method} style={styles.paymentMethod}>
        <Ionicons 
          name="card-outline" 
          size={20} 
          color={colors.primary} 
        />
        <Text style={[styles.paymentMethodText, { color: colors.text }]}>
          {method}
        </Text>
      </View>
    ));
  };

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          {/* Header with close button */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {partner.business_name}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {/* Image Gallery */}
            <View style={styles.imageContainer}>
              {images.length > 0 && (
                <Image
                  source={
                    imageError
                      ? { uri: PARTNER_PHOTO_PLACEHOLDER }
                      : { uri: images[currentImageIndex] }
                  }
                  style={styles.image}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              )}
              {images.length > 1 && (
                <>
                  <TouchableOpacity style={[styles.imageButton, styles.prevButton]} onPress={prevImage}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.imageButton, styles.nextButton]} onPress={nextImage}>
                    <Ionicons name="chevron-forward" size={24} color="white" />
                  </TouchableOpacity>
                  <View style={styles.imageDots}>
                    {images.map((_, index: number) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          { backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)' }
                        ]}
                      />
                    ))}
                  </View>
                </>
              )}
            </View>

            {/* Location Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
              </View>
              <Text style={[styles.sectionContent, { color: colors.text }]}>
                {partner.address}
              </Text>
            </View>

            {/* Payment Options */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="card" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Options</Text>
              </View>
              <View style={styles.paymentMethodsContainer}>
                {renderPaymentMethods(partner.accepted_payment_methods || [])}
              </View>
              {/* Features like POS Machine and Proxy Payment are not present in the new Partner type. */}
            </View>

            {/* Working Hours */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Working Hours</Text>
              </View>
              <View style={styles.workingHours}>
                {formatWorkingHours(partner.operating_hours || {}).map(({ day, hours, isClosed }) => (
                  <View key={day} style={styles.workingHourRow}>
                    <Text style={[styles.dayText, { color: colors.text }]}>{day}</Text>
                    <Text 
                      style={[
                        styles.hoursText, 
                        { 
                          color: isClosed ? colors.error : colors.text 
                        }
                      ]}
                    >
                      {hours}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Contact Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact</Text>
              </View>
              <Text style={[styles.sectionContent, { color: colors.text }]}>
                {partner.users && partner.users.length > 0 ? `${partner.users[0].first_name} ${partner.users[0].last_name}`: ''}
              </Text>
              <Text style={[styles.sectionContent, { color: colors.text }]}>
                {partner.phone}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

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
    maxHeight: '90%',
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -22 }],
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 22,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  prevButton: {
    left: 8,
  },
  nextButton: {
    right: 8,
  },
  imageDots: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 8,
    borderRadius: 8,
  },
  paymentMethodText: {
    marginLeft: 4,
    fontSize: 14,
  },
  paymentFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 4,
    fontSize: 14,
  },
  workingHours: {
    gap: 4,
  },
  workingHourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 14,
  },
}); 