import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Tag,
  Plus,
  Search,
  Percent,
  DollarSign,
  Package,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Copy,
  Check,
  Filter,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProductSelectorModal } from '../../components/admin/ProductSelectorModal';
import api from '../../services/api';
import { cleanProductImageUrl } from '../../utils/imageUrl';

export const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('percentage'); // 'percentage' or 'price'
  const [discountValue, setDiscountValue] = useState('');
  const [targetType, setTargetType] = useState('product'); // 'all' or 'product'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Product Selector Modal State
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/coupons.php');
      if (res.data && Array.isArray(res.data.coupons)) {
        setCoupons(res.data.coupons);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setCode('');
    setTitle('');
    setType('percentage');
    setDiscountValue('');
    setTargetType('product');
    setSelectedProduct(null);
    setMinOrderAmount('');
    setExpiryDate('');
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c) => {
    setIsEditing(true);
    setCurrentId(c.id);
    setCode(c.code);
    setTitle(c.title || '');
    setType(c.type || 'percentage');
    setDiscountValue(c.discount_value);
    setTargetType(c.product_id ? 'product' : 'all');
    setSelectedProduct(
      c.product_id
        ? {
            id: c.product_id,
            title: c.product_title || 'Selected Product',
            image_url: c.product_image || ''
          }
        : null
    );
    setMinOrderAmount(c.min_order_amount && c.min_order_amount > 0 ? c.min_order_amount : '');
    setExpiryDate(c.expiry_date || '');
    setIsActive(parseInt(c.is_active) === 1);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await api.post('/admin/coupons.php', {
        action: 'toggle',
        id: id
      });
      if (res.data && res.data.status === 'success') {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_active: c.is_active == 1 ? 0 : 1 } : c))
        );
      }
    } catch (err) {
      console.error('Failed to toggle coupon status:', err);
    }
  };

  const handleDeleteCoupon = async (id, couponCode) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) return;
    try {
      await api.delete(`/admin/coupons.php?id=${id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      alert('Failed to delete coupon. Please try again.');
    }
  };

  const handleCopyCode = (couponCode) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(couponCode);
      setCopiedCode(couponCode);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setFormError('Please enter a coupon code.');
      return;
    }

    const numVal = parseFloat(discountValue);
    if (isNaN(numVal) || numVal <= 0) {
      setFormError('Please enter a valid discount value greater than 0.');
      return;
    }

    if (type === 'percentage' && numVal > 100) {
      setFormError('Percentage discount cannot exceed 100%.');
      return;
    }

    if (targetType === 'product' && !selectedProduct) {
      setFormError('Please select a particular product for this coupon.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: isEditing ? currentId : null,
        code: trimmedCode,
        title: title.trim(),
        type: type,
        discount_value: numVal,
        product_id: targetType === 'product' && selectedProduct ? selectedProduct.id : null,
        product_title: targetType === 'product' && selectedProduct ? selectedProduct.title : '',
        product_image: targetType === 'product' && selectedProduct ? (selectedProduct.image_url || '') : '',
        min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
        expiry_date: expiryDate || null,
        is_active: isActive ? 1 : 0
      };

      const res = await api.post('/admin/coupons.php', payload);
      if (res.data && res.data.status === 'success') {
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        setFormError(res.data.error || 'Failed to save coupon.');
      }
    } catch (err) {
      console.error('Error saving coupon:', err);
      setFormError(err.response?.data?.error || 'Failed to save coupon. Please check code uniqueness.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered List
  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.product_title && c.product_title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'percentage' && c.type === 'percentage') ||
      (typeFilter === 'price' && c.type === 'price') ||
      (typeFilter === 'active' && parseInt(c.is_active) === 1) ||
      (typeFilter === 'inactive' && parseInt(c.is_active) === 0);

    return matchesSearch && matchesType;
  });

  const totalCoupons = coupons.length;
  const activeCount = coupons.filter((c) => parseInt(c.is_active) === 1).length;
  const percentageCount = coupons.filter((c) => c.type === 'percentage').length;
  const priceCount = coupons.filter((c) => c.type === 'price').length;

  return (
    <AdminLayout title="Product Coupons">
      <div className="space-y-6 font-sans">
        
        {/* Page Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" /> Product Discount Coupons
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create product-specific percentage or price discounts with instant coupon application.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Coupons</span>
            <p className="text-2xl font-heading font-bold text-slate-900 mt-1">{totalCoupons}</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active Coupons
            </span>
            <p className="text-2xl font-heading font-bold text-slate-900 mt-1">{activeCount}</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" /> % Percentage Offers
            </span>
            <p className="text-2xl font-heading font-bold text-slate-900 mt-1">{percentageCount}</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Flat Price (₹) Offers
            </span>
            <p className="text-2xl font-heading font-bold text-slate-900 mt-1">{priceCount}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code, title, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'all', label: 'All Coupons' },
              { key: 'percentage', label: '% Percentage' },
              { key: 'price', label: '₹ Flat Price' },
              { key: 'active', label: 'Active' },
              { key: 'inactive', label: 'Inactive' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  typeFilter === tab.key
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount Type & Value</th>
                  <th className="py-3 px-4">Applicable Product</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 font-semibold">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading coupons...
                    </td>
                  </tr>
                ) : filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">No coupons found.</p>
                      <p className="text-[11px] mt-0.5">Click "Create Coupon" above to set up a new product offer.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((c) => {
                    const isPct = c.type === 'percentage';
                    const active = parseInt(c.is_active) === 1;
                    const cleanImg = cleanProductImageUrl(c.product_image);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Coupon Code */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg tracking-wider text-slate-900 font-bold">
                              {c.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(c.code)}
                              className="text-slate-400 hover:text-blue-600 p-1 transition-colors"
                              title="Copy code"
                            >
                              {copiedCode === c.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {c.title && (
                            <p className="text-[11px] text-slate-500 font-normal mt-0.5 max-w-xs truncate">
                              {c.title}
                            </p>
                          )}
                        </td>

                        {/* Type & Value */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                              isPct
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {isPct ? <Percent className="w-3 h-3" /> : '₹'}
                            <span>{isPct ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}</span>
                          </span>
                          {c.min_order_amount > 0 && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              Min spend: ₹{c.min_order_amount}
                            </p>
                          )}
                        </td>

                        {/* Applicable Product */}
                        <td className="py-3.5 px-4">
                          {c.product_id ? (
                            <div className="flex items-center gap-2.5 max-w-xs">
                              {cleanImg ? (
                                <img
                                  src={cleanImg}
                                  alt={c.product_title}
                                  className="w-9 h-9 rounded-lg object-contain bg-slate-50 border border-slate-200 shrink-0 p-1"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 text-xs truncate" title={c.product_title}>
                                  {c.product_title || `Product #${c.product_id}`}
                                </p>
                                <span className="inline-block text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                                  Specific Product
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                              <Sparkles className="w-3 h-3 text-amber-500" /> All Store Products
                            </span>
                          )}
                        </td>

                        {/* Expiry */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {c.expiry_date ? (
                            <span className="flex items-center gap-1 text-slate-600 text-[11px]">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(c.expiry_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No Expiration</span>
                          )}
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(c.id)}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border transition-all ${
                              active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {active ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(c)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Coupon"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCoupon(c.id, c.code)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CREATE / EDIT COUPON MODAL */}
        {/* ------------------------------------------------------------- */}
        {isModalOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-fadeIn my-auto">
              
              {/* Modal Header */}
              <div className="px-5 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-sm text-slate-900 leading-tight">
                      {isEditing ? 'Edit Product Coupon' : 'Create New Product Coupon'}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Configure coupon code, % or price value, and target product.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmitForm} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1 text-xs">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Coupon Code & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 flex items-center gap-1">
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ROTARY20"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full uppercase font-mono font-bold tracking-wider px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900"
                    />
                    <p className="text-[10px] text-slate-400">Uppercase letters & numbers only</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Offer Title / Description</label>
                    <input
                      type="text"
                      placeholder="e.g. 20% Off Wireless Rotary Pen"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900"
                    />
                    <p className="text-[10px] text-slate-400">Displayed as offer badge on product page</p>
                  </div>
                </div>

                {/* Coupon Type: % or Flat Price */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Coupon Discount Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setType('percentage')}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                        type === 'percentage'
                          ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-2xs font-semibold'
                          : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        type === 'percentage' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <Percent className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">% Percentage Discount</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">e.g. 10%, 20% off price</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setType('price')}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                        type === 'price'
                          ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-2xs font-semibold'
                          : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        type === 'price' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <span className="font-bold text-xs">₹</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">₹ Flat Price Off</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">e.g. ₹500 fixed deduction</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Discount Value */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center justify-between">
                    <span>Discount Value <span className="text-red-500">*</span></span>
                    <span className="text-[11px] font-normal text-slate-400">
                      {type === 'percentage' ? 'Value between 1% to 100%' : 'Fixed amount in Rupees'}
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      {type === 'percentage' ? '%' : '₹'}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      max={type === 'percentage' ? 100 : undefined}
                      required
                      placeholder={type === 'percentage' ? 'e.g. 15' : 'e.g. 500'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 font-semibold text-sm"
                    />
                  </div>
                </div>

                {/* Target Product: Particular Product vs All Products */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="font-semibold text-slate-700 block">
                    Product Applicability <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      targetType === 'product'
                        ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-semibold'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                    }`}>
                      <input
                        type="radio"
                        name="targetType"
                        checked={targetType === 'product'}
                        onChange={() => setTargetType('product')}
                        className="accent-blue-600"
                      />
                      <span className="text-xs">Particular Product</span>
                    </label>

                    <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      targetType === 'all'
                        ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-semibold'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                    }`}>
                      <input
                        type="radio"
                        name="targetType"
                        checked={targetType === 'all'}
                        onChange={() => {
                          setTargetType('all');
                          setSelectedProduct(null);
                        }}
                        className="accent-blue-600"
                      />
                      <span className="text-xs">All Store Products</span>
                    </label>
                  </div>

                  {/* Product Picker Box */}
                  {targetType === 'product' && (
                    <div className="mt-2 space-y-2">
                      {selectedProduct ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {selectedProduct.image_url ? (
                              <img
                                src={cleanProductImageUrl(selectedProduct.image_url)}
                                alt={selectedProduct.title}
                                className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200 shrink-0 p-1"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 text-xs truncate">
                                {selectedProduct.title}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                Product ID: #{selectedProduct.id}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsProductSelectorOpen(true)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:border-blue-300 transition-all shrink-0"
                          >
                            Change Product
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsProductSelectorOpen(true)}
                          className="w-full border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center space-y-1 bg-slate-50 hover:bg-blue-50/40 transition-all group"
                        >
                          <Package className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mx-auto" />
                          <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-600">
                            Click to Select Product from Modal
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Choose the exact tattoo equipment, ink, or machine this coupon applies to.
                          </p>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Expiry Date & Minimum Spend */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 text-xs"
                    />
                    <p className="text-[10px] text-slate-400">Leave blank for permanent offer</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Minimum Spend (Optional)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={minOrderAmount}
                        onChange={(e) => setMinOrderAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 text-xs font-semibold"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Minimum price required to use</p>
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-900 text-xs">Coupon Status</p>
                    <p className="text-[10px] text-slate-400">Immediately available to apply when active</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                </div>

                {/* Sticky Modal Actions (Always visible at the bottom) */}
                <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    {saving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{isEditing ? 'Save Changes' : 'Create Coupon'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* ------------------------------------------------------------- */}
        {/* PRODUCT SELECTOR MODAL (SINGLE SELECT MODE) */}
        {/* ------------------------------------------------------------- */}
        <ProductSelectorModal
          isOpen={isProductSelectorOpen}
          onClose={() => setIsProductSelectorOpen(false)}
          singleSelect={true}
          title="Select Product for Coupon"
          subtitle="Choose the specific tattoo equipment, ink, or needle to link with this coupon offer."
          selectedProductIds={selectedProduct ? [selectedProduct.id] : []}
          onApply={(ids, productObj) => {
            if (productObj) {
              setSelectedProduct(productObj);
            } else if (ids.length > 0) {
              setSelectedProduct({ id: ids[0], title: `Product #${ids[0]}` });
            }
          }}
        />

      </div>
    </AdminLayout>
  );
};
