import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, LifeBuoy, CheckCircle2, Loader2, MessageSquare } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { CustomSelect } from '../common/CustomSelect';

export const NeedHelpModal = ({ isOpen, onClose, order }) => {
  const orderNum = order ? (order.order_number || (`ATS-${1000 + Number(order.id)}`)) : '';

  const [category, setCategory] = useState('Order Cancellation / Modification Request');
  const [subject, setSubject] = useState(orderNum ? `Assistance Request for Order #${orderNum}` : '');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdTicket, setCreatedTicket] = useState(null);

  const categoryOptions = [
    { label: 'Order Cancellation / Modification', value: 'Order Cancellation / Modification Request' },
    { label: 'Shipping & Courier Tracking', value: 'Shipping & Courier Tracking Delay' },
    { label: 'Address & Recipient Update', value: 'Address & Recipient Update' },
    { label: 'Item Damaged / Missing', value: 'Item Damaged / Missing in Package' },
    { label: 'Payment & Tax Invoice Query', value: 'Payment & Tax Invoice Query' },
    { label: 'Technical Equipment Support', value: 'Technical Equipment Support' }
  ];

  const priorityOptions = [
    { label: 'Low Priority', value: 'low' },
    { label: 'Medium Priority', value: 'medium' },
    { label: 'High / Urgent Priority', value: 'high' }
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await orderService.createSupportTicket({
        order_id: order?.id || null,
        order_number: orderNum || null,
        category,
        subject,
        message,
        priority
      });
      setCreatedTicket(res.ticket);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to raise support ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCreatedTicket(null);
    setMessage('');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 animate-fadeIn font-sans">
      <div className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs transition-opacity" onClick={handleReset} />
      <div className="bg-white border border-slate-200 rounded-[2rem] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative z-[100000]">
        <button
          type="button"
          onClick={handleReset}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 tracking-tight leading-snug truncate">
              {orderNum ? `Need Help with Order #${orderNum}` : 'Raise Studio Support Ticket'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Submit your inquiry to our studio helpdesk team
            </p>
          </div>
        </div>

        {createdTicket ? (
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto" />
            <div>
              <span className="bg-blue-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Ticket Created
              </span>
              <h3 className="font-heading font-semibold text-xl text-slate-900 mt-2">
                #{createdTicket.ticket_number}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Your support request has been registered in our admin desk. Our master technicians will reply shortly.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all mt-2"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3.5 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <CustomSelect
                  label="Issue Category *"
                  options={categoryOptions}
                  value={category}
                  onChange={(val) => setCategory(val)}
                />
              </div>

              <div>
                <CustomSelect
                  label="Priority Level"
                  options={priorityOptions}
                  value={priority}
                  onChange={(val) => setPriority(val)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Subject Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Requesting urgent order cancellation & address change"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Detailed Message / Explanation *
              </label>
              <textarea
                required
                rows="4"
                placeholder="Please describe your issue or the reason for cancellation request after 12 hours..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Raise Support Ticket'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

