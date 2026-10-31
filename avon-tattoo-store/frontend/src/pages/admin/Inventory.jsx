import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Layers, Search, Filter, X, RotateCcw, SlidersHorizontal, PackageX, ArrowUpDown, Image as ImageIcon } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import api from '../../services/api';
import { cleanProductImageUrl, handleImageError } from '../../utils/imageUrl';

export const Inventory = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/list.php');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    navigate('/admin/inventory/new');
  };

  const handleEditClick = (product) => {
    navigate(`/admin/inventory/edit/${product.id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment item and its variants?')) return;
    try {
      await api.post('/products/delete.php', { id });
      fetchInventory();
    } catch (err) {
      alert('Failed to delete product: ' + (err.response?.data?.error || err.message));
    }
  };

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          !searchQuery ||
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.slug?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'ALL' || p.category === selectedCategory;

        let matchesStock = true;
        const stockNum = Number(p.stock) || 0;
        if (stockFilter === 'IN_STOCK') {
          matchesStock = stockNum >= 10;
        } else if (stockFilter === 'LOW_STOCK') {
          matchesStock = stockNum > 0 && stockNum < 10;
        } else if (stockFilter === 'OUT_OF_STOCK') {
          matchesStock = stockNum === 0;
        }

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'TITLE_ASC') return a.title.localeCompare(b.title);
        if (sortBy === 'TITLE_DESC') return b.title.localeCompare(a.title);
        if (sortBy === 'PRICE_ASC') return parseFloat(a.base_price) - parseFloat(b.base_price);
        if (sortBy === 'PRICE_DESC') return parseFloat(b.base_price) - parseFloat(a.base_price);
        if (sortBy === 'STOCK_ASC') return (Number(a.stock) || 0) - (Number(b.stock) || 0);
        if (sortBy === 'STOCK_DESC') return (Number(b.stock) || 0) - (Number(a.stock) || 0);
        return 0;
      });
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy]);

  const hasActiveFilters =
    searchQuery !== '' || selectedCategory !== 'ALL' || stockFilter !== 'ALL' || sortBy !== 'DEFAULT';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setStockFilter('ALL');
    setSortBy('DEFAULT');
  };

  return (
    <AdminLayout title="Inventory & Equipment Management">
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="font-heading font-semibold text-base text-slate-900">Equipment Catalog</h2>
            <p className="text-xs text-slate-500 mt-0.5">Add, edit, build variants, and update stock counts</p>
          </div>
          <button
            onClick={handleAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Equipment
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search equipment by title or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Select Dropdowns */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              {/* Category Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent focus:outline-none font-medium cursor-pointer text-xs pr-1"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="bg-transparent focus:outline-none font-medium cursor-pointer text-xs pr-1"
                >
                  <option value="ALL">All Stock Status</option>
                  <option value="IN_STOCK">In Stock (10+)</option>
                  <option value="LOW_STOCK">Low Stock (&lt;10)</option>
                  <option value="OUT_OF_STOCK">Out of Stock (0)</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent focus:outline-none font-medium cursor-pointer text-xs pr-1"
                >
                  <option value="DEFAULT">Sort By: Default</option>
                  <option value="TITLE_ASC">Title: A to Z</option>
                  <option value="TITLE_DESC">Title: Z to A</option>
                  <option value="PRICE_ASC">Price: Low to High</option>
                  <option value="PRICE_DESC">Price: High to Low</option>
                  <option value="STOCK_ASC">Stock: Low to High</option>
                  <option value="STOCK_DESC">Stock: High to Low</option>
                </select>
              </div>

              {/* Reset Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-all"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>
              Showing <strong className="text-slate-800 font-semibold">{filteredProducts.length}</strong> of{' '}
              <strong className="text-slate-800 font-semibold">{products.length}</strong> equipment items
            </span>
            {hasActiveFilters && (
              <span className="text-blue-600 font-medium">Filtered results applied</span>
            )}
          </div>
        </div>

        {/* Catalog Table / Loading / Empty state */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading inventory catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-12 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <PackageX className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-semibold text-slate-800 text-sm">No equipment found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No items matched your current search and filter criteria. Try adjusting or clearing your filters.'
                : 'No equipment items available in the inventory.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs rounded-xl transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-[1.8rem] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Equipment Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Base Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Variants Count</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center flex-shrink-0">
                            {cleanProductImageUrl(p.image_url) ? (
                              <img
                                src={cleanProductImageUrl(p.image_url)}
                                alt={p.title}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                              />
                            ) : null}
                            <div className={`${cleanProductImageUrl(p.image_url) ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-slate-300`}>
                              <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">{p.title}</p>
                            <p className="text-[10px] text-slate-400 font-mono">slug: {p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-blue-600">{p.category}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 font-heading">
                        ₹{parseFloat(p.base_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-mono font-semibold px-2.5 py-0.5 rounded-full text-[10px] ${
                          p.stock == 0
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : p.stock < 10
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {p.stock} in stock
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                          <Layers className="w-3 h-3 text-blue-600" /> {p.variants?.length || 0} variants
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Equipment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Equipment"
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
      </div>
    </AdminLayout>
  );
};
