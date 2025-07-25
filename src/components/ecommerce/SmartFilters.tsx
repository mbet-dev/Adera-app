import React from 'react';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../contexts/ThemeContext';

const FilterContainer = styled.View`
  margin: 0 16px 16px 16px;
`;

const FilterChip = styled.TouchableOpacity<{ selected: boolean; theme: any }>`
  padding: 8px 16px;
  background-color: ${(props: { selected: boolean; theme: any }) => 
    props.selected ? '#E63946' : (props.theme.colors.mode === 'dark' ? '#333' : '#eee')};
  border-radius: 20px;
  margin-right: 12px;
  border-width: 1px;
  border-color: ${(props: { selected: boolean; theme: any }) => 
    props.selected ? '#E63946' : (props.theme.colors.mode === 'dark' ? '#555' : '#ddd')};
`;

const FilterText = styled.Text<{ selected: boolean; theme: any }>`
  font-size: 14px;
  font-weight: ${(props: { selected: boolean }) => props.selected ? 'bold' : '600'};
  color: ${(props: { selected: boolean; theme: any }) => 
    props.selected ? '#fff' : 
    (props.theme.colors.mode === 'dark' ? '#ffffff' : '#333333')};
`;

const PriceRangeContainer = styled.View`
  margin-top: 12px;
`;

const PriceLabelRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const PriceLabel = styled.Text<{ theme: any }>`
  color: ${(props: { theme: any }) => props.theme.colors.text};
  font-weight: 600;
  font-size: 14px;
`;

interface SmartFiltersProps {
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  minPrice: number;
  maxPrice: number;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  minAllowed?: number;
  maxAllowed?: number;
}

export default function SmartFilters({ 
  selectedFilter, 
  onSelectFilter, 
  minPrice, 
  maxPrice, 
  onMinPriceChange, 
  onMaxPriceChange, 
  minAllowed = 0, 
  maxAllowed = 200000 
}: SmartFiltersProps) {
  const { colors } = useTheme();
  const filters = ['All', 'Featured', 'On Sale', 'Top Rated'];

  // Format price with comma separators
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-ET');
  };

  return (
    <FilterContainer>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filters.map((filter, idx) => (
          <FilterChip
            key={idx}
            selected={selectedFilter === filter}
            onPress={() => onSelectFilter(filter)}
            theme={{ colors }}
          >
            <FilterText selected={selectedFilter === filter} theme={{ colors }}>{filter}</FilterText>
          </FilterChip>
        ))}
      </ScrollView>
      <PriceRangeContainer>
        <PriceLabelRow>
          <PriceLabel theme={{ colors }}>Min: ETB {formatPrice(minPrice)}</PriceLabel>
          <PriceLabel theme={{ colors }}>Max: ETB {formatPrice(maxPrice)}</PriceLabel>
        </PriceLabelRow>
        <Slider
          minimumValue={minAllowed}
          maximumValue={maxAllowed}
          value={minPrice}
          onValueChange={onMinPriceChange}
          step={1000}
          minimumTrackTintColor="#E63946"
          maximumTrackTintColor="#ccc"
          style={{ width: '100%', height: 32 }}
        />
        <Slider
          minimumValue={minAllowed}
          maximumValue={maxAllowed}
          value={maxPrice}
          onValueChange={onMaxPriceChange}
          step={1000}
          minimumTrackTintColor="#E63946"
          maximumTrackTintColor="#ccc"
          style={{ width: '100%', height: 32, marginTop: 4 }}
        />
      </PriceRangeContainer>
    </FilterContainer>
  );
} 