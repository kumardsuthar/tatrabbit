import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Sparkles, Tag, ArrowRight } from 'lucide-react';

export const OfferSuccessModal = ({
  isOpen,
  onClose,
  couponCode = '',
  discountAmount = 0,
  discountText = '',
  originalPrice = 0,
  finalPrice = 0,
  productTitle = ''
}) => {
  const canvasRef = useRef(null);

  // Sound effect & Confetti cannon on open
  useEffect(() => {
    if (!isOpen) return;

    // 1. Play Google Pay style melodious chime using Web Audio API
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Tone 1: 523.25 Hz (C5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        // Tone 2: 659.25 Hz (E5)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.12);
        gain2.gain.setValueAtTime(0.16, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.5);

        // Tone 3: 1046.50 Hz (C6 - Iconic joyful high note)
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(1046.5, now + 0.25);
        gain3.gain.setValueAtTime(0.22, now + 0.25);
        gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(now + 0.25);
        osc3.stop(now + 1.1);
      }
    } catch (e) {
      // Audio playback silently handled if restricted
    }

    // 2. Realistic Confetti Cannon Explosion
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      '#10B981', '#059669', '#34D399', // Emeralds
      '#2563EB', '#3B82F6', '#60A5FA', // Blues
      '#F59E0B', '#FBBF24', '#FCD34D', // Gold/Yellow
      '#EC4899', '#F43F5E', '#8B5CF6'  // Accent Pink/Purple
    ];

    const particles = [];
    const particleCount = 110;
    const originX = canvas.width / 2;
    const originY = canvas.height / 2 - 40;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 14 + 6;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 4,
        size: Math.random() * 9 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 16,
        alpha: 1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        decay: Math.random() * 0.012 + 0.006,
        gravity: 0.28
      });
    }

    let animationId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      });

      if (alive) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPrice = (val) => {
    if (val === null || val === undefined || val === '') return '0.00';
    const num = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(num) ? '0.00' : num.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 select-none font-sans overflow-hidden">
      {/* 1. Backdrop Blur Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* 2. Confetti Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[1000000]"
      />

      {/* 3. The Central "BOOM" Concentric Ripple Shockwaves (Google Pay signature effect) */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-[1000001]">
        {/* Shockwave Wave 1 */}
        <div className="absolute w-24 h-24 rounded-full bg-emerald-400/30 animate-gpay-ripple-1 pointer-events-none" />
        {/* Shockwave Wave 2 */}
        <div className="absolute w-24 h-24 rounded-full bg-teal-400/25 animate-gpay-ripple-2 pointer-events-none" />
        {/* Shockwave Wave 3 */}
        <div className="absolute w-24 h-24 rounded-full bg-emerald-300/20 animate-gpay-ripple-3 pointer-events-none" />
      </div>

      {/* 4. Pop-in Modal Card with Elastic Bounce */}
      <div className="relative w-full max-w-sm bg-white rounded-[2.2rem] shadow-[0_25px_60px_-15px_rgba(16,185,129,0.35)] border border-emerald-100 overflow-hidden z-[1000002] animate-gpay-bounce text-center p-6 sm:p-7 space-y-5">
        
        {/* Top Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer z-20"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 bg-emerald-400/25 rounded-full blur-3xl pointer-events-none" />

        {/* Big Google Pay Style Animated Checkmark Badge */}
        <div className="relative z-10 pt-2">
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            {/* Spinning decorative sparkle halo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-20 blur-md animate-pulse" />
            
            {/* Main Badge Circle with Pop & Spring */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/35 ring-8 ring-emerald-50 animate-gpay-check-pop">
              <svg
                className="w-10 h-10 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  className="animate-gpay-stroke"
                  strokeDasharray="30"
                  strokeDashoffset="0"
                  d="M20 6L9 17l-5-5"
                />
              </svg>
            </div>

            {/* Orbiting sparkles */}
            <div className="absolute -top-1 -right-1 text-amber-400 animate-spin-slow">
              <Sparkles className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
        </div>

        {/* Offer Tagline & Announcement */}
        <div className="space-y-1 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-3.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
            <span>OFFER UNLOCKED!</span>
          </span>

          <h3 className="font-heading font-black text-2xl sm:text-[1.75rem] text-slate-900 tracking-tight pt-1">
            Coupon Applied!
          </h3>

          <p className="text-xs text-slate-500 font-medium">
            Studio code <strong className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold">{couponCode}</strong> is now applied.
          </p>
        </div>

        {/* Google Pay Style Reward / Savings Badge */}
        <div className="relative z-10 bg-gradient-to-br from-emerald-500/10 via-emerald-50/70 to-teal-500/10 border-2 border-emerald-200/80 rounded-2xl p-4 sm:p-5 text-center space-y-2 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            YOU SAVED INSTANTLY
          </span>

          <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-heading tracking-tight drop-shadow-xs">
            ₹{formatPrice(discountAmount)}
          </div>

          <p className="text-xs font-bold text-emerald-800">
            {discountText || `${couponCode} Applied`}
          </p>

          {/* Pricing Comparison Row */}
          {(originalPrice > 0 || finalPrice > 0) && (
            <div className="pt-2.5 mt-1 border-t border-emerald-200/70 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400 line-through">
                ₹{formatPrice(originalPrice)}
              </span>
              <span className="text-emerald-700 font-bold flex items-center gap-1 text-sm font-heading">
                <span>Final:</span>
                <span className="text-slate-900 text-base font-black">
                  ₹{formatPrice(finalPrice)}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-1 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-heading font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Done, Continue!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' && document.body
    ? createPortal(modalContent, document.body)
    : modalContent;
};
