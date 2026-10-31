import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ProductSelectorModal } from './ProductSelectorModal';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Sparkles,
  LayoutGrid,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Save,
  Package,
  Plus,
  RefreshCw,
  Trash2,
  Layers,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';

export const CustomCatalogManager = () => {
  const [showcases, setShowcases] = useState([]);
  const [activeKey, setActiveKey] = useState('custom_showcase');
  const [title, setTitle] = useState('Curated Studio Showcase');
  const [badge, setBadge] = useState('Featured Selection');
  const [description, setDescription] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [displayMode, setDisplayMode] = useState('slider');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Deletion state
  const [showcaseToDelete, setShowcaseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const cleanDesc = (d) => {
    if (!d) return '';
    const trimmed = d.trim();
    if (
      trimmed === 'Curated collection of high-performance tattoo supplies and accessories.' ||
      trimmed === 'Hand-picked professional tattoo equipment selected for master artists.'
    ) {
      return '';
    }
    return trimmed;
  };

  const fetchSettings = async (targetKey = null) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const url = targetKey ? `/settings/catalog.php?key=${encodeURIComponent(targetKey)}` : '/settings/catalog.php';
      const res = await api.get(url);
      if (res.data) {
        const list = Array.isArray(res.data.showcases) ? res.data.showcases : [];
        setShowcases(list);

        const current = targetKey
          ? list.find(s => s.key === targetKey) || res.data
          : (list.length > 0 ? list[0] : res.data);

        if (current) {
          setActiveKey(current.key || 'custom_showcase');
          setTitle(current.title || 'Curated Studio Showcase');
          setBadge(current.badge || 'Featured Selection');
          setDescription(cleanDesc(current.description));
          setSelectedProductIds(Array.isArray(current.product_ids) ? current.product_ids : []);
          setDisplayMode(current.display_mode || 'slider');
        }
      }
    } catch (err) {
      console.error('Failed to load custom catalog settings:', err);
      setErrorMsg('Failed to load showcases: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSelectShowcase = (sc) => {
    setActiveKey(sc.key);
    setTitle(sc.title || '');
    setBadge(sc.badge || 'Featured Selection');
    setDescription(cleanDesc(sc.description));
    setSelectedProductIds(Array.isArray(sc.product_ids) ? sc.product_ids : []);
    setDisplayMode(sc.display_mode || 'slider');
    setFeedbackMsg(null);
    setErrorMsg(null);
  };

  const handleStartNewShowcase = () => {
    const nextNum = showcases.length + 1;
    setActiveKey('new');
    setTitle(`Featured Equipment Showcase #${nextNum}`);
    setBadge('Featured Selection');
    setDescription('');
    setSelectedProductIds([]);
    setDisplayMode('slider');
    setFeedbackMsg(null);
    setErrorMsg(null);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please specify a title for this showcase section.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      const payload = {
        key: activeKey,
        title: title.trim(),
        badge: badge.trim(),
        description: description.trim(),
        product_ids: selectedProductIds,
        display_mode: displayMode
      };

      const res = await api.post('/settings/catalog.php', payload);
      if (res.data && res.data.success) {
        const updatedList = Array.isArray(res.data.showcases) ? res.data.showcases : [];
        setShowcases(updatedList);
        const savedKey = res.data.key || activeKey;
        setActiveKey(savedKey);

        setFeedbackMsg(
          activeKey === 'new'
            ? `New showcase "${title.trim()}" created! It is now synced to the Advanced Page Layout Builder.`
            : `Showcase "${title.trim()}" saved successfully and synced to Layout Builder!`
        );

        // Notify AdvancedLayoutBuilder and Storefront in real-time
        window.dispatchEvent(new CustomEvent('layout-updated'));
        setTimeout(() => setFeedbackMsg(null), 5000);
      }
    } catch (err) {
      setErrorMsg('Failed to save showcase settings: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!showcaseToDelete) return;
    try {
      setDeleting(true);
      setErrorMsg(null);
      const res = await api.delete(`/settings/catalog.php?key=${encodeURIComponent(showcaseToDelete.key)}`);
      if (res.data && res.data.success) {
        const remaining = Array.isArray(res.data.showcases) ? res.data.showcases : [];
        setShowcases(remaining);
        setFeedbackMsg(`Showcase "${showcaseToDelete.title || showcaseToDelete.key}" removed successfully.`);

        // Notify AdvancedLayoutBuilder to remove section
        window.dispatchEvent(new CustomEvent('layout-updated'));

        setShowcaseToDelete(null);
        if (remaining.length > 0) {
          handleSelectShowcase(remaining[0]);
        } else {
          handleStartNewShowcase();
        }
        setTimeout(() => setFeedbackMsg(null), 5000);
      }
    } catch (err) {
      setErrorMsg('Failed to delete showcase: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loading Custom Catalog Showcases...</p>
      </div>
    );
  }

  const activeShowcaseObj = showcases.find(s => s.key === activeKey);
  const isNew = activeKey === 'new';

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs font-sans">
        {/* Top Header */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-heading font-semibold text-slate-900">Custom Catalog Showcase Manager</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  {showcases.length} {showcases.length === 1 ? 'Showcase' : 'Showcases'} Configured
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-500">Auto-syncs to Advanced Page Layout Builder</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-normal">
            Create and manage multiple curated product showcase sections. Each section can display a distinct selection of products as an interactive slider or card grid.
          </p>
        </div>

        {/* Feedback / Alert Banners */}
        {feedbackMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2.5 animate-fadeIn shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2.5 animate-fadeIn shadow-2xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Showcase Sections Selector Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Showcase Sections</span>
            </label>
            <span className="text-[11px] text-slate-400">Click a tab to edit or create a new section</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
            {showcases.map((sc, index) => {
              const isSelected = activeKey === sc.key;
              const prodCount = Array.isArray(sc.product_ids) ? sc.product_ids.length : 0;

              return (
                <button
                  key={sc.key}
                  type="button"
                  onClick={() => handleSelectShowcase(sc)}
                  className={`px-3.5 py-2.5 rounded-xl border text-left transition-all flex items-center gap-3 flex-shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-purple-500/40 text-white' : 'bg-white text-purple-600 border border-slate-200'}`}>
                    {sc.display_mode === 'grid' ? (
                      <LayoutGrid className="w-3.5 h-3.5" />
                    ) : (
                      <Sliders className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="min-w-0 pr-1">
                    <div className="text-xs font-bold truncate max-w-[170px]">
                      {sc.title || `Showcase #${index + 1}`}
                    </div>
                    <div className={`text-[10px] flex items-center gap-1.5 ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                      <span>{prodCount} {prodCount === 1 ? 'item' : 'items'}</span>
                      <span>•</span>
                      <span className="capitalize">{sc.display_mode || 'slider'}</span>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* "+ Create New Showcase Section" Button */}
            <button
              type="button"
              onClick={handleStartNewShowcase}
              className={`px-4 py-2.5 rounded-xl border-2 border-dashed flex items-center gap-2 flex-shrink-0 text-xs font-bold transition-all cursor-pointer ${
                isNew
                  ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-2xs'
                  : 'border-slate-300 hover:border-purple-400 text-slate-600 hover:text-purple-700 bg-white hover:bg-purple-50/50'
              }`}
            >
              <div className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>Add New Showcase Section</span>
            </button>
          </div>
        </div>

        {/* Section Context Card */}
        <div className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isNew
            ? 'bg-gradient-to-r from-purple-50 to-indigo-50/40 border-purple-200 text-purple-900'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${isNew ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500'}`} />
            <div>
              <span className="font-bold">
                {isNew ? 'Creating New Section' : `Editing: ${activeShowcaseObj?.title || activeKey}`}
              </span>
              <span className="mx-2 text-slate-300">|</span>
              <code className="text-[11px] font-mono bg-white/80 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                key: {activeKey}
              </code>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Delete button (available if editing an existing showcase and either more than 1 or not default) */}
            {!isNew && (
              <button
                type="button"
                onClick={() => setShowcaseToDelete(activeShowcaseObj || { key: activeKey, title })}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Delete this showcase section"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Showcase</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Section Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Section Main Title</span>
                <span className="text-[10px] text-slate-400 font-normal">Primary heading</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hand-Picked Masterstroke Collection"
                className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 text-slate-800"
              />
            </div>

            {/* Showcase Badge / Tagline */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Showcase Badge / Tag</span>
                <span className="text-[10px] text-slate-400 font-normal">Upper pill label (dynamic)</span>
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Featured Selection"
                className="w-full text-xs font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Display Mode Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Display Layout Mode</span>
                <span className="text-[10px] text-slate-400 font-normal">Card presentation</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDisplayMode('slider')}
                  className={`p-2.5 rounded-xl border-2 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    displayMode === 'slider'
                      ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Interactive Slider</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDisplayMode('grid')}
                  className={`p-2.5 rounded-xl border-2 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    displayMode === 'grid'
                      ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Static Cards Grid</span>
                </button>
              </div>
            </div>

            {/* Section Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Section Subtitle / Description (Optional)</span>
                <span className="text-[10px] text-slate-400 font-normal">Leave blank if not needed</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional custom description or leave blank..."
                className="w-full text-xs font-normal px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 text-slate-800 resize-none"
              />
            </div>
          </div>

          {/* Selected Products Trigger Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-semibold text-xs text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  Selected Catalog Equipment ({selectedProductIds.length} Products Selected)
                </h3>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Only selected products will appear inside this showcase on your storefront.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Select Products
              </button>
            </div>

            {selectedProductIds.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white space-y-1.5">
                <Package className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No equipment items selected yet.</p>
                <p className="text-[11px] text-slate-400 font-normal">
                  Click "Select Products" to choose items from your catalog for this section.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{selectedProductIds.length} Products chosen for this showcase</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="text-purple-600 hover:text-purple-800 hover:underline cursor-pointer flex items-center gap-1"
                >
                  Change Selection &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Bottom Action Bar: Save Showcase Button */}
          <div className="pt-4 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-xs bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl text-slate-700">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedProductIds.length > 0 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <span className="font-medium">
                {selectedProductIds.length === 0
                  ? 'Tip: Click "Select Products" to choose items before saving.'
                  : `${selectedProductIds.length} ${selectedProductIds.length === 1 ? 'product' : 'products'} selected for "${title || 'this showcase'}".`}
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 whitespace-nowrap transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer self-end sm:self-center"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isNew ? 'Create & Add to Layout' : 'Save Showcase Config'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Product Selector Modal */}
      <ProductSelectorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedProductIds={selectedProductIds}
        onApply={(ids) => setSelectedProductIds(ids)}
      />

      {/* Delete Showcase Confirm Modal */}
      <ConfirmModal
        isOpen={!!showcaseToDelete}
        onClose={() => !deleting && setShowcaseToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Showcase Section"
        message={`Are you sure you want to delete "${showcaseToDelete?.title || showcaseToDelete?.key}"?`}
        details={`Section key: "${showcaseToDelete?.key}". Deleting this will also remove it from the Advanced Page Layout Builder and storefront home page.`}
        confirmText="Delete Section"
        cancelText="Cancel"
        type="danger"
        isLoading={deleting}
      />
    </>
  );
};

export default CustomCatalogManager;
