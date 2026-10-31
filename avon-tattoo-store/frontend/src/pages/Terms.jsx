import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Tag, 
  CreditCard, 
  Truck, 
  RotateCcw, 
  ShieldAlert, 
  Globe, 
  ExternalLink, 
  Scale, 
  RefreshCw, 
  Landmark, 
  Mail, 
  HeartHandshake 
} from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const Terms = () => {
  return (
    <div className="py-8 sm:py-16 font-sans">
      <SEO 
        title="Terms & Conditions | TAT RABBIT" 
        description="Review the terms and conditions for accessing and purchasing tattoo machines, supplies, and equipment from TAT RABBIT." 
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
            TERMS & CONDITIONS
          </h1>
        </header>

        {/* Main Content Body */}
        <div className="space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-heading font-semibold text-slate-900 tracking-tight">
              Welcome to TAT RABBIT
            </h2>
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal">
              By accessing or purchasing from{' '}
              <a 
                href="https://tatrabbit.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-medium text-slate-900 hover:text-blue-600 underline underline-offset-2"
              >
                https://tatrabbit.com/
              </a>
              , you agree to the following Terms & Conditions. Please read them before placing an order.
            </p>
          </div>

          {/* 1. Products & Information */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-slate-900 shrink-0" />
              <span>1. Products & Information</span>
            </h3>
            <p className="text-slate-600">
              We make every effort to provide accurate product descriptions, images and specifications. Minor variations in colour or appearance may occur due to screen settings or packaging updates.
            </p>
          </div>

          {/* 2. Pricing & Payments */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-900 shrink-0" />
              <span>2. Pricing & Payments</span>
            </h3>
            <p className="text-slate-600">
              All prices are displayed in Indian Rupees (INR). Prices and offers may change from time to time. Orders are subject to payment confirmation and product availability.
            </p>
          </div>

          {/* 3. Orders & Cancellation */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-900 shrink-0" />
              <span>3. Orders & Cancellation</span>
            </h3>
            <p className="text-slate-600">
              Please provide accurate contact and delivery details when placing an order. Cancellation requests should be submitted before dispatch. Once an order has been shipped, cancellation may not be possible.
            </p>
          </div>

          {/* 4. Shipping & Delivery */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-slate-900 shrink-0" />
              <span>4. Shipping & Delivery</span>
            </h3>
            <p className="text-slate-600">
              Delivery times are estimates and may vary depending on your location and courier service. Please refer to our Shipping Policy for complete details.
            </p>
          </div>

          {/* 5. Returns & Refunds */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-slate-900 shrink-0" />
              <span>5. Returns & Refunds</span>
            </h3>
            <p className="text-slate-600">
              Returns, replacements and refunds are handled according to our{' '}
              <Link 
                to="/refund-policy" 
                className="font-medium text-slate-900 hover:text-blue-600 underline underline-offset-2"
              >
                Refund & Return Policy
              </Link>
              . Customers' rights under applicable consumer protection laws remain unaffected.
            </p>
          </div>

          {/* 6. Product Use */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-slate-900 shrink-0" />
              <span>6. Product Use</span>
            </h3>
            <p className="text-slate-600">
              Please read product labels, instructions and safety warnings before use. TAT RABBIT products must be used only for their intended purposes.
            </p>
          </div>

          {/* 7. Website Use */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-slate-900 shrink-0" />
              <span>7. Website Use</span>
            </h3>
            <p className="text-slate-600">
              Customers must not use our website for fraudulent, unlawful or unauthorized activities. Website content, including branding, logos, text and images, may not be copied or commercially used without permission, except as permitted by law.
            </p>
          </div>

          {/* 8. Third-Party Services */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-slate-900 shrink-0" />
              <span>8. Third-Party Services</span>
            </h3>
            <p className="text-slate-600">
              Our website may use third-party payment gateways and courier services. Their services may be subject to their own terms and policies.
            </p>
          </div>

          {/* 9. Limitation of Liability */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Scale className="w-5 h-5 text-slate-900 shrink-0" />
              <span>9. Limitation of Liability</span>
            </h3>
            <p className="text-slate-600">
              Nothing in these terms excludes any liability or consumer rights that cannot legally be excluded under applicable law.
            </p>
          </div>

          {/* 10. Policy Updates */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-slate-900 shrink-0" />
              <span>10. Policy Updates</span>
            </h3>
            <p className="text-slate-600">
              We may update these Terms & Conditions when necessary. The latest version will be available on this page.
            </p>
          </div>

          {/* 11. Governing Law */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Landmark className="w-5 h-5 text-slate-900 shrink-0" />
              <span>11. Governing Law</span>
            </h3>
            <p className="text-slate-600">
              These terms are governed by the laws of India, subject to applicable consumer protection laws.
            </p>
          </div>

          {/* 12. Contact Us */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base sm:text-lg font-heading font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Mail className="w-5 h-5 text-slate-900 shrink-0" />
              <span>12. Contact Us</span>
            </h3>
            <p className="text-slate-600">
              For questions or assistance, please contact us:
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
              <span>We appreciate your trust in TAT RABBIT and thank you for shopping with us.</span>
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
