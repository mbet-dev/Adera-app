import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { useCategories } from '../../hooks/useCategories';
import { useTheme } from '../../contexts/ThemeContext';

interface CategoryCardProps {
  isSelected: boolean;
}

interface CategoryIconProps {
  isSelected: boolean;
  theme: any; // Simplified for brevity
}

const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin: 16px;
  gap: 16px;
`;

const CategoryCard = styled.TouchableOpacity<CategoryCardProps>`
  width: 22%;
  margin-bottom: 12px;
  align-items: center;
  opacity: ${(props: CategoryCardProps) => (props.isSelected ? 1 : 0.7)};
`;

const CategoryIcon = styled.View<CategoryIconProps>`
  width: 60px;
  height: 60px;
  background-color: ${(props: CategoryIconProps) => (props.isSelected ? props.theme.colors.primary : '#eee')};
  border-radius: 30px;
  margin-bottom: 6px;
  justify-content: center;
  align-items: center;
`;

const CategoryName = styled.Text<{ theme: any }>`
  font-size: 12px;
  text-align: center;
  color: ${(props: { theme: any }) => props.theme.colors.text};
`;

export default function CategoryGrid({ onSelectCategory }: { onSelectCategory: (categoryId?: string) => void }) {
  const { categories, loading, error } = useCategories();
  const { colors } = useTheme();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const handleSelect = (categoryId?: string) => {
    setSelectedId(categoryId);
    onSelectCategory(categoryId);
  };

  if (loading) {
    return <ActivityIndicator style={{ marginVertical: 16 }} />;
  }

  if (error) {
    return <Text style={{ textAlign: 'center', marginVertical: 16 }}>Error loading categories</Text>;
  }

  const getIconName = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('cloth') || name.includes('fashion') || name.includes('apparel')) return 'shopping-bag';
    if (name.includes('book')) return 'book';
    if (name.includes('pharma') || name.includes('medicine') || name.includes('drug')) return 'activity'; // No direct pharmacy icon, 'activity' for health
    if (name.includes('electronic') || name.includes('laptop') || name.includes('computer') || name.includes('phone')) return 'monitor';
    if (name.includes('shoe') || name.includes('footwear')) return 'trending-up'; // No direct shoe icon, 'trending-up' as a stylized shoe
    if (name.includes('grocery') || name.includes('food') || name.includes('market')) return 'shopping-cart';
    if (name.includes('beauty') || name.includes('cosmetic')) return 'feather';
    if (name.includes('home') || name.includes('furniture')) return 'home';
    if (name.includes('toy')) return 'smile';
    if (name.includes('pet')) return 'heart';
    if (name.includes('misc') || name.includes('other')) return 'package';
    return 'grid'; // Default icon
  };

  return (
    <Grid>
      {/* "All" category button */}
      <CategoryCard isSelected={selectedId === undefined} onPress={() => handleSelect(undefined)}>
        <CategoryIcon theme={{ colors }} isSelected={selectedId === undefined}>
          <Feather name="grid" size={24} color={selectedId === undefined ? '#fff' : '#555'} />
        </CategoryIcon>
        <CategoryName theme={{ colors }}>All</CategoryName>
      </CategoryCard>

      {categories.map((cat) => {
        const isSelected = selectedId === cat.id;
        return (
            <CategoryCard key={cat.id} isSelected={isSelected} onPress={() => handleSelect(cat.id)}>
            <CategoryIcon theme={{ colors }} isSelected={isSelected}>
                <Feather name={getIconName(cat.name) as any} size={24} color={isSelected ? '#fff' : '#555'} />
            </CategoryIcon>
            <CategoryName theme={{ colors }}>{cat.name}</CategoryName>
            </CategoryCard>
        );
    })}
    </Grid>
  );
} 