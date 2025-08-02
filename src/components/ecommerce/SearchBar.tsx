import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ShopItem } from '../../types';
import { getWebShadow } from '../../utils/platform';

const { width } = Dimensions.get('window');

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  showSuggestions?: boolean;
  suggestions?: ShopItem[];
  onSuggestionPress?: (item: ShopItem) => void;
}

export default function SearchBar({
  onSearch,
  onClear,
  placeholder = "Search products...",
  showSuggestions = false,
  suggestions = [],
  onSuggestionPress
}: SearchBarProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showClearButton, setShowClearButton] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, animatedValue]);

  const handleTextChange = (text: string) => {
    setQuery(text);
    setShowClearButton(text.length > 0);
    onSearch(text);
  };

  const handleClear = () => {
    setQuery('');
    setShowClearButton(false);
    onClear();
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleSuggestionPress = (item: ShopItem) => {
    if (onSuggestionPress) {
      onSuggestionPress(item);
    }
    setQuery(item.name);
    setShowClearButton(true);
  };

  const renderSuggestion = ({ item }: { item: ShopItem }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
      onPress={() => handleSuggestionPress(item)}
    >
      <View style={styles.suggestionImage}>
        {item.image_urls && item.image_urls.length > 0 ? (
          <Text style={[styles.suggestionImageText, { color: colors.primary || '#E63946' }]}>
            📦
          </Text>
        ) : (
          <View style={[styles.suggestionImagePlaceholder, { backgroundColor: colors.border }]}>
            <Feather name="package" size={16} color={colors.text} />
          </View>
        )}
      </View>
      <View style={styles.suggestionContent}>
        <Text style={[styles.suggestionTitle, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.suggestionPrice, { color: colors.primary || '#E63946' }]}>
          ETB {item.price.toLocaleString('en-ET')}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.border} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.searchContainer,
          { 
            backgroundColor: colors.card,
            borderColor: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.border, colors.primary || '#E63946']
            }),
            boxShadow: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['none', '0px 2px 4px rgba(0, 0, 0, 0.1)']
            })
          }
        ]}
      >
        <Feather 
          name="search" 
          size={20} 
          color={isFocused ? colors.primary || '#E63946' : colors.border} 
          style={styles.searchIcon}
        />
        
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.border}
          value={query}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {showClearButton && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={16} color={colors.border} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: colors.card }]}>
          <FlatList
            data={suggestions.slice(0, 5)} // Limit to 5 suggestions
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    ...getWebShadow(0.1, 4, 2),
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 300,
    ...getWebShadow(0.15, 8, 4),
    elevation: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionImageText: {
    fontSize: 16,
  },
  suggestionImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 