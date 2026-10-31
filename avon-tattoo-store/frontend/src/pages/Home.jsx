import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ChevronRight,
  HelpCircle,
  ChevronDown,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Plus,
  X,
  MessageSquare,
  Truck,
  RefreshCw,
  Zap,
  Headphones,
  Image as ImageIcon
} from 'lucide-react';
import Slider from 'react-slick';
import { SEO } from '../components/common/SEO';
import { Modal } from '../components/common/Modal';
import { ProductCard } from '../components/cards/ProductCard';
import { ReviewCard } from '../components/cards/ReviewCard';
import { ReviewMediaUpload } from '../components/common/ReviewMediaUpload';
import { CustomCatalogShowcase } from '../components/common/CustomCatalogShowcase';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { cleanProductImageUrl } from '../utils/imageUrl';

const TrendingNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="hidden sm:flex absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-slate-700 shadow-xl hover:bg-blue-600 hover:text-white items-center justify-center transition-all z-20 border border-slate-200 focus:outline-none"
    aria-label="Next Slide"
  >
    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
  </button>
);

const TrendingPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="hidden sm:flex absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-slate-700 shadow-xl hover:bg-blue-600 hover:text-white items-center justify-center transition-all z-20 border border-slate-200 focus:outline-none"
    aria-label="Previous Slide"
  >
    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
  </button>
);

