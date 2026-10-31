import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Video as VideoIcon, UploadCloud, X, Film, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { cleanProductImageUrl } from '../../utils/imageUrl';

export const ReviewMediaUpload = ({
  images = [],
  setImages,
  videoUrl = '',
  setVideoUrl,
  maxImages = 5
}) => {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Handle Photo File Selection & Immediate Upload
  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setUploadError(`You can attach a maximum of ${maxImages} photos per review.`);
      return;
    }

    setUploadError('');
    setUploadingImage(true);

    try {
      const newUrls = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          setUploadError('Only image files (JPG, PNG, WEBP) are allowed in photos section.');
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);

        const res = await api.post('/reviews/upload.php', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data?.url) {
          newUrls.push(res.data.url);
        }
      }

      if (newUrls.length > 0) {
        setImages([...images, ...newUrls]);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError(err.response?.data?.error || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Handle Video File Selection & Immediate Upload
  const handleVideoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Only video files (MP4, WEBM, MOV) are allowed in video section.');
      return;
    }

    if (file.size > 60 * 1024 * 1024) {
      setUploadError('Video file exceeds maximum size limit of 60MB.');
      return;
    }

    setUploadError('');
    setUploadingVideo(true);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const res = await api.post('/reviews/upload.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.url) {
        setVideoUrl(res.data.url);
      }
    } catch (err) {
      console.error('Video upload failed:', err);
      setUploadError(err.response?.data?.error || 'Failed to upload video clip. Please check file format.');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveVideo = () => {
    setVideoUrl('');
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Error Alert if any */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. PHOTO ATTACHMENTS SECTION */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            Add Photos <span className="text-[10px] text-slate-400 normal-case font-normal">(Optional, max {maxImages})</span>
          </label>
          <span className="text-[10px] font-semibold text-slate-400 font-heading">
            {images.length} / {maxImages}
          </span>
        </div>

        {/* Photos Preview Thumbnails */}
        {images.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 pb-1">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs group flex-shrink-0"
              >
                <img
                  src={cleanProductImageUrl(imgUrl)}
                  alt="Review upload preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-xs"
                  title="Remove this photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Photo Upload Trigger Button */}
        {images.length < maxImages && (
          <div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploadingImage}
              onClick={() => imageInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-2xl p-3 text-center transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-xs font-semibold text-blue-600">Uploading photo...</span>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:text-blue-600 group-hover:border-blue-300 transition-colors">
                    <UploadCloud className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                      Upload Equipment / Studio Photos
                    </p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      JPG, PNG, WEBP up to 20MB
                    </p>
                  </div>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. VIDEO ATTACHMENT SECTION */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-purple-600" />
          Add Video Review <span className="text-[10px] text-slate-400 normal-case font-normal">(Optional, 1 clip up to 60MB)</span>
        </label>

        {videoUrl ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-2.5 relative flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center flex-shrink-0 text-purple-300">
                <VideoIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate text-white">Video Attached & Ready</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Uploaded successfully
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveVideo}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-semibold flex-shrink-0"
              title="Remove this video"
            >
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
              onChange={handleVideoSelect}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploadingVideo}
              onClick={() => videoInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 hover:border-purple-400 bg-slate-50 hover:bg-purple-50/30 rounded-2xl p-3 text-center transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
            >
              {uploadingVideo ? (
                <>
                  <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                  <span className="text-xs font-semibold text-purple-600">Uploading video clip (may take a few seconds)...</span>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:text-purple-600 group-hover:border-purple-300 transition-colors">
                    <VideoIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-purple-700">
                      Upload Short Video Demonstration
                    </p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      MP4, WEBM, MOV up to 60MB
                    </p>
                  </div>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
