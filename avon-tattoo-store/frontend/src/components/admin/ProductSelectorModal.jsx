import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import {
  Search,
  CheckSquare,
  Square,
  X,
  Package,
  Filter,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { cleanProductImageUrl } from '../../utils/imageUrl';

export const ProductSelectorModal = ({
  isOpen,
  onClose,
  selectedProductIds = [],
  onApply,
  singleSelect = false,
  title = "Select Showcase Products",
  subtitle = "Choose the equipment items to highlight in the dynamic home catalog section."
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(selectedProductIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedIds(selectedProductIds || []);
      fetchProducts();
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, selectedProductIds]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/list.php');
      if (res.data && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load products for selector:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter products by category and search query
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleProduct = (id) => {
    if (singleSelect) {
      setSelectedIds((prev) => (prev.includes(id) ? [] : [id]));
      return;
    }
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (singleSelect) return;
    const currentFilteredIds = filteredProducts.map((p) => p.id);
    const allSelected = currentFilteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      // Remove current filtered IDs
      setSelectedIds((prev) => prev.filter((id) => !currentFilteredIds.includes(id)));
    } else {
      // Add all current filtered IDs
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  const handleConfirm = () => {
    const selectedProduct = products.find((p) => p.id === selectedIds[0]) || null;
    onApply(selectedIds, selectedProduct);
    onClose();
  };

  const categoriesList = ['All', 'Machines', 'Needles', 'Inks', 'Power Supplies'];

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 font-sans animate-fadeIn"
      style={{ top: 0, right: 0, bottom: 0, left: 0, margin: 0, marginTop: 0 }}
    >
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        style={{ top: 0, right: 0, bottom: 0, left: 0, margin: 0, marginTop: 0 }}
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden relative z-[100000] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Package className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-heading font-semibold text-sm text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3.5 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Real-Time Search Bar */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 text-slate-700"
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Count & Bulk Select Bar */}
        <div className="px-5 py-2 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-blue-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>
              {singleSelect
                ? (selectedIds.length > 0 ? '1 Product Selected' : 'Please select a product')
                : `${selectedIds.length} Products Currently Selected`}
            </span>
          </span>

          {!singleSelect && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-blue-700 font-semibold hover:underline text-xs"
            >
              Toggle Select Filtered ({filteredProducts.length})
            </button>
          )}
        </div>

        {/* Product List Content Container */}
        <div className="p-3.5 flex-1 overflow-y-auto space-y-2 min-h-[300px]">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-400">Loading catalog inventory...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-500">No products match your search or filter.</p>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isChecked = selectedIds.includes(p.id);
              const pImg = cleanProductImageUrl(p.image_url);

              return (
                <div
                  key={p.id}
                  onClick={() => handleToggleProduct(p.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-blue-50/50 border-blue-500 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button type="button" className="text-blue-600 flex-shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>

                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 flex items-center justify-center">
                      {pImg ? (
                        <img
                          src={pImg}
                          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                          alt={p.title}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : null}
                      <div className={`${pImg ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-slate-300`}>
                        <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-heading font-semibold text-xs text-slate-900 truncate">
                        {p.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {p.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Stock: {p.stock}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-heading font-semibold text-xs text-slate-900 block">
                      ₹{parseFloat(p.base_price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-xs transition-all hover:scale-105"
          >
            Apply Selection ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductSelectorModal;
