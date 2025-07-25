import { useState } from 'react';
import { getWishlistStatus, addToWishlist, removeFromWishlist } from '../lib/supabase';

export function useWishlist(itemId: string, userId: string) {
  const [inWishlist, setInWishlist] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlistStatus = async () => {
    setLoading(true);
    const { data, error } = await getWishlistStatus(userId, itemId);
    if (error) setError(error.message);
    setInWishlist(!!data);
    setLoading(false);
  };

  const add = async () => {
    setLoading(true);
    const { error } = await addToWishlist(userId, itemId);
    if (error) setError(error.message);
    setInWishlist(true);
    setLoading(false);
  };

  const remove = async () => {
    setLoading(true);
    const { error } = await removeFromWishlist(userId, itemId);
    if (error) setError(error.message);
    setInWishlist(false);
    setLoading(false);
  };

  return { inWishlist, fetchWishlistStatus, add, remove, loading, error };
} 