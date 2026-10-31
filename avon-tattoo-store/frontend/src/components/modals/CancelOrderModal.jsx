import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { CustomSelect } from '../common/CustomSelect';

export const CancelOrderModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [reasonCategory, setReasonCategory] = useState('Ordered wrong item / configuration');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !order) return null;

  const reasonOptions = [
    'Ordered wrong item / configuration',
    'Found alternative product elsewhere',
    'Shipping address incorrect',
    'Delivery lead time too long',
    'Placed order by mistake',
    'Other reason'
  ];

  const orderNum = order.order_number || (`ATS-${1000 + Number(order.id)}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const fullReason = `${reasonCategory}${customReason.trim() ? `: ${customReason.trim()}` : ''}`;

    try {
      const res = await orderService.cancelOrder(order.id, fullReason);
      setSuccessMsg(res.message || 'Order cancelled successfully.');
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 animate-fadeIn font-sans">
      <div className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="bg-white border border-slate-200 rounded-[2rem] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative z-[100000]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 tracking-tight leading-snug">Cancel Order #{orderNum}</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Order placed within 12-hour instant cancellation window</p>
          </div>
        </div>

        {successMsg ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-semibold text-sm text-emerald-900">Cancellation Confirmed</h3>
            <p className="text-xs text-emerald-700">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3.5 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <div>
              <CustomSelect
                label="Select Reason for Cancellation *"
                options={reasonOptions}
                value={reasonCategory}
                onChange={(val) => setReasonCategory(val)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Additional Comments (Optional)
              </label>
              <textarea
                rows="3"
                placeholder="Provide additional details regarding your order cancellation request..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
              <strong className="font-semibold">Note:</strong> Once cancelled, stock reserves will be released and any pre-authorized payments will be automatically refunded to your original payment method.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Keep Order
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Order Cancellation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

