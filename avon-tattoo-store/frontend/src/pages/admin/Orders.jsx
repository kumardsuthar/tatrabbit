import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  RefreshCw, 
  Filter, 
  DollarSign, 
  Clock, 
  XCircle, 
  CheckCircle2,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { OrderRow } from '../../components/admin/OrderRow';
import { orderService } from '../../services/orderService';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAdminOrders(statusFilter, search);
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleClearSearch = () => {
    setSearch('');
    fetchOrders();
  };

  const statusOptions = ['All', 'ordered', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refund_pending'];

  // Metrics
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => o.tracking_status !== 'cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  const activeOrdersCount = orders.filter(o => ['ordered', 'processing', 'shipped', 'out_for_delivery'].includes(o.tracking_status)).length;
  const cancelledOrdersCount = orders.filter(o => o.tracking_status === 'cancelled').length;
  const pendingRefunds = orders.filter(o => o.refund_status === 'pending' && parseFloat(o.refund_amount || 0) > 0);
  const pendingRefundsTotal = pendingRefunds.reduce((sum, o) => sum + parseFloat(o.refund_amount || 0), 0);

  const getStatusCount = (st) => {
    if (st === 'All') return orders.length;
    if (st === 'refund_pending') return pendingRefunds.length;
    return orders.filter(o => o.tracking_status === st).length;
  };

  return (
    <AdminLayout title="Studio Orders Control & Tracking">
      <div className="space-y-6 font-sans">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" /> Studio Orders Control & Tracking
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor customer equipment purchases, manage fulfillment stages, and update shipment tracking
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} /> Refresh Orders
          </button>
        </div>

        {/* Executive Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-2xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Total Orders</span>
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-lg text-slate-900">{totalOrders}</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-2xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Fulfillment Revenue</span>
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-lg text-emerald-600">
                ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold text-xs">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-2xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Active In-Fulfillment</span>
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-lg text-amber-600">{activeOrdersCount}</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-semibold text-xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-2xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Cancelled Orders</span>
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-lg text-rose-600">{cancelledOrdersCount}</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-semibold text-xs">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className={`bg-white border rounded-2xl p-4 space-y-1 shadow-2xs cursor-pointer transition-all ${
            statusFilter === 'refund_pending' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-amber-200 hover:border-amber-300'
          }`} onClick={() => setStatusFilter('refund_pending')}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 block">Pending Refunds</span>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-heading font-semibold text-lg text-amber-700">{pendingRefunds.length}</span>
                {pendingRefundsTotal > 0 && (
                  <span className="text-[10px] text-amber-600 font-semibold block">₹{pendingRefundsTotal.toLocaleString()} Due</span>
                )}
                <Link 
                  to="/admin/refunds" 
                  onClick={(e) => e.stopPropagation()} 
                  className="text-[10px] text-blue-600 hover:text-blue-700 hover:underline font-semibold block pt-1"
                >
                  Open Refund Center &rarr;
                </Link>
              </div>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-semibold text-xs">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-2xs">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            {statusOptions.map((st) => {
              const isActive = statusFilter === st;
              const count = getStatusCount(st);
              const isRefundTab = st === 'refund_pending';

              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? isRefundTab ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : isRefundTab && count > 0
                        ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{st === 'All' ? 'ALL ORDERS' : isRefundTab ? 'REFUND REQUESTS' : st.replace(/_/g, ' ')}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold ${
                    isActive ? 'bg-white/20 text-white' : isRefundTab && count > 0 ? 'bg-amber-200 text-amber-900' : 'bg-slate-200/70 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Order ID (e.g. ATS-1004), Name or Phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-8 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs flex-shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-400 text-xs font-semibold space-y-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>Loading studio orders & shipment records...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer Info</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Tracking Status</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Logistics Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <OrderRow key={order.id} order={order} onUpdate={fetchOrders} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-heading font-semibold text-sm text-slate-800">No Studio Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no orders matching your current filter criteria or search query.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
