/**
 * Normalizes product, category, and banner image URLs to ensure they display properly
 * across all environments (production tatrabbit.com, Vite dev server, and XAMPP).
 *
 * Specifically fixes:
 * 1. Broken URLs containing '/tatrabbit/avon-tattoo-store/backend/uploads/' on tatrabbit.com
 * 2. Missing fallback if URL is empty or null
 * 3. Localhost URLs when viewed on live site
 */

export const FALLBACK_PRODUCT_IMAGE = '';

export const isDummyImageUrl = (url) => {
  if (!url || typeof url !== 'string') return true;
  return (
    url.includes('images.unsplash.com') ||
    url.includes('unsplash.com') ||
    url.includes('placeholder.com') ||
    url.includes('via.placeholder') ||
    url.includes('dummyimage.com')
  );
};

export const cleanProductImageUrl = (url, fallback = '') => {
  if (!url || typeof url !== 'string' || !url.trim() || isDummyImageUrl(url)) {
    return fallback;
  }

  let cleaned = url.trim();

  const isProduction =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('tatrabbit.com') ||
      (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')));

  if (isProduction) {
    if (cleaned.includes('/tatrabbit/avon-tattoo-store/backend/uploads/')) {
      cleaned = cleaned.replace('/tatrabbit/avon-tattoo-store/backend/uploads/', '/uploads/');
    }
    if (cleaned.includes('localhost')) {
      cleaned = cleaned.replace(
        /https?:\/\/localhost(:[0-9]+)?(\/tatrabbit\/avon-tattoo-store\/backend)?\/uploads\//,
        'https://tatrabbit.com/uploads/'
      );
    }
  } else {
    // Localhost development:
    // If it points to http://localhost/uploads/ without backend subfolder, restore proper backend path
    if (cleaned.includes('http://localhost/uploads/')) {
      cleaned = cleaned.replace('http://localhost/uploads/', 'http://localhost/tatrabbit/avon-tattoo-store/backend/uploads/');
    }
  }

  return cleaned;
};

export const normalizeImageUrl = (url, fallback = FALLBACK_PRODUCT_IMAGE) => {
  return cleanProductImageUrl(url, fallback);
};

export const handleImageError = (e, fallback = FALLBACK_PRODUCT_IMAGE) => {
  if (e && e.currentTarget && e.currentTarget.src !== fallback) {
    e.currentTarget.src = fallback;
  }
};
