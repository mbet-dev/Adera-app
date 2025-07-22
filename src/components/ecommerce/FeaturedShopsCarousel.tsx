import React from 'react';
import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../types/navigation';
import { useFeaturedShops } from '../../hooks/useFeaturedShops';

const CarouselContainer = styled.View`
  height: 160px;
  margin: 16px 0;
  padding-left: 16px;
`;

const ShopCard = styled.TouchableOpacity`
  margin-right: 16px;
  align-items: center;
`;

const ShopImage = styled.Image`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background-color: #eee;
`;

const ShopName = styled.Text`
  text-align: center;
  margin-top: 4px;
  font-weight: 500;
`;

type HomeScreenNavigationProp = StackNavigationProp<CustomerStackParamList, 'Home'>;

export default function FeaturedShopsCarousel() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { shops, loading, error } = useFeaturedShops();

  if (loading) {
    return (
      <View style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error loading shops</Text>
      </View>
    );
  }

  return (
    <CarouselContainer>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {shops.map((shop) => (
          <ShopCard key={shop.id} onPress={() => navigation.navigate('ShopDetail', { shopId: shop.id })}>
            <ShopImage source={{ uri: shop.logo_url || 'https://via.placeholder.com/120x120?text=Shop' }} />
            <ShopName>{shop.shop_name}</ShopName>
          </ShopCard>
        ))}
      </ScrollView>
    </CarouselContainer>
  );
} 