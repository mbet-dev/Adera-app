import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../types/navigation';
import { useTheme } from '../../contexts/ThemeContext';

type HomeScreenNavigationProp = StackNavigationProp<CustomerStackParamList, 'Home'>;

export default function WishlistButton() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
      <Feather name="heart" size={24} color={colors.text} />
    </TouchableOpacity>
  );
} 