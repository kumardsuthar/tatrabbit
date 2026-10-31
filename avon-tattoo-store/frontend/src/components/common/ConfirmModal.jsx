import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, AlertTriangle, CheckCircle2, Zap, X, Loader2 } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  details = null,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'primary', // 'primary' | 'danger' | 'warning' | 'success'
  isLoading = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const iconMap = {
    primary: <Zap className="w-6 h-6 text-blue-600" />,
    danger: <AlertCircle className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />
  };

  const bgIconMap = {
    primary: 'bg-blue-50 text-blue-600 border-blue-100',
    danger: 'bg-rose-50 text-rose-600 border-rose-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };

  const buttonStyleMap = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 font-sans animate-in fade-in duration-150">
      {/* Translucent Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
        onClick={!isLoading ? onClose : undefined} 
      />

      {/* Modal Dialog */}
      <div
        className="bg-white border border-slate-100 rounded-[2rem] shadow-2xl max-w-md w-full p-6 space-y-4 relative z-[100001] transform transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 ${bgIconMap[type] || bgIconMap.primary}`}>
              {iconMap[type] || iconMap.primary}
            </div>
            <div>
              <h3 className="text-base font-heading font-semibold text-slate-900 leading-snug">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{message}</p>
            </div>
          </div>
          {!isLoading && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Custom Details Block */}
        {details && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs text-slate-700 space-y-2">
            {details}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-5 py-2.5 text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 ${buttonStyleMap[type] || buttonStyleMap.primary}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
