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
import { useTheme } from '../hooks/useTheme';
import { Partner } from '../types/database';

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
  const theme = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!partner) return null;

  const images = partner.image_urls || [partner.image_url];
  
  const formatWorkingHours = (hours: Record<string, string>) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      hours: hours[day] || 'Closed'
    }));
  };

  const renderPaymentMethods = (methods: string[]) => {
    return methods.map((method, index) => (
      <View key={method} style={styles.paymentMethod}>
        <Ionicons 
          name="card-outline" 
          size={20} 
          color={theme.colors.primary} 
        />
        <Text style={[styles.paymentMethodText, { color: theme.colors.text }]}>
          {method}
        </Text>
      </View>
    ));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.modalBackground }]}>
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          {/* Header with close button */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {partner.profile[0]?.full_name}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {/* Image Gallery */}
            <View style={styles.imageContainer}>
              <Image
                source={typeof images[currentImageIndex] === 'string' 
                  ? { uri: images[currentImageIndex] }
                  : images[currentImageIndex]
                }
                style={styles.image}
                resizeMode="cover"
              />
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
                <Ionicons name="location" size={20} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Location</Text>
              </View>
              <Text style={[styles.sectionContent, { color: theme.colors.text }]}>
                {partner.location}
              </Text>
            </View>

            {/* Payment Options */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="card" size={20} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Payment Options</Text>
              </View>
              <View style={styles.paymentMethodsContainer}>
                {renderPaymentMethods(partner.payment_methods || [])}
              </View>
              <View style={styles.paymentFeatures}>
                <View style={styles.feature}>
                  <Ionicons 
                    name={partner.has_pos_machine ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={partner.has_pos_machine ? theme.colors.primary : theme.colors.error} 
                  />
                  <Text style={[styles.featureText, { color: theme.colors.text }]}>
                    POS Machine
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons 
                    name={partner.accepts_proxy_payment ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={partner.accepts_proxy_payment ? theme.colors.primary : theme.colors.error} 
                  />
                  <Text style={[styles.featureText, { color: theme.colors.text }]}>
                    Proxy Payment
                  </Text>
                </View>
              </View>
            </View>

            {/* Working Hours */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time" size={20} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Working Hours</Text>
              </View>
              <View style={styles.workingHours}>
                {formatWorkingHours(partner.working_hours || {}).map(({ day, hours }) => (
                  <View key={day} style={styles.workingHourRow}>
                    <Text style={[styles.dayText, { color: theme.colors.text }]}>{day}</Text>
                    <Text style={[styles.hoursText, { color: theme.colors.text }]}>{hours}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Contact Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person" size={20} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact</Text>
              </View>
              <Text style={[styles.sectionContent, { color: theme.colors.text }]}>
                {partner.contact_person}
              </Text>
              <Text style={[styles.sectionContent, { color: theme.colors.text }]}>
                {partner.contact_phone}
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
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 4,
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