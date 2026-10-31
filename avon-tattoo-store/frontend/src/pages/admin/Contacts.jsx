import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Trash2, Phone, Building } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import api from '../../services/api';

export const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/contacts-list.php');
      setContacts(res.data.contacts || []);
    } catch (err) {
      console.error('Failed to load contact submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.post('/admin/contact-update-status.php', { id, status });
      fetchContacts();
    } catch (err) {
      alert('Failed to update contact status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact submission?')) return;
    try {
      await api.post('/admin/contact-delete.php', { id });
      fetchContacts();
    } catch (err) {
      alert('Failed to delete contact entry: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredContacts = contacts.filter((c) => {
    if (filter === 'All') return true;
    return c.status === filter;
  });

  return (
    <AdminLayout title="Studio Contact Submissions & Support Inbox">
      <div className="space-y-6 font-sans">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="font-heading font-semibold text-sm text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" /> Support & Studio Contact Inquiries
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Messages and inquiry submissions from tattoo artists and studios via the Contact Form
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {['All', 'new', 'read', 'replied'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`text-[10px] font-semibold uppercase px-3 py-1.5 rounded-lg transition-all capitalize ${
                  filter === st ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts Inbox List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading contact submissions...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[1.8rem] p-12 text-center text-slate-400 text-xs font-semibold">
            No contact submissions found.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContacts.map((c) => (
              <div
                key={c.id}
                className={`bg-white border rounded-[1.8rem] p-5 shadow-xs transition-all space-y-3 ${
                  c.status === 'new' ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200/90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center flex-shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900">{c.name}</h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-3 font-medium">
                        <span>{c.email}</span>
                        {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {c.phone}</span>}
                        {c.studio_name && <span className="flex items-center gap-1 text-blue-600 font-semibold"><Building className="w-3 h-3" /> {c.studio_name}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                      c.status === 'new'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : c.status === 'replied'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {c.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {c.message}
                </p>

                <div className="flex justify-end items-center gap-2 pt-1">
                  {c.status !== 'replied' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'replied')}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Replied
                    </button>
                  )}
                  {c.status === 'new' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'read')}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
