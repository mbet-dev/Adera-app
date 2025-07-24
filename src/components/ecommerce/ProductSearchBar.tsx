import React from 'react';
import styled from 'styled-components/native';
import { TextInput, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const SearchContainer = styled.View`
  margin-top: 16px;
  flex-direction: row;
  align-items: center;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 16px;
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
}

export default function ProductSearchBar({ value, onChange, onFilterClick }: ProductSearchBarProps) {
  return (
    <SearchContainer>
      <SearchInput
        placeholder="Search products..."
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
      />
      <FilterButton onPress={onFilterClick}>
        <Feather name="filter" size={20} color="#fff" />
      </FilterButton>
    </SearchContainer>
  );
} 