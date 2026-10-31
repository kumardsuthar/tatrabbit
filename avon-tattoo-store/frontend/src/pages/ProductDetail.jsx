import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShoppingBag, Check, HelpCircle, ChevronDown, ChevronUp, ArrowLeft, Heart, ChevronLeft, ChevronRight, Star, MessageSquareQuote, Plus, CheckCircle2, UserCheck, Sparkles, Layers, ZoomIn, ZoomOut, RotateCcw, X, Image as ImageIcon, Tag, AlertCircle, Percent } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ProductCard } from '../components/cards/ProductCard';
import { SEO } from '../components/common/SEO';
import { ReviewMediaViewer, parseReviewImages } from '../components/common/ReviewMediaViewer';
import { ReviewMediaUpload } from '../components/common/ReviewMediaUpload';
import api from '../services/api';
import { cleanProductImageUrl } from '../utils/imageUrl';

export const ProductDetail = () => {
  const { slug, id } = useParams();
  const targetParam = slug || id;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState(null);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Zoom Lightbox State
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewVideo, setReviewVideo] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [targetParam]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/detail.php?slug=${targetParam}`);
      const data = res.data.product;
      setProduct(data);
      setSelectedVariant(null);
      setActiveImageIndex(0);
    } catch (err) {
      console.error('Failed to load product detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewerName || !reviewComment) return;
    setSubmittingReview(true);
    setReviewErrorMsg('');
    try {
      await api.post('/reviews/submit.php', {
        product_id: product.id,
        user_name: reviewerName,
        user_email: reviewerEmail,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        images: reviewImages,
        video_url: reviewVideo
      });

      setReviewSuccessMsg('Thank you! Your review with media has been submitted for admin approval.');
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccessMsg('');
        setReviewErrorMsg('');
        setReviewerName('');
        setReviewerEmail('');
        setReviewTitle('');
        setReviewComment('');
        setReviewImages([]);
        setReviewVideo('');
        setReviewRating(5);
        fetchDetail();
      }, 2500);
    } catch (err) {
      setReviewErrorMsg(err.response?.data?.error || err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Combine primary image and gallery images into a unique list (Primary image is ALWAYS Index 0)
  const allImages = Array.from(
    new Set([cleanProductImageUrl(product?.image_url), ...(product?.gallery_images || []).map(cleanProductImageUrl)].filter(Boolean))
  );

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleOpenZoom = (idx = activeImageIndex) => {
    setActiveImageIndex(idx);
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    setZoomModalOpen(true);
  };

  const handleCloseZoom = () => {
    setZoomModalOpen(false);
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(Number((prev + 0.5).toFixed(1)), 3.5));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => {
      const next = Math.max(Number((prev - 0.5).toFixed(1)), 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const toggleImageZoom = (e) => {
    if (isDragging) return;
    if (zoomScale > 1) {
      setZoomScale(1);
      setPanPosition({ x: 0, y: 0 });
    } else {
      setZoomScale(2);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * -120;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -120;
      setPanPosition({ x, y });
    }
  };

  const handleMouseDown = (e) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomScale <= 1) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (zoomScale <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - panPosition.x, y: e.touches[0].clientY - panPosition.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || zoomScale <= 1) return;
    setPanPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };


  // Keyboard navigation & body scroll lock for zoom modal - must be called before conditional returns
  useEffect(() => {
    if (!zoomModalOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseZoom();
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
        setZoomScale(1);
        setPanPosition({ x: 0, y: 0 });
      }
      if (e.key === 'ArrowRight') {
        handleNextImage();
        setZoomScale(1);
        setPanPosition({ x: 0, y: 0 });
      }
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoomModalOpen, allImages.length]);

  const regularPrice = selectedVariant
    ? parseFloat(selectedVariant.price || 0)
    : parseFloat(product?.base_price || 0);

  const rawOfferPrice = selectedVariant
    ? selectedVariant.offer_price
    : product?.offer_price;

  const offerPrice = (rawOfferPrice && parseFloat(rawOfferPrice) > 0 && parseFloat(rawOfferPrice) < regularPrice)
    ? parseFloat(rawOfferPrice)
    : null;

  const currentPrice = offerPrice !== null ? offerPrice : regularPrice;

  const formatPrice = (val) => {
    if (val === null || val === undefined || val === '') return '0.00';
    const num = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(num) ? '0.00' : num.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-semibold text-xs">Loading equipment specifications...</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Equipment Not Found</h2>
        <Button onClick={() => navigate('/')}>Back to Catalog</Button>
      </div>
    );
  }

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const reviews = product.reviews || [];
  const totalReviewsCount = reviews.length;
  const avgRatingNumber = totalReviewsCount > 0
    ? (reviews.reduce((acc, r) => acc + parseInt(r.rating || 5), 0) / totalReviewsCount).toFixed(1)
    : '5.0';

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const star = parseInt(r.rating || 5);
    if (ratingCounts[star] !== undefined) ratingCounts[star]++;
  });

  const similarProducts = product.similar_products || [];

  const handleAddToCart = () => {
    if (currentStock <= 0) return;
    addToCart(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const getVariantTitleLabel = () => {
    if (product?.variant_title && product.variant_title.trim() !== '') {
      const trimmed = product.variant_title.trim();
      return trimmed.endsWith(':') ? trimmed : `${trimmed}:`;
    }

    const cat = (product?.category || '').toLowerCase();
    if (cat.includes('machine')) {
      return 'Configuration / Stroke Length:';
    } else if (cat.includes('needle')) {
      return 'Needle Gauge & Configuration:';
    } else if (cat.includes('ink')) {
      return 'Ink Shade & Volume Option:';
    } else if (cat.includes('power')) {
      return 'Power Output & Cable Spec:';
    } else if (cat.includes('hygiene')) {
      return 'Pack Size & Hygiene Option:';
    }

    return 'Select Variant / Specification:';
  };

  return (
    <div className="w-full space-y-10 pt-2 pb-16 font-sans">
      <SEO
        title={`${product.title} - TatRabbit`}
        description={product.description}
        keywords={`${product.title}, ${product.category}, tattoo equipment, professional tattoo pen, cartridge needles`}
        image={allImages[0]}
        type="product"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Equipment Catalog', url: '/shop' },
          { name: product.category, url: `/shop?category=${encodeURIComponent(product.category)}` },
          { name: product.title, url: `/product/${product.slug || product.id}` }
        ]}
        schemaData={{
          '@context': 'https://schema.org/',
          '@type': 'Product',
          'name': product.title,
          'image': allImages,
          'description': product.description,
          'category': product.category,
          'offers': {
            '@type': 'Offer',
            'priceCurrency': 'INR',
            'price': currentPrice,
            'availability': currentStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
          }
        }}
      />

      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Equipment Catalog
      </button>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">

        {/* Left Column: Gallery Image Slider & Thumbnails */}
        <div className="space-y-3 w-full min-w-0">
          <div 
            onClick={() => allImages.length > 0 && handleOpenZoom(activeImageIndex)}
            className={`bg-white border border-slate-200 rounded-2xl overflow-hidden h-[340px] sm:h-[380px] w-full relative shadow-xs p-5 flex items-center justify-center group ${allImages.length > 0 ? 'cursor-zoom-in hover:border-blue-400/80' : ''} transition-all`}
            title={allImages.length > 0 ? "Click to zoom equipment image" : ""}
          >
            {allImages.length > 0 ? (
              <img
                src={allImages[activeImageIndex]}
                alt={`${product.title} view ${activeImageIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-300">
                <ImageIcon className="w-16 h-16 stroke-[1.2]" />
                <span className="text-xs text-slate-400 font-medium">No Image Available</span>
              </div>
            )}

            {/* Category Tag */}
            <div className="absolute top-3.5 left-3.5 z-10">
              <span className="bg-blue-50/90 backdrop-blur-md text-blue-700 border border-blue-200 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                {product.category}
              </span>
            </div>

            {/* Floating Zoom Action Badge */}
            {allImages.length > 0 && (
              <div className="absolute bottom-3 left-3 bg-slate-900/85 hover:bg-slate-900 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 transition-all opacity-85 group-hover:opacity-100 z-10 pointer-events-none">
                <ZoomIn className="w-3.5 h-3.5 text-blue-400" /> Click to Zoom
              </div>
            )}

            {/* Navigation Arrows for Slider */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-slate-200 text-slate-800 shadow-md flex items-center justify-center transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 z-10"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-slate-200 text-slate-800 shadow-md flex items-center justify-center transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 z-10"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </button>

                {/* Counter Badge */}
                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm z-10">
                  {activeImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>

          {/* Interactive Thumbnails Selector Row */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 scrollbar-thin">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border p-1 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 transition-all ${activeImageIndex === idx
                      ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-xs scale-105'
                      : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                    }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="max-w-full max-h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specs & Buy Box */}
        <div className="space-y-4 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div>
            <h1 className="font-heading font-semibold text-base sm:text-lg text-slate-900 leading-snug">
              {product.title}
            </h1>
            <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
              {offerPrice !== null ? (
                <>
                  <span className="text-blue-600 font-heading font-semibold text-lg sm:text-xl tracking-tight">
                    ₹{formatPrice(offerPrice)}
                  </span>
                  <span className="text-slate-400 font-heading font-medium text-xs sm:text-sm line-through">
                    ₹{formatPrice(regularPrice)}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {Math.round(((regularPrice - offerPrice) / regularPrice) * 100)}% OFF
                  </span>
                </>
              ) : (
                <span className="text-blue-600 font-heading font-semibold text-lg sm:text-xl tracking-tight">
                  ₹{formatPrice(regularPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Variant Selector Pills */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                  {getVariantTitleLabel()}
                </label>
                {selectedVariant && (
                  <button
                    onClick={() => setSelectedVariant(null)}
                    className="text-[10px] font-semibold text-blue-600 hover:underline"
                  >
                    Reset to Base Price
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${selectedVariant?.id === v.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}



          {/* Stock & Quantity Control */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-semibold text-xs"
              >
                -
              </button>
              <span className="px-3 text-xs font-semibold text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-semibold text-xs"
              >
                +
              </button>
            </div>

            <span className={`text-xs font-semibold ${currentStock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {currentStock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={handleAddToCart}
              disabled={currentStock <= 0}
              className={`flex-1 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs ${added
                  ? 'bg-emerald-600 text-white'
                  : currentStock <= 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Added to Studio Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Add to Studio Cart
                </>
              )}
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${isWishlisted(product.id)
                  ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50'
                }`}
              title={isWishlisted(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-4.5 h-4.5 ${isWishlisted(product.id) ? 'fill-rose-600' : ''}`} />
            </button>
          </div>

          {/* Warranty Badge — only show if warranty_text is set and not empty */}
          {Boolean(product.warranty_text && product.warranty_text.trim()) && (
            <div className="flex items-center gap-2.5 border border-blue-100 bg-blue-50/60 rounded-xl px-3.5 py-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-[11px] font-semibold text-blue-900">
                {product.warranty_text.trim()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product Description Section - Above FAQs */}
      {product.description && (
        <div className="border-t border-slate-200 pt-6 space-y-3">
          <h2 className="font-heading font-semibold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" /> About This Product
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div
              className="quill-content text-[13px] text-slate-600 leading-7"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>
      )}

      {/* Accordion FAQs Section */}
      {product.faqs && product.faqs.length > 0 && (
        <div className="border-t border-slate-200 pt-6 space-y-3">
          <h2 className="font-heading font-semibold text-sm text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" /> Technical Specifications & FAQs
          </h2>

          <div className="space-y-2">
            {product.faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-3.5 text-left font-heading font-semibold text-xs text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span>{faq.question}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openFaq === idx && (
                  <div className="p-3.5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* REVIEWS & VERIFIED ARTIST FEEDBACK SECTION */}
      {/* ------------------------------------------------------------- */}
      <div className="border-t border-slate-200 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-semibold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <MessageSquareQuote className="w-4.5 h-4.5 text-blue-600" /> Studio Customer Reviews
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified feedback from professional tattoo artists and studio owners
            </p>
          </div>

          <button
            onClick={() => setReviewModalOpen(true)}
            className="bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-blue-400" /> Write a Review
          </button>
        </div>

        {/* Rating Breakdown & Summary Grid */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

          {/* Box 1: Score & Star Rating */}
          <div className="text-center md:border-r border-slate-100 md:pr-6 space-y-1">
            <div className="text-2xl font-semibold font-heading text-slate-900 tracking-tight">
              {avgRatingNumber}
            </div>
            <div className="flex justify-center items-center gap-1 text-amber-400 my-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(parseFloat(avgRatingNumber)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                />
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Based on {totalReviewsCount} verified review{totalReviewsCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Box 2: Rating Breakdown Bars */}
          <div className="md:col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star] || 0;
              const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-semibold text-slate-600 flex items-center gap-1">
                    {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-[11px] font-semibold text-slate-400">{pct}%</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Customer Photos & Video Gallery Preview Strip */}
        {(() => {
          const reviewsWithMedia = reviews.filter((r) => {
            const imgs = parseReviewImages(r.images);
            return imgs.length > 0 || (r.video_url && r.video_url.trim());
          });
          if (reviewsWithMedia.length === 0) return null;
          return (
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 font-heading">
                    <ImageIcon className="w-4 h-4 text-blue-600" /> Customer Photos & Videos
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Real studio snapshots and video demonstrations from verified tattoo artists
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {reviewsWithMedia.length} review{reviewsWithMedia.length !== 1 ? 's' : ''} with media
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {reviewsWithMedia.map((r) => (
                  <ReviewMediaViewer
                    key={r.id}
                    images={r.images}
                    video_url={r.video_url}
                    compact={true}
                    reviewerName={r.user_name}
                  />
                ))}
              </div>
            </div>
          );
        })()}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-600">No reviews for this product yet.</p>
            <p className="text-[11px] text-slate-400">Be the first professional artist to leave feedback!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {new Date(rev.created_at || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {rev.title && (
                    <h4 className="font-heading font-semibold text-xs text-slate-900 leading-snug">
                      "{rev.title}"
                    </h4>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rev.comment}
                  </p>

                  {/* Customer Review Photos & Video Section */}
                  <ReviewMediaViewer
                    images={rev.images}
                    video_url={rev.video_url}
                    reviewerName={rev.user_name}
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center flex-shrink-0 font-heading">
                    {rev.user_name ? rev.user_name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">{rev.user_name}</p>
                    <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-600" /> Verified Studio Buyer
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* WRITE A REVIEW POPUP MODAL */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Write a Studio Product Review"
      >
        {reviewSuccessMsg ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-semibold text-sm text-slate-900">{reviewSuccessMsg}</h4>
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-4 font-sans">
            {reviewErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {reviewErrorMsg}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Rating Score *
              </label>
              <div className="flex items-center gap-1 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${star <= (hoverRating || reviewRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                        }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-slate-600 ml-2 font-heading">
                  {hoverRating || reviewRating} / 5 Stars
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Jack Tattoo Artist"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  placeholder="artist@studio.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Review Headline / Title
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g. Smooth motor, quiet operation & zero vibration"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Review Feedback *
              </label>
              <textarea
                rows={4}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Describe your studio experience with this equipment..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 placeholder-slate-400"
              />
            </div>

            {/* Photo & Video Review Media Upload */}
            <ReviewMediaUpload
              images={reviewImages}
              setImages={setReviewImages}
              videoUrl={reviewVideo}
              setVideoUrl={setReviewVideo}
              maxImages={5}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        )}
      </Modal>



      {/* ------------------------------------------------------------- */}
      {/* SIMILAR PRODUCTS SECTION */}
      {/* ------------------------------------------------------------- */}
      {similarProducts.length > 0 && (
        <div className="border-t border-slate-200 pt-10 space-y-6">
          <div className="text-left space-y-1">
            <h2 className="font-heading font-semibold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Similar Studio Equipment & Accessories
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Explore matching professional tattoo machines, needle cartridges, and power supplies engineered for your studio.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {similarProducts.map((simProd) => (
              <ProductCard key={simProd.id} product={simProd} />
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HIGH-RES PRODUCT IMAGE ZOOM LIGHTBOX MODAL */}
      {/* ------------------------------------------------------------- */}
      {zoomModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between select-none animate-fadeIn"
          onClick={handleCloseZoom}
        >
          {/* Top Bar: Title, Count & Zoom Controls */}
          <div 
            className="flex items-center justify-between px-4 sm:px-8 py-3.5 bg-slate-900/85 border-b border-slate-800/80 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <span className="text-white font-heading font-semibold text-xs sm:text-sm truncate">
                {product.title}
              </span>
              <span className="bg-slate-800 text-blue-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-700 flex-shrink-0">
                {activeImageIndex + 1} / {allImages.length}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleZoomOut}
                disabled={zoomScale <= 1}
                className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 disabled:opacity-30 text-white transition-all shadow-xs"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold font-mono transition-all shadow-xs"
                title="Reset Zoom"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoomScale >= 3.5}
                className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 disabled:opacity-30 text-white transition-all shadow-xs"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleCloseZoom}
                className="p-2 rounded-xl bg-slate-800/90 hover:bg-rose-600 text-white transition-all ml-2 shadow-xs"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Stage: Interactive Zoomable Image */}
          <div 
            className="flex-1 relative flex items-center justify-center overflow-hidden p-4 sm:p-8"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {/* Prev Image Button */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevImage(); handleResetZoom(); }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-xl flex items-center justify-center z-20 transition-all hover:scale-105"
                title="Previous Image (←)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Image Button */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); handleNextImage(); handleResetZoom(); }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-xl flex items-center justify-center z-20 transition-all hover:scale-105"
                title="Next Image (→)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image Canvas */}
            <div
              className={`max-w-full max-h-full flex items-center justify-center transition-transform ${isDragging ? 'duration-0' : 'duration-200'} ${zoomScale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'}`}
              style={{
                transform: `scale(${zoomScale}) translate(${panPosition.x / zoomScale}px, ${panPosition.y / zoomScale}px)`
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onClick={(e) => { e.stopPropagation(); toggleImageZoom(e); }}
            >
              <img
                src={allImages[activeImageIndex]}
                alt={product.title}
                className="max-w-[85vw] max-h-[70vh] sm:max-h-[76vh] object-contain rounded-xl drop-shadow-2xl pointer-events-none select-none"
                draggable={false}
              />
            </div>
          </div>

          {/* Bottom Bar: Thumbnails & Helper Hint */}
          <div 
            className="px-4 py-3 bg-slate-900/85 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[11px] text-slate-400 font-medium">
              💡 {zoomScale > 1 ? 'Drag image to pan • Click image to zoom out' : 'Click image to zoom 2x • Use controls above to zoom deeper'} • <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[10px]">Esc</kbd> to exit
            </p>

            {/* Thumbnails Row */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-full py-0.5">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setActiveImageIndex(idx); handleResetZoom(); }}
                    className={`w-11 h-11 rounded-lg border overflow-hidden p-0.5 transition-all flex-shrink-0 ${activeImageIndex === idx ? 'border-blue-500 ring-2 ring-blue-500/40 bg-white' : 'border-slate-700 bg-slate-800/60 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

