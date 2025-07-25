import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../types/navigation';
import { useProducts } from '../../hooks/useProducts';

const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 16px;
`;

const ProductCardContainer = styled.TouchableOpacity`
  width: 48%;
  margin-bottom: 16px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const ProductImage = styled.Image`
  width: 100%;
  height: 120px;
`;

const ProductInfo = styled.View`
  padding: 8px;
`;

const ProductName = styled.Text`
  font-weight: bold;
  font-size: 14px;
  color: #333;
`;

const ProductPrice = styled.Text`
  color: #E63946;
  font-weight: bold;
  margin-top: 4px;
  font-size: 16px;
`;

const ProductRating = styled.Text`
  color: #666;
  font-size: 12px;
  margin-top: 2px;
`;

const AddToCartButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: #E63946;
  padding: 6px;
  border-radius: 16px;
`;

const EmptyState = styled.View`
  padding: 40px 20px;
  align-items: center;
`;

const EmptyText = styled.Text`
  color: #666;
  font-size: 16px;
  text-align: center;
  margin-top: 8px;
`;

type HomeScreenNavigationProp = StackNavigationProp<CustomerStackParamList, 'Home'>;

interface ProductListGridProps {
  categoryId?: string;
  search?: string;
  filter?: string;
  minPrice?: number;
  maxPrice?: number;
}

export default function ProductListGrid({ categoryId, search, filter, minPrice, maxPrice }: ProductListGridProps) {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { products, loading, error } = useProducts(categoryId, search, filter, minPrice, maxPrice);

  // Format price with comma separators
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-ET');
  };

  // Format rating display
  const formatRating = (rating: number) => {
    return `${rating.toFixed(1)} ★`;
  };

  if (loading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E63946" />
        <Text style={{ marginTop: 8, color: '#666' }}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <EmptyState>
        <Feather name="alert-circle" size={48} color="#666" />
        <EmptyText>Error loading products</EmptyText>
        <EmptyText>{error}</EmptyText>
      </EmptyState>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState>
        <Feather name="package" size={48} color="#666" />
        <EmptyText>No products found</EmptyText>
        <EmptyText>Try adjusting your filters or search terms</EmptyText>
      </EmptyState>
    );
  }

  return (
    <Grid>
      {products.map((item) => (
        <ProductCardContainer 
          key={item.id} 
          onPress={() => navigation.navigate('ProductDetail', { itemId: item.id })}
        >
          <ProductImage 
            source={{ 
              uri: item.image_urls?.[0] || 'https://via.placeholder.com/160x120?text=Product' 
            }} 
            resizeMode="cover"
          />
          <ProductInfo>
            <ProductName numberOfLines={2}>{item.name}</ProductName>
            <ProductPrice>ETB {formatPrice(item.price)}</ProductPrice>
            {item.rating > 0 && (
              <ProductRating>{formatRating(item.rating)}</ProductRating>
            )}
          </ProductInfo>
          <AddToCartButton>
            <Feather name="plus" size={18} color="#fff" />
          </AddToCartButton>
        </ProductCardContainer>
      ))}
    </Grid>
  );
} 