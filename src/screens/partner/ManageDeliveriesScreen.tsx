import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
  TextInput,
  Modal,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingIndicator } from '../../components/ui/LoadingIndicator';
import { ApiService } from '../../services/core';
import { ParcelStatus, PaymentStatus } from '../../types';

const { width } = Dimensions.get('window');

interface Parcel {
  id: string;
  tracking_id: string;
  status: ParcelStatus;
  recipient_name: string;
  recipient_phone?: string;
  recipient_address?: string;
  total_amount: number;
  payment_status: PaymentStatus;
  created_at: string;
  pickup_code?: string;
  dropoff_code?: string;
  is_priority?: boolean;
  notes?: string;
}

interface FilterOptions {
  status: ParcelStatus | 'all';
  searchQuery: string;
  sortBy: 'date' | 'status' | 'priority';
  sortOrder: 'asc' | 'desc';
}

export default function ManageDeliveriesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering state
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    searchQuery: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);
  
  // Action states
  const [processingAction, setProcessingAction] = useState(false);
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    loadParcels();
  }, []);
  
  const loadParcels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const response = await ApiService.getPartnerParcels(user.id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load parcels');
      }
      
      setParcels(response.data || []);
    } catch (err) {
      console.error('Error loading parcels:', err);
      setError(err instanceof Error ? err.message : 'Failed to load parcels');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadParcels();
    setRefreshing(false);
  };
  
  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilterModal(false);
  };
  
  const resetFilters = () => {
    const defaultFilters = {
      status: 'all',
      searchQuery: '',
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    setShowFilterModal(false);
  };
  
  const handleParcelPress = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setShowDetailModal(true);
  };
  
  const handleStatusChange = async (newStatus: ParcelStatus) => {
    if (!selectedParcel || !user?.id) return;
    
    try {
      setProcessingAction(true);
      
      const response = await ApiService.updateParcelStatus({
        parcel_id: selectedParcel.id,
        status: newStatus,
        notes: notes || `Status updated to ${newStatus.toLowerCase().replace(/_/g, ' ')} by partner`,
        actor_id: user.id,
        actor_role: 'PARTNER'
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update status');
      }
      
      // Create parcel event
      await ApiService.createParcelEvent(
        selectedParcel.id,
        newStatus,
        user.id,
        'PARTNER',
        notes || `Parcel ${newStatus.toLowerCase().replace(/_/g, ' ')} by partner`
      );
      
      Alert.alert(
        'Success',
        `Parcel status updated to ${newStatus.toLowerCase().replace(/_/g, ' ')}`,
        [{ text: 'OK' }]
      );
      
      // Update local state
      setParcels(parcels.map(p => 
        p.id === selectedParcel.id ? {...p, status: newStatus} : p
      ));
      setSelectedParcel({...selectedParcel, status: newStatus});
      setNotes('');
      
    } catch (err) {
      console.error('Error updating status:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setProcessingAction(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toFixed(2)}`;
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusColor = (status: ParcelStatus) => {
    switch (status) {
      case ParcelStatus.DELIVERED:
        return colors.success;
      case ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB:
      case ParcelStatus.IN_TRANSIT_TO_PICKUP_POINT:
        return colors.warning;
      case ParcelStatus.CREATED:
      case ParcelStatus.FACILITY_RECEIVED:
        return colors.primary;
      default:
        return colors.text;
    }
  };
  
  const getStatusText = (status: ParcelStatus) => {
    return status.replace(/_/g, ' ').toLowerCase();
  };
  
  const getStatusActions = (status: ParcelStatus): { nextStatus: ParcelStatus; label: string }[] => {
    switch (status) {
      case ParcelStatus.CREATED:
        return [{ nextStatus: ParcelStatus.FACILITY_RECEIVED, label: 'Mark as Received' }];
      case ParcelStatus.FACILITY_RECEIVED:
        return [{ nextStatus: ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB, label: 'Mark In Transit' }];
      case ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB:
        return [{ nextStatus: ParcelStatus.PICKUP_READY, label: 'Mark Ready for Pickup' }];
      case ParcelStatus.PICKUP_READY:
        return [{ nextStatus: ParcelStatus.IN_TRANSIT_TO_PICKUP_POINT, label: 'Mark In Transit to Pickup' }];
      case ParcelStatus.IN_TRANSIT_TO_PICKUP_POINT:
        return [{ nextStatus: ParcelStatus.DELIVERED, label: 'Mark as Delivered' }];
      case ParcelStatus.DELIVERED:
        return [];
      default:
        return [];
    }
  };
  
  // Apply filters to parcels
  const filteredParcels = parcels.filter(parcel => {
    // Status filter
    if (filters.status !== 'all' && parcel.status !== filters.status) {
      return false;
    }
    
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        parcel.tracking_id.toLowerCase().includes(query) ||
        parcel.recipient_name.toLowerCase().includes(query) ||
        (parcel.recipient_address && parcel.recipient_address.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Sort parcels
  const sortedParcels = [...filteredParcels].sort((a, b) => {
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    
    switch (filters.sortBy) {
      case 'date':
        return sortOrder * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'status':
        return sortOrder * a.status.localeCompare(b.status);
      case 'priority':
        const aPriority = a.is_priority ? 1 : 0;
        const bPriority = b.is_priority ? 1 : 0;
        return sortOrder * (bPriority - aPriority);
      default:
        return 0;
    }
  });
  
  const renderParcelItem = ({ item }: { item: Parcel }) => (
    <TouchableOpacity onPress={() => handleParcelPress(item)}>
      <Card style={styles.parcelCard}>
        <View style={styles.parcelHeader}>
          <View style={styles.trackingContainer}>
            <Text style={[styles.trackingLabel, { color: colors.textSecondary }]}>Tracking ID</Text>
            <Text style={[styles.trackingId, { color: colors.primary }]}>{item.tracking_id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        
        <View style={styles.parcelContent}>
          <View style={styles.infoRow}>
            <Icon name="account" size={18} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.text }]} numberOfLines={1}>
              {item.recipient_name}
            </Text>
          </View>
          
          {item.recipient_address && (
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={18} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]} numberOfLines={1}>
                {item.recipient_address}
              </Text>
            </View>
          )}
          
          <View style={styles.parcelFooter}>
            <Text style={[styles.amountText, { color: colors.text }]}>
              {formatCurrency(item.total_amount)}
            </Text>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>
        
        {item.is_priority && (
          <View style={[styles.priorityBadge, { backgroundColor: colors.notification + '20' }]}>
            <Icon name="flag" size={14} color={colors.notification} />
            <Text style={[styles.priorityText, { color: colors.notification }]}>Priority</Text>
          </View>
        )}
        
        <View style={styles.arrowContainer}>
          <Icon name="chevron-right" size={24} color={colors.textSecondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );
  
  const renderFilterChips = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersScrollView}
        contentContainerStyle={styles.filtersContainer}
      >
        <TouchableOpacity 
          style={[styles.filterChip, { 
            backgroundColor: filters.status === 'all' ? colors.primary : colors.card,
            borderColor: colors.border 
          }]}
          onPress={() => setFilters({...filters, status: 'all'})}
        >
          <Text style={[styles.filterChipText, { 
            color: filters.status === 'all' ? '#FFF' : colors.text 
          }]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, { 
            backgroundColor: filters.status === ParcelStatus.CREATED ? colors.primary : colors.card,
            borderColor: colors.border 
          }]}
          onPress={() => setFilters({...filters, status: ParcelStatus.CREATED})}
        >
          <Text style={[styles.filterChipText, { 
            color: filters.status === ParcelStatus.CREATED ? '#FFF' : colors.text 
          }]}>New</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, { 
            backgroundColor: filters.status === ParcelStatus.FACILITY_RECEIVED ? colors.primary : colors.card,
            borderColor: colors.border 
          }]}
          onPress={() => setFilters({...filters, status: ParcelStatus.FACILITY_RECEIVED})}
        >
          <Text style={[styles.filterChipText, { 
            color: filters.status === ParcelStatus.FACILITY_RECEIVED ? '#FFF' : colors.text 
          }]}>Received</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, { 
            backgroundColor: filters.status === ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB ? colors.primary : colors.card,
            borderColor: colors.border 
          }]}
          onPress={() => setFilters({...filters, status: ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB})}
        >
          <Text style={[styles.filterChipText, { 
            color: filters.status === ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB ? '#FFF' : colors.text 
          }]}>In Transit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, { 
            backgroundColor: filters.status === ParcelStatus.PICKUP_READY ? colors.primary : colors.card,
            borderColor: colors.border 
          }]}
          onPress={() => setFilters({...filters, status: ParcelStatus.PICKUP_READY})}
        >
          <Text style={[styles.filterChipText, { 
            color: filters.status === ParcelStatus.PICKUP_READY ? '#FFF' : colors.text 
          }]}>Ready</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, { 
            backgroundColor: filters.status === ParcelStatus.DELIVERED ? colors.primary : colors.card,
            borderColor: colors.border 
          }]}
          onPress={() => setFilters({...filters, status: ParcelStatus.DELIVERED})}
        >
          <Text style={[styles.filterChipText, { 
            color: filters.status === ParcelStatus.DELIVERED ? '#FFF' : colors.text 
          }]}>Delivered</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };
  
  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <LoadingIndicator />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading parcels...
          </Text>
        </View>
      </ScreenLayout>
    );
  }
  
  if (error) {
    return (
      <ScreenLayout>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Oops! Something went wrong
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <Button
            title="Try Again"
            onPress={loadParcels}
            style={styles.retryButton}
          />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Manage Deliveries</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track and update delivery status
        </Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Icon name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search by tracking ID or name"
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            value={filters.searchQuery}
            onChangeText={(text) => setFilters({...filters, searchQuery: text})}
          />
          {filters.searchQuery ? (
            <TouchableOpacity onPress={() => setFilters({...filters, searchQuery: ''})}>
              <Icon name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            setTempFilters(filters);
            setShowFilterModal(true);
          }}
        >
          <Icon name="filter-variant" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {renderFilterChips()}
      
      <FlatList
        data={sortedParcels}
        renderItem={renderParcelItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.parcelsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="package-variant" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No parcels found
            </Text>
            <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
              {filters.status !== 'all' || filters.searchQuery 
                ? 'Try changing your filters or search terms'
                : 'New parcels will appear here'}
            </Text>
          </View>
        }
      />
      
      {/* Parcel Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {selectedParcel ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Parcel Details</Text>
                  <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                    <Icon name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={[styles.detailTrackingContainer, { backgroundColor: colors.card }]}>
                    <Text style={[styles.detailTrackingLabel, { color: colors.textSecondary }]}>Tracking ID</Text>
                    <Text style={[styles.detailTrackingId, { color: colors.primary }]}>{selectedParcel.tracking_id}</Text>
                  </View>
                  
                  <View style={[styles.statusContainer, { backgroundColor: getStatusColor(selectedParcel.status) + '20' }]}>
                    <Icon name="package-variant" size={20} color={getStatusColor(selectedParcel.status)} />
                    <Text style={[styles.statusTitle, { color: getStatusColor(selectedParcel.status) }]}>
                      {getStatusText(selectedParcel.status)}
                    </Text>
                  </View>
                  
                  <Card style={{ marginVertical: 12 }}>
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>Recipient Information</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Name:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedParcel.recipient_name}</Text>
                    </View>
                    
                    {selectedParcel.recipient_phone && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Phone:</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{selectedParcel.recipient_phone}</Text>
                      </View>
                    )}
                    
                    {selectedParcel.recipient_address && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Address:</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{selectedParcel.recipient_address}</Text>
                      </View>
                    )}
                  </Card>
                  
                  <Card style={{ marginVertical: 12 }}>
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>Parcel Information</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{formatCurrency(selectedParcel.total_amount)}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Payment Status:</Text>
                      <Text style={[styles.detailValue, { color: selectedParcel.payment_status === 'PAID' ? colors.success : colors.warning }]}>
                        {selectedParcel.payment_status}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Created:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(selectedParcel.created_at)}</Text>
                    </View>
                    
                    {selectedParcel.pickup_code && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Pickup Code:</Text>
                        <Text style={[styles.detailValue, { color: colors.primary, fontWeight: 'bold' }]}>{selectedParcel.pickup_code}</Text>
                      </View>
                    )}
                    
                    {selectedParcel.dropoff_code && (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Dropoff Code:</Text>
                        <Text style={[styles.detailValue, { color: colors.primary, fontWeight: 'bold' }]}>{selectedParcel.dropoff_code}</Text>
                      </View>
                    )}
                    
                    {selectedParcel.notes && (
                      <View style={styles.notesContainer}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Notes:</Text>
                        <Text style={[styles.notesText, { color: colors.text }]}>{selectedParcel.notes}</Text>
                      </View>
                    )}
                  </Card>
                  
                  {/* Status Update Section */}
                  {getStatusActions(selectedParcel.status).length > 0 && (
                    <Card style={{ marginVertical: 12 }}>
                      <Text style={[styles.detailSectionTitle, { color: colors.text }]}>Update Status</Text>
                      
                      <TextInput
                        placeholder="Add notes (optional)"
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.notesInput, { 
                          backgroundColor: colors.card, 
                          color: colors.text,
                          borderColor: colors.border
                        }]}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                      />
                      
                      <View style={styles.actionsContainer}>
                        {getStatusActions(selectedParcel.status).map((action, index) => (
                          <Button
                            key={index}
                            title={action.label}
                            onPress={() => handleStatusChange(action.nextStatus)}
                            disabled={processingAction}
                            loading={processingAction}
                            style={styles.actionButton}
                          />
                        ))}
                      </View>
                    </Card>
                  )}
                </ScrollView>
              </>
            ) : (
              <LoadingIndicator />
            )}
          </SafeAreaView>
        </View>
      </Modal>
      
      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Parcels</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Sort By</Text>
              
              <View style={styles.radioGroup}>
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => setTempFilters({...tempFilters, sortBy: 'date'})}
                >
                  <View style={[styles.radioButton, { borderColor: colors.primary }]}>
                    {tempFilters.sortBy === 'date' && (
                      <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text style={[styles.radioLabel, { color: colors.text }]}>Date</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => setTempFilters({...tempFilters, sortBy: 'status'})}
                >
                  <View style={[styles.radioButton, { borderColor: colors.primary }]}>
                    {tempFilters.sortBy === 'status' && (
                      <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text style={[styles.radioLabel, { color: colors.text }]}>Status</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => setTempFilters({...tempFilters, sortBy: 'priority'})}
                >
                  <View style={[styles.radioButton, { borderColor: colors.primary }]}>
                    {tempFilters.sortBy === 'priority' && (
                      <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text style={[styles.radioLabel, { color: colors.text }]}>Priority</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Sort Order</Text>
              
              <View style={styles.radioGroup}>
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => setTempFilters({...tempFilters, sortOrder: 'desc'})}
                >
                  <View style={[styles.radioButton, { borderColor: colors.primary }]}>
                    {tempFilters.sortOrder === 'desc' && (
                      <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text style={[styles.radioLabel, { color: colors.text }]}>Newest First</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => setTempFilters({...tempFilters, sortOrder: 'asc'})}
                >
                  <View style={[styles.radioButton, { borderColor: colors.primary }]}>
                    {tempFilters.sortOrder === 'asc' && (
                      <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text style={[styles.radioLabel, { color: colors.text }]}>Oldest First</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Status</Text>
              
              <View style={styles.statusOptions}>
                <TouchableOpacity 
                  style={[styles.statusOption, { 
                    backgroundColor: tempFilters.status === 'all' ? colors.primary : colors.card,
                    borderColor: colors.border
                  }]}
                  onPress={() => setTempFilters({...tempFilters, status: 'all'})}
                >
                  <Text style={[styles.statusOptionText, { 
                    color: tempFilters.status === 'all' ? '#FFF' : colors.text 
                  }]}>All</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.statusOption, { 
                    backgroundColor: tempFilters.status === ParcelStatus.CREATED ? colors.primary : colors.card,
                    borderColor: colors.border
                  }]}
                  onPress={() => setTempFilters({...tempFilters, status: ParcelStatus.CREATED})}
                >
                  <Text style={[styles.statusOptionText, { 
                    color: tempFilters.status === ParcelStatus.CREATED ? '#FFF' : colors.text 
                  }]}>New</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.statusOption, { 
                    backgroundColor: tempFilters.status === ParcelStatus.FACILITY_RECEIVED ? colors.primary : colors.card,
                    borderColor: colors.border
                  }]}
                  onPress={() => setTempFilters({...tempFilters, status: ParcelStatus.FACILITY_RECEIVED})}
                >
                  <Text style={[styles.statusOptionText, { 
                    color: tempFilters.status === ParcelStatus.FACILITY_RECEIVED ? '#FFF' : colors.text 
                  }]}>Received</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.statusOption, { 
                    backgroundColor: tempFilters.status === ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB ? colors.primary : colors.card,
                    borderColor: colors.border
                  }]}
                  onPress={() => setTempFilters({...tempFilters, status: ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB})}
                >
                  <Text style={[styles.statusOptionText, { 
                    color: tempFilters.status === ParcelStatus.IN_TRANSIT_TO_FACILITY_HUB ? '#FFF' : colors.text 
                  }]}>In Transit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.statusOption, { 
                    backgroundColor: tempFilters.status === ParcelStatus.PICKUP_READY ? colors.primary : colors.card,
                    borderColor: colors.border
                  }]}
                  onPress={() => setTempFilters({...tempFilters, status: ParcelStatus.PICKUP_READY})}
                >
                  <Text style={[styles.statusOptionText, { 
                    color: tempFilters.status === ParcelStatus.PICKUP_READY ? '#FFF' : colors.text 
                  }]}>Ready</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.statusOption, { 
                    backgroundColor: tempFilters.status === ParcelStatus.DELIVERED ? colors.primary : colors.card,
                    borderColor: colors.border
                  }]}
                  onPress={() => setTempFilters({...tempFilters, status: ParcelStatus.DELIVERED})}
                >
                  <Text style={[styles.statusOptionText, { 
                    color: tempFilters.status === ParcelStatus.DELIVERED ? '#FFF' : colors.text 
                  }]}>Delivered</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Reset"
                onPress={resetFilters}
                variant="outline"
                style={styles.footerButton}
              />
              <Button
                title="Apply Filters"
                onPress={applyFilters}
                style={styles.footerButton}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersScrollView: {
    maxHeight: 50,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  parcelsList: {
    padding: 20,
    paddingTop: 4,
  },
  parcelCard: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  parcelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  trackingContainer: {},
  trackingLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  trackingId: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  parcelContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
  },
  parcelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
  },
  priorityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
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
    width: width * 0.9,
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  detailTrackingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailTrackingLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailTrackingId: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  notesContainer: {
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 16,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
