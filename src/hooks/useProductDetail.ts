import { useEffect, useState } from 'react';
import { getProductDetail, getProductBids, getProductReviews, getWishlistStatus } from '../lib/supabase';

export function useProductDetail(itemId: string, userId?: string) {
  const [product, setProduct] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getProductDetail(itemId),
      getProductBids(itemId),
      getProductReviews(itemId),
      userId ? getWishlistStatus(userId, itemId) : Promise.resolve({ data: null })
    ]).then(([prodRes, bidsRes, reviewsRes, wishlistRes]) => {
      if (!mounted) return;
      setProduct(prodRes.data);
      setBids(bidsRes.data || []);
      setReviews(reviewsRes.data || []);
      setWishlistId(wishlistRes.data?.id || null);
      setLoading(false);
    }).catch((err) => {
      setError(err.message || 'Error loading product detail');
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [itemId, userId]);

  return { product, bids, reviews, wishlistId, loading, error };
} 