import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './Loading';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  icon = null,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ease-in-out transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-medium hover:shadow-strong focus:ring-primary-200',
    secondary: 'bg-white hover:bg-neutral-50 text-neutral-700 shadow-soft border border-neutral-200 hover:border-neutral-300 focus:ring-neutral-200',
    accent: 'bg-accent-600 hover:bg-accent-700 text-white shadow-medium hover:shadow-strong focus:ring-accent-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-medium hover:shadow-strong focus:ring-red-200',
    ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700 focus:ring-neutral-200',
    gradient: 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-medium hover:shadow-strong focus:ring-primary-200'
  };
  
  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };
  
  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isDisabled}
      onClick={onClick}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      {...props}
    >
      {loading && (
        <LoadingSpinner className={`${iconSizes[size]} mr-2 text-current`} />
      )}
      
      {!loading && icon && (
        <span className={`${iconSizes[size]} mr-2 flex-shrink-0`}>
          {icon}
        </span>
      )}
      
      {children}
    </motion.button>
  );
};

export default Button;