import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShopItem } from '../types';

export function useProducts(categoryId?: string, search?: string, filter?: string, minPrice?: number, maxPrice?: number) {
  const [products, setProducts] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase.from('items').select('*');

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }
        if (search && search.trim() !== '') {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }
        if (filter === 'Featured') {
          query = query.eq('is_featured', true);
        } else if (filter === 'On Sale') {
          query = query.lt('price', 'original_price');
        } else if (filter === 'Top Rated') {
          query = query.gte('rating', 4.5);
        }
        if (typeof minPrice === 'number') {
          query = query.gte('price', minPrice);
        }
        if (typeof maxPrice === 'number') {
          query = query.lte('price', maxPrice);
        }
        query = query.limit(20);

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, search, filter, minPrice, maxPrice]);

  return { products, loading, error };
}
