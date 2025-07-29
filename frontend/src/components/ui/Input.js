import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const Input = ({ 
  label,
  error,
  success,
  helperText,
  icon,
  className = '',
  required = false,
  ...props 
}) => {
  const [focused, setFocused] = useState(false);
  
  const hasError = !!error;
  const hasSuccess = !!success;
  
  const inputClasses = `
    input-field
    ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}
    ${hasSuccess ? 'border-accent-300 focus:border-accent-500 focus:ring-accent-100' : ''}
    ${icon ? 'pl-12' : ''}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        
        <input
          className={inputClasses}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        
        {(hasError || hasSuccess) && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {hasError && <AlertCircle className="w-5 h-5 text-red-500" />}
            {hasSuccess && <CheckCircle2 className="w-5 h-5 text-accent-500" />}
          </div>
        )}
      </div>
      
      {(error || success || helperText) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm"
        >
          {error && <p className="text-red-600 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>}
          {success && <p className="text-accent-600 flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{success}</span>
          </p>}
          {!error && !success && helperText && (
            <p className="text-neutral-500">{helperText}</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Select = ({ 
  label,
  error,
  success,
  helperText,
  children,
  className = '',
  required = false,
  ...props 
}) => {
  const hasError = !!error;
  const hasSuccess = !!success;
  
  const selectClasses = `
    input-field appearance-none bg-white
    ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}
    ${hasSuccess ? 'border-accent-300 focus:border-accent-500 focus:ring-accent-100' : ''}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select className={selectClasses} {...props}>
          {children}
        </select>
        
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {(error || success || helperText) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm"
        >
          {error && <p className="text-red-600 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>}
          {success && <p className="text-accent-600 flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{success}</span>
          </p>}
          {!error && !success && helperText && (
            <p className="text-neutral-500">{helperText}</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Input;