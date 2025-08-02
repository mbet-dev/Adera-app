import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  Image,
  Dimensions,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList, GuestStackParamList } from '../../types/navigation';
import SmartFilters from '../../components/ecommerce/SmartFilters';
import ProductListGrid from '../../components/ecommerce/ProductListGrid';
import SearchBar from '../../components/ecommerce/SearchBar';
import PriceRangeSlider from '../../components/ecommerce/PriceRangeSlider';
import BannerCarousel from '../../components/ecommerce/BannerCarousel';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { ShopItem } from '../../types';
import { getPlatformStyles, isWeb } from '../../utils/platform';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

type ShopHomeNavigationProp = StackNavigationProp<CustomerStackParamList, 'ShopHome'> | StackNavigationProp<GuestStackParamList, 'ShopHome'>;

interface Shop {
  id: string;
  shop_name: string;
  description: string;
  logo_url: string | null | undefined;
  banner_url: string | null | undefined;
  rating: number;
  review_count: number;
  total_sales: number;
  total_orders: number;
  primary_color: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export default function ShopHomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<ShopHomeNavigationProp>();
  const route = useRoute();
  const { addItem, state: cartState } = useCart();
  const { state: wishlistState } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const platformStyles = getPlatformStyles();
  
  // Check if this is being rendered from guest navigation
  const isGuestMode = !isAuthenticated;
  
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const { products, loading, error } = useProducts({
    filter: selectedFilter,
    priceRange: priceRange,
    searchQuery: searchQuery,
    category: selectedCategory,
  });

  // Fetch featured shops
  useEffect(() => {
    fetchFeaturedShops();
  }, []);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Mock wallet balance - replace with actual API call
  useEffect(() => {
    // Only set wallet balance for authenticated users
    if (isAuthenticated && user) {
      // Simulate wallet balance fetch
      setWalletBalance(2500);
    }
  }, [isAuthenticated, user]);

