import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useProductDetail } from '../../hooks/useProductDetail';
import { useBids } from '../../hooks/useBids';
import { useWishlist } from '../../hooks/useWishlist';
import { useProductReviews } from '../../hooks/useProductReviews';

export default function ProductDetailScreen({ route }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  // Assume route.params?.itemId is passed
  const itemId = route?.params?.itemId;
  const userId = user?.id;
  const { product, bids, reviews, wishlistId, loading, error } = useProductDetail(itemId || '', userId || '');
  const { inWishlist, add, remove, loading: wishlistLoading } = useWishlist(itemId || '', userId || '');
  const { submitBid, loading: bidLoading } = useBids(itemId || '');
  const { addReview, loading: reviewLoading } = useProductReviews(itemId || '');

  const [bidAmount, setBidAmount] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary || '#E63946'} />
        <Text style={{ color: colors.text, marginTop: 12 }}>Loading product...</Text>
      </SafeAreaView>
    );
  }
  if (error || !product) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}> 
        <Text style={{ color: colors.error || '#E63946', fontWeight: 'bold' }}>Error loading product.</Text>
        <Text style={{ color: colors.text }}>{error || 'Product not found.'}</Text>
      </SafeAreaView>
    );
  }

  // Helper: Format price
  const formatPrice = (price: number) => price ? `${price.toLocaleString('en-ET', { minimumFractionDigits: 2 })} ETB` : '';

  // Auction/negotiation/fixed logic
  const isAuction = !!product.is_auction;
  const isNegotiable = !!product.is_negotiable;
  const canBuyNow = !isAuction && !isNegotiable;
  const highestBid = bids && bids.length > 0 ? bids[0].bid_amount : null;
  const auctionEnd = product.auction_end_time ? new Date(product.auction_end_time).toLocaleString() : null;

  // Handlers
  const handlePlaceBid = async () => {
    if (!userId) return Alert.alert('Login required', 'Please log in to place a bid.');
    if (!bidAmount || isNaN(Number(bidAmount))) return Alert.alert('Invalid bid', 'Enter a valid bid amount.');
    await submitBid(userId, Number(bidAmount));
    setBidAmount('');
    Alert.alert('Bid placed', 'Your bid has been submitted.');
  };
  const handleWishlist = async () => {
    if (!userId) return Alert.alert('Login required', 'Please log in to use wishlist.');
    if (inWishlist) await remove(); else await add();
  };
  const handleAddReview = async () => {
    if (!userId) return Alert.alert('Login required', 'Please log in to review.');
    if (!reviewText) return Alert.alert('Empty review', 'Please enter your review.');
    await addReview(userId, reviewRating, reviewText);
    setReviewText('');
    setReviewRating(5);
    Alert.alert('Review submitted', 'Thank you for your feedback!');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Product Images */}
        {product.image_urls && product.image_urls.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {product.image_urls.map((url: string, idx: number) => (
              <View key={idx} style={styles.imageWrapper}>
                <View style={[styles.image, { backgroundColor: colors.card }]}>
                  {/* Replace with Image component if needed */}
                  <Text style={{ color: colors.text, fontSize: 12 }}>Image</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
        {/* Title & Badges */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.title, { color: colors.text }]}>{product.name}</Text>
          {isAuction && <View style={[styles.badge, { backgroundColor: '#F59E42' }]}><Text style={styles.badgeText}>Auction</Text></View>}
          {isNegotiable && <View style={[styles.badge, { backgroundColor: '#3B82F6' }]}><Text style={styles.badgeText}>Negotiable</Text></View>}
          {canBuyNow && <View style={[styles.badge, { backgroundColor: '#10B981' }]}><Text style={styles.badgeText}>Buy Now</Text></View>}
        </View>
        {/* Price & Auction Info */}
        <Text style={[styles.price, { color: colors.primary || '#E63946' }]}>{formatPrice(product.price)}</Text>
        {isAuction && (
          <View style={{ marginVertical: 8 }}>
            <Text style={{ color: colors.text }}>Auction ends: <Text style={{ fontWeight: 'bold' }}>{auctionEnd}</Text></Text>
            <Text style={{ color: colors.text }}>Highest bid: <Text style={{ fontWeight: 'bold' }}>{highestBid ? formatPrice(highestBid) : 'No bids yet'}</Text></Text>
          </View>
        )}
        {/* Wishlist Button */}
        <TouchableOpacity onPress={handleWishlist} style={styles.wishlistBtn} accessibilityLabel={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
          <Feather name={inWishlist ? 'heart' : 'heart'} size={24} color={inWishlist ? colors.primary || '#E63946' : colors.text} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.text }}>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</Text>
        </TouchableOpacity>
        {/* Description */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
        <Text style={{ color: colors.text, marginBottom: 12 }}>{product.description}</Text>
        {/* Bidding/Negotiation UI */}
        {(isAuction || isNegotiable) && (
          <View style={styles.bidSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{isAuction ? 'Place a Bid' : 'Make an Offer'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder={isAuction ? 'Your bid (ETB)' : 'Your offer (ETB)'}
                placeholderTextColor={colors.border}
                value={bidAmount}
                onChangeText={setBidAmount}
                keyboardType="numeric"
              />
              <TouchableOpacity onPress={handlePlaceBid} style={[styles.bidBtn, { backgroundColor: colors.primary || '#E63946' }]} disabled={bidLoading}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{isAuction ? 'Bid' : 'Offer'}</Text>
              </TouchableOpacity>
            </View>
            {/* Bid History */}
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 16 }]}>Bid/Offer History</Text>
            {bids && bids.length > 0 ? bids.map((bid: any, idx: number) => (
              <View key={idx} style={styles.bidRow}>
                <Text style={{ color: colors.text }}>{bid.user_id?.slice(0, 6) || 'User'}: <Text style={{ fontWeight: 'bold' }}>{formatPrice(bid.bid_amount)}</Text></Text>
                <Text style={{ color: colors.text, fontSize: 12 }}>{new Date(bid.bid_time).toLocaleString()}</Text>
                <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>{bid.bid_status}</Text>
              </View>
            )) : <Text style={{ color: colors.text, fontStyle: 'italic' }}>No bids/offers yet.</Text>}
          </View>
        )}
        {/* Buy Now Button */}
        {canBuyNow && (
          <TouchableOpacity style={[styles.buyNowBtn, { backgroundColor: colors.primary || '#E63946' }]} onPress={() => Alert.alert('Buy Now', 'Proceed to checkout flow!')}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Buy Now</Text>
          </TouchableOpacity>
        )}
        {/* Reviews Section */}
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews</Text>
          {reviews && reviews.length > 0 ? reviews.map((rev: any, idx: number) => (
            <View key={idx} style={styles.reviewRow}>
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>{rev.user_id?.slice(0, 6) || 'User'}</Text>
              <Text style={{ color: colors.text }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</Text>
              <Text style={{ color: colors.text }}>{rev.review}</Text>
              <Text style={{ color: colors.text, fontSize: 12 }}>{new Date(rev.created_at).toLocaleString()}</Text>
            </View>
          )) : <Text style={{ color: colors.text, fontStyle: 'italic' }}>No reviews yet.</Text>}
          {/* Add Review */}
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>Add Your Review</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
              {[1,2,3,4,5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Feather name={reviewRating >= star ? 'star' : 'star'} size={20} color={reviewRating >= star ? colors.primary || '#E63946' : colors.border} />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, minHeight: 40 }]}
              placeholder="Write your review..."
              placeholderTextColor={colors.border}
              value={reviewText}
              onChangeText={setReviewText}
              multiline
            />
            <TouchableOpacity onPress={handleAddReview} style={[styles.bidBtn, { backgroundColor: colors.primary || '#E63946', marginTop: 8 }]} disabled={reviewLoading}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginRight: 8 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 6 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  price: { fontSize: 20, fontWeight: 'bold', marginVertical: 6 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  imageWrapper: { marginRight: 10 },
  image: { width: 120, height: 120, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  wishlistBtn: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, alignSelf: 'flex-start' },
  bidSection: { marginTop: 18, marginBottom: 8, padding: 12, borderRadius: 10, backgroundColor: '#f5f5f5' },
  input: { borderWidth: 1, borderRadius: 8, padding: 8, minWidth: 80, marginRight: 8, backgroundColor: '#fff' },
  bidBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, marginLeft: 4 },
  buyNowBtn: { marginTop: 18, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  bidRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 2 },
  reviewRow: { marginVertical: 6, padding: 8, borderRadius: 8, backgroundColor: '#f0f0f0' },
});
