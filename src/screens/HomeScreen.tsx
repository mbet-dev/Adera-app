import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, findNodeHandle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useRole } from '../hooks/useRole';
import FeaturedShopsCarousel from '../components/ecommerce/FeaturedShopsCarousel';
import CategoryGrid from '../components/ecommerce/CategoryGrid';
import ProductSearchBar from '../components/ecommerce/ProductSearchBar';
import PersonalizedRecommendations from '../components/ecommerce/PersonalizedRecommendations';
import ProductListGrid from '../components/ecommerce/ProductListGrid';
import HomeHeader from '../components/ecommerce/HomeHeader';
import SendParcelButton from '../components/ecommerce/SendParcelButton';
import TrackParcelButton from '../components/ecommerce/TrackParcelButton';
import SmartFilters from '../components/ecommerce/SmartFilters';
import { useTheme } from '../contexts/ThemeContext';
import CartButton from '../components/ecommerce/CartButton';
import WishlistButton from '../components/ecommerce/WishlistButton';
import { useCart } from '../hooks/useCart';

interface ThemeType {
  colors: {
    background: string;
    text: string;
    border: string;
  };
}

const Container = styled.View<{ theme: ThemeType }>`
  flex: 1;
  background-color: ${(props: { theme: ThemeType }) => props.theme.colors.background};
`;

const SectionTitle = styled.Text<{ theme: ThemeType }>`
  font-size: 22px;
  font-weight: 700;
  margin: 20px 16px 10px;
  color: ${(props: { theme: ThemeType }) => props.theme.colors.text};
`;

const SecondaryActionsContainer = styled.View<{ theme: ThemeType }>`
  flex-direction: row;
  padding: 16px;
  gap: 16px;
  border-top-width: 1px;
  border-top-color: ${(props: { theme: ThemeType }) => props.theme.colors.border};
`;

const PartnerDashboardLink = () => <SendParcelButton />; // Placeholder
const AdminPanelLink = () => <SendParcelButton />; // Placeholder

export default function HomeScreen() {
  const { role } = useRole();
  const { colors } = useTheme();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);

  const scrollViewRef = useRef<ScrollView>(null);
  const searchInputRef = useRef(null);
  const productsSectionRef = useRef(null);

  const { getCartItemCount } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    // Update badge counts - for now just cart count
    setCartCount(getCartItemCount());
    // TODO: Implement wishlist count when wishlist hook is available
    setWishlistCount(0);
  }, [getCartItemCount]);

  // Ensure minPrice does not exceed maxPrice and vice versa
  const handleMinPriceChange = (value: number) => {
    setMinPrice(Math.min(value, maxPrice));
  };
  const handleMaxPriceChange = (value: number) => {
    setMaxPrice(Math.max(value, minPrice));
  };

  const handleSearchSubmit = () => {
    // Scroll to Products section using a simpler approach
    if (scrollViewRef.current) {
      // Scroll to a position where Products section should be visible
      scrollViewRef.current.scrollTo({ y: 400, animated: true });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }} edges={['top', 'left', 'right']}>
        <Container theme={{ colors }}>
            <HomeHeader cartBadgeCount={cartCount} wishlistBadgeCount={wishlistCount} />
            <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <ProductSearchBar 
                  value={search} 
                  onChange={setSearch} 
                  onFilterClick={() => {}} 
                  onSubmitEditing={handleSearchSubmit}
                  inputRef={searchInputRef}
                />
                <FeaturedShopsCarousel />
                <SectionTitle theme={{ colors }}>Categories</SectionTitle>
                <CategoryGrid onSelectCategory={setSelectedCategoryId} />
                <SmartFilters
                  selectedFilter={filter}
                  onSelectFilter={setFilter}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinPriceChange={handleMinPriceChange}
                  onMaxPriceChange={handleMaxPriceChange}
                  minAllowed={0}
                  maxAllowed={200000}
                />
                <PersonalizedRecommendations />
                <SectionTitle theme={{ colors }} ref={productsSectionRef}>Products For You</SectionTitle>
                <ProductListGrid categoryId={selectedCategoryId} search={search} filter={filter} minPrice={minPrice} maxPrice={maxPrice} />
                <SecondaryActionsContainer theme={{ colors }}>
                    <SendParcelButton />
                    <TrackParcelButton />
                </SecondaryActionsContainer>
                {/* Role-based quick links */}
                {role === 'partner' && <PartnerDashboardLink />}
                {role === 'admin' && <AdminPanelLink />}
            </ScrollView>
        </Container>
    </SafeAreaView>
  );
} 