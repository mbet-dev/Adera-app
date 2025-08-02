import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 180;

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  backgroundColor: string;
  textColor: string;
  ctaText: string;
}

// Sample banner data with placeholder images
const SAMPLE_BANNERS: BannerItem[] = [
  {
    id: '1',
    title: 'Summer Sale',
    subtitle: 'Up to 70% Off',
    description: 'Discover amazing deals on electronics, fashion, and more',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop',
    backgroundColor: '#FF6B6B',
    textColor: '#FFFFFF',
    ctaText: 'Shop Now',
  },
  {
    id: '2',
    title: 'Tech Week',
    subtitle: 'Latest Gadgets',
    description: 'Get the newest smartphones, laptops, and accessories',
    imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=400&fit=crop',
    backgroundColor: '#4ECDC4',
    textColor: '#FFFFFF',
    ctaText: 'Explore',
  },
  {
    id: '3',
    title: 'Fashion Forward',
    subtitle: 'New Collection',
    description: 'Step into style with our latest fashion trends',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
    backgroundColor: '#45B7D1',
    textColor: '#FFFFFF',
    ctaText: 'Discover',
  },
  {
    id: '4',
    title: 'Home & Garden',
    subtitle: 'Transform Your Space',
    description: 'Beautiful furniture and decor for every room',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop',
    backgroundColor: '#96CEB4',
    textColor: '#2C3E50',
    ctaText: 'Browse',
  },
  {
    id: '5',
    title: 'Free Delivery',
    subtitle: 'On Orders Over 1000 ETB',
    description: 'Fast and reliable delivery across Addis Ababa',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
    backgroundColor: '#FFEAA7',
    textColor: '#2D3436',
    ctaText: 'Learn More',
  },
];

interface BannerCarouselProps {
  onBannerPress?: (banner: BannerItem) => void;
}

export default function BannerCarousel({ onBannerPress }: BannerCarouselProps) {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollViewRef.current) {
        const nextIndex = (activeIndex + 1) % SAMPLE_BANNERS.length;
        scrollViewRef.current.scrollTo({
          x: nextIndex * CARD_WIDTH,
          animated: true,
        });
        setActiveIndex(nextIndex);
      }
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    setActiveIndex(index);
  };

  const handleBannerPress = (banner: BannerItem) => {
    if (onBannerPress) {
      onBannerPress(banner);
    }
  };

  const renderBanner = (banner: BannerItem, index: number) => (
    <TouchableOpacity
      key={banner.id}
      style={[
        styles.bannerCard,
        {
          backgroundColor: banner.backgroundColor,
          width: CARD_WIDTH,
        },
      ]}
      onPress={() => handleBannerPress(banner)}
      activeOpacity={0.9}
    >
      <View style={styles.bannerContent}>
        <View style={styles.textContent}>
          <Text style={[styles.bannerTitle, { color: banner.textColor }]}>
            {banner.title}
          </Text>
          <Text style={[styles.bannerSubtitle, { color: banner.textColor }]}>
            {banner.subtitle}
          </Text>
          <Text style={[styles.bannerDescription, { color: banner.textColor }]}>
            {banner.description}
          </Text>
          <View style={styles.ctaContainer}>
            <Text style={[styles.ctaText, { color: banner.textColor }]}>
              {banner.ctaText}
            </Text>
            <Feather 
              name="arrow-right" 
              size={16} 
              color={banner.textColor} 
              style={styles.ctaIcon}
            />
          </View>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: banner.imageUrl }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
        snapToAlignment="start"
      >
        {SAMPLE_BANNERS.map(renderBanner)}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {SAMPLE_BANNERS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === activeIndex ? colors.primary : colors.border,
                opacity: index === activeIndex ? 1 : 0.5,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  bannerCard: {
    height: CARD_HEIGHT,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  bannerDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 16,
    opacity: 0.9,
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
  },
  ctaIcon: {
    marginLeft: 8,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
