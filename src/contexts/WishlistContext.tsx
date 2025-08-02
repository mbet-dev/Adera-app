import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShopItem } from '../types';

interface WishlistItem {
  id: string;
  product: ShopItem;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  totalItems: number;
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: { product: ShopItem } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'LOAD_WISHLIST'; payload: { items: WishlistItem[] } };

interface WishlistContextType {
  state: WishlistState;
  addToWishlist: (product: ShopItem) => void;
  removeFromWishlist: (itemId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistItem: (productId: string) => WishlistItem | undefined;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = '@adera_wishlist';

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product } = action.payload;
      const existingItem = state.items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return state; // Already in wishlist
      }
      
      const newItem: WishlistItem = {
        id: `${product.id}_${Date.now()}`,
        product,
        addedAt: new Date().toISOString(),
      };
      
      return {
        ...state,
        items: [...state.items, newItem],
        totalItems: state.totalItems + 1,
      };
    }
    
    case 'REMOVE_ITEM': {
      const { itemId } = action.payload;
      const newItems = state.items.filter(item => item.id !== itemId);
      
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
      };
    }
    
    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: [],
        totalItems: 0,
      };
    
    case 'LOAD_WISHLIST': {
      const { items } = action.payload;
      return {
        ...state,
        items,
        totalItems: items.length,
      };
    }
    
    default:
      return state;
  }
};

const initialState: WishlistState = {
  items: [],
  totalItems: 0,
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load wishlist from storage on mount
  useEffect(() => {
    loadWishlistFromStorage();
  }, []);

  // Save wishlist to storage whenever it changes
  useEffect(() => {
    saveWishlistToStorage();
  }, [state.items]);

  const loadWishlistFromStorage = async () => {
    try {
      const wishlistData = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
      if (wishlistData) {
        const { items } = JSON.parse(wishlistData);
        dispatch({ type: 'LOAD_WISHLIST', payload: { items } });
      }
    } catch (error) {
      console.error('Error loading wishlist from storage:', error);
    }
  };

  const saveWishlistToStorage = async () => {
    try {
      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify({ items: state.items }));
    } catch (error) {
      console.error('Error saving wishlist to storage:', error);
    }
  };

  const addToWishlist = (product: ShopItem) => {
    dispatch({ type: 'ADD_ITEM', payload: { product } });
  };

  const removeFromWishlist = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  const isInWishlist = (productId: string): boolean => {
    return state.items.some(item => item.product.id === productId);
  };

  const getWishlistItem = (productId: string): WishlistItem | undefined => {
    return state.items.find(item => item.product.id === productId);
  };

  const value: WishlistContextType = {
    state,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistItem,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 