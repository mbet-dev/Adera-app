import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../types/navigation';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { supabase } from '../../lib/supabase';
import { ShopItem } from '../../types';
import { isWeb, getPlatformStyles } from '../../utils/platform';

type ProductDetailRouteProp = RouteProp<CustomerStackParamList, 'ProductDetail'>;
type ProductDetailNavigationProp = StackNavigationProp<CustomerStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<ProductDetailNavigationProp>();
  const route = useRoute<ProductDetailRouteProp>();
  const { itemId } = route.params;
  const { addItem, getItemQuantity, state } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<ShopItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);

  useEffect(() => {
    fetchProductDetails();
  }, [itemId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('shop_items')
        .select(`
          *,
          category:shop_categories!shop_items_category_id_fkey(name),
          shop:shops!shop_items_shop_id_fkey(
            shop_name,
            description,
            is_approved,
            is_active
          )
        `)
        .eq('id', itemId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err: any) {
      console.error('Error fetching product details:', err);
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem(product, quantity);
    Alert.alert('Success', `${quantity} ${product.name} added to cart!`);
  };

  const isInCart = getItemQuantity(product?.id || '') > 0;

  const handleBuyNow = () => {
    if (!product) return;
    
    // Add item to cart first
    addItem(product, quantity);
    
    // Navigate to checkout
    navigation.navigate('Checkout');
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      Alert.alert('Removed', `${product.name} removed from wishlist`);
    } else {
      addToWishlist(product);
      Alert.alert('Added', `${product.name} added to wishlist`);
    }
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('en-ET');
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Feather
          key={i}
          name={i <= rating ? 'star' : 'star'}
          size={16}
          color={i <= rating ? '#FFD700' : colors.border}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary || '#E63946'} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading product details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={colors.error || '#E63946'} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Product not found'}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary || '#E63946' }]}
            onPress={fetchProductDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Product Details</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.wishlistButton}
            onPress={handleWishlistToggle}
          >
            <Feather 
              name={isInWishlist(product.id) ? "heart" : "heart"} 
              size={24} 
              color={isInWishlist(product.id) ? colors.error || '#E63946' : colors.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Feather name="shopping-cart" size={24} color={colors.text} />
            {state.totalItems > 0 && (
              <View style={styles.cartCountBadge}>
                <Text style={styles.cartCountText}>{state.totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageContainer}>
          {product.image_urls && product.image_urls.length > 0 ? (
            <TouchableOpacity 
              onPress={() => {
                setZoomImageIndex(selectedImageIndex);
                setImageModalVisible(true);
              }}
              activeOpacity={0.9}
            >
              <Image 
                source={{ uri: product.image_urls[selectedImageIndex] }} 
                style={[styles.mainImage, isWeb && styles.webMainImage]}
                resizeMode="cover"
              />
              {/* Zoom indicator */}
              <View style={styles.zoomIndicator}>
                <Feather name="maximize" size={20} color="white" />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }, isWeb && styles.webMainImage]}>
              <Feather name="image" size={48} color={colors.text} />
            </View>
          )}

          {/* Image Gallery */}
          {product.image_urls && product.image_urls.length > 1 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.imageGallery}
              contentContainerStyle={styles.imageGalleryContent}
            >
              {product.image_urls.map((imageUrl, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && { borderColor: colors.primary || '#E63946' }
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  <Image source={{ uri: imageUrl }} style={styles.thumbnailImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Image Zoom Modal */}
        <Modal
          visible={imageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalBackground, { backgroundColor: colors.background + 'E6' }]}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setImageModalVisible(false)}
              >
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
              
              {product.image_urls && product.image_urls[zoomImageIndex] && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  pagingEnabled
                  style={styles.modalScrollView}
                >
                  {product.image_urls.map((imageUrl, index) => (
                    <View key={index} style={styles.modalImageContainer}>
                      <Image 
                        source={{ uri: imageUrl }} 
                        style={styles.modalImage}
                        resizeMode="contain"
                      />
                    </View>
                  ))}
                </ScrollView>
              )}
              
              {/* Image counter */}
              <View style={styles.imageCounter}>
                <Text style={[styles.imageCounterText, { color: colors.text }]}>
                  {zoomImageIndex + 1} of {product.image_urls?.length || 0}
                </Text>
              </View>
            </View>
          </View>
        </Modal>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: colors.text }]}>
            {product.name}
          </Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            {renderStarRating(product.rating || 0)}
            <Text style={[styles.ratingText, { color: colors.border }]}>
              ({product.rating || 0})
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            {product.original_price && product.original_price > product.price ? (
              <View style={styles.priceRow}>
                <Text style={[styles.originalPrice, { color: colors.border }]}>
                  ETB {formatPrice(product.original_price)}
                </Text>
                <Text style={[styles.currentPrice, { color: colors.primary || '#E63946' }]}>
                  ETB {formatPrice(product.price)}
                </Text>
              </View>
            ) : (
              <Text style={[styles.currentPrice, { color: colors.primary || '#E63946' }]}>
                ETB {formatPrice(product.price)}
              </Text>
            )}
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.descriptionTitle, { color: colors.text }]}>
                Description
              </Text>
              <Text style={[styles.descriptionText, { color: colors.text }]}>
                {product.description}
              </Text>
            </View>
          )}

          {/* Shop Info */}
          {product.shop && (
            <View style={styles.shopContainer}>
              <Text style={[styles.shopTitle, { color: colors.text }]}>
                Sold by {product.shop.shop_name}
              </Text>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={[styles.quantityLabel, { color: colors.text }]}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: colors.border }]}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Feather name="minus" size={16} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.quantityText, { color: colors.text }]}>
                {quantity}
              </Text>
              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: colors.border }]}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Feather name="plus" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.addToCartButton, 
            { 
              backgroundColor: isInCart ? '#10B981' : colors.card,
              borderColor: isInCart ? '#10B981' : colors.border 
            }
          ]}
          onPress={handleAddToCart}
        >
          <Feather 
            name={isInCart ? "check" : "shopping-cart"} 
            size={20} 
            color={isInCart ? "#fff" : colors.text} 
          />
          <Text style={[
            styles.addToCartText, 
            { color: isInCart ? "#fff" : colors.text }
          ]}>
            {isInCart ? 'In Cart' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buyNowButton, { backgroundColor: colors.primary || '#E63946' }]}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  wishlistButton: {
    padding: 8,
  },
  cartButton: {
    position: 'relative', // Added for cart count badge positioning
    padding: 8,
  },
  cartCountBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E63946',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cartCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
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
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: isWeb ? Math.min(400, width * 0.75) : width * 0.75,
  },
  webMainImage: {
    width: isWeb ? Math.min(600, width) : width,
    height: isWeb ? Math.min(400, width * 0.75) : width * 0.75,
    maxWidth: '100%',
    alignSelf: 'center',
  },
  imagePlaceholder: {
    width: width,
    height: isWeb ? Math.min(400, width * 0.75) : width * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  imageGallery: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  imageGalleryContent: {
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  productInfo: {
    paddingHorizontal: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  priceContainer: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  shopContainer: {
    marginBottom: 16,
  },
  shopTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  buyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 12,
  },
  modalScrollView: {
    flex: 1,
    width: '100%',
  },
  modalImageContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modalImage: {
    width: width - 40,
    height: width - 40,
    maxHeight: '80%',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  imageCounterText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
