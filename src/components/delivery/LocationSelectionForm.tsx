import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useDeliveryCreation } from '../../contexts/DeliveryCreationContext';
import { Button } from '../Button';
import { Partner } from '../../types/database';
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
          location,
          latitude,
          longitude,
          profile:profiles (
            full_name
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
            {partner.profile?.[0]?.full_name || 'Partner'}
          </Text>
          <Text style={[styles.partnerAddress, { color: theme.colors.text + '80' }]}>
            {partner.location}
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
    <ScrollView style={styles.container}>
      <PartnerSelectionModal 
        visible={!!selectionType}
        partners={partners}
        onClose={() => setSelectionType(null)}
        onSelect={handleSelect}
        loading={loading}
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Select Locations
        </Text>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
  },
}); 