import React, { useState } from 'react';
import { Truck, ChevronDown, ChevronUp, Mail, Package, MapPin, AlertCircle, ExternalLink, Calendar, CreditCard, DollarSign, Zap, CheckCircle2, X } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { CustomSelect } from '../common/CustomSelect';
import { ConfirmModal } from '../common/ConfirmModal';
import { orderService } from '../../services/orderService';

export const OrderRow = ({ order, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [trackingStatus, setTrackingStatus] = useState(order.tracking_status || 'ordered');
  const [courierName, setCourierName] = useState(order.courier_name || 'Bluedart Express');
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || '');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [refundLoading, setRefundLoading] = useState(false);
  const [confirmRefundOpen, setConfirmRefundOpen] = useState(false);
  const [refundNotice, setRefundNotice] = useState(null);
  const [trackingError, setTrackingError] = useState('');

  const formattedAmt = parseFloat(order.refund_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const handleConfirmRefund = async () => {
    setRefundLoading(true);
    setRefundNotice(null);
    try {
      const res = await orderService.updateOrderRefund(order.id, 'processed');
      setConfirmRefundOpen(false);
      setRefundNotice({
        type: 'success',
        message: res.message || `Auto-refund of ₹${formattedAmt} successfully processed via Razorpay!`
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      setConfirmRefundOpen(false);
      setRefundNotice({
        type: 'error',
        message: err.response?.data?.error || err.message || 'Failed to process auto-refund.'
      });
    } finally {
      setRefundLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setTrackingError('');
    setLoading(true);
    try {
      await orderService.updateTrackingInfo(
        order.id,
        trackingStatus,
        courierName,
        trackingNumber,
        trackingUrl,
        notifyCustomer
      );
      setLoading(false);
      setModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      setTrackingError(err.response?.data?.error || err.message || 'Failed to update tracking info.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      ordered: 'bg-slate-100 text-slate-800 border-slate-200',
      processing: 'bg-amber-50 text-amber-900 border-amber-200/90',
      shipped: 'bg-blue-50 text-blue-900 border-blue-200/90',
      out_for_delivery: 'bg-purple-50 text-purple-900 border-purple-200/90',
      delivered: 'bg-emerald-50 text-emerald-900 border-emerald-200/90',
      cancelled: 'bg-rose-50 text-rose-900 border-rose-200/90'
    };
    return (
      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${map[status] || map.ordered}`}>
        {status?.replace(/_/g, ' ')}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    if (status === 'paid') {
      return (
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/90 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Paid
        </span>
      );
    }
    return (
      <span className="bg-amber-50 text-amber-800 border border-amber-200/90 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pending
      </span>
    );
  };

  const orderNum = order.order_number || (`ATS-${1000 + Number(order.id)}`);

  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors text-xs font-sans">
        <td className="py-4 px-4 font-heading font-semibold text-blue-600 text-xs">
          #{orderNum}
        </td>

        <td className="py-4 px-4">
          <p className="font-semibold text-slate-900 text-xs">{order.shipping_name || order.customer_name || 'Customer'}</p>
          <p className="text-[11px] text-slate-500 font-medium">{order.customer_email || order.shipping_phone}</p>
        </td>

        <td className="py-4 px-4 font-semibold text-slate-900 text-xs font-sans">
          ₹{parseFloat(order.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </td>

        <td className="py-4 px-4 space-y-1">
          <div>{getPaymentBadge(order.payment_status)}</div>
          {order.refund_amount && parseFloat(order.refund_amount) > 0 && (
            <div>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full inline-block ${
                order.refund_status === 'processed' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-900 border border-amber-300 font-bold'
              }`}>
                Refund: ₹{parseFloat(order.refund_amount).toLocaleString('en-IN')} ({order.refund_status || 'Pending'})
              </span>
            </div>
          )}
        </td>

        <td className="py-4 px-4">{getStatusBadge(order.tracking_status)}</td>

        <td className="py-4 px-4 text-slate-600 font-semibold text-xs">
          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </td>

        <td className="py-4 px-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="bg-white border border-slate-200 hover:border-slate-300 text-slate-800 hover:text-slate-900 font-semibold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-blue-600" /> Update Status
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              title="Toggle Details"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Details Row */}
      {expanded && (
        <tr className="bg-slate-50/50 border-b border-slate-200">
          <td colSpan={7} className="p-4 sm:p-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
              
              {/* Top Banner if Order Cancelled */}
              {(order.tracking_status === 'cancelled' || order.cancel_reason) && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold uppercase tracking-wide block mb-0.5 text-rose-950">Order Cancellation Notice</strong>
                    <span>Reason: </span>
                    <span className="font-semibold">{order.cancel_reason || 'Cancelled by customer / admin'}</span>
                  </div>
                </div>
              )}

              {/* Refund Action Notification Banner (replaces alert popups) */}
              {refundNotice && (
                <div className={`rounded-xl p-3 text-xs flex items-center justify-between gap-3 border animate-in fade-in ${
                  refundNotice.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  <div className="flex items-center gap-2">
                    {refundNotice.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    )}
                    <span>{refundNotice.message}</span>
                  </div>
                  <button 
                    onClick={() => setRefundNotice(null)} 
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Refund Notice Banner if customer reduced order total */}
              {order.refund_amount && parseFloat(order.refund_amount) > 0 && (
                <div className={`rounded-xl p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
                  order.refund_status === 'processed' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}>
                  <div className="flex items-start gap-2.5">
                    {order.refund_status === 'processed' ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                    ) : (
                      <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                    )}
                    <div>
                      <strong className="font-semibold uppercase tracking-wide block text-[11px]">
                        {order.refund_status === 'processed' ? 'Auto-Refund Processed via Razorpay' : 'Action Required: 1-Click Auto-Refund Available'}
                      </strong>
                      <span className="text-[11px] text-slate-700">
                        Customer reduced their order by <strong>₹{formattedAmt}</strong>.
                        {order.refund_status === 'pending' ? (
                          <> Ready to refund automatically to original payment source (Razorpay Payment ID: <strong>{order.razorpay_payment_id || 'N/A'}</strong>).</>
                        ) : (
                          <> Funds sent to customer. {order.razorpay_refund_id && <>Razorpay Refund Reference: <strong>{order.razorpay_refund_id}</strong>.</>}</>
                        )}
                      </span>
                    </div>
                  </div>
                  {order.refund_status === 'pending' && (
                    <button
                      type="button"
                      disabled={refundLoading}
                      onClick={() => setConfirmRefundOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs self-start sm:self-auto flex-shrink-0 transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      {refundLoading ? 'Triggering Razorpay...' : `Auto-Refund ₹${formattedAmt}`}
                    </button>
                  )}
                </div>
              )}

              {/* Grid: Shipping Address & Shipment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1 text-xs">
                  <h4 className="font-heading font-semibold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5 text-blue-600">
                    <MapPin className="w-3.5 h-3.5" /> Shipping Address & Contact
                  </h4>
                  <p className="font-semibold text-slate-800">{order.shipping_name}</p>
                  <p className="text-slate-600 font-medium leading-snug">{order.shipping_address}</p>
                  <p className="text-slate-500 font-semibold text-[11px] pt-1">Phone: <span className="text-slate-800">{order.shipping_phone}</span></p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1 text-xs">
                  <h4 className="font-heading font-semibold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5 text-blue-600">
                    <Truck className="w-3.5 h-3.5" /> Courier Logistics & Dispatch
                  </h4>
                  <p className="font-semibold text-slate-800">{order.courier_name || 'Courier Not Assigned'}</p>
                  <p className="text-slate-600 font-medium">AWB Tracking #: <span className="font-semibold text-slate-800">{order.tracking_number || 'N/A'}</span></p>
                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline text-[11px] pt-1"
                    >
                      Track Package Direct <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Itemized Products */}
              <div>
                <h4 className="font-heading font-semibold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-blue-600" /> Itemized Equipment Manifest
                </h4>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-400 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Product Item</th>
                        <th className="py-2.5 px-3">Variant</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {order.items?.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{it.title}</td>
                          <td className="py-2.5 px-3 text-slate-500">{it.variant_name || 'Standard'}</td>
                          <td className="py-2.5 px-3 text-center font-semibold">{it.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                            ₹{parseFloat(it.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                            ₹{(it.unit_price * it.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </td>
        </tr>
      )}

      {/* Status Update Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Update Order #${orderNum} Logistics`}
      >
        <form onSubmit={handleUpdate} className="space-y-4 font-sans">
          {trackingError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{trackingError}</span>
            </div>
          )}

          <CustomSelect
            label="Shipment Tracking Status *"
            options={[
              'ordered',
              'processing',
              'shipped',
              'out_for_delivery',
              'delivered',
              'cancelled'
            ]}
            value={trackingStatus}
            onChange={(val) => setTrackingStatus(val)}
          />

          <Input
            label="Courier Partner Name"
            placeholder="e.g. Bluedart Express, Delhivery, DTDC"
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
          />

          <Input
            label="AWB / Tracking Consignment Number"
            placeholder="e.g. BD78912345IN"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />

          <Input
            label="Courier Live Tracking Web Link"
            placeholder="https://www.bluedart.com/tracking/..."
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
          />

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-2.5">
            <input
              type="checkbox"
              id={`notify-${order.id}`}
              checked={notifyCustomer}
              onChange={(e) => setNotifyCustomer(e.target.checked)}
              className="w-4 h-4 rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor={`notify-${order.id}`} className="text-xs text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer">
              <Mail className="w-4 h-4 text-blue-600" /> Send automated status update email to customer ({order.customer_email})
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} variant="primary">
              Save Logistics & Notify Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Custom Confirmation Modal for Auto-Refund */}
      <ConfirmModal
        isOpen={confirmRefundOpen}
        onClose={() => !refundLoading && setConfirmRefundOpen(false)}
        onConfirm={handleConfirmRefund}
        title="Confirm Razorpay Auto-Refund"
        message={`Execute instant online payout for Order #${orderNum}?`}
        confirmText={`Yes, Refund ₹${formattedAmt}`}
        cancelText="Cancel"
        type="success"
        isLoading={refundLoading}
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
              Razorpay will immediately reverse the funds directly back to the customer's payment source without manual bank transfers.
            </p>
          </div>
        }
      />
    </>
  );
};
