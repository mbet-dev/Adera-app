import { useState } from 'react';
import { getProductReviews, addProductReview } from '../lib/supabase';

export function useProductReviews(itemId: string) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await getProductReviews(itemId);
    if (error) setError(error.message);
    setReviews(data || []);
    setLoading(false);
  };

  const addReview = async (userId: string, rating: number, review: string) => {
    setLoading(true);
    const { error } = await addProductReview(itemId, userId, rating, review);
    if (error) setError(error.message);
    await fetchReviews();
    setLoading(false);
  };

  return { reviews, fetchReviews, addReview, loading, error };
} 