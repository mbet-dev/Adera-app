import React from 'react';
import styled from 'styled-components/native';
import CartButton from './CartButton';
import WishlistButton from './WishlistButton';
import OrderHistoryButton from './OrderHistoryButton';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemedProps {
  theme: {
    colors: {
      card: string;
      text: string;
    };
  };
}

interface HomeHeaderProps {
  cartBadgeCount?: number;
  wishlistBadgeCount?: number;
}

const HeaderContainer = styled.View<ThemedProps>`
  padding: 16px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props: ThemedProps) => props.theme.colors.card};
`;

const Title = styled.Text<ThemedProps>`
  font-size: 24px;
  font-weight: bold;
  color: ${(props: ThemedProps) => props.theme.colors.text};
`;

const IconContainer = styled.View`
  flex-direction: row;
  gap: 20px;
`;

export default function HomeHeader({ cartBadgeCount = 0, wishlistBadgeCount = 0 }: HomeHeaderProps) {
  const { colors } = useTheme();

  return (
    <HeaderContainer theme={{ colors }}>
      <Title theme={{ colors }}>Discover</Title>
      <IconContainer>
        <CartButton badgeCount={cartBadgeCount} />
        <WishlistButton badgeCount={wishlistBadgeCount} />
        <OrderHistoryButton />
      </IconContainer>
    </HeaderContainer>
  );
} 