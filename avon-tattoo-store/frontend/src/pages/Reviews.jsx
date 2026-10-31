import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Star,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Camera,
  Filter,
  MessageSquare
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { Modal } from '../components/common/Modal';
import { ReviewCard } from '../components/cards/ReviewCard';
import { ReviewMediaUpload } from '../components/common/ReviewMediaUpload';
import api from '../services/api';

export const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [hasMediaOnly, setHasMediaOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Review Modal & Form State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    studio: '',
    productTitle: 'TatRabbit Titan Wireless Rotary Pen',
    rating: 5,
    comment: '',
    images: [],
    videoUrl: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews/list.php');
      setReviews(res.data?.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    setReviewSubmitting(true);
    setReviewErrorMsg('');
    setReviewSuccessMsg('');

    try {
      await api.post('/reviews/submit.php', {
        user_name: newReview.name,
        studio_name: newReview.studio,
        product_title: newReview.productTitle || 'TatRabbit Titan Wireless Rotary Pen',
        rating: parseInt(newReview.rating),
        comment: newReview.comment,
        images: newReview.images || [],
        video_url: newReview.videoUrl || ''
      });

      setReviewSuccessMsg(
        'Thank you! Your testimonial has been submitted. It will appear on the website once approved by admin.'
      );
      setTimeout(() => {
        setNewReview({
          name: '',
          studio: '',
          productTitle: 'TatRabbit Titan Wireless Rotary Pen',
          rating: 5,
          comment: '',
          images: [],
          videoUrl: ''
        });
        setReviewSuccessMsg('');
        setReviewModalOpen(false);
        fetchReviews();
      }, 2500);
    } catch (err) {
      setReviewErrorMsg(
        err.response?.data?.error ||
          err.message ||
          'Failed to submit testimonial. Please try again.'
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Stats calculation
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, r) => acc + parseInt(r.rating || 5), 0) /
          totalReviews
        ).toFixed(1)
      : '5.0';

  const ratingCounts = {
    5: reviews.filter((r) => parseInt(r.rating || 5) === 5).length,
    4: reviews.filter((r) => parseInt(r.rating || 5) === 4).length,
    3: reviews.filter((r) => parseInt(r.rating || 5) === 3).length,
    2: reviews.filter((r) => parseInt(r.rating || 5) === 2).length,
    1: reviews.filter((r) => parseInt(r.rating || 5) === 1).length
  };

  // Filter & Search
  const filteredReviews = reviews.filter((rev) => {
    const rScore = parseInt(rev.rating || 5);
    if (selectedRating !== 'all' && rScore !== parseInt(selectedRating)) {
      return false;
    }

    if (hasMediaOnly) {
      const hasImages = Array.isArray(rev.images)
        ? rev.images.length > 0
        : rev.images && rev.images !== '[]' && rev.images !== '';
      const hasVideo = !!rev.video_url;
      if (!hasImages && !hasVideo) return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const name = (rev.user_name || rev.name || '').toLowerCase();
      const studio = (rev.studio_name || rev.studio || '').toLowerCase();
      const comment = (rev.comment || '').toLowerCase();
      const product = (rev.product_title || '').toLowerCase();
      return (
        name.includes(query) ||
        studio.includes(query) ||
        comment.includes(query) ||
        product.includes(query)
      );
    }

    return true;
  });

  // Sorting
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'highest') {
      return parseInt(b.rating || 5) - parseInt(a.rating || 5);
    }
    if (sortBy === 'lowest') {
      return parseInt(a.rating || 5) - parseInt(b.rating || 5);
    }
    // 'newest' default
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB - dateA;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-3 sm:px-6 lg:px-8 space-y-8 font-sans">
      <SEO
        title="Verified Studio Artist Reviews & Testimonials - TatRabbit"
        description="Authentic feedback, equipment ratings, and studio testimonials from professional tattoo artists across India using TatRabbit rotary machines, cartridges, and supplies."
        keywords="tattoo reviews, TatRabbit artist reviews, verified studio reviews, tattoo machine reviews India"
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900">Verified Reviews</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Verified Studio Artists
            </div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              Artist Reviews & Studio Feedback
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Read authentic feedback and hands-on studio experience from licensed tattoo artists and studios across India utilizing TatRabbit equipment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 flex-shrink-0">
            <button
              onClick={() => setReviewModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center md:text-right">
              Are you an artist? Share your experience
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left: Overall Rating Score */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2 border-b md:border-b-0 md:border-r border-slate-200/80 pb-6 md:pb-0 md:pr-6">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Overall Rating Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-heading">
              {avgRating}
            </span>
            <span className="text-slate-400 text-sm font-semibold">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Based on <strong className="text-slate-800">{totalReviews}</strong> verified studio reviews
          </p>
        </div>

        {/* Center: Rating Breakdown Bars */}
        <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200/80 pb-6 md:pb-0 md:pr-6">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars];
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            const isSelected = selectedRating === String(stars);
            return (
              <button
                key={stars}
                onClick={() => setSelectedRating(isSelected ? 'all' : String(stars))}
                className={`w-full flex items-center gap-2 text-xs py-1 px-1.5 rounded-lg transition-colors group cursor-pointer ${
                  isSelected ? 'bg-blue-50 font-bold text-blue-700' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className="w-12 text-left font-medium flex items-center gap-1">
                  {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                </span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right font-semibold text-slate-500 text-[11px]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Studio Trust Guarantee */}
        <div className="space-y-3 sm:pl-2">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Verified Artist Submissions</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Every review represents feedback from practicing tattooists with genuine orders and studio setups.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Real Studio Media</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Reviewers upload unboxing photos, session tests, and direct studio feedback videos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Rating Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedRating('all')}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              selectedRating === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Ratings ({totalReviews})
          </button>
          {[5, 4, 3].map((star) => (
            <button
              key={star}
              onClick={() => setSelectedRating(selectedRating === String(star) ? 'all' : String(star))}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                selectedRating === String(star)
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{star}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] opacity-80">({ratingCounts[star]})</span>
            </button>
          ))}

          <button
            onClick={() => setHasMediaOnly(!hasMediaOnly)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              hasMediaOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>With Media</span>
          </button>
        </div>

        {/* Search and Sort */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search artist, studio, comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white border border-slate-200 rounded-[1.8rem] p-6 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-24 h-3 bg-slate-200 rounded" />
                  <div className="w-16 h-2.5 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="w-20 h-3 bg-slate-200 rounded" />
              <div className="space-y-2">
                <div className="w-full h-3 bg-slate-100 rounded" />
                <div className="w-5/6 h-3 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedReviews.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-sm text-slate-800">
            No matching reviews found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your rating filter or search term, or click below to view all verified testimonials.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSelectedRating('all');
                setSearchQuery('');
                setHasMediaOnly(false);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-800">{sortedReviews.length}</strong> of{' '}
              {totalReviews} reviews
            </span>
            {(selectedRating !== 'all' || searchQuery || hasMediaOnly) && (
              <button
                onClick={() => {
                  setSelectedRating('all');
                  setSearchQuery('');
                  setHasMediaOnly(false);
                }}
                className="text-blue-600 hover:underline font-semibold"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedReviews.map((rev, i) => (
              <ReviewCard key={rev.id || i} review={rev} />
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="font-heading font-bold text-lg sm:text-xl text-white">
            Equip Your Studio with High-Precision Gear
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Explore our curated catalog of professional wireless tattoo rotary pens, sterilized cartridge needles, premium inks, and accessories.
          </p>
        </div>
        <Link
          to="/shop"
          className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-xs px-6 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0"
        >
          <span>Explore Shop Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* WRITE A REVIEW MODAL */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => {
          if (!reviewSubmitting) {
            setReviewModalOpen(false);
            setReviewSuccessMsg('');
            setReviewErrorMsg('');
          }
        }}
        title="Add Verified Studio Testimonial"
        maxWidth="max-w-md"
      >
        {reviewSuccessMsg ? (
          <div className="py-8 px-4 text-center space-y-3 font-sans">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-heading font-semibold text-sm text-slate-900">
              Testimonial Received!
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              {reviewSuccessMsg}
            </p>
          </div>
        ) : (
          <form onSubmit={handleAddReview} className="space-y-4 font-sans">
            {reviewErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{reviewErrorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                ARTIST / REVIEWER NAME <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newReview.name}
                onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                placeholder="e.g. Jack Tattoo"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/10 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                STUDIO NAME (OPTIONAL)
              </label>
              <input
                type="text"
                value={newReview.studio}
                onChange={(e) => setNewReview({ ...newReview, studio: e.target.value })}
                placeholder="e.g. Iron Ink Tattoo Studio, Mumbai"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/10 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                RATING SCORE (1 TO 5 STARS)
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 border border-slate-200/90 rounded-xl px-4 py-3">
                <div
                  className="flex items-center gap-1.5"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const activeScore = hoverRating || newReview.rating;
                    const isFilled = starVal <= activeScore;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: starVal })}
                        onMouseEnter={() => setHoverRating(starVal)}
                        className="p-1 focus:outline-none transition-transform transform hover:scale-125 duration-150 cursor-pointer"
                        aria-label={`Rate ${starVal} out of 5 stars`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.35)]'
                              : 'text-slate-300 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-2xs font-heading">
                  {(hoverRating || newReview.rating) === 5 && '5/5 (Excellent)'}
                  {(hoverRating || newReview.rating) === 4 && '4/5 (Very Good)'}
                  {(hoverRating || newReview.rating) === 3 && '3/5 (Good)'}
                  {(hoverRating || newReview.rating) === 2 && '2/5 (Average)'}
                  {(hoverRating || newReview.rating) === 1 && '1/5 (Poor)'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                REVIEW / TESTIMONIAL FEEDBACK <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows="3"
                required
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="The stroke precision and motor consistency during my sessions was phenomenal..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/10 placeholder-slate-400"
              />
            </div>

            {/* Photo & Video Review Media Upload */}
            <ReviewMediaUpload
              images={newReview.images || []}
              setImages={(imgs) => setNewReview({ ...newReview, images: imgs })}
              videoUrl={newReview.videoUrl || ''}
              setVideoUrl={(vid) => setNewReview({ ...newReview, videoUrl: vid })}
              maxImages={5}
            />

            <div className="pt-2 flex justify-end items-center gap-2.5">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                disabled={reviewSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {reviewSubmitting ? 'Submitting...' : 'Publish Testimonial'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
