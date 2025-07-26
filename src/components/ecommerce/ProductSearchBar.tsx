import React, { forwardRef } from 'react';
import styled from 'styled-components/native';
import { TextInput, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const SearchContainer = styled.View`
  margin-top: 16px;
  flex-direction: row;
  align-items: center;
`;

const InputWrapper = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
  border-width: 1px;
  border-color: #ccc;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  background-color: transparent;
  padding: 10px 12px 10px 36px;
  font-size: 16px;
`;

const IconWrapper = styled.View`
  position: absolute;
  left: 10px;
  z-index: 1;
`;

const FilterButton = styled.TouchableOpacity`
  margin-left: 12px;
  padding: 10px;
  background-color: #E63946;
  border-radius: 8px;
`;

interface ProductSearchBarProps {
  value: string;
  onChange: (text: string) => void;
  onFilterClick?: () => void;
  onSubmitEditing?: () => void;
  inputRef?: any;
}

const ProductSearchBar = forwardRef<TextInput, ProductSearchBarProps>(
  ({ value, onChange, onFilterClick, onSubmitEditing, inputRef }, ref) => {
    const { colors, isDark } = useTheme();
    return (
      <SearchContainer>
        <InputWrapper style={{ backgroundColor: isDark ? colors.card : '#fff', borderColor: isDark ? colors.border : '#ccc' }}>
          <IconWrapper>
            <Feather name="search" size={20} color={isDark ? colors.text : '#888'} />
          </IconWrapper>
          <SearchInput
            ref={inputRef}
            placeholder="Search products..."
            placeholderTextColor={isDark ? colors.border : '#888'}
            value={value}
            onChangeText={onChange}
            returnKeyType="search"
            onSubmitEditing={onSubmitEditing}
            style={{ color: colors.text }}
          />
        </InputWrapper>
        <FilterButton onPress={onFilterClick}>
          <Feather name="sliders" size={20} color="#fff" />
        </FilterButton>
      </SearchContainer>
    );
  }
);

export default ProductSearchBar; 