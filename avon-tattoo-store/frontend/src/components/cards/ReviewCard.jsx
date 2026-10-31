import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { ReviewMediaViewer } from '../common/ReviewMediaViewer';

export const ReviewCard = ({ review }) => {
  const rawName = (review.user_name || review.name || '').trim();
  const isAdmin = !rawName || rawName.toLowerCase() === 'admin';
  const name = isAdmin ? 'Verified Artist' : rawName;
  const initial = (rawName ? rawName.charAt(0) : 'A').toUpperCase();
  const studio = review.studio_name || review.studio || 'Professional Studio';
  const rating = parseInt(review.rating || 5);
  const comment = review.comment || '';
  const date = review.created_at ? new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : (review.date || 'Recent');
  const verified = true;

  return (
    <div className="bg-white border border-slate-200/90 rounded-[1.8rem] p-5 sm:p-6 transition-all space-y-3 flex flex-col justify-between hover:shadow-md hover:border-slate-300/80">
      <div className="space-y-3">
        {/* Top Header: Reviewer Info (Left) & Badge + Date (Right) */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-slate-900 line-clamp-1" title={name}>
                {name}
              </h4>
              {studio && (
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  {studio}
                </p>
              )}
            </div>
          </div>

          {/* Right: Badge on Top, Date Below (No Overlapping) */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {verified && (
              <span className="inline-flex items-center gap-1 text-[9px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold whitespace-nowrap shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span>Verified Artist</span>
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
              {date}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
            />
          ))}
        </div>

        <p className="text-xs text-slate-700 leading-relaxed italic">
          "{comment}"
        </p>

        {/* Attached Photos & Video */}
        <ReviewMediaViewer
          images={review.images}
          video_url={review.video_url}
          compact={true}
          reviewerName={name}
        />
      </div>
    </div>
  );
};

