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
`;

const ProductPrice = styled.Text`
  color: #E63946;
  font-weight: bold;
  margin-top: 4px;
`;

const AddToCartButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: #E63946;
  padding: 6px;
  border-radius: 16px;
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

  if (loading) {
    return <ActivityIndicator style={{ marginVertical: 16 }} />;
  }

  if (error) {
    return <Text style={{ textAlign: 'center', marginVertical: 16 }}>Error loading products</Text>;
  }

  return (
    <Grid>
      {products.map((item) => (
        <ProductCardContainer key={item.id} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
          <ProductImage source={{ uri: item.image_urls?.[0] || 'https://via.placeholder.com/160x120?text=Product' }} />
          <ProductInfo>
            <ProductName>{item.name}</ProductName>
            <ProductPrice>ETB {item.price}</ProductPrice>
          </ProductInfo>
          <AddToCartButton>
            <Feather name="plus" size={18} color="#fff" />
          </AddToCartButton>
        </ProductCardContainer>
      ))}
    </Grid>
  );
} 