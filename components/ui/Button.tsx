import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  // 3D Button Styles (Pushable)
  const baseStyles = "relative inline-flex items-center justify-center font-extrabold rounded-2xl transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-1 active:border-b-0";
  
  const variants = {
    primary: "bg-violet-500 text-white border-b-4 border-violet-700 hover:bg-violet-400 hover:border-violet-600",
    secondary: "bg-sky-400 text-white border-b-4 border-sky-600 hover:bg-sky-300 hover:border-sky-500",
    success: "bg-green-500 text-white border-b-4 border-green-700 hover:bg-green-400 hover:border-green-600",
    warning: "bg-yellow-400 text-yellow-900 border-b-4 border-yellow-600 hover:bg-yellow-300 hover:border-yellow-500",
    danger: "bg-rose-500 text-white border-b-4 border-rose-700 hover:bg-rose-400 hover:border-rose-600",
    outline: "bg-white text-slate-600 border-2 border-slate-200 border-b-4 hover:bg-slate-50 hover:border-slate-300",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-none active:translate-y-0",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs border-b-2",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    xl: "px-10 py-5 text-xl",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};