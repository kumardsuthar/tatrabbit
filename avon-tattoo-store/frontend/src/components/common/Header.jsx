import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Package, 
  Search, 
  ChevronDown, 
  Heart, 
  Zap, 
  Sliders, 
  Layers, 
  Sparkles, 
  Tag,
  Truck
} from 'lucide-react';
import logoImg from '../../assets/logo.jpeg';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { WishlistDrawer } from './WishlistDrawer';
import api from '../../services/api';

export const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemCount } = useCart();
  const { wishlistCount } = useWishlist();

  let festival = null;
  try {
    const themeCtx = useTheme();
    festival = themeCtx?.currentTheme;
  } catch (e) {
    festival = null;
  }

  const [topBannerDismissed, setTopBannerDismissed] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [activeNavDropdown, setActiveNavDropdown] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic categories state
  const [categoriesList, setCategoriesList] = useState([
    { category: 'Machines', count: null },
    { category: 'Needles', count: null },
    { category: 'Inks', count: null },
    { category: 'Power Supplies', count: null },
    { category: 'Hygiene', count: null },
  ]);

  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    fetchHeaderCategories();
  }, []);

  const fetchHeaderCategories = async () => {
    try {
      const res = await api.get('/products/list.php');
      if (res.data && res.data.categories) {
        const catsFromDb = res.data.categories.filter((c) => c.category && c.category !== 'All');
        if (catsFromDb.length > 0) {
          setCategoriesList(catsFromDb);
        }
      }
    } catch (err) {
      console.error('Failed to load header categories:', err);
    }
  };

  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [searchModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        if (searchModalOpen && !searchQuery.trim()) {
          setSearchModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchModalOpen, searchQuery]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchModalOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm font-sans">
      {/* 1. Top Announcement Bar (Blue Banner) */}
      {!topBannerDismissed && (
        <div className="bg-blue-600 text-white text-xs py-2 px-4 flex items-center justify-between z-50">
          <div className="mx-auto flex items-center gap-2 font-medium">
            <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
            <span>The best-selling tattoo supplies — all under special offer.</span>
            <Link to="/" className="underline font-semibold hover:text-blue-100 transition-colors">
              Shop Now
            </Link>
          </div>
          <button
            onClick={() => setTopBannerDismissed(true)}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-blue-700/50 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group py-1">
              <img
                src={logoImg}
                alt="TatRabbit"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              {festival && festival.key !== 'default' && (
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${festival.primaryColor || 'bg-amber-600'} text-white shadow-xs`}>
                  {festival.key.toUpperCase()}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-xs font-semibold text-slate-800 hover:text-blue-600 transition-colors">
              Home
            </Link>

            {/* Shop (Categories Dropdown) */}
            <div className="relative group" onMouseEnter={() => setActiveNavDropdown('shop')} onMouseLeave={() => setActiveNavDropdown(null)}>
              <Link to="/shop" className="flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-blue-600 py-2 transition-colors">
                Shop <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform" />
              </Link>
              {activeNavDropdown === 'shop' && (
                <div className="absolute left-0 top-full w-72 bg-white border border-slate-100 rounded-2xl shadow-xl py-2.5 z-50 animate-fadeIn max-h-96 overflow-y-auto">
                  <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span>Equipment Categories</span>
                    <span className="text-blue-600 font-medium font-mono">{categoriesList.length}</span>
                  </div>
                  <Link to="/shop" className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                    <span>All Equipment Catalog</span>
                  </Link>
                  {categoriesList.map((catItem, idx) => {
                    const catName = typeof catItem === 'string' ? catItem : catItem.category;
                    const count = typeof catItem === 'object' ? catItem.count : null;
                    return (
                      <Link
                        key={idx}
                        to={`/shop?category=${encodeURIComponent(catName)}`}
                        className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <span>{catName}</span>
                        {count !== null && count !== undefined && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                            {count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dynamic Blog Link */}
            <Link to="/blog" className="text-xs font-semibold text-slate-800 hover:text-blue-600 transition-colors flex items-center gap-1.5">
              Blog & Hub <span className="bg-blue-50 text-blue-600 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-blue-100">New</span>
            </Link>

            {/* Verified Reviews Link */}
            <Link to="/reviews" className="text-xs font-semibold text-slate-800 hover:text-blue-600 transition-colors">
              Reviews
            </Link>

            {/* Dynamic About Us Link */}
            <Link to="/about" className="text-xs font-semibold text-slate-800 hover:text-blue-600 transition-colors">
              About Us
            </Link>

            {/* Dynamic Contact Link */}
            <Link to="/contact" className="text-xs font-semibold text-slate-800 hover:text-blue-600 transition-colors">
              Contact Us
            </Link>
          </nav>

          {/* Right Header Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Search Trigger Icon Button */}
            <button
              onClick={() => setSearchModalOpen(!searchModalOpen)}
              className={`p-1.5 sm:p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all ${
                searchModalOpen
                  ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500/20'
                  : ''
              }`}
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* User Account Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-1.5 sm:p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all flex items-center gap-1"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[11px] font-medium text-slate-400">Signed in as</p>
                      <p className="text-xs font-semibold text-slate-800 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" /> Order History
                    </Link>

                    <Link
                      to="/track"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <Truck className="w-4 h-4 text-slate-400" /> Track Order
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" /> Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="p-1.5 sm:p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all"
                aria-label="Account Login"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            )}

            {/* Wishlist Icon */}
            <button
              onClick={() => setWishlistDrawerOpen(true)}
              className="p-1.5 sm:p-2 text-slate-700 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              aria-label="Saved Wishlist"
              title="View Saved Wishlist"
            >
              <span className="relative inline-flex items-center justify-center">
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlistCount > 0 ? 'text-red-500 fill-red-500' : ''}`} />
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-semibold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center border border-white shadow-2xs">
                  {wishlistCount}
                </span>
              </span>
            </button>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="p-1.5 sm:p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all"
              aria-label="Shopping Cart"
            >
              <span className="relative inline-flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] sm:text-[10px] font-semibold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center border border-white shadow-2xs">
                  {totalItemCount}
                </span>
              </span>
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Search Bar Overlay Modal (Smooth Slide & Fade Animation) */}
      <div
        className={`bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 px-4 transition-all duration-300 ease-in-out overflow-hidden shadow-2xs ${
          searchModalOpen
            ? 'max-h-24 py-3 opacity-100 translate-y-0'
            : 'max-h-0 py-0 opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search rotary machines, cartridges, pigments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-2xs"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex-shrink-0 active:scale-95"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setSearchModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors flex-shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* 3. Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 animate-fadeIn">
          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-800 hover:text-blue-600 py-2">
            All Equipment Catalog
          </Link>
          {categoriesList.map((catItem, idx) => {
            const catName = typeof catItem === 'string' ? catItem : catItem.category;
            return (
              <Link
                key={idx}
                to={`/shop?category=${encodeURIComponent(catName)}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-600 hover:text-blue-600 py-1.5 pl-3"
              >
                • {catName}
              </Link>
            );
          })}
          <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-800 hover:text-blue-600 py-2 border-t border-slate-100">
            Blog & Knowledge Hub
          </Link>
          <Link to="/reviews" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-800 hover:text-blue-600 py-2">
            Verified Artist Reviews
          </Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-800 hover:text-blue-600 py-2">
            About Us
          </Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-800 hover:text-blue-600 py-2">
            Contact Support
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-800 py-2">
                My Orders
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-amber-600 py-2">
                  Studio Admin Panel
                </Link>
              )}
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-semibold text-slate-700 py-2.5 bg-slate-100 rounded-xl">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-semibold text-white bg-blue-600 py-2.5 rounded-xl shadow-md">
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
      {/* Wishlist Slide-Over Drawer */}
      <WishlistDrawer isOpen={wishlistDrawerOpen} onClose={() => setWishlistDrawerOpen(false)} />
    </header>
  );
};
