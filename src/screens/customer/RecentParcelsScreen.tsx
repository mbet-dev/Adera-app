import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  RefreshControl,
  Alert
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { ParcelCard } from '../../components/ui/ParcelCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Type definitions
interface Parcel {
  id: string;
  trackingNumber: string;
  status: 'delivered' | 'in_transit' | 'pending' | 'cancelled';
  recipient: string;
  deliveryAddress: string;
  amount: number;
  createdAt: string;
}

interface Filter {
  key: string;
  label: string;
}

// Mock data for demonstration
const mockParcels: Parcel[] = [
  {
    id: '1',
    trackingNumber: 'ADERA001',
    status: 'delivered',
    recipient: 'Abebe Kebede',
    deliveryAddress: 'Kazanchis, Addis Ababa',
    amount: 150.00,
    createdAt: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    trackingNumber: 'ADERA002',
    status: 'in_transit',
    recipient: 'Sara Mohammed',
    deliveryAddress: 'Bole, Addis Ababa',
    amount: 75.00,
    createdAt: '2025-01-14T09:15:00Z'
  },
  {
    id: '3',
    trackingNumber: 'ADERA003',
    status: 'pending',
    recipient: 'Dawit Haile',
    deliveryAddress: 'Piassa, Addis Ababa',
    amount: 200.00,
    createdAt: '2025-01-13T16:45:00Z'
  },
  {
    id: '4',
    trackingNumber: 'ADERA004',
    status: 'cancelled',
    recipient: 'Yohannes Tadesse',
    deliveryAddress: 'Meskel Square, Addis Ababa',
    amount: 120.00,
    createdAt: '2025-01-12T14:20:00Z'
  },
  {
    id: '5',
    trackingNumber: 'ADERA005',
    status: 'delivered',
    recipient: 'Fatima Ahmed',
    deliveryAddress: 'Kazanchis, Addis Ababa',
    amount: 95.00,
    createdAt: '2025-01-11T11:30:00Z'
  }
];

const statusConfig = {
  delivered: { color: '#2ECC71', icon: 'check-circle', label: 'Delivered' },
  in_transit: { color: '#F39C12', icon: 'truck-delivery', label: 'In Transit' },
  pending: { color: '#3498DB', icon: 'clock-outline', label: 'Pending' },
  cancelled: { color: '#E74C3C', icon: 'close-circle', label: 'Cancelled' }
} as const;

export default function RecentParcelsScreen({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>(mockParcels);
  const [filteredParcels, setFilteredParcels] = useState<Parcel[]>(mockParcels);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filters: Filter[] = [
    { key: 'all', label: 'All' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'pending', label: 'Pending' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    let filtered = parcels;
    
    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(p => p.status === selectedFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(p => 
        p.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredParcels(filtered);
  }, [selectedFilter, searchQuery, parcels]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleParcelPress = (parcel: Parcel) => {
    Alert.alert(
      'Parcel Details',
      `Would you like to view details for ${parcel.trackingNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View', 
          onPress: () => {
            navigation.navigate('TrackParcel', { trackingNumber: parcel.trackingNumber });
          }
        }
      ]
    );
  };

  const handleCreateDelivery = () => {
    navigation.navigate('CreateDelivery');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderParcelItem = ({ item }: { item: Parcel }) => (
    <ParcelCard
      trackingNumber={item.trackingNumber}
      status={item.status}
      recipient={item.recipient}
      deliveryAddress={item.deliveryAddress}
      amount={item.amount}
      date={formatDate(item.createdAt)}
      statusConfig={statusConfig}
      onPress={() => handleParcelPress(item)}
      style={styles.parcelCard}
    />
  );

  const renderFilterButton = ({ item }: { item: Filter }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { 
          backgroundColor: selectedFilter === item.key ? colors.primary : colors.card,
          borderColor: colors.border
        }
      ]}
      onPress={() => setSelectedFilter(item.key)}
    >
      <Text style={[
        styles.filterText,
        { color: selectedFilter === item.key ? '#FFFFFF' : colors.text }
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIllustration}>
        <Icon name="package-variant-closed" size={80} color={colors.textSecondary} />
        <View style={styles.emptyDecoration}>
          <Icon name="map-marker-path" size={24} color={colors.primary} />
        </View>
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Parcels Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {searchQuery.trim() || selectedFilter !== 'all' 
          ? 'Try adjusting your search or filters'
          : 'Start your delivery journey by creating your first parcel'
        }
      </Text>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('CreateDelivery')}
      >
        <Icon name="plus-box" size={20} color="#FFFFFF" />
        <Text style={[styles.createButtonText, { color: '#FFFFFF' }]}>
          Create New Delivery
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Recent Parcels</Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={handleCreateDelivery}
          >
            <Icon name="plus" size={20} color="#FFFFFF" />
            <Text style={[styles.createButtonText, { color: '#FFFFFF' }]}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Icon name="magnify" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search parcels..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Buttons */}
        <FlatList
          data={filters}
          renderItem={renderFilterButton}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        />

        {/* Parcels List */}
        <FlatList
          data={filteredParcels}
          renderItem={renderParcelItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 4,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  parcelCard: {
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIllustration: {
    position: 'relative',
    marginBottom: 24,
  },
  emptyDecoration: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1FAEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 22,
  },
}); 