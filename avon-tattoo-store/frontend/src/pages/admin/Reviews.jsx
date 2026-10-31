import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, EyeOff, Trash2, Plus, MessageSquareQuote } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ReviewMediaViewer } from '../../components/common/ReviewMediaViewer';
import { ReviewMediaUpload } from '../../components/common/ReviewMediaUpload';
import api from '../../services/api';

export const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal for admin adding new testimonial
  const [modalOpen, setModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [productTitle, setProductTitle] = useState('TatRabbit Titan Wireless Rotary Pen');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews-list.php');
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (id) => {
    try {
      await api.post('/admin/review-toggle.php', { id });
      fetchReviews();
    } catch (err) {
      alert('Failed to update review status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment review?')) return;
    try {
      await api.post('/admin/review-delete.php', { id });
      fetchReviews();
    } catch (err) {
      alert('Failed to delete review: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews/submit.php', {
        user_name: userName,
        studio_name: studioName,
        product_title: productTitle,
        rating: parseInt(rating),
        comment: comment,
        images: images,
        video_url: videoUrl,
        is_admin: true
      });
      setModalOpen(false);
      setUserName('');
      setStudioName('');
      setComment('');
      setImages([]);
      setVideoUrl('');
      fetchReviews();
    } catch (err) {
      alert('Failed to add testimonial: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <AdminLayout title="Equipment Reviews & Testimonials Moderation">
      <div className="space-y-6 font-sans">
        
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
              <MessageSquareQuote className="w-5 h-5 text-blue-600" /> Customer & Studio Reviews
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Decide which equipment reviews and studio testimonials are shown or removed from the live website
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Verified Testimonial
          </button>
        </div>

        {/* Reviews Cards List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading equipment reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[1.8rem] p-12 text-center text-slate-400 text-xs font-semibold">
            No equipment reviews found. Click "+ Add Verified Testimonial" to add one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => {
              const isApproved = parseInt(rev.is_approved) === 1;
              return (
                <div
                  key={rev.id}
                  className={`bg-white border rounded-[1.8rem] p-5 shadow-xs transition-all space-y-3 flex flex-col justify-between ${
                    isApproved ? 'border-slate-200/90' : 'border-amber-200 bg-amber-50/20'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Rating & Target Product */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                          />
                        ))}
                        <span className="text-xs font-semibold text-slate-700 ml-1 font-heading">{rev.rating}.0</span>
                      </div>
                      <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {isApproved ? 'Live on Site' : 'Hidden from Site'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium leading-relaxed italic">
                      "{rev.comment}"
                    </p>

                    {/* Attached Review Media (Photos & Video) */}
                    <ReviewMediaViewer
                      images={rev.images}
                      video_url={rev.video_url}
                      compact={false}
                      reviewerName={rev.user_name}
                    />
                  </div>

                  {/* Reviewer Meta & Action Controls */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-slate-900">{rev.user_name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{rev.studio_name || rev.product_title || 'Verified Studio'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleApproval(rev.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 border ${
                          isApproved
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs'
                        }`}
                        title={isApproved ? 'Hide this review from live website' : 'Approve and show review on live website'}
                      >
                        {isApproved ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" /> Remove from Site
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-white" /> Show on Site
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Testimonial Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Verified Studio Testimonial">
          <form onSubmit={handleAddSubmit} className="space-y-4 font-sans">
            <Input label="Artist / Reviewer Name" required value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="e.g. Jack Tattoo" />
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Rating Score (1 to 5 Stars)
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
              >
                <option value="5">5 Stars (Excellent)</option>
                <option value="4">4 Stars (Good)</option>
                <option value="3">3 Stars (Average)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Review / Testimonial Feedback
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 placeholder-slate-400"
                placeholder="The 4.0mm stroke option is phenomenal for lining..."
              />
            </div>

            {/* Photo & Video Review Media Upload */}
            <ReviewMediaUpload
              images={images}
              setImages={setImages}
              videoUrl={videoUrl}
              setVideoUrl={setVideoUrl}
              maxImages={5}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Publish Testimonial</Button>
            </div>
          </form>
        </Modal>

      </div>
    </AdminLayout>
  );
};
