import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Search, 
  Filter, 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  CreditCard, 
  User, 
  Phone, 
  Mail, 
  ArrowUpDown, 
  Check, 
  Copy,
  RotateCcw,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { orderService } from '../../services/orderService';
import { RefundModal } from '../../components/admin/RefundModal';

export const RefundRequests = () => {
  const [refunds, setRefunds] = useState([]);
  const [metrics, setMetrics] = useState({
    pending_count: 0,
    pending_total: 0,
    processed_count: 0,
    processed_total: 0,
    total_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchRefunds();
  }, [statusFilter]);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAdminRefunds(statusFilter, search);
      setRefunds(data.refunds || []);
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load refunds list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRefunds();
  };

  const handleOpenRefundModal = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleRefundSuccess = (updatedOrder) => {
    setRefunds(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
    fetchRefunds();
  };

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AdminLayout title="Refund Requests & Payouts">
      <div className="space-y-6 font-sans">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-blue-600" /> Customer Refund Requests & Payouts
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage excess balance refunds from customer 12-hour order edits and execute 1-click Razorpay auto-refunds
            </p>
          </div>

          <button
            onClick={fetchRefunds}
            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} /> Refresh Refunds
          </button>
        </div>

        {/* 4 Standard Executive Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Pending Requests */}
          <div 
            onClick={() => setStatusFilter('pending')}
            className={`bg-white border rounded-2xl p-4 space-y-1 shadow-2xs cursor-pointer transition-all ${
              statusFilter === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200/90 hover:border-amber-300'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Pending Requests</span>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-heading font-semibold text-lg text-amber-700">{metrics.pending_count}</span>
                <span className="text-[10px] text-amber-600 font-semibold block">Action Required</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-semibold text-xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 2: Pending Payout Due */}
          <div 
            onClick={() => setStatusFilter('pending')}
            className={`bg-white border rounded-2xl p-4 space-y-1 shadow-2xs cursor-pointer transition-all ${
              statusFilter === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200/90 hover:border-amber-300'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Pending Payout Due</span>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-heading font-semibold text-lg text-slate-900">
                  ₹{metrics.pending_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">Awaiting Razorpay Payout</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-semibold text-xs">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 3: Processed Count */}
          <div 
            onClick={() => setStatusFilter('processed')}
            className={`bg-white border rounded-2xl p-4 space-y-1 shadow-2xs cursor-pointer transition-all ${
              statusFilter === 'processed' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/90 hover:border-emerald-300'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Refunds Processed</span>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-heading font-semibold text-lg text-emerald-700">{metrics.processed_count}</span>
                <span className="text-[10px] text-emerald-600 font-medium block">Completed</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 4: Total Refunded Amount (Informational Card - No selection border) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-2xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Total Money Refunded</span>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-heading font-semibold text-lg text-slate-900">
                  ₹{metrics.processed_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">Returned to Customers</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-xs">
                <Zap className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-2xs">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            {[
              { id: 'all', label: 'ALL REQUESTS', count: metrics.total_count },
              { id: 'pending', label: 'PENDING PAYOUT', count: metrics.pending_count },
              { id: 'processed', label: 'PROCESSED', count: metrics.processed_count }
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              const isPendingTab = tab.id === 'pending';
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`text-[10px] font-semibold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? isPendingTab
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : isPendingTab && tab.count > 0
                        ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isPendingTab && tab.count > 0
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-slate-200/70 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full lg:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Order #, customer..."
                className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); fetchRefunds(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-2xs whitespace-nowrap"
            >
              Search
            </button>
          </form>
        </div>

        {/* Refund Orders Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              Loading refund records...
            </div>
          ) : refunds.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-700">No Refund Requests Found</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                {statusFilter === 'pending'
                  ? 'All customer modification refunds have been completed. There are no pending payouts.'
                  : 'No orders have generated an excess refund request matching your criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                    <th className="py-3 px-4 w-[14%]">Order Details</th>
                    <th className="py-3 px-4 w-[18%]">Customer Info</th>
                    <th className="py-3 px-4 w-[16%]">Original vs Revised</th>
                    <th className="py-3 px-4 w-[13%] text-right">Refund Due</th>
                    <th className="py-3 px-4 w-[17%]">Payment & Reference</th>
                    <th className="py-3 px-4 w-[11%] text-center">Status</th>
                    <th className="py-3 px-4 w-[11%] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {refunds.map((order) => {
                    const isPending = order.refund_status === 'pending';
                    const orderNum = order.order_number || `ATS-${1000 + order.id}`;
                    const refundAmt = parseFloat(order.refund_amount || 0);

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* Order Details */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="space-y-0.5">
                            <span className="font-heading font-semibold text-slate-900 text-xs block">
                              #{orderNum}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            {order.items && (
                              <span className="inline-block mt-0.5 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Customer Info */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-900 block text-xs">
                              {order.shipping_name || order.customer_name}
                            </span>
                            <span className="text-[11px] text-slate-600 block font-medium">
                              {order.shipping_phone || order.customer_account_phone || 'N/A'}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[160px]" title={order.customer_email || order.shipping_email}>
                              {order.customer_email || order.shipping_email}
                            </span>
                          </div>
                        </td>

                        {/* Original vs Revised */}
                        <td className="py-3.5 px-4 align-middle text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <span>Paid:</span>
                              <strong className="text-slate-800 font-semibold">
                                ₹{order.tracking_status === 'cancelled'
                                  ? parseFloat(order.total_amount).toLocaleString()
                                  : (parseFloat(order.total_amount) + refundAmt).toLocaleString()}
                              </strong>
                            </div>
                            <div>
                              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap border ${
                                order.tracking_status === 'cancelled'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {order.tracking_status === 'cancelled' ? 'Full Cancellation' : `Revised: ₹${parseFloat(order.total_amount).toLocaleString()}`}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Refund Due */}
                        <td className="py-3.5 px-4 align-middle text-right">
                          <div className="space-y-0.5">
                            <span className={`font-bold font-heading text-sm block whitespace-nowrap ${
                              isPending ? 'text-amber-700' : 'text-emerald-700'
                            }`}>
                              ₹{refundAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal block whitespace-nowrap">
                              {order.tracking_status === 'cancelled' ? 'Full Refund Due' : (isPending ? 'Excess Balance' : 'Credited Back')}
                            </span>
                          </div>
                        </td>

                        {/* Payment & Reference IDs */}
                        <td className="py-3.5 px-4 align-middle text-xs">
                          <div className="space-y-1 max-w-[170px]">
                            <div>
                              <span className="text-[9px] text-slate-400 font-semibold uppercase block leading-none mb-0.5">Payment ID</span>
                              <span className="font-mono text-slate-700 font-medium text-[11px] block truncate" title={order.razorpay_payment_id || 'N/A'}>
                                {order.razorpay_payment_id || 'N/A'}
                              </span>
                            </div>

                            {order.razorpay_refund_id && (
                              <div>
                                <span className="text-[9px] text-slate-400 font-semibold uppercase block leading-none mb-0.5">Refund ID</span>
                                <div className="flex items-center gap-1">
                                  <span className="font-mono text-emerald-700 font-semibold text-[11px] truncate" title={order.razorpay_refund_id}>
                                    {order.razorpay_refund_id}
                                  </span>
                                  <button
                                    onClick={() => handleCopy(order.razorpay_refund_id, order.id)}
                                    className="text-slate-400 hover:text-blue-600 p-0.5 rounded transition-colors flex-shrink-0"
                                    title="Copy Refund ID"
                                  >
                                    {copiedId === order.id ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 align-middle text-center">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border whitespace-nowrap ${
                            isPending
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isPending ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Pending Payout
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Processed
                              </>
                            )}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 align-middle text-right">
                          {isPending ? (
                            <button
                              onClick={() => handleOpenRefundModal(order)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95 inline-flex items-center justify-center gap-1.5 whitespace-nowrap ml-auto"
                            >
                              <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>Auto-Refund</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenRefundModal(order)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all ml-auto border border-slate-200 whitespace-nowrap inline-flex items-center justify-center"
                            >
                              View Details
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refund Details & Auto-Refund Execution Modal */}
        <RefundModal
          order={selectedOrder}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedOrder(null);
          }}
          onRefundSuccess={handleRefundSuccess}
        />

      </div>
    </AdminLayout>
  );
};
