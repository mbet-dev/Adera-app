import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import styled from 'styled-components/native';

interface ThemedProps {
  theme: {
    colors: {
      card: string;
      border: string;
      text: string;
    };
  };
}

const HeaderContainer = styled.View<ThemedProps>`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  background-color: ${(props: ThemedProps) => props.theme.colors.card};
  border-bottom-width: 1px;
  border-bottom-color: ${(props: ThemedProps) => props.theme.colors.border};
`;

const Title = styled.Text<ThemedProps>`
  font-size: 20px;
  font-weight: bold;
  color: ${(props: ThemedProps) => props.theme.colors.text};
  margin-left: 16px;
`;

export default function AppHeader({ navigation, route, options, back }: any) {
  const { colors } = useTheme();
  const title = options.headerTitle || options.title || route.name;

  return (
    <HeaderContainer theme={{ colors }}>
      {back && (
        <TouchableOpacity onPress={navigation.goBack}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      <Title theme={{ colors }}>{title}</Title>
    </HeaderContainer>
  );
} 