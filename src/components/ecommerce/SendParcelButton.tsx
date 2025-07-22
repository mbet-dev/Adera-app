import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../types/navigation';

const Button = styled.TouchableOpacity`
  flex: 1;
  background-color: #f0f0f0;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  margin: 0 6px;
`;

const ButtonText = styled.Text`
  font-weight: 500;
`;

type HomeScreenNavigationProp = StackNavigationProp<CustomerStackParamList, 'Home'>;

export default function SendParcelButton() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <Button onPress={() => navigation.navigate('CreateDelivery')}>
      <ButtonText>Send Parcel</ButtonText>
    </Button>
  );
} 