import React, { useState, useEffect } from 'react';
import { Mail, Phone, ShoppingBag } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { orderService } from '../../services/orderService';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await orderService.getCustomersList();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error('Failed to load customers list:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Registered Artist Directory">
      <div className="space-y-6 font-sans">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="font-heading font-semibold text-base text-slate-900">Registered Tattoo Studios & Artists</h2>
          <p className="text-xs text-slate-500 mt-0.5">View customer profiles, total purchase volume, and order frequencies</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading artist directory...</div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-[1.8rem] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Artist / Studio Name</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Total Orders</th>
                    <th className="py-3.5 px-4">Lifetime Spend</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 font-semibold text-slate-900">{c.name}</td>
                      <td className="py-4 px-4 space-y-0.5">
                        <p className="text-slate-700 font-mono text-[11px] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-blue-600" /> {c.email}
                        </p>
                        {c.phone && (
                          <p className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900">
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-blue-100">
                          <ShoppingBag className="w-3.5 h-3.5 text-blue-600" /> {c.total_orders} orders
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900 text-xs font-heading">
                        ₹{parseFloat(c.lifetime_spend).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-medium">
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
