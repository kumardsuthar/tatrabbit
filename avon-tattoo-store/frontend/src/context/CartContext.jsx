import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('avon_cart_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('avon_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('avon_cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('avon_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('avon_applied_coupon');
    }
  }, [appliedCoupon]);

  // If cart becomes empty, remove coupon
  useEffect(() => {
    if (cartItems.length === 0 && appliedCoupon) {
      setAppliedCoupon(null);
      localStorage.removeItem('avon_applied_coupon');
    }
  }, [cartItems.length]);

  const addToCart = (product, selectedVariant = null, quantity = 1, customPrice = null, appliedCouponParam = null) => {
    setCartItems(prev => {
      const variantId = selectedVariant ? selectedVariant.id : null;
      const existingIndex = prev.findIndex(
        item => item.product_id === product.id && item.variant_id === variantId
      );

      const regularPrice = selectedVariant ? parseFloat(selectedVariant.price || 0) : parseFloat(product.base_price || 0);
      const rawOffer = selectedVariant ? selectedVariant.offer_price : product.offer_price;
      const offerPrice = (rawOffer && parseFloat(rawOffer) > 0 && parseFloat(rawOffer) < regularPrice) ? parseFloat(rawOffer) : null;
      const basePrice = offerPrice !== null ? offerPrice : regularPrice;
      const price = (customPrice !== null && !isNaN(customPrice) && customPrice >= 0) ? customPrice : basePrice;
      const variantName = selectedVariant ? selectedVariant.name : null;
      const stock = selectedVariant ? selectedVariant.stock : product.stock;

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex].quantity = Math.min(newQty, stock);
        if (customPrice !== null) {
          updated[existingIndex].unit_price = price;
        }
        return updated;
      } else {
        return [
          ...prev,
          {
            product_id: product.id,
            variant_id: variantId,
            title: product.title,
            image_url: product.image_url,
            variant_name: variantName,
            unit_price: price,
            original_price: basePrice,
            quantity: Math.min(quantity, stock),
            stock: stock
          }
        ];
      }
    });
  };

  const removeFromCart = (productId, variantId = null) => {
    setCartItems(prev => prev.filter(item => !(item.product_id === productId && item.variant_id === variantId)));
  };

  const updateQuantity = (productId, variantId, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product_id === productId && item.variant_id === variantId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: Math.min(newQty, item.stock) };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const applyCoupon = (couponData) => {
    setAppliedCoupon(couponData);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('avon_applied_coupon');
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('avon_cart_items');
    localStorage.removeItem('avon_applied_coupon');
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  const cartTotal = subtotal; // Backward compatible subtotal alias
  const discountAmount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount || 0) : 0;
  const shippingFee = cartItems.length > 0 ? (subtotal < 5000 ? 100 : 0) : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      subtotal,
      shippingFee,
      finalTotal,
      totalItemCount,
      appliedCoupon,
      discountAmount,
      applyCoupon,
      removeCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
