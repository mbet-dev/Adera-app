import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  Image,
  SafeAreaView
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingIndicator } from '../../components/ui/LoadingIndicator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PartnerStackParamList } from '../../types/navigation';
import { ApiService } from '../../services/core';
import { ShopItem, ShopCategory } from '../../types';

const { width, height } = Dimensions.get('window');

interface InventoryStats {
  totalItems: number;
  activeItems: number;
  lowStockItems: number;
  featuredItems: number;
}

interface ItemFormData {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category_id?: string;
  delivery_supported: boolean;
  delivery_fee: number;
  is_featured: boolean;
  image_urls?: string[];
}

export default function InventoryScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<PartnerStackParamList>>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    activeItems: 0,
    lowStockItems: 0,
    featuredItems: 0
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    delivery_supported: true,
    delivery_fee: 0,
    is_featured: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Load shop data
      const shopResponse = await ApiService.getShopByPartnerId(user.id);
      if (!shopResponse.success || !shopResponse.data) {
        throw new Error('Shop not found. Please set up your shop first.');
      }

      const shop = shopResponse.data;

      // Load categories
      const categoriesResponse = await ApiService.getShopCategories(shop.id);
      const categoriesData = categoriesResponse.success ? categoriesResponse.data || [] : [];
      setCategories(categoriesData);

      // Load items
      const itemsResponse = await ApiService.getShopItems(shop.id);
      const itemsData = itemsResponse.success ? itemsResponse.data || [] : [];
      setItems(itemsData);

      // Calculate stats
      const activeItems = itemsData.filter(item => item.is_active).length;
      const lowStockItems = itemsData.filter(item => item.quantity <= 5).length;
      const featuredItems = itemsData.filter(item => item.is_featured).length;

      setStats({
        totalItems: itemsData.length,
        activeItems,
        lowStockItems,
        featuredItems
      });

    } catch (err) {
      console.error('Error loading inventory data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInventoryData();
    setIsRefreshing(false);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      delivery_supported: true,
      delivery_fee: 0,
      is_featured: false
    });
    setShowAddModal(true);
  };

  const handleEditItem = (item: ShopItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      quantity: item.quantity,
      category_id: item.category_id,
      delivery_supported: item.delivery_supported,
      delivery_fee: item.delivery_fee,
      is_featured: item.is_featured,
      image_urls: item.image_urls
    });
    setShowAddModal(true);
  };

  const handleSaveItem = async () => {
    try {
      if (!user?.id) return;

      setIsSaving(true);

      // Validate form
      if (!formData.name.trim()) {
        Alert.alert('Error', 'Item name is required');
        return;
      }

      if (formData.price <= 0) {
        Alert.alert('Error', 'Price must be greater than 0');
        return;
      }

      if (formData.quantity < 0) {
        Alert.alert('Error', 'Quantity cannot be negative');
        return;
      }

      const shopResponse = await ApiService.getShopByPartnerId(user.id);
      if (!shopResponse.success || !shopResponse.data) {
        throw new Error('Shop not found');
      }

      const shop = shopResponse.data;

      if (editingItem) {
        // Update existing item
        const response = await ApiService.updateShopItem(editingItem.id, {
          ...formData,
          shop_id: shop.id
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to update item');
        }

        Alert.alert('Success', 'Item updated successfully');
      } else {
        // Create new item
        const response = await ApiService.createShopItem({
          ...formData,
          shop_id: shop.id,
          is_active: true
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to create item');
        }

        Alert.alert('Success', 'Item created successfully');
      }

      setShowAddModal(false);
      await loadInventoryData();

    } catch (err) {
      console.error('Error saving item:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (item: ShopItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.deleteShopItem(item.id);
              if (!response.success) {
                throw new Error(response.error || 'Failed to delete item');
              }
              Alert.alert('Success', 'Item deleted successfully');
              await loadInventoryData();
            } catch (err) {
              console.error('Error deleting item:', err);
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const handleUpdateStock = async (item: ShopItem, newQuantity: number) => {
    try {
      const response = await ApiService.updateItemStock(item.id, newQuantity - item.quantity);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update stock');
      }
      await loadInventoryData();
    } catch (err) {
      console.error('Error updating stock:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update stock');
    }
  };

  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toFixed(2)}`;
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const renderStatsCard = (title: string, value: number, icon: string, color: string) => (
    <Card style={{ backgroundColor: colors.card, flex: 1, marginHorizontal: 6, padding: 16, alignItems: 'center' }}>
      <Icon name={icon} size={24} color={color} />
      <Text style={[styles.statValue, { color: colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {title}
      </Text>
    </Card>
  );

  const renderCategoryFilter = (category: ShopCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryFilter,
        {
          backgroundColor: selectedCategory === category.id ? colors.primary : colors.card,
          borderColor: colors.border
        }
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Text style={[
        styles.categoryFilterText,
        { color: selectedCategory === category.id ? colors.card : colors.text }
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const renderItemCard = ({ item }: { item: ShopItem }) => (
    <Card style={{ backgroundColor: colors.card, marginBottom: 12, padding: 16, borderRadius: 12 }}>
      {/* Item Header */}
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <View style={styles.itemTitleRow}>
            <Text style={[styles.itemName, { color: colors.text }]}>
              {item.name}
            </Text>
            {item.is_featured && (
              <View style={[styles.featuredBadge, { backgroundColor: colors.primary + '20' }]}>
                <Icon name="star" size={12} color={colors.primary} />
                <Text style={[styles.featuredText, { color: colors.primary }]}>Featured</Text>
              </View>
            )}
          </View>
          <Text style={[styles.itemDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description || 'No description available'}
          </Text>
          
          {/* Item Details Grid */}
          <View style={styles.itemDetailsGrid}>
            <View style={styles.detailItem}>
              <Icon name="currency-usd" size={16} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.primary }]}>
                {formatCurrency(item.price)}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="package-variant" size={16} color={item.quantity <= 5 ? colors.error : colors.success} />
              <Text style={[styles.detailText, { color: item.quantity <= 5 ? colors.error : colors.textSecondary }]}>
                {item.quantity} in stock
              </Text>
            </View>
            
            {item.delivery_supported && (
              <View style={styles.detailItem}>
                <Icon name="truck-delivery" size={16} color={colors.success} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {formatCurrency(item.delivery_fee)} delivery
                </Text>
              </View>
            )}
            
            <View style={styles.detailItem}>
              <Icon name={item.is_active ? 'check-circle' : 'close-circle'} size={16} color={item.is_active ? colors.success : colors.error} />
              <Text style={[styles.detailText, { color: item.is_active ? colors.success : colors.error }]}>
                {item.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Item Image or Placeholder */}
        <View style={styles.itemImageContainer}>
          {item.image_urls && item.image_urls.length > 0 ? (
            <Image
              source={{ uri: item.image_urls[0] }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.border + '40' }]}>
              <Icon name="image" size={24} color={colors.textSecondary} />
            </View>
          )}
          
          {item.quantity <= 5 && (
            <View style={[styles.lowStockIndicator, { backgroundColor: colors.error }]}>
              <Icon name="alert" size={10} color="white" />
            </View>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
          onPress={() => handleEditItem(item)}
        >
          <Icon name="pencil" size={16} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.warning + '15' }]}
          onPress={() => {
            Alert.prompt(
              'Update Stock',
              `Current stock: ${item.quantity}\nEnter new quantity for ${item.name}:`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Update',
                  onPress: (newQuantity) => {
                    const quantity = parseInt(newQuantity || '0');
                    if (!isNaN(quantity) && quantity >= 0) {
                      handleUpdateStock(item, quantity);
                    } else {
                      Alert.alert('Error', 'Please enter a valid quantity (0 or greater)');
                    }
                  }
                }
              ],
              'plain-text',
              item.quantity.toString()
            );
          }}
        >
          <Icon name="package-variant-closed" size={16} color={colors.warning} />
          <Text style={[styles.actionButtonText, { color: colors.warning }]}>
            Stock
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.textSecondary + '15' }]}
          onPress={() => {
            Alert.alert(
              'Toggle Status',
              `Do you want to ${item.is_active ? 'deactivate' : 'activate'} this item?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: item.is_active ? 'Deactivate' : 'Activate',
                  onPress: async () => {
                    try {
                      const response = await ApiService.updateShopItem(item.id, {
                        ...item,
                        is_active: !item.is_active
                      });
                      if (response.success) {
                        await loadInventoryData();
                        Alert.alert('Success', `Item ${!item.is_active ? 'activated' : 'deactivated'} successfully`);
                      }
                    } catch (error) {
                      Alert.alert('Error', 'Failed to update item status');
                    }
                  }
                }
              ]
            );
          }}
        >
          <Icon name={item.is_active ? 'eye-off' : 'eye'} size={16} color={colors.textSecondary} />
          <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
            {item.is_active ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error + '15' }]}
          onPress={() => handleDeleteItem(item)}
        >
          <Icon name="delete" size={16} color={colors.error} />
          <Text style={[styles.actionButtonText, { color: colors.error }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <LoadingIndicator />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading inventory...
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
            onPress={loadInventoryData}
            style={styles.retryButton}
          />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>
              Inventory Management
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Manage your shop items and stock
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddItem}
          >
            <Icon name="plus" size={24} color={colors.card} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {renderStatsCard('Total Items', stats.totalItems, 'package-variant', colors.primary)}
            {renderStatsCard('Active', stats.activeItems, 'check-circle', colors.success)}
          </View>
          <View style={styles.statsRow}>
            {renderStatsCard('Low Stock', stats.lowStockItems, 'alert', colors.warning)}
            {renderStatsCard('Featured', stats.featuredItems, 'star', colors.primary)}
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Icon name="magnify" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchTextInput, { color: colors.text }]}
              placeholder="Search items..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilters}
        >
          <TouchableOpacity
            style={[
              styles.categoryFilter,
              {
                backgroundColor: selectedCategory === 'all' ? colors.primary : colors.card,
                borderColor: colors.border
              }
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[
              styles.categoryFilterText,
              { color: selectedCategory === 'all' ? colors.card : colors.text }
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map(renderCategoryFilter)}
        </ScrollView>

        {/* Items List */}
        <View style={styles.itemsContainer}>
          <View style={styles.itemsHeader}>
            <Text style={[styles.itemsTitle, { color: colors.text }]}>
              Items ({filteredItems.length})
            </Text>
          </View>

          {filteredItems.length > 0 ? (
            <FlatList
              data={filteredItems}
              renderItem={renderItemCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.itemsList}
            />
          ) : (
            <Card style={{ backgroundColor: colors.card, marginHorizontal: 16, padding: 32, alignItems: 'center' }}>
              <Icon name="package-variant-closed" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No items found
              </Text>
              <Button
                title="Add Your First Item"
                onPress={handleAddItem}
                style={{ marginTop: 16 }}
              />
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Item Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

            <ScrollView style={styles.formContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="Item name"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <TextInput
                style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="Description"
                placeholderTextColor={colors.textSecondary}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="Price"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.price.toString()}
                    onChangeText={(text) => setFormData({ ...formData, price: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="Quantity"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.quantity.toString()}
                    onChangeText={(text) => setFormData({ ...formData, quantity: parseInt(text) || 0 })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="Delivery fee"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.delivery_fee.toString()}
                    onChangeText={(text) => setFormData({ ...formData, delivery_fee: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <TouchableOpacity
                    style={[styles.selectInput, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => {
                      // Show category picker
                      Alert.alert('Select Category', 'Category selection will be implemented');
                    }}
                  >
                    <Text style={[styles.selectText, { color: colors.text }]}>
                      {formData.category_id ? 'Category Selected' : 'Select Category'}
                    </Text>
                    <Icon name="chevron-down" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>
                  Delivery Supported
                </Text>
                <TouchableOpacity
                  style={[styles.switch, { backgroundColor: formData.delivery_supported ? colors.primary : colors.border }]}
                  onPress={() => setFormData({ ...formData, delivery_supported: !formData.delivery_supported })}
                >
                  <View style={[styles.switchThumb, { backgroundColor: colors.card }]} />
                </TouchableOpacity>
              </View>

              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>
                  Featured Item
                </Text>
                <TouchableOpacity
                  style={[styles.switch, { backgroundColor: formData.is_featured ? colors.primary : colors.border }]}
                  onPress={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                >
                  <View style={[styles.switchThumb, { backgroundColor: colors.card }]} />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowAddModal(false)}
                style={{ ...styles.modalButton, backgroundColor: colors.card, borderColor: colors.border }}
                textStyle={{ color: colors.text }}
                disabled={isSaving}
              />
              <Button
                title={editingItem ? 'Update' : 'Create'}
                onPress={handleSaveItem}
                style={{ ...styles.modalButton, backgroundColor: colors.primary }}
                textStyle={{ color: colors.card }}
                disabled={isSaving}
              />
            </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchTextInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoryFilters: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  itemsHeader: {
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemsList: {
    paddingBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemStock: {
    fontSize: 14,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 12,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.95,
    maxHeight: height * 0.8,
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 20,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '48%',
  },
  selectInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
  },
  switch: {
    width: 48,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  // Enhanced item card styles
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
  },
  itemDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 12,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemImageContainer: {
    position: 'relative',
    marginLeft: 12,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lowStockIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 
