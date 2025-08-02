import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useDeliveryCreation } from '../../contexts/DeliveryCreationContext';
import { Button } from '../ui/Button';
import { Partner } from '../../types';
import { supabase } from '../../lib/supabase';
import { PartnerSelectionModal } from './PartnerSelectionModal';

interface LocationSelectionFormProps {
  onNext: () => void;
  onBack: () => void;
}

export function LocationSelectionForm({ onNext, onBack }: LocationSelectionFormProps) {
  const theme = useTheme();
  const { state, setDropoffPoint, setPickupPoint } = useDeliveryCreation();
  const { dropoffPoint, pickupPoint } = state;
  const [partners, setPartners] = React.useState<Partner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectionType, setSelectionType] = React.useState<'pickup' | 'dropoff' | null>(null);

  React.useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase.from('partners').select(`
          id,
          business_name,
          address,
          latitude,
          longitude,
          accepted_payment_methods,
          operating_hours,
          phone,
          photo_url,
          photos,
          users:users (
            first_name,
            last_name
          )
        `);
        if (error) throw error;
        setPartners(data as Partner[]);
      } catch (error) {
        console.error('Error fetching partners:', error);
        // Optionally set an error state to show in the UI
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const [errors, setErrors] = React.useState<{
    dropoff?: string;
    pickup?: string;
  }>({});

  const handleDropoffSelect = React.useCallback((partner: Partner) => {
    setDropoffPoint(partner);
    setErrors(prev => ({ ...prev, dropoff: undefined }));
  }, [setDropoffPoint]);

  const handlePickupSelect = React.useCallback((partner: Partner) => {
    setPickupPoint(partner);
    setErrors(prev => ({ ...prev, pickup: undefined }));
  }, [setPickupPoint]);

  const validate = React.useCallback(() => {
    const newErrors: { dropoff?: string; pickup?: string } = {};

    if (!dropoffPoint) {
      newErrors.dropoff = 'Please select a dropoff point';
    }

    if (!pickupPoint) {
      newErrors.pickup = 'Please select a pickup point';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [dropoffPoint, pickupPoint]);

  const handleNext = React.useCallback(() => {
    if (validate()) {
      onNext();
    }
  }, [validate, onNext]);

  const handleSelect = (partner: Partner) => {
    if (selectionType === 'pickup') {
      handlePickupSelect(partner);
    } else if (selectionType === 'dropoff') {
      handleDropoffSelect(partner);
    }
    setSelectionType(null);
  };

  const openPartnerSelection = (type: 'pickup' | 'dropoff') => {
    setSelectionType(type);
  };

  const renderPartnerCard = (partner: Partner | null, type: 'dropoff' | 'pickup') => {
    if (!partner) {
      return (
        <TouchableOpacity 
          style={[
            styles.partnerCard,
            { borderColor: errors[type] ? theme.colors.error : theme.colors.border }
          ]}
          onPress={() => openPartnerSelection(type)}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.selectText, { color: theme.colors.primary }]}>
            Select {type === 'dropoff' ? 'Dropoff' : 'Pickup'} Point
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.partnerCard, { borderColor: theme.colors.border }]}>
        <View style={styles.partnerInfo}>
          <Text style={[styles.partnerName, { color: theme.colors.text }]}>
            {partner.users?.[0] ? `${partner.users[0].first_name} ${partner.users[0].last_name}` : 'Partner'}
          </Text>
          <Text style={[styles.partnerAddress, { color: theme.colors.text + '80' }]}>
            {partner.address}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.changeButton}
          onPress={() => openPartnerSelection(type)}
        >
          <Text style={[styles.changeText, { color: theme.colors.primary }]}>
            Change
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <PartnerSelectionModal 
        visible={!!selectionType}
        partners={partners}
        onClose={() => setSelectionType(null)}
        onSelect={handleSelect}
        loading={loading}
      />
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Select Locations
      </Text>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Dropoff Point
          </Text>
          {renderPartnerCard(dropoffPoint, 'dropoff')}
          {errors.dropoff && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {errors.dropoff}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Pickup Point
          </Text>
          {renderPartnerCard(pickupPoint, 'pickup')}
          {errors.pickup && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {errors.pickup}
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <Button
            title="Back"
            onPress={onBack}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title="Next"
            onPress={handleNext}
            variant="primary"
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'space-between',
    padding: 16,
  },
  container: {
    flex: 1,
  },
  content: {
    // No padding here, handled by outer container
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  partnerCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  partnerAddress: {
    fontSize: 14,
    marginTop: 4,
  },
  changeButton: {
    padding: 8,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
}); 