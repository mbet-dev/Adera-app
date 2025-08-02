import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import PriceRangeSlider from './PriceRangeSlider';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface SmartFiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  priceRange: { min: number; max: number };
  onPriceRangeChange: (range: { min: number; max: number }) => void;
}

const filterOptions: FilterOption[] = [
  { id: 'all', label: 'All', value: 'all' },
  { id: 'featured', label: 'Featured', value: 'featured' },
  { id: 'on_sale', label: 'On Sale', value: 'on_sale' },
  { id: 'top_rated', label: 'Top Rated', value: 'top_rated' },
];

export default function SmartFilters({ 
  selectedFilter, 
  onFilterChange, 
  priceRange, 
  onPriceRangeChange 
}: SmartFiltersProps) {
  const { colors } = useTheme();

  const formatPrice = (price: number): string => {
    return price.toLocaleString('en-ET');
  };

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterButtonsContainer}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedFilter === option.value 
                  ? colors.primary || '#E63946' 
                  : colors.card,
                borderColor: selectedFilter === option.value 
                  ? colors.primary || '#E63946' 
                  : colors.border,
              }
            ]}
            onPress={() => onFilterChange(option.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                {
                  color: selectedFilter === option.value 
                    ? '#fff' 
                    : colors.text,
                  fontWeight: '600',
                }
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Price Range Slider */}
      <PriceRangeSlider
        minPrice={0}
        maxPrice={200000}
        currentMin={priceRange.min}
        currentMax={priceRange.max}
        onRangeChange={(min, max) => onPriceRangeChange({ min, max })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  filterButtonsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceRangeContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  priceRangeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 