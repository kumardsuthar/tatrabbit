import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  ShoppingBag, 
  CheckCircle2, 
  Compass, 
  Wrench, 
  Droplet, 
  Layers, 
  HeartHandshake 
} from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const About = () => {
  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 space-y-10 sm:space-y-12 font-sans">
      <SEO 
        title="About Us | TAT RABBIT" 
        description="Crafted for Artists. Driven by Precision. Discover TAT RABBIT's story, philosophy, and wide range of tattoo machines, cartridges, inks, and studio essentials." 
      />

      {/* Navigation Breadcrumb */}
      <div>
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Hero Header - Centered & Aligned */}
      <header className="text-center space-y-4 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>About Us</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-slate-900 tracking-tight">
          ABOUT TAT RABBIT
        </h1>
        <p className="text-sm sm:text-base font-semibold text-blue-600 tracking-wide uppercase">
          Crafted for Artists. Driven by Precision.
        </p>
        <p className="text-base sm:text-lg text-slate-700 leading-relaxed pt-1">
          At <strong className="text-slate-900 font-semibold">TAT RABBIT</strong>, we believe every great tattoo begins with the right tools, reliable equipment and attention to detail.
        </p>
      </header>

      {/* Who We Are & Our Story Card */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900 tracking-tight">
              Our Story & Purpose
            </h2>
            <p className="text-xs text-slate-500">Built to serve the evolving needs of the tattoo community</p>
          </div>
        </div>

        <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
          <p>
            We are a tattoo-focused brand offering a wide range of tattoo products, including tattoo machines, inks, cartridges, accessories, hygiene essentials and aftercare products. Our goal is to make it easier for tattoo artists, studios and enthusiasts to find the products they need in one place.
          </p>
          <p>
            TAT RABBIT was created with a vision to serve the evolving needs of the tattoo community. We aim to bring together practical, carefully selected tattoo products that support artists throughout their work.
          </p>
          <p>
            From essential tattoo equipment to inks, accessories and aftercare products, we want to make discovering the right products simple and convenient.
          </p>
        </div>
      </section>

      {/* What We Offer - 4-Column Balanced Grid */}
      <section className="space-y-5">
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
            What We Offer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Essential tools and supplies for artists, studios, and apprentices
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2 hover:border-slate-300 transition-all flex flex-col justify-start">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-semibold text-slate-900 text-sm sm:text-base">
                Tattoo Machines & Equipment
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-12">
              Tools and equipment for tattoo artists.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2 hover:border-slate-300 transition-all flex flex-col justify-start">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Droplet className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-semibold text-slate-900 text-sm sm:text-base">
                Tattoo Inks & Cartridges
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-12">
              Products for different tattooing needs.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2 hover:border-slate-300 transition-all flex flex-col justify-start">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-semibold text-slate-900 text-sm sm:text-base">
                Tattoo Accessories
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-12">
              Essential supplies for professional tattoo setups.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2 hover:border-slate-300 transition-all flex flex-col justify-start">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-semibold text-slate-900 text-sm sm:text-base">
                Hygiene & Aftercare Products
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-12">
              Products designed for their intended cleaning and aftercare applications.
            </p>
          </div>

        </div>
      </section>

      {/* Our Philosophy - 4 Pillars Grid */}
      <section className="space-y-5">
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
            Our Philosophy
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Core principles guiding every product we offer
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-900 font-heading font-semibold text-sm sm:text-base">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4>Quality in Every Detail</h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-10.5">
              We focus on offering products with clear information and practical value.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-900 font-heading font-semibold text-sm sm:text-base">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <h4>Built Around Artists</h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-10.5">
              We aim to serve the needs of tattoo artists, studios and the wider tattoo community.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-900 font-heading font-semibold text-sm sm:text-base">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4>Transparency You Can Trust</h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-10.5">
              We believe in clear product descriptions, honest communication and helpful customer support.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-900 font-heading font-semibold text-sm sm:text-base">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h4>A Better Shopping Experience</h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-10.5">
              We want finding tattoo products to be simple, convenient and reliable.
            </p>
          </div>

        </div>
      </section>

      {/* Our Commitment & Explore TAT RABBIT - 2 Column Balanced Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Commitment</span>
          </div>
          <h3 className="font-heading font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
            Our Commitment
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            At TAT RABBIT, we are committed to improving our product range and shopping experience as the tattoo industry evolves. We aim to help customers explore suitable products with confidence and access the information they need before making a purchase.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Explore</span>
          </div>
          <h3 className="font-heading font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
            Explore TAT RABBIT
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Whether you are a professional tattoo artist, a studio owner or a tattoo enthusiast, discover our growing collection of tattoo products and accessories.
          </p>
        </div>
      </section>

      {/* Slogan Banner & Call to Action */}
      <section className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xl border border-slate-800">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          TAT RABBIT
        </p>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
          Crafted for Artists. Driven by Precision.
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Discover our collection of tattoo machines, precision cartridge needles, certified inks, and essential studio supplies.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-6 py-3.5 rounded-full transition-all shadow-md shadow-blue-600/30 hover:scale-105"
          >
            <span>Explore Equipment Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold px-6 py-3.5 rounded-full transition-all border border-slate-800"
          >
            <span>Contact Studio Support</span>
          </Link>
        </div>
      </section>

    </div>
  );
};
