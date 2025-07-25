import { useState } from 'react';
import { placeBid, getProductBids } from '../lib/supabase';

export function useBids(itemId: string) {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBids = async () => {
    setLoading(true);
    const { data, error } = await getProductBids(itemId);
    if (error) setError(error.message);
    setBids(data || []);
    setLoading(false);
  };

  const submitBid = async (userId: string, bidAmount: number) => {
    setLoading(true);
    const { error } = await placeBid(itemId, userId, bidAmount);
    if (error) setError(error.message);
    await fetchBids();
    setLoading(false);
  };

  return { bids, fetchBids, submitBid, loading, error };
} 