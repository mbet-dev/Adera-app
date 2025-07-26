import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface CartItem {
  id: string;
  item_id: string;
  shop_id: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    price: number;
    image_urls?: string[];
    shop: {
      shop_name: string;
    };
  };
}

export function useCart() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          item_id,
          shop_id,
          quantity,
          item:shop_items(
            id,
            name,
            price,
            image_urls,
            shop:shops(shop_name)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: CartItem[] = (data || []).map((item: any) => ({
        id: item.id,
        item_id: item.item_id,
        shop_id: item.shop_id,
        quantity: item.quantity,
        item: {
          id: item.item.id,
          name: item.item.name,
          price: item.item.price,
          image_urls: item.item.image_urls,
          shop: {
            shop_name: item.item.shop?.shop_name || 'Unknown Shop'
          }
        }
      }));
      
      setCartItems(transformedData);
    } catch (err: any) {
      console.error('Error fetching cart items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (itemId: string, quantity: number = 1) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase.rpc('add_to_cart', {
        p_user_id: user.id,
        p_item_id: itemId,
        p_quantity: quantity
      });

      if (error) throw error;
      
      // Refresh cart items
      await fetchCartItems();
      return true;
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase.rpc('remove_from_cart', {
        p_user_id: user.id,
        p_item_id: itemId
      });

      if (error) throw error;
      
      // Refresh cart items
      await fetchCartItems();
      return true;
    } catch (err: any) {
      console.error('Error removing from cart:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase.rpc('update_cart_quantity', {
        p_user_id: user.id,
        p_item_id: itemId,
        p_quantity: quantity
      });

      if (error) throw error;
      
      // Refresh cart items
      await fetchCartItems();
      return true;
    } catch (err: any) {
      console.error('Error updating cart quantity:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      setCartItems([]);
      return true;
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.item.price * item.quantity), 0);
  };

  const getCartSubtotal = () => {
    return getCartTotal();
  };

  const getCommission = () => {
    return getCartSubtotal() * 0.05; // 5% commission
  };

  const getTotalWithCommission = () => {
    return getCartSubtotal() + getCommission();
  };

  return {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCartItems,
    getCartItemCount,
    getCartTotal,
    getCartSubtotal,
    getCommission,
    getTotalWithCommission,
  };
} 