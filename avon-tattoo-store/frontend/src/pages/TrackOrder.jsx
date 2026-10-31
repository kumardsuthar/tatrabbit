import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Truck, CheckCircle, Search, ExternalLink, Loader2, XCircle } from 'lucide-react';
import { orderService } from '../services/orderService';
import { SEO } from '../components/common/SEO';

export const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const queryOrderId = searchParams.get('order_id') || '';
  const queryPhone = searchParams.get('phone') || '';

  const [orderId, setOrderId] = useState(queryOrderId);
  const [phoneOrEmail, setPhoneOrEmail] = useState(queryPhone);

  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (queryOrderId) {
      handleTrack(queryOrderId, queryPhone);
    }
  }, [queryOrderId, queryPhone]);

  const handleTrack = async (targetId, targetContact) => {
    const idToUse = targetId || orderId;
    if (!idToUse) return;

    setLoading(true);
    setError('');
    try {
      const data = await orderService.trackOrder(idToUse, targetContact || phoneOrEmail);
      setTrackingData(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to locate order shipment tracking data');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleTrack(orderId, phoneOrEmail);
  };

  const isCancelled = trackingData?.order?.tracking_status === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4 font-sans text-xs">
      <SEO
        title="Live Equipment Shipment Tracker - TatRabbit"
        description="Track real-time courier shipment status and AWB tracking for surgical-grade tattoo equipment purchases."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Live Tracker', url: '/track' }
        ]}
      />

      <div className="text-center space-y-1 max-w-md mx-auto">
        <h1 className="font-heading font-semibold text-lg sm:text-xl text-slate-900 flex items-center justify-center gap-2">
          <Truck className="w-5 h-5 text-blue-600" /> Live Shipment Tracker
        </h1>
        <p className="text-xs text-slate-500">
          Enter your Order ID (e.g. ATS-1004) to track your equipment dispatch.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Order ID Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. ATS-1004"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Account Email (Optional)</label>
            <input
              type="text"
              placeholder="e.g. artist@studio.com"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Locating Shipment...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" /> Track Equipment Shipment
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* Visual Shipment Timeline & Status Display */}
      {trackingData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Tracking Order</span>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="font-heading font-semibold text-lg text-blue-600 leading-none">
                  #{trackingData.order.order_number || (`ATS-${1000 + Number(trackingData.order.id)}`)}
                </h2>
                {isCancelled && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 inline-flex items-center">
                    Cancelled
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Recipient: <strong className="text-slate-900 font-semibold">{trackingData.order.shipping_name}</strong></p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Courier Partner</span>
              {isCancelled ? (
                <p className="text-xs font-semibold text-rose-600 mt-0.5">N/A (Order Cancelled)</p>
              ) : (
                <p className="text-xs font-semibold text-slate-900 mt-0.5">{trackingData.order.courier_name || 'Processing in Studio'}</p>
              )}
              {!isCancelled && trackingData.order.tracking_number && (
                <p className="text-[11px] font-mono text-blue-600 font-semibold mt-0.5">AWB: {trackingData.order.tracking_number}</p>
              )}
            </div>
          </div>

          {/* If CANCELLED: Show clear Cancelled Banner */}
          {isCancelled ? (
            <div className="bg-rose-50/90 border border-rose-200 rounded-xl p-4 sm:p-5 text-rose-900 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center flex-shrink-0 text-rose-600 mt-0.5">
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-heading font-semibold text-sm sm:text-base text-rose-900">This Order Has Been Cancelled</h3>
                  <p className="text-xs text-rose-700 font-medium leading-relaxed">
                    Fulfillment for this order was cancelled. No equipment or package will be dispatched.
                  </p>
                  {trackingData.order.cancel_reason && (
                    <div className="mt-2.5 bg-white/90 border border-rose-200 rounded-lg p-3 text-xs text-rose-950 shadow-2xs">
                      <strong className="font-semibold block text-[10px] uppercase tracking-wider text-rose-600 mb-0.5">Cancellation Reason:</strong>
                      "{trackingData.order.cancel_reason}"
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-rose-200/80 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-rose-800 font-medium">Have questions or need refund assistance?</span>
                <Link
                  to="/orders"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-xs"
                >
                  Order History & Helpdesk
                </Link>
              </div>
            </div>
          ) : (
            /* Visual Progress Bar for active non-cancelled orders */
            <div className="py-1">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Shipment Timeline Progress</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {trackingData.timeline?.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border flex flex-col items-center text-center space-y-1.5 transition-all ${
                      step.completed
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-[10px] ${
                      step.completed ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {step.completed ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className="text-[11px] font-semibold leading-snug">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courier Live Link Action (only if active) */}
          {!isCancelled && trackingData.order.tracking_url && (
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900">Live External Courier Tracking Active</h4>
                  <p className="text-[11px] text-slate-500">Click below to view real-time GPS location on courier portal</p>
                </div>
              </div>
              <a
                href={trackingData.order.tracking_url}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-xs"
              >
                Track on {trackingData.order.courier_name || 'Courier Website'} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Delivery Address Review */}
          <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
            <strong className="text-slate-900 font-semibold">Delivery Address: </strong> {trackingData.order.shipping_address}
          </div>
        </div>
      )}
    </div>
  );
};
