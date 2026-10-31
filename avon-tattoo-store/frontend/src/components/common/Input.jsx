import React from 'react';

export const Input = ({
  label,
  id,
  type = 'text',
  error,
  placeholder,
  value,
  onChange,
  className = '',
  required = false,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-slate-50 border ${
          error ? 'border-red-500' : 'border-slate-200 focus:border-blue-600'
        } rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600 font-semibold">{error}</p>}
    </div>
  );
};

