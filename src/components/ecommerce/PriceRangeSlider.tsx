import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');
const SLIDER_WIDTH = screenWidth - 40; // Account for padding
const THUMB_SIZE = 36; // Increased for better touch target
const TRACK_HEIGHT = 10; // Increased for better visibility
const MIN_DISTANCE = 20; // Minimum distance between thumbs

interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  onRangeChange: (min: number, max: number) => void;
  initialMin?: number;
  initialMax?: number;
}

export default function PriceRangeSlider({
  minPrice,
  maxPrice,
  onRangeChange,
  initialMin = minPrice,
  initialMax = maxPrice,
}: PriceRangeSliderProps) {
  const { colors } = useTheme();
  
  const [leftThumbPosition] = useState(new Animated.Value(0));
  const [rightThumbPosition] = useState(new Animated.Value(SLIDER_WIDTH - THUMB_SIZE));
  const [leftValue, setLeftValue] = useState(initialMin);
  const [rightValue, setRightValue] = useState(initialMax);
  const [isDragging, setIsDragging] = useState(false);

  // Animation values for visual feedback
  const leftThumbScale = useRef(new Animated.Value(1)).current;
  const rightThumbScale = useRef(new Animated.Value(1)).current;
  const activeTrackWidthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initialize thumb positions based on initial values
    const leftPos = ((initialMin - minPrice) / (maxPrice - minPrice)) * (SLIDER_WIDTH - THUMB_SIZE);
    const rightPos = ((initialMax - minPrice) / (maxPrice - minPrice)) * (SLIDER_WIDTH - THUMB_SIZE);
    
    leftThumbPosition.setValue(leftPos);
    rightThumbPosition.setValue(rightPos);
    activeTrackWidthAnim.setValue(rightPos - leftPos);
  }, [minPrice, maxPrice, initialMin, initialMax]);

  const updateValues = (leftPos: number, rightPos: number) => {
    const leftVal = minPrice + (leftPos / (SLIDER_WIDTH - THUMB_SIZE)) * (maxPrice - minPrice);
    const rightVal = minPrice + (rightPos / (SLIDER_WIDTH - THUMB_SIZE)) * (maxPrice - minPrice);
    
    setLeftValue(Math.round(leftVal));
    setRightValue(Math.round(rightVal));
    onRangeChange(Math.round(leftVal), Math.round(rightVal));
  };

  const createPanResponder = (thumb: 'left' | 'right') => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        // Scale animation for feedback
        Animated.parallel([
          Animated.spring(thumb === 'left' ? leftThumbScale : rightThumbScale, {
            toValue: 1.2,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]).start();
      },
      onPanResponderMove: (_, gestureState) => {
        const currentPosition = thumb === 'left' ? leftThumbPosition : rightThumbPosition;
        const otherPosition = thumb === 'left' ? rightThumbPosition : leftThumbPosition;
        
        let newPosition = (currentPosition as any)._value + gestureState.dx;
        
        // Constrain to slider bounds
        newPosition = Math.max(0, Math.min(SLIDER_WIDTH - THUMB_SIZE, newPosition));
        
        // Prevent thumbs from crossing
        if (thumb === 'left') {
          newPosition = Math.min(newPosition, (otherPosition as any)._value - MIN_DISTANCE);
        } else {
          newPosition = Math.max(newPosition, (otherPosition as any)._value + MIN_DISTANCE);
        }
        
        currentPosition.setValue(newPosition);
        
        // Update active track width
        const leftPos = thumb === 'left' ? newPosition : (leftThumbPosition as any)._value;
        const rightPos = thumb === 'right' ? newPosition : (rightThumbPosition as any)._value;
        activeTrackWidthAnim.setValue(rightPos - leftPos);
        
        updateValues(leftPos, rightPos);
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
        // Reset scale animation
        Animated.parallel([
          Animated.spring(thumb === 'left' ? leftThumbScale : rightThumbScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]).start();
      },
    });
  };

  const leftPanResponder = createPanResponder('left');
  const rightPanResponder = createPanResponder('right');

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-ET');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="filter" size={20} color={colors.text} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Price Range
          </Text>
        </View>
        <View style={styles.priceDisplay}>
          <Text style={[styles.priceText, { color: colors.primary }]}>
            ETB {formatPrice(leftValue)} - ETB {formatPrice(rightValue)}
          </Text>
        </View>
      </View>

      {/* Slider Container */}
      <View style={styles.sliderContainer}>
        {/* Track */}
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          {/* Active Track */}
          <Animated.View
            style={[
              styles.activeTrack,
              {
                backgroundColor: colors.primary || '#E63946',
                transform: [
                  { translateX: leftThumbPosition },
                  { scaleX: activeTrackWidthAnim.interpolate({
                    inputRange: [0, SLIDER_WIDTH - THUMB_SIZE],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }) }
                ],
              },
            ]}
          />
        </View>

        {/* Left Thumb */}
        <Animated.View
          {...leftPanResponder.panHandlers}
          style={[
            styles.thumb,
            {
              backgroundColor: colors.primary || '#E63946',
              transform: [
                { translateX: leftThumbPosition },
                { scale: leftThumbScale },
              ],
            },
          ]}
        >
          <View style={styles.thumbInner}>
            <Feather name="minus" size={16} color="white" />
          </View>
        </Animated.View>

        {/* Right Thumb */}
        <Animated.View
          {...rightPanResponder.panHandlers}
          style={[
            styles.thumb,
            {
              backgroundColor: colors.primary || '#E63946',
              transform: [
                { translateX: rightThumbPosition },
                { scale: rightThumbScale },
              ],
            },
          ]}
        >
          <View style={styles.thumbInner}>
            <Feather name="plus" size={16} color="white" />
          </View>
        </Animated.View>
      </View>

      {/* Price Labels */}
      <View style={styles.priceLabels}>
        <Text style={[styles.priceLabel, { color: colors.text }]}>
          ETB {formatPrice(minPrice)}
        </Text>
        <Text style={[styles.priceLabel, { color: colors.text }]}>
          ETB {formatPrice(maxPrice)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceDisplay: {
    backgroundColor: 'rgba(230, 57, 70, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sliderContainer: {
    position: 'relative',
    height: THUMB_SIZE,
    justifyContent: 'center',
    marginBottom: 12,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'relative',
  },
  activeTrack: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
    width: SLIDER_WIDTH - THUMB_SIZE,
    transformOrigin: 'left center',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      },
      default: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
    }),
  },
  thumbInner: {
    width: THUMB_SIZE - 8,
    height: THUMB_SIZE - 8,
    borderRadius: (THUMB_SIZE - 8) / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 