import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  Send,
  Loader2,
  Package,
  RefreshCw
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAdminTickets(statusFilter);
      setTickets(data.tickets || []);
      if (data.tickets && data.tickets.length > 0 && !selectedTicket) {
        setSelectedTicket(data.tickets[0]);
        setReplyText(data.tickets[0].admin_reply || '');
        setUpdatingStatus(data.tickets[0].status);
      }
    } catch (err) {
      console.error('Failed to load support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = (t) => {
    setSelectedTicket(t);
    setReplyText(t.admin_reply || '');
    setUpdatingStatus(t.status);
    setSuccessMsg('');
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSubmittingReply(true);
    setSuccessMsg('');

    try {
      await orderService.updateAdminTicket(selectedTicket.id, updatingStatus, replyText);
      setSuccessMsg('Support ticket status and admin reply saved successfully.');
      fetchTickets();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update ticket:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">High Priority</span>;
      case 'low':
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">Low</span>;
      case 'medium':
      default:
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">Medium</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase">Open</span>;
      case 'in_progress':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase">In Progress</span>;
      case 'resolved':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase">Resolved</span>;
      case 'closed':
      default:
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase">Closed</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 font-sans">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-blue-600" /> Customer Support Tickets
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review order cancellation requests, delivery inquiries, and technical help tickets raised by artists
            </p>
          </div>

          <button
            onClick={fetchTickets}
            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs self-start"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> Refresh List
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all capitalize border ${
                statusFilter === st
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'all' ? 'All Tickets' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Main 2-Column Desktop Grid: Ticket List + Detail Response Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Tickets Queue */}
          <div className="lg:col-span-5 space-y-3">
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs font-semibold">
                Loading support tickets...
              </div>
            ) : tickets.length > 0 ? (
              tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTicket(t)}
                    className={`bg-white border rounded-2xl p-4 space-y-2 cursor-pointer transition-all duration-200 shadow-2xs ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-semibold text-xs text-blue-600">
                        #{t.ticket_number}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {getPriorityBadge(t.priority)}
                        {getStatusBadge(t.status)}
                      </div>
                    </div>

                    <h4 className="font-heading font-semibold text-xs text-slate-900 line-clamp-1">
                      {t.subject}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {t.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
                      <span>Client: {t.customer_name}</span>
                      {t.order_number && <span className="text-slate-700">Order #{t.order_number}</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
                No tickets found for selected filter.
              </div>
            )}
          </div>

          {/* Right Column: Ticket Inspection & Admin Response Form */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs sticky top-24">
                
                {/* Header Ticket Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-heading font-semibold text-sm text-blue-600">
                        #{selectedTicket.ticket_number}
                      </span>
                      {selectedTicket.order_number && (
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
                          Order #{selectedTicket.order_number}
                        </span>
                      )}
                    </div>
                    <h2 className="font-heading font-semibold text-sm text-slate-900 leading-snug">
                      {selectedTicket.subject}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Category: <strong className="text-slate-800 font-semibold">{selectedTicket.category}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                </div>

                {/* Customer Contact Details */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Artist Name</span>
                      <strong className="text-slate-900 font-semibold">{selectedTicket.customer_name}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Email Address</span>
                      <span className="text-slate-900 font-medium truncate block">{selectedTicket.customer_email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Contact Phone</span>
                      <span className="text-slate-900 font-medium">{selectedTicket.customer_phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Ticket Description Message Body */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Customer Explanation / Ticket Details
                  </h4>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs leading-relaxed font-sans border border-slate-800 shadow-inner">
                    {selectedTicket.message}
                  </div>
                </div>

                {/* Admin Reply & Status Management Form */}
                <form onSubmit={handleUpdateTicket} className="space-y-4 border-t border-slate-100 pt-5">
                  {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" /> {successMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                        Ticket Status Workflow *
                      </label>
                      <select
                        value={updatingStatus}
                        onChange={(e) => setUpdatingStatus(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="open">Open (Awaiting Admin Review)</option>
                        <option value="in_progress">In Progress (Processing Order Request)</option>
                        <option value="resolved">Resolved (Cancellation / Refund Complete)</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Official Admin Reply / Resolution Note
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Write official response or update status for artist..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={submittingReply}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                      {submittingReply ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving Reply...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Save Admin Response & Status
                        </>
                      )}
                    </button>
                  </div>
                </form>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs">
                Select a support ticket from the list to inspect details and post an official reply.
              </div>
            )}
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};
