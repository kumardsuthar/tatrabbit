import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'product-og-meta-injector',
      transformIndexHtml: {
        order: 'pre',
        async transform(html, ctx) {
          const url = ctx?.originalUrl || ctx?.path || '';
          const match = url.match(/\/product\/(?:id\/)?([^/?#]+)/i);
          if (!match) return html;

          const identifier = decodeURIComponent(match[1]);
          try {
            const apiRes = await fetch(
              `http://localhost/tatrabbit/avon-tattoo-store/backend/api/products/detail.php?slug=${encodeURIComponent(identifier)}`
            );
            if (!apiRes.ok) return html;
            const data = await apiRes.json();
            const product = data?.product;
            if (!product) return html;

            const title = `${product.title} | TatRabbit`;
            const cleanDesc = (product.description || '')
              .replace(/<[^>]*>/g, '')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 160) || 'TatRabbit Professional Tattoo Equipment';

            let imageUrl = product.image_url || '';
            if (!imageUrl && Array.isArray(product.gallery_images) && product.gallery_images.length > 0) {
              imageUrl = product.gallery_images[0];
            }
            if (!imageUrl || imageUrl.includes('unsplash.com')) {
              imageUrl = 'https://tatrabbit.com/assets/logo.jpeg';
            }

            if (imageUrl.includes('/tatrabbit/avon-tattoo-store/backend/uploads/')) {
              imageUrl = imageUrl.replace('/tatrabbit/avon-tattoo-store/backend/uploads/', '/uploads/');
            }
            if (imageUrl.includes('localhost')) {
              imageUrl = imageUrl.replace(
                /https?:\/\/localhost(:[0-9]+)?(\/tatrabbit\/avon-tattoo-store\/backend)?\/uploads\//,
                'https://tatrabbit.com/uploads/'
              );
            }
            if (imageUrl.startsWith('/')) {
              imageUrl = `https://tatrabbit.com${imageUrl}`;
            }

            let transformedHtml = html;
            const tagsToRemove = [
              /<meta\s+property=['"]og:title['"][^>]*>/gi,
              /<meta\s+property=['"]og:description['"][^>]*>/gi,
              /<meta\s+property=['"]og:image['"][^>]*>/gi,
              /<meta\s+property=['"]og:image:secure_url['"][^>]*>/gi,
              /<meta\s+property=['"]og:image:width['"][^>]*>/gi,
              /<meta\s+property=['"]og:image:height['"][^>]*>/gi,
              /<meta\s+property=['"]og:type['"][^>]*>/gi,
              /<meta\s+name=['"]description['"][^>]*>/gi,
              /<meta\s+name=['"]twitter:card['"][^>]*>/gi,
              /<meta\s+name=['"]twitter:title['"][^>]*>/gi,
              /<meta\s+name=['"]twitter:description['"][^>]*>/gi,
              /<meta\s+name=['"]twitter:image['"][^>]*>/gi,
              /<title>.*?<\/title>/gi,
            ];
            for (const rx of tagsToRemove) {
              transformedHtml = transformedHtml.replace(rx, '');
            }

            const newTags = [
              `<title>${title}</title>`,
              `<meta name="description" content="${cleanDesc}" />`,
              `<meta property="og:title" content="${title}" />`,
              `<meta property="og:description" content="${cleanDesc}" />`,
              `<meta property="og:image" content="${imageUrl}" />`,
              `<meta property="og:image:secure_url" content="${imageUrl}" />`,
              `<meta property="og:image:width" content="1200" />`,
              `<meta property="og:image:height" content="630" />`,
              `<meta property="og:type" content="product" />`,
              `<meta name="twitter:card" content="summary_large_image" />`,
              `<meta name="twitter:title" content="${title}" />`,
              `<meta name="twitter:description" content="${cleanDesc}" />`,
              `<meta name="twitter:image" content="${imageUrl}" />`
            ].join('\n    ');

            return transformedHtml.replace(/<head>/i, `<head>\n    ${newTags}`);
          } catch (e) {
            return html;
          }
        },
      },
    },
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost/tatrabbit/avon-tattoo-store/backend',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost/tatrabbit/avon-tattoo-store/backend',
        changeOrigin: true,
        secure: false,
      },
      '/tatrabbit': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
