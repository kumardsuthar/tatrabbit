import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, ChevronRight } from 'lucide-react';

export const CustomSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select option...', 
  label = '', 
  className = '',
  size = 'md', // 'sm', 'md', 'lg'
  maxVisible,
  onMoreClick,
  moreLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => 
    typeof opt === 'object' ? opt.value === value : opt === value
  );

  const getOptionLabel = (opt) => {
    if (!opt && opt !== 0) return placeholder;
    if (typeof opt === 'object') return opt.label || opt.name || opt.value;
    return opt;
  };

  const getOptionValue = (opt) => {
    if (typeof opt === 'object') return opt.value !== undefined ? opt.value : opt.id;
    return opt;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-[11px] rounded-xl',
    md: 'px-3.5 py-2.5 text-xs rounded-xl',
    lg: 'px-4 py-3 text-sm rounded-2xl'
  };

  const effectiveMaxVisible = maxVisible ?? (onMoreClick ? 2 : undefined);
  const hasMore = effectiveMaxVisible && options.length > effectiveMaxVisible;
  const displayedOptions = hasMore ? options.slice(0, effectiveMaxVisible) : options;

  return (
    <div className={`relative w-full text-left font-sans ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs ${sizeClasses[size]} ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-500 bg-white' : ''}`}
      >
        <span className="truncate">
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1.5 space-y-0.5 animate-fadeIn">
          {displayedOptions.map((option, idx) => {
            const optVal = getOptionValue(option);
            const optLabel = getOptionLabel(option);
            const isSelected = selectedOption ? getOptionValue(selectedOption) === optVal : false;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(optVal, option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="truncate">{optLabel}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
              </button>
            );
          })}

          {hasMore && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                if (onMoreClick) {
                  onMoreClick();
                }
              }}
              className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all flex items-center justify-between border-t border-slate-100 mt-1 cursor-pointer group/more"
            >
              <span className="truncate flex items-center gap-1 font-semibold">
                {moreLabel || `+${options.length - effectiveMaxVisible} More Options...`}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-blue-600 group-hover/more:translate-x-0.5 transition-transform flex-shrink-0" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
