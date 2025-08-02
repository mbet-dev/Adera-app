import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../types/navigation';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { ShopItem } from '../../types';

type WishlistNavigationProp = StackNavigationProp<CustomerStackParamList, 'Wishlist'>;

export default function WishlistScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<WishlistNavigationProp>();
  const { state: wishlistState, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem, isInCart } = useCart();

  const formatPrice = (price: number): string => {
    return price.toLocaleString('en-ET');
  };

  const handleProductPress = (product: ShopItem) => {
    navigation.navigate('ProductDetail', { itemId: product.id });
  };

  const handleAddToCart = (product: ShopItem) => {
    addItem(product, 1);
    Alert.alert('Success', 'Product added to cart!');
  };

  const handleRemoveFromWishlist = (itemId: string) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromWishlist(itemId) }
      ]
    );
  };

  const handleClearWishlist = () => {
    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to clear your entire wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearWishlist }
      ]
    );
  };

  const renderWishlistItem = ({ item }: { item: any }) => (
    <View style={[styles.wishlistItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.itemImageContainer}
        onPress={() => handleProductPress(item.product)}
      >
        {item.product.image_urls && item.product.image_urls.length > 0 ? (
          <Image source={{ uri: item.product.image_urls[0] }} style={styles.itemImage} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
            <Feather name="image" size={24} color={colors.text} />
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={[styles.itemPrice, { color: colors.primary || '#E63946' }]}>
          ETB {formatPrice(item.product.price)}
        </Text>
        <Text style={[styles.itemDate, { color: colors.border }]}>
          Added {new Date(item.addedAt).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary || '#E63946' }]}
          onPress={() => handleAddToCart(item.product)}
        >
          <Feather 
            name={isInCart(item.product.id) ? "check" : "shopping-cart"} 
            size={16} 
            color="#fff" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error || '#E63946' }]}
          onPress={() => handleRemoveFromWishlist(item.id)}
        >
          <Feather name="trash-2" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Wishlist</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearWishlist}
          disabled={wishlistState.items.length === 0}
        >
          <Feather name="trash-2" size={20} color={wishlistState.items.length === 0 ? colors.border : colors.error || '#E63946'} />
        </TouchableOpacity>
      </View>

      {wishlistState.items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="heart" size={64} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your wishlist is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.border }]}>
            Start adding products to your wishlist
          </Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.primary || '#E63946' }]}
            onPress={() => navigation.navigate('ShopHome')}
          >
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistState.items}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
  },
  wishlistItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemImageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
  },
  itemActions: {
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 