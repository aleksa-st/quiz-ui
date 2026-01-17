import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelSuffix?: React.ReactNode;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, labelSuffix, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {(label || labelSuffix) && (
        <div className="flex justify-between items-end mb-2 ml-1">
          {label && (
            <label className="block text-sm font-extrabold text-slate-600 uppercase tracking-wider">
              {label}
            </label>
          )}
          {labelSuffix}
        </div>
      )}
      <input
        className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all duration-200 text-lg font-bold text-slate-700
          ${error
            ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300 focus:ring-4 focus:ring-red-100'
            : 'border-slate-200 hover:border-violet-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100'
          } ${className}`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-500 font-bold ml-1 flex items-center gap-1 animate-pulse">
        ● {error}
      </p>}
    </div>
  );
};