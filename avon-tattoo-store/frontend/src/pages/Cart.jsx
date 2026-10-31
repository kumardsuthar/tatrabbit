import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/common/Button';
import { cleanProductImageUrl } from '../utils/imageUrl';

export const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal, shippingFee, finalTotal } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-5 font-sans px-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-semibold text-lg text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You haven't added any rotary machines, cartridge needles, or inks to your studio cart yet.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-md transition-all inline-flex items-center gap-2"
        >
          Browse Equipment Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-heading font-semibold text-base sm:text-lg text-slate-900">Studio Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-0.5">{cartItems.length} items queued for studio dispatch</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Empty Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-3.5">
          {cartItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 flex-shrink-0">
                  {cleanProductImageUrl(item.image_url) ? (
                    <img
                      src={cleanProductImageUrl(item.image_url)}
                      alt={item.title}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                    />
                  ) : null}
                  <div className={`${cleanProductImageUrl(item.image_url) ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-slate-300`}>
                    <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-xs sm:text-sm text-slate-900 line-clamp-1">{item.title}</h3>
                  {item.variant_name && (
                    <p className="text-[11px] text-blue-600 font-semibold mt-0.5">{item.variant_name}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`text-xs font-semibold ${item.applied_coupon ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                      ₹{item.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    {item.original_price && item.original_price > item.unit_price && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{item.original_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                    {item.applied_coupon && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                        {item.applied_coupon.code}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto">
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.variant_id, -1)}
                    className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-semibold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.variant_id, 1)}
                    className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 font-heading block">
                    ₹{(item.unit_price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.product_id, item.variant_id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Proceed Box */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-5 sticky top-28 shadow-xs">
          <h3 className="font-heading font-semibold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Cart Summary
          </h3>

          {/* Free Delivery Threshold Banner */}
          {cartTotal < 5000 ? (
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-800 space-y-1">
              <div className="flex justify-between items-center font-semibold">
                <span>Free Delivery Eligibility</span>
                <span className="text-[10px] bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded">Standard ₹100</span>
              </div>
              <p className="text-[11px] leading-snug">
                Add <strong>₹{(5000 - cartTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> more to qualify for <strong>FREE Delivery</strong> across India.
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-xl p-3 text-[11px] text-emerald-800 font-medium">
              🎉 <strong>FREE Courier Delivery Unlocked!</strong> Your order qualifies for zero shipping charges.
            </div>
          )}

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="text-slate-900 font-semibold">₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span>Express Courier Delivery</span>
                {shippingFee > 0 && <span className="text-[10px] text-slate-400 block">(Orders below ₹5,000)</span>}
              </div>
              <span className={shippingFee === 0 ? "text-emerald-600 font-semibold" : "text-slate-900 font-semibold"}>
                {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Total Payable</span>
              <span className="text-[10px] text-slate-400">Includes all GST & shipping</span>
            </div>
            <span className="text-lg font-heading font-semibold text-blue-600">
              ₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            Proceed to Secure Checkout <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit SSL Encrypted Payment Guarantee
          </div>
        </div>
      </div>
    </div>
  );
};
