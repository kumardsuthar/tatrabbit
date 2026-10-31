import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Package, 
  CreditCard, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { ConfirmModal } from '../common/ConfirmModal';

export const RefundModal = ({ order, isOpen, onClose, onRefundSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [successData, setSuccessData] = useState(null);

  if (!isOpen || !order) return null;

  const refundAmt = parseFloat(order.refund_amount || 0);
  const formattedAmt = refundAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const isPending = order.refund_status === 'pending' && !successData;
  const isProcessed = order.refund_status === 'processed' || !!successData;
  const activeRefundId = successData?.razorpay_refund_id || order.razorpay_refund_id;
  const orderNum = order.order_number || `ATS-${1000 + Number(order.id)}`;

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenConfirm = () => {
    setErrorMsg('');
    setShowConfirm(true);
  };

  const handleConfirmRefund = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await orderService.updateOrderRefund(order.id, 'processed');
      setShowConfirm(false);
      setSuccessData(res);
      if (onRefundSuccess) {
        onRefundSuccess({
          ...order,
          refund_status: 'processed',
          razorpay_refund_id: res.razorpay_refund_id || order.razorpay_refund_id
        });
      }
    } catch (err) {
      setShowConfirm(false);
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to execute auto-refund via Razorpay.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
        <div 
          className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isPending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-semibold text-sm text-slate-900">
                    Refund Request #{orderNum}
                  </h3>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isPending 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {isPending ? 'Pending Payout' : 'Processed & Paid'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Order Date: {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            {/* Inline Error Banner (replaces alert popups) */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <strong className="block font-semibold">Refund Execution Notice</strong>
                  <span className="text-[11px]">{errorMsg}</span>
                </div>
              </div>
            )}

            {/* Success State Banner if just executed */}
            {successData && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl space-y-2 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2.5 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="font-heading font-semibold text-xs">
                    Auto-Refund of ₹{formattedAmt} Successfully Processed!
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Razorpay has accepted the reversal request. The amount is directly routed back to the customer's original payment method.
                </p>
                {activeRefundId && (
                  <div className="bg-white/80 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Razorpay Refund ID</span>
                    <span className="font-mono text-emerald-700 font-bold text-xs">{activeRefundId}</span>
                  </div>
                )}
              </div>
            )}

            {/* Refund Amount Highlight Card */}
            <div className={`p-4 rounded-2xl border ${
              isPending 
                ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-200' 
                : 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200'
            }`}>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block mb-0.5">
                {order.tracking_status === 'cancelled' ? 'Full Cancellation Refund Due' : 'Excess Payment Due For Refund'}
              </span>
              <div className="flex items-baseline justify-between gap-3">
                <span className={`text-2xl font-bold font-heading ${isPending ? 'text-amber-700' : 'text-emerald-700'}`}>
                  ₹{formattedAmt}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {order.tracking_status === 'cancelled' ? 'Customer cancelled paid order within 12h' : 'Reduced within 12h order edit window'}
                </span>
              </div>
            </div>

            {/* Payment & Razorpay Reference Information */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <h4 className="font-heading font-semibold text-[11px] uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Razorpay Payment Reference
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-semibold">ORIGINAL PAYMENT ID</span>
                  <span className="font-mono text-slate-800 font-semibold break-all text-[11px]">
                    {order.razorpay_payment_id || 'pay_manual_record'}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-semibold">RAZORPAY REFUND ID</span>
                  {activeRefundId ? (
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="font-mono text-emerald-700 font-semibold break-all text-[11px]">
                        {activeRefundId}
                      </span>
                      <button 
                        onClick={() => handleCopy(activeRefundId)}
                        className="text-slate-400 hover:text-blue-600 p-1 rounded transition-colors"
                        title="Copy Reference"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Pending execution</span>
                  )}
                </div>
              </div>
            </div>

            {/* Customer & Delivery Profile */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
              <h4 className="font-heading font-semibold text-[11px] uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Customer & Shipping Info
              </h4>
              <div className="space-y-1 text-slate-700">
                <p className="font-semibold text-slate-900">{order.shipping_name || order.customer_name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-[11px]">
                  {(order.customer_email || order.shipping_email) && (
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {order.customer_email || order.shipping_email}</span>
                  )}
                  {order.shipping_phone && (
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {order.shipping_phone}</span>
                  )}
                </div>
                {order.shipping_address && (
                  <p className="text-slate-500 pt-1 text-[11px]">{order.shipping_address}</p>
                )}
              </div>
            </div>

            {/* Edited Order Items List */}
            {order.items && order.items.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="font-heading font-semibold text-[11px] uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-600" /> Items In Revised Order ({order.items.length})
                </span>
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-36 overflow-y-auto bg-slate-50/50">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{item.title}</p>
                        {item.variant_name && (
                          <span className="text-[10px] text-slate-400">Variant: {item.variant_name}</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-slate-600 font-medium">Qty: {item.quantity}</span>
                        <span className="text-slate-800 font-semibold block">₹{(parseFloat(item.unit_price) * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer / Actions */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-all"
            >
              {successData ? 'Done' : 'Close'}
            </button>

            {isPending ? (
              <button
                disabled={loading}
                onClick={handleOpenConfirm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {loading ? 'Executing Razorpay Refund...' : `1-Click Auto-Refund ₹${formattedAmt}`}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Refund Completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal (replaces browser confirm dialog) */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => !loading && setShowConfirm(false)}
        onConfirm={handleConfirmRefund}
        title="Confirm Razorpay Auto-Refund"
        message={`Execute instant online payout for Order #${orderNum}?`}
        confirmText={`Yes, Refund ₹${formattedAmt}`}
        cancelText="Cancel"
        type="success"
        isLoading={loading}
        details={
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500 font-medium">Customer:</span>
              <span className="font-semibold text-slate-900">{order.shipping_name || order.customer_name || 'Customer'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500 font-medium">Refund Amount:</span>
              <span className="font-bold text-emerald-700 text-sm">₹{formattedAmt}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
              <span className="text-slate-500 font-medium">Original Payment ID:</span>
              <span className="font-mono text-slate-800 text-[11px]">{order.razorpay_payment_id || 'N/A'}</span>
            </div>
            <p className="text-[10px] text-slate-500 pt-1 leading-snug">
              Razorpay will immediately reverse the funds directly back to the customer's bank / UPI / card account without manual bank transfers.
            </p>
          </div>
        }
      />
    </>
  );
};
