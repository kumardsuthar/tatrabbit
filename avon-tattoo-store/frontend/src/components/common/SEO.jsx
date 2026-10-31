import React, { useEffect } from 'react';

export const SEO = ({
  title = 'TatRabbit | Professional Tattoo Machines, Needles & Inks',
  description = 'India premier manufacturer & distributor of surgical-grade rotary pen machines, EO gas sterilized cartridge needles, obsidian lining inks, and studio digital power supplies.',
  keywords = 'tattoo supply, rotary pen machine, tattoo needles, cartridge needles, obsidian black ink, digital power supply, tattoo equipment India, Bengaluru',
  image = 'https://tatrabbit.com/logo.jpeg',
  url = window.location.href,
  type = 'website',
  schemaData = null,
  breadcrumbs = null
}) => {
  const fullTitle = title.includes('TatRabbit') ? title : `${title} | TatRabbit`;

  useEffect(() => {
    // 1. Update Document Title
    document.title = fullTitle;

    // Helper to update meta tag by name or property
    const updateMeta = (attrName, attrVal, contentVal) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal || '');
    };

    // Helper for Canonical Link Tag
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', url);

    // 2. Standard Meta Tags
    updateMeta('name', 'description', description);
    updateMeta('name', 'keywords', keywords);
    updateMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMeta('name', 'author', 'TatRabbit');

    const currentOrigin = typeof window !== 'undefined' ? (window.location.origin || 'https://tatrabbit.com') : 'https://tatrabbit.com';

    let absoluteImageUrl = image;
    if (!absoluteImageUrl || typeof absoluteImageUrl !== 'string' || absoluteImageUrl.includes('unsplash.com')) {
      absoluteImageUrl = 'https://tatrabbit.com/logo.jpeg';
    } else {
      absoluteImageUrl = absoluteImageUrl.trim();
      if (absoluteImageUrl.includes('/tatrabbit/avon-tattoo-store/backend/uploads/')) {
        absoluteImageUrl = absoluteImageUrl.replace('/tatrabbit/avon-tattoo-store/backend/uploads/', '/uploads/');
      }
      if (currentOrigin.includes('tatrabbit.com') && absoluteImageUrl.includes('localhost')) {
        absoluteImageUrl = absoluteImageUrl.replace(/https?:\/\/localhost(:[0-9]+)?(\/tatrabbit\/avon-tattoo-store\/backend)?\/uploads\//, 'https://tatrabbit.com/uploads/');
      }
      if (!absoluteImageUrl.startsWith('http://') && !absoluteImageUrl.startsWith('https://')) {
        absoluteImageUrl = `${currentOrigin}${absoluteImageUrl.startsWith('/') ? '' : '/'}${absoluteImageUrl}`;
      }
    }

    // 3. OpenGraph Tags
    updateMeta('property', 'og:title', fullTitle);
    updateMeta('property', 'og:description', description);
    updateMeta('property', 'og:image', absoluteImageUrl);
    updateMeta('property', 'og:image:secure_url', absoluteImageUrl);
    updateMeta('property', 'og:image:width', '1200');
    updateMeta('property', 'og:image:height', '630');
    updateMeta('property', 'og:image:alt', fullTitle);
    updateMeta('property', 'og:url', url);
    updateMeta('property', 'og:type', type);
    updateMeta('property', 'og:site_name', 'TatRabbit');
    updateMeta('property', 'og:locale', 'en_IN');

    // 4. Twitter Card Tags
    updateMeta('name', 'twitter:card', 'summary_large_image');
    updateMeta('name', 'twitter:title', fullTitle);
    updateMeta('name', 'twitter:description', description);
    updateMeta('name', 'twitter:image', absoluteImageUrl);

    // 5. GEO Location Meta Tags (Bengaluru, Karnataka, India - Regional & Global SEO)
    updateMeta('name', 'geo.region', 'IN-KA');
    updateMeta('name', 'geo.placename', 'Bengaluru, Karnataka, India');
    updateMeta('name', 'geo.position', '12.9716;77.5946');
    updateMeta('name', 'ICBM', '12.9716, 77.5946');

    // 6. JSON-LD Schema.org Structured Data
    let scriptTag = document.getElementById('json-ld-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    // Store & Organization Schema
    const storeSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Store',
          '@id': `${currentOrigin}/#store`,
          'name': 'TatRabbit',
          'image': image,
          'description': description,
          'url': currentOrigin,
          'priceRange': '₹₹',
          'openingHoursSpecification': {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            'opens': '09:00',
            'closes': '20:00'
          }
        },
        {
          '@type': 'WebSite',
          '@id': `${currentOrigin}/#website`,
          'url': currentOrigin,
          'name': 'TatRabbit',
          'description': description,
          'potentialAction': {
            '@type': 'SearchAction',
            'target': `${currentOrigin}/shop?search={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        }
      ]
    };

    // Breadcrumbs Schema if provided
    if (breadcrumbs && Array.isArray(breadcrumbs)) {
      storeSchema['@graph'].push({
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          'position': idx + 1,
          'name': crumb.name,
          'item': crumb.url.startsWith('http') ? crumb.url : `${currentOrigin}${crumb.url}`
        }))
      });
    }

    scriptTag.textContent = JSON.stringify(schemaData || storeSchema);
  }, [fullTitle, description, keywords, image, url, type, schemaData, breadcrumbs]);

  return null;
};
