import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Plus, Check, Loader2, Package, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { cleanProductImageUrl } from '../../utils/imageUrl';

export const AddProductModal = ({ isOpen, onClose, onAddProduct, existingItems = [] }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/list.php?in_stock=1');
      setProducts(res.data?.products || []);
    } catch (err) {
      console.error('Failed to load products for order edit:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    );
  });

  const handleAdd = (product) => {
    const variantId = selectedVariants[product.id] || (product.variants?.length > 0 ? product.variants[0].id : null);
    const selectedVariant = product.variants?.find(v => v.id === Number(variantId)) || null;

    const regularPrice = selectedVariant ? parseFloat(selectedVariant.price || 0) : parseFloat(product.base_price || 0);
    const rawOffer = selectedVariant ? selectedVariant.offer_price : product.offer_price;
    const offerPrice = (rawOffer && parseFloat(rawOffer) > 0 && parseFloat(rawOffer) < regularPrice) ? parseFloat(rawOffer) : null;
    const price = offerPrice !== null ? offerPrice : regularPrice;

    onAddProduct({
      product_id: product.id,
      variant_id: variantId ? Number(variantId) : null,
      title: product.title,
      image_url: product.image_url,
      variant_name: selectedVariant ? selectedVariant.name : null,
      unit_price: price,
      quantity: 1,
      stock: selectedVariant ? selectedVariant.stock : product.stock
    });

    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 animate-fadeIn font-sans">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className="bg-white border border-slate-200 rounded-[2rem] max-w-2xl w-full p-6 sm:p-7 space-y-4 shadow-2xl relative z-[100000] flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-base text-slate-900">Add Equipment to Order</h3>
              <p className="text-[11px] text-slate-400">Select any machine, cartridge, or pigment to append to this order</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search equipment, needles, inks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[250px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
              <span>Loading studio catalog...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No matching in-stock equipment found.
            </div>
          ) : (
            filteredProducts.map(p => {
              const hasVariants = p.variants && p.variants.length > 0;
              const selectedVarId = selectedVariants[p.id] || (hasVariants ? p.variants[0].id : null);
              const activeVariant = hasVariants ? p.variants.find(v => v.id === Number(selectedVarId)) : null;
              const currentPrice = activeVariant ? (activeVariant.offer_price || activeVariant.price) : (p.offer_price || p.base_price);
              const isAdded = addedIds[p.id];

              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center flex-shrink-0">
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
                    <div className="min-w-0 text-left">
                      <h4 className="font-semibold text-xs text-slate-900 truncate">{p.title}</h4>
                      <p className="text-[11px] font-semibold text-blue-600">
                        ₹{parseFloat(currentPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      {hasVariants && (
                        <div className="mt-1">
                          <select
                            value={selectedVarId}
                            onChange={(e) => setSelectedVariants(prev => ({ ...prev, [p.id]: e.target.value }))}
                            className="text-[10px] bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-700 font-medium cursor-pointer"
                          >
                            {p.variants.map(v => (
                              <option key={v.id} value={v.id}>
                                {v.name} (₹{parseFloat(v.offer_price || v.price).toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdd(p)}
                    className={`flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all flex-shrink-0 ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
