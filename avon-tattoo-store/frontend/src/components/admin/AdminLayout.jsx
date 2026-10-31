import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  ArrowLeft,
  MessageSquareQuote,
  BookOpen,
  Mail,
  Brain,
  LifeBuoy,
  Sliders,
  Tag,
  Images,
  Bell,
  RotateCcw,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  DollarSign,
  Percent
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import logoImg from '../../assets/logo.jpeg';

export const AdminLayout = ({ children, title }) => {
  const { adminUser, isAdmin, loading, logoutAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (isAdmin) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 45000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await orderService.getAdminNotifications();
      setNotifications(data);
    } catch (err) {
      // quiet fail
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Verifying Admin Session...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 max-w-md text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-semibold mx-auto">
            !
          </div>
          <h2 className="text-base font-heading font-semibold text-slate-900">Admin Access Denied</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You must be authenticated with a Studio Administrator account to view this control panel. Regular customer accounts are restricted.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => navigate('/admin/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all"
            >
              Sign In to Admin Portal
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2 rounded-xl text-xs transition-all"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingRefundsCount = notifications?.pending_refunds_count || 0;
  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Site Themes & Layout', path: '/admin/settings', icon: Sliders },
    { label: 'Hero Slider', path: '/admin/hero-slider', icon: Images },
    { label: 'Inventory & Products', path: '/admin/inventory', icon: Package },
    { label: 'Product Categories', path: '/admin/categories', icon: Tag },
    { label: 'Product Coupons', path: '/admin/coupons', icon: Percent },
    { label: 'Studio Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Refund Requests', path: '/admin/refunds', icon: RotateCcw, badge: pendingRefundsCount },
    { label: 'Support Tickets', path: '/admin/tickets', icon: LifeBuoy },
    { label: 'AI Chatbot Knowledge', path: '/admin/knowledge', icon: Brain },
    { label: 'Artist Directory', path: '/admin/customers', icon: Users },
    { label: 'Equipment Reviews', path: '/admin/reviews', icon: MessageSquareQuote },
    { label: 'Blog & Masterclass', path: '/admin/blogs', icon: BookOpen },
    { label: 'Contact Submissions', path: '/admin/contacts', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 shadow-xs">
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoImg} alt="TatRabbit Logo" className="h-9 w-auto object-contain" />
            <div>
              <h2 className="font-heading font-semibold text-sm text-slate-900 leading-tight">TATRABBIT ADMIN</h2>
              <span className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">Studio Control Panel</span>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.label}
                </div>
                {item.badge > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-blue-600 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" /> Back to Storefront
          </Link>
          <button
            onClick={logoutAdmin}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-200 px-8 flex items-center justify-between bg-white shadow-xs">
          <h1 className="text-base font-heading font-semibold text-slate-900">{title}</h1>
          <div className="flex items-center gap-4">
            
            {/* Notification Bell & Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications?.unread_count > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                )}
              </button>

              {/* Notification Dropdown Popup */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden font-sans animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-heading font-semibold text-slate-900">Notifications & Alerts</h4>
                      {notifications?.unread_count > 0 && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {notifications.unread_count} New
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => setShowNotifDropdown(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {/* Pending Refunds Section */}
                    {Array.isArray(notifications?.pending_refunds) && notifications.pending_refunds.length > 0 ? (
                      <div className="p-3 bg-amber-50/40">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-amber-600" /> Pending Refunds ({notifications.pending_refunds.length})
                          </span>
                          <Link
                            to="/admin/refunds"
                            onClick={() => setShowNotifDropdown(false)}
                            className="text-[10px] text-amber-700 hover:underline font-semibold"
                          >
                            View All &rarr;
                          </Link>
                        </div>
                        <div className="space-y-1.5">
                          {notifications.pending_refunds.slice(0, 3).map((item) => (
                            <div key={item.id} className="bg-white p-2.5 rounded-xl border border-amber-200/80 shadow-2xs flex items-center justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-900 text-xs">
                                  #{item.order_number || `ATS-${1000 + Number(item.id)}`}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {item.customer_name || item.shipping_name || 'Customer'}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-amber-700 block text-xs">
                                  ₹{parseFloat(item.refund_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                                <Link
                                  to="/admin/refunds"
                                  onClick={() => setShowNotifDropdown(false)}
                                  className="inline-block mt-0.5 text-[9px] bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded shadow-2xs hover:bg-emerald-700"
                                >
                                  Refund Now
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* Open Tickets Section */}
                    {Array.isArray(notifications?.open_tickets) && notifications.open_tickets.length > 0 && (
                      <div className="p-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                          Open Support Tickets
                        </span>
                        <div className="space-y-1.5">
                          {notifications.open_tickets.map((t) => (
                            <Link
                              key={t.id}
                              to="/admin/tickets"
                              onClick={() => setShowNotifDropdown(false)}
                              className="block p-2 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-800 truncate text-xs max-w-[200px]">
                                  {t.subject}
                                </span>
                                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 font-semibold">
                                  {t.category}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty state if nothing pending */}
                    {(!Array.isArray(notifications?.pending_refunds) || notifications.pending_refunds.length === 0) &&
                     (!Array.isArray(notifications?.open_tickets) || notifications.open_tickets.length === 0) && (
                      <div className="p-6 text-center text-slate-400 space-y-1.5">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                        <p className="text-xs font-semibold text-slate-700">All Caught Up!</p>
                        <p className="text-[10px] text-slate-400">No pending refunds or urgent tickets requiring attention.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <Link
                      to="/admin/refunds"
                      onClick={() => setShowNotifDropdown(false)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Go to Refund Requests &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-semibold text-xs flex items-center justify-center">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <span className="text-xs text-slate-500 font-normal">Logged in: <strong className="text-slate-900 font-semibold">{adminUser?.name || 'Administrator'}</strong></span>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 w-full min-w-0 flex-1">{children}</div>
      </main>
    </div>
  );
};

