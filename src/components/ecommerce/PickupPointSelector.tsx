import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  FlatList,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

interface PickupPoint {
  id: string;
  business_name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface PickupPointSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (point: PickupPoint) => void;
  selectedPoint?: PickupPoint | null;
  userLocation?: { latitude: number; longitude: number };
}

export default function PickupPointSelector({
  visible,
  onClose,
  onSelect,
  selectedPoint,
  userLocation
}: PickupPointSelectorProps) {
  const { colors } = useTheme();
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<PickupPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchPickupPoints();
    }
  }, [visible]);

  useEffect(() => {
    filterPoints();
  }, [searchQuery, pickupPoints]);

  const fetchPickupPoints = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('id, business_name, address, latitude, longitude, business_category')
        .eq('is_approved', true)
        .eq('is_active', true)
        .neq('business_category', 'sorting_facility'); // Exclude sorting facilities

      if (error) throw error;

      let points: PickupPoint[] = data || [];
      
      // Calculate distances if user location is available
      if (userLocation) {
        points = points.map(point => ({
          ...point,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            point.latitude,
            point.longitude
          )
        }));
        
        // Sort by distance
        points.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      setPickupPoints(points);
    } catch (error: any) {
      console.error('Error fetching pickup points:', error);
      Alert.alert('Error', 'Failed to load pickup points');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filterPoints = () => {
    if (!searchQuery.trim()) {
      setFilteredPoints(pickupPoints);
      return;
    }

    const filtered = pickupPoints.filter(point =>
      point.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      point.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPoints(filtered);
  };

  const handleSelectPoint = (point: PickupPoint) => {
    onSelect(point);
    onClose();
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
  };

  const renderPickupPoint = ({ item }: { item: PickupPoint }) => (
    <TouchableOpacity
      style={[
        styles.pointItem,
        { 
          backgroundColor: colors.card,
          borderColor: selectedPoint?.id === item.id ? colors.primary || '#E63946' : colors.border
        }
      ]}
      onPress={() => handleSelectPoint(item)}
    >
      <View style={styles.pointInfo}>
        <Text style={[styles.pointName, { color: colors.text }]} numberOfLines={1}>
          {item.business_name}
        </Text>
        <Text style={[styles.pointAddress, { color: colors.border }]} numberOfLines={2}>
          {item.address}
        </Text>
        {item.distance && (
          <Text style={[styles.pointDistance, { color: colors.primary || '#E63946' }]}>
            {formatDistance(item.distance)} away
          </Text>
        )}
      </View>
      
      <View style={styles.pointActions}>
        {selectedPoint?.id === item.id && (
          <Feather name="check" size={20} color={colors.primary || '#E63946'} />
        )}
        <Feather name="chevron-right" size={16} color={colors.border} />
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Select Pickup Point
          </Text>
          <View style={styles.headerRight} />
        </View>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Feather name="search" size={20} color={colors.border} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search pickup points..."
            placeholderTextColor={colors.border}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Pickup Points List */}
        <FlatList
          data={filteredPoints}
          renderItem={renderPickupPoint}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="map-pin" size={48} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No pickup points found
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.border }]}>
                {searchQuery ? 'Try adjusting your search' : 'No pickup points available in your area'}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  pointInfo: {
    flex: 1,
  },
  pointName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pointAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  pointDistance: {
    fontSize: 12,
    fontWeight: '500',
  },
  pointActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 