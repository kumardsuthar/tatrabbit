import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, HelpCircle, Save, Layers, Image as ImageIcon, CheckCircle, AlertCircle, Package, Upload, X, Loader2, Star, ShieldCheck } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../services/api';
import { cleanProductImageUrl, handleImageError } from '../../utils/imageUrl';

export const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Machines');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [availableCategories, setAvailableCategories] = useState(['Machines', 'Needles', 'Inks', 'Power Supplies', 'Hygiene']);
  const [basePrice, setBasePrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [faqs, setFaqs] = useState([]);
  const [variants, setVariants] = useState([]);
  const [variantTitle, setVariantTitle] = useState('');
  const [warrantyText, setWarrantyText] = useState('');

  const slugify = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (val) => {
    setTitle(val);
    setSlug(slugify(val));
  };

  useEffect(() => {
    fetchAvailableCategories();
    if (isEdit) {
      fetchProductDetails();
    } else {
      setFaqs([
        { question: 'Is this compatible with standard cartridge grips?', answer: 'Yes, 100% universal Cheyenne membrane standard.' }
      ]);
      setVariants([
        { name: 'Standard / Matte Black', price: '', offer_price: '', stock: '', attributes: { color: 'Matte Black' } }
      ]);
    }
  }, [id]);

  const fetchAvailableCategories = async () => {
    try {
      const res = await api.get('/admin/categories.php');
      if (res.data && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
        const catNames = res.data.categories.map((c) => c.name);
        setAvailableCategories(catNames);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProductDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/products/detail.php?id=${id}`);
      const p = res.data.product;
      if (p) {
        setTitle(p.title || '');
        setSlug(p.slug || '');
        setIsSlugEdited(Boolean(p.slug));
        setDescription(p.description || '');
        setCategory(p.category || 'Machines');
        if (p.category) {
          setAvailableCategories((prev) => Array.from(new Set([...prev, p.category])).sort());
        }
        setBasePrice(p.base_price || '');
        setOfferPrice(p.offer_price || '');
        setStock(p.stock || '');
        setImageUrl(cleanProductImageUrl(p.image_url || ''));
        setGalleryImages((p.gallery_images || []).map((img) => cleanProductImageUrl(img)));
        setFaqs(p.faqs || []);
        setVariants(p.variants || []);
        setVariantTitle(p.variant_title || '');
        setWarrantyText(p.warranty_text || '');
      } else {
        setError('Equipment item not found.');
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError(err.response?.data?.error || 'Failed to load equipment details.');
    } finally {
      setLoading(false);
    }
  };

  // Upload Primary Cover Image
  const handlePrimaryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/admin/upload-image.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data && (res.data.full_url || res.data.url)) {
        setImageUrl(cleanProductImageUrl(res.data.full_url || res.data.url));
      }
    } catch (err) {
      console.error('Primary cover image upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload primary cover image from PC.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload Additional Gallery Images from PC
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingGallery(true);
    setError('');

    const newUploaded = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await api.post('/admin/upload-image.php', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data && (res.data.full_url || res.data.url)) {
          newUploaded.push(cleanProductImageUrl(res.data.full_url || res.data.url));
        }
      } catch (err) {
        console.error('Gallery image upload error:', err);
      }
    }

    if (newUploaded.length > 0) {
      setGalleryImages((prev) => [...prev, ...newUploaded]);
    } else {
      setError('Failed to upload gallery images.');
    }
    setUploadingGallery(false);
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    const url = newGalleryUrl.trim();
    setGalleryImages((prev) => [...prev, url]);
    setNewGalleryUrl('');
  };

  const removeGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Variant Handlers
  const addVariantRow = () => {
    setVariants([...variants, { name: '', price: basePrice || '', offer_price: offerPrice || '', stock: stock || '', attributes: {} }]);
  };

  const removeVariantRow = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  // FAQ Handlers
  const addFaqRow = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaqRow = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFaq = (index, field, value) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    if (!title.trim()) {
      setError('Equipment title is required.');
      setSaving(false);
      return;
    }

    const finalCategory = isCustomCategory && customCategory.trim() ? customCategory.trim() : category;

    const payload = {
      id: isEdit ? parseInt(id) : undefined,
      title,
      slug: slug.trim(),
      description,
      warranty_text: warrantyText.trim(),
      category: finalCategory || 'Machines',
      base_price: parseFloat(basePrice) || 0,
      offer_price: offerPrice !== '' && offerPrice !== null ? parseFloat(offerPrice) : null,
      stock: parseInt(stock) || 0,
      image_url: cleanProductImageUrl(imageUrl),
      gallery_images: galleryImages.map((img) => cleanProductImageUrl(img)),
      faqs: faqs.filter((f) => f.question.trim() !== ''),
      variants: variants.filter((v) => v.name.trim() !== ''),
      variant_title: variantTitle.trim()
    };

    try {
      if (isEdit) {
        await api.post('/products/update.php', payload);
        setSuccessMsg('Equipment updated successfully!');
      } else {
        await api.post('/products/create.php', payload);
        setSuccessMsg('New equipment created successfully!');
      }
      setTimeout(() => {
        navigate('/admin/inventory');
      }, 900);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save equipment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit Equipment' : 'Add New Equipment'}>
      <div className="max-w-6xl mx-auto space-y-6 font-sans pb-16">

        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <Link
              to="/admin/inventory"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Equipment Catalog
            </Link>
            <h1 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              {isEdit ? 'Edit Equipment Specifications' : 'Add New Equipment Item'}
            </h1>
            <p className="text-xs text-slate-500">
              {isEdit
                ? 'Update catalog details, primary cover, gallery images, regular price, offer price, variants, and FAQs.'
                : 'Create a new medical-grade tattoo machine, cartridge box, or studio supply item.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/inventory')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || loading || uploadingImage || uploadingGallery}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Equipment'}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-12 text-center text-slate-400 font-semibold text-xs">
            Loading equipment specification details...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Section 1: Basic Information */}
            <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-slate-900">
                  Basic Information & Pricing
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Primary title, studio category, base price, offer price, and inventory stock</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Equipment Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. TatRabbit Titan Wireless Rotary Pen Machine"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all placeholder-slate-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>URL Slug (Permalink) <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">Web URL address: /product/{slug || 'your-slug'}</span>
                  </label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl px-3.5 py-3 text-xs text-slate-500 font-mono select-none">
                      /product/
                    </span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                        setIsSlugEdited(true);
                      }}
                      placeholder="e.g. tatrabbit-titan-wireless-rotary-pen"
                      className="w-full bg-slate-50 border border-slate-200 rounded-r-xl px-4 py-3 text-xs font-semibold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Category <span className="text-red-500">*</span>
                    </label>
                    {isCustomCategory ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setCategory('Machines');
                        }}
                        className="text-[10px] text-blue-600 font-semibold hover:underline"
                      >
                        ← Select Existing Category
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(true);
                          setCustomCategory('');
                        }}
                        className="text-[10px] text-blue-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Create New Category
                      </button>
                    )}
                  </div>

                  {!isCustomCategory ? (
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === '__NEW_CUSTOM__') {
                          setIsCustomCategory(true);
                          setCustomCategory('');
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__NEW_CUSTOM__">+ Create Custom Category...</option>
                    </select>
                  ) : (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        required
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter new category name (e.g. Stencil & Transfer, Accessories...)"
                        className="w-full bg-white border border-blue-500 ring-2 ring-blue-500/10 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none transition-all placeholder-slate-400"
                      />
                      <p className="text-[10px] text-slate-500 font-medium">
                        This category will automatically appear in your catalog filters and Header Shop dropdown.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Base Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Base Price / Original MRP (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="e.g. 6676.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Offer / Special Discount Price (₹ Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="e.g. 5999.00 (Leave empty if no offer)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all placeholder-slate-400"
                  />
                </div>

                {/* Primary Cover Image Component (Main Image) */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Primary Cover Image (Always Main Image)
                  </label>
                  <p className="text-[11px] text-slate-400">This primary cover image is always displayed as the default main product photo.</p>

                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <label className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                        {uploadingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Uploading Cover...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" /> Upload Primary Cover from PC
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePrimaryUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>

                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">OR</span>

                      <div className="flex-1 w-full">
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="Paste primary cover image URL (e.g. https://...)"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                        />
                      </div>
                    </div>

                    {imageUrl && (
                      <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                        <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img src={cleanProductImageUrl(imageUrl)} alt="Product Main Cover" className="max-w-full max-h-full object-contain" onError={handleImageError} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{imageUrl}</p>
                          <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-500" /> Active Primary Cover Image
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Primary Cover"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Gallery Slider Images Section */}
                <div className="md:col-span-2 space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-4">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4" /> Additional Gallery Images (Slider)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Upload extra angles or detail shots for the storefront image slider</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className={`cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${uploadingGallery ? 'opacity-50 pointer-events-none' : ''}`}>
                        {uploadingGallery ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading Gallery...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-blue-600" /> Upload PC Gallery Photos
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryUpload}
                          className="hidden"
                          disabled={uploadingGallery}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      placeholder="Add gallery image URL..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      className="bg-blue-50 text-blue-700 font-semibold text-xs px-4 py-2 rounded-xl border border-blue-200 hover:bg-blue-100 transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add URL
                    </button>
                  </div>

                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                      {galleryImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl border border-slate-200 overflow-hidden bg-white p-1.5 shadow-xs transition-all">
                          <div className="aspect-square rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center relative">
                            <img src={cleanProductImageUrl(img)} alt={`Gallery ${idx + 1}`} className="max-w-full max-h-full object-contain" onError={handleImageError} />
                            
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                              <button
                                type="button"
                                onClick={() => setImageUrl(img)}
                                className="p-1.5 bg-amber-500 text-white rounded-lg text-[10px] font-semibold shadow-xs hover:bg-amber-600 transition-colors"
                                title="Set as Primary Cover Image"
                              >
                                <Star className="w-3.5 h-3.5 fill-white" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(idx)}
                                className="p-1.5 bg-red-600 text-white rounded-lg text-[10px] font-semibold shadow-xs hover:bg-red-700 transition-colors"
                                title="Delete Gallery Photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-1 text-center">
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Gallery #{idx + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
                      No extra gallery photos added. Click "Upload PC Gallery Photos" to add additional angles for the slider.
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Section 2: Technical Description */}
            <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-heading font-semibold text-xs text-slate-900 uppercase tracking-wider">
                  Technical Specifications & Description
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Motor parameters, stroke options, voltage output, and hygiene standards</p>
              </div>

              {/* Quill Rich Text Editor for Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rich Text Description (HTML)
                </label>
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <ReactQuill
                    theme="snow"
                    value={description}
                    onChange={setDescription}
                    placeholder="Engineered for precision lining and smooth shading. Includes a custom brushless motor..."
                    modules={{
                      toolbar: [
                        [{ header: [2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['clean'],
                      ],
                    }}
                    style={{ minHeight: '160px' }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Supports bold, italic, lists, and headings. This renders as styled HTML on the product page.</p>
              </div>

              {/* Warranty Text Field */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Warranty & Quality Badge Text
                </label>
                <input
                  type="text"
                  value={warrantyText}
                  onChange={(e) => setWarrantyText(e.target.value)}
                  placeholder="Leave empty to hide warranty badge, or e.g. 100% EO Gas Sterilized • 1-Year Master Tech Hardware Warranty"
                  className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all placeholder-slate-400"
                />
                <p className="text-[10px] text-slate-400 font-medium">Leave empty to not show any warranty badge on the product page. Use • to separate multiple claims.</p>
              </div>
            </div>

            {/* Section 3: Dynamic Product Variants */}
            <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-heading font-semibold text-xs text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" /> Equipment Variants & Sizes
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Define color, gauge size, configuration, regular price, offer price, and stock</p>
                </div>
                <button
                  type="button"
                  onClick={addVariantRow}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs px-3.5 py-2 rounded-xl border border-blue-200 transition-all flex items-center gap-1 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Variant Option
                </button>
              </div>

              {/* Custom Variant Title Override */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Custom Variant Section Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Default auto-adapts by category (e.g. Configuration / Stroke Length:)"
                  value={variantTitle}
                  onChange={(e) => setVariantTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400"
                />
                <p className="text-[10px] text-slate-400 font-medium">
                  Leave blank to auto-detect title based on Category (Machines → Configuration / Stroke Length:, Needles → Needle Gauge & Configuration:, Inks → Ink Shade & Volume Option:).
                </p>
              </div>

              {variants.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium border-2 border-dashed border-slate-200 rounded-2xl">
                  No variants created yet. Click "Add Variant Option" to configure gauge, stroke, or color variations.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3 px-3 text-[11px] font-semibold uppercase text-slate-400 tracking-wider hidden sm:grid">
                    <div className="col-span-5">Variant Name / Attribute</div>
                    <div className="col-span-2">Regular Price (₹)</div>
                    <div className="col-span-2">Offer Price (₹)</div>
                    <div className="col-span-2">Stock</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>

                  {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 items-center">
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-semibold text-slate-400 sm:hidden mb-1">Variant Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Matte Black / 4.0mm Heavy Liner"
                          value={v.name}
                          onChange={(e) => updateVariant(i, 'name', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-400 sm:hidden mb-1">Regular Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="899.00"
                          value={v.price}
                          onChange={(e) => updateVariant(i, 'price', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-400 sm:hidden mb-1">Offer Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="799.00 (Optional)"
                          value={v.offer_price || ''}
                          onChange={(e) => updateVariant(i, 'offer_price', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-400 sm:hidden mb-1">Stock</label>
                        <input
                          type="number"
                          placeholder="25"
                          value={v.stock}
                          onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                        />
                      </div>
                      <div className="sm:col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeVariantRow(i)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors inline-flex"
                          title="Remove Variant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: Dynamic FAQs */}
            <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-heading font-semibold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-blue-600" /> Equipment FAQs & Technical Support Notes
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Frequently asked questions shown on the product page and used by AI Chatbot</p>
                </div>
                <button
                  type="button"
                  onClick={addFaqRow}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" /> Add FAQ Item
                </button>
              </div>

              {faqs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium border-2 border-dashed border-slate-200 rounded-2xl">
                  No FAQs added. Click "Add FAQ Item" to supply technical answers for customer artists.
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <div key={i} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => removeFaqRow(i)}
                        className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Question #{i + 1}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Is it compatible with Cheyenne cartridges?"
                          value={faq.question}
                          onChange={(e) => updateFaq(i, 'question', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 text-slate-900 pr-10 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Answer
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Yes, features universal notch locking compatible with all standard safety membrane cartridges."
                          value={faq.answer}
                          onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Sticky Action Footer */}
            <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <Link
                to="/admin/inventory"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                ← Return without saving
              </Link>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/inventory')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || loading || uploadingImage || uploadingGallery}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Equipment'}
                </button>
              </div>
            </div>

          </form>
        )}
      </div>
    </AdminLayout>
  );
};
