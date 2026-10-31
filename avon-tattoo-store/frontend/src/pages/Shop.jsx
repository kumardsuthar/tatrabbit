import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  Grid3X3, 
  LayoutGrid, 
  List, 
  Check, 
  ChevronRight, 
  Tag, 
  Sparkles, 
  ShoppingBag, 
  Layers, 
  ArrowUpDown, 
  CheckCircle2 
} from 'lucide-react';
import { ProductCard } from '../components/cards/ProductCard';
import { CustomSelect } from '../components/common/CustomSelect';
import { SEO } from '../components/common/SEO';
import api from '../services/api';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Params State
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialMinPrice = searchParams.get('min_price') || '';
  const initialMaxPrice = searchParams.get('max_price') || '';
  const initialInStock = searchParams.get('in_stock') === '1';

  // Filter States
  const [category, setCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [inStockOnly, setInStockOnly] = useState(initialInStock);

  // Response Data States
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 50000 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (Default Grid View) or 'list' (Horizontal List Card)

  // Sync state with URL params change
  useEffect(() => {
    setCategory(searchParams.get('category') || 'All');
    setSearchQuery(searchParams.get('search') || '');
    setSortBy(searchParams.get('sort') || 'newest');
    setMinPrice(searchParams.get('min_price') || '');
    setMaxPrice(searchParams.get('max_price') || '');
    setInStockOnly(searchParams.get('in_stock') === '1');
  }, [searchParams]);

  // Fetch products from backend whenever filters change
  useEffect(() => {
    fetchProducts();
  }, [category, searchQuery, sortBy, minPrice, maxPrice, inStockOnly]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (sortBy) params.append('sort', sortBy);
      if (minPrice !== '') params.append('min_price', minPrice);
      if (maxPrice !== '') params.append('max_price', maxPrice);
      if (inStockOnly) params.append('in_stock', '1');

      const res = await api.get(`/products/list.php?${params.toString()}`);
      setProducts(res.data.products || []);
      
      if (res.data.categories) {
        setCategoriesList(res.data.categories);
      }
      if (res.data.price_bounds) {
        setPriceBounds(res.data.price_bounds);
      }
    } catch (err) {
      console.error('Failed to fetch filtered products:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUrlParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === '' || val === null || val === 'All' || val === false) {
        updated.delete(key);
      } else {
        updated.append(key, val);
      }
    });
    setSearchParams(updated);
  };

  const handleCategorySelect = (catName) => {
    setCategory(catName);
    const newParams = { category: catName };
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setCategory('All');
    setSearchQuery('');
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSearchParams({});
  };

  const hasActiveFilters = category !== 'All' || searchQuery !== '' || minPrice !== '' || maxPrice !== '' || inStockOnly;

  // Find selected category metadata from backend list
  const activeCatMeta = useMemo(() => {
    if (!category || category === 'All') return null;
    return categoriesList.find(
      (c) => (c.category || c.name || '').toLowerCase() === category.toLowerCase()
    ) || null;
  }, [categoriesList, category]);

  // Dynamic banner title & description with proper fallback
  const bannerTitle = activeCatMeta?.title?.trim()
    ? activeCatMeta.title.trim()
    : (category !== 'All' ? `${category} Equipment Catalog` : 'TatRabbit Equipment Catalog');

  const bannerDescription = activeCatMeta?.description?.trim()
    ? activeCatMeta.description.trim()
    : 'Explore surgical-grade rotary pen machines, EO gas sterilized cartridges, obsidian lining inks, and digital power units.';

  return (
    <div className="space-y-8 pb-4 font-sans">
      <SEO
        title={`${bannerTitle} - TatRabbit`}
        description={bannerDescription}
        keywords="rotary pen machines, tattoo needles, cartridge needles, obsidian black ink, power supplies, tattoo equipment India"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Equipment Catalog', url: '/shop' },
          ...(category !== 'All' ? [{ name: category, url: `/shop?category=${encodeURIComponent(category)}` }] : [])
        ]}
      />
      
      {/* 1. HERO HEADER BANNER */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-10 shadow-lg border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-widest">
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            {category !== 'All' ? (
              <>
                <Link to="/shop" className="hover:underline">Equipment Catalog</Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-white">{category}</span>
              </>
            ) : (
              <span className="text-white">Equipment Catalog</span>
            )}
          </div>

          <h1 className="font-heading font-semibold text-base sm:text-lg text-white tracking-tight">
            {bannerTitle}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {bannerDescription}
          </p>

          {/* Quick Search Bar inside Hero Header */}
          <div className="pt-2 max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search rotary pens, cartridges, pigments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl pl-11 pr-10 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN LAYOUT GRID: SIDEBAR FILTERS + PRODUCTS CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block bg-white border border-slate-200/90 rounded-[2rem] p-6 space-y-6 shadow-xs sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-heading font-semibold text-sm text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Equipment Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Category Filter List */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Categories</h4>
            <div className="space-y-1">
              {categoriesList.map((cat, idx) => {
                const isSelected = category === cat.category;
                return (
                  <button
                    key={idx}
                    onClick={() => handleCategorySelect(cat.category)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                    }`}
                  >
                    <span>{cat.category === 'All' ? 'All Studio Equipment' : cat.category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Price Range (₹)</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Min Price</label>
                <input
                  type="number"
                  placeholder="₹ 0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Max Price</label>
                <input
                  type="number"
                  placeholder={`₹ ${priceBounds.max}`}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Quick Price Preset Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => { setMinPrice(''); setMaxPrice('2000'); }}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                Under ₹2,000
              </button>
              <button
                onClick={() => { setMinPrice('2000'); setMaxPrice('10000'); }}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                ₹2,000 - ₹10,000
              </button>
              <button
                onClick={() => { setMinPrice('10000'); setMaxPrice(''); }}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                Over ₹10,000
              </button>
            </div>
          </div>

          {/* Availability Switch */}
          <div className="border-t border-slate-100 pt-5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">In-Stock Items Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 bg-slate-100 border-slate-300"
              />
            </label>
          </div>
        </aside>

        {/* PRODUCTS LISTING CONTAINER */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TOP CONTROL BAR: Sorting & Filter Chips & View Mode */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            
            {/* Left Result Count & Mobile Filter Trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden bg-slate-900 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>

              <div>
                <h2 className="font-heading font-semibold text-sm text-slate-900">
                  {loading ? 'Searching Catalog...' : `${products.length} Equipment Items Found`}
                </h2>
                {category !== 'All' && (
                  <p className="text-[11px] text-slate-500 font-medium">Filtered by: <strong className="text-blue-600">{category}</strong></p>
                )}
              </div>
            </div>

            {/* Right Sort Selector & View Modes */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 min-w-[160px]">
                <span className="text-xs text-slate-500 font-semibold hidden sm:inline flex-shrink-0">Sort:</span>
                <CustomSelect
                  size="sm"
                  options={[
                    { label: 'Newest Arrivals', value: 'newest' },
                    { label: 'Price: Low to High', value: 'price_asc' },
                    { label: 'Price: High to Low', value: 'price_desc' },
                    { label: 'Name: A to Z', value: 'title_asc' },
                    { label: 'Name: Z to A', value: 'title_desc' }
                  ]}
                  value={sortBy}
                  onChange={(val) => setSortBy(val)}
                />
              </div>

              {/* View Layout Toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
                  title="3 Columns Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Horizontal List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE FILTER BADGE CHIPS */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 bg-blue-50/60 border border-blue-100 p-3 rounded-2xl">
              <span className="text-[11px] font-semibold text-blue-900 uppercase tracking-wider">Active Filters:</span>

              {category !== 'All' && (
                <span className="inline-flex items-center gap-1.5 bg-white text-blue-700 text-xs font-semibold px-3 py-1 rounded-xl border border-blue-200 shadow-2xs">
                  Category: {category}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-500" onClick={() => handleCategorySelect('All')} />
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-white text-blue-700 text-xs font-semibold px-3 py-1 rounded-xl border border-blue-200 shadow-2xs">
                  Search: "{searchQuery}"
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-500" onClick={() => setSearchQuery('')} />
                </span>
              )}

              {minPrice && (
                <span className="inline-flex items-center gap-1.5 bg-white text-blue-700 text-xs font-semibold px-3 py-1 rounded-xl border border-blue-200 shadow-2xs">
                  Min: ₹{minPrice}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-500" onClick={() => setMinPrice('')} />
                </span>
              )}

              {maxPrice && (
                <span className="inline-flex items-center gap-1.5 bg-white text-blue-700 text-xs font-semibold px-3 py-1 rounded-xl border border-blue-200 shadow-2xs">
                  Max: ₹{maxPrice}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-500" onClick={() => setMaxPrice('')} />
                </span>
              )}

              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 bg-white text-blue-700 text-xs font-semibold px-3 py-1 rounded-xl border border-blue-200 shadow-2xs">
                  In Stock Only
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-500" onClick={() => setInStockOnly(false)} />
                </span>
              )}

              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-red-600 hover:underline ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {/* PRODUCTS DISPLAY GRID OR LIST */}
          {loading ? (
            <div className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2.5 sm:gap-5'}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white border border-slate-200 rounded-[1.8rem] h-80 animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            viewMode === 'list' ? (
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} layout="list" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2.5 sm:gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} layout="grid" />
                ))}
              </div>
            )
          ) : (
            <div className="bg-white border border-slate-200 rounded-[2rem] p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-slate-900">No Equipment Items Match Your Filters</h3>
                <p className="text-xs text-slate-500 mt-1">Try resetting your price range, search query, or category selection.</p>
              </div>
              <button
                onClick={handleClearFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE SLIDE-OVER FILTER PANEL */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 font-sans">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-heading font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Filter Catalog
                </h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Categories</h4>
                <div className="space-y-1">
                  {categoriesList.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => { handleCategorySelect(cat.category); setMobileFilterOpen(false); }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        category === cat.category ? 'bg-blue-600 text-white font-semibold' : 'text-slate-700 bg-slate-50'
                      }`}
                    >
                      <span>{cat.category === 'All' ? 'All Studio Equipment' : cat.category}</span>
                      <span className="text-[10px] opacity-80">({cat.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2.5 border-t border-slate-100 pt-4">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Price Filter (₹)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="border-t border-slate-100 pt-4">
                <label className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">In-Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-blue-600 text-white font-semibold text-xs py-3 rounded-xl shadow-md"
              >
                Apply Filters
              </button>
              <button
                onClick={() => { handleClearFilters(); setMobileFilterOpen(false); }}
                className="w-full bg-slate-100 text-slate-600 font-semibold text-xs py-2.5 rounded-xl"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
