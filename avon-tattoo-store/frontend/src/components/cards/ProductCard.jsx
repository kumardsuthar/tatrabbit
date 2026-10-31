import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Check, Heart, ChevronDown, Image as ImageIcon, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { CustomSelect } from '../common/CustomSelect';
import { cleanProductImageUrl } from '../../utils/imageUrl';

export const ProductCard = ({ product, layout = 'grid', showVariantSelector = true }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  let festival = null;
  try {
    const themeCtx = useTheme();
    festival = themeCtx?.currentTheme;
  } catch (e) {
    festival = null;
  }

  const variants = product.variants || [];

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [added, setAdded] = useState(false);
  const isLiked = isWishlisted(product.id);

  const [imgError, setImgError] = useState(false);
  const rawImg = cleanProductImageUrl(product.image_url || product.image || product.thumbnail);

  useEffect(() => {
    setImgError(false);
  }, [product.image_url, product.image, product.thumbnail]);

  const regularPrice = selectedVariant
    ? parseFloat(selectedVariant.price || 0)
    : parseFloat(product.base_price || 0);

  const rawOfferPrice = selectedVariant
    ? selectedVariant.offer_price
    : product.offer_price;

  const offerPrice = (rawOfferPrice && parseFloat(rawOfferPrice) > 0 && parseFloat(rawOfferPrice) < regularPrice)
    ? parseFloat(rawOfferPrice)
    : null;

  const currentPrice = offerPrice !== null ? offerPrice : regularPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const isSale = offerPrice !== null;
  const discountPercent = isSale ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100) : null;

  // Review calculations: support product.reviews array or reviews_count/rating aggregates
  const reviewsCount = (() => {
    if (Array.isArray(product?.reviews)) {
      return product.reviews.length;
    }
    if (product?.reviews_count !== undefined && product?.reviews_count !== null) {
      return parseInt(product.reviews_count, 10) || 0;
    }
    if (product?.review_count !== undefined && product?.review_count !== null) {
      return parseInt(product.review_count, 10) || 0;
    }
    return 0;
  })();

  const avgRating = (() => {
    if (Array.isArray(product?.reviews) && product.reviews.length > 0) {
      const sum = product.reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
      return Math.round((sum / product.reviews.length) * 10) / 10;
    }
    const r = parseFloat(product?.rating || product?.avg_rating || 0);
    return isNaN(r) ? 0 : r;
  })();

  const hasReviews = reviewsCount > 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (currentStock <= 0) return;

    addToCart(product, selectedVariant, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const isThemeActive = festival && festival.key !== 'default';
  const themeCardBorder = isThemeActive
    ? `border-2 ${festival.primaryBorder}`
    : 'border border-slate-200/90 hover:border-slate-300';
  const priceColor = festival?.primaryText || 'text-slate-900';
  const btnStyle = festival?.buttonStyle || 'bg-blue-600 hover:bg-blue-700 text-white';

  // -------------------------------------------------------------
  // LAYOUT 1: HORIZONTAL LIST CARD VIEW
  // -------------------------------------------------------------
  if (layout === 'list') {
    return (
      <div className={`bg-white ${themeCardBorder} rounded-2xl p-3 sm:p-3.5 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 group w-full relative font-sans`}>
        
        {/* Left: Product Image Box */}
        <div className="relative w-full sm:w-52 h-44 sm:h-36 bg-white rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
          
          {/* Conditional Floating Badges (Top-Left) */}
          {(currentStock <= 0 || isSale) && (
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1">
              {currentStock <= 0 ? (
                <span className="bg-slate-800 text-white text-[9px] font-semibold uppercase px-2 py-0.5 rounded-md">
                  OUT OF STOCK
                </span>
              ) : isSale ? (
                <span className="bg-rose-600 text-white text-[9px] font-semibold uppercase px-2 py-0.5 rounded-md tracking-wider">
                  SALE
                </span>
              ) : null}
            </div>
          )}

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
            className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all backdrop-blur-md ${
              isLiked
                ? 'bg-rose-50 text-rose-500 border border-rose-200 scale-105'
                : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-200/70 hover:scale-105'
            }`}
            aria-label="Toggle Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <Link to={`/product/${product.slug || product.id}`} className="w-full h-full flex items-center justify-center p-2">
            {rawImg && !imgError ? (
              <img
                src={rawImg}
                onError={() => setImgError(true)}
                alt={product.title}
                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ImageIcon className="w-8 h-8 stroke-[1.5]" />
              </div>
            )}
          </Link>
        </div>

        {/* Center: Details & Specs Block */}
        <div className="flex-1 space-y-1.5 text-left w-full min-w-0">
          <Link to={`/product/${product.slug || product.id}`} className="block">
            <h3 className="font-heading font-semibold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug tracking-tight">
              {product.title}
            </h3>
          </Link>

          {/* 5-Star Product Rating & Review Count (Hidden if no reviews) */}
          {hasReviews && (
            <Link
              to={`/product/${product.slug || product.id}#reviews`}
              className="inline-flex items-center gap-1.5 pt-0.5 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      avgRating >= star
                        ? 'fill-amber-400 text-amber-400'
                        : avgRating >= star - 0.5
                        ? 'fill-amber-400/50 text-amber-400'
                        : 'fill-slate-100 text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-bold text-slate-700">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
              </span>
            </Link>
          )}

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description || 'Surgical grade professional tattoo equipment engineered for lining and shading.'}
          </p>

          {/* Specs / Stock tag */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
            <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-lg border border-blue-100">
              EO Gas Sterilized
            </span>
            <span className={`font-semibold px-2 py-0.5 rounded-lg border ${
              currentStock > 0 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
              {currentStock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Right: Price & Add to Cart Column */}
        <div className="w-full sm:w-44 flex flex-col justify-center space-y-2 bg-slate-50/70 border border-slate-100 p-3 rounded-xl flex-shrink-0 text-center sm:text-right">
          <div>
            {isSale && (
              <div className="flex items-center justify-center sm:justify-end gap-1.5 mb-0.5">
                <span className="text-xs text-slate-400 line-through font-medium">
                  ₹{regularPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                  -{discountPercent}% OFF
                </span>
              </div>
            )}
            <div className="text-base sm:text-lg font-semibold text-slate-900 font-heading tracking-tight">
              ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Custom Variant Selector */}
          {variants.length > 0 && (
            <CustomSelect
              size="sm"
              options={variants.map(v => ({ label: v.name, value: v.id }))}
              value={selectedVariant?.id}
              onChange={(val) => {
                const found = variants.find(v => v.id === parseInt(val));
                if (found) setSelectedVariant(found);
              }}
              maxVisible={2}
              onMoreClick={() => navigate(`/product/${product.slug || product.id}`)}
            />
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={currentStock <= 0}
            className={`w-full text-xs font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs ${
              added
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : currentStock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-blue-600 text-white shadow-md hover:shadow-blue-500/25 active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LAYOUT 2: VERTICAL GRID CARD VIEW (DEFAULT)
  // -------------------------------------------------------------
  return (
    <div className={`bg-white ${themeCardBorder} rounded-2xl p-2.5 sm:p-3 hover:border-blue-400/60 transition-all duration-300 flex flex-col justify-between group h-full relative font-sans w-full`}>

      {/* 1. IMAGE CONTAINER */}
      <div className="relative w-full aspect-[4/3] bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 mb-2 sm:mb-3 flex items-center justify-center">

        {/* Conditional Floating Badges Overlay (Top-Left) */}
        {(currentStock <= 0 || isSale) && (
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 flex flex-col items-start gap-1">
            {currentStock <= 0 ? (
              <span className="bg-slate-700 text-white text-[8px] sm:text-[9px] font-semibold uppercase px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg">
                OUT OF STOCK
              </span>
            ) : isSale ? (
              <span className="bg-rose-600 text-white text-[8px] sm:text-[9px] font-semibold uppercase px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg tracking-wider">
                SALE
              </span>
            ) : null}
          </div>
        )}

        {/* Floating Wishlist Heart Button (Top-Right) */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all backdrop-blur-md ${isLiked
              ? 'bg-rose-50 text-rose-500 border border-rose-200 scale-105'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-200/70 hover:scale-105'
            }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Product Image — object-contain so nothing gets cropped */}
        <Link to={`/product/${product.slug || product.id}`} className="absolute inset-0 flex items-center justify-center p-3">
          {rawImg && !imgError ? (
            <img
              src={rawImg}
              onError={() => setImgError(true)}
              alt={product.title}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ImageIcon className="w-10 h-10 stroke-[1.5]" />
            </div>
          )}
        </Link>
      </div>

      {/* 2. CARD CONTENT BLOCK */}
      <div className="flex-1 flex flex-col justify-between space-y-2 sm:space-y-2.5 text-center px-0.5 sm:px-1">

        {/* Title - Fixed height with min-h for consistent card alignment */}
        <Link to={`/product/${product.slug || product.id}`} className="block">
          <h3 className={`font-heading font-semibold text-xs sm:text-sm text-slate-900 ${festival?.primaryText ? `group-hover:${festival.primaryText}` : 'group-hover:text-blue-600'} transition-colors line-clamp-2 leading-snug min-h-[2.2rem] sm:min-h-[2.6rem] flex items-center justify-center px-0.5 sm:px-1`}>
            {product.title}
          </h3>
        </Link>

        {/* 5-Star Product Rating & Review Count (Hidden if no reviews) */}
        {hasReviews && (
          <Link
            to={`/product/${product.slug || product.id}#reviews`}
            className="inline-flex items-center justify-center gap-1.5 -mt-0.5 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    avgRating >= star
                      ? 'fill-amber-400 text-amber-400'
                      : avgRating >= star - 0.5
                      ? 'fill-amber-400/50 text-amber-400'
                      : 'fill-slate-100 text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-700">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              ({reviewsCount})
            </span>
          </Link>
        )}

        {/* Price Row */}
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          {isSale && (
            <span className="text-[10px] sm:text-xs text-slate-400 line-through font-medium">
              ₹{regularPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          )}
          <span className={`text-xs sm:text-base font-semibold ${priceColor} font-heading tracking-tight`}>
            ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          {isSale && discountPercent && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] sm:text-[9px] font-semibold px-1 sm:px-1.5 py-0.5 rounded-md">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Compact Custom Variant Selector */}
        {showVariantSelector && (
          <div>
            {variants.length > 0 ? (
              <CustomSelect
                size="sm"
                options={variants.map(v => ({ label: v.name, value: v.id }))}
                value={selectedVariant?.id}
                onChange={(val) => {
                  const found = variants.find(v => v.id === parseInt(val));
                  if (found) setSelectedVariant(found);
                }}
                maxVisible={2}
                onMoreClick={() => navigate(`/product/${product.slug || product.id}`)}
              />
            ) : (
              <span className="inline-block text-[9px] sm:text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-slate-100">
                Standard Pack
              </span>
            )}
          </div>
        )}

        {/* Add to Cart Action Button */}
        <div className="pt-0.5 sm:pt-1">
          <button
            onClick={handleAddToCart}
            disabled={currentStock <= 0}
            className={`w-full text-[11px] sm:text-xs font-semibold py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-2 ${added
                ? 'bg-emerald-600 text-white'
                : currentStock <= 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : `${btnStyle} active:scale-95`
              }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