export const Home = () => {
  const navigate = useNavigate();
  let festival = null;
  try {
    const themeCtx = useTheme();
    festival = themeCtx?.currentTheme;
  } catch (e) {
    festival = null;
  }

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0, scale: 1 });
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = (y / (rect.height / 2)) * -12;
    const tiltY = (x / (rect.width / 2)) * 12;
    setHeroTilt({ x: tiltX, y: tiltY, scale: 1.05 });
  };

  const handleHeroMouseLeave = () => {
    setHeroTilt({ x: 0, y: 0, scale: 1 });
  };
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState('next');
  const [isPaused, setIsPaused] = useState(false);
  const [trendingIndex, setTrendingIndex] = useState(0);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Review Modal & Form State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '', images: [], videoUrl: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  // Home Contact Form State
  const [homeContact, setHomeContact] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Dynamic Blog State
  const [blogsList, setBlogsList] = useState([]);
  const [activeBlogPost, setActiveBlogPost] = useState(null);

  // Dynamic Layout Sections State
  const [layoutSections, setLayoutSections] = useState([]);

  useEffect(() => {
    const fetchHomeLayout = async () => {
      try {
        const res = await api.get('/layout.php?page=home');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setLayoutSections(res.data);
        } else if (res.data && Array.isArray(res.data.sections) && res.data.sections.length > 0) {
          setLayoutSections(res.data.sections);
        }
      } catch (err) {
        console.warn('Failed to load home layout order:', err);
      }
    };
    fetchHomeLayout();
  }, []);

  // Dynamic Categories State
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/admin/categories.php');
        if (res.data && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
          setDbCategories(res.data.categories);
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const [searchParams] = useSearchParams();
  const searchQueryParam = searchParams.get('search');

  // Dynamic Hero Slider Data with initial default fallbacks
  const [slides, setSlides] = useState([
    {
      id: 'slide-1',
      subtitle: "Pro Studio Standard",
      title: "TatRabbit Titan Wireless Rotary Pen Machine",
      price: "18,999.00",
      discount: "SAVE 25%",
      buttonText: "Buy Now",
      buttonLink: "Machines",
      category: "Machines",
      glowColor: "from-blue-500/10 to-indigo-500/5",
      accentBadge: "bg-blue-50 text-blue-700 border-blue-200",
      image: ""
    },
    {
      id: 'slide-2',
      subtitle: "New EO Gas Sterilized Generation",
      title: "Precision Pro #10 Bugpin Cartridge Needles",
      price: "1,499.00",
      discount: "SAVE 40%",
      buttonText: "Shop Needles",
      buttonLink: "Needles",
      category: "Needles",
      glowColor: "from-emerald-500/10 to-teal-500/5",
      accentBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      image: ""
    },
    {
      id: 'slide-3',
      subtitle: "Triple Concentrated Pigment",
      title: "Obsidian Deep Black Tribal Lining Ink",
      price: "2,499.00",
      discount: "SAVE 30%",
      buttonText: "Explore Inks",
      buttonLink: "Inks",
      category: "Inks",
      glowColor: "from-purple-500/10 to-indigo-500/5",
      accentBadge: "bg-purple-50 text-purple-700 border-purple-200",
      image: ""
    },
    {
      id: 'slide-4',
      subtitle: "Microprocessor Power Control",
      title: "Jump-Start Dual Output Digital Power Station",
      price: "6,999.00",
      discount: "SAVE 35%",
      buttonText: "Get Power Unit",
      buttonLink: "Power Supplies",
      category: "Power Supplies",
      glowColor: "from-amber-500/10 to-orange-500/5",
      accentBadge: "bg-amber-50 text-amber-700 border-amber-200",
      image: ""
    }
  ]);

  useEffect(() => {
    const fetchHeroSlides = async () => {
      try {
        const res = await api.get('/hero_slider.php');
        if (res.data && Array.isArray(res.data.slides) && res.data.slides.length > 0) {
          // Filter to active slides that have valid image/video media
          const withMedia = res.data.slides.filter((s) => s.is_active && s.image_url && s.image_url.trim() !== '');
          const slidesSource = withMedia.length > 0 ? withMedia : res.data.slides.filter((s) => s.is_active);
          const mapped = slidesSource.map((s) => ({
            id: `slide-${s.id}`,
            subtitle: s.subtitle || '',
            title: s.title || `Banner #${s.id}`,
            price: s.price,
            discount: s.discount,
            buttonText: s.button_text || 'Shop Now',
            buttonLink: s.button_link || '/shop',
            category: s.button_link || 'Machines',
            glowColor: s.glow_color || 'from-blue-500/10 to-indigo-500/5',
            accentBadge: s.accent_badge || 'bg-blue-50 text-blue-700 border-blue-200',
            image: cleanProductImageUrl(s.image_url) || ''
          }));
          if (mapped.length > 0) {
            setSlides(mapped);
          }
        }
      } catch (err) {
        console.warn('Failed to load dynamic hero slides:', err);
      }
    };
    fetchHeroSlides();
  }, []);

  const handleHeroButtonClick = (slide) => {
    const target = slide.buttonLink || slide.category || '';
    if (target.startsWith('/')) {
      navigate(target);
    } else if (target) {
      setActiveCategory(target);
      const categoryEl = document.getElementById('featured-products-section');
      if (categoryEl) {
        categoryEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/shop');
    }
  };

  // 1 Single Horizontal Row of Small Circular Categories (Dynamic DB + Defaults)
  const defaultCategoryCircles = [
    { name: 'All Equipment', categoryKey: 'All', image: '' },
    { name: 'Rotary Pens', categoryKey: 'Machines', image: '' },
    { name: 'EO Needles', categoryKey: 'Needles', image: '' },
    { name: 'Obsidian Inks', categoryKey: 'Inks', image: '' },
    { name: 'Power Units', categoryKey: 'Power Supplies', image: '' },
    { name: 'Hygiene Care', categoryKey: 'Hygiene', image: '' }
  ];

  const categoryCircles = dbCategories.length > 0
    ? [
        { name: 'All Equipment', categoryKey: 'All', image: '' },
        ...dbCategories.map((c) => ({
          name: c.name,
          categoryKey: c.name,
          image: cleanProductImageUrl(c.image_url) || ''
        }))
      ]
    : defaultCategoryCircles;

  // Accordion FAQ Data
  const faqData = [
    {
      category: 'Equipment & Machines',
      question: 'What stroke length option is best for lining vs shading?',
      answer: 'The 4.0mm stroke length is engineered for heavy lining (09RL to 18RL) providing maximum needle drive punch. The 3.5mm stroke option is ideal for all-round shading, color packing, and fine detail work.'
    },
    {
      category: 'Sterilization & Safety',
      question: 'Are TatRabbit needle cartridges 100% EO Gas sterilized?',
      answer: 'Yes, every box of TatRabbit Precision Pro cartridges is individually blister packaged and sterilized using Ethylene Oxide (EO) gas with a verified sterilization indicator strip.'
    },
    {
      category: 'Returns & Refunds',
      question: 'What is your return and refund policy?',
      answer: 'Return requests for eligible unopened and unused products can be submitted within 48 hours of delivery. Once verified, approved refunds are processed within 3–7 business days.'
    },
    {
      category: 'Shipping & Delivery',
      question: 'What is the standard delivery timeframe for studio orders?',
      answer: 'Orders placed before 2:00 PM IST are dispatched same-day via BlueDart or DTDC express courier with delivery within 24–48 hours across major Indian cities.'
    }
  ];

  // Auto-play hero slider
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setDirection('next');
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const nextSlide = () => {
    setDirection('next');
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection('prev');
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    fetchProducts();
    fetchReviews();
    fetchBlogs();
  }, [activeCategory, searchQueryParam]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/products/list.php';
      if (searchQueryParam) {
        url += `?search=${encodeURIComponent(searchQueryParam)}`;
      } else if (activeCategory !== 'All') {
        url += `?category=${encodeURIComponent(activeCategory)}`;
      }
      const res = await api.get(url);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews/list.php');
      setReviewsList(res.data?.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setReviewsList([]);
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await api.get('/blogs/list.php');
      if (res.data.blogs && res.data.blogs.length > 0) {
        setBlogsList(res.data.blogs);
      }
    } catch (err) {
      console.error('Failed to load blogs:', err);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    setReviewSubmitting(true);
    setReviewErrorMsg('');
    setReviewSuccessMsg('');

    try {
      await api.post('/reviews/submit.php', {
        user_name: newReview.name,
        studio_name: newReview.studio,
        product_title: newReview.productTitle || 'TatRabbit Titan Wireless Rotary Pen',
        rating: parseInt(newReview.rating),
        comment: newReview.comment,
        images: newReview.images || [],
        video_url: newReview.videoUrl || '',
        is_admin: false,
        is_approved: 0
      });

      // Show inline confirmation without native browser alert window
      setReviewSuccessMsg('Thank you! Your testimonial has been submitted. It will appear on the website once approved by admin.');
      
      // Reset form and smoothly close modal after 2.5 seconds
      setTimeout(() => {
        setNewReview({ name: '', studio: '', productTitle: 'TatRabbit Titan Wireless Rotary Pen', rating: 5, comment: '', images: [], videoUrl: '' });
        setReviewSuccessMsg('');
        setReviewModalOpen(false);
        fetchReviews();
      }, 2500);
    } catch (err) {
      setReviewErrorMsg(err.response?.data?.error || err.message || 'Failed to submit testimonial. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };


  const handleHomeContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setHomeContact({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  const slide = slides[currentSlide];

  const nextTrending = () => {
    if (products.length > 4) {
      setTrendingIndex((prev) => (prev + 1) % (products.length - 3));
    }
  };

  const prevTrending = () => {
    if (products.length > 4) {
      setTrendingIndex((prev) => (prev - 1 + (products.length - 3)) % (products.length - 3));
    }
  };

  const DEFAULT_HOME_LAYOUT = [
    { section_key: 'hero_banner', is_visible: 1, display_order: 1 },
    { section_key: 'featured_categories', is_visible: 1, display_order: 2 },
    { section_key: 'featured_products', is_visible: 1, display_order: 3 },
    { section_key: 'custom_showcase', is_visible: 1, display_order: 4 },
    { section_key: 'why_choose_us', is_visible: 1, display_order: 5 },
    { section_key: 'reviews', is_visible: 1, display_order: 6 },
    { section_key: 'blog_preview', is_visible: 1, display_order: 7 }
  ];

  const activeSections = (layoutSections && layoutSections.length > 0 ? layoutSections : DEFAULT_HOME_LAYOUT)
    .filter((s) => s.is_visible == 1)
    .sort((a, b) => parseInt(a.display_order) - parseInt(b.display_order));

  const renderSectionByKey = (sectionItem) => {
    const key = typeof sectionItem === 'object' ? sectionItem.section_key : sectionItem;
    const name = typeof sectionItem === 'object' ? sectionItem.section_name : key;

    // Custom product showcase / sliders
    if (key === 'custom_showcase' || key.startsWith('custom_showcase') || key.includes('showcase') || key.includes('slider')) {
      return <CustomCatalogShowcase key={key} showcaseKey={key} />;
    }

    switch (key) {
      case 'hero_banner': {
        const mediaUrl = cleanProductImageUrl(slide.image) || (currentSlide === 0 ? '/hero_banner_rotary.jpg' : '/hero_banner_inks.jpg');
        const isVideo = /\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(mediaUrl) || mediaUrl.includes('video');

        return (
          <section
            key="hero_banner"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative w-full aspect-[2/1] sm:aspect-[2.6/1] md:aspect-[3/1] lg:aspect-[3.2/1] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-slate-200/80 select-none group bg-slate-950"
          >
            {/* Clickable Full Banner Media (Image or Video) */}
            <div
              onClick={() => handleHeroButtonClick(slide)}
              className="absolute inset-0 z-10 w-full h-full cursor-pointer overflow-hidden flex items-center justify-center bg-slate-950"
              role="button"
              tabIndex={0}
              aria-label={slide.title || 'TatRabbit Banner'}
            >
              {isVideo ? (
                <video
                  key={`video-${slide.id}-${mediaUrl}`}
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  ref={(el) => {
                    if (el) {
                      el.defaultMuted = true;
                      el.muted = true;
                      const playPromise = el.play();
                      if (playPromise !== undefined) {
                        playPromise.catch(() => {});
                      }
                    }
                  }}
                  className="w-full h-full object-contain sm:object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                />
              ) : (
                <img
                  key={`img-${slide.id}`}
                  src={mediaUrl}
                  alt={slide.title || 'TatRabbit Studio Banner'}
                  className="w-full h-full object-contain sm:object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                  onError={(e) => {
                    // Fallback to local default banner if URL fails
                    if (e.currentTarget.src !== window.location.origin + '/hero_banner_rotary.jpg') {
                      e.currentTarget.src = '/hero_banner_rotary.jpg';
                    }
                  }}
                />
              )}
            </div>

            {/* Subtle Gradient Vignette at bottom for clean controls contrast */}
            <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none z-20" />

            {/* Bottom Progress Timer Bar */}
            {!isPaused && (
              <div
                key={`timer-${currentSlide}`}
                className={`absolute bottom-0 left-0 h-1 ${festival?.primaryColor || 'bg-blue-600'} animate-timer-bar z-30`}
              />
            )}

            {/* Left Prev Arrow Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-950/40 hover:bg-slate-950/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 shadow-lg z-30 cursor-pointer active:scale-95"
              aria-label="Previous Slide"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>

            {/* Right Next Arrow Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-950/40 hover:bg-slate-950/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 shadow-lg z-30 cursor-pointer active:scale-95"
              aria-label="Next Slide"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>

            {/* Bottom Pagination Dots Pill */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 bg-slate-950/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 z-30 shadow-md">
              {slides.map((_, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDirection(idx > currentSlide ? 'next' : 'prev');
                    setCurrentSlide(idx);
                  }}
                  className="p-1 focus:outline-none cursor-pointer"
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  {currentSlide === idx ? (
                    <div className="w-5 sm:w-7 h-1.5 sm:h-2 rounded-full bg-white shadow-xs transition-all duration-300" />
                  ) : (
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white/40 hover:bg-white/80 transition-all duration-200" />
                  )}
                </button>
              ))}
            </div>
          </section>
        );
      }

      case 'featured_categories':
        return (
          <section key="featured_categories" className="space-y-3 sm:space-y-4">
            <div className="text-left sm:text-center space-y-1.5 px-0.5 sm:px-0">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-semibold px-3 py-0.5 rounded-full border border-blue-200/80 shadow-2xs uppercase tracking-widest">
                <span>{festival?.emoji || <Sparkles className="w-3 h-3 text-blue-600" />}</span>
                <span>Studio Categories</span>
              </span>
              <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 tracking-tight">Explore Studio Equipment</h2>
            </div>

            <div className="flex items-center justify-start sm:justify-center gap-3 sm:gap-6 overflow-x-auto pb-2 pt-0.5 px-0.5 scrollbar-none">
              {categoryCircles.map((cat, idx) => {
                const linkUrl = cat.categoryKey === 'All' ? '/shop' : `/shop?category=${encodeURIComponent(cat.categoryKey)}`;
                const catImg = cleanProductImageUrl(cat.image);
                return (
                  <Link key={idx} to={linkUrl} className="flex flex-col items-center gap-1 cursor-pointer group flex-shrink-0">
                    <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full p-1 bg-white flex items-center justify-center overflow-hidden transition-all duration-300 shadow-xs border-2 border-slate-200 ${festival?.cardBorderHover || 'group-hover:border-blue-500'} group-hover:scale-105`}>
                      {catImg ? (
                        <img
                          src={catImg}
                          alt={cat.name}
                          className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                        />
                      ) : null}
                      <div className={`${catImg ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-slate-300`}>
                        <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 stroke-[1.5]" />
                      </div>
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-semibold tracking-tight text-slate-700 ${festival?.primaryText ? `group-hover:${festival.primaryText}` : 'group-hover:text-blue-600'} transition-colors`}>
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        );

      case 'featured_products':
        // Show only the 6 newest added product cards
        const trendingProducts = [...products]
          .sort((a, b) => Number(b.id) - Number(a.id))
          .slice(0, 6);

        const isMobile = windowWidth < 640;
        const isTablet = windowWidth >= 640 && windowWidth < 1024;
        const currentSlidesToShow = isMobile ? 2 : isTablet ? 3 : 4;

        const trendingSlickSettings = {
          dots: isMobile,
          arrows: !isMobile,
          infinite: trendingProducts.length > currentSlidesToShow,
          speed: 400,
          slidesToShow: currentSlidesToShow,
          slidesToScroll: 1,
          swipeToSlide: true,
          swipe: true,
          touchThreshold: 15,
          nextArrow: <TrendingNextArrow />,
          prevArrow: <TrendingPrevArrow />,
          responsive: [
            {
              breakpoint: 1280,
              settings: {
                slidesToShow: 4,
                slidesToScroll: 1,
                arrows: true,
                dots: false,
              }
            },
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
                arrows: true,
                dots: false,
              }
            },
            {
              breakpoint: 640,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                arrows: false,
                dots: true,
              }
            }
          ]
        };

        return (
          <section key="featured_products" className="bg-[#eaedf2]/70 rounded-2xl sm:rounded-[2.2rem] py-4 sm:py-10 px-1 sm:px-10 border border-slate-200/60 shadow-xs relative font-sans space-y-2 sm:space-y-4">
            <div className="text-left sm:text-center space-y-1.5 mb-3 sm:mb-6 px-1 sm:px-0">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-semibold px-3 py-0.5 rounded-full border border-blue-200/80 shadow-2xs uppercase tracking-widest">
                <span>{festival?.emoji || <Sparkles className="w-3 h-3 text-blue-600" />}</span>
                <span>Featured Selection</span>
              </span>
              <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 tracking-tight">Now Trending Items</h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-5 animate-pulse">
                {[1, 2, 3, 4].map((n) => <div key={n} className="bg-white h-80 rounded-2xl border border-slate-200" />)}
              </div>
            ) : trendingProducts.length > 0 ? (
              <div className="px-0 sm:px-6 relative pb-6 sm:pb-1 slick-custom-wrapper">
                <Slider key={`trending-slider-${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`} {...trendingSlickSettings}>
                  {trendingProducts.map((product) => (
                    <div key={product.id} className="px-1 sm:px-2.5 py-1 sm:py-2">
                      <ProductCard product={product} showVariantSelector={false} />
                    </div>
                  ))}
                </Slider>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500 shadow-xs">
                No equipment items available.
              </div>
            )}
          </section>
        );

      case 'custom_showcase':
        return <CustomCatalogShowcase key="custom_showcase" />;

      case 'why_choose_us':
        return (
          <React.Fragment key="why_choose_us">
            <section className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 shadow-xs space-y-6 sm:space-y-8">
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <p className="text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wider">
                  MADE FOR PROFESSIONALS
                </p>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  Built for Professional Tattoo Artists
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Quality supplies. Reliable service. Support you can count on.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-slate-50/90 hover:bg-white border border-slate-100/90 hover:border-blue-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                  <div className="text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck className="w-9 h-9 sm:w-11 sm:h-11 stroke-[1.8]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                      Product Quality
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Reliable supplies for artists
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/90 hover:bg-white border border-slate-100/90 hover:border-blue-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                  <div className="text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <Truck className="w-9 h-9 sm:w-11 sm:h-11 stroke-[1.8]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                      Reliable Shipping
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Clear delivery updates
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/90 hover:bg-white border border-slate-100/90 hover:border-blue-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                  <div className="text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <Headphones className="w-9 h-9 sm:w-11 sm:h-11 stroke-[1.8]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                      Artist Support
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Help choosing equipment
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </React.Fragment>
        );

      case 'reviews': {
        const displayedReviews = reviewsList.slice(0, 6);
        return (
          <section key="reviews" id="reviews" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" /> Verified Studio Artist Reviews
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Feedback from professional tattoo studios across India</p>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <Link
                  to="/reviews"
                  className="bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 border border-slate-200 font-semibold text-xs px-3.5 py-2 rounded-xl shadow-2xs flex items-center gap-1.5 transition-all"
                >
                  View All Reviews ({reviewsList.length}) →
                </Link>
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Write Review
                </button>
              </div>
            </div>

            {reviewsList.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-[1.8rem] p-8 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-700">No reviews yet.</p>
                <p className="text-[11px] text-slate-400">Click "Write Review" above to be the first artist to leave feedback!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {displayedReviews.map((rev, i) => (
                    <ReviewCard key={i} review={rev} />
                  ))}
                </div>

                <div className="flex justify-center pt-2">
                  <Link
                    to="/reviews"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:text-blue-600 hover:border-blue-500 font-semibold text-xs shadow-xs hover:shadow-sm transition-all group"
                  >
                    <span>View All Reviews ({reviewsList.length})</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </>
            )}
          </section>
        );
      }

      case 'blog_preview': {
        if (!blogsList || blogsList.length === 0) return null;
        const displayedBlogs = blogsList.slice(0, 3);
        return (
          <React.Fragment key="blog_preview">
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" /> Master Class Studio Blog
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Professional guides, equipment maintenance tips & ink science</p>
                </div>
                <Link to="/blog" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Explore All Blog Posts →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {displayedBlogs.map((post) => {
                  const img = cleanProductImageUrl(post.image_url || post.image || '');
                  const rTime = post.read_time || post.readTime || '5 min read';
                  const pubDate = post.created_at ? new Date(post.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : (post.date || 'Recent');
                  return (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug || post.id}`}
                      className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/10] bg-slate-50 overflow-hidden flex items-center justify-center p-2.5 sm:p-3">
                        {img ? (
                          <img
                            src={img}
                            alt={post.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                          />
                        ) : null}
                        <div className={`${img ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-slate-300`}>
                          <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" />
                        </div>
                        <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-white/90 backdrop-blur-md text-blue-700 text-[8px] sm:text-[9px] font-semibold px-2 sm:px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs z-10">
                          {post.category}
                        </span>
                      </div>
                      <div className="p-2.5 sm:p-4 space-y-1 sm:space-y-1.5">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-slate-400 font-semibold truncate">
                          <span>{pubDate}</span> • <span>{rTime}</span>
                        </div>
                        <h3 className="font-heading font-semibold text-[11px] sm:text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-2 leading-relaxed hidden sm:block">{post.excerpt}</p>
                        <div className="pt-0.5 sm:pt-1 text-[10px] sm:text-[11px] font-semibold text-blue-600 flex items-center gap-1 group-hover:text-blue-700">
                          Read Article <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {blogsList.length > 3 && (
                <div className="flex justify-center pt-2">
                  <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:text-blue-600 hover:border-blue-500 font-semibold text-xs shadow-xs hover:shadow-sm transition-all group"
                  >
                    <span>Explore All Blog Posts ({blogsList.length})</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}
            </section>
          </React.Fragment>
        );
      }

      case 'promo_banner':
      default: {
        return (
          <section
            key={key}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border border-slate-800 shadow-md py-2.5 sm:py-3.5 px-4 sm:px-6"
          >
            {/* Subtle background glow */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
              {/* Left Side: Tag + Title + Inline Subtitle */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap min-w-0 text-center sm:text-left justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-400/30 flex-shrink-0">
                  <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                  <span>Featured</span>
                </span>

                <h3 className="font-heading font-bold text-xs sm:text-sm text-white tracking-tight truncate">
                  {name}
                </h3>

                <span className="hidden md:inline-block w-1 h-1 rounded-full bg-slate-600 flex-shrink-0" />

                <p className="text-[11px] text-slate-300 truncate hidden md:inline font-normal">
                  Engineered with surgical precision, medical-grade bio-safety standards & 100% verified testing.
                </p>
              </div>

              {/* Right Side: Compact Explore Button */}
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] sm:text-xs px-3.5 py-1.5 sm:py-2 rounded-xl shadow-xs transition-all hover:scale-105 whitespace-nowrap flex-shrink-0"
              >
                <span>Explore Collection</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        );
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 pb-2 sm:pb-4 font-sans">
      <SEO
        title="TatRabbit | Professional Tattoo Machines, Needles & Inks"
        description="India premier manufacturer and distributor of precision rotary tattoo pens, membrane cartridge needles, sterilized lining inks, and studio digital power supplies."
        keywords="tattoo supply, rotary pen machine, tattoo needles, cartridge needles, obsidian black ink, digital power supply, tattoo equipment India, Bengaluru"
      />

      {/* 0. DEDICATED ~150PX FESTIVAL BANNER SECTION AT THE TOP OF HERO SLIDER */}
      {festival && festival.key !== 'default' && (
        <section className={`relative overflow-hidden rounded-[2.2rem] p-6 sm:p-8 min-h-[150px] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl ${festival.bannerBg} border-2 ${festival.primaryBorder} animate-fadeIn group`}>
          
          {/* Animated Background Shimmer Light */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2 -skew-x-12 animate-festive-shimmer pointer-events-none z-0" />

          {/* Floating Animated Background Festival Icons */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl sm:text-9xl opacity-15 pointer-events-none select-none z-0 transition-transform duration-700 group-hover:scale-110">
            <span className={`inline-block ${
              festival.key === 'uttarayan' ? 'animate-kite-sway' :
              festival.key === 'diwali' ? 'animate-diya-flicker' :
              'animate-color-burst'
            }`}>
              {festival.emoji}
            </span>
          </div>

          <div className="absolute right-36 -top-4 text-4xl opacity-20 pointer-events-none select-none z-0 hidden lg:block animate-float">
            {festival.emoji}
          </div>

          {/* Left Content Block */}
          <div className="relative z-10 space-y-1.5 max-w-2xl text-left w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xl ${
                festival.key === 'uttarayan' ? 'animate-kite-sway' :
                festival.key === 'diwali' ? 'animate-diya-flicker' :
                'animate-bounce'
              }`}>
                {festival.emoji}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/30 shadow-2xs">
                {festival.badgeText || 'Special Festival Celebration'}
              </span>
            </div>

            <h2 className="font-heading font-semibold text-base sm:text-lg text-white tracking-tight leading-snug">
              {festival.name} Exclusive Studio Sale
            </h2>

            <p className="text-xs font-medium text-white/90 leading-normal max-w-xl">
              {festival.bannerText || festival.subtitle}
            </p>
          </div>

          {/* Right CTA Button Block */}
          <div className="relative z-10 w-full sm:w-auto flex items-center justify-start sm:justify-end flex-shrink-0">
            <Link
              to="/shop"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group/btn"
            >
              <span>Explore {festival.name} Offers</span>
              <span className={`text-base transition-transform group-hover/btn:translate-x-1 ${
                festival.key === 'uttarayan' ? 'animate-kite-sway' :
                festival.key === 'diwali' ? 'animate-diya-flicker' :
                'animate-pulse'
              }`}>
                {festival.emoji}
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* Dynamic Layout Sections according to Admin Layout Builder order */}
      {activeSections.map((sectionItem) => renderSectionByKey(sectionItem))}

      {/* WRITE A REVIEW MODAL */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => {
          if (!reviewSubmitting) {
            setReviewModalOpen(false);
            setReviewSuccessMsg('');
            setReviewErrorMsg('');
          }
        }}
        title="Add Verified Studio Testimonial"
        maxWidth="max-w-md"
      >
        {reviewSuccessMsg ? (
          <div className="py-8 px-4 text-center space-y-3 font-sans">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-heading font-semibold text-sm text-slate-900">
              Testimonial Received!
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              {reviewSuccessMsg}
            </p>
          </div>
        ) : (
          <form onSubmit={handleAddReview} className="space-y-4 font-sans">
            {reviewErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{reviewErrorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                ARTIST / REVIEWER NAME <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newReview.name}
                onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                placeholder="e.g. Jack Tattoo"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/10 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                RATING SCORE (1 TO 5 STARS)
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 border border-slate-200/90 rounded-xl px-4 py-3">
                <div 
                  className="flex items-center gap-1.5"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const activeScore = hoverRating || newReview.rating;
                    const isFilled = starVal <= activeScore;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: starVal })}
                        onMouseEnter={() => setHoverRating(starVal)}
                        className="p-1 focus:outline-none transition-transform transform hover:scale-125 duration-150 cursor-pointer"
                        aria-label={`Rate ${starVal} out of 5 stars`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.35)]'
                              : 'text-slate-300 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-2xs font-heading">
                  {(hoverRating || newReview.rating) === 5 && '5/5 (Excellent)'}
                  {(hoverRating || newReview.rating) === 4 && '4/5 (Very Good)'}
                  {(hoverRating || newReview.rating) === 3 && '3/5 (Good)'}
                  {(hoverRating || newReview.rating) === 2 && '2/5 (Average)'}
                  {(hoverRating || newReview.rating) === 1 && '1/5 (Poor)'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                REVIEW / TESTIMONIAL FEEDBACK
              </label>
              <textarea
                rows="3"
                required
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="The 4.0mm stroke option is phenomenal for lining..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/10 placeholder-slate-400"
              />
            </div>

            {/* Photo & Video Review Media Upload */}
            <ReviewMediaUpload
              images={newReview.images || []}
              setImages={(imgs) => setNewReview({ ...newReview, images: imgs })}
              videoUrl={newReview.videoUrl || ''}
              setVideoUrl={(vid) => setNewReview({ ...newReview, videoUrl: vid })}
              maxImages={5}
            />

            <div className="pt-2 flex justify-end items-center gap-2.5">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                disabled={reviewSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {reviewSubmitting ? 'Submitting...' : 'Publish Testimonial'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* BLOG MODAL */}
      <Modal
        isOpen={!!activeBlogPost}
        onClose={() => setActiveBlogPost(null)}
        title={activeBlogPost?.title || 'Master Class Guide'}
        maxWidth="max-w-xl"
      >
        {activeBlogPost && (
          <div>
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 inline-block mb-2">
              {activeBlogPost.category}
            </span>
            {cleanProductImageUrl(activeBlogPost.image) ? (
              <img src={cleanProductImageUrl(activeBlogPost.image)} alt={activeBlogPost.title} className="w-full h-48 object-cover rounded-xl mb-4" />
            ) : (
              <div className="w-full h-40 bg-slate-100 rounded-xl mb-4 flex items-center justify-center text-slate-300">
                <ImageIcon className="w-12 h-12 stroke-[1.5]" />
              </div>
            )}
            <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{activeBlogPost.content}</div>
          </div>
        )}
      </Modal>
    </div>
  );
};
