import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  FolderPlus,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import api from '../../services/api';
import { cleanProductImageUrl } from '../../utils/imageUrl';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal States: Create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [uploadingCreateImage, setUploadingCreateImage] = useState(false);
  const [creating, setCreating] = useState(false);

  // Modal States: Edit
  const [editTarget, setEditTarget] = useState(null); // { id: 1, name: 'Inks', title: '...', description: '...', image_url: '...' }
  const [editCatName, setEditCatName] = useState('');
  const [editCatTitle, setEditCatTitle] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [editCatImage, setEditCatImage] = useState('');
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories.php');
      if (res.data && res.data.categories) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, setImageState, setUploadingState) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingState(true);
    try {
      const res = await api.post('/admin/upload-image.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.full_url) {
        setImageState(res.data.full_url);
      } else if (res.data && res.data.url) {
        setImageState(res.data.url);
      }
    } catch (err) {
      alert('Failed to upload image: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingState(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCreating(true);
    setError('');
    setSuccessMsg('');

    try {
      await api.post('/admin/categories.php', {
        action: 'create',
        name: newCatName.trim(),
        title: newCatTitle.trim(),
        description: newCatDesc.trim(),
        image_url: newCatImage.trim() || ''
      });
      setSuccessMsg(`Category "${newCatName.trim()}" created successfully!`);
      setNewCatName('');
      setNewCatTitle('');
      setNewCatDesc('');
      setNewCatImage('');
      setIsCreateOpen(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editTarget || !editCatName.trim()) return;
    setRenaming(true);
    setError('');
    setSuccessMsg('');

    try {
      await api.post('/admin/categories.php', {
        action: 'update',
        id: editTarget.id || undefined,
        old_name: editTarget.name,
        name: editCatName.trim(),
        title: editCatTitle.trim(),
        description: editCatDesc.trim(),
        image_url: editCatImage.trim()
      });
      setSuccessMsg(`Category "${editCatName.trim()}" updated successfully!`);
      setEditTarget(null);
      setEditCatName('');
      setEditCatTitle('');
      setEditCatDesc('');
      setEditCatImage('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update category');
    } finally {
      setRenaming(false);
    }
  };

  const handleDeleteCategory = async (catName, catId) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"? Products in this category will be updated to Uncategorized.`)) return;

    setError('');
    setSuccessMsg('');
    try {
      await api.post('/admin/categories.php', {
        action: 'delete',
        id: catId || undefined,
        name: catName
      });
      setSuccessMsg(`Category "${catName}" deleted!`);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete category');
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const totalProductsCount = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.count || 0), 0);
  }, [categories]);

  return (
    <AdminLayout title="Product Categories Management">
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              Product Categories Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload custom category icons & images to customize storefront homepage sliders and store navigation
            </p>
          </div>
          <button
            onClick={() => {
              setNewCatName('');
              setNewCatTitle('');
              setNewCatDesc('');
              setNewCatImage('');
              setIsCreateOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <FolderPlus className="w-4 h-4" /> Create New Category
          </button>
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
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Categories</p>
              <h3 className="font-heading font-bold text-lg text-slate-900">{categories.length}</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Products</p>
              <h3 className="font-heading font-bold text-lg text-slate-900">{totalProductsCount} Items</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Homepage Slider</p>
              <h3 className="font-heading font-bold text-lg text-slate-900">Live Dynamic</h3>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category name..."
            className="w-full bg-transparent text-xs text-slate-900 font-medium focus:outline-none placeholder-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Table */}
        {loading ? (
          <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-12 text-center text-slate-400 text-xs font-semibold space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            <p>Loading catalog categories & uploaded images...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-12 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-semibold text-slate-800 text-sm">No Categories Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery ? 'No category matched your search query.' : 'No categories available yet. Create your first category above.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-[1.8rem] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Category Image & Name</th>
                    <th className="py-3.5 px-4">Catalog Products</th>
                    <th className="py-3.5 px-4">Homepage Display</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          {cleanProductImageUrl(cat.image_url) ? (
                            <img
                              src={cleanProductImageUrl(cat.image_url)}
                              alt={cat.name}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0 shadow-2xs"
                              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                            />
                          ) : null}
                          <div className={`${cleanProductImageUrl(cat.image_url) ? 'hidden' : 'flex'} w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300 flex-shrink-0`}>
                            <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{cat.name}</p>
                            {cat.title && (
                              <p className="text-[11px] text-blue-600 font-medium line-clamp-1 mt-0.5">
                                Shop Title: {cat.title}
                              </p>
                            )}
                            {cat.description && (
                              <p className="text-[10px] text-slate-400 font-normal line-clamp-1 mt-0.5 max-w-xs">
                                {cat.description}
                              </p>
                            )}
                            {cat.is_default && !cat.title && (
                              <span className="text-[9px] text-slate-400 font-medium">Default Catalog Category</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          to={`/shop?category=${encodeURIComponent(cat.name)}`}
                          className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-blue-600" />
                          {cat.count} equipment item{cat.count !== 1 ? 's' : ''}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live in Homepage Slider
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditTarget(cat);
                            setEditCatName(cat.name);
                            setEditCatTitle(cat.title || '');
                            setEditCatDesc(cat.description || '');
                            setEditCatImage(cat.image_url || '');
                          }}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Category & Image"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteCategory(cat.name, cat.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Create Category */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
            <div className="bg-white border border-slate-200 rounded-[1.8rem] p-6 max-w-md w-full shadow-2xl space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-heading font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-blue-600" /> Create Custom Category
                </h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Stencil & Transfer, Accessories"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Shop Page Banner Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCatTitle}
                    onChange={(e) => setNewCatTitle(e.target.value)}
                    placeholder="e.g. Rotary Tattoo Machines & Pens"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Displays as the banner heading when customers browse this category on the Shop page.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Shop Page Banner Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="e.g. Explore our premium collection of wireless rotary pen machines engineered for precision lining and smooth shading..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-normal text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 resize-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Displays as the banner description under the heading on the Shop page.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category Banner / Icon Image
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCatImage}
                        onChange={(e) => setNewCatImage(e.target.value)}
                        placeholder="Paste image URL (https://...) or upload file..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400"
                      />
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 transition-colors flex-shrink-0">
                        <Upload className="w-3.5 h-3.5 text-slate-600" />
                        <span>{uploadingCreateImage ? 'Uploading...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, setNewCatImage, setUploadingCreateImage)}
                          disabled={uploadingCreateImage}
                        />
                      </label>
                    </div>

                    {newCatImage && (
                      <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <img
                          src={newCatImage}
                          alt="Preview"
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-2xs"
                        />
                        <p className="text-[10px] text-slate-500 font-medium">
                          Preview image for homepage category circles & store slider
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newCatName.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit / Rename Category */}
        {editTarget && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
            <div className="bg-white border border-slate-200 rounded-[1.8rem] p-6 max-w-md w-full shadow-2xl space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-heading font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-600" /> Edit Category & Image
                </h3>
                <button
                  onClick={() => setEditTarget(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Shop Page Banner Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={editCatTitle}
                    onChange={(e) => setEditCatTitle(e.target.value)}
                    placeholder="e.g. Rotary Tattoo Machines & Pens"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Displays as the banner heading when customers browse this category on the Shop page.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Shop Page Banner Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={editCatDesc}
                    onChange={(e) => setEditCatDesc(e.target.value)}
                    placeholder="e.g. Explore our premium collection of wireless rotary pen machines engineered for precision lining and smooth shading..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-normal text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 resize-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Displays as the banner description under the heading on the Shop page.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category Image URL or File Upload
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editCatImage}
                        onChange={(e) => setEditCatImage(e.target.value)}
                        placeholder="Paste image URL (https://...) or upload file..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400"
                      />
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 transition-colors flex-shrink-0">
                        <Upload className="w-3.5 h-3.5 text-slate-600" />
                        <span>{uploadingEditImage ? 'Uploading...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, setEditCatImage, setUploadingEditImage)}
                          disabled={uploadingEditImage}
                        />
                      </label>
                    </div>

                    {editCatImage && (
                      <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <img
                          src={editCatImage}
                          alt="Preview"
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-2xs"
                        />
                        <p className="text-[10px] text-slate-500 font-medium">
                          Updated image will show on live homepage category circles
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditTarget(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={renaming || !editCatName.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
                  >
                    {renaming ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
