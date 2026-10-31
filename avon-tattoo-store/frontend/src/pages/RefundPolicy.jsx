import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw, AlertTriangle, ShieldCheck, Clock, Mail, Globe, PackageX } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const RefundPolicy = () => {
  return (
    <div className="py-8 sm:py-16 font-sans">
      <SEO 
        title="Refund & Return Policy | TAT RABBIT" 
        description="Review TAT RABBIT's return and refund guidelines. Information on eligible returns, non-returnable hygiene items, damaged orders, and cancellations." 
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 text-left space-y-8">
        
        {/* Navigation Breadcrumb / Back */}
        <div>
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>

        {/* Page Title */}
        <header className="space-y-3 border-b border-slate-200 pb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Legal & Policies
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-slate-900 tracking-tight">
            REFUND & RETURN POLICY
          </h1>
        </header>

        {/* Main Content Body */}
        <div className="space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          
          <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal">
            At <strong>TAT RABBIT</strong>, your satisfaction matters to us. Please review our return and refund guidelines before placing an order.
          </p>

          {/* Section: Returns */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-slate-900" />
              <span>Returns</span>
            </h2>
            <p className="text-slate-600">
              Return requests for eligible unopened and unused products must be submitted within <strong>48 hours</strong> of delivery. Products must be in their original packaging and condition.
            </p>
          </div>

          {/* Section: Non-Returnable Products */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Non-Returnable Products</span>
            </h2>
            <p className="text-slate-600">
              For hygiene and safety reasons, opened or used ointments, green soaps and other personal-care products cannot normally be returned, except where required by law.
            </p>
          </div>

          {/* Section: Damaged or Incorrect Orders */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-900" />
              <span>Damaged or Incorrect Orders</span>
            </h2>
            <p className="text-slate-600">
              If you receive a damaged, defective or incorrect product, please contact us with your order number and product photos. We will review the issue and arrange an appropriate solution.
            </p>
          </div>

          {/* Section: Refunds */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-900" />
              <span>Refunds</span>
            </h2>
            <p className="text-slate-600">
              Approved refunds will be processed within <strong>3–7 business days</strong> after the return is received and verified. Bank or payment-provider processing times may vary.
            </p>
          </div>

          {/* Section: Order Cancellation */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <PackageX className="w-5 h-5 text-slate-900" />
              <span>Order Cancellation</span>
            </h2>
            <p className="text-slate-600">
              Cancellation requests must be made before dispatch. Once an order has been shipped, cancellation may not be possible.
            </p>
          </div>

          {/* Section: Contact Us */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight">
              Contact Us
            </h2>
            <p className="text-slate-600">
              For return, refund or cancellation assistance, please contact our customer support team:
            </p>
            <div className="bg-slate-100 rounded-xl p-4 sm:p-5 space-y-2.5 border border-slate-200">
              <div className="flex items-center gap-2.5 text-slate-800 text-sm">
                <Globe className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Website: </span>
                <a 
                  href="https://tatrabbit.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-medium text-slate-900 hover:text-blue-600 underline underline-offset-2"
                >
                  https://tatrabbit.com/
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-slate-800 text-sm">
                <Mail className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Email: </span>
                <a 
                  href="mailto:tatrabbit.in@gmail.com" 
                  className="font-medium text-slate-900 hover:text-blue-600 underline underline-offset-2"
                >
                  tatrabbit.in@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Legal disclaimer banner */}
          <div className="pt-4 border-l-2 border-slate-900 pl-4 sm:pl-5 py-1 my-6">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 font-heading tracking-wide uppercase">
              This policy is subject to applicable consumer protection laws.
            </p>
          </div>

        </div>

        {/* Bottom CTA / Action */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-6 py-3 rounded-full transition-all"
          >
            <span>Explore Equipment Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Contact Customer Support &rarr;
          </Link>
        </div>

      </article>
    </div>
  );
};
