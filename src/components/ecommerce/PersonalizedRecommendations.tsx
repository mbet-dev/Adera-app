import React from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';

const RecommendationsContainer = styled.View`
  margin: 16px;
  padding: 16px;
  background-color: #fff;
  border-radius: 12px;
`;

const Title = styled.Text`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
`;

const PlaceholderText = styled.Text`
  color: #aaa;
`;

export default function PersonalizedRecommendations() {
  // TODO: Integrate AI/ML recommendations
  return (
    <RecommendationsContainer>
      <Title>Recommended for you</Title>
      {/* Map over recommended products */}
      <PlaceholderText>[Personalized recommendations coming soon]</PlaceholderText>
    </RecommendationsContainer>
  );
} 