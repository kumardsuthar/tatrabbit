import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { CustomSelect } from '../components/common/CustomSelect';
import api from '../services/api';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    studioName: '',
    email: '',
    phone: '',
    inquiryType: 'General Technical Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact/submit.php', {
        name: formData.name,
        studio_name: formData.studioName,
        email: formData.email,
        phone: formData.phone,
        message: `[${formData.inquiryType}] ${formData.message}`
      });
      setSubmitted(true);
    } catch (err) {
      alert('Failed to send contact message: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12 font-sans">
      <SEO
        title="Contact Technical Support - TatRabbit"
        description="Get in touch with TatRabbit Master Tech Advisors. Submit online inquiries for warranty, equipment, and wholesale questions."
      />
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" /> Direct Studio Support
        </div>
        <h1 className="font-heading font-semibold text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Get in Touch with Master Tech Advisors
        </h1>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
          Have technical questions about stroke length, machine power compatibility, bulk cartridge pricing, or order status? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Information Cards */}
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 flex-shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">Priority Studio Inquiries</h4>
              <p className="text-xs text-slate-500 mt-1">Direct equipment and wholesale consultation with master technicians.</p>
              <p className="text-[11px] text-blue-600 font-semibold mt-1.5">Average Response Time: Under 2 Hours</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">Direct Online Support Desk</h4>
              <p className="text-xs text-slate-500 mt-1">Submit your message via the form to connect directly with our technical team.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">24/7 AI Studio Advisor</h4>
              <p className="text-xs text-slate-500 mt-1">Use the interactive chat widget in the bottom-right for instant equipment answers.</p>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-md space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Support Desk Hours
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Monday – Saturday: 10:00 AM – 8:00 PM IST<br />
              Digital assistance available 24/7 online.
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Contact Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-8 sm:p-10 shadow-sm relative">
          
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-semibold text-2xl text-slate-900">
                Message Received!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Thank you for contacting TatRabbit. One of our master tech advisors will respond to <span className="font-semibold text-slate-800">{formData.email}</span> within 2 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', studioName: '', email: '', phone: '', inquiryType: 'General Technical Inquiry', message: '' });
                }}
                className="bg-blue-600 text-white font-semibold text-xs px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="font-heading font-semibold text-xl text-slate-900 border-b border-slate-100 pb-3">
                Send Inquiry to Master Tech Advisor
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Vikram Sethi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Studio Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.studioName}
                    onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                    placeholder="Iron & Ink Studio"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="artist@studio.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <CustomSelect
                  label="Inquiry Category *"
                  options={[
                    'General Technical Inquiry',
                    'Wholesale Studio Account Inquiry',
                    'Machine Warranty & Repair Claim',
                    'Order Shipment & Custom Delivery'
                  ]}
                  value={formData.inquiryType}
                  onChange={(val) => setFormData({ ...formData, inquiryType: val })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Detail *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your inquiry or machine specifications needed..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-8 py-3.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Send className="w-4 h-4" /> {loading ? 'Submitting Message...' : 'Submit Tech Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
