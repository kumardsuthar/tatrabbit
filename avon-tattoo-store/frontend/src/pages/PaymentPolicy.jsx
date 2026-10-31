import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  CreditCard, 
  Wallet, 
  ShieldCheck, 
  AlertTriangle, 
  RotateCcw, 
  Receipt, 
  Mail, 
  HeartHandshake 
} from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const PaymentPolicy = () => {
  return (
    <div className="py-8 sm:py-16 font-sans">
      <SEO 
        title="Payment Policy | TAT RABBIT" 
        description="Review TAT RABBIT's prepaid payment policy, accepted payment options (UPI, Cards, Netbanking), payment security, and refund guidelines." 
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

        {/* Page Title & Last Updated */}
        <header className="space-y-3 border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Legal & Policies
            </p>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Last Updated: October 17, 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-slate-900 tracking-tight">
            PAYMENT POLICY
          </h1>
        </header>

        {/* Main Content Body */}
        <div className="space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          
          <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal">
            At <strong>TAT RABBIT</strong>, we offer prepaid payments to provide a smooth and secure shopping experience. All orders must be paid for online at the time of checkout.
          </p>

          {/* 1. Accepted Payment Methods */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-900 shrink-0" />
              <span>1. Accepted Payment Methods</span>
            </h2>
            <p className="text-slate-600">
              Customers can pay using the payment options available at checkout, which may include UPI, debit cards, credit cards, net banking and other supported payment methods.
            </p>
          </div>

          {/* 2. Prepaid Orders Only */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Wallet className="w-5 h-5 text-slate-900 shrink-0" />
              <span>2. Prepaid Orders Only</span>
            </h2>
            <p className="text-slate-600">
              We currently accept prepaid orders only. Cash on Delivery (COD) is not available. Orders are processed after successful payment confirmation.
            </p>
          </div>

          {/* 3. Payment Security */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>3. Payment Security</span>
            </h2>
            <p className="text-slate-600">
              Online payments are processed through supported payment service providers. Please do not share your UPI PIN, banking password or OTP with anyone.
            </p>
          </div>

          {/* 4. Failed or Pending Payments */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>4. Failed or Pending Payments</span>
            </h2>
            <p className="text-slate-600">
              If your payment fails or remains pending, please check your bank or payment application before attempting another payment. Contact us if money has been deducted but your order is not confirmed.
            </p>
          </div>

          {/* 5. Refunds */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-slate-900 shrink-0" />
              <span>5. Refunds</span>
            </h2>
            <p className="text-slate-600">
              Eligible refunds will be processed according to our{' '}
              <Link 
                to="/refund-policy" 
                className="font-medium text-slate-900 hover:text-blue-600 underline underline-offset-2"
              >
                Refund & Return Policy
              </Link>
              . The time taken for the amount to appear in your account may depend on your bank or payment provider.
            </p>
          </div>

          {/* 6. Pricing and Order Confirmation */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 text-slate-900 shrink-0" />
              <span>6. Pricing and Order Confirmation</span>
            </h2>
            <p className="text-slate-600">
              Please review your order details and final amount before completing payment. Orders are subject to product availability and successful payment confirmation.
            </p>
          </div>

          {/* 7. Contact Us */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Mail className="w-5 h-5 text-slate-900 shrink-0" />
              <span>7. Contact Us</span>
            </h2>
            <p className="text-slate-600">
              For payment-related assistance, contact our support team:
            </p>
            <div className="bg-slate-100 rounded-xl p-4 sm:p-5 space-y-2.5 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-800 text-sm">
                <span className="font-semibold text-slate-900">Brand:</span>
                <span>TAT RABBIT</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 text-sm">
                <span className="font-semibold text-slate-900">Website:</span>
                <a 
                  href="https://tatrabbit.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-medium text-slate-900 hover:text-blue-600 underline underline-offset-2"
                >
                  https://tatrabbit.com/
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-800 text-sm">
                <span className="font-semibold text-slate-900">Email:</span>
                <a 
                  href="mailto:tatrabbit.in@gmail.com" 
                  className="font-medium text-slate-900 hover:text-blue-600 underline underline-offset-2"
                >
                  tatrabbit.in@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Closing appreciation banner */}
          <div className="pt-4 border-l-2 border-slate-900 pl-4 sm:pl-5 py-2 my-6 bg-slate-50/50">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 font-heading tracking-wide uppercase flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-slate-900 shrink-0" />
              <span>Thank you for shopping with TAT RABBIT.</span>
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
