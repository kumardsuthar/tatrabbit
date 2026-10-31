import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Sliders, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import api from '../../services/api';

const COLOR_PRESETS = [
  {
    name: 'Blue Studio (Default)',
    glow: 'from-blue-500/10 to-indigo-500/5',
    badge: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    name: 'Emerald Precision',
    glow: 'from-emerald-500/10 to-teal-500/5',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    name: 'Royal Purple',
    glow: 'from-purple-500/10 to-indigo-500/5',
    badge: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    name: 'Amber Glow',
    glow: 'from-amber-500/10 to-orange-500/5',
    badge: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    name: 'Crimson Rose',
    glow: 'from-rose-500/10 to-red-500/5',
    badge: 'bg-rose-50 text-rose-700 border-rose-200'
  }
];

export const HeroSlideFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('Exclusive Offer Going');
  const [price, setPrice] = useState('18,999.00');
  const [discount, setDiscount] = useState('SAVE 25%');
  const [buttonText, setButtonText] = useState('Buy Now');
  const [buttonLink, setButtonLink] = useState('Machines');
  const [imageUrl, setImageUrl] = useState('');
  const [glowColor, setGlowColor] = useState('from-blue-500/10 to-indigo-500/5');
  const [accentBadge, setAccentBadge] = useState('bg-blue-50 text-blue-700 border-blue-200');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isEdit) {
      fetchSlideDetails();
    }
  }, [id]);

  const fetchSlideDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/hero_slider.php');
      const allSlides = res.data.slides || [];
      const current = allSlides.find((s) => (s.id === parseInt(id) || s.id === id));

      if (current) {
        setTitle(current.title || '');
        setSubtitle(current.subtitle || '');
        setPrice(current.price || '');
        setDiscount(current.discount || '');
        setButtonText(current.button_text || '');
        setButtonLink(current.button_link || '');
        setImageUrl(current.image_url || '');
        setGlowColor(current.glow_color || 'from-blue-500/10 to-indigo-500/5');
        setAccentBadge(current.accent_badge || 'bg-blue-50 text-blue-700 border-blue-200');
        setDisplayOrder(current.display_order || 1);
        setIsActive(current.is_active);
      } else {
        setError('Hero slide banner not found.');
      }
    } catch (err) {
      console.error('Failed to load slide details:', err);
      setError('Failed to load slide details from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/admin/upload-image.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.full_url) {
        setImageUrl(res.data.full_url);
      } else if (res.data && res.data.url) {
        setImageUrl(res.data.url);
      }
    } catch (err) {
      alert('Failed to upload image: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!imageUrl) {
      setError('Please provide or upload a banner image or video.');
      return;
    }

    setSaving(true);
    try {
      const bannerTitle = title.trim() || `Banner #${displayOrder || 1}`;
      const payload = {
        action: isEdit ? 'update' : 'create',
        id: isEdit ? parseInt(id) : undefined,
        title: bannerTitle,
        subtitle: subtitle || 'Exclusive Offer',
        price: price || '0.00',
        discount: discount || '',
        button_text: buttonText || 'Shop Now',
        button_link: buttonLink || '/shop',
        image_url: imageUrl,
        glow_color: glowColor,
        accent_badge: accentBadge,
        display_order: parseInt(displayOrder) || 1,
        is_active: isActive
      };

      await api.post('/admin/hero_slider.php', payload);
      setSuccessMsg(isEdit ? 'Hero slide updated successfully!' : 'Hero slide created successfully!');

      // Redirect back to Hero Slider listing page after saving
      setTimeout(() => {
        navigate('/admin/hero-slider');
      }, 500);
    } catch (err) {
      console.error('Failed to save hero slide:', err);
      setError('Failed to save hero slide: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isEdit ? 'Edit Hero Slide' : 'Add New Hero Slide'}>
        <div className="flex flex-col items-center justify-center py-20 font-sans text-slate-500">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-xs font-semibold uppercase tracking-wider">Loading Hero Slide configuration...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? 'Edit Hero Slide' : 'Add New Hero Slide'}>
      <div className="max-w-4xl mx-auto space-y-6 font-sans">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/hero-slider"
              className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition-all shadow-xs"
              title="Back to Hero Slides Listing"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" /> {isEdit ? 'Edit Hero Banner' : 'Add New Hero Banner'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload or link pure image/video banners for the homepage hero carousel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/hero-slider')}
              className="bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Banner'}</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-3 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-emerald-700 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Hero Media Upload & URL */}
          <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" /> Banner Image or Video <span className="text-rose-500">*</span>
              </h3>
              <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                Supports JPG, PNG, WEBP, GIF & MP4, WEBM video
              </span>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-blue-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <span>📐</span> Recommended Banner Dimensions for Mobile & Desktop:
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                • <strong>Best Resolution:</strong> <strong>1920 × 600 px</strong> or <strong>2240 × 700 px</strong> (Aspect Ratio <strong>3.2:1</strong> / 16:5).<br />
                • <strong>Safe Zone Tip:</strong> Leave 15% margin on the left and right edges. Keep main headlines & product photos centered so they never get cropped on phones or tablets!
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Upload File or Enter Media URL <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 placeholder-slate-400"
                  placeholder="Paste direct URL (https://...) or click Upload Media..."
                />
                <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-blue-200 transition-colors flex-shrink-0">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Media (Image / Video)'}</span>
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={handleImageFileUpload} disabled={uploadingImage} />
                </label>
              </div>
            </div>

            {imageUrl ? (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Live Media Preview</p>
                  <span className="text-[11px] text-slate-500">
                    {/\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(imageUrl) ? 'Video Preview' : 'Image Preview'}
                  </span>
                </div>
                <div className="w-full aspect-[16/9] sm:aspect-[21/9] max-h-[380px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 relative shadow-sm flex items-center justify-center">
                  {/\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(imageUrl) ? (
                    <video src={imageUrl} controls autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                Upload a banner graphic or video to view live preview here.
              </div>
            )}
          </div>

          {/* Section 2: Banner Navigation Target & Settings */}
          <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-blue-600" /> Click Destination & Banner Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Click Destination Link
                </label>
                <input
                  type="text"
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  placeholder="e.g. /shop or Machines or /product/1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 placeholder-slate-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">Where the user is taken when clicking this banner</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Banner Name / Label <span className="text-slate-400 font-normal">(Optional, for your reference)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rotary Machine Banner"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display Order Position
                </label>
                <input
                  type="number"
                  min="1"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                />
                <p className="text-[10px] text-slate-400 mt-1">1 shows first, 2 shows second, etc.</p>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="is_active_form"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Publish banner immediately on Homepage
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Bottom Save Bar */}
          <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              {isEdit ? 'Update this banner in your homepage slider' : 'Add this new banner to your homepage slider'}
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/admin/hero-slider')}
                className="flex-1 sm:flex-none bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs px-5 py-2.5 rounded-xl border border-slate-200 shadow-2xs transition-all text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Banner'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
};
