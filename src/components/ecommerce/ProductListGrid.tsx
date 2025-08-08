import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { ShopItem } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { getWebShadow, isWeb } from '../../utils/platform';

const { width } = Dimensions.get('window');

interface ProductListGridProps {
  products: ShopItem[];
  loading: boolean;
  error: string | null;
  onProductPress: (product: ShopItem) => void;
  onAddToCart: (product: ShopItem) => void;
}

export default function ProductListGrid({ 
  products, 
  loading, 
  error, 
  onProductPress, 
  onAddToCart 
}: ProductListGridProps) {
  const { colors } = useTheme();
  const { addItem, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const formatPrice = (price: number): string => {
    return price.toLocaleString('en-ET');
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Feather key={i} name="star" size={12} color="#FFD700" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Feather key={i} name="star" size={12} color="#FFD700" style={{ opacity: 0.5 }} />);
      } else {
        stars.push(<Feather key={i} name="star" size={12} color="#D3D3D3" />);
      }
    }
    return stars;
  };

  const renderProduct = ({ item }: { item: ShopItem }) => {
    console.log('Rendering product:', item.name, 'Image URLs:', item.image_urls);
    
    return (
      <TouchableOpacity
        style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => onProductPress(item)}
      >
        <View style={styles.productImageContainer}>
          {item.image_urls && item.image_urls.length > 0 ? (
            <Image 
              source={{ uri: item.image_urls[0] }} 
              style={styles.productImage}
              onError={(error) => console.log('Image load error for:', item.name, error)}
              onLoad={() => console.log('Image loaded successfully for:', item.name)}
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
              <Feather name="image" size={24} color={colors.text} />
            </View>
          )}
          
          {/* Sale Badge */}
          {item.original_price && item.original_price > item.price && (
            <View style={[styles.saleBadge, { backgroundColor: colors.error || '#E63946' }]}>
              <Text style={styles.saleBadgeText}>SALE</Text>
            </View>
          )}

          {/* Wishlist Button - Positioned absolutely */}
          <TouchableOpacity
            style={[styles.wishlistButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => isInWishlist(item.id) ? removeFromWishlist(item.id) : addToWishlist(item)}
          >
            <Feather 
              name={isInWishlist(item.id) ? "heart" : "heart"} 
              size={16} 
              color={isInWishlist(item.id) ? colors.error || '#E63946' : colors.border} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          
          <View style={styles.priceContainer}>
            {item.original_price && item.original_price > item.price ? (
              <View style={styles.priceRow}>
                <Text style={[styles.originalPrice, { color: colors.border }]}>
                  ETB {formatPrice(item.original_price)}
                </Text>
                <Text style={[styles.currentPrice, { color: colors.primary || '#E63946' }]}>
                  ETB {formatPrice(item.price)}
                </Text>
              </View>
            ) : (
              <Text style={[styles.currentPrice, { color: colors.primary || '#E63946' }]}>
                ETB {formatPrice(item.price)}
              </Text>
            )}
          </View>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            {renderStarRating(item.rating || 0)}
            <Text style={[styles.ratingText, { color: colors.border }]}>
              ({item.rating || 0})
            </Text>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={[
              styles.addToCartButton, 
              { 
                backgroundColor: isInCart(item.id) 
                  ? colors.success || '#28a745' 
                  : colors.primary || '#E63946' 
              }
            ]}
            onPress={() => addItem(item, 1)}
          >
            <Feather 
              name={isInCart(item.id) ? "check" : "shopping-cart"} 
              size={16} 
              color="#fff" 
            />
            <Text style={styles.addToCartText}>
              {isInCart(item.id) ? 'In Cart' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary || '#E63946'} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={colors.error || '#E63946'} />
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="package" size={48} color={colors.border} />
        <Text style={[styles.emptyText, { color: colors.text }]}>No products found</Text>
        <Text style={[styles.emptySubtext, { color: colors.border }]}>
          Try adjusting your filters or check back later
        </Text>
      </View>
    );
  }

  // Calculate responsive columns and item width
  const getNumColumns = () => {
    if (isWeb) {
      if (width >= 1200) return 4; // Desktop
      if (width >= 768) return 3;  // Tablet
      return 2; // Mobile
    }
    return 2; // Native mobile
  };

  const numColumns = getNumColumns();
  const itemMargin = 8;
  const containerPadding = 16;
  const itemWidth = (width - containerPadding * 2 - itemMargin * (numColumns - 1)) / numColumns;

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      contentContainerStyle={[styles.container, { paddingHorizontal: containerPadding }]}
      showsVerticalScrollIndicator={false}
      key={numColumns} // Force re-render when columns change
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    ...getWebShadow(0.1, 3.84, 2),
    elevation: 5,
  },
  productImageContainer: {
    position: 'relative',
    height: isWeb ? 120 : 140, // Smaller on web for better proportion in responsive grid
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8, // Changed from right: 8 to left: 8 to avoid overlap with wishlist button
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saleBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  wishlistButton: {
    position: 'absolute',
    top: 32, // Moved down from 8 to 32 to avoid overlap with SALE badge
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...getWebShadow(0.1, 3.84, 2),
    elevation: 3,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
}); 