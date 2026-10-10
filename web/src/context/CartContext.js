import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }

    try {
      const response = await cartAPI.getCartCount();
      setCartCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
      setCartCount(0);
    }
  }, [isAuthenticated]);

  // Fetch cart count when auth status changes
  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  // Function to refresh cart count manually
  const refreshCartCount = useCallback(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  // Function to update cart count without API call (for immediate updates)
  const updateCartCount = useCallback((delta) => {
    setCartCount(prev => Math.max(0, prev + delta));
  }, []);

  const value = {
    cartCount,
    refreshCartCount,
    updateCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
