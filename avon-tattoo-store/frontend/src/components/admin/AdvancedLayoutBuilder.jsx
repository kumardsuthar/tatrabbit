import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  RefreshCw,
  Sliders,
  LayoutGrid,
  Plus,
  Trash2,
  X,
  Check,
  Sparkles,
  Zap,
  BookOpen,
  ShieldCheck
} from 'lucide-react';

export const AdvancedLayoutBuilder = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Section Deletion State (Modal)
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [deletingSection, setDeletingSection] = useState(false);

  // Modal State for Adding Sections
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState('multi'); // 'multi' | 'custom'
  const [selectedPresets, setSelectedPresets] = useState([]);
  const [modalError, setModalError] = useState(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionKey, setNewSectionKey] = useState('');
  const [newTargetPage, setNewTargetPage] = useState('home');
  const [newPositionSlot, setNewPositionSlot] = useState('main');

  const pages = [
    { key: 'home', label: 'Home Page' },
    { key: 'shop', label: 'Shop Page' },
    { key: 'product', label: 'Product Detail Page' }
  ];

  const slotOptions = [
    { key: 'top', label: 'Top Header Slot' },
    { key: 'main', label: 'Main Body Slot' },
    { key: 'bottom', label: 'Bottom Footer Slot' }
  ];

  const PRESET_TEMPLATES = [
    { key: 'custom_showcase', name: 'Custom Catalog Showcase (Product Slider)', desc: 'Interactive carousel displaying curated products', icon: Sliders },
    { key: 'featured_products', name: 'Featured Products Showcase', desc: 'Grid of latest premium tattoo machines, needles & inks', icon: LayoutGrid },
    { key: 'promo_banner', name: 'Promotional Offer Banner', desc: 'High-impact festive discount and sale announcement block', icon: Zap },
    { key: 'reviews', name: 'Artist Testimonials & Reviews', desc: 'Customer reviews carousel and studio rating cards', icon: CheckCircle2 },
    { key: 'featured_categories', name: 'Featured Categories Bar', desc: 'Visual circular navigation for store categories', icon: Layers },
    { key: 'why_choose_us', name: 'Why Choose TatRabbit Trust Badges', desc: 'Surgical precision, bio-safety, and warranty highlights', icon: ShieldCheck },
    { key: 'blog_preview', name: 'Latest Blog & Masterclass', desc: 'Educational articles, tattooing guides & video previews', icon: BookOpen },
    { key: 'studio_showcase', name: 'Pro Studio Equipment Spotlight', desc: 'Special feature spotlight with custom description & shop link', icon: Sparkles }
  ];

  const DEFAULT_SECTION_KEYS = [
    'hero_banner',
    'featured_categories',
    'featured_products',
    'why_choose_us',
    'reviews',
    'blog_preview'
  ];

  const fetchLayout = async () => {
    try {
      setLoading(true);
      const res = await api.get('/layout.php?admin=true');
      if (Array.isArray(res.data)) {
        setSections(res.data);
      } else if (res.data && Array.isArray(res.data.sections)) {
        setSections(res.data.sections);
      }
    } catch (err) {
      console.error('Failed to load layout sections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayout();
    const handleLayoutUpdated = () => fetchLayout();
    window.addEventListener('layout-updated', handleLayoutUpdated);
    return () => window.removeEventListener('layout-updated', handleLayoutUpdated);
  }, []);

  // Filter sections belonging to current active tab (target_page)
  const currentTabSections = sections
    .filter((s) => s.target_page === activeTab)
    .sort((a, b) => parseInt(a.display_order) - parseInt(b.display_order));

  // Move section up or down within current page view
  const handleMoveOrder = (sectionKey, direction) => {
    const sorted = [...currentTabSections];
    const index = sorted.findIndex((s) => s.section_key === sectionKey);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    // Swap elements array positions
    const [movedItem] = sorted.splice(index, 1);
    sorted.splice(targetIndex, 0, movedItem);

    // Re-index display_order sequentially (1, 2, 3...)
    const reorderedTabSections = sorted.map((item, idx) => ({
      ...item,
      display_order: idx + 1
    }));

    // Re-map updated objects back into master sections list
    const updatedMap = new Map(reorderedTabSections.map((s) => [s.section_key, s]));
    setSections((prev) =>
      prev.map((item) => (updatedMap.has(item.section_key) ? updatedMap.get(item.section_key) : item))
    );
  };

  // Toggle visibility status (1 / 0)
  const handleToggleVisibility = (sectionKey) => {
    setSections((prev) =>
      prev.map((item) => {
        if (item.section_key === sectionKey) {
          return { ...item, is_visible: item.is_visible == 1 ? 0 : 1 };
        }
        return item;
      })
    );
  };

  // Reassign target_page or position_slot
  const handleUpdateProperty = (sectionKey, field, value) => {
    setSections((prev) =>
      prev.map((item) => {
        if (item.section_key === sectionKey) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Toggle selection for preset templates
  const handleTogglePresetSelection = (presetKey) => {
    setSelectedPresets((prev) =>
      prev.includes(presetKey) ? prev.filter((k) => k !== presetKey) : [...prev, presetKey]
    );
  };

  // Batch Add Multiple Selected Presets
  const handleBatchAddPresets = () => {
    if (selectedPresets.length === 0) {
      setModalError('Please select at least one preset section to add.');
      return;
    }

    const newSectionsToAdd = [];
    const currentSections = [...sections];

    selectedPresets.forEach((templateKey) => {
      const template = PRESET_TEMPLATES.find((t) => t.key === templateKey);
      if (!template) return;

      let baseKey = template.key;
      let uniqueKey = baseKey;
      let counter = 2;
      while (
        currentSections.some((s) => s.section_key === uniqueKey) ||
        newSectionsToAdd.some((s) => s.section_key === uniqueKey)
      ) {
        uniqueKey = `${baseKey}_${counter}`;
        counter++;
      }

      const displayName = uniqueKey !== baseKey ? `${template.name} (${counter - 1})` : template.name;

      newSectionsToAdd.push({
        section_key: uniqueKey,
        section_name: displayName,
        display_order: currentSections.length + newSectionsToAdd.length + 1,
        is_visible: 1,
        target_page: newTargetPage,
        position_slot: newPositionSlot,
        is_custom: 1
      });
    });

    setSections((prev) => [...prev, ...newSectionsToAdd]);
    setActiveTab(newTargetPage);

    setSelectedPresets([]);
    setModalError(null);
    setIsAddModalOpen(false);

    setFeedbackMsg(`Successfully added ${newSectionsToAdd.length} section(s)! Remember to click "Publish Layout Changes" to save.`);
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Add Single Custom Section (supports "Add & Add Another")
  const handleAddCustomSection = (e, keepOpen = false) => {
    if (e) e.preventDefault();
    setModalError(null);
    if (!newSectionName.trim()) {
      setModalError('Please enter a section name.');
      return;
    }

    let baseKey = (newSectionKey.trim() || newSectionName.toLowerCase().replace(/[^a-z0-9]+/g, '_')).replace(/^_+|_+$/g, '');
    if (!baseKey) baseKey = 'custom_section';

    let uniqueKey = baseKey;
    let counter = 2;
    while (sections.some((s) => s.section_key === uniqueKey)) {
      uniqueKey = `${baseKey}_${counter}`;
      counter++;
    }

    const newSecObj = {
      section_key: uniqueKey,
      section_name: newSectionName.trim(),
      display_order: sections.length + 1,
      is_visible: 1,
      target_page: newTargetPage,
      position_slot: newPositionSlot,
      is_custom: 1
    };

    setSections((prev) => [...prev, newSecObj]);
    setActiveTab(newTargetPage);

    setNewSectionName('');
    setNewSectionKey('');
    setModalError(null);

    if (!keepOpen) {
      setIsAddModalOpen(false);
    }

    setFeedbackMsg(`Section "${newSecObj.section_name}" added! Add another or click "Publish Layout Changes" to save.`);
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Handle Delete Section with ConfirmModal
  const handleConfirmDelete = async () => {
    if (!sectionToDelete) return;

    try {
      setDeletingSection(true);
      // Call backend API to remove section permanently if present in database
      await api.delete(`/layout.php?section_key=${encodeURIComponent(sectionToDelete.section_key)}`);
      
      // Remove from frontend state
      setSections((prev) => prev.filter((s) => s.section_key !== sectionToDelete.section_key));

      // Dispatch layout-updated event so other tabs or showcase slider syncs
      window.dispatchEvent(new CustomEvent('layout-updated'));

      setFeedbackMsg(`Section "${sectionToDelete.section_name}" removed from layout.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      console.error('Backend deletion call error:', err);
      setFeedbackMsg('Failed to delete section: ' + (err.response?.data?.error || err.message));
      setTimeout(() => setFeedbackMsg(null), 5000);
    } finally {
      setDeletingSection(false);
      setSectionToDelete(null);
    }
  };

  // Bulk Publish changes to api/layout.php via POST
  const handlePublishLayout = async () => {
    try {
      setSaving(true);
      
      const pagesList = ['home', 'shop', 'product'];
      let normalizedSections = [];

      pagesList.forEach((pageKey) => {
        const pageSecs = sections
          .filter((s) => s.target_page === pageKey)
          .sort((a, b) => parseInt(a.display_order) - parseInt(b.display_order))
          .map((s, idx) => ({
            ...s,
            display_order: idx + 1
          }));
        normalizedSections = [...normalizedSections, ...pageSecs];
      });

      const unassigned = sections.filter((s) => !pagesList.includes(s.target_page));
      normalizedSections = [...normalizedSections, ...unassigned];

      const payload = normalizedSections.map((s) => ({
        section_key: s.section_key,
        section_name: s.section_name,
        display_order: parseInt(s.display_order),
        is_visible: parseInt(s.is_visible),
        target_page: s.target_page,
        position_slot: s.position_slot
      }));

      await api.post('/layout.php', payload);
      setFeedbackMsg('Layout architecture published successfully!');
      setTimeout(() => setFeedbackMsg(null), 4000);
      fetchLayout();
    } catch (err) {
      setFeedbackMsg('Failed to publish layout configuration: ' + (err.response?.data?.error || err.message));
      setTimeout(() => setFeedbackMsg(null), 6000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loading Page Layout Structure...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-base font-heading font-semibold text-slate-900">Advanced Page Layout Builder</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Reorder, toggle visibility, add custom blocks, and reassign layout sections between pages dynamically.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Section</span>
          </button>

          <button
            onClick={fetchLayout}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors"
            title="Reset Changes"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePublishLayout}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 whitespace-nowrap flex-shrink-0 transition-all hover:scale-105 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Publish Layout Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Target Page Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {pages.map((p) => {
          const count = sections.filter((s) => s.target_page === p.key).length;
          const isActive = activeTab === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setActiveTab(p.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 flex-shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{p.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Layout Blocks Editor List */}
      {currentTabSections.length === 0 ? (
        <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
          <LayoutGrid className="w-7 h-7 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">No sections assigned to this page tab yet.</p>
            <p className="text-[11px] text-slate-400 font-normal">Use "+ Add New Section" or reassign an existing section here.</p>
          </div>
          <button
            onClick={() => {
              setNewTargetPage(activeTab);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Section To {pages.find((p) => p.key === activeTab)?.label}
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {currentTabSections.map((sec, index) => {
            const isFirst = index === 0;
            const isLast = index === currentTabSections.length - 1;
            const isVisible = sec.is_visible == 1;
            const isCustom = !DEFAULT_SECTION_KEYS.includes(sec.section_key);

            return (
              <div
                key={sec.section_key}
                className={`p-4 rounded-2xl border transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${
                  sec.section_key.startsWith('custom_showcase')
                    ? 'bg-gradient-to-r from-purple-50/40 via-white to-white border-purple-200/90 shadow-2xs hover:border-purple-300'
                    : isVisible
                    ? 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                    : 'bg-slate-50/80 border-slate-200/60 opacity-60'
                }`}
              >
                {/* Left: Reorder & Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMoveOrder(sec.section_key, 'up')}
                        disabled={isFirst}
                        className="p-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 disabled:opacity-20 transition-colors cursor-pointer"
                        title="Move Section Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(sec.section_key, 'down')}
                        disabled={isLast}
                        className="p-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 disabled:opacity-20 transition-colors cursor-pointer"
                        title="Move Section Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shadow-2xs">
                      #{sec.display_order}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-heading font-semibold text-xs sm:text-sm text-slate-900 truncate">
                        {sec.section_name}
                      </h4>
                      <code className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono whitespace-nowrap">
                        {sec.section_key}
                      </code>
                      {sec.section_key.startsWith('custom_showcase') && (
                        <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap inline-flex items-center gap-1 shadow-2xs">
                          <Sliders className="w-3 h-3 text-purple-600" /> Product Slider
                        </span>
                      )}
                      {isCustom && !sec.section_key.startsWith('custom_showcase') && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap shadow-2xs">
                          Added Section
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isVisible ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <p className="text-[11px] text-slate-400 font-normal">
                        {isVisible ? 'Active on storefront' : 'Hidden from storefront display'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Slot Assignment, Visibility Toggle & Delete Action */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  {/* Page Reassignment Dropdown */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Page:</span>
                    <select
                      value={sec.target_page}
                      onChange={(e) => handleUpdateProperty(sec.section_key, 'target_page', e.target.value)}
                      className="text-xs font-semibold bg-transparent border-0 focus:outline-none text-slate-700 cursor-pointer"
                    >
                      {pages.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Position Slot Dropdown */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Slot:</span>
                    <select
                      value={sec.position_slot}
                      onChange={(e) => handleUpdateProperty(sec.section_key, 'position_slot', e.target.value)}
                      className="text-xs font-semibold bg-transparent border-0 focus:outline-none text-slate-700 cursor-pointer"
                    >
                      {slotOptions.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Visibility Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(sec.section_key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                      isVisible
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                    title={isVisible ? 'Click to hide section' : 'Click to display section'}
                  >
                    {isVisible ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  {/* Delete Section Button (Only shown for new added sections, not for default sections) */}
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => setSectionToDelete(sec)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 transition-all shadow-2xs cursor-pointer whitespace-nowrap"
                      title={`Delete "${sec.section_name}" section`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Section Modal with Multi-Section Support */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-xl w-full shadow-2xl space-y-5 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-heading font-semibold text-sm text-slate-900">Add Layout Sections</h3>
                  <p className="text-[11px] text-slate-400">Add single or multiple sections to your storefront layout</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setModalError(null);
                  setSelectedPresets([]);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Notification */}
            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {modalError}
              </div>
            )}

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAddMode('multi');
                  setModalError(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  addMode === 'multi'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
                <span>Quick Presets (Multi-Select)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddMode('custom');
                  setModalError(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  addMode === 'custom'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Custom Section (Builder)</span>
              </button>
            </div>

            {/* Common Page & Slot Configuration */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Target Page
                </label>
                <select
                  value={newTargetPage}
                  onChange={(e) => setNewTargetPage(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                >
                  {pages.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Placement Slot
                </label>
                <select
                  value={newPositionSlot}
                  onChange={(e) => setNewPositionSlot(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                >
                  {slotOptions.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mode A: Multi-Select Preset Templates */}
            {addMode === 'multi' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
                  <span>Select one or more sections to add:</span>
                  <span className="font-semibold text-blue-600">
                    {selectedPresets.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                  {PRESET_TEMPLATES.map((tmpl) => {
                    const Icon = tmpl.icon;
                    const isSelected = selectedPresets.includes(tmpl.key);
                    return (
                      <div
                        key={tmpl.key}
                        onClick={() => handleTogglePresetSelection(tmpl.key)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 text-left ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-400 text-slate-900 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 font-semibold text-xs leading-tight">
                            <Icon className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                            <span className="truncate">{tmpl.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-1">
                            {tmpl.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setModalError(null);
                      setSelectedPresets([]);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBatchAddPresets}
                    disabled={selectedPresets.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      Add Selected Sections ({selectedPresets.length})
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Mode B: Custom Section Builder */}
            {addMode === 'custom' && (
              <form onSubmit={(e) => handleAddCustomSection(e, false)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Section Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Festival Special Offer Banner"
                    value={newSectionName}
                    onChange={(e) => {
                      setNewSectionName(e.target.value);
                      if (!newSectionKey) {
                        setNewSectionKey(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Section Unique Key (Optional - Auto generated if blank)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. festival_banner"
                    value={newSectionKey}
                    onChange={(e) => setNewSectionKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Unique template key. If key already exists, numbers like _2, _3 are automatically added.</p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setModalError(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleAddCustomSection(e, true)}
                    className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add & Add Another</span>
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Add & Close</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Section Confirm Modal */}
      <ConfirmModal
        isOpen={!!sectionToDelete}
        onClose={() => !deletingSection && setSectionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Layout Section"
        message={`Are you sure you want to remove "${sectionToDelete?.section_name}" from the layout?`}
        details={
          sectionToDelete?.section_key?.startsWith('custom_showcase')
            ? `This will remove "${sectionToDelete?.section_name}" from your storefront and page layout. You can also re-add or manage it from the Custom Catalog Showcase Manager.`
            : `Section identifier: "${sectionToDelete?.section_key}". It will be removed from the ${sectionToDelete?.target_page || 'home'} page layout.`
        }
        confirmText="Delete Section"
        cancelText="Cancel"
        type="danger"
        isLoading={deletingSection}
      />
    </div>
  );
};

export default AdvancedLayoutBuilder;
