import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ParcelCard } from '../../components/ui/ParcelCard';

// Type definitions
interface Delivery {
  id: string;
  trackingNumber: string;
  status: 'delivered' | 'in_transit' | 'pending' | 'cancelled';
  createdAt: string;
  deliveredAt: string | null;
  recipient: string;
  recipientPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageDetails: {
    weight: string;
    dimensions: string;
    description: string;
  };
  payment: {
    method: string;
    amount: number;
    status: string;
  };
  driver: {
    name: string;
    phone: string;
    rating: number;
  } | null;
}

interface Filter {
  key: string;
  label: string;
}

// Mock data for demonstration
const mockDeliveries: Delivery[] = [
  {
    id: '1',
    trackingNumber: 'ADERA001',
    status: 'delivered',
    createdAt: '2025-01-15T10:30:00Z',
    deliveredAt: '2025-01-16T14:20:00Z',
    recipient: 'Abebe Kebede',
    recipientPhone: '+251912345678',
    pickupAddress: 'Bole, Addis Ababa',
    deliveryAddress: 'Kazanchis, Addis Ababa',
    packageDetails: {
      weight: '2.5kg',
      dimensions: '30x20x15cm',
      description: 'Electronics package'
    },
    payment: {
      method: 'Telebirr',
      amount: 150.00,
      status: 'paid'
    },
    driver: {
      name: 'Tadesse Alemu',
      phone: '+251987654321',
      rating: 4.8
    }
  },
  {
    id: '2',
    trackingNumber: 'ADERA002',
    status: 'in_transit',
    createdAt: '2025-01-14T09:15:00Z',
    deliveredAt: null,
    recipient: 'Sara Mohammed',
    recipientPhone: '+251923456789',
    pickupAddress: 'Kazanchis, Addis Ababa',
    deliveryAddress: 'Bole, Addis Ababa',
    packageDetails: {
      weight: '1.2kg',
      dimensions: '25x15x10cm',
      description: 'Documents package'
    },
    payment: {
      method: 'Cash on Delivery',
      amount: 75.00,
      status: 'pending'
    },
    driver: {
      name: 'Yohannes Tadesse',
      phone: '+251976543210',
      rating: 4.9
    }
  },
  {
    id: '3',
    trackingNumber: 'ADERA003',
    status: 'cancelled',
    createdAt: '2025-01-13T16:45:00Z',
    deliveredAt: null,
    recipient: 'Dawit Haile',
    recipientPhone: '+251934567890',
    pickupAddress: 'Meskel Square, Addis Ababa',
    deliveryAddress: 'Piassa, Addis Ababa',
    packageDetails: {
      weight: '3.0kg',
      dimensions: '35x25x20cm',
      description: 'Clothing package'
    },
    payment: {
      method: 'Chapa',
      amount: 120.00,
      status: 'refunded'
    },
    driver: null
  }
];

const statusConfig = {
  delivered: { color: '#2ECC71', icon: 'check-circle', label: 'Delivered' },
  in_transit: { color: '#F39C12', icon: 'truck-delivery', label: 'In Transit' },
  pending: { color: '#3498DB', icon: 'clock-outline', label: 'Pending' },
  cancelled: { color: '#E74C3C', icon: 'close-circle', label: 'Cancelled' }
} as const;

export default function DeliveryHistoryScreen() {
  const { colors } = useTheme();
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>(mockDeliveries);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const filters: Filter[] = [
    { key: 'all', label: 'All' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'pending', label: 'Pending' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredDeliveries(deliveries);
    } else {
      setFilteredDeliveries(deliveries.filter(d => d.status === selectedFilter));
    }
  }, [selectedFilter, deliveries]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleReorder = (delivery: Delivery) => {
    Alert.alert(
      'Reorder Delivery',
      `Would you like to reorder the same delivery to ${delivery.recipient}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reorder', 
          onPress: () => {
            // Navigate to create delivery with pre-filled data
            console.log('Reorder delivery:', delivery.id);
            // TODO: Navigate to CreateDeliveryScreen with pre-filled data
          }
        }
      ]
    );
  };

  const handleContactDriver = (delivery: Delivery) => {
    if (!delivery.driver) {
      Alert.alert('No Driver', 'This delivery has no assigned driver.');
      return;
    }
    
    Alert.alert(
      'Contact Driver',
      `Call ${delivery.driver.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            // TODO: Implement phone call functionality
            console.log('Calling driver:', delivery.driver!.phone);
          }
        }
      ]
    );
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

  const renderDeliveryItem = ({ item }: { item: Delivery }) => {
    const status = statusConfig[item.status];
    return (
      <ParcelCard
        trackingNumber={item.trackingNumber}
        status={item.status}
        recipient={item.recipient}
        deliveryAddress={item.deliveryAddress}
        amount={item.payment.amount}
        date={formatDate(item.createdAt)}
        statusConfig={statusConfig}
        onPress={() => {
          setSelectedDelivery(item);
          setShowDetailsModal(true);
        }}
      />
    );
  };

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

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Delivery History</Text>
        
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

        {/* Deliveries List */}
        <FlatList
          data={filteredDeliveries}
          renderItem={renderDeliveryItem}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="package-variant-closed" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No deliveries found
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Your delivery history will appear here
              </Text>
            </View>
          }
        />
      </View>

      {/* Delivery Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {selectedDelivery && (
              <View style={styles.modalBody}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Delivery Details
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDetailsModal(false)}
                    style={styles.closeButton}
                  >
                    <Icon name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Tracking</Text>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Number:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedDelivery.trackingNumber}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig[selectedDelivery.status].color }]}>
                      <Icon name={statusConfig[selectedDelivery.status].icon} size={16} color="#FFFFFF" />
                      <Text style={styles.statusText}>{statusConfig[selectedDelivery.status].label}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Recipient</Text>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Name:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedDelivery.recipient}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Phone:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedDelivery.recipientPhone}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Addresses</Text>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Pickup:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedDelivery.pickupAddress}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Delivery:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedDelivery.deliveryAddress}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Package</Text>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Weight:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedDelivery.packageDetails.weight}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Dimensions:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedDelivery.packageDetails.dimensions}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Description:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedDelivery.packageDetails.description}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment</Text>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Method:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedDelivery.payment.method}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedDelivery.payment.amount.toFixed(2)} ETB</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedDelivery.payment.status}</Text>
                  </View>
                </View>

                {selectedDelivery.driver && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Driver</Text>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Name:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedDelivery.driver.name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Phone:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedDelivery.driver.phone}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Rating:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedDelivery.driver.rating}/5</Text>
                    </View>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setShowDetailsModal(false);
                      handleReorder(selectedDelivery);
                    }}
                  >
                    <Icon name="refresh" size={20} color="#FFFFFF" />
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Reorder</Text>
                  </TouchableOpacity>

                  {selectedDelivery.driver && (
                    <TouchableOpacity
                      style={[styles.modalButton, { borderColor: colors.border, borderWidth: 1 }]}
                      onPress={() => {
                        setShowDetailsModal(false);
                        handleContactDriver(selectedDelivery);
                      }}
                    >
                      <Icon name="phone" size={20} color={colors.primary} />
                      <Text style={[styles.modalButtonText, { color: colors.primary }]}>Contact Driver</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  deliveryCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  trackingInfo: {
    flex: 1,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
    gap: 8,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recipientText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressText: {
    fontSize: 12,
    flex: 1,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalBody: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 