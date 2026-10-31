import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sliders, Plus, Edit2, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import api from '../../services/api';

export const HeroSlider = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/hero_slider.php');
      setSlides(res.data.slides || []);
    } catch (err) {
      console.error('Failed to load hero slides:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.post('/admin/hero_slider.php', { action: 'toggle', id });
      fetchSlides();
    } catch (err) {
      alert('Failed to toggle slide status: ' + (err.response?.data?.error || err.message));
    }
  };

  const promptDeleteSlide = (slide) => {
    setSlideToDelete(slide);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSlide = async () => {
    if (!slideToDelete) return;
    setDeleting(true);
    try {
      await api.post('/admin/hero_slider.php', { action: 'delete', id: slideToDelete.id });
      setDeleteModalOpen(false);
      setSlideToDelete(null);
      fetchSlides();
    } catch (err) {
      alert('Failed to delete slide: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const updatedSlides = [...slides];
    const temp = updatedSlides[index];
    updatedSlides[index] = updatedSlides[targetIndex];
    updatedSlides[targetIndex] = temp;

    // Recalculate order values
    const ordersPayload = updatedSlides.map((s, idx) => ({
      id: s.id,
      display_order: idx + 1
    }));

    setSlides(updatedSlides);

    try {
      await api.post('/admin/hero_slider.php', {
        action: 'reorder',
        orders: ordersPayload
      });
    } catch (err) {
      fetchSlides();
    }
  };

  return (
    <AdminLayout title="Home Hero Slider Management">
      <div className="space-y-6 font-sans">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" /> Dynamic Hero Slider Banners
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage main homepage hero slides, title text, badge tag, prices, action button links & hero images
            </p>
          </div>
          <Link
            to="/admin/hero-slider/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 w-fit"
          >
            <Plus className="w-4 h-4" /> Add New Hero Slide
          </Link>
        </div>

        {/* Slides List Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading hero slides...</div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-[1.8rem] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 align-middle">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider whitespace-nowrap">
                    <th className="py-3.5 px-4 w-20 text-center">Order</th>
                    <th className="py-3.5 px-4 min-w-[280px]">Banner Media Preview</th>
                    <th className="py-3.5 px-4 min-w-[180px]">Destination Link</th>
                    <th className="py-3.5 px-4 text-center min-w-[100px]">Status</th>
                    <th className="py-3.5 px-4 text-right min-w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {slides.map((s, idx) => (
                    <tr key={s.id} className={`hover:bg-slate-50/80 transition-colors ${!s.is_active ? 'opacity-60 bg-slate-50/40' : ''}`}>
                      <td className="py-4 px-4 text-center align-middle">
                        <div className="inline-flex items-center justify-center gap-1 bg-slate-50 border border-slate-200/80 rounded-xl p-1 shadow-2xs">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMoveOrder(idx, 'up')}
                            className="p-1 hover:bg-white hover:text-blue-600 rounded-lg text-slate-500 transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-bold text-slate-800 text-xs">{idx + 1}</span>
                          <button
                            disabled={idx === slides.length - 1}
                            onClick={() => handleMoveOrder(idx, 'down')}
                            className="p-1 hover:bg-white hover:text-blue-600 rounded-lg text-slate-500 transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-200/80 flex-shrink-0 relative shadow-2xs flex items-center justify-center">
                            {s.image_url ? (
                              /\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(s.image_url) ? (
                                <video src={s.image_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                              ) : (
                                <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="max-w-xs min-w-0">
                            <p className="font-semibold text-slate-900 text-xs line-clamp-1 leading-snug">{s.title || `Banner #${idx + 1}`}</p>
                            <p className="text-[10px] text-slate-400 truncate font-mono mt-0.5 max-w-[220px]">{s.image_url}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800 text-xs bg-slate-100 px-3 py-1 rounded-xl font-mono text-[11px]">
                          → {s.button_link || '/shop'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center align-middle">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full ${
                          s.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {s.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right align-middle">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleActive(s.id)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title={s.is_active ? 'Disable Slide' : 'Enable Slide'}
                          >
                            {s.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <Link
                            to={`/admin/hero-slider/edit/${s.id}`}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Edit Hero Slide"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => promptDeleteSlide(s)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete Hero Slide"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Hero Slide" maxWidth="max-w-md">
          <div className="text-center font-sans space-y-4 py-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-heading font-semibold text-slate-900">Are you sure you want to delete this slide?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This hero banner will be permanently removed from the storefront hero slider.
              </p>
            </div>

            {slideToDelete && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-3 text-left shadow-2xs">
                <div className="w-14 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                  {slideToDelete.image_url ? (
                    <img src={slideToDelete.image_url} alt={slideToDelete.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-xs truncate">{slideToDelete.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-blue-600 font-bold">₹{slideToDelete.price}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium">({slideToDelete.button_text || 'Buy Now'})</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={confirmDeleteSlide}
                disabled={deleting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Deleting...' : 'Delete Slide'}</span>
              </button>
            </div>
          </div>
        </Modal>

      </div>
    </AdminLayout>
  );
};
