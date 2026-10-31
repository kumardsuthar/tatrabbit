import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, Truck, CheckCircle2, Ban, HelpCircle, Clock, Edit3 } from 'lucide-react';
import { orderService } from '../services/orderService';
import { CancelOrderModal } from '../components/modals/CancelOrderModal';
import { NeedHelpModal } from '../components/modals/NeedHelpModal';
import { SEO } from '../components/common/SEO';

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const successBanner = searchParams.get('success');
  const editSuccessBanner = searchParams.get('edit_success');
  const orderIdBanner = searchParams.get('order_id');

  // Modal states
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [helpModalOrder, setHelpModalOrder] = useState(null);

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getUserOrders();
      const paidOrders = (data.orders || []).filter((order) => order.payment_status === 'paid');
      setOrders(paidOrders);
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'cancelled') {
      return (
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          Cancelled
        </span>
      );
    }
    const formatted = status ? status.replace('_', ' ') : 'ordered';
    return (
      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
        {formatted}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4 font-sans text-xs">
      <SEO
        title="Studio Purchase History & Order Invoices - TatRabbit"
        description="View past equipment orders, track dispatches, and raise helpdesk support tickets."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Order History', url: '/orders' }
        ]}
      />

      <div className="border-b border-slate-200 pb-3.5">
        <h1 className="font-heading font-semibold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" /> Studio Purchase History
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">View past equipment invoices, cancel recent orders within 12 hours, or raise helpdesk support tickets</p>
      </div>

      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-xs">Payment Success!</p>
            <p className="text-xs mt-0.5">Your order #{orderIdBanner?.startsWith('ATS-') ? orderIdBanner : (Number(orderIdBanner) > 1000 ? `ATS-${orderIdBanner}` : `ATS-${1000 + Number(orderIdBanner)}`)} has been confirmed. Stock was deducted and fulfillment is in progress.</p>
          </div>
        </div>
      )}

      {editSuccessBanner && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-800 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-xs">Order Edited Successfully!</p>
            <p className="text-xs mt-0.5">
              {searchParams.get('refund') && parseFloat(searchParams.get('refund')) > 0 ? (
                <>Your order #{orderIdBanner?.startsWith('ATS-') ? orderIdBanner : (Number(orderIdBanner) > 1000 ? `ATS-${orderIdBanner}` : `ATS-${1000 + Number(orderIdBanner)}`)} was reduced. An excess refund of <strong>₹{parseFloat(searchParams.get('refund')).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> has been recorded and queued for manual admin payout.</>
              ) : (
                <>Your order #{orderIdBanner?.startsWith('ATS-') ? orderIdBanner : (Number(orderIdBanner) > 1000 ? `ATS-${orderIdBanner}` : `ATS-${1000 + Number(orderIdBanner)}`)} has been updated with your new equipment and shipping preferences.</>
              )}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading order history...</div>
      ) : orders.length > 0 ? (
        <div className="space-y-3.5">
          {orders.map((order) => {
            const createdAtTime = new Date(order.created_at).getTime();
            const now = Date.now();
            const hoursElapsed = (now - createdAtTime) / (1000 * 60 * 60);
            const isWithin12Hours = hoursElapsed <= 12;
            const isCancelled = order.tracking_status === 'cancelled';
            const isDelivered = order.tracking_status === 'delivered';
            const hasPendingRefund = order.refund_amount && parseFloat(order.refund_amount) > 0;

            return (
              <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Order ID</span>
                    <h3 className="font-heading font-semibold text-base text-blue-600 leading-snug">
                      #{order.order_number || (`ATS-${1000 + Number(order.id)}`)}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {hasPendingRefund && (
                      <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        Refund: ₹{parseFloat(order.refund_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({order.refund_status || 'Pending'})
                      </span>
                    )}
                    <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                      order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      Payment: {order.payment_status}
                    </span>
                    {getStatusBadge(order.tracking_status)}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-1.5">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-700 py-0.5">
                      <span className="pr-4">• {it.title} {it.variant_name ? `(${it.variant_name})` : ''} x {it.quantity}</span>
                      <span className="font-semibold text-slate-900 flex-shrink-0">
                        ₹{(it.unit_price * it.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cancellation reason info if cancelled */}
                {isCancelled && order.cancel_reason && (
                  <div className="bg-rose-50/90 border border-rose-100 rounded-xl p-3 text-xs text-rose-900 font-medium leading-relaxed">
                    <strong className="font-semibold text-rose-700">Cancellation Reason:</strong> {order.cancel_reason}
                  </div>
                )}

                <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Total Amount: </span>
                    <span className="font-semibold text-slate-900 text-sm ml-1">
                      ₹{parseFloat(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Live Track Shipment (Only for active non-cancelled orders) */}
                    {!isCancelled && (
                      <Link
                        to={`/track?order_id=${order.order_number || order.id}`}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" /> Live Track
                      </Link>
                    )}

                    {/* Conditional Action Buttons: 12-Hour Edit & Cancel vs Need Help */}
                    {!isCancelled && !isDelivered && (
                      isWithin12Hours ? (
                        <>
                          <Link
                            to={`/checkout?edit_order_id=${order.order_number || order.id}`}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs shadow-xs"
                            title="Edit order items or shipping details within 12 hours of placement"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Edit Order
                          </Link>
                          <button
                            onClick={() => setCancelModalOrder(order)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs shadow-xs"
                            title="Cancel order directly (Available within 12 hours of order placement)"
                          >
                            <Ban className="w-3.5 h-3.5 text-rose-600" /> Cancel Order
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setHelpModalOrder(order)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs shadow-xs"
                          title="12-Hour cancellation period passed. Click to raise a support ticket."
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> Need Help?
                        </button>
                      )
                    )}

                    {/* Show Need Help even for completed/cancelled orders */}
                    {(isCancelled || isDelivered) && (
                      <button
                        onClick={() => setHelpModalOrder(order)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Need Help?
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-xs">
          No past purchases found.
        </div>
      )}

      {/* Cancel Order Modal (<= 12 Hours) */}
      <CancelOrderModal
        isOpen={Boolean(cancelModalOrder)}
        onClose={() => setCancelModalOrder(null)}
        order={cancelModalOrder}
        onSuccess={fetchUserOrders}
      />

      {/* Need Help / Support Ticket Modal (> 12 Hours or General Help) */}
      <NeedHelpModal
        isOpen={Boolean(helpModalOrder)}
        onClose={() => setHelpModalOrder(null)}
        order={helpModalOrder}
      />
    </div>
  );
};
