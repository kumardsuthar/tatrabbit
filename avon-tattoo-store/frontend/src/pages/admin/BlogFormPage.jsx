import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  X,
  Sparkles
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../services/api';
import { cleanProductImageUrl } from '../../utils/imageUrl';

export const BlogFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Equipment Masterclass');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [author, setAuthor] = useState('TatRabbit Master Studio');
  const [readTime, setReadTime] = useState('5 min read');
  const [imageUrl, setImageUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  const fileInputRef = useRef(null);

  const standardCategories = [
    'Equipment Masterclass',
    'Technique Guides',
    'Studio Safety & Hygiene',
    'Ink Science & Chemistry',
    'Maintenance & Voltage Tuning'
  ];

  const slugify = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (val) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(slugify(val));
    }
  };

  useEffect(() => {
    if (isEdit) {
      fetchBlogDetails();
    }
  }, [id]);

  const fetchBlogDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/blogs/detail.php?id=${id}`);
      const b = res.data?.blog;
      if (b) {
        setTitle(b.title || '');
        setSlug(b.slug || slugify(b.title || ''));
        const cat = b.category || 'Equipment Masterclass';
        if (standardCategories.includes(cat)) {
          setCategory(cat);
          setIsCustomCategory(false);
        } else {
          setCategory('Custom');
          setCustomCategory(cat);
          setIsCustomCategory(true);
        }
        setAuthor(b.author || 'TatRabbit Master Studio');
        setReadTime(b.read_time || '5 min read');
        setImageUrl(cleanProductImageUrl(b.image_url || ''));
        setExcerpt(b.excerpt || '');
        setContent(b.content || '');
      } else {
        setError('Blog article not found.');
      }
    } catch (err) {
      console.error('Failed to load blog article details:', err);
      // Fallback try admin list
      try {
        const listRes = await api.get('/admin/blogs-list.php');
        const b = (listRes.data?.blogs || []).find((x) => String(x.id) === String(id));
        if (b) {
          setTitle(b.title || '');
          setSlug(b.slug || slugify(b.title || ''));
          setCategory(b.category || 'Equipment Masterclass');
          setAuthor(b.author || 'TatRabbit Master Studio');
          setReadTime(b.read_time || '5 min read');
          setImageUrl(cleanProductImageUrl(b.image_url || ''));
          setExcerpt(b.excerpt || '');
          setContent(b.content || '');
        } else {
          setError('Blog article not found.');
        }
      } catch (e) {
        setError('Failed to fetch blog details from server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
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
      } else {
        setError('Failed to upload image file.');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err.response?.data?.error || 'Failed to upload image from device.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    if (!title.trim()) {
      setError('Article title is required.');
      setSaving(false);
      return;
    }

    if (!content.trim() || content === '<p><br></p>') {
      setError('Article content is required.');
      setSaving(false);
      return;
    }

    const finalCategory = isCustomCategory ? (customCategory.trim() || 'Equipment Masterclass') : category;

    try {
      await api.post('/admin/blog-save.php', {
        id: isEdit ? id : undefined,
        title: title.trim(),
        category: finalCategory,
        author: author.trim() || 'TatRabbit Master Studio',
        read_time: readTime.trim() || '5 min read',
        image_url: imageUrl.trim(),
        excerpt: excerpt.trim(),
        content: content.trim()
      });

      setSuccessMsg(isEdit ? 'Article updated successfully!' : 'Article published successfully!');
      setTimeout(() => {
        navigate('/admin/blogs');
      }, 700);
    } catch (err) {
      console.error('Failed to save article:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save blog article.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit Blog Article' : 'Create Blog Article'}>
      <div className="w-full space-y-6 font-sans">
        
        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <Link
              to="/admin/blogs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors group mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Blog Articles</span>
            </Link>
            <h2 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>{isEdit ? 'Edit Blog Article' : 'Create New Blog Article'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {isEdit
                ? 'Update masterclass guide, technical specifications, voltage tuning charts, and hero image.'
                : 'Write and publish a new studio equipment guide or educational article for tattoo artists.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/blogs')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || loading || uploadingImage}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Article'}
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
            Loading article details...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Section 1: Basic Metadata */}
            <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-slate-900">
                  Article Details & Taxonomy
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Primary title, category, author attribution, and reading duration</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Article Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Rotary Pen Voltage Tuning: Perfecting Lining vs. Shading"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all placeholder-slate-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>URL Slug (Permalink)</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">Storefront URL: /blog/{slug || 'your-slug'}</span>
                  </label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl px-3.5 py-3 text-xs text-slate-500 font-mono select-none">
                      /blog/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      placeholder="e.g. rotary-pen-voltage-tuning"
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
                          setCategory('Equipment Masterclass');
                        }}
                        className="text-[10px] text-blue-600 font-semibold hover:underline"
                      >
                        Choose Preset Category
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(true);
                          setCustomCategory('');
                        }}
                        className="text-[10px] text-blue-600 font-semibold hover:underline"
                      >
                        + Custom Category
                      </button>
                    )}
                  </div>

                  {isCustomCategory ? (
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Type custom category name..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                    >
                      {standardCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Author / Studio
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="TatRabbit Master Studio"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Read Time
                    </label>
                    <input
                      type="text"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      placeholder="5 min read"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Section 2: Header Cover Image */}
            <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-slate-900">
                  Header Cover Image
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Upload a high-resolution banner image from your device or paste an image link</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <label className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Uploading Cover...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" /> Upload Image from PC
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>

                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider text-center sm:text-left">OR</span>

                  <div className="flex-1">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste cover image URL (e.g. https://... or uploaded image path)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all placeholder-slate-400"
                    />
                  </div>
                </div>

                {imageUrl && (
                  <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="w-24 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img 
                        src={cleanProductImageUrl(imageUrl)} 
                        alt="Article Cover" 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{imageUrl}</p>
                      <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3 h-3 text-blue-600" /> Active Cover Image
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Cover Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Summary / Excerpt */}
            <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-6 shadow-xs space-y-3">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-slate-900">
                  Article Summary / Excerpt (Optional)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Displayed on blog preview cards and search engines. Leave blank to auto-generate from content.</p>
              </div>

              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary snippet shown on cards..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all placeholder-slate-400"
              />
            </div>

            {/* Section 4: Full Article Content with Quill */}
            <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-slate-900">
                  Full Article Body (Rich Text) <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Detailed guide, voltage charts, techniques, and step-by-step instructions</p>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  placeholder="Write detailed tattoo masterclass guide, technique tips, voltage charts..."
                  modules={{
                    toolbar: [
                      [{ header: [2, 3, 4, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['blockquote', 'code-block'],
                      ['link', 'clean'],
                    ],
                  }}
                  style={{ minHeight: '380px' }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Supports headings, bold, italic, bullet points, numbered lists, blockquotes, code blocks, and hyperlinks.
              </p>
            </div>

            {/* Bottom Action Footer */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => navigate('/admin/blogs')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-5 py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || loading || uploadingImage}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Article'}
              </button>
            </div>

          </form>
        )}

      </div>
    </AdminLayout>
  );
};
