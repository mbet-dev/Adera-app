import React, { useState } from 'react';
import { ScrollView } from 'react-native';
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

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

const SectionTitle = styled.Text`
  font-size: 22px;
  font-weight: 700;
  margin: 20px 16px 10px;
  color: ${(props) => props.theme.colors.text};
`;

const SecondaryActionsContainer = styled.View`
  flex-direction: row;
  padding: 16px;
  gap: 16px;
  border-top-width: 1px;
  border-top-color: ${(props) => props.theme.colors.border};
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
  const [maxPrice, setMaxPrice] = useState(10000);

  // Ensure minPrice does not exceed maxPrice and vice versa
  const handleMinPriceChange = (value: number) => {
    setMinPrice(Math.min(value, maxPrice));
  };
  const handleMaxPriceChange = (value: number) => {
    setMaxPrice(Math.max(value, minPrice));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }} edges={['top', 'left', 'right']}>
        <Container theme={{ colors }}>
            <HomeHeader />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <ProductSearchBar value={search} onChange={setSearch} onFilterClick={() => {}} />
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
                  maxAllowed={10000}
                />
                <PersonalizedRecommendations />
                <SectionTitle theme={{ colors }}>Products For You</SectionTitle>
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