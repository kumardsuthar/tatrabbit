import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Clock, 
  Truck, 
  CreditCard, 
  Search, 
  AlertCircle, 
  Navigation, 
  PackageCheck, 
  Mail, 
  HeartHandshake 
} from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const ShippingPolicy = () => {
  return (
    <div className="py-8 sm:py-16 font-sans">
      <SEO 
        title="Shipping Policy | TAT RABBIT" 
        description="Review TAT RABBIT's shipping policy, delivery timeframes, Pan-India courier coverage, and order tracking information." 
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
            SHIPPING POLICY
          </h1>
        </header>

        {/* Main Content Body */}
        <div className="space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          
          <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal">
            At <strong>TAT RABBIT</strong>, we aim to deliver your orders safely and efficiently. Please read our shipping guidelines before placing an order.
          </p>

          {/* 1. Shipping Locations */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-900 shrink-0" />
              <span>1. Shipping Locations</span>
            </h2>
            <p className="text-slate-600">
              We currently offer shipping across India, subject to service availability at your delivery address.
            </p>
          </div>

          {/* 2. Order Processing */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-900 shrink-0" />
              <span>2. Order Processing</span>
            </h2>
            <p className="text-slate-600">
              Orders are processed after payment confirmation or order verification. Processing times may vary depending on product availability and order volume.
            </p>
          </div>

          {/* 3. Shipping & Delivery Time */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-slate-900 shrink-0" />
              <span>3. Shipping & Delivery Time</span>
            </h2>
            <p className="text-slate-600">
              Estimated delivery times depend on your location and courier service. Your expected delivery timeframe, where available, will be communicated during checkout or after dispatch.
            </p>
          </div>

          {/* 4. Shipping Charges */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-900 shrink-0" />
              <span>4. Shipping Charges</span>
            </h2>
            <p className="text-slate-600">
              Applicable shipping charges will be displayed at checkout before you complete your purchase.
            </p>
          </div>

          {/* 5. Order Tracking */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-900 shrink-0" />
              <span>5. Order Tracking</span>
            </h2>
            <p className="text-slate-600">
              Once your order is dispatched, tracking details will be shared when available. Courier tracking updates may take some time to appear. You can also track your live courier status directly using our{' '}
              <Link 
                to="/track" 
                className="font-medium text-slate-900 hover:text-blue-600 underline underline-offset-2"
              >
                Track Order portal
              </Link>.
            </p>
          </div>

          {/* 6. Delivery Delays */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>6. Delivery Delays</span>
            </h2>
            <p className="text-slate-600">
              Unexpected delays may occur due to weather, courier disruptions, public holidays or other circumstances beyond our control. We will assist you with tracking updates where possible.
            </p>
          </div>

          {/* 7. Incorrect Delivery Address */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Navigation className="w-5 h-5 text-slate-900 shrink-0" />
              <span>7. Incorrect Delivery Address</span>
            </h2>
            <p className="text-slate-600">
              Please ensure that your shipping address, phone number and PIN code are correct when placing an order. Incorrect or incomplete details may cause delivery delays or failed delivery.
            </p>
          </div>

          {/* 8. Damaged or Incorrect Shipments */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-slate-900 shrink-0" />
              <span>8. Damaged or Incorrect Shipments</span>
            </h2>
            <p className="text-slate-600">
              If you receive a damaged package or an incorrect item, please contact us promptly with your order number and supporting photographs so we can investigate and assist you.
            </p>
          </div>

          {/* 9. Contact Us */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Mail className="w-5 h-5 text-slate-900 shrink-0" />
              <span>9. Contact Us</span>
            </h2>
            <p className="text-slate-600">
              For shipping or delivery-related questions, contact our team:
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
              <span>We appreciate your trust in TAT RABBIT and strive to provide a smooth delivery experience.</span>
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
            to="/track"
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold px-5 py-3 rounded-full transition-all border border-slate-300"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Live Order</span>
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
