import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  X, 
  FileText 
} from 'lucide-react';

import logoLight from '../../assets/logo-light.png';

export const Footer = () => {
  const [activePolicy, setActivePolicy] = useState(null);

  const policyContent = {
    privacy: {
      title: 'Privacy Policy',
      content: `At TatRabbit, your privacy is our utmost priority. We collect customer information solely to fulfill equipment orders, communicate courier tracking details, and provide technical studio assistance. We do not sell or lease your personal or studio data to any third parties. All transactions and card details are encrypted via SSL through RBI-compliant secure payment gateways.`
    },
    terms: {
      title: 'Terms & Conditions',
      content: `All products sold on TatRabbit are intended strictly for certified tattoo practitioners, licensed studios, and registered apprentices. By placing an order, you agree to inspect all sterilized packages upon delivery. We reserve the right to limit quantities or cancel orders suspected of fraudulent resale.`
    },
    cancellation: {
      title: 'Cancellation Policy',
      content: `Orders can be cancelled free of charge prior to warehouse dispatch (usually within 2 hours of payment). Once an order has been picked up by the express courier and assigned an AWB tracking number, cancellations cannot be processed; however, you may initiate a return upon receipt according to our Return Policy.`
    },
    shipping: {
      title: 'Shipping Policy',
      content: `We offer Pan-India express dispatch. Studio orders confirmed before 2:00 PM IST are handed over to BlueDart, DTDC, or Delhivery the very same day. Delivery typically takes 24 to 48 hours for metro cities and 3 to 5 business days for other regions. Tracking numbers are shared automatically via SMS and WhatsApp.`
    },
    refund: {
      title: 'Refund & Return Policy',
      content: `At TAT RABBIT, your satisfaction matters to us. Return requests for eligible unopened and unused products must be submitted within 48 hours of delivery in original packaging. For hygiene reasons, opened personal-care products and ointments cannot normally be returned. Approved refunds are processed within 3–7 business days.`
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 mt-6 sm:mt-10 border-t border-slate-800 font-sans">
      




      {/* 3. Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Column 1: Brand Info with Clean Transparent Logo */}
        <div className="space-y-4">
          <Link to="/" className="inline-block group">
            <img 
              src={logoLight} 
              alt="TatRabbit" 
              className="h-14 sm:h-18 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md" 
            />
          </Link>
          <p className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-slate-400 font-heading leading-relaxed">
            CRAFTED FOR ARTISTS. DRIVEN BY PRECISION
          </p>
        </div>

        {/* Column 2: ABOUT TAT RABBIT */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4 font-heading">
            ABOUT TAT RABBIT
          </h4>
          <ul className="space-y-3 text-xs">
            <li>
              <Link to="/about" className="hover:text-blue-400 transition-colors">
                Our Story
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-blue-400 transition-colors">
                Contact & Support
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-blue-400 transition-colors">
                Studio Knowledge Hub
              </Link>
            </li>
            <li>
              <Link to="/reviews" className="hover:text-blue-400 transition-colors">
                Verified Artist Reviews
              </Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-blue-400 transition-colors">
                Equipment Catalog
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: LEGAL & POLICIES */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4 font-heading">
            LEGAL & POLICIES
          </h4>
          <ul className="space-y-3 text-xs">
            <li>
              <Link 
                to="/terms"
                className="hover:text-blue-400 transition-colors text-left inline-block"
              >
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link 
                to="/shipping-policy"
                className="hover:text-blue-400 transition-colors text-left inline-block"
              >
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link 
                to="/refund-policy"
                className="hover:text-blue-400 transition-colors text-left inline-block"
              >
                Refund & Return Policy
              </Link>
            </li>
            <li>
              <Link 
                to="/payment-policy"
                className="hover:text-blue-400 transition-colors text-left inline-block"
              >
                Payment Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: STAY CONNECTED */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-heading">
            STAY CONNECTED
          </h4>
          <p className="text-xs leading-relaxed text-slate-400">
            Follow TAT RABBIT for new products, studio essentials and brand updates.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

      {/* 4. Bottom Copyright & Trust Bar */}
      <div className="border-t border-slate-800/90 bg-slate-950 py-6 text-center text-xs text-slate-500 space-y-2 px-4">
        <div>
          &copy; {new Date().getFullYear()} TAT RABBIT&reg;. All Rights Reserved.
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Secure Payments &bull; Customer Support &bull; India-Wide Delivery
        </div>
      </div>

      {/* Policy View Modal */}
      {activePolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl relative animate-fadeIn text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm sm:text-base">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>{policyContent[activePolicy]?.title}</span>
              </div>
              <button
                onClick={() => setActivePolicy(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-h-96 overflow-y-auto pr-2">
              {policyContent[activePolicy]?.content}
            </p>
            <div className="pt-2 text-right">
              <button
                onClick={() => setActivePolicy(null)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
};
