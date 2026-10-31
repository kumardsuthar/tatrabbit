import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('avon_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to parse wishlist from localStorage:', err);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('avon_wishlist', JSON.stringify(wishlistItems));
    } catch (err) {
      console.error('Failed to save wishlist to localStorage:', err);
    }
  }, [wishlistItems]);

  const isWishlisted = (productId) => {
    if (!productId) return false;
    return wishlistItems.some(item => Number(item.id) === Number(productId));
  };

  const toggleWishlist = (product) => {
    if (!product || !product.id) return;

    setWishlistItems((prev) => {
      const exists = prev.some(item => Number(item.id) === Number(product.id));
      if (exists) {
        return prev.filter(item => Number(item.id) !== Number(product.id));
      } else {
        return [...prev, product];
      }
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter(item => Number(item.id) !== Number(productId)));
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
