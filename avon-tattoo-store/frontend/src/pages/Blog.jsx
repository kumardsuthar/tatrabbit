import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Clock,
  Search,
  ArrowRight,
  Sparkles,
  ChevronRight,
  X,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { cleanProductImageUrl } from '../utils/imageUrl';
import api from '../services/api';

export const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/blogs/list.php');
      if (res.data && Array.isArray(res.data.blogs)) {
        setBlogs(res.data.blogs);
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.warn('Could not load blogs from API:', err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique categories with counts
  const categoryStats = useMemo(() => {
    const counts = { All: blogs.length };
    blogs.forEach((b) => {
      const cat = b.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [blogs]);

  const categories = useMemo(() => {
    return Object.keys(categoryStats);
  }, [categoryStats]);

  // Filtered & Sorted Posts
  const filteredPosts = useMemo(() => {
    let list = blogs.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' || (post.category || 'General') === selectedCategory;

      const tagsStr = Array.isArray(post.tags)
        ? post.tags.join(' ')
        : post.tags || '';

      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch =
        (post.title || '').toLowerCase().includes(query) ||
        (post.excerpt || '').toLowerCase().includes(query) ||
        tagsStr.toLowerCase().includes(query) ||
        (post.category || '').toLowerCase().includes(query) ||
        (post.author || '').toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    return list.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      // default: newest
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [blogs, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-3 sm:px-6 lg:px-8 space-y-8 font-sans">
      <SEO
        title="Masterclass Blog & Tattoo Equipment Guides - TatRabbit"
        description="Professional technique guides, voltage tuning charts, cartridge sterilization standards, and ink chemistry insights for licensed tattoo artists."
        keywords="tattoo blog, rotary machine voltage guide, cartridge sterilization, black ink chemistry, tattoo guides India"
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900">Studio Knowledge Hub</span>
      </nav>

      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white p-6 sm:p-9 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>TatRabbit Studio Knowledge Hub</span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
            Masterclass Guides, Equipment Insights & Ink Science
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            In-depth engineering breakdowns, voltage calibrations, cartridge needle anatomy, and sterile bio-safety protocols curated by professional studio artists.
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <strong className="text-white font-semibold">{blogs.length}</strong> Published Articles
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <strong className="text-white font-semibold">{categories.length - 1}</strong> Specialized Topics
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-medium">Free for Professional Tattoo Artists</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = categoryStats[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-semibold px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-600/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2.5">
            {/* Live Search */}
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search articles, guides, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 placeholder-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Active Filter Status Bar */}
        {(selectedCategory !== 'All' || searchQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{filteredPosts.length}</strong> matching articles
              {selectedCategory !== 'All' && (
                <>
                  {' '}
                  in <strong className="text-blue-600">{selectedCategory}</strong>
                </>
              )}
              {searchQuery && (
                <>
                  {' '}
                  for "<em>{searchQuery}</em>"
                </>
              )}
            </span>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Blog Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden space-y-4 animate-pulse p-4"
            >
              <div className="aspect-[16/10] bg-slate-200 rounded-2xl" />
              <div className="space-y-2 p-2">
                <div className="w-24 h-3 bg-slate-200 rounded" />
                <div className="w-full h-4 bg-slate-200 rounded" />
                <div className="w-3/4 h-4 bg-slate-200 rounded" />
                <div className="w-full h-3 bg-slate-100 rounded pt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl p-8 space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-base text-slate-800">No Articles Found</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            We couldn't find any articles matching your search query or selected topic. Try adjusting your filters.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl border border-blue-200 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span>
              All Articles ({filteredPosts.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {filteredPosts.map((post) => {
              const cleanImg = cleanProductImageUrl(post.image_url || post.image);
              const pubDate = post.created_at
                ? new Date(post.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : post.date || 'Recent';
              const rTime = post.read_time || post.readTime || '5 min read';
              const postSlug = post.slug || post.id;
              const author = post.author || 'TatRabbit Studio';

              return (
                <article
                  key={post.id}
                  className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Card Cover Image: proper framing, full visibility without cropping */}
                  <Link
                    to={`/blog/${postSlug}`}
                    className="relative aspect-[16/10] bg-slate-50 border-b border-slate-100 overflow-hidden flex items-center justify-center p-3 sm:p-4 block cursor-pointer group-hover:bg-slate-100/70 transition-colors"
                  >
                    {cleanImg ? (
                      <img
                        src={cleanImg}
                        alt={post.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}

                    {/* Editorial Fallback Graphic */}
                    <div
                      className={`${
                        cleanImg ? 'hidden' : 'flex'
                      } w-full h-full flex-col items-center justify-center text-slate-300 space-y-2`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-heading">
                        TatRabbit Article
                      </span>
                    </div>
                  </Link>

                  {/* Post Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Category Badge & Read Time Meta Row */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {post.category || 'Guide'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{rTime}</span>
                        </span>
                      </div>

                      {/* Publish Date */}
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{pubDate}</span>
                      </div>

                      <Link to={`/blog/${postSlug}`} className="block group-hover:text-blue-600 transition-colors">
                        <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Footer: Author & Read More Link */}
                    <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                          {(author || 'T').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[110px] sm:max-w-[130px]">
                          {author}
                        </span>
                      </div>

                      <Link
                        to={`/blog/${postSlug}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/btn whitespace-nowrap"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Pro Studio Knowledge Newsletter / CTA Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold px-3 py-0.5 rounded-full border border-blue-400/30 uppercase tracking-wider">
            Tattoo Studio Masterclass
          </div>
          <h3 className="font-heading font-bold text-lg sm:text-2xl text-white">
            Have a Technique or Equipment Topic You'd Like Explored?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Our master technicians test wireless stroke configurations, needle cartridge taper flow, and ink pigment dispersion weekly. Let us know what you want benchmarked next.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 flex-shrink-0">
          <Link
            to="/contact"
            className="bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            <span>Suggest a Topic</span>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </Link>
          <Link
            to="/shop"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            <span>Explore Shop</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
