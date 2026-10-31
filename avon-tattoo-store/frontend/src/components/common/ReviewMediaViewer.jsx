import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Image as ImageIcon, Video as VideoIcon, Play, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { cleanProductImageUrl } from '../../utils/imageUrl';

export const parseReviewImages = (rawImages) => {
  if (!rawImages) return [];
  if (Array.isArray(rawImages)) {
    return rawImages.filter((img) => typeof img === 'string' && img.trim());
  }
  if (typeof rawImages === 'string') {
    const trimmed = rawImages.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((img) => typeof img === 'string' && img.trim());
      }
      if (typeof parsed === 'string' && parsed.trim()) {
        return [parsed.trim()];
      }
    } catch (e) {
      // If it's comma separated or single URL
      if (trimmed.includes(',')) {
        return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
      }
      return [trimmed];
    }
  }
  return [];
};

export const ReviewMediaViewer = ({ images, video_url, compact = false, reviewerName = 'Artist' }) => {
  const parsedImages = parseReviewImages(images);
  const videoUrl = typeof video_url === 'string' && video_url.trim() ? video_url.trim() : null;

  // Prepare full media playlist: images first, then video (or vice versa)
  const mediaItems = [
    ...parsedImages.map((url) => ({ type: 'image', url: cleanProductImageUrl(url) })),
    ...(videoUrl ? [{ type: 'video', url: cleanProductImageUrl(videoUrl) }] : [])
  ];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen, activeIndex, mediaItems.length]);

  if (mediaItems.length === 0) return null;

  const handleOpenMedia = (index, e) => {
    if (e) e.stopPropagation();
    setActiveIndex(index);
    setZoomScale(1);
    setLightboxOpen(true);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setZoomScale(1);
    setActiveIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setZoomScale(1);
    setActiveIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const currentItem = mediaItems[activeIndex];

  // -------------------------------------------------------------
  // Compact Mode (for Admin Cards & Home Page Testimonial Cards)
  // -------------------------------------------------------------
  if (compact) {
    return (
      <div className="space-y-2 mt-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {parsedImages.map((imgUrl, idx) => (
            <button
              type="button"
              key={idx}
              onClick={(e) => handleOpenMedia(idx, e)}
              className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200/90 shadow-2xs hover:scale-105 transition-transform group bg-slate-100 flex-shrink-0"
              title="Click to view review image"
            >
              <img
                src={cleanProductImageUrl(imgUrl)}
                alt="Review attachment"
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Maximize2 className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
              </span>
            </button>
          ))}

          {videoUrl && (
            <button
              type="button"
              onClick={(e) => handleOpenMedia(parsedImages.length, e)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-[11px] font-semibold transition-all hover:scale-105 shadow-2xs"
              title="Click to watch review video"
            >
              <Play className="w-3 h-3 fill-blue-600 text-blue-600" />
              <span>Watch Video</span>
            </button>
          )}
        </div>

        {/* Lightbox Portal */}
        {lightboxOpen && renderLightbox()}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Full Mode (for Product Detail Page Review Cards)
  // -------------------------------------------------------------
  return (
    <div className="space-y-3 my-2.5">
      {/* Images Grid */}
      {parsedImages.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {parsedImages.map((imgUrl, idx) => (
            <button
              type="button"
              key={idx}
              onClick={(e) => handleOpenMedia(idx, e)}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:scale-105 transition-all group bg-slate-100 flex-shrink-0 cursor-pointer"
              title="Click to expand review photo"
            >
              <img
                src={cleanProductImageUrl(imgUrl)}
                alt="Artist review equipment"
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Video Preview Card */}
      {videoUrl && (
        <div className="max-w-md rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-xs relative group">
          <video
            src={cleanProductImageUrl(videoUrl)}
            controls
            playsInline
            preload="metadata"
            className="w-full max-h-60 object-contain bg-black"
          />
          <div className="px-3 py-1.5 bg-slate-900/90 text-slate-300 text-[10px] font-semibold flex items-center justify-between border-t border-slate-800">
            <span className="flex items-center gap-1.5 text-blue-400">
              <VideoIcon className="w-3.5 h-3.5 text-blue-400" /> Verified Video Review
            </span>
            <button
              type="button"
              onClick={(e) => handleOpenMedia(parsedImages.length, e)}
              className="text-white hover:text-blue-300 flex items-center gap-1 text-[10px] font-semibold transition-colors"
            >
              <Maximize2 className="w-3 h-3" /> Fullscreen Theater
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Portal */}
      {lightboxOpen && renderLightbox()}
    </div>
  );

  function renderLightbox() {
    return createPortal(
      <div
        className="fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between select-none animate-fadeIn font-sans"
        onClick={() => setLightboxOpen(false)}
      >
        {/* Top Header Bar */}
        <div
          className="flex items-center justify-between px-4 sm:px-8 py-3.5 bg-slate-900/90 border-b border-slate-800/90 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <span className="text-white font-heading font-semibold text-xs sm:text-sm truncate">
              {reviewerName}'s Equipment Review Media
            </span>
            <span className="bg-slate-800 text-blue-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-700 flex-shrink-0 font-heading">
              {activeIndex + 1} / {mediaItems.length}
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/50">
              {currentItem?.type === 'video' ? 'Video Clip' : 'Photo'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {currentItem?.type === 'image' && (
              <>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.max(1, z - 0.5))}
                  disabled={zoomScale <= 1}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 disabled:opacity-30 text-white transition-all shadow-xs"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(1)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold font-mono transition-all shadow-xs"
                  title="Reset Zoom"
                >
                  {Math.round(zoomScale * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.min(3, z + 0.5))}
                  disabled={zoomScale >= 3}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 disabled:opacity-30 text-white transition-all shadow-xs"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-rose-600 text-white transition-all ml-2 shadow-xs cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Stage Media Display */}
        <div
          className="flex-1 relative flex items-center justify-center overflow-hidden p-4 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Previous Arrow */}
          {mediaItems.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-xl flex items-center justify-center z-20 transition-all hover:scale-105 cursor-pointer"
              title="Previous Media (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Current Media Render */}
          {currentItem?.type === 'video' ? (
            <div className="w-full max-w-4xl max-h-[75vh] flex items-center justify-center">
              <video
                src={currentItem.url}
                controls
                autoPlay
                playsInline
                className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl bg-black border border-slate-800"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
              <img
                src={currentItem?.url}
                alt="Review attachment enlarged"
                style={{
                  transform: `scale(${zoomScale})`,
                  transition: 'transform 0.2s ease-out'
                }}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />
            </div>
          )}

          {/* Next Arrow */}
          {mediaItems.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-xl flex items-center justify-center z-20 transition-all hover:scale-105 cursor-pointer"
              title="Next Media (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        {mediaItems.length > 1 && (
          <div
            className="px-4 sm:px-8 py-3 bg-slate-900/90 border-t border-slate-800/90 flex items-center justify-center gap-2 overflow-x-auto z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {mediaItems.map((item, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => { setZoomScale(1); setActiveIndex(idx); }}
                className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-slate-950 ${
                  activeIndex === idx ? 'border-blue-500 scale-105 shadow-md' : 'border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-blue-400">
                    <Play className="w-4 h-4 fill-blue-400" />
                  </div>
                ) : (
                  <img src={item.url} alt="thumbnail" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>,
      document.body
    );
  }
};
