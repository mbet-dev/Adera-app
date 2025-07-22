import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shop } from '../types';

export function useFeaturedShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('is_featured', true) // Assuming you have an 'is_featured' column
          .limit(10);

        if (error) throw error;
        setShops(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  return { shops, loading, error };
}
