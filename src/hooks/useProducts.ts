import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShopItem } from '../types';

interface UseProductsOptions {
  filter?: string;
  priceRange?: { min: number; max: number };
  category?: string | null;
  shopId?: string;
  searchQuery?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [options.filter, options.priceRange, options.category, options.shopId, options.searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('shop_items')
        .select(`
          *,
          category:shop_categories!shop_items_category_id_fkey(name),
          shop:shops!shop_items_shop_id_fkey(
            shop_name,
            is_approved,
            is_active
          )
        `)
        .eq('is_active', true);

      // Filter by shop if specified
      if (options.shopId) {
        query = query.eq('shop_id', options.shopId);
      }

      // Filter by category if specified
      if (options.category && options.category !== 'All') {
        query = query.eq('category.name', options.category);
      }

      // Apply price range filter
      if (options.priceRange) {
        query = query
          .gte('price', options.priceRange.min)
          .lte('price', options.priceRange.max);
      }

      // Apply search filter
      if (options.searchQuery && options.searchQuery.trim()) {
        query = query.or(`name.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`);
      }

      // Apply other filters
      if (options.filter) {
        switch (options.filter) {
          case 'featured':
            query = query.eq('is_featured', true);
            break;
          case 'on_sale':
            query = query.not('original_price', 'is', null);
            break;
          case 'top_rated':
            query = query.gte('rating', 4.0);
            break;
          default:
            // 'all' - no additional filter
            break;
        }
      }

      // Only show products from approved and active shops
      query = query.eq('shop.is_approved', true).eq('shop.is_active', true);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Raw products data:', data);
      console.log('Number of products fetched:', data?.length || 0);

      // Remove duplicates and transform data
      const uniqueProducts = data?.reduce((acc: ShopItem[], product: any) => {
        const existingIndex = acc.findIndex(p => p.id === product.id);
        if (existingIndex === -1) {
          const transformedProduct = {
            id: product.id,
            shop_id: product.shop_id,
            category_id: product.category_id,
            name: product.name,
            description: product.description,
            price: product.price,
            original_price: product.original_price,
            quantity: product.quantity,
            image_urls: product.image_urls,
            delivery_supported: product.delivery_supported,
            delivery_fee: product.delivery_fee,
            is_active: product.is_active,
            is_featured: product.is_featured,
            views_count: product.views_count,
            sales_count: product.sales_count,
            rating: product.rating,
            created_at: product.created_at,
            updated_at: product.updated_at,
          };
          
          console.log('Transformed product:', transformedProduct.name, 'Image URLs:', transformedProduct.image_urls);
          acc.push(transformedProduct);
        }
        return acc;
      }, []) || [];

      console.log('Final unique products:', uniqueProducts.length);
      setProducts(uniqueProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err.message || 'Unknown error');
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: ShopItem, quantity: number = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('item_id', product.id)
        .single();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Add new item to cart
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            item_id: product.id,
            shop_id: product.shop_id,
            quantity: quantity,
          });

        if (error) throw error;
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error adding to cart:', err.message || 'Unknown error');
      setError(err.message || 'Failed to add to cart');
    }
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    addToCart,
  };
} 