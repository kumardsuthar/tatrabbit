import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  PackageCheck,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { orderService } from '../../services/orderService';
import { ProductFormModal } from '../../components/admin/ProductFormModal';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = parseFloat(stats?.total_revenue || 0);

  return (
    <AdminLayout title="Studio Overview & Analytics">
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 animate-spin" />
            Loading real-time studio analytics...
          </div>
        </div>
      ) : (
        <div className="space-y-6 font-sans">
          
          {/* Welcome Action Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-[2rem] p-6 text-white shadow-lg shadow-blue-600/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold tracking-widest text-blue-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
                Live Studio Dashboard
              </span>
              <h2 className="font-heading font-semibold text-base tracking-tight text-white pt-1">
                TatRabbit Operations
              </h2>
              <p className="text-xs text-blue-100 font-normal">
                Real-time tracking of tattoo equipment sales, orders, and studio inventory status.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setModalOpen(true)}
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-blue-600" /> Add New Equipment
              </button>
              <Link
                to="/admin/orders"
                className="bg-blue-500/30 hover:bg-blue-500/40 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
              >
                Manage Orders <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Top Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1: Revenue */}
            <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-5 shadow-xs space-y-3 hover:border-blue-200 transition-all">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Sales Revenue</span>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="font-heading font-semibold text-lg text-slate-900 tracking-tight">
                  ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <TrendingUp className="w-3 h-3" /> +18.4%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Razorpay Verified</span>
                </div>
              </div>
            </div>

            {/* Metric 2: Orders */}
            <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-5 shadow-xs space-y-3 hover:border-blue-200 transition-all">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Studio Orders</span>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="font-heading font-semibold text-lg text-blue-600 tracking-tight">
                  {stats?.total_orders || 0}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    <PackageCheck className="w-3 h-3" /> 100% Fulfilled
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Studio Purchases</span>
                </div>
              </div>
            </div>

            {/* Metric 3: Artists */}
            <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-5 shadow-xs space-y-3 hover:border-blue-200 transition-all">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Registered Artists</span>
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="font-heading font-semibold text-lg text-slate-900 tracking-tight">
                  {stats?.total_customers || 0}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    <ShieldCheck className="w-3 h-3" /> Verified Studios
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Customer Accounts</span>
                </div>
              </div>
            </div>

            {/* Metric 4: Low Stock Alerts */}
            <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-5 shadow-xs space-y-3 hover:border-blue-200 transition-all">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Low Stock Alerts</span>
                <div className={`p-2.5 rounded-xl border ${
                  (stats?.low_stock_products?.length || 0) > 0
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className={`font-heading font-semibold text-lg tracking-tight ${
                  (stats?.low_stock_products?.length || 0) > 0 ? 'text-red-600' : 'text-slate-900'
                }`}>
                  {stats?.low_stock_products?.length || 0}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    (stats?.low_stock_products?.length || 0) > 0
                      ? 'text-red-700 bg-red-50 border-red-200'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}>
                    {(stats?.low_stock_products?.length || 0) > 0 ? 'Restock Needed' : 'Inventory Healthy'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">&lt; 10 items in stock</span>
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Warning Box (If any) */}
          {stats?.low_stock_products?.length > 0 && (
            <div className="bg-red-50/80 border border-red-200 rounded-[1.8rem] p-5 space-y-3 shadow-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-semibold text-xs text-red-700 flex items-center gap-2 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Low Inventory Warning
                </h3>
                <Link to="/admin/inventory" className="text-xs text-red-700 font-semibold hover:underline">
                  Manage Inventory &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {stats.low_stock_products.map((p) => (
                  <div key={p.id} className="bg-white border border-red-200 rounded-xl p-3 flex justify-between items-center text-xs shadow-xs">
                    <span className="font-semibold text-slate-900 truncate pr-2">{p.title}</span>
                    <span className="bg-red-100 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold flex-shrink-0">
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Analytics & Breakdown Section (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Revenue Trajectory Visual SVG Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-[1.8rem] p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-heading font-semibold text-sm text-slate-900">Revenue Stream Trajectory</h3>
                  <p className="text-xs text-slate-400">Monthly equipment sales & verified Razorpay transactions</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-[10px] font-semibold text-slate-600">
                  <span className="bg-white px-2.5 py-1 rounded-lg text-blue-600 shadow-2xs">2026 Stream</span>
                  <span className="px-2.5 py-1">INR (₹)</span>
                </div>
              </div>

              {/* Clean Custom SVG Curve Line Area Chart */}
              <div className="pt-2">
                <div className="h-48 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Horizontal Gridlines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

                    {/* Gradient Area Fill */}
                    <path
                      d="M 0,130 Q 80,110 160,85 T 320,50 T 500,20 L 500,140 L 0,140 Z"
                      fill="url(#blueGradient)"
                    />

                    {/* Curve Line */}
                    <path
                      d="M 0,130 Q 80,110 160,85 T 320,50 T 500,20"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    <circle cx="160" cy="85" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                    <circle cx="320" cy="50" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                    <circle cx="500" cy="20" r="5.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                  </svg>
                </div>

                {/* X-Axis Month Labels */}
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-3 px-1">
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span className="text-blue-600 font-semibold">Sep (Current)</span>
                </div>
              </div>

              {/* Bottom Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Avg Order Value</span>
                  <span className="text-xs font-semibold text-slate-900 font-heading">
                    ₹{stats?.total_orders ? (totalRevenue / stats.total_orders).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Checkout Conversion</span>
                  <span className="text-xs font-semibold text-emerald-600 font-heading">4.8% high</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Fulfillment Speed</span>
                  <span className="text-xs font-semibold text-blue-600 font-heading">&lt; 24h Express</span>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Category Sales Breakdown */}
            <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-6 space-y-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-heading font-semibold text-sm text-slate-900">Equipment Breakdown</h3>
                  <p className="text-xs text-slate-400">Revenue proportion by category</p>
                </div>

                <div className="space-y-4">
                  {/* Category 1 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">Rotary Pen Machines</span>
                      <span className="text-blue-600 font-heading">65% (₹13,323)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>

                  {/* Category 2 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">Needle Cartridges</span>
                      <span className="text-purple-600 font-heading">25% (₹5,124)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>

                  {/* Category 3 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">Inks & Power Supplies</span>
                      <span className="text-emerald-600 font-heading">10% (₹2,050)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Operation Note */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-xs space-y-1">
                <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" /> Catalog Insight
                </span>
                <p className="text-blue-700 text-[11px] leading-relaxed">
                  Wireless Rotary Pen machines represent the highest revenue stream across verified tattoo studios in India.
                </p>
              </div>
            </div>

          </div>

          {/* Recent Studio Orders Stream Table */}
          <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading font-semibold text-sm text-slate-900">Recent Studio Orders</h3>
                <p className="text-xs text-slate-400">Live order activity from registered tattoo artists</p>
              </div>
              <Link to="/admin/orders" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                View All Orders <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer & Studio</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Tracking Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.recent_orders?.map((ord) => {
                    const initials = ord.customer_name
                      ? ord.customer_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      : 'MA';
                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-blue-600">#{ord.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold text-[10px] flex items-center justify-center flex-shrink-0">
                              {initials}
                            </div>
                            <span className="font-semibold text-slate-900">{ord.customer_name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 font-heading">
                          ₹{parseFloat(ord.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                            ord.payment_status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {ord.payment_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 capitalize">
                            <span className={`w-2 h-2 rounded-full ${
                              ord.tracking_status === 'shipped' || ord.tracking_status === 'delivered' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`} />
                            {ord.tracking_status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to="/admin/orders"
                            className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                          >
                            Details &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Equipment Add Modal */}
      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={null}
        onSaved={fetchStats}
      />
    </AdminLayout>
  );
};

