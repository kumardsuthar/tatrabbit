import React, { useState, useEffect } from 'react';
import { Plus, Trash2, HelpCircle, Upload, CheckCircle, X, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import api from '../../services/api';

export const ProductFormModal = ({ isOpen, onClose, product = null, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Machines');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [availableCategories, setAvailableCategories] = useState(['Machines', 'Needles', 'Inks', 'Power Supplies', 'Hygiene']);
  const [basePrice, setBasePrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Dynamic FAQs Array
  const [faqs, setFaqs] = useState([]);

  // Dynamic Variants Array
  const [variants, setVariants] = useState([]);
  const [variantTitle, setVariantTitle] = useState('');

  const slugify = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (val) => {
    setTitle(val);
    setSlug(slugify(val));
  };

  const fetchAvailableCategories = async () => {
    try {
      const res = await api.get('/products/list.php');
      if (res.data && res.data.categories) {
        const dbCats = res.data.categories
          .map((c) => c.category)
          .filter((c) => c && c !== 'All');
        const defaultCats = ['Machines', 'Needles', 'Inks', 'Power Supplies', 'Hygiene'];
        const merged = Array.from(new Set([...defaultCats, ...dbCats])).sort();
        setAvailableCategories(merged);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAvailableCategories();
    }
    if (product) {
      setTitle(product.title || '');
      setSlug(product.slug || '');
      setIsSlugEdited(Boolean(product.slug));
      setDescription(product.description || '');
      setCategory(product.category || 'Machines');
      if (product.category) {
        setAvailableCategories((prev) => Array.from(new Set([...prev, product.category])).sort());
      }
      setBasePrice(product.base_price || '');
      setStock(product.stock || '');
      setImageUrl(product.image_url || '');
      setFaqs(product.faqs || []);
      setVariants(product.variants || []);
      setVariantTitle(product.variant_title || '');
    } else {
      setTitle('');
      setSlug('');
      setIsSlugEdited(false);
      setDescription('');
      setCategory('Machines');
      setCustomCategory('');
      setIsCustomCategory(false);
      setBasePrice('');
      setStock('');
      setImageUrl('');
      setVariantTitle('');
      setFaqs([
        { question: 'Is this compatible with standard cartridge grips?', answer: 'Yes, 100% universal Cheyenne membrane standard.' }
      ]);
      setVariants([
        { name: 'Standard / Matte Black', price: '', stock: '', attributes: { color: 'Matte Black' } }
      ]);
    }
  }, [product, isOpen]);

  // Upload image from PC
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/admin/upload-image.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data && (res.data.full_url || res.data.url)) {
        setImageUrl(res.data.full_url || res.data.url);
      }
    } catch (err) {
      alert('Image upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingImage(false);
    }
  };

  // Variant Builder Handlers
  const addVariantRow = () => {
    setVariants([...variants, { name: '', price: basePrice || '', stock: stock || '', attributes: {} }]);
  };

  const removeVariantRow = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  // FAQ Builder Handlers
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
    setLoading(true);

    const finalCategory = isCustomCategory && customCategory.trim() ? customCategory.trim() : category;

    const payload = {
      id: product?.id,
      title,
      slug: slug.trim(),
      description,
      category: finalCategory || 'Machines',
      base_price: parseFloat(basePrice),
      stock: parseInt(stock),
      image_url: imageUrl,
      faqs,
      variants,
      variant_title: variantTitle.trim()
    };

    try {
      if (product) {
        await api.post('/products/update.php', payload);
      } else {
        await api.post('/products/create.php', payload);
      }
      onClose();
      if (onSaved) onSaved();
    } catch (err) {
      alert('Failed to save product: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Equipment Item' : 'Add New Equipment'} maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6 font-sans">
        
        {/* Core Product Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Equipment Title" required value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. TatRabbit Rotary Wireless Pen" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>URL Slug (Permalink) <span className="text-red-500">*</span></span>
              <span className="text-[10px] text-slate-400 font-normal lowercase">Web address: /product/{slug || 'your-slug'}</span>
            </label>
            <div className="flex items-center">
              <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl px-3.5 py-2.5 text-xs text-slate-500 font-mono select-none">
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
                placeholder="e.g. tatrabbit-rotary-wireless-pen"
                className="w-full bg-slate-50 border border-slate-200 rounded-r-xl px-4 py-2.5 text-xs font-semibold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all placeholder-slate-400"
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Category
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
                  ← Existing Category
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
                  <Plus className="w-3 h-3" /> Create Category
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__NEW_CUSTOM__">+ Create Custom Category...</option>
              </select>
            ) : (
              <input
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter new category name..."
                className="w-full bg-white border border-blue-500 ring-2 ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none transition-all placeholder-slate-400"
              />
            )}
          </div>

          <Input label="Base Price (₹ INR)" type="number" step="0.01" required value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="18999.00" />
          <Input label="Base Stock Quantity" type="number" required value={stock} onChange={(e) => setStock(e.target.value)} placeholder="50" />
        </div>

        {/* Image Upload Component */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Equipment Image
          </label>

          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" /> Upload Image from PC
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>

              <span className="text-xs text-slate-400 font-semibold uppercase">OR</span>

              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste image web URL..."
                className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
              />
            </div>

            {imageUrl && (
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{imageUrl}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Image attached
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Technical Description & Specs
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all placeholder-slate-400"
            placeholder="Detailed motor specs, needle housing material, voltage rating..."
          />
        </div>

        {/* Dynamic JSON Variants Builder Section */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Dynamic Variants & Sizes (Gauges / Colors / Strokes)
            </h4>
            <Button type="button" size="sm" variant="outline" onClick={addVariantRow}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Variant Option
            </Button>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Custom Variant Section Title (Optional)
            </label>
            <input
              type="text"
              placeholder="Default auto-adapts by category (e.g. Configuration / Stroke Length:)"
              value={variantTitle}
              onChange={(e) => setVariantTitle(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400"
            />
            <p className="text-[10px] text-slate-400 font-normal">
              Leave blank to auto-detect title based on Category.
            </p>
          </div>

          <div className="space-y-2.5">
            {variants.map((v, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <input
                  type="text"
                  placeholder="Variant Name (e.g. #10 05RL)"
                  value={v.name}
                  onChange={(e) => updateVariant(i, 'name', e.target.value)}
                  className="flex-1 bg-white border border-slate-200 text-xs font-semibold rounded-xl p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={v.price}
                  onChange={(e) => updateVariant(i, 'price', e.target.value)}
                  className="w-24 bg-white border border-slate-200 text-xs font-semibold rounded-xl p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                  className="w-20 bg-white border border-slate-200 text-xs font-semibold rounded-xl p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                />
                <button
                  type="button"
                  onClick={() => removeVariantRow(i)}
                  className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic FAQ Builder Section */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> Product FAQs
            </h4>
            <Button type="button" size="sm" variant="outline" onClick={addFaqRow}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add FAQ
            </Button>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2 relative">
                <button
                  type="button"
                  onClick={() => removeFaqRow(i)}
                  className="absolute top-2.5 right-2.5 text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Question (e.g. Is it compatible with Cheyenne?)"
                  value={faq.question}
                  onChange={(e) => updateFaq(i, 'question', e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-xl p-2 text-slate-900 pr-8 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                />
                <textarea
                  rows={2}
                  placeholder="Answer..."
                  value={faq.answer}
                  onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs font-semibold rounded-xl p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={loading} variant="primary">
            {product ? 'Save Changes' : 'Create Equipment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
