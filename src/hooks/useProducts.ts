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
        let query = supabase
          .from('shop_items')
          .select(`
            *,
            category:shop_categories!shop_items_category_id_fkey(name),
            shop:shops!shop_items_shop_id_fkey(shop_name, is_approved)
          `)
          .eq('is_active', true);

        // Only show items from approved shops
        query = query.eq('shop.is_approved', true);

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }
        
        if (search && search.trim() !== '') {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }
        
        if (filter === 'Featured') {
          query = query.eq('is_featured', true);
        } else if (filter === 'On Sale') {
          query = query.not('original_price', 'is', null)
                     .lt('price', 'original_price');
        } else if (filter === 'Top Rated') {
          query = query.gte('rating', 4.5);
        }
        
        if (typeof minPrice === 'number') {
          query = query.gte('price', minPrice);
        }
        
        if (typeof maxPrice === 'number') {
          query = query.lte('price', maxPrice);
        }
        
        // Order by featured first, then by rating, then by created date
        query = query.order('is_featured', { ascending: false })
                     .order('rating', { ascending: false })
                     .order('created_at', { ascending: false })
                     .limit(20);

        const { data, error } = await query;

        if (error) throw error;
        
        // Remove any potential duplicates by ID
        const uniqueProducts = data ? 
          data.filter((product, index, self) => 
            index === self.findIndex(p => p.id === product.id)
          ) : [];
        
        setProducts(uniqueProducts);
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
