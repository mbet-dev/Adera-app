import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../types/navigation';
import { useTheme } from '../../contexts/ThemeContext';

const ButtonContainer = styled.TouchableOpacity`
  position: relative;
`;

const Badge = styled.View`
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #E63946;
  border-radius: 12px;
  width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
`;

const BadgeText = styled.Text`
  color: #fff;
  font-size: 12px;
  font-weight: bold;
`;

type HomeScreenNavigationProp = StackNavigationProp<CustomerStackParamList, 'Home'>;

export default function CartButton() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors } = useTheme();
  // TODO: Fetch cart item count
  const itemCount = 3; 

  return (
    <ButtonContainer onPress={() => navigation.navigate('Cart')}>
      <Feather name="shopping-cart" size={24} color={colors.text} />
      {itemCount > 0 && (
        <Badge>
          <BadgeText>{itemCount}</BadgeText>
        </Badge>
      )}
    </ButtonContainer>
  );
} 