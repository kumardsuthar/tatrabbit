import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import api from '../../services/api';
import { ProductCard } from '../cards/ProductCard';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// Custom Next Arrow
const SlickNextArrow = ({ onClick, currentSlide, slideCount }) => (
  <button
    type="button"
    onClick={onClick}
    className="hidden sm:flex absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white text-slate-700 shadow-xl hover:bg-blue-600 hover:text-white items-center justify-center transition-all z-30 border border-slate-200/90 focus:outline-none cursor-pointer"
    aria-label="Next Slide"
  >
    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
  </button>
);

// Custom Prev Arrow
const SlickPrevArrow = ({ onClick, currentSlide, slideCount }) => (
  <button
    type="button"
    onClick={onClick}
    className="hidden sm:flex absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white text-slate-700 shadow-xl hover:bg-blue-600 hover:text-white items-center justify-center transition-all z-30 border border-slate-200/90 focus:outline-none cursor-pointer"
    aria-label="Previous Slide"
  >
    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
  </button>
);

export const CustomCatalogShowcase = ({ showcaseKey = 'custom_showcase' }) => {
  const [config, setConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));

  let festival = null;
  try {
    const themeCtx = useTheme();
    festival = themeCtx?.currentTheme;
  } catch (e) {
    festival = null;
  }

  useEffect(() => {
    fetchData();
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const handleLayoutUpdated = () => fetchData();
    window.addEventListener('layout-updated', handleLayoutUpdated);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('layout-updated', handleLayoutUpdated);
    };
  }, [showcaseKey]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configRes, productsRes] = await Promise.all([
        api.get(`/settings/catalog.php?key=${encodeURIComponent(showcaseKey)}`),
        api.get('/products/list.php')
      ]);

      const cfg = configRes.data || {};
      const allProds = productsRes.data?.products || [];

      setConfig(cfg);

      const targetIds = Array.isArray(cfg.product_ids) ? cfg.product_ids : [];
      let selectedProds = [];
      if (targetIds.length > 0) {
        selectedProds = allProds.filter((p) => targetIds.includes(parseInt(p.id)));
      } else {
        selectedProds = allProds;
      }
      setProducts(selectedProds);
    } catch (err) {
      console.error('Failed to load custom catalog showcase:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center flex justify-center items-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  const isSlider = config?.display_mode === 'slider';
  const prodCount = products.length;

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const desktopSlides = Math.min(prodCount, 4);
  const tabletSlides = Math.min(prodCount, 3);
  const mobileSlides = Math.min(prodCount, 2);

  const currentSlidesToShow = isMobile ? mobileSlides : isTablet ? tabletSlides : desktopSlides;
  const canSlide = prodCount > currentSlidesToShow;

  const slickSettings = {
    dots: isMobile && canSlide,
    arrows: !isMobile && canSlide,
    infinite: canSlide,
    speed: 400,
    slidesToShow: currentSlidesToShow,
    slidesToScroll: 1,
    swipeToSlide: true,
    swipe: canSlide,
    touchThreshold: 15,
    nextArrow: <SlickNextArrow />,
    prevArrow: <SlickPrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: Math.min(prodCount, 4),
          slidesToScroll: 1,
          arrows: !isMobile && prodCount > Math.min(prodCount, 4),
          dots: false,
          infinite: prodCount > Math.min(prodCount, 4)
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(prodCount, 3),
          slidesToScroll: 1,
          arrows: !isMobile && prodCount > Math.min(prodCount, 3),
          dots: false,
          infinite: prodCount > Math.min(prodCount, 3)
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: Math.min(prodCount, 2),
          slidesToScroll: 1,
          arrows: false,
          dots: prodCount > Math.min(prodCount, 2),
          infinite: prodCount > Math.min(prodCount, 2)
        }
      }
    ]
  };

  return (
    <section className="bg-[#eaedf2]/70 rounded-2xl sm:rounded-[2.2rem] py-4 sm:py-10 px-1 sm:px-10 border border-slate-200/60 shadow-xs relative font-sans space-y-2 sm:space-y-4">
      {/* Title & Header */}
      <div className="text-left sm:text-center space-y-1.5 mb-3 sm:mb-6 max-w-2xl mx-auto px-1 sm:px-0">
        {config?.badge !== '' && (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-semibold px-3 py-0.5 rounded-full border border-blue-200/80 shadow-2xs uppercase tracking-widest">
            <span>{festival?.emoji || <Sparkles className="w-3 h-3 text-blue-600" />}</span>
            <span>{config?.badge || 'Featured Selection'}</span>
          </span>
        )}

        <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 tracking-tight">
          {config?.title || 'Curated Studio Showcase'}
        </h2>

        {config?.description && 
         config.description.trim() !== '' && 
         config.description.trim() !== 'Curated collection of high-performance tattoo supplies and accessories.' &&
         config.description.trim() !== 'Hand-picked professional tattoo equipment selected for master artists.' && (
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {config.description}
          </p>
        )}
      </div>

      {/* Mode 1: REACT SLICK SLIDER */}
      {isSlider ? (
        <div className="px-0 sm:px-6 relative pb-6 sm:pb-1 slick-custom-wrapper">
          <Slider key={`custom-slider-${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}-${prodCount}`} {...slickSettings}>
            {products.map((product) => (
              <div key={product.id} className="px-1 sm:px-2.5 py-1 sm:py-2">
                <ProductCard product={product} showVariantSelector={false} />
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        /* Mode 2: STATIC CARDS GRID */
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-5 px-1">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showVariantSelector={false} />
          ))}
        </div>
      )}
    </section>
  );
};

export default CustomCatalogShowcase;
