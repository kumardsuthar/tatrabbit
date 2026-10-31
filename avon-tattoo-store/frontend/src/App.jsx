import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';

import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ChatDrawer } from './components/support/ChatDrawer';
import { ScrollToTop } from './components/common/ScrollToTop';

import { Blog } from './pages/Blog';
import { BlogDetail } from './pages/BlogDetail';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { RefundPolicy } from './pages/RefundPolicy';
import { Terms } from './pages/Terms';
import { ShippingPolicy } from './pages/ShippingPolicy';
import { PaymentPolicy } from './pages/PaymentPolicy';

// Customer Pages
import { Home } from './pages/Home';
import { ReviewsPage } from './pages/Reviews';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderHistory } from './pages/OrderHistory';
import { TrackOrder } from './pages/TrackOrder';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { SiteSettings } from './pages/admin/SiteSettings';
import { Inventory } from './pages/admin/Inventory';
import { ProductFormPage } from './pages/admin/ProductFormPage';
import { Categories } from './pages/admin/Categories';
import { Orders } from './pages/admin/Orders';
import { Customers } from './pages/admin/Customers';
import { Reviews } from './pages/admin/Reviews';
import { Blogs } from './pages/admin/Blogs';
import { BlogFormPage } from './pages/admin/BlogFormPage';
import { Contacts } from './pages/admin/Contacts';
import { Coupons } from './pages/admin/Coupons';
import { KnowledgeBase } from './pages/admin/KnowledgeBase';
import { SupportTickets } from './pages/admin/SupportTickets';
import { RefundRequests } from './pages/admin/RefundRequests';
import { HeroSlider } from './pages/admin/HeroSlider';
import { HeroSlideFormPage } from './pages/admin/HeroSlideFormPage';
import { AdminLogin } from './pages/admin/AdminLogin';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <ScrollToTop />
              <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
              <Routes>
                {/* Admin Routes - Full Width without max-w-7xl container or padding */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/settings" element={<SiteSettings />} />
                <Route path="/admin/hero-slider" element={<HeroSlider />} />
                <Route path="/admin/hero-slider/new" element={<HeroSlideFormPage />} />
                <Route path="/admin/hero-slider/edit/:id" element={<HeroSlideFormPage />} />
                <Route path="/admin/inventory" element={<Inventory />} />
                <Route path="/admin/inventory/new" element={<ProductFormPage />} />
                <Route path="/admin/inventory/edit/:id" element={<ProductFormPage />} />
                <Route path="/admin/categories" element={<Categories />} />
                <Route path="/admin/orders" element={<Orders />} />
                <Route path="/admin/refunds" element={<RefundRequests />} />
                <Route path="/admin/tickets" element={<SupportTickets />} />
                <Route path="/admin/knowledge" element={<KnowledgeBase />} />
                <Route path="/admin/customers" element={<Customers />} />
                <Route path="/admin/reviews" element={<Reviews />} />
                <Route path="/admin/blogs" element={<Blogs />} />
                <Route path="/admin/blogs/new" element={<BlogFormPage />} />
                <Route path="/admin/blogs/edit/:id" element={<BlogFormPage />} />
                <Route path="/admin/contacts" element={<Contacts />} />
                <Route path="/admin/coupons" element={<Coupons />} />

              {/* Customer Routes - Storefront Layout */}
              <Route
                path="*"
                element={
                  <div className="flex-1 flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/products" element={<Shop />} />
                        <Route path="/category/:category" element={<Shop />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogDetail />} />
                        <Route path="/blog/id/:id" element={<BlogDetail />} />
                        <Route path="/reviews" element={<ReviewsPage />} />
                        <Route path="/verified-reviews" element={<ReviewsPage />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/about-us" element={<About />} />
                        <Route path="/refund-policy" element={<RefundPolicy />} />
                        <Route path="/refund-and-return-policy" element={<RefundPolicy />} />
                        <Route path="/return-policy" element={<RefundPolicy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/terms-and-conditions" element={<Terms />} />
                        <Route path="/terms-conditions" element={<Terms />} />
                        <Route path="/shipping-policy" element={<ShippingPolicy />} />
                        <Route path="/shipping" element={<ShippingPolicy />} />
                        <Route path="/payment-policy" element={<PaymentPolicy />} />
                        <Route path="/payments" element={<PaymentPolicy />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/product/id/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders" element={<OrderHistory />} />
                        <Route path="/track" element={<TrackOrder />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                      </Routes>
                    </main>
                    <Footer />
                    <ChatDrawer />
                  </div>
                }
              />
            </Routes>
          </div>
        </Router>
      </WishlistProvider>
    </CartProvider>
  </ThemeProvider>
</AuthProvider>
  );
}