  const fetchFeaturedShops = async () => {
    try {
      setLoadingShops(true);
      const { data, error } = await supabase
        .from('shops')
        .select(`
          id,
          shop_name,
          description,
          logo_url,
          banner_url,
          rating,
          review_count,
          total_sales,
          total_orders,
          primary_color
        `)
        .eq('is_featured', true)
        .eq('is_approved', true)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(10);

      if (error) throw error;
      setShops(data || []);
    } catch (err) {
      console.error('Error fetching shops:', err);
      // Fallback to mock data
      setShops([
        { 
          id: '1', 
          shop_name: 'Tech Store', 
          description: 'Your one-stop shop for all things technology',
          logo_url: undefined,
          banner_url: undefined,
          rating: 4.5,
          review_count: 23,
          total_sales: 125000,
          total_orders: 45,
          primary_color: '#3B82F6'
        },
        { 
          id: '2', 
          shop_name: 'Fashion Hub', 
          description: 'Trendy fashion items for every occasion',
          logo_url: undefined,
          banner_url: undefined,
          rating: 4.2,
          review_count: 18,
          total_sales: 89000,
          total_orders: 32,
          primary_color: '#E63946'
        },
        { 
          id: '3', 
          shop_name: 'Home & Garden', 
          description: 'Everything you need to make your home beautiful',
          logo_url: undefined,
          banner_url: undefined,
          rating: 4.7,
          review_count: 41,
          total_sales: 156000,
          total_orders: 67,
          primary_color: '#10B981'
        },
        { 
          id: '4', 
          shop_name: 'Sports Zone', 
          description: 'Premium sports equipment and athletic wear',
          logo_url: undefined,
          banner_url: undefined,
          rating: 4.3,
          review_count: 15,
          total_sales: 98000,
          total_orders: 28,
          primary_color: '#F59E0B'
        },
      ]);
    } finally {
      setLoadingShops(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from('shop_categories')
        .select('id, name')
        .order('sort_order', { ascending: true })
        .limit(12);

      if (error) throw error;
      
      // Enhanced category icons with more appropriate and relatable icons
      const categoryIcons = [
        { name: 'Smartphones', icon: 'smartphone', color: '#3B82F6' },
        { name: 'Laptops', icon: 'monitor', color: '#10B981' },
        { name: 'Accessories', icon: 'headphones', color: '#F59E0B' },
        { name: 'Gaming', icon: 'gamepad-2', color: '#8B5CF6' },
        { name: "Men's Clothing", icon: 'user', color: '#1E40AF' },
        { name: "Women's Clothing", icon: 'user-check', color: '#EC4899' },
        { name: 'Shoes', icon: 'shoe-print', color: '#059669' },
        { name: 'Accessories', icon: 'watch', color: '#7C3AED' },
        { name: "Men's Shoes", icon: 'user', color: '#1E40AF' },
        { name: "Women's Shoes", icon: 'user-check', color: '#EC4899' },
        { name: 'Sports Shoes', icon: 'activity', color: '#059669' },
        { name: 'Formal Shoes', icon: 'briefcase', color: '#374151' },
        { name: 'Fresh Produce', icon: 'shopping-cart', color: '#10B981' },
        { name: 'Dairy & Eggs', icon: 'droplet', color: '#FEF3C7' },
        { name: 'Beverages', icon: 'coffee', color: '#92400E' },
        { name: 'Snacks', icon: 'gift', color: '#F59E0B' },
        { name: 'Furniture', icon: 'home', color: '#8B4513' },
        { name: 'Electronics', icon: 'zap', color: '#3B82F6' },
        { name: 'Home Decor', icon: 'image', color: '#EC4899' },
        { name: 'Collectibles', icon: 'star', color: '#F59E0B' },
        { name: 'Cameras', icon: 'camera', color: '#374151' },
        { name: 'Vintage Tech', icon: 'clock', color: '#6B7280' },
      ];

      // Add "All" category at the beginning
      const allCategory = {
        id: 'all',
        name: 'All',
        icon: 'grid',
        color: '#6B7280',
      };

      const mappedCategories = (data || []).map((cat, index) => {
        const iconData = categoryIcons.find(icon => icon.name === cat.name);
        const fallbackIcon = categoryIcons[index % categoryIcons.length];
        return {
          id: cat.id,
          name: cat.name,
          icon: iconData ? iconData.icon : fallbackIcon.icon,
          color: iconData ? iconData.color : fallbackIcon.color,
        };
      });

      // Add "All" category at the beginning
      setCategories([allCategory, ...mappedCategories]);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback to mock categories with "All" option
      setCategories([
        { id: 'all', name: 'All', icon: 'grid', color: '#6B7280' },
        { id: '1', name: 'Electronics', icon: 'smartphone', color: '#E63946' },
        { id: '2', name: 'Fashion', icon: 'shopping-bag', color: '#457B9D' },
        { id: '3', name: 'Home', icon: 'home', color: '#1D3557' },
        { id: '4', name: 'Sports', icon: 'activity', color: '#A8DADC' },
        { id: '5', name: 'Books', icon: 'book', color: '#F1FAEE' },
        { id: '6', name: 'Beauty', icon: 'heart', color: '#E63946' },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

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

  const handleCartPress = () => {
    if (isGuestMode) {
      (navigation as any).navigate('Cart');
    } else {
      navigation.navigate('Cart');
    }
  };

  const handleWishlistPress = () => {
    if (isGuestMode) {
      (navigation as any).navigate('Wishlist');
    } else {
      navigation.navigate('Wishlist');
    }
  };

  const handleOrderHistoryPress = () => {
    if (isGuestMode) {
      (navigation as any).navigate('OrderHistory');
    } else {
      navigation.navigate('OrderHistory');
    }
  };

  const handleSearchPress = () => {
    setShowSearch(!showSearch);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  const handleCategoryPress = (category: Category) => {
    if (category.name === 'All') {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(selectedCategory === category.name ? null : category.name);
    }
  };

  const renderShopItem = ({ item }: { item: Shop }) => {
    // Generate initials from shop name
    const getInitials = (name: string) => {
      return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    };

    // Generate a consistent color based on shop name
    const getShopColor = (name: string) => {
      const colors = ['#E63946', '#457B9D', '#1D3557', '#A8DADC', '#F1FAEE', '#E63946'];
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
    };

    return (
      <TouchableOpacity style={styles.shopItem}>
        <View style={styles.shopImageContainer}>
          {item.logo_url ? (
            <Image 
              source={{ uri: item.logo_url }} 
              style={styles.shopImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.shopLogoPlaceholder, { backgroundColor: getShopColor(item.shop_name) }]}>
              <Text style={styles.shopLogoText}>{getInitials(item.shop_name)}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.shopName, { color: colors.text }]} numberOfLines={1}>
          {item.shop_name}
        </Text>
        <View style={styles.shopRating}>
          <Feather name="star" size={12} color="#FFD700" />
          <Text style={[styles.ratingText, { color: colors.text }]}>
            {item.rating.toFixed(1)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem,
        selectedCategory === item.name && { 
          backgroundColor: colors.primary || '#E63946',
          transform: [{ scale: 1.05 }]
        }
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={[
        styles.categoryIcon, 
        { backgroundColor: selectedCategory === item.name ? '#fff' : item.color }
      ]}>
        <Feather 
          name={item.icon as any} 
          size={24} 
          color={selectedCategory === item.name ? item.color : '#fff'} 
        />
      </View>
      <Text style={[
        styles.categoryName, 
        { color: selectedCategory === item.name ? '#fff' : colors.text }
      ]} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: colors.background }, 
        isWeb && styles.webContainer
      ]} 
      edges={['top', 'left', 'right', 'bottom']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          {isGuestMode && (
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.card }]}
              onPress={() => {
                if (isGuestMode) {
                  (navigation as any).navigate('Auth');
                }
              }}
            >
              <Feather name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
          <View style={isGuestMode ? styles.headerTitleContainer : undefined}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {isGuestMode ? 'Browse Adera Shop' : 'Adera Shop'}
            </Text>
            <Text style={[
              styles.headerSubtitleGuest, 
              { 
                color: isGuestMode ? colors.primary : colors.textSecondary,
                fontWeight: isGuestMode ? '600' : 'normal',
                fontSize: isGuestMode ? 15 : 14
              }
            ]}>
              {isGuestMode ? '👋 Sign in for full access & exclusive deals!' : 'Discover amazing products'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            onPress={handleSearchPress}
          >
            <Feather name="search" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            onPress={handleWishlistPress}
          >
            <View style={styles.iconContainer}>
              <Feather name="heart" size={20} color={colors.text} />
              {!isGuestMode && wishlistState.items.length > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary || '#E63946' }]}>
                  <Text style={styles.badgeText}>
                    {wishlistState.items.length > 99 ? '99+' : wishlistState.items.length}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            onPress={handleOrderHistoryPress}
          >
            <View style={styles.iconContainer}>
              <Feather name="package" size={20} color={colors.text} />
              {!isGuestMode && (
                <View style={[styles.badge, { backgroundColor: colors.primary || '#E63946' }]}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            onPress={handleCartPress}
          >
            <View style={styles.cartContainer}>
              <Feather name="shopping-cart" size={20} color={colors.text} />
              {!isGuestMode && cartState.totalItems > 0 && (
                <View style={[styles.cartBadge, { backgroundColor: colors.primary || '#E63946' }]}>
                  <Text style={styles.cartBadgeText}>
                    {cartState.totalItems > 99 ? '99+' : cartState.totalItems}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Wallet Balance */}
      <View style={[styles.walletContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.walletInfo}>
          <Text style={[styles.walletLabel, { color: colors.text }]}>Wallet Balance</Text>
          <Text style={[styles.walletAmount, { color: isGuestMode ? colors.textSecondary : (colors.primary || '#E63946') }]}>
            {isGuestMode ? 'N/A' : `ETB ${formatPrice(walletBalance)}`}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.walletButton, { 
            backgroundColor: isGuestMode ? colors.textSecondary : (colors.primary || '#E63946'),
            opacity: isGuestMode ? 0.6 : 1
          }]}
          disabled={isGuestMode}
          onPress={() => {
            if (isGuestMode) {
              (navigation as any).navigate('AuthPrompt');
            }
          }}
        >
          <Feather name={isGuestMode ? "lock" : "plus"} size={16} color="#fff" />
          <Text style={styles.walletButtonText}>{isGuestMode ? 'Sign In' : 'Add Money'}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <SearchBar
          onSearch={handleSearch}
          onClear={handleSearchClear}
          placeholder="Search products..."
        />
      )}

      {isWeb ? (
        <ScrollView 
          style={[styles.content, styles.webScrollView]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.webScrollContent}
        >
          {/* Banner Carousel */}
          <BannerCarousel onBannerPress={(banner) => {
            console.log('Banner pressed:', banner.title);
          }} />
          
          {/* Shops Carousel */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Shops</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.primary || '#E63946' }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopsContainer}>
              {loadingShops ? (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: colors.border }]}>Loading shops...</Text>
                </View>
              ) : (
                shops.map((shop) => (
                  <View key={shop.id} style={styles.shopItem}>
                    <View style={styles.shopImageContainer}>
                      {shop.logo_url ? (
                        <Image 
                          source={{ uri: shop.logo_url }} 
                          style={styles.shopImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.shopLogoPlaceholder, { backgroundColor: shop.primary_color }]}>
                          <Text style={styles.shopLogoText}>
                            {shop.shop_name.split(' ').map(word => word.charAt(0)).join('').toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.shopName, { color: colors.text }]} numberOfLines={1}>
                      {shop.shop_name}
                    </Text>
                    <View style={styles.shopRating}>
                      <Feather name="star" size={12} color="#FFD700" />
                      <Text style={[styles.ratingText, { color: colors.text }]}>
                        {shop.rating.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.primary || '#E63946' }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categoriesGrid}>
              {loadingCategories ? (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: colors.border }]}>Loading categories...</Text>
                </View>
              ) : (
                categories.map((category) => (
                  <TouchableOpacity 
                    key={category.id} 
                    style={[
                      styles.categoryItem,
                      selectedCategory === category.name && { 
                        backgroundColor: colors.primary || '#E63946',
                        transform: [{ scale: 1.05 }]
                      }
                    ]}
                    onPress={() => handleCategoryPress(category)}
                  >
                    <View style={[
                      styles.categoryIcon, 
                      { backgroundColor: selectedCategory === category.name ? '#fff' : category.color }
                    ]}>
                      <Feather 
                        name={category.icon as any} 
                        size={24} 
                        color={selectedCategory === category.name ? category.color : '#fff'} 
                      />
                    </View>
                    <Text style={[
                      styles.categoryName, 
                      { color: selectedCategory === category.name ? '#fff' : colors.text }
                    ]} numberOfLines={1}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>

          {/* Price Range Filter */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Range</Text>
            <PriceRangeSlider
              minPrice={0}
              maxPrice={200000}
              initialMin={priceRange.min}
              initialMax={priceRange.max}
              onRangeChange={(min, max) => setPriceRange({ min, max })}
            />
          </View>

          {/* Products For You */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Products For You
                {selectedCategory && ` - ${selectedCategory}`}
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.primary || '#E63946' }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <ProductListGrid
              products={products}
              loading={loading}
              error={error}
              onProductPress={handleProductPress}
              onAddToCart={handleAddToCart}
            />
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={[{ key: 'content' }]}
          renderItem={() => (
            <>
              {/* Banner Carousel */}
              <BannerCarousel onBannerPress={(banner) => {
                console.log('Banner pressed:', banner.title);
              }} />
              
              {/* Shops Carousel */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Shops</Text>
                  <TouchableOpacity>
                    <Text style={[styles.seeAllText, { color: colors.primary || '#E63946' }]}>See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopsContainer}>
                  {loadingShops ? (
                    <View style={styles.loadingContainer}>
                      <Text style={[styles.loadingText, { color: colors.border }]}>Loading shops...</Text>
                    </View>
                  ) : (
                    shops.map((shop) => (
                      <View key={shop.id} style={styles.shopItem}>
                        <View style={styles.shopImageContainer}>
                          {shop.logo_url ? (
                            <Image 
                              source={{ uri: shop.logo_url }} 
                              style={styles.shopImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={[styles.shopLogoPlaceholder, { backgroundColor: shop.primary_color }]}>
                              <Text style={styles.shopLogoText}>
                                {shop.shop_name.split(' ').map(word => word.charAt(0)).join('').toUpperCase()}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.shopName, { color: colors.text }]} numberOfLines={1}>
                          {shop.shop_name}
                        </Text>
                        <View style={styles.shopRating}>
                          <Feather name="star" size={12} color="#FFD700" />
                          <Text style={[styles.ratingText, { color: colors.text }]}>
                            {shop.rating.toFixed(1)}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>

              {/* Categories */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
                  <TouchableOpacity>
                    <Text style={[styles.seeAllText, { color: colors.primary || '#E63946' }]}>See All</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.categoriesGrid}>
                  {loadingCategories ? (
                    <View style={styles.loadingContainer}>
                      <Text style={[styles.loadingText, { color: colors.border }]}>Loading categories...</Text>
                    </View>
                  ) : (
                    categories.map((category) => (
                      <TouchableOpacity 
                        key={category.id} 
                        style={[
                          styles.categoryItem,
                          selectedCategory === category.name && { 
                            backgroundColor: colors.primary || '#E63946',
                            transform: [{ scale: 1.05 }]
                          }
                        ]}
                        onPress={() => handleCategoryPress(category)}
                      >
                        <View style={[
                          styles.categoryIcon, 
                          { backgroundColor: selectedCategory === category.name ? '#fff' : category.color }
                        ]}>
                          <Feather 
                            name={category.icon as any} 
                            size={24} 
                            color={selectedCategory === category.name ? category.color : '#fff'} 
                          />
                        </View>
                        <Text style={[
                          styles.categoryName, 
                          { color: selectedCategory === category.name ? '#fff' : colors.text }
                        ]} numberOfLines={1}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>

              {/* Price Range Filter */}
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Range</Text>
                <PriceRangeSlider
                  minPrice={0}
                  maxPrice={200000}
                  initialMin={priceRange.min}
                  initialMax={priceRange.max}
                  onRangeChange={(min, max) => setPriceRange({ min, max })}
                />
              </View>

              {/* Products For You */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Products For You
                    {selectedCategory && ` - ${selectedCategory}`}
                  </Text>
                  <TouchableOpacity>
                    <Text style={[styles.seeAllText, { color: colors.primary || '#E63946' }]}>See All</Text>
                  </TouchableOpacity>
                </View>
                <ProductListGrid
                  products={products}
                  loading={loading}
                  error={error}
                  onProductPress={handleProductPress}
                  onAddToCart={handleAddToCart}
                />
              </View>
            </>
          )}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          style={styles.content}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    minHeight: isWeb ? '100vh' as any : undefined,
    overflow: 'hidden' as any,
    position: 'relative' as any,
    display: isWeb ? 'flex' as any : undefined,
    flexDirection: 'column' as any,
  },
  webScrollView: {
    flex: 1,
    overflow: isWeb ? 'auto' as any : 'scroll',
    height: isWeb ? '100%' as any : undefined,
    maxHeight: isWeb ? '100vh' as any : undefined,
  },
  webScrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerSubtitleGuest: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 18,
  },
  headerSubtitleGuestHighlight: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cartContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  walletAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  walletButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  shopsContainer: {
    paddingHorizontal: 16,
  },
  shopItem: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  shopImageContainer: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  shopImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  shopLogoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopLogoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  shopName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  shopRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  categoryItem: {
    width: (width - 64) / 3,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
});
