import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../types/navigation';
import { useTheme } from '../../contexts/ThemeContext';
import styled from 'styled-components/native';

interface ThemedProps {
  theme: {
    colors: {
      text: string;
      primary?: string;
    };
  };
}

interface WishlistButtonProps {
  badgeCount?: number;
}

const Badge = styled.View<{ theme: { colors: { primary?: string } } }>`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: ${(props: { theme: { colors: { primary?: string } } }) => props.theme.colors.primary || '#E63946'};
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
`;

const BadgeText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

type HomeScreenNavigationProp = StackNavigationProp<CustomerStackParamList, 'Home'>;

export default function WishlistButton({ badgeCount = 0 }: WishlistButtonProps) {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
      <View style={{ position: 'relative' }}>
        <Feather name="heart" size={24} color={colors.text} />
        {badgeCount > 0 && (
          <Badge theme={{ colors }}>
            <BadgeText>{badgeCount > 99 ? '99+' : badgeCount}</BadgeText>
          </Badge>
        )}
      </View>
    </TouchableOpacity>
  );
} 