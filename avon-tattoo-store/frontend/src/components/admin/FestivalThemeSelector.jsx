import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

export const FestivalThemeSelector = () => {
  const { themeKey, festivalThemes, updateTheme, loading: themeLoading } = useTheme();
  const [updatingKey, setUpdatingKey] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const handleSelectTheme = async (key) => {
    try {
      setUpdatingKey(key);
      await updateTheme(key);
      setFeedbackMsg(`Successfully activated the ${festivalThemes[key]?.name || key} theme!`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      alert('Failed to update festival theme: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdatingKey(null);
    }
  };

  if (themeLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loading Festival Themes...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-base font-heading font-semibold text-slate-900">Dynamic Festival Theme Manager</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Instantly transform storefront color themes, promotional top-banners, and festive accents across the store.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Current Theme:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold uppercase tracking-wide">
            <span>{festivalThemes[themeKey]?.emoji}</span>
            <span>{festivalThemes[themeKey]?.name || themeKey}</span>
          </span>
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Preset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(festivalThemes).map((key) => {
          const theme = festivalThemes[key];
          const isActive = themeKey === key;
          const isUpdating = updatingKey === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectTheme(key)}
              disabled={isUpdating}
              className={`relative text-left rounded-2xl p-4 border-2 transition-all duration-300 flex flex-col justify-between gap-3 group ${
                isActive
                  ? 'border-blue-600 bg-blue-50/40 shadow-md scale-[1.01]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {isActive && (
                <div className="absolute -top-2.5 right-4 bg-blue-600 text-white font-semibold text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active Theme
                </div>
              )}

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-2 rounded-xl bg-slate-100/80 group-hover:scale-105 transition-transform">
                    {theme.emoji}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white shadow-2xs text-slate-600">
                    {theme.badgeText}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    {theme.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">{theme.subtitle}</p>
                </div>

                {/* Banner Preview Strip */}
                {theme.bannerText ? (
                  <div className={`p-2 rounded-xl text-[10px] font-semibold tracking-tight line-clamp-2 ${theme.bannerBg}`}>
                    {theme.bannerText}
                  </div>
                ) : (
                  <div className="p-2 rounded-xl text-[10px] font-medium text-slate-400 bg-slate-100 border border-dashed border-slate-200">
                    Standard banner disabled (Year-round clean layout)
                  </div>
                )}
              </div>

              {/* Color Swatches & Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full ${theme.primaryColor}`} title="Primary Accent" />
                  <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${theme.accentGradient}`} title="Gradient" />
                </div>

                <span
                  className={`text-xs font-semibold transition-colors flex items-center gap-1 ${
                    isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-900'
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Applying...</span>
                    </>
                  ) : isActive ? (
                    <span>Currently Active</span>
                  ) : (
                    <span>Click to Apply &rarr;</span>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FestivalThemeSelector;
