import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, Heart, Trash2, ShoppingBag, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { cleanProductImageUrl } from '../../utils/imageUrl';

export const WishlistDrawer = ({ isOpen, onClose }) => {
  const { wishlistItems, wishlistCount, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isOpen) return null;

  const handleMoveToCart = (product) => {
    const variant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    addToCart(product, variant, 1);
    removeFromWishlist(product.id);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex justify-end font-sans animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-[100000] animate-slide-left">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Heart className="w-4 h-4 fill-red-400" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-sm text-white flex items-center gap-2">
                Saved Wishlist <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full">{wishlistCount}</span>
              </h3>
              <p className="text-[10px] text-slate-400">Saved equipment & supplies in local store</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {wishlistCount > 0 && (
              <button
                type="button"
                onClick={clearWishlist}
                className="text-[10px] text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                Clear All
              </button>
            )}
            <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 custom-thin-scrollbar">
          {wishlistCount > 0 ? (
            wishlistItems.map((item) => {
              const price = parseFloat(item.base_price || 0);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-200 transition-all group"
                >
                  <Link to={`/product/${item.id}`} onClick={onClose} className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl p-2 flex-shrink-0 flex items-center justify-center">
                    {cleanProductImageUrl(item.image_url) ? (
                      <img
                        src={cleanProductImageUrl(item.image_url)}
                        alt={item.title}
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                      />
                    ) : null}
                    <div className={`${cleanProductImageUrl(item.image_url) ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-slate-300`}>
                      <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[9px] font-semibold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      {item.category || 'Equipment'}
                    </span>
                    <Link to={`/product/${item.id}`} onClick={onClose} className="block">
                      <h4 className="font-heading font-semibold text-xs text-slate-900 truncate hover:text-blue-600 mt-1">
                        {item.title}
                      </h4>
                    </Link>
                    <p className="font-heading font-semibold text-xs text-slate-900 mt-0.5">
                      ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition-all active:scale-95"
                      title="Move to Cart"
                    >
                      <ShoppingBag className="w-3 h-3" /> Move to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center shadow-xs">
                <Heart className="w-8 h-8 fill-red-100" />
              </div>
              <h4 className="font-heading font-semibold text-sm text-slate-900">Your Wishlist is Empty</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Tap the heart icon on any rotary machine, cartridges, or obsidian ink to save it to your local wishlist!
              </p>
              <Link
                to="/shop"
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                Browse Shop Catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlistCount > 0 && (
          <div className="p-4 bg-white border-t border-slate-100 space-y-2">
            <Link
              to="/shop"
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};

