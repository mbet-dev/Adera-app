import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShopCategory } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('shop_categories')
          .select('*')
          .order('sort_order', { ascending: true })
          .limit(5); // Limit to the top 5 categories for the home screen

        if (error) throw error;
        setCategories(data || []);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Error loading categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
