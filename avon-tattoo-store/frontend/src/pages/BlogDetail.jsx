import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Share2, 
  Check, 
  BookOpen, 
  ArrowRight, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import api from '../services/api';
import { cleanProductImageUrl } from '../utils/imageUrl';

export const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogDetail();
  }, [slug]);

  const fetchBlogDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/blogs/detail.php?slug=${encodeURIComponent(slug)}`);
      if (res.data && res.data.blog) {
        setBlog(res.data.blog);
        setRelatedBlogs(res.data.related_blogs || []);
      } else {
        setBlog(null);
      }
    } catch (err) {
      console.warn('API blog fetch failed:', err);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loading article...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-heading font-semibold text-slate-900">Article Not Found</h2>
        <p className="text-slate-500 text-sm">
          The blog article you are looking for does not exist or may have been unpublished.
        </p>
        <div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Studio Blog
          </Link>
        </div>
      </div>
    );
  }

  const cleanImg = cleanProductImageUrl(blog.image_url || blog.image);
  const formattedDate = blog.created_at
    ? new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : (blog.date || 'Recent');
  const readTime = blog.read_time || blog.readTime || '5 min read';
  const authorName = blog.author || 'TatRabbit Master Studio';

  // Check if content is HTML or raw text/markdown
  const isHtml = /<[a-z][\s\S]*>/i.test(blog.content || '');

  return (
    <article className="max-w-5xl mx-auto py-4 sm:py-8 space-y-8 sm:space-y-10 font-sans">
      <SEO
        title={`${blog.title} - TatRabbit Master Studio`}
        description={blog.excerpt || blog.title}
        keywords={`${blog.category || 'Tattoo Equipment'}, tattoo blog, ${blog.title}`}
      />

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="text-slate-300">/</span>
          <Link to="/blog" className="hover:text-blue-600 transition-colors">Blog & Hub</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-semibold truncate max-w-[180px] sm:max-w-xs">{blog.category || 'Article'}</span>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl transition-all shadow-2xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>All Articles</span>
          </Link>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl transition-all shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Header - Centered & Aligned like About & Blog Hub */}
      <header className="text-center space-y-4 max-w-3xl mx-auto px-2">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>{blog.category || 'Equipment Masterclass'}</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          {blog.title}
        </h1>

        {/* Author & Meta - Centered */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-500 font-medium pt-2 pb-1">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] uppercase font-bold shadow-2xs">
              {authorName.charAt(0)}
            </div>
            <span className="text-slate-900">{authorName}</span>
          </div>

          <span className="text-slate-300">•</span>

          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            {formattedDate}
          </span>

          <span className="text-slate-300">•</span>

          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            {readTime}
          </span>
        </div>
      </header>

      {/* Featured Cover Image - Centered and Aligned with Header & Content */}
      {cleanImg ? (
        <div className="max-w-3xl mx-auto w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-xs flex items-center justify-center py-6 px-4 sm:py-8 sm:px-6">
          <img
            src={cleanImg}
            alt={blog.title}
            className="max-h-[280px] sm:max-h-[340px] max-w-full w-auto h-auto object-contain drop-shadow-xs"
          />
        </div>
      ) : null}

      {/* Article Excerpt Lead-In */}
      {blog.excerpt && blog.excerpt.trim() !== (blog.content || '').trim() && (
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-50/80 to-indigo-50/40 border-l-4 border-blue-600 p-4 sm:p-5 rounded-r-2xl">
          <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed italic">
            "{blog.excerpt}"
          </p>
        </div>
      )}

      {/* Main Body Content */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xs">
        {isHtml ? (
          <div 
            className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-slate-100 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5 [&_li]:text-slate-700 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:bg-slate-50 [&_blockquote]:rounded-r-lg [&_img]:rounded-xl [&_img]:my-6 [&_img]:max-h-[400px] [&_img]:object-contain [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-700"
            dangerouslySetInnerHTML={{ __html: blog.content }} 
          />
        ) : (
          <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
            {blog.content}
          </div>
        )}
      </div>

      {/* Author Bio Card */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-xs">
          {authorName.charAt(0)}
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h4 className="font-heading font-semibold text-sm text-slate-900">{authorName}</h4>
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              Editorial Studio Specialist
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Professional technical documentation, equipment maintenance protocols, and precision tattoo guidance direct from the TatRabbit Master Studio.
          </p>
        </div>
      </div>

      {/* Studio Endorsement Box */}
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-blue-400" /> TatRabbit Studio Verified
          </div>
          <h3 className="text-base sm:text-lg font-heading font-semibold">
            Need Equipment Advice for Your Studio?
          </h3>
          <p className="text-xs text-slate-300 max-w-md">
            Our technical support team helps tattoo artists choose compatible wireless machines, needle configurations, and medical sterilization supplies.
          </p>
        </div>
        <Link
          to="/shop"
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <span>Explore Equipment</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Related Articles Section */}
      {relatedBlogs && relatedBlogs.length > 0 && (
        <section className="max-w-5xl mx-auto pt-6 border-t border-slate-200 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-base sm:text-lg text-slate-900">
              Related Masterclass Articles
            </h3>
            <Link to="/blog" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {relatedBlogs.map((rel) => {
              const relImg = cleanProductImageUrl(rel.image_url || rel.image);
              const relDate = rel.created_at
                ? new Date(rel.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                : (rel.date || 'Recent');
              return (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug || rel.id}`}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] bg-slate-50 overflow-hidden flex items-center justify-center p-2.5 sm:p-3">
                    {relImg ? (
                      <img
                        src={relImg}
                        alt={rel.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-blue-700 text-[8px] font-semibold px-2 py-0.5 rounded-full border border-slate-200 z-10">
                      {rel.category || 'Guide'}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold mb-1">
                        {relDate} • {rel.read_time || rel.readTime || '5 min'}
                      </div>
                      <h4 className="font-heading font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                    </div>

                    <div className="pt-2 text-[10px] font-semibold text-blue-600 flex items-center gap-1">
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
};
